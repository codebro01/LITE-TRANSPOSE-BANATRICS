import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class EmailVerificationDto {



    @ApiProperty({
        example: 547389, 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsString()
    emailVerificationCode?: string
}