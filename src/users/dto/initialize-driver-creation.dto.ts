import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class InitializeDriverCreationDto {
    @ApiProperty({
        example: "user@example.com", 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string
    
    @ApiProperty({
        example: "09098394800", 
        description: "The registered email of the user"
    })

    @IsNotEmpty()
    @IsString()
    phone: string

    @ApiProperty({
        example: "John Doe", 
        description: "The name of the user"
    })
    @IsNotEmpty()
    @IsString()
    fullName: string
}