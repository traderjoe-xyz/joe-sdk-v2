import { Contract, utils, Signer, Wallet, BigNumber } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { Token } from './token'
import { CAVAX } from './currency'
import { RouteV2 } from './route'
import { TokenAmount, Price, Percent, Fraction, CurrencyAmount } from './fractions'
import { QUOTER_ADDRESS, LB_ROUTER_ADDRESS, ChainId, TradeType, ONE, ZERO, ZERO_HEX } from '../constants'
import { toHex, validateAndParseAddress, isZero } from '../utils'
import { TradeOptions, TradeOptionsDeadline, SwapParameters, Quote } from '../types'

import QuoterABI from '../abis/Quoter.json'
import LBRouterABI from '../abis/LBRouter.json'

/** Class representing a trade */
export class TradeV2 {
  public readonly quote: Quote // quote returned by the Quoter contract
  public readonly route: RouteV2 // The route of the trade, i.e. which pairs the trade goes through.
  public readonly tradeType: TradeType // The type of the trade, either exact in or exact out.
  public readonly inputAmount: TokenAmount // The input amount for the trade assuming no slippage.
  public readonly outputAmount: TokenAmount // The output amount for the trade assuming no slippage.
  public readonly executionPrice: Price // The price expressed in terms of output amount/input amount.
  public readonly midPrice: string // The ratio of reserves along the route (market-clearing price )
  public readonly priceImpact: Percent // The percent difference between the executionPrice and the midPrice due to trade size

  public constructor(route: RouteV2, tokenIn: Token, tokenOut: Token, quote: Quote, isExactIn: boolean) {
    const inputAmount = new TokenAmount(tokenIn, JSBI.BigInt(quote.amounts[0].toString()))
    const outputAmount = new TokenAmount(tokenOut, JSBI.BigInt(quote.amounts[quote.amounts.length - 1]))

    this.route = route
    this.tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
    this.quote = quote
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.raw,
      this.outputAmount.raw
    )

