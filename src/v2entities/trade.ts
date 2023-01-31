import { Contract, utils, Signer, Wallet, BigNumber } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { Web3Provider } from '@ethersproject/providers'
import {
  Token,
  TokenAmount,
  Price,
  Percent,
  Fraction,
  CurrencyAmount,
  TradeType,
  ChainId,
  WNATIVE
} from '@traderjoe-xyz/sdk'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { RouteV2 } from './route'
import {
  LB_QUOTER_ADDRESS,
  LB_ROUTER_ADDRESS,
  ONE,
  ZERO,
  ZERO_HEX
} from '../constants'
import { toHex, validateAndParseAddress, isZero } from '../utils'
import {
  TradeOptions,
  TradeOptionsDeadline,
  TradeFee,
  SwapParameters,
  Quote
} from '../types'

import LBQuoterABI from '../abis/json/LBQuoter.json'
import LBRouterABI from '../abis/json/LBRouter.json'

/** Class representing a trade */
export class TradeV2 {
  public readonly quote: Quote // quote returned by the LBQuoter contract
  public readonly route: RouteV2 // The route of the trade, i.e. which pairs the trade goes through.
  public readonly tradeType: TradeType // The type of the trade, either exact in or exact out.
  public readonly inputAmount: TokenAmount // The input amount for the trade returned by the quote
  public readonly outputAmount: TokenAmount // The output amount for the trade returned by the quote
  public readonly executionPrice: Price // The price expressed in terms of output amount/input amount.
  public readonly exactQuote: TokenAmount // The exact amount if there was not slippage
  public readonly priceImpact: Percent // The percent difference between the executionPrice and the midPrice due to trade size
  public readonly isNativeIn: boolean
  public readonly isNativeOut: boolean

  public constructor(
    route: RouteV2,
    tokenIn: Token,
    tokenOut: Token,
    quote: Quote,
    isExactIn: boolean,
    isNativeIn: boolean,
    isNativeOut: boolean
  ) {
    const inputAmount = new TokenAmount(
      tokenIn,
      JSBI.BigInt(quote.amounts[0].toString())
    )
    const outputAmount = new TokenAmount(
      tokenOut,
      JSBI.BigInt(quote.amounts[quote.amounts.length - 1].toString())
    )

    this.route = route
    this.tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
    this.quote = quote
    this.isNativeIn = isNativeIn
    this.isNativeOut = isNativeOut
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.raw,
      this.outputAmount.raw
    )

