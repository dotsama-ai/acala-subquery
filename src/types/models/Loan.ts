// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type LoanProps = Omit<Loan, NonNullable<FunctionPropertyNames<Loan>>>;

export class Loan implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public account?: string;

    public collateralAmount?: bigint;

    public collateralCurrency?: string;

    public collateralExchangeRate?: bigint;

    public collateralAmountUSD?: bigint;

    public collateralDecimal?: bigint;

    public debitAmount?: bigint;

    public debitExchangeRate?: bigint;

    public debitAmountUSD?: bigint;

    public stableCoinDecimal?: bigint;

    public loanToCollateralRatio?: bigint;

    public blockNumber?: bigint;

    public timestamp?: Date;

    public txCount?: bigint;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Loan entity without an ID");
        await store.set('Loan', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Loan entity without an ID");
        await store.remove('Loan', id.toString());
    }

    static async get(id:string): Promise<Loan | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Loan entity without an ID");
        const record = await store.get('Loan', id.toString());
        if (record){
            return Loan.create(record as LoanProps);
        }else{
            return;
        }
    }



    static create(record: LoanProps): Loan {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new Loan(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
