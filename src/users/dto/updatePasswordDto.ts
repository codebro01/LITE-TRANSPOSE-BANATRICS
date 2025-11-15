import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'OldPass123!',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;

  @ApiProperty({
    description:
      'New password (must be at least 8 characters with uppercase, lowercase, number, and special character)',
    example: 'NewPass123!',
    type: String,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'New password must contain uppercase, lowercase, number, and special character',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password (must match new password)',
    example: 'NewPass123!',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  repeatNewPassword: string;
}
