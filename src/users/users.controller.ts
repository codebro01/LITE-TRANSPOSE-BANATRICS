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
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { UpdatebusinessOwnerDto } from '@src/users/dto/update-business-owner.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1h
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    });

    const safeUser = omit(user, [
      'password',
      'refreshToken',
      'emailVerificationCode',
    ]);

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser, accessToken });
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
  async finalizeDriverCreation(
    @Body() body: CreateDriverDto,
    @Res() res: Response,
  ) {
    const { savedUser, accessToken, refreshToken } =
      await this.userService.finalizeDriverCreation(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1h
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    });

    const safeUser = omit(savedUser, [
      'password',
      'refreshToken',
      'emailVerificationCode',
    ]);

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser, accessToken });
  }

  //! get all users in db
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('get-all-users')
  @ApiBearerAuth()
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
  @Patch('business/update')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update business owner information',
    description:
      'Updates basic information for the authenticated business owner',
  })
  @ApiBody({ type: UpdatebusinessOwnerDto })
  @ApiResponse({
    status: 200,
    description: 'User information successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async updateUsers(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatebusinessOwnerDto,
  ) {
    const { id: userId } = req.user;
    const result = await this.userService.updateUserInSettings(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'driver', 'businessOwner')
  @Patch('update/password')
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  async addDriverRole(@Req() req: Request, @Res() res: Response, @Body() body: AddDriverRoleDto) {
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
  @ApiBearerAuth()
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
  async addBusinessOwnerRole(@Req() req: Request, @Res() res: Response, @Body() body: addBusinessOwnerRoleDto) {
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
