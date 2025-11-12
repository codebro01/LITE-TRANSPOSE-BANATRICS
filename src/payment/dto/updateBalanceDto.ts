import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBalanceDto {
  @ApiProperty({
    example: 10000,
    description: 'Insert amount would be moved to pending, make sure amount is in number',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