    // compute and set trade route midPrice
    const prices: Fraction[] = quote.midPrice.map(
      (price: BigNumber) => new Fraction(price.toString(), (1e18).toString())
    )
    const midPrice: Fraction = prices
      .slice(1)
      .reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0])
    this.midPrice = midPrice.toSignificant(6)

    // compute and set priceImpact
    const exactQuote = midPrice.multiply(inputAmount.raw)
    const slippage = exactQuote.subtract(outputAmount.raw).divide(exactQuote)
    this.priceImpact = new Percent(slippage.numerator, slippage.denominator)
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   *
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   * @returns {CurrencyAmount}
   */
  public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(slippageTolerance)
        .invert()
        .multiply(this.outputAmount.raw).quotient
      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.ether(slippageAdjustedAmountOut)
    }
  }

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   *
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   * @returns {CurrencyAmount}
   */
  public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.ether(slippageAdjustedAmountIn)
    }
  }

  /**
   * Returns the on-chain method name and args for this trade
   *
   * @param {TradeOptions | TradeOptionsDeadline} options
   * @returns {SwapParameters}
   */
  public swapCallParameters(options: TradeOptions | TradeOptionsDeadline): SwapParameters {
    const avaxIn = this.inputAmount.currency === CAVAX
    const avaxOut = this.outputAmount.currency === CAVAX
    // the router does not support both avax in and out
    invariant(!(avaxIn && avaxOut), 'AVAX_IN_OUT')
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL')

    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(this.maximumAmountIn(options.allowedSlippage))
    const amountOut: string = toHex(this.minimumAmountOut(options.allowedSlippage))
    const binSteps: string[] = this.quote.binSteps.map((bin) => bin.toHexString())
    const path: string[] = this.quote.route
    const deadline =
      'ttl' in options
        ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
        : `0x${options.deadline.toString(16)}`

    const useFeeOnTransfer = Boolean(options.feeOnTransfer)

    let methodName: string
    let args: (string | string[])[]
    let value: string
    switch (this.tradeType) {
      case TradeType.EXACT_INPUT:
        if (avaxIn) {
          methodName = useFeeOnTransfer
            ? 'swapExactAVAXForTokensSupportingFeeOnTransferTokens'
            : 'swapExactAVAXForTokens'
          // (uint amountOutMin, uint[] pairVersions, address[] tokenPath, address to, uint deadline)
          args = [amountOut, binSteps, path, to, deadline]
          value = amountIn
        } else if (avaxOut) {
          methodName = useFeeOnTransfer
            ? 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
            : 'swapExactTokensForAVAX'
          // (uint amountIn, uint amountOutMinAVAX, uint[] pairVersions, address[] tokenPath, address to, uint deadline)
          args = [amountIn, amountOut, binSteps, path, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = useFeeOnTransfer
            ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
            : 'swapExactTokensForTokens'
          // (uint amountIn, uint amountOutMin, uint[] pairVersions, address[] tokenPath, address to, uint deadline)
          args = [amountIn, amountOut, binSteps, path, to, deadline]
          value = ZERO_HEX
        }
        break
      case TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        if (avaxIn) {
          methodName = 'swapAVAXForExactTokens'
          // (uint amountOut, uint[] pairVersions, address[] tokenPath, address to, uint deadline)
          args = [amountOut, binSteps, path, to, deadline]
          value = amountIn
        } else if (avaxOut) {
          methodName = 'swapTokensForExactAVAX'
          // (uint amountOut, uint amountInMax, uint[] pairVersions, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, binSteps, path, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, binSteps, path, to, deadline]
          value = ZERO_HEX
        }
        break
    }
    return {
      methodName,
      args,
      value
    }
  }

  /**
   * Returns an estimate of the gas cost for the trade
   *
   * @param {Signer} signer - The signer such as the wallet
   * @param {ChainId} chainId - The network chain id
   * @param {Percent} slippageTolerance - The slippage tolerance
   * @returns {Promise<BigNumber>}
   */
  public async estimateGas(signer: Signer, chainId: ChainId, slippageTolerance: Percent): Promise<BigNumber> {
    const routerInterface = new utils.Interface(LBRouterABI.abi)
    const router = new Contract(LB_ROUTER_ADDRESS[chainId], routerInterface, signer)

    const currentBlockTimestamp = (await (signer as Wallet).provider.getBlock('latest')).timestamp
    const userAddr = await signer.getAddress()

    const options: TradeOptionsDeadline = {
      allowedSlippage: slippageTolerance,
      recipient: userAddr,
      deadline: currentBlockTimestamp + 120
    }

    const { methodName, args, value }: SwapParameters = this.swapCallParameters(options)
    const msgOptions = !value || isZero(value) ? {} : { value }

    const gasPrice = await signer.getGasPrice()

    const response = await router.estimateGas[methodName](...args, msgOptions)

    return response.mul(gasPrice)
  }

  /**
   * Returns an object representing this trade for a readable cosole.log
   *
   * @returns {Object}
   */
  public toLog() {
    return {
      route: {
        path: this.route.path.map((token) => token.address).join(', ')
      },
      tradeType: this.tradeType === TradeType.EXACT_INPUT ? 'EXACT_INPUT' : 'EXACT_OUTPUT',
      inputAmount: JSBI.toNumber(this.inputAmount.raw),
      outputAmount: JSBI.toNumber(this.outputAmount.raw),
      executionPrice: `${this.executionPrice.toSignificant(6)} ${this.outputAmount.currency.symbol} / ${
        this.inputAmount.currency.symbol
      }`,
      midPrice: this.midPrice,
      priceImpact: `${this.priceImpact.toSignificant(6)}%`,
      quote: {
        route: this.quote.route.join(', '),
        pairs: this.quote.pairs.join(', '),
        binSteps: this.quote.binSteps.map((el) => el.toString()).join(', '),
        amounts: this.quote.amounts.map((el) => el.toString()).join(', '),
        midPrices: this.quote.midPrice.map((el) => el.toString()).join(', '),
        tradeValueAVAX: this.quote.tradeValueAVAX.toString()
      }
    }
  }

  /**
   * @static
   * Returns the list of trades, given a list of routes and a fixed amount of the input token
   *
   * @param {RouteV2[]} routes
   * @param {TokenAmount} tokenAmountIn
   * @param {Token} tokenOut
   * @param {Provider} provider
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactIn(
    routes: RouteV2[],
    tokenAmountIn: TokenAmount,
    tokenOut: Token,
    provider: Provider,
    chainId: ChainId
  ): Promise<Array<TradeV2 | null>> {
    const isExactIn = true
    const amountIn = JSBI.toNumber(tokenAmountIn.raw)
    const quoterInterface = new utils.Interface(QuoterABI.abi)
    const quoter = new Contract(QUOTER_ADDRESS[chainId], quoterInterface, provider)

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

    return trades.filter((trade) => !!trade)
  }

  /**
   * @static
   * Returns the list of trades, given a list of routes and a fixed amount of the output token
   *
   * @param {RouteV2[]} routes
   * @param {TokenAmount} tokenAmountOut
   * @param {Token} tokenIn
   * @param {Provider} provider
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactOut(
    routes: RouteV2[],
    tokenAmountOut: TokenAmount,
    tokenIn: Token,
    provider: Provider,
    chainId: ChainId
  ): Promise<Array<TradeV2 | null>> {
    const isExactIn = false
    const amountOut = JSBI.toNumber(tokenAmountOut.raw)
    const quoterInterface = new utils.Interface(QuoterABI.abi)
    const quoter = new Contract(QUOTER_ADDRESS[chainId], quoterInterface, provider)

    const trades: Array<TradeV2 | null> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathAmountOut(routeStrArr, amountOut)
          const trade: TradeV2 = new TradeV2(route, tokenIn, tokenAmountOut.token, quote, isExactIn)
          return trade
        } catch (e) {
          return null
        }
      })
    )

    return trades.filter((trade) => !!trade)
  }

  /**
   * Selects the best trade given trades and gas
   *
   * @param {TradeV2[]} trades
   * @param {BigNumber[]} estimatedGas
   * @returns {bestTrade: TradeV2, estimatedGas: BigNumber}
   */
  public static chooseBestTrade(
    trades: TradeV2[],
    estimatedGas: BigNumber[]
  ): {
    bestTrade: TradeV2
    estimatedGas: BigNumber
  } {
    const tradeType = trades[0].tradeType
    // The biggest tradeValueAVAX will be the most accurate
    // If we haven't found any equivalent of the trade in AVAX, we won't take gas cost into account
    const tradeValueAVAX = trades.reduce((previousBestTradeValueAVAX, trade) =>
      trade.quote.tradeValueAVAX.gt(previousBestTradeValueAVAX.quote.tradeValueAVAX)
        ? trade
        : previousBestTradeValueAVAX
    ).quote.tradeValueAVAX

    const tradesWithGas = trades.map((trade, index) => {
      return {
        trade: trade,
        estimatedGas: estimatedGas[index],
        swapOutcome:
          trade.tradeType === TradeType.EXACT_INPUT
            ? new Fraction(trade.outputAmount.numerator, trade.outputAmount.denominator).subtract(
                tradeValueAVAX.eq(0)
                  ? BigInt(0)
                  : // Cross product to get the gas price against the output token
                    trade.outputAmount.multiply(estimatedGas[index].toString()).divide(tradeValueAVAX.toBigInt())
              )
            : new Fraction(trade.inputAmount.numerator, trade.inputAmount.denominator).add(
                tradeValueAVAX.eq(0)
                  ? BigInt(0)
                  : trade.inputAmount.multiply(estimatedGas[index].toString()).divide(tradeValueAVAX.toBigInt())
              )
      }
    })

    const bestTrade = tradesWithGas.reduce((previousTrade, currentTrade) =>
      tradeType === TradeType.EXACT_INPUT
        ? currentTrade.swapOutcome.greaterThan(previousTrade.swapOutcome)
          ? currentTrade
          : previousTrade
        : currentTrade.trade.inputAmount.greaterThan('0') &&
          currentTrade.swapOutcome.lessThan(previousTrade.swapOutcome)
        ? currentTrade
        : previousTrade
    )

    return { bestTrade: bestTrade.trade, estimatedGas: bestTrade.estimatedGas }
  }
}
