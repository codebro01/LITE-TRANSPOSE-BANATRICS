import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  HttpStatus,
  Req,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { UpdateBusinessOwnerProfileDto } from '@src/users/dto/update-business-profile.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';

import omit from 'lodash.omit';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import { ForgotPasswordDto } from '@src/users/dto/forgot-password.dto';
import { ResetPasswordDto } from '@src/users/dto/reset-password.dto';
import { InitializeBusinessOwnerCreationDto } from '@src/users/dto/initialize-business-owner-creation.dto';
import { createBusinessOwnerDto } from '@src/users/dto/create-business-owner.dto';
import { InitializeDriverCreationDto } from '@src/users/dto/initialize-driver-creation.dto';
import { CreateDriverDto } from '@src/users/dto/create-driver.dto';
import { EarningService } from '@src/earning/earning.service';
import { UpdateDriverDpDto } from '@src/users/dto/update-driver-dp.dto';
import { addBusinessOwnerRoleDto } from '@src/users/dto/add-business-owner-role.dto';
import { AddDriverRoleDto } from '@src/users/dto/add-driver-role.dto';
import { UpdateDriverProfileDto } from '@src/users/dto/update-driver-profile.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly earningService: EarningService,
  ) {}

  // ! initialize business owner  creation
  @Post('signup/business-owner/initialize')
  @ApiOperation({
    summary: 'Initialize the creation of a new user',
    description: 'Register new user using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  async initializeBusinessOwnerCreation(
    @Body() body: InitializeBusinessOwnerCreationDto,
    @Res() res: Response,
  ) {
    const result = await this.userService.initializeBusinessOwnerCreation(body);

    res.status(HttpStatus.ACCEPTED).json({ message: result });
  }
  // ! finalize business owner creation
  @Post('signup/business-owner/finalize')
  @ApiOperation({
    summary: 'Finalize the creation of a new user',
    description: 'Register new user using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  async finalizeBusinessOwnerCreation(
    @Body() body: createBusinessOwnerDto,
    @Res() res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.userService.finalizeBusinessOwnerCreation(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1h
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    });

    const safeUser = omit(user, [
      'password',
      'refreshToken',
      'emailVerificationCode',
    ]);

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser });
  }
  // ! initialize driver creation
  @Post('signup/driver/initialize')
  @ApiOperation({
    summary: 'Initialize the creation of a new driver',
    description: 'Register new driver using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  async initializeDriverCreation(
    @Body() body: InitializeDriverCreationDto,
    @Res() res: Response,
  ) {
    const result = await this.userService.initializeDriverCreation(body);

    res.status(HttpStatus.ACCEPTED).json({ message: result });
  }
  // ! finalize driver creation
  @Post('signup/driver/finalize')
  @ApiOperation({
    summary: 'Finalize the creation of a new driver',
    description: 'Register new driver using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  @HttpCode(HttpStatus.CREATED)
  async finalizeDriverCreation(
    @Body() body: CreateDriverDto,
  ) {
     await this.userService.finalizeDriverCreation(body);

    // res.cookie('access_token', accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   maxAge: 1000 * 60 * 60, // 1h
    // });

    // res.cookie('refresh_token', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    // });

    // const safeUser = omit(savedUser, [
    //   'password',
    //   'refreshToken',
    //   'emailVerificationCode',
    // ]);

    return {
      success: true,
      message: 'Driver account created, Please wait for approval.',
    };
  }

  // ! get driver profile

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('driver/profile')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Driver profile info',
    description: 'Retrieves profile of driver',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all users' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  getDriverProfile(@Req() req: Request) {
    const { id: userId } = req.user;
    return this.userService.getDriverProfile(userId);
  }
  // ! get businessOnwer profile

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('business-owner/profile')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'businessOwner profile info',
    description: 'Retrieves profile of businessOwner',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all users' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  getBusinessOwnerProfile(@Req() req: Request) {
    const { id: userId } = req.user;
    return this.userService.getBusinessOwnerProfile(userId);
  }

  //! get all users in db
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('get-all-users')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieves a list of all users in the database. Requires admin role.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all users' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ! update user basic information
  @UseGuards(JwtAuthGuard)
  @Patch('business/update-profile')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update business owner profile',
    description:
      'Updates basic information for the authenticated business owner',
  })
  @ApiBody({ type: UpdateBusinessOwnerProfileDto })
  @ApiResponse({
    status: 200,
    description: 'User information successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async updateBusinessOwnerProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateBusinessOwnerProfileDto,
  ) {
    const { id: userId } = req.user;
    const result = await this.userService.updateBusinessOwnerById(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Patch('driver/update-profile')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update driver profile',
    description: 'Updates basic information for the authenticated driver',
  })
  @ApiBody({ type: UpdateDriverProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Driver information successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async updateDriverProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateDriverProfileDto,
  ) {
    const { id: userId } = req.user;
    const result = await this.userService.updateDriverById(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'driver', 'businessOwner')
  @Patch('update/password')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update user password',
    description:
      'Updates the password for the authenticated user. Available to admin, driver, and business owner roles.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid password format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async updatePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatePasswordDto,
  ) {
    const { id: userId } = req.user;

    console.log('got in here');
    const result = await this.userService.updatePassword(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }

  @Post('password/forgot')
  @ApiOperation({
    summary: 'Request password reset',
    description: "Sends a password reset code to the user's email address",
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset code sent successfully',
    schema: {
      example: {
        message: 'Password reset code sent to your email',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
  })
  async forgotPassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ForgotPasswordDto,
  ) {
    const result = await this.userService.forgotPassword(body);
    res.status(HttpStatus.OK).json({
      message: result,
    });
  }

  @Post('password/token-verify')
  @ApiOperation({
    summary: 'Verify password reset code',
    description: "Validates the password reset code sent to user's email",
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Reset code verified successfully',
    schema: {
      example: {
        message: 'success',
        data: {
          resetToken: 'ey.fjkjjdfkjdkjkl23049820948dkfjlkdjlfksjlkdjfl',
          expiresAt: '2024-12-03T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset code',
  })
  async verifyPasswordResetCode(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ForgotPasswordDto,
  ) {
    const result = await this.userService.verifyPasswordResetCode(body);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }

  @Patch('password/reset')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password using the reset token',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'success',
        data: {
          email: 'user@example.com',
          passwordUpdated: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid reset token or password requirements not met',
  })
  @ApiResponse({
    status: 401,
    description: 'Reset token expired',
  })
  async resetPassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ResetPasswordDto,
  ) {
    const result = await this.userService.resetPassword(body);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('update/become-a-driver')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Add driver role',
    description:
      'Allows a business owner to also become a driver (multi-role functionality)',
  })
  @ApiResponse({
    status: 200,
    description: 'Driver role added successfully',
    schema: {
      example: {
        message: 'success',
        data: {
          id: '123',
          email: 'user@example.com',
          role: ['businessOwner', 'driver'],
          createdAt: '2024-12-01T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a business owner',
  })
  async addDriverRole(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AddDriverRoleDto,
  ) {
    const { id: userId } = req.user;
    const result = await this.userService.addDriverRole(body, userId);
    const safeUser = omit(result, ['password', 'refreshToken']);

    res.status(HttpStatus.OK).json({
      message: 'success',
      data: safeUser,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Patch('update/become-a-business-owner')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Add business owner role',
    description:
      'Allows a driver to also become a business owner (multi-role functionality)',
  })
  @ApiResponse({
    status: 200,
    description: 'Business owner role added successfully',
    schema: {
      example: {
        message: 'success',
        data: {
          id: '123',
          email: 'driver@example.com',
          role: ['driver', 'businessOwner'],
          createdAt: '2024-12-01T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a driver',
  })
  async addBusinessOwnerRole(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: addBusinessOwnerRoleDto,
  ) {
    const { id: userId } = req.user;
    const result = await this.userService.addBusinessOwnerRole(body, userId);
    const safeUser = omit(result, ['password', 'refreshToken']);

    res.status(HttpStatus.OK).json({
      message: 'success',
      data: safeUser,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Patch('update/driver/dp')
  async updateDriverdp(
    @Body() body: UpdateDriverDpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    const driver = await this.userService.updateDriverDp(body.dp, userId);

    res.status(200).json({ message: 'success', data: driver });
  }
}
