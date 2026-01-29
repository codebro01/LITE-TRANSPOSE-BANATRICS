import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { jwtConstants } from '@src/auth/jwtContants';
import { JwtService } from '@nestjs/jwt';
import { userType } from '@src/auth/dto/login-user.dto';
import { UserApprovalStatusType } from '@src/db';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(data: { email?: string; password: string; phone?: string, userType: userType }) {
    const { email, password, phone, userType: UserType } = data;

    if ((!phone && !email) || !password)
      throw new BadRequestException(
        'Please provide email or phone and password',
      );

    const user = await this.authRepository.findUserByEmailOrPhone(email, phone);
    if (!user)
      throw new UnauthorizedException(
        'Invalid credentials, Please check email and password',
      );

        if (!user.role.includes(UserType))
          throw new BadRequestException('Invalid credentials');



    if(UserType === userType.DRIVER) {
      const driver = await this.authRepository.findDriverStatusById(user.id);

      if(!driver) throw new NotFoundException('User not found')

      if(driver.approvedStatus === UserApprovalStatusType.PENDING ) {
          throw new UnauthorizedException('User activation is pending!!!');
      }


      if(driver.activeStatus === UserApprovalStatusType.SUSPENDED) {

                  throw new UnauthorizedException(
                    'User suspended!!!',
                  );
      }
    }

    if(UserType === userType.BUSINESSOWNER) {
      const businessOwner = await this.authRepository.findBusinessOwnerStatusById(user.id);

            if (!businessOwner) throw new NotFoundException('User not found');


      if (businessOwner.status === UserApprovalStatusType.SUSPENDED) {
        throw new UnauthorizedException('User suspended!!!');
      }
    }



    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect)
      throw new UnauthorizedException(
        'Invalid credentials, Please check email and password',
      );


    const payload = { id: user.id, email: user.email, role: [UserType] };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '30d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

   const updateUserToken = await this.authRepository.updateUserToken(
     hashedRefreshToken,
     user.id,
   );

    if (!updateUserToken) throw new InternalServerErrorException();
    return { user, accessToken, refreshToken };
  }

  async logoutUser(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if(!user) throw new BadRequestException('Invalid user');

    const nullifyRefreshToken = await this.authRepository.updateUserToken(null, userId);

    if(!nullifyRefreshToken) throw new InternalServerErrorException('Can not logout user!');

    return true
  }

  generateRandomPassword(length = 12): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
