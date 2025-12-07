import { PartialType } from '@nestjs/swagger';
import { CreateWeeklyProofDto } from './create-weekly-proof.dto';

export class UpdateWeeklyProofDto extends PartialType(CreateWeeklyProofDto) {}
