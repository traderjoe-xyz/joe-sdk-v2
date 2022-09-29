import { Contract, utils, Signer, Wallet, BigNumber } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { Web3Provider } from '@ethersproject/providers'
import {
  Token,
  CAVAX,
  TokenAmount,
  Price,
  Percent,
  Fraction,
  CurrencyAmount,
  TradeType,
  ChainId
} from '@traderjoe-xyz/sdk'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { PairV2 } from './pair'
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

import LBQuoterABI from '../abis/LBQuoter.json'
import LBRouterABI from '../abis/LBRouter.json'

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

  public constructor(
    route: RouteV2,
    tokenIn: Token,
    tokenOut: Token,
    quote: Quote,
    isExactIn: boolean
  ) {
    const inputAmount = new TokenAmount(
      tokenIn,
      JSBI.BigInt(quote.amounts[0].toString())
    )
    const outputAmount = new TokenAmount(
      tokenOut,
      JSBI.BigInt(quote.amounts[quote.amounts.length - 1])
    )

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
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(slippageTolerance)
        .multiply(this.inputAmount.raw).quotient
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
  public swapCallParameters(
    options: TradeOptions | TradeOptionsDeadline
  ): SwapParameters {
    const avaxIn = this.inputAmount.currency === CAVAX
    const avaxOut = this.outputAmount.currency === CAVAX
    // the router does not support both avax in and out
    invariant(!(avaxIn && avaxOut), 'AVAX_IN_OUT')
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

  public async getTradeFee(
    provider: Provider | Web3Provider | any
  ): Promise<TradeFee> {
    const ONE_HUNDRED_PERCENT = new Percent(
      JSBI.BigInt(10000),
      JSBI.BigInt(10000)
    )

    // get fees for each pair in the trade route
    const fees: Fraction[] = await Promise.all(
      this.quote.pairs.map((pairAddr, i) => {
        const binStep = this.quote.binSteps[i].toNumber()
        return PairV2.getPairFee(pairAddr, binStep, provider)
      })
    )

    // get realized fee
    // e.g. for 2 pairs X an Y: 1 - ((1 - feeX%) * (1 - feeY%))
    const realizedLPFee = ONE_HUNDRED_PERCENT.subtract(
      fees.reduce(
        (feeSofar: Fraction, currentFee: Fraction) =>
          feeSofar.multiply(ONE_HUNDRED_PERCENT.subtract(currentFee)),
        ONE_HUNDRED_PERCENT
      )
    )

    // get fee % and amount of the input that accrues to LPs
    const totalFeePct = new Percent(
      realizedLPFee.numerator,
      realizedLPFee.denominator
    )

    const feeAmountIn = new TokenAmount(
      this.inputAmount.token,
      totalFeePct.multiply(this.inputAmount.raw).quotient
    )

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
    const routerInterface = new utils.Interface(LBRouterABI.abi)
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
   * Returns an object representing this trade for a readable cosole.log
   *
   * @returns {Object}
   */
  public toLog() {
    return {
      route: {
        path: this.route.path.map((token) => token.address).join(', ')
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
        virtualAmountsWithoutSlippage: this.quote.virtualAmountsWithoutSlippage
          .map((el) => el.toString())
          .join(', ')
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
   * @param {Provider | Web3Provider | any} provider
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactIn(
    routes: RouteV2[],
    tokenAmountIn: TokenAmount,
    tokenOut: Token,
    provider: Provider | Web3Provider | any,
    chainId: ChainId
  ): Promise<Array<TradeV2 | undefined>> {
    const isExactIn = true
    const amountIn = JSBI.toNumber(tokenAmountIn.raw)
    console.debug('amountIn', amountIn)
    const quoterInterface = new utils.Interface(LBQuoterABI.abi)
    const quoter = new Contract(
      LB_QUOTER_ADDRESS[chainId],
      quoterInterface,
      provider
    )

    const trades: Array<TradeV2 | undefined> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathAmountIn(
            routeStrArr,
            amountIn.toString()
          )
          const trade: TradeV2 = new TradeV2(
            route,
            tokenAmountIn.token,
            tokenOut,
            quote,
            isExactIn
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
   * @param {Provider | Web3Provider | any} provider
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactOut(
    routes: RouteV2[],
    tokenAmountOut: TokenAmount,
    tokenIn: Token,
    provider: Provider | Web3Provider | any,
    chainId: ChainId
  ): Promise<Array<TradeV2 | undefined>> {
    const isExactIn = false
    const amountOut = JSBI.toNumber(tokenAmountOut.raw)
    const quoterInterface = new utils.Interface(LBQuoterABI.abi)
    const quoter = new Contract(
      LB_QUOTER_ADDRESS[chainId],
      quoterInterface,
      provider
    )

    const trades: Array<TradeV2 | undefined> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathAmountOut(
            routeStrArr,
            amountOut
          )
          const trade: TradeV2 = new TradeV2(
            route,
            tokenIn,
            tokenAmountOut.token,
            quote,
            isExactIn
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
}
