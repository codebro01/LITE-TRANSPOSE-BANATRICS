import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { userSelectType } from '@src/db/users';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from '@src/auth/jwtContants';
import { createBusinessOwnerDto } from '@src/users/dto/create-business-owner.dto';
import { UpdateBusinessOwnerProfileDto } from '@src/users/dto/update-business-profile.dto';
import { UpdatePasswordDto } from '@src/users/dto/updatePasswordDto';
import { UserRepository } from '@src/users/repository/user.repository';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
import { ForgotPasswordDto } from '@src/users/dto/forgot-password.dto';
import { PasswordResetRepository } from '@src/password-reset/repository/password-reset.repository';
import { ResetPasswordDto } from '@src/users/dto/reset-password.dto';
import { EmailVerificationRepository } from '@src/email-verification/repository/email-verification.repository';
import { InitializeBusinessOwnerCreationDto } from '@src/users/dto/initialize-business-owner-creation.dto';
import { CreateDriverDto } from '@src/users/dto/create-driver.dto';
import { InitializeDriverCreationDto } from '@src/users/dto/initialize-driver-creation.dto';
import { AddDriverRoleDto } from '@src/users/dto/add-driver-role.dto';
import { addBusinessOwnerRoleDto } from '@src/users/dto/add-business-owner-role.dto';
import { UpdateDriverProfileDto } from '@src/users/dto/update-driver-profile.dto';
@Injectable()
export class UserService {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private jwtService: JwtService,
    private passwordResetRepository: PasswordResetRepository,
    private emailVerificationRepository: EmailVerificationRepository,
  ) {
    this.DbProvider = DbProvider;
  }

  // ! create user here

  async initializeBusinessOwnerCreation(
    data: InitializeBusinessOwnerCreationDto,
  ): Promise<any> {
    try {
      const { email, phone, businessName } = data;

      if (!email || !phone)
        throw new BadRequestException(
          'Please email, password, phone and business name is required',
        );

      //! check if email or phone provided has been used

      const existingUser = await this.userRepository.findByEmailOrPhone({
        email,
        phone,
      });

      if (existingUser) {
        // Check which one matched
        if (existingUser.email === email && existingUser.phone === phone) {
          throw new Error('Email and phone number already in use');
        } else if (existingUser.email === email) {
          // if (existingUser.role.includes(role))
          throw new ConflictException('Email is already in use');
        } else {
          throw new ConflictException('Phone number is already in use');
        }
      }

      const emailVerificationRecord =
        await this.emailVerificationRepository.findUserByEmail({ email });

      const { generateRandomSixDigitCode, hashRandomSixDigitCode } =
        await this.sixDigitCodeGenerator();

      if (emailVerificationRecord && emailVerificationRecord.used === false) {
        await this.emailVerificationRepository.updateEmailVerification(
          {
            emailVerificationCode: hashRandomSixDigitCode,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
          email,
        );
      } else {
        await this.emailVerificationRepository.createEmailVerificationData({
          email: email,
          emailVerificationCode: hashRandomSixDigitCode,
          used: false,
          phone,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        });
      }

      await this.emailService.queueTemplatedEmail(
        EmailTemplateType.EMAIL_VERIFICATION,
        email,
        {
          verificationCode: generateRandomSixDigitCode,
          name: businessName,
        },
      );

      return `A one time password has been sent to your registered email`;
    } catch (dbError) {
      console.error('DB Insert Error:', dbError);

      throw dbError;
    }
  }

  async finalizeBusinessOwnerCreation(data: createBusinessOwnerDto) {
    const { email, emailVerificationCode, password, businessName } = data;

    // ! -------------- verify code before saveing data into the db---------------
    if (!emailVerificationCode)
      throw new Error(
        'Code sent to your email must  be provided in order to proceed',
      );

    const user = await this.emailVerificationRepository.findUserByEmail({
      email,
    });

    if (!user) throw new NotFoundException(`Invalid Verification Code`);
    if (!user.emailVerificationCode)
      throw new Error('Not valid verication code');

    if (user.used) {
      throw new BadRequestException('This code has already been used');
    }

    if (user.attempts === 3) {
      const { hashRandomSixDigitCode } = await this.sixDigitCodeGenerator();

      await this.emailVerificationRepository.updateEmailVerification(
        { emailVerificationCode: hashRandomSixDigitCode },
        email,
      );
      throw new BadRequestException(
        'Attempts reached, if more failed attempts comes up, account will be suspended!!!',
      );
    }

    if (new Date() > user.expiresAt) {
      throw new BadRequestException(
        'Code has expired, please request a new one',
      );
    }

    console.log(emailVerificationCode, user.emailVerificationCode);

    const verifyHashedCode = await bcrypt.compare(
      emailVerificationCode,
      user.emailVerificationCode,
    );
    await this.emailVerificationRepository.updateEmailVerification(
      { attempts: user.attempts + 1 },
      email,
    );

    console.log(verifyHashedCode);

    if (!verifyHashedCode)
      throw new BadRequestException('Invalid code inserted, please try again');

    await this.emailVerificationRepository.updateEmailVerification(
      { used: true },
      email,
    );

    // ! now save user to the db

    // ! ----------------------Create user for business owners--------------------

    //! create user here if email has not been used
    const hashedPwd = await bcrypt.hash(password, 10);

    const result = await this.DbProvider.transaction(async (trx) => {
      // First insert - user
      const savedUser = await this.userRepository.createUser(
        {
          email: user.email,
          phone: user.phone,
          password: hashedPwd,
          role: ['businessOwner'],
          emailVerified: true,
        },
        trx,
      );

      if (!savedUser || !savedUser.id) {
        throw new InternalServerErrorException(
          'Could not create user, please try again',
        );
      }

      // Second insert - business owner profile
      const addUserProfile =
        await this.userRepository.addBusinessOwnerToBusinessOwnerTable(
          {
            businessName: businessName,
            userId: savedUser.id,
          },
          trx,
        );

      if (!addUserProfile) {
        throw new InternalServerErrorException(
          'Could not create user profile, please try again',
        );
      }

      return { savedUser, addUserProfile };
    });

    const { savedUser } = result;
    const payload = {
      id: savedUser.id,
      email: savedUser.email,
      role: ['businessOwner'],
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '30d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const updateUserToken = await this.userRepository.updateUserToken(
      hashedRefreshToken,
      savedUser.id,
    );

    if (!updateUserToken) throw new InternalServerErrorException();

    return { user, accessToken, refreshToken };
  }
  async initializeDriverCreation(
    data: InitializeDriverCreationDto,
  ): Promise<any> {
    try {
      const { email, phone, fullName, nin } = data;

      if (!email || !phone)
        throw new BadRequestException(
          'Please email, password, phone and business name is required',
        );

      //! check if email or phone provided has been used

      const existingUser = await this.userRepository.findByEmailOrPhone({
        email,
        phone,
      });

      if (existingUser) {
        // Check which one matched
        if (existingUser.email === email && existingUser.phone === phone) {
          throw new Error('Email and phone number already in use');
        } else if (existingUser.email === email) {
          // if (existingUser.role.includes(role))
          throw new ConflictException('Email is already in use');
        } else {
          throw new ConflictException('Phone number is already in use');
        }
      }

      const emailVerificationRecord =
        await this.emailVerificationRepository.findUserByEmail({ email });

      const { generateRandomSixDigitCode, hashRandomSixDigitCode } =
        await this.sixDigitCodeGenerator();

      if (emailVerificationRecord)
        

      if ((emailVerificationRecord && emailVerificationRecord.used) === false) {
        const saveCodeRecord =
          await this.emailVerificationRepository.updateEmailVerification(
            {
              emailVerificationCode: hashRandomSixDigitCode,
              expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
            email,
          );

        console.log('update', saveCodeRecord);
      } else {
        const saveCodeRecord =
          await this.emailVerificationRepository.createEmailVerificationData({
            email: email,
            emailVerificationCode: hashRandomSixDigitCode,
            used: false,
            phone,
            nin,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          });

        console.log('create', saveCodeRecord);
      }

      await this.emailService.queueTemplatedEmail(
        EmailTemplateType.EMAIL_VERIFICATION,
        email,
        {
          verificationCode: generateRandomSixDigitCode,
          name: fullName,
        },
      );

      return `A one time password has been sent to your registered email`;
    } catch (dbError) {
      console.error('DB Insert Error:', dbError);

      throw dbError;
    }
  }

  async finalizeDriverCreation(data: CreateDriverDto) {
    const { email, emailVerificationCode, password } = data;

    // ! -------------- verify code before saveing data into the db---------------
    if (!emailVerificationCode)
      throw new Error(
        'Code sent to your email must  be provided in order to proceed',
      );

    const user = await this.emailVerificationRepository.findUserByEmail({
      email,
    });

    console.log('user', user);
    if (!user)
      throw new NotFoundException(
        `An error has occured while trying to verify the code, please try again`,
      );
    if (!user.emailVerificationCode)
      throw new Error('Code not initially  saved, ');

    if (user.used) {
      throw new BadRequestException('This code has already been used');
    }

    if (user.attempts === 3) {
      const { hashRandomSixDigitCode } = await this.sixDigitCodeGenerator();

      await this.emailVerificationRepository.updateEmailVerification(
        { emailVerificationCode: hashRandomSixDigitCode },
        email,
      );
      throw new BadRequestException(
        'Attempts reached, if more failed attempts comes up, account will be suspended!!!',
      );
    }

    if (new Date() > user.expiresAt) {
      throw new BadRequestException(
        'Code has expired, please request a new one',
      );
    }

    console.log(emailVerificationCode, user.emailVerificationCode);

    const verifyHashedCode = await bcrypt.compare(
      emailVerificationCode,
      user.emailVerificationCode,
    );
    await this.emailVerificationRepository.updateEmailVerification(
      { attempts: user.attempts + 1 },
      email,
    );

    if (!verifyHashedCode)
      throw new BadRequestException('Invalid code inserted, please try again');

    await this.emailVerificationRepository.updateEmailVerification(
      { used: true },
      email,
    );

    // ! now save user to the db

    // ! ---------------Create user for drivers----------------------

    //! create user here if email has not been used
    const hashedPwd = await bcrypt.hash(password, 10);

    const result = await this.DbProvider.transaction(async (trx) => {
      // First insert - user
      const savedUser = await this.userRepository.createUser(
        {
          email: user.email,
          phone: user.phone,
          password: hashedPwd,
          role: ['driver'],
          emailVerified: true,
        },
        trx,
      );

      if (!savedUser || !savedUser.id) {
        throw new InternalServerErrorException(
          'Could not create user, please try again',
        );
      }
      if (!user.nin) throw new BadRequestException('could not get nin');
      // Second insert - business owner profile
      const addUserProfile = await this.userRepository.addDriverToDriverTable(
        { ...data, nin: user.nin },
        savedUser.id,
        trx,
      );

      if (!addUserProfile) {
        throw new InternalServerErrorException(
          'Could not create user profile, please try again',
        );
      }

      return { savedUser, addUserProfile };
    });

    // Access the results
    const { savedUser } = result;
    const payload = {
      id: savedUser.id,
      email: savedUser.email,
      role: ['driver'],
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '30d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const updateUserToken = await this.userRepository.updateUserToken(
      hashedRefreshToken,
      savedUser.id,
    );

    if (!updateUserToken) throw new InternalServerErrorException();
    return { savedUser, accessToken, refreshToken };

    // ! Create admin user, this will never ever be made public
    // if (role && role === UserRole.ADMIN) {
    //   //! create user here if email has not been used
    //   const hashedPwd = await bcrypt.hash(password, 10);

    //   const result = await this.DbProvider.transaction(async (trx) => {
    //     // First insert - user
    //     const user = await this.userRepository.createUser(
    //       {
    //         email: data.email,
    //         phone: data.phone,
    //         password: hashedPwd,
    //         role: ['driver'],
    //         emailVerified: true,
    //       },
    //       trx,
    //     );

    //     if (!user || !user.id) {
    //       throw new InternalServerErrorException(
    //         'Could not create user, please try again',
    //       );
    //     }

    //     return { user };
    //   });

    //   // Access the results
    //   const { user } = result;
    //   const payload = {
    //     id: user.id,
    //     email: user.email,
    //     role: user.role,
    //   };

    //   const accessToken = await this.jwtService.signAsync(payload, {
    //     secret: jwtConstants.accessTokenSecret,
    //     expiresIn: '1h',
    //   });
    //   const refreshToken = await this.jwtService.signAsync(payload, {
    //     secret: jwtConstants.refreshTokenSecret,
    //     expiresIn: '30d',
    //   });

    //   const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    //   const updateUserToken = await this.userRepository.updateUserToken(
    //     hashedRefreshToken,
    //     user.id,
    //   );

    //   if (!updateUserToken) throw new InternalServerErrorException();
    //   return { user, accessToken, refreshToken };
    // }
  }

  async getAllUsers(): Promise<
    Omit<userSelectType, 'password' | 'refreshToken' | 'passwordResetCode'>[]
  > {
    const users = await this.userRepository.getAllUsers();

    return users;
  }

  async getUser(userId: string) {
    const user = await this.userRepository.getUser(userId);

    return user;
  }

  // async updateUserInSettings(data: UpdateBusinessOwnerProfileDto, userId: string) {
  //   // if (data.email) {
  //   //   const emailExist = await this.userRepository.findByEmailOrPhone({
  //   //     email: data.email,
  //   //   });
  //   //   console.log(emailExist);
  //   //   if (emailExist)
  //   //     throw new ConflictException(
  //   //       `User with email ${data.email} already exist, please select another email`,
  //   //     );

  //   //   // reset email verification
  //   //   await this.userRepository.updateByUserId(
  //   //     { ...data, emailVerified: false },
  //   //     userId,
  //   //   );
  //   // }

  //   const [updateUserTableFields, updateBusinessOwnerTableFields] =
  //     await Promise.all([
  //       this.userRepository.updateByUserId(data, userId),
  //       this.userRepository.updateBusinessOwnerById(data, userId),
  //     ]);

  //   return {
  //     ...updateBusinessOwnerTableFields,
  //     ...updateUserTableFields,
  //   };
  // }
  // ! this update password is for updating the password from settings
  async updatePassword(data: UpdatePasswordDto, userId: string) {
    const { oldPassword, newPassword, repeatNewPassword } = data;

    console.log(data);

    if (newPassword !== repeatNewPassword)
      throw new BadRequestException(
        'The new password and the repeat new password, does not match, check carefully!',
      );
    const storedPassword = await this.userRepository.getStoredPassword(userId);
    console.log(storedPassword);

    const decodedPassword = await bcrypt.compare(
      oldPassword,
      storedPassword.password,
    );
    console.log(decodedPassword);
    if (!decodedPassword)
      throw new BadRequestException('You have inserted a wrong old password!');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateByUserId(
      { password: hashedNewPassword },
      userId,
    );

    return {
      message: 'Password changed succesfully',
    };
  }

  // ! This forgot password is for handing password reset from the login page

  async forgotPassword(data: ForgotPasswordDto) {
    const { email } = data;
    const user = await this.userRepository.findByEmailOrPhone({ email });

    if (!user)
      return { message: `Check ${data.email} for your verification code` };

    const { hashRandomSixDigitCode, generateRandomSixDigitCode } =
      await this.sixDigitCodeGenerator();

    const passwordResetRecord =
      await this.passwordResetRepository.findUserByEmail({ email });

    if (passwordResetRecord) {
      const updatePasswordResetRecord =
        await this.passwordResetRepository.updatePasswordReset(
          {
            createdAt: new Date(),
            attempts: 0,
            used: false,
            passwordResetCode: hashRandomSixDigitCode,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // the code expires in 15 minutes
          },
          email,
        );

      if (!updatePasswordResetRecord)
        throw new InternalServerErrorException(
          'An error occured, please try again',
        );
    } else {
      const savePasswordResetCode =
        await this.passwordResetRepository.createPasswordResetData({
          email: data.email,
          passwordResetCode: hashRandomSixDigitCode,
          userId: user.id || null,
          used: false,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // the code expires in 15 minutes
        });

      if (!savePasswordResetCode)
        throw new InternalServerErrorException(
          'An error occured, please try again',
        );
    }

    await this.emailService.queueTemplatedEmail(
      EmailTemplateType.PASSWORD_RESET,
      user.email,
      {
        resetCode: generateRandomSixDigitCode,
      },
    );

    return `Check ${data.email} for your verification code`;
  }

  async verifyPasswordResetCode(data: ForgotPasswordDto) {
    const { email, passwordResetCode } = data;

    if (!passwordResetCode)
      throw new Error(
        'Code sent to your email must  be provided in order to proceed',
      );

    const user = await this.passwordResetRepository.findUserByEmail({ email });

    if (!user)
      throw new NotFoundException(
        `An error has occured while trying to verify the code, please try again`,
      );
    if (!user.passwordResetCode) throw new Error('Code not initially  saved, ');

    if (user.used) {
      throw new BadRequestException('This code has already been used');
    }

    if (user.attempts === 3) {
      const { hashRandomSixDigitCode } = await this.sixDigitCodeGenerator();

      await this.passwordResetRepository.updatePasswordReset(
        { passwordResetCode: hashRandomSixDigitCode },
        email,
      );
      throw new BadRequestException(
        'Attempts reached, if more failed attempts comes up, account will be suspended!!!',
      );
    }

    if (new Date() > user.expiresAt) {
      throw new BadRequestException(
        'Code has expired, please request a new one',
      );
    }

    console.log(passwordResetCode, user.passwordResetCode);

    const verifyHashedCode = await bcrypt.compare(
      passwordResetCode,
      user.passwordResetCode,
    );
    await this.passwordResetRepository.updatePasswordReset(
      { attempts: user.attempts + 1 },
      email,
    );

    console.log(verifyHashedCode);

    if (!verifyHashedCode)
      throw new BadRequestException('Invalid code inserted, please try again');

    await this.passwordResetRepository.updatePasswordReset(
      { used: true },
      email,
    );
    const token = this.generateResetToken(email);

    return { message: 'success', token };
  }

  async sixDigitCodeGenerator() {
    crypto.randomUUID().replace(/\D/g, '').slice(0, 6);

    // Or better - directly from random values:
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const generateRandomSixDigitCode = (array[0] % 900000) + 100000;

    const hashRandomSixDigitCode = await bcrypt.hash(
      String(generateRandomSixDigitCode),
      10,
    );

    return { hashRandomSixDigitCode, generateRandomSixDigitCode };
  }

  async resetPassword(data: ResetPasswordDto) {
    const { email, resetToken, newPassword } = data;
    // Verify token
    const decoded = await this.verifyResetToken(resetToken);

    // ✅ Verify the email matches what's in the token
    const resetRecord = await this.passwordResetRepository.findUserByEmail({
      email,
    });

    if (!resetRecord || resetRecord.email !== decoded.email) {
      throw new UnauthorizedException('Invalid reset request');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.resetPassword(decoded.email, hashedPassword);

    await this.passwordResetRepository.updatePasswordReset(
      { used: true },
      email,
    );

    return { message: 'Password reset successfully' };
  }

  generateResetToken(email: string): string {
    const payload = {
      email,
      type: 'password_reset',
      iat: Date.now(),
    };

    return this.jwtService.sign(payload, {
      secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
      expiresIn: '15m',
    });
  }

  async verifyResetToken(token: string): Promise<{ email: string }> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
      });

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      return { email: payload.email };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token:', error);
    }
  }

  async addDriverRole(data: AddDriverRoleDto, userId: string) {
    const addRole = await this.userRepository.addDriverRole(data, userId);
    return addRole;
  }
  async addBusinessOwnerRole(data: addBusinessOwnerRoleDto, userId: string) {
    const addRole = await this.userRepository.addBusinessOwnerRole(
      data,
      userId,
    );
    return addRole;
  }

  async updateDriverDp(
    dp: { secure_url: string; public_id: string },
    userId: string,
  ) {
    const isDriverExist = await this.userRepository.findDriverByUserId(userId);
    if (!isDriverExist) throw new BadRequestException('User not provided');
    const user = await this.userRepository.updateDriverDp(dp, userId);
    return user;
  }

  async getDriverProfile(userId: string) {
    return await this.userRepository.getDriverProfile(userId);
  }
  async getBusinessOwnerProfile(userId: string) {
    return await this.userRepository.getBusinessOwnerProfile(userId);
  }
  async updateBusinessOwnerById(
    data: UpdateBusinessOwnerProfileDto,
    userId: string,
  ) {
    return await this.userRepository.updateBusinessOwnerById(data, userId);
  }
  async updateDriverById(data: UpdateDriverProfileDto, userId: string) {
    return await this.userRepository.updateDriverById(data, userId);
  }
}
