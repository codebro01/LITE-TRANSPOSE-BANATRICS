import { PartialType } from '@nestjs/swagger';
import { CreateEarningDto } from './create-earning.dto';

export class UpdateEarningDto extends PartialType(CreateEarningDto) {}
