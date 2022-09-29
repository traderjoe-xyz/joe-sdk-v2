import { BigNumber, Contract, utils } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { Web3Provider } from '@ethersproject/providers'
import flatMap from 'lodash.flatmap'
import JSBI from 'jsbi'
import { Token, Percent, TokenAmount, Fraction } from '@traderjoe-xyz/sdk'

import {
  LBPair,
  LBPairReservesAndId,
  LBPairFeeParameters,
  LBPairFeePercent,
  LiquidityDistribution,
  Bin
} from '../types'
import { ChainId, LB_FACTORY_ADDRESS, ONE } from '../constants'
import { getLiquidityConfig } from '../utils'

import LBFactoryABI from '../abis/LBFactory.json'
import LBPairABI from '../abis/LBPair.json'

/** Class representing a pair of tokens. */
export class PairV2 {
  public readonly token0: Token
  public readonly token1: Token

  public constructor(tokenA: Token, tokenB: Token) {
    if (tokenA.sortsBefore(tokenB)) {
      this.token0 = tokenA
      this.token1 = tokenB
    } else {
      this.token0 = tokenB
      this.token1 = tokenA
    }
  }

  /**
   * Returns all available LBPairs for this pair
   *
   * @param {Provider} provider
   * @param {ChainId} chainId
   * @returns {Promise<LBPair[]>}
   */
  public async fetchAvailableLBPairs(
    provider: Provider,
    chainId: ChainId
  ): Promise<LBPair[]> {
    const factoryInterface = new utils.Interface(LBFactoryABI.abi)
    const factory = new Contract(
      LB_FACTORY_ADDRESS[chainId],
      factoryInterface,
      provider
    )
    const LBPairs: LBPair[] = await factory.getAvailableLBPairsBinStep(
      this.token0.address,
      this.token1.address
    )
    return LBPairs
  }

  /**
   * Fetches LBPair for token0, token1, and given binStep
   *
   * @param {number} binStep
   * @param {Provider} provider
   * @param {ChainId} chainId
   * @returns {Promise<LBPair>}
   */
  public async fetchLBPair(
    binStep: number,
    provider: Provider,
    chainId: ChainId
  ): Promise<LBPair> {
    const factoryInterface = new utils.Interface(LBFactoryABI.abi)
    const factory = new Contract(
      LB_FACTORY_ADDRESS[chainId],
      factoryInterface,
      provider
    )
    const LBPair: LBPair = await factory.getLBPairInfo(
      this.token0.address,
      this.token1.address,
      binStep
    )
    return LBPair
  }

  /**
   * Checks whether this pair equals to that provided in the param
   *
   * @param {PairV2} pair
   * @returns {boolean} true if equal, otherwise false
   */
  public equals(pair: PairV2) {
    if (
      this.token0.address === pair.token0.address &&
      this.token1.address === pair.token1.address
    ) {
      return true
    }
    return false
  }

  /**
   * @static
   * Returns all possible combination of token pairs
   *
   * @param {Token} inputToken
   * @param {Token} outputToken
   * @param {Token[]} bases
   * @returns {[Token, Token][]}
   */
  public static createAllTokenPairs(
    inputToken: Token,
    outputToken: Token,
    bases: Token[]
  ): [Token, Token][] {
    const basePairs = flatMap(bases, (base: Token) =>
      bases.map((otherBase) => [base, otherBase])
    ).filter(([t0, t1]) => t0.address !== t1.address)

    const allTokenPairs: [Token, Token][] = [
      // the direct pair
      [inputToken, outputToken],
      // token A against all bases
      ...bases.map((base: Token) => [inputToken, base]),
      // token B against all bases
      ...bases.map((base: Token) => [outputToken, base]),
      // each base against all bases
      ...basePairs
    ]
      .filter((tokens): tokens is [Token, Token] =>
        Boolean(tokens[0] && tokens[1])
      )
      .filter(([t0, t1]) => t0.address !== t1.address)

    return allTokenPairs
  }

  /**
   * @static
   * Returns the initialized pairs given a list of token pairs
   *
   * @param {[Token, Token][]} tokenPairs
   * @returns {PairV2[]}
   */
  public static initPairs(tokenPairs: [Token, Token][]): PairV2[] {
    const allPairs = tokenPairs.map((tokenPair: Token[]) => {
      return new PairV2(tokenPair[0], tokenPair[1])
    })

    const uniquePairs: PairV2[] = []
    allPairs.forEach((pair: PairV2) => {
      if (!uniquePairs.some((pair2: PairV2) => pair.equals(pair2))) {
        uniquePairs.push(pair)
      }
    })

    return uniquePairs
  }

  /**
   * Fetches the reserves active bin id for the LBPair
   *
   * @param {string} LBPairAddr
   * @param {Provider} provider
   * @returns {Promise<LBPairReservesAndId>}
   */
  public static async getLBPairReservesAndId(
    LBPairAddr: string,
    provider: Provider
  ): Promise<LBPairReservesAndId> {
    const LBPairInterface = new utils.Interface(LBPairABI.abi)
    const pairContract = new Contract(LBPairAddr, LBPairInterface, provider)

    const pairData: LBPairReservesAndId = await pairContract.getReservesAndId()

    return pairData
  }

  /**
   *
   * @param {string} pairAddr
   * @param {Provider} binStep
   * @param provider
   */
  public static async getPairFee(
    pairAddr: string,
    binStep: number,
    provider: Provider | Web3Provider | any
  ): Promise<Fraction> {
    // if v1 pair, return base fee 0.3%
    if (binStep === 0) {
      return new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
    }

    // for v2 LBPair, fetch and calculate fee %
    const feeParams = await PairV2.getFeeParameters(pairAddr, provider)
    const { baseFeePct, variableFeePct } =
      PairV2.calculateFeePercentage(feeParams)
    const totalFeeFraction = baseFeePct.add(variableFeePct)
    const totalFeePct = new Percent(
      totalFeeFraction.numerator,
      totalFeeFraction.denominator
    )
    return totalFeePct
  }

  /**
   * Fetches the fee parameters for the LBPair
   *
   * @param {string} LBPairAddr
   * @param {Provider} provider
   * @returns {Promise<LBPairFeeParameters>}
   */
  public static async getFeeParameters(
    LBPairAddr: string,
    provider: Provider | Web3Provider | any
  ): Promise<LBPairFeeParameters> {
    const LBPairInterface = new utils.Interface(LBPairABI.abi)
    const pairContract = new Contract(LBPairAddr, LBPairInterface, provider)

    const feeParametersData: LBPairFeeParameters =
      await pairContract.feeParameters()

    return feeParametersData
  }

  /**
   * Calculates LBPairFee percetange
   *
   * @param {LBPairFeeParameters} LBPairFeeData
   * @returns {LBPairFeePercent}
   */
  public static calculateFeePercentage(
    LBPairFeeData: LBPairFeeParameters
  ): LBPairFeePercent {
    const { baseFactor, variableFeeControl, volatilityAccumulated, binStep } =
      LBPairFeeData
    const baseFee = baseFactor * binStep * 1e10
    const variableFee =
      variableFeeControl === 0
        ? 0
        : (((volatilityAccumulated * binStep) ^ 2) * variableFeeControl) / 100
    return {
      baseFeePct: new Percent(BigInt(baseFee), BigInt(1e18)), // On the contract level, fees are with a 1e18 precision
      variableFeePct: new Percent(BigInt(Math.floor(variableFee)), BigInt(1e18))
    }
  }

  /**
   * @static
   * Returns the price of bin given its id and the bin step
   *
   * @param {number} id - The bin id
   * @param {number} binStep
   * @returns {number}
   */
  public static getPriceFromId(id: number, binStep: number): number {
    return (1 + binStep / 10_000) ** (id - 8388608)
  }

  /**
   * @static
   * Returns the bin id given its price and the bin step
   *
   * @param {number} price - The price of the bin
   * @param {number} binStep
   * @returns {number}
   */
  public static getIdFromPrice(price: number, binStep: number): number {
    return (
      Math.floor(Math.log(price) / Math.log(1 + binStep / 10_000)) + 8388608
    )
  }

  /**
   * @static
   * Returns idSlippage given slippage tolerance and the bin step
   *
   * @param {number} priceSlippage
   * @param {number} binStep
   * @returns {number}
   */
  public static getIdSlippageFromPriceSlippage(
    priceSlippage: number,
    binStep: number
  ): number {
    return Math.floor(
      Math.log(1 + priceSlippage) / Math.log(1 + binStep / 10_000)
    )
  }

