// email-verification.dto.ts or create-user.dto.ts
import { IntersectionType } from '@nestjs/swagger';
import { EmailVerificationDto } from '@src/users/dto/email-verification.dto';
import { createBusinessOwnerDto } from '@src/users/dto/create-business-owner.dto';

export class FinalizeBusinessOwnerCreationDto extends IntersectionType(
  createBusinessOwnerDto,
  EmailVerificationDto,
) {}
