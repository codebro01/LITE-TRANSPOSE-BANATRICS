import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class EmailVerificationDto {
    @ApiProperty({
        example: "user@example.com", 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string


    @ApiProperty({
        example: 547389, 
        description: "The registered email of the user"
    })
    @IsOptional()
    @IsString()
    emailVerificationCode?: string
}