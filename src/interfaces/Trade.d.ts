import { IRoute, IPair } from 'interfaces'
import { TradeType } from '../constants'
import { CurrencyAmount, Price, TokenAmount, Token, BestTradeOptions, Percent } from 'entities'

/* Interface for Trade */

export interface ITrade {
  
  // properties (from joe-sdk-v1)
  route: IRoute // The route of the trade, i.e. which pairs the trade goes through.
  tradeType: TradeType // The type of the trade, either exact in or exact out.
  inputAmount: CurrencyAmount // The input amount for the trade assuming no slippage.
  outputAmount: CurrencyAmount // The output amount for the trade assuming no slippage.
  executionPrice: Price // The average price that the trade would execute at expressed in terms of output amount/input amount.
  nextMidPrice: Price // The mid price after the trade executes assuming no slippage.

  // static methods (from joe-sdk-v1)
  bestTradeExactIn(pairs: IPair[], amountIn: TokenAmount, tokenOut: Token, bestTradeOptions: BestTradeOptions): ITrade[]
  bestTradeExactOut(pairs: IPair[], tokenIn: Token, amountOut: TokenAmount, bestTradeOptions: BestTradeOptions): ITrade[]

  // methods (from joe-sdk-v1)
  minimumAmountOut(slippageTolerance: Percent): TokenAmount // Returns the minimum amount of the output token that should be received from a trade, given the slippage tolerance.
  maximumAmountIn(slippageTolerance: Percent): TokenAmount // Returns the maximum amount of the input token that should be spent on the trade, given the slippage tolerance.
}