    // compute exactQuote and priceImpact
    const exactQuoteStr =
      quote.virtualAmountsWithoutSlippage[
        quote.virtualAmountsWithoutSlippage.length - 1
      ].toString()
    this.exactQuote = new TokenAmount(tokenOut, JSBI.BigInt(exactQuoteStr))
    const slippage = this.exactQuote
      .subtract(outputAmount)
      .divide(this.exactQuote)
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
      const chainId = this.outputAmount.token.chainId
      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.ether(chainId, slippageAdjustedAmountOut)
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
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(slippageTolerance)
        .multiply(this.inputAmount.raw).quotient
      const chainId = this.outputAmount.token.chainId
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.ether(chainId, slippageAdjustedAmountIn)
    }
  }

  /**
   * Returns the on-chain method name and args for this trade
   *
   * @param {TradeOptions | TradeOptionsDeadline} options
   * @returns {SwapParameters}
   */
  public swapCallParameters(
    options: TradeOptions | TradeOptionsDeadline
  ): SwapParameters {
    const nativeIn = this.isNativeIn
    const nativeOut = this.isNativeOut
    // the router does not support both avax in and out
    invariant(!(nativeIn && nativeOut), 'AVAX_IN_OUT')
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL')

    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(
      this.maximumAmountIn(options.allowedSlippage)
    )
    const amountOut: string = toHex(
      this.minimumAmountOut(options.allowedSlippage)
    )
    const binSteps: string[] = this.quote.binSteps.map((bin) =>
      bin.toHexString()
    )
    const path: string[] = this.quote.route
    const deadline =
      'ttl' in options
        ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(
            16
          )}`
        : `0x${options.deadline.toString(16)}`

    const useFeeOnTransfer = Boolean(options.feeOnTransfer)

    let methodName: string
    let args: (string | string[])[]
    let value: string
    switch (this.tradeType) {
      case TradeType.EXACT_INPUT:
        if (nativeIn) {
          methodName = useFeeOnTransfer
            ? 'swapExactAVAXForTokensSupportingFeeOnTransferTokens'
            : 'swapExactAVAXForTokens'
          // (uint amountOutMin, uint[] pairVersions, address[] tokenPath, address to, uint deadline)
          args = [amountOut, binSteps, path, to, deadline]
          value = amountIn
        } else if (nativeOut) {
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
        if (nativeIn) {
          methodName = 'swapAVAXForExactTokens'
          // (uint amountOut, uint[] pairVersions, address[] tokenPath, address to, uint deadline)
          args = [amountOut, binSteps, path, to, deadline]
          value = amountIn
        } else if (nativeOut) {
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
   * Calculates trade fee in terms of inputToken
   *
   * @returns {TradeFee}
   */
  public async getTradeFee(): Promise<TradeFee> {
    // amounts for each step of the swap returned from quoter contract
    // e.g. [10 WAVAX, 20 USDC, 19.9 USDT ] when inputAmount is 10 WAVAX and resulting outputToken is USDT
    const amounts = this.quote.amounts

    // pool fee % for each step of the swap from quoter contract
    // e.g. [WAVAX-USDC pool 0.05%, USDC-USDT pool 0.01%]
    const feesPct = this.quote.fees.map(
      (bn) => new Percent(JSBI.BigInt(bn.toString()), JSBI.BigInt(1e18))
    )

    // actual fee amounts paid at each step of the swap; e.g. [0.005 WAVAX, 0.002 USDC]
    const fees = feesPct.map((pct, i) => {
      const amount = amounts[i].toString()
      return pct.multiply(JSBI.BigInt(amount)).quotient
    })

    // change each fees in terms of the inputToken; e.g. [0.005 WAVAX, 0.0001 WAVAX]
    const feesTokenIn = fees.map((fee, i) => {
      // first fee will always be in terms of inputToken
      if (i === 0) {
        return fee
      }

      const midPrice = new Fraction(
        JSBI.BigInt(amounts[0].toString()),
        JSBI.BigInt(amounts[i].toString())
      )
      return midPrice.multiply(fee).quotient
    })

    // sum of all fees; e.g. 0.0051 WAVAX
    const totalFee = feesTokenIn.reduce(
      (a, b) => JSBI.add(a, b),
      JSBI.BigInt('0')
    )

    // get total fee in TokenAmount
    const feeAmountIn = new TokenAmount(this.inputAmount.token, totalFee)

    // get total fee pct; e.g. 0.0051 / 10 * 100 = 0.051%
    const totalFeePct = new Percent(totalFee, JSBI.BigInt(this.inputAmount.raw))

    return {
      totalFeePct,
      feeAmountIn
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
  public async estimateGas(
    signer: Signer,
    chainId: ChainId,
    slippageTolerance: Percent
  ): Promise<BigNumber> {
    const routerInterface = new utils.Interface(LBRouterABI)
    const router = new Contract(
      LB_ROUTER_ADDRESS[chainId],
      routerInterface,
      signer
    )

    const currentBlockTimestamp = (
      await (signer as Wallet).provider.getBlock('latest')
    ).timestamp
    const userAddr = await signer.getAddress()

    const options: TradeOptionsDeadline = {
      allowedSlippage: slippageTolerance,
      recipient: userAddr,
      deadline: currentBlockTimestamp + 120
    }

    const { methodName, args, value }: SwapParameters =
      this.swapCallParameters(options)
    const msgOptions = !value || isZero(value) ? {} : { value }

    const gasPrice = await signer.getGasPrice()

    const response = await router.estimateGas[methodName](...args, msgOptions)

    return response.mul(gasPrice)
  }

  /**
   * @static
   * Returns the list of trades, given a list of routes and a fixed amount of the input token
   *
   * @param {RouteV2[]} routes
   * @param {TokenAmount} tokenAmountIn
   * @param {Token} tokenOut
   * @param {boolean} isNativeIn
   * @param {boolean} isNativeOut
   * @param {Provider | Web3Provider | any} provider
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactIn(
    routes: RouteV2[],
    tokenAmountIn: TokenAmount,
    tokenOut: Token,
    isNativeIn: boolean,
    isNativeOut: boolean,
    provider: Provider | Web3Provider | any,
    chainId: ChainId
  ): Promise<Array<TradeV2 | undefined>> {
    const isExactIn = true

    // handle wavax<->avax wrap swaps
    const isWrapSwap =
      (isNativeIn && tokenOut.address === WNATIVE[chainId].address) ||
      (isNativeOut && tokenAmountIn.token.address === WNATIVE[chainId].address)

    if (isWrapSwap) {
      return []
    }

    const amountIn = tokenAmountIn.raw.toString()
    const quoterInterface = new utils.Interface(LBQuoterABI)
    const quoter = new Contract(
      LB_QUOTER_ADDRESS[chainId],
      quoterInterface,
      provider
    )

    const trades: Array<TradeV2 | undefined> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathFromAmountIn(
            routeStrArr,
            amountIn.toString()
          )
          const trade: TradeV2 = new TradeV2(
            route,
            tokenAmountIn.token,
            tokenOut,
            quote,
            isExactIn,
            isNativeIn,
            isNativeOut
          )
          return trade
        } catch (e) {
          console.debug('Error fetching quote:', e)
          return undefined
        }
      })
    )

    return trades.filter(
      (trade) =>
        !!trade && JSBI.greaterThan(trade.outputAmount.raw, JSBI.BigInt(0))
    )
  }

  /**
   * @static
   * Returns the list of trades, given a list of routes and a fixed amount of the output token
   *
   * @param {RouteV2[]} routes
   * @param {TokenAmount} tokenAmountOut
   * @param {Token} tokenIn
   * @param {boolean} isNativeIn
   * @param {boolean} isNativeOut
   * @param {Provider | Web3Provider | any} provider
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactOut(
    routes: RouteV2[],
    tokenAmountOut: TokenAmount,
    tokenIn: Token,
    isNativeIn: boolean,
    isNativeOut: boolean,
    provider: Provider | Web3Provider | any,
    chainId: ChainId
  ): Promise<Array<TradeV2 | undefined>> {
    const isExactIn = false

    // handle wavax<->avax wrap swaps
    const isWrapSwap =
      (isNativeIn &&
        tokenAmountOut.token.address === WNATIVE[chainId].address) ||
      (isNativeOut && tokenIn.address === WNATIVE[chainId].address)

    if (isWrapSwap) {
      return []
    }

    const amountOut = tokenAmountOut.raw.toString()
    const quoterInterface = new utils.Interface(LBQuoterABI)
    const quoter = new Contract(
      LB_QUOTER_ADDRESS[chainId],
      quoterInterface,
      provider
    )

    const trades: Array<TradeV2 | undefined> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathFromAmountOut(
            routeStrArr,
            amountOut
          )
          const trade: TradeV2 = new TradeV2(
            route,
            tokenIn,
            tokenAmountOut.token,
            quote,
            isExactIn,
            isNativeIn,
            isNativeOut
          )
          return trade
        } catch (e) {
          console.debug('Error fetching quote:', e)
          return undefined
        }
      })
    )

    return trades.filter(
      (trade) =>
        !!trade && JSBI.greaterThan(trade.inputAmount.raw, JSBI.BigInt(0))
    )
  }

  /**
   * @static
   * Returns the best trade
   *
   * @param {TradeV2[]} trades
   * @param {boolean} isExactIn
   * @returns {TradeV2}
   */
  public static chooseBestTrade(
    trades: TradeV2[],
    isExactIn: boolean
  ): TradeV2 | undefined {
    if (trades.length === 0) {
      return undefined
    }

    let bestTrade = trades[0]

    trades.forEach((trade) => {
      if (isExactIn) {
        if (
          JSBI.greaterThan(trade.outputAmount.raw, bestTrade.outputAmount.raw)
        ) {
          bestTrade = trade
        }
      } else {
        if (
          JSBI.greaterThan(trade.inputAmount.raw, JSBI.BigInt(0)) &&
          JSBI.lessThan(trade.inputAmount.raw, bestTrade.inputAmount.raw)
        ) {
          bestTrade = trade
        }
      }
    })
    return bestTrade
  }

  /**
   * Selects the best trade given trades and gas
   *
   * @param {TradeV2[]} trades
   * @param {BigNumber[]} estimatedGas
   * @returns {bestTrade: TradeV2, estimatedGas: BigNumber}
   */
  public static chooseBestTradeWithGas(
    trades: TradeV2[],
    estimatedGas: BigNumber[]
  ): {
    bestTrade: TradeV2
    estimatedGas: BigNumber
  } {
    const tradeType = trades[0].tradeType
    // The biggest tradeValueAVAX will be the most accurate
    // If we haven't found any equivalent of the trade in AVAX, we won't take gas cost into account
    const tradeValueAVAX = BigNumber.from(0)

    const tradesWithGas = trades.map((trade, index) => {
      return {
        trade: trade,
        estimatedGas: estimatedGas[index],
        swapOutcome:
          trade.tradeType === TradeType.EXACT_INPUT
            ? new Fraction(
                trade.outputAmount.numerator,
                trade.outputAmount.denominator
              ).subtract(
                tradeValueAVAX.eq(0)
                  ? BigInt(0)
                  : // Cross product to get the gas price against the output token
                    trade.outputAmount
                      .multiply(estimatedGas[index].toString())
                      .divide(tradeValueAVAX.toBigInt())
              )
            : new Fraction(
                trade.inputAmount.numerator,
                trade.inputAmount.denominator
              ).add(
                tradeValueAVAX.eq(0)
                  ? BigInt(0)
                  : trade.inputAmount
                      .multiply(estimatedGas[index].toString())
                      .divide(tradeValueAVAX.toBigInt())
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

  /**
   * Returns an object representing this trade for a readable cosole.log
   *
   * @returns {Object}
   */
  public toLog() {
    return {
      route: {
        path: this.route.path
          .map((token) => `${token.name}(${token.address})`)
          .join(', ')
      },
      tradeType:
        this.tradeType === TradeType.EXACT_INPUT
          ? 'EXACT_INPUT'
          : 'EXACT_OUTPUT',
      inputAmount: `${this.inputAmount.toSignificant(6)} ${
        this.inputAmount.currency.symbol
      }`,
      outputAmount: `${this.outputAmount.toSignificant(6)} ${
        this.outputAmount.currency.symbol
      }`,
      executionPrice: `${this.executionPrice.toSignificant(6)} ${
        this.outputAmount.currency.symbol
      } / ${this.inputAmount.currency.symbol}`,
      exactQuote: `${this.exactQuote.toSignificant(6)} ${
        this.exactQuote.currency.symbol
      }`,
      priceImpact: `${this.priceImpact.toSignificant(6)}%`,
      quote: {
        route: this.quote.route.join(', '),
        pairs: this.quote.pairs.join(', '),
        binSteps: this.quote.binSteps.map((el) => el.toString()).join(', '),
        amounts: this.quote.amounts.map((el) => el.toString()).join(', '),
        fees: this.quote.fees.map((el) => el.toString()).join(', '),
        virtualAmountsWithoutSlippage: this.quote.virtualAmountsWithoutSlippage
          .map((el) => el.toString())
          .join(', ')
      }
    }
  }
}
