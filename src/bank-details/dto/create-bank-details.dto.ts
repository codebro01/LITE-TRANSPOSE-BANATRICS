import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBankDetailsDto {
    @ApiProperty({
        example: "0000000001", 
        description: "account number of the user"
    })
    @IsNotEmpty() 
    @IsString()
    accountNumber: string 

    @ApiProperty({
        example: "John Doe", 
        description: "Name of the user"
    })
    @IsNotEmpty() 
    @IsString()
    accountName: string 


    @ApiProperty({
        example: 9, 
        description: "bank id returned from the verify bank details api"
    })
    @IsNotEmpty() 
    @IsString()
    bankId: number;
}