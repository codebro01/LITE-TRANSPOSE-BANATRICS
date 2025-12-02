// email-verification.dto.ts or create-user.dto.ts
import { IntersectionType } from '@nestjs/swagger';
import { EmailVerificationDto } from '@src/users/dto/email-verification.dto';
import { createUserDto } from '@src/users/dto/create-user.dto';

export class FinalizeUserCreationDto extends IntersectionType(
  createUserDto,
  EmailVerificationDto,
) {}
