
import { Inject, Injectable } from "@nestjs/common";
import { earningsTable, earningTableInsertType } from "@src/db/earnings";
import { NodePgDatabase } from "drizzle-orm/node-postgres";


@Injectable()
export class EarningRepository {
    constructor(@Inject('DB') private readonly DbProvider: NodePgDatabase<typeof import('@src/db')> ){}

 async createEarnings(data: earningTableInsertType, trx?:any) {
        const Trx  = trx || this.DbProvider;

        const earnings  = await Trx.insert(earningsTable).values({...data})

        return earnings; 
 }

 
}