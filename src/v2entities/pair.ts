import flatMap from 'lodash.flatmap'
import JSBI from 'jsbi'
import {
  Token,
  Percent,
  TokenAmount,
  Fraction,
  ChainId
} from '@traderjoe-xyz/sdk'

import {
  LBPair,
  LBPairReservesAndId,
  LBPairFeeParameters,
  LiquidityDistribution,
  BinReserves
} from '../types'
import { LB_FACTORY_ADDRESS, LB_FACTORY_V21_ADDRESS, ONE } from '../constants'
import { Bin } from './bin'
import { getLiquidityConfig } from '../utils'

import {
  LBFactoryABI,
  LBFactoryV21ABI,
  LBPairABI,
  LBPairV21ABI
} from '../abis/ts'
import { Hex, PublicClient, getAddress } from 'viem'

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
   * @param {boolean} isV21
   * @param {PublicClient} publicClient
   * @param {ChainId} chainId
   * @returns {Promise<LBPair[]>}
   */
  public async fetchAvailableLBPairs(
    isV21: boolean,
    publicClient: PublicClient,
    chainId: ChainId
  ): Promise<readonly LBPair[]> {
    const args = [
      getAddress(this.token0.address),
      getAddress(this.token1.address)
    ] as const

    return isV21
      ? await publicClient.readContract({
          abi: LBFactoryV21ABI,
          address: LB_FACTORY_V21_ADDRESS[chainId],
          functionName: 'getAllLBPairs',
          args
        })
      : await publicClient.readContract({
          abi: LBFactoryABI,
          address: LB_FACTORY_ADDRESS[chainId],
          functionName: 'getAllLBPairs',
          args
        })
  }

  /**
   * Fetches LBPair for token0, token1, and given binStep
   *
   * @param {number} binStep
   * @param {boolean} isV21
   * @param {PublicClient} publicClient
   * @param {ChainId} chainId
   * @returns {Promise<LBPair>}
   */
  public async fetchLBPair(
    binStep: number,
    isV21: boolean,
    publicClient: PublicClient,
    chainId: ChainId
  ): Promise<LBPair> {
    const args = [
      getAddress(this.token0.address),
      getAddress(this.token1.address),
      BigInt(binStep)
    ] as const

    let lbPair: LBPair
    if (isV21) {
      lbPair = await publicClient.readContract({
        abi: LBFactoryV21ABI,
        address: LB_FACTORY_V21_ADDRESS[chainId],
        functionName: 'getLBPairInformation',
        args
      })
    } else {
      lbPair = await publicClient.readContract({
        abi: LBFactoryABI,
        address: LB_FACTORY_ADDRESS[chainId],
        functionName: 'getLBPairInformation',
        args
      })
    }

    return lbPair
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
   * @param {Hex} LBPairAddr
   * @param {boolean} isV21
   * @param {PublicClient} publicClient
   * @returns {Promise<LBPairReservesAndId>}
   */
  public static async getLBPairReservesAndId(
    LBPairAddr: Hex,
    isV21: boolean,
    publicClient: PublicClient
  ): Promise<LBPairReservesAndId> {
    if (isV21) {
      const [reserveX, reserveY] = await publicClient.readContract({
        abi: LBPairV21ABI,
        address: LBPairAddr,
        functionName: 'getReserves'
      })
      const activeId = await publicClient.readContract({
        abi: LBPairV21ABI,
        address: LBPairAddr,
        functionName: 'getActiveId'
      })

      return {
        reserveX,
        reserveY,
        activeId
      }
    }

    const [reserveX, reserveY, activeId] = await publicClient.readContract({
      abi: LBPairABI,
      address: LBPairAddr,
      functionName: 'getReservesAndId'
    })

    return {
      reserveX,
      reserveY,
      activeId: Number(activeId)
    }
  }

  /**
   * Fetches the fee parameters for the LBPair
   *
   * @param {Hex} LBPairAddr
   * @param {PublicClient} publicClient
   * @returns {Promise<LBPairFeeParameters>}
   */
  public static async getFeeParameters(
    LBPairAddr: Hex,
    publicClient: PublicClient
  ): Promise<LBPairFeeParameters> {
    return publicClient.readContract({
      abi: LBPairABI,
      address: LBPairAddr,
      functionName: 'feeParameters'
    })
  }

  /**
   * Calculate amountX and amountY
   *
   * @param {number[]} binIds
   * @param {number[]} activeBin
   * @param {BinReserves[]} bins
   * @param {bigint[]} totalSupplies
   * @param {string[]} liquidity
   * @returns
   */
  public static calculateAmounts(
    binIds: number[],
    activeBin: number,
    bins: BinReserves[],
    totalSupplies: bigint[],
    liquidity: string[]
  ): {
    amountX: JSBI
    amountY: JSBI
  } {
    // calculate expected total to remove for X and Y
    let totalAmountX = JSBI.BigInt(0)
    let totalAmountY = JSBI.BigInt(0)

    binIds.forEach((binId, i) => {
      // get totalSupply, reserveX, and reserveY for the bin
      const { reserveX: _reserveX, reserveY: _reserveY } = bins[i]
      const reserveX = JSBI.BigInt(_reserveX.toString())
      const reserveY = JSBI.BigInt(_reserveY.toString())
      const totalSupply = JSBI.BigInt(totalSupplies[i].toString())
      const liquidityAmount = JSBI.BigInt(liquidity[i])

      // increment totalAmountX and/or totalAmountY
      if (binId <= activeBin) {
        const amountY = JSBI.divide(
          JSBI.multiply(liquidityAmount, reserveY),
          totalSupply
        )
        totalAmountY = JSBI.add(amountY, totalAmountY)
      }

      if (binId >= activeBin) {
        const amountX = JSBI.divide(
          JSBI.multiply(liquidityAmount, reserveX),
          totalSupply
        )
        totalAmountX = JSBI.add(amountX, totalAmountX)
      }
    })

    return {
      amountX: totalAmountX,
      amountY: totalAmountY
    }
  }

  /**
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
  ): {
    tokenX: Token
    tokenY: Token
    amountX: string
    amountY: string
    amountXMin: string
    amountYMin: string
    idSlippage: number
    deltaIds: number[]
    distributionX: bigint[]
    distributionY: bigint[]
  } {
    const token0isX = token0Amount.token.sortsBefore(token1Amount.token)
    const tokenX = token0isX ? token0Amount.token : token1Amount.token
    const tokenY = token0isX ? token1Amount.token : token0Amount.token
    const _amountX: JSBI = token0isX ? token0Amount.raw : token1Amount.raw
    const _amountY: JSBI = token0isX ? token1Amount.raw : token0Amount.raw

    const amountX: string = _amountX.toString()
    const amountY: string = _amountY.toString()
    const amountXMin = new Fraction(ONE)
      .add(amountSlippage)
      .invert()
      .multiply(_amountX)
      .quotient.toString()
    const amountYMin = new Fraction(ONE)
      .add(amountSlippage)
      .invert()
      .multiply(_amountY)
      .quotient.toString()

    const _priceSlippage: number = Number(priceSlippage.toSignificant()) / 100
    const idSlippage = Bin.getIdSlippageFromPriceSlippage(
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
   * Calculates amountX, amountY, amountXMin, and amountYMin needed for on-chain removeLiquidity() method
   *
   * @param {number[]} userPositionIds - List of binIds that user has position
   * @param {number} activeBin - The active bin id for the LBPair
   * @param {Bin[]} bins - List of bins whose indices match those of userPositionIds
   * @param {BigNumber[]} totalSupplies - List of bin's total supplies whose indices match those of userPositionIds
   * @param {string[]} amountsToRemove - List of amounts specified by the user to remove in each of their position
   * @param {Percent} amountSlippage - The amounts slippage used to calculate amountXMin and amountYMin
   * @returns
   */
  public calculateAmountsToRemove(
    userPositionIds: number[],
    activeBin: number,
    bins: BinReserves[],
    totalSupplies: bigint[],
    amountsToRemove: string[],
    amountSlippage: Percent
  ): {
    amountX: JSBI
    amountY: JSBI
    amountXMin: JSBI
    amountYMin: JSBI
  } {
    // calculate expected total to remove for X and Y
    const { amountX, amountY } = PairV2.calculateAmounts(
      userPositionIds,
      activeBin,
      bins,
      totalSupplies,
      amountsToRemove
    )

    // compute min amounts taking into consideration slippage
    const amountXMin = new Fraction(ONE)
      .add(amountSlippage)
      .invert()
      .multiply(amountX).quotient

    const amountYMin = new Fraction(ONE)
      .add(amountSlippage)
      .invert()
      .multiply(amountY).quotient

    // return
    return {
      amountX,
      amountY,
      amountXMin,
      amountYMin
    }
  }
}