  /**
   * @static
   * Returns the amount and distribution args for on-chain addLiquidity() method
   *
   * @param binStep
   * @param token0Amount
   * @param token1Amount
   * @param amountSlippage
   * @param priceSlippage
   * @param liquidityDistribution
   * @returns
   */
  public addLiquidityParameters(
    binStep: number,
    token0Amount: TokenAmount,
    token1Amount: TokenAmount,
    amountSlippage: Percent,
    priceSlippage: Percent,
    liquidityDistribution: LiquidityDistribution
  ) {
    const token0isX = token0Amount.token.sortsBefore(token1Amount.token)
    const tokenX = token0isX ? token0Amount.token : token1Amount.token
    const tokenY = token0isX ? token1Amount.token : token0Amount.token
    const _amountX: JSBI = token0isX ? token0Amount.raw : token1Amount.raw
    const _amountY: JSBI = token0isX ? token1Amount.raw : token0Amount.raw
    const amountX: number = JSBI.toNumber(_amountX)
    const amountY: number = JSBI.toNumber(_amountY)
    const amountXMin = JSBI.toNumber(
      new Fraction(ONE).add(amountSlippage).invert().multiply(_amountX).quotient
    )
    const amountYMin = JSBI.toNumber(
      new Fraction(ONE).add(amountSlippage).invert().multiply(_amountY).quotient
    )

    const _priceSlippage: number = Number(priceSlippage.toSignificant()) / 100
    const idSlippage = PairV2.getIdSlippageFromPriceSlippage(
      _priceSlippage,
      binStep
    )

    const { deltaIds, distributionX, distributionY } = getLiquidityConfig(
      liquidityDistribution
    )

    return {
      tokenX,
      tokenY,
      amountX,
      amountY,
      amountXMin,
      amountYMin,
      idSlippage,
      deltaIds,
      distributionX,
      distributionY
    }
  }

  /**
   * @static
   * Calculates amountX, amountY, amountXMin, and amountYMin needed for on-chain removeLiquidity() method
   *
   * @param {number[]} userPositionIds - List of binIds that user has position
   * @param {number} activeBin - The active bin id for the LBPair
   * @param {Bin[]} bins - List of bins whose indices match those of userPositionIds
   * @param {BigNumber[]} totalSupplies - List of bin's total supplies whose indices match those of userPositionIds
   * @param {number[]} amountsToRemove - List of amounts specified by the user to remove in each of their position
   * @param {Percent} amountSlippage - The amounts slippage used to calculate amountXMin and amountYMin
   * @returns
   */
  public calculateAmountsToRemove(
    userPositionIds: number[],
    activeBin: number,
    bins: Bin[],
    totalSupplies: BigNumber[],
    amountsToRemove: number[],
    amountSlippage: Percent
  ): {
    amountX: JSBI
    amountY: JSBI
    amountXMin: JSBI
    amountYMin: JSBI
  } {
    // calculate expected total to remove for X and Y
    let totalAmountX = JSBI.BigInt(0)
    let totalAmountY = JSBI.BigInt(0)

    userPositionIds.forEach((binId, i) => {
      // get totalSupply, reserveX, and reserveY for the bin
      const { reserveX: _reserveX, reserveY: _reserveY } = bins[i]
      const reserveX = JSBI.BigInt(_reserveX.toString())
      const reserveY = JSBI.BigInt(_reserveY.toString())
      const totalSupply = JSBI.BigInt(totalSupplies[i].toString())
      const amountToRemove = JSBI.BigInt(amountsToRemove[i])

      // increment totalAmountX and/or totalAmountY
      if (binId <= activeBin) {
        const amountY = JSBI.divide(
          JSBI.multiply(amountToRemove, reserveY),
          totalSupply
        )
        totalAmountY = JSBI.add(amountY, totalAmountY)
      }

      if (binId >= activeBin) {
        const amountX = JSBI.divide(
          JSBI.multiply(amountToRemove, reserveX),
          totalSupply
        )
        totalAmountX = JSBI.add(amountX, totalAmountX)
      }
    })

    // compute min amounts taking into consideration slippage
    const amountXMin = new Fraction(ONE)
      .add(amountSlippage)
      .invert()
      .multiply(totalAmountX).quotient

    const amountYMin = new Fraction(ONE)
      .add(amountSlippage)
      .invert()
      .multiply(totalAmountY).quotient

    // return
    return {
      amountX: totalAmountX,
      amountY: totalAmountY,
      amountXMin: amountXMin,
      amountYMin: amountYMin
    }
  }
}
