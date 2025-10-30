import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DraftCampaignDto } from "@src/campaign/dto/draftCampaignDto";
import { campaignTable } from "@src/db/campaign";


@Injectable()

export class CampaignRepository {
    constructor(
       @Inject('DB')
       private DbProvider: NodePgDatabase<typeof import('@src/db')>
    ) {
        this.DbProvider = DbProvider
    }


    async draftCampaign(userId: string, data: DraftCampaignDto): Promise<any> {
           try {
            if(!userId || !data) throw new BadRequestException('Please provide userId and draft data')
               const [draft] = await this.DbProvider.insert(campaignTable)
                 .values({
                   ...data,
                   userId,
                   statusType: 'draft',
                   startDate: data.startDate ? new Date(data.startDate) : null,
                   endDate: data.endDate ? new Date(data.endDate) : null,
                 })
                 .returning();

               return { message: 'Draft saved successfully', draft };
           }
           catch(error) {

                  console.error('Insert Error:', error);

            throw error
           }
    }


}