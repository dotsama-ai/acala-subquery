// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type LiquidationProps = Omit<Liquidation, NonNullable<FunctionPropertyNames<Liquidation>>>;

export class Liquidation implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public account?: string;

    public collateralChanged?: bigint;

    public collateralAmount?: bigint;

    public badDebtAmount?: bigint;

    public liquidationStrategy?: string;

    public blockNumber?: bigint;

    public timestamp?: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Liquidation entity without an ID");
        await store.set('Liquidation', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Liquidation entity without an ID");
        await store.remove('Liquidation', id.toString());
    }

    static async get(id:string): Promise<Liquidation | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Liquidation entity without an ID");
        const record = await store.get('Liquidation', id.toString());
        if (record){
            return Liquidation.create(record as LiquidationProps);
        }else{
            return;
        }
    }



    static create(record: LiquidationProps): Liquidation {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new Liquidation(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
