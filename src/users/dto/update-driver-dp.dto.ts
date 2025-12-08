import { ApiProperty} from "@nestjs/swagger";
import { IsUrl, IsString, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";


class DpDto {
  @ApiProperty({
    description: 'Secure URL of the uploaded image',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  secure_url: string;

  @ApiProperty({
    description: 'Public ID of the uploaded image in cloud storage',
    example: 'weekly_proofs/abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  public_id: string;
}


export class UpdateDriverDpDto {
    @ApiProperty({
        description: "a url of the profile picture", 
        type: DpDto, 
    })
    @ValidateNested()
    @Type(() => DpDto)
    dp: DpDto
}