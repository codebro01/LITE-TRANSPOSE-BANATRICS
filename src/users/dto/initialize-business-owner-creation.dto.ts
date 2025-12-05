import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class InitializeBusinessOwnerCreationDto {
    @ApiProperty({
        example: "user@example.com", 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({
        example: "90932939300", 
        description: "The phone number of the user"
    })

    @IsNotEmpty()
    @IsString()
    phone: string

    @ApiProperty({
        example: "Banatrics Inc.", 
        description: "The business name of the user"
    })
    @IsNotEmpty()
    @IsString()
    businessName: string
}