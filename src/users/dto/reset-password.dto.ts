import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ResetPasswordDto {
    @ApiProperty({
        example: "user@example.com", 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({
        example: "User@example123", 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsString()
      @MinLength(8)
      @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
        message:
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
      })
    newPassword: string


    @ApiProperty({
        example: 'ey.fjkjjdfkjdkjkl23049820948dkfjlkdjlfksjlkdjfl', 
        description: "The registered email of the user"
    })
    @IsNotEmpty()
    @IsString()
    resetToken: string
}