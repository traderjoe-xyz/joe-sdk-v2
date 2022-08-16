import { Token } from 'entities'
import { TokenAmount, Price } from '../entities/fractions'
import { QUOTER_ADDRESS, ChainId, TradeType } from '../constants'
import { RouteV2 } from 'v2entities'
import { BigNumber, Contract } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import JSBI from 'jsbi'

import QuoterABI from '../abis/Quoter'

interface Quote {
  route: string[]
  pairs: string[]
  binSteps: BigNumber[]
  amounts: BigNumber[]
  tradeValueAVAX: BigNumber
}

export class TradeV2 {
  public readonly quote: Quote // quote returned by the Quoter contract
  public readonly route: RouteV2 // The route of the trade, i.e. which pairs the trade goes through.
  public readonly tradeType: TradeType // The type of the trade, either exact in or exact out.
  public readonly inputAmount: TokenAmount // The input amount for the trade assuming no slippage.
  public readonly outputAmount: TokenAmount // The output amount for the trade assuming no slippage.
  public readonly executionPrice: Price // The price expressed in terms of output amount/input amount.
  // public readonly priceImpact: Percent

  public constructor(route: RouteV2, tokenIn: Token, tokenOut: Token, quote: Quote, isExactIn: boolean) {
    this.route = route
    this.tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
    this.quote = quote
    this.inputAmount = new TokenAmount(tokenIn, JSBI.BigInt(quote.amounts[0].toString()))
    this.outputAmount = new TokenAmount(tokenOut, JSBI.BigInt(quote.amounts[quote.amounts.length - 1]))
    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.raw,
      this.outputAmount.raw
    )
  }

  // generates trades from input token amount
  public static async getTradesExactIn(
    routes: RouteV2[],
    tokenAmountIn: TokenAmount,
    tokenOut: Token,
    provider: Provider,
    chainId: ChainId
  ): Promise<Array<TradeV2 | null>> {
    const isExactIn = true
    const amountIn = JSBI.toNumber(tokenAmountIn.raw)
    const quoter = new Contract(QUOTER_ADDRESS[chainId], QuoterABI, provider)

    const trades: Array<TradeV2 | null> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathAmountIn(routeStrArr, amountIn)
          const trade: TradeV2 = new TradeV2(route, tokenAmountIn.token, tokenOut, quote, isExactIn)
          return trade 
        } catch (e) {
          return null
        }
      })
    )

    return trades.filter(trade=>!!trade)
  }

  // generates trades from output token amount
  public static async getTradesExactOut(
    routes: RouteV2[],
    tokenAmountOut: TokenAmount,
    tokenIn: Token,
    provider: Provider,
    chainId: ChainId
  ): Promise<Array<TradeV2 | null>> {
    const isExactIn = false
    const amountOut = JSBI.toNumber(tokenAmountOut.raw)
    const quoter = new Contract(QUOTER_ADDRESS[chainId], QuoterABI, provider)

    const trades: Array<TradeV2 | null> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathAmountOut(routeStrArr, amountOut)
          const trade: TradeV2 = new TradeV2(route, tokenAmountOut.token, tokenIn, quote, isExactIn)
          return trade 
        } catch (e) {
          return null
        }
      })
    )

    return trades.filter(trade=>!!trade)
  }

  // generates object for meaningful console.log
  public toLog() {
    return {
      route: {
        path: this.route.path.map((token) => token.address).join(', ')
      },
      tradeType: this.tradeType === TradeType.EXACT_INPUT? "EXACT_INPUT" : "EXACT_OUTPUT",
      inputAmount: JSBI.toNumber(this.inputAmount.raw),
      outputAmount: JSBI.toNumber(this.outputAmount.raw),
      executionPrice: `${this.executionPrice.toSignificant(6)} ${this.outputAmount.currency.symbol} / ${this.inputAmount.currency.symbol}`,
      quote: {
        route: this.quote.route.join(', '),
        pairs: this.quote.pairs.join(', '),
        binSteps: this.quote.binSteps.map((el) => el.toString()).join(', '),
        amounts: this.quote.amounts.map((el) => el.toString()).join(', '),
        tradeValueAVAX: this.quote.tradeValueAVAX.toString()
      }
    }
  }
}