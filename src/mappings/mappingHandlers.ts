import {SubstrateEvent} from "@subql/types";
import { AccountId, Balance, CurrencyId, Rate, OptionRate  } from "@acala-network/types/interfaces";
import { getStableCoinCurrency, getTokenDecimals, queryPriceFromOracle } from "@acala-network/subql-utils";
import {Loan, Liquidation} from "../types";
import { forceToCurrencyName, getCurrencyObject, FixedPointNumber } from "@acala-network/sdk-core";

export async function handlePositionUpdated(event: SubstrateEvent): Promise<void> {
    logger.info("====>handlePositionUpdated event record=> " + JSON.stringify(event))
    let blockNumber = event.block.block.header.number.toBigInt()    
    let timestamp = event.block.timestamp;
    const [account, collateral, _collateralChanged, _debitChanged] = event.event.data;

    let id = account + "_" + forceToCurrencyName(collateral)
    let record = await Loan.get(id);
    if (!record) {
        record = Loan.create({
            id: id,
            account: account.toString(),
            blockNumber: blockNumber,
            timestamp: timestamp,
            txCount: BigInt(1)

        });
    }
    record.collateralCurrency = forceToCurrencyName(collateral)
    record.collateralAmount = record.collateralAmount?record.collateralAmount+BigInt(_collateralChanged.toString()):BigInt(_collateralChanged.toString());
    record.debitAmount = record.debitAmount?record.debitAmount+BigInt(_debitChanged.toString()):BigInt(_debitChanged.toString());
    record.txCount = record.txCount?record.txCount+BigInt(1):BigInt(1);
    record.blockNumber = blockNumber
    record.timestamp = timestamp

	const price = await queryPriceFromOracle(api as any, event.block, record.collateralCurrency)
    .catch(() => Promise.resolve(FixedPointNumber.ZERO));
    let collateralExchangeRate = BigInt((price || FixedPointNumber.ZERO).toChainData())
	record.collateralExchangeRate = collateralExchangeRate

	const collateralDecimals = await getTokenDecimals(api as any, record.collateralCurrency);
    let collateralAmountUSD = getVolumeUSD(record.collateralAmount, collateralDecimals, collateralExchangeRate)
	record.collateralAmountUSD = collateralAmountUSD

    let debitExchangeRate = await queryExchangeRate(record.collateralCurrency)
	record.debitExchangeRate = debitExchangeRate

	const stableCoinDecimals = await getTokenDecimals(api as any, getStableCoinCurrency(api as any));
    let debitAmountUSD = getVolumeUSD(record.debitAmount, stableCoinDecimals, debitExchangeRate)
	record.debitAmountUSD = debitAmountUSD
	//record.loanToCollateralRatio = collateralAmountUSD/record.debitAmount
	//logger.info("Exchange rate: " + exchangeRate)
	//logger.info("Debit USD " + debitAmountUSD)

    await record.save().then((ress) => {
        logger.info("totalAccount save =>"+ ress)
    })
    .catch((err) => {
        logger.info("handlePositionUpdated error => " + err)
        //logger.info("====> handlePositionUpdated event record=> " + JSON.stringify(event))
    });    

}

export async function handleLiquidateUnsafeCDP(event: SubstrateEvent): Promise<void> {
    logger.info("====>handleLiquidateUnsafeCDP event record=> " + JSON.stringify(event))
    let blockNumber = event.block.block.header.number.toBigInt()    
    let timestamp = event.block.timestamp;
    const [_collateral, account, collateral_amount, bad_debt_value, liquidation_strategy] = event.event.data as unknown as [CurrencyId, AccountId, Balance, Balance, Balance];

    logger.info("== _collateralChanged: " + BigInt(_collateral.toString()))
    logger.info("== account: " + account)
    logger.info("== collateral_amount: " + collateral_amount)
    logger.info("== bad_debt_value: " + bad_debt_value)
    logger.info("== liquidation_strategy: " + liquidation_strategy)

    let id = blockNumber + "_" + account
    let record = await Liquidation.get(id);
    if (!record) {
        record = Liquidation.create({
            id: id,
            account: account.toString()
        });
    }
    record.collateralChanged = BigInt(_collateral.toString())
    record.collateralAmount = record.collateralAmount?record.collateralAmount+BigInt(collateral_amount.toString()):BigInt(collateral_amount.toString());
    record.badDebtAmount = record.badDebtAmount?record.badDebtAmount+BigInt(bad_debt_value.toString()):BigInt(bad_debt_value.toString());
    record.blockNumber = blockNumber
    record.timestamp = timestamp
    await record.save().then((ress) => {
        logger.info("totalAccount save =>"+ ress)
    })
    .catch((err) => {
        logger.info("handleLiquidateUnsafeCDP error => " + err)
        //logger.info("====> handleLiquidateUnsafeCDP event record=> " + JSON.stringify(event))
    });   
}

const PRICE_DECIMALS = 18

export function getVolumeUSD (amount: bigint, decimals: number, price: bigint) {
  return BigInt(
    FixedPointNumber.fromInner(price.toString(), PRICE_DECIMALS)
      .mul(FixedPointNumber.fromInner(amount.toString(), PRICE_DECIMALS))
      .toChainData()
  )
}

export async function queryExchangeRate (token: any) {
    const name = forceToCurrencyName(token);
    const debitExchangeRate = (await api.query.cdpEngine.debitExchangeRate(getCurrencyObject(name))) as unknown as OptionRate;
    const globalExchangeRate = api.consts.cdpEngine.defaultDebitExchangeRate as unknown as Rate;
  
    return debitExchangeRate.isNone ? BigInt(globalExchangeRate.toString()) : BigInt(debitExchangeRate.unwrapOrDefault().toString());
  }