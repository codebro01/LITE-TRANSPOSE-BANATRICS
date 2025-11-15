import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterNotificationsDto {
  @ApiPropertyOptional({
    example: 'https://banatrics.app/?unread=true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  unread?: boolean;

  @ApiPropertyOptional({
    example: 'https://banatrics.app/?campaign=true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  campaign?: boolean;

  @ApiPropertyOptional({
    example: 'https://banatrics.app/?payment=true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  payment?: boolean;

}


