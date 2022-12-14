import { parseEther } from 'ethers/lib/utils'
import { CurrencyAmount } from '@traderjoe-xyz/sdk'

import { spotUniform, maxUniform, bidAsk, normal } from '../constants'
import {
  LiquidityDistribution,
  LiquidityDistributionParams
} from '../types/pair'

/**
 * Returns distribution params for on-chain addLiquidity() call
 * 
 * @param {LiquidityDistribution} distribution 
 * @returns {LiquidityDistributionParams}
}
 */
export const getLiquidityConfig = (
  distribution: LiquidityDistribution
): LiquidityDistributionParams => {
  if (distribution === LiquidityDistribution.SPOT) {
    return spotUniform
  } else if (distribution === LiquidityDistribution.MAX) {
    return maxUniform
  } else if (distribution === LiquidityDistribution.BID_ASK) {
    return bidAsk
  } else {
    return normal
  }
}

/**
 * Returns distribution params for on-chain addLiquidity() call when liquidity is focused at a target bin
 * @param {number} activeId
 * @param {number} targetBin
 * @returns {LiquidityDistributionParams}
 */
export const getDistributionFromTargetBin = (
  activeId: number,
  targetBin: number
): LiquidityDistributionParams => {
  return {
    deltaIds: [targetBin - activeId],
    distributionX:
      targetBin >= activeId ? [parseEther('1')] : [parseEther('0')],
    distributionY: targetBin <= activeId ? [parseEther('1')] : [parseEther('0')]
  }
}

/**
 * Returns distribution params for on-chain addLiquidity() call when liquidity is focused at a custom range of bins
 *
 * @param {number} activeId
 * @param {number[]} binRange
 * @param {CurrencyAmount[]} parsedAmounts
 * @returns
 */
export const getUniformDistributionFromBinRange = (
  activeId: number,
  binRange: number[],
  parsedAmounts: CurrencyAmount[]
): LiquidityDistributionParams => {
  const [parsedAmountA, parsedAmountB] = parsedAmounts

  // init return values
  let deltaIds: number[] = [],
    _distributionX: number[] = [],
    _distributionY: number[] = []

  // range only includes B tokens (Y tokens)
  if (binRange[1] <= activeId && parsedAmountA.raw.toString() === '0') {
    const negDelta = binRange[1] - binRange[0] + 1
    const negativeDeltaIds = Array.from(Array(activeId - binRange[0]).keys())
      .reverse()
      .slice(0, negDelta)
      .map((el) => -1 * (el + 1))

    deltaIds = [...negativeDeltaIds]
    if (activeId === binRange[1]) {
      deltaIds.push(0)
    }

    _distributionX = [...Array(deltaIds.length).fill(0)]
    _distributionY = [...Array(negDelta).fill(1 / negDelta)]
  }

  // range only includes A tokens (X tokens)
  else if (activeId <= binRange[0] && parsedAmountB.raw.toString() === '0') {
    const posDelta = binRange[1] - binRange[0] + 1
    const positiveDeltaIds = Array.from(Array(binRange[1] - activeId).keys())
      .reverse()
      .slice(0, posDelta)
      .reverse()
      .map((el) => el + 1)

    deltaIds = [...positiveDeltaIds]
    if (activeId === binRange[0]) {
      deltaIds.unshift(0)
    }

    _distributionX = [...Array(posDelta).fill(1 / posDelta)]
    _distributionY = [...Array(deltaIds.length).fill(0)]
  }

  // range includes both X and Y tokens
  else {
    const negDelta = activeId - binRange[0]
    const posDelta = binRange[1] - activeId

    const negativeDeltaIds = Array.from(Array(negDelta).keys())
      .reverse()
      .map((el) => -1 * (el + 1))
    const positiveDeltaIds = Array.from(Array(posDelta).keys()).map(
      (el) => el + 1
    )
    deltaIds = [...negativeDeltaIds, 0, ...positiveDeltaIds]

    const posPctPerBin = 1 / (0.5 + posDelta)
    const negPctPerBin = 1 / (0.5 + negDelta)
    _distributionX = [
      ...Array(negDelta).fill(0),
      posPctPerBin / 2,
      ...Array(posDelta).fill(posPctPerBin)
    ]
    _distributionY = [
      ...Array(negDelta).fill(negPctPerBin),
      negPctPerBin / 2,
      ...Array(posDelta).fill(0)
    ]
  }

  // return
  return {
    deltaIds,
    distributionX: _distributionX.map((el) => parseEther(el.toString())),
    distributionY: _distributionY.map((el) => parseEther(el.toString()))
  }
}
