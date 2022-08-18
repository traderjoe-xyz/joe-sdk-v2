import { BigNumberish, Contract, utils } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { Provider } from '@ethersproject/abstract-provider'
import flatMap from 'lodash.flatmap'
import JSBI from 'jsbi'

import { Token } from './token'
import { Percent, TokenAmount, Fraction } from './fractions'
import { ChainId, LB_FACTORY_ADDRESS, ONE } from '../constants'
import { LBPair, LBPairReservesAndId, LiquidityDistribution, RemoveLiquidityOptions } from '../types'

import LBFactoryABI from '../abis/LBFactory.json'
import LBPairABI from '../abis/LBPair.json'

/** Class representing a pair. */
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
  public async fetchAvailableLBPairs(provider: Provider, chainId: ChainId): Promise<LBPair[]> {
    const factoryInterface = new utils.Interface(LBFactoryABI.abi)
    const factory = new Contract(LB_FACTORY_ADDRESS[chainId], factoryInterface, provider)
    const LBPairs: LBPair[] = await factory.getAvailableLBPairsBinStep(this.token0.address, this.token1.address)
    return LBPairs
  }

  /**
   * Checks whether this pair equals to that provided in the param
   *
   * @param {PairV2} pair
   * @returns {boolean} true if equal, otherwise false
   */
  public equals(pair: PairV2) {
    if (this.token0.address === pair.token0.address && this.token1.address === pair.token1.address) {
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
  public static createAllTokenPairs(inputToken: Token, outputToken: Token, bases: Token[]): [Token, Token][] {
    const basePairs = flatMap(bases, (base: Token) => bases.map((otherBase) => [base, otherBase])).filter(
      ([t0, t1]) => t0.address !== t1.address
    )

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
      .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
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
  public static fetchAndInitPairs(tokenPairs: [Token, Token][]): PairV2[] {
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
  public static async getLBPairReservesAndId(LBPairAddr: string, provider: Provider): Promise<LBPairReservesAndId> {
    const LBPairInterface = new utils.Interface(LBPairABI.abi)
    const pairContract = new Contract(LBPairAddr, LBPairInterface, provider)

    const pairData: LBPairReservesAndId = await pairContract.getReservesAndId()

    return pairData
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
    return (1 + binStep / 20_000) ** (id - 8388608)
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
    return Math.floor(Math.log(price) / Math.log(1 + binStep / 20_000)) + 8388608
  }

  /**
   * @static
   * Returns idSlippage given slippage tolerance and the bin step
   *
   * @param {number} priceSlippage
   * @param {number} binStep
   * @returns {number}
   */
  public static getIdSlippageFromPriceSlippage(priceSlippage: number, binStep: number): number {
    return Math.floor(Math.log(1 + priceSlippage) / Math.log(1 + binStep / 20_000))
  }

  /**
   * @static
   * Returns the amount and distribution args for on-chain addLiquidity() method
   *
   * @param binStep
   * @param activeId
   * @param token0Amount
   * @param token1Amount
   * @param amountSlippage
   * @param priceSlippage
   * @param priceRange
   * @param liquidityDistribution
   * @returns
   */
  public addLiquidityParameters(
    binStep: number,
    activeId: number,
    token0Amount: TokenAmount,
    token1Amount: TokenAmount,
    amountSlippage: Percent,
    priceSlippage: Percent,
    priceRange: [number, number], // 1e18 basis
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
      new Fraction(ONE)
        .add(amountSlippage)
        .invert()
        .multiply(_amountX).quotient
    )
    const amountYMin = JSBI.toNumber(
      new Fraction(ONE)
        .add(amountSlippage)
        .invert()
        .multiply(_amountY).quotient
    )

    const _priceSlippage: number = Number(priceSlippage.toSignificant()) / 100
    const idSlippage = PairV2.getIdSlippageFromPriceSlippage(_priceSlippage, binStep)

    let deltaIds = [-2, 0, 2]
    let distributionX = [0, parseEther('0.5'), parseEther('0.5')]
    let distributionY = [parseEther('0.5'), parseEther('0.5'), 0]

    // TODO: set deltaIds distributionX and distributionY
    if (liquidityDistribution === LiquidityDistribution.FLAT) {
      // use activeId to get active price
      console.debug('activeId', PairV2.getPriceFromId(activeId, binStep))

      // use priceRange and active price to generate deltaIds
      console.debug('priceRange', priceRange)

      // then set distributionX and distributionY using detaIds and liquidityDistribution shape
    }

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
   * Returns _amountXMin, _amountXYMin and amountsToRemove (optionally), which are args for on-chain removeLiquidity() method
   *
   * @param userPositionIds
   * @param userPositions
   * @param {RemoveLiquidityOptions} [removeOptions]
   */
  public removeLiquidityParameters(
    userPositionIds: number[],
    userPositions: number[],
    removeOptions?: RemoveLiquidityOptions
  ): {
    amountXMin: BigNumberish
    amountYMin: BigNumberish
    amountsToRemove?: number[]
  } {
    console.debug('userPositionIds', userPositionIds)

    // TODO: calculate expected total to remove for X and Y
    let amountXMin = 0
    let amountYMin = 0

    // TODO: if removeOptions is passed in, calculate amountsToRemove for each userPositions
    let amountsToRemove: number[] = []
    if (removeOptions === RemoveLiquidityOptions.ALL) {
      amountsToRemove = [...userPositions]
    } else if (removeOptions === RemoveLiquidityOptions.HALF_EQUAL) {
      amountsToRemove = userPositions.map((l) => Math.floor(l / 2))
    }

    return {
      amountXMin,
      amountYMin,
      ...(amountsToRemove.length > 0 && {
        amountsToRemove
      })
    }
  }
}
