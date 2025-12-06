import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString } from "class-validator";


export enum DriverCampaignStatusType  {
    COMPLETED = 'completed', 
    PENDING_APPROVAL = 'pending_approval', 
    DUE_SOON = 'due_soon', 
    APPROVED = 'approved', 

}

export class CreateDriverCampaignDto {
    @ApiProperty({
        example: "0f4b7381-79d8-4e9f-a47b-4e08106812f7", 
        description: "id of the campaign", 
    })
    @IsNotEmpty()
    @IsString()
    campaignId: string

    // @ApiProperty({
    //     example: "pending_approval", 
    //     description: "id of the campaign", 
    // })
    // @IsNotEmpty()
    // @IsEnum(DriverCampaignStatusType, {message: 'value can either be of active, completed, pending_approval, due_soon'})
    // campaignStatus: DriverCampaignStatusType
}