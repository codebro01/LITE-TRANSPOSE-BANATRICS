// email-verification.dto.ts or create-user.dto.ts
import { IntersectionType } from '@nestjs/swagger';
import { EmailVerificationDto } from '@src/users/dto/email-verification.dto';
import { CreateDriverDto } from '@src/users/dto/create-driver.dto';
export class FinalizeBusinessOwnerCreationDto extends IntersectionType(
  CreateDriverDto,
  EmailVerificationDto,
) {}
