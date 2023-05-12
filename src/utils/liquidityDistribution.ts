import { CurrencyAmount } from '@traderjoe-xyz/sdk'

import { spotUniform, curve, bidAsk } from '../constants'
import {
  LiquidityDistribution,
  LiquidityDistributionParams
} from '../types/pair'
import { parseEther } from 'viem'

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
  switch (distribution) {
    case LiquidityDistribution.SPOT:
      return spotUniform
    case LiquidityDistribution.CURVE:
      return curve
    case LiquidityDistribution.BID_ASK:
      return bidAsk
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
 * Returns normalized array, e.g. normalize so array sums to 1e18 within 1e5 precision
 * @param dist
 * @param sumTo
 * @param precision
 * @returns
 */
export const normalizeDist = (
  dist: bigint[],
  sumTo: bigint,
  precision: bigint
): bigint[] => {
  const sumDist = dist.reduce((sum, cur) => sum + cur, BigInt(0))
  if (sumDist === BigInt(0)) {
    return dist
  }
  const factor = (sumDist * precision) / sumTo
  const normalized = dist.map((d) => (d * precision) / factor)
  return normalized
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
    distributionX: _distributionX.map((el) =>
      parseDistributionValue(el, parsedAmountA.currency.decimals)
    ),
    distributionY: _distributionY.map((el) =>
      parseDistributionValue(el, parsedAmountB.currency.decimals)
    )
  }
}

/**
 * Returns Bid-Ask distribution params for custom bin range
 *
 * @param {number} activeId
 * @param {number[]} binRange
 * @param {CurrencyAmount[]} parsedAmounts
 * @returns
 */
export const getBidAskDistributionFromBinRange = (
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

    // dist = 2/R^2 * r
    const rSquare = Math.pow(deltaIds[0], 2)
    _distributionY = deltaIds.map((i) => ((i - 1) * -2) / rSquare)
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
    // dist = 2/R^2 * i
    const rSquare = Math.pow(deltaIds[deltaIds.length - 1], 2)
    _distributionX = deltaIds.map((i) => ((i + 1) * 2) / rSquare)
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

    // dist = 1/R^2 * i
    const rSquareX = Math.pow(positiveDeltaIds[positiveDeltaIds.length - 1], 2)
    _distributionX = [
      ...Array(negDelta).fill(0),
      1 / rSquareX,
      ...positiveDeltaIds.map((i) => (i + 1) / rSquareX)
    ]

    // dist = 1/R^2 * i
    const rSquareY = Math.pow(negativeDeltaIds[0], 2)
    _distributionY = [
      ...negativeDeltaIds.map((i) => (-1 * (i - 1)) / rSquareY),
      1 / rSquareY,
      ...Array(posDelta).fill(0)
    ]
  }

  // return
  return {
    deltaIds,
    distributionX: _distributionX.map((el) =>
      parseDistributionValue(el, parsedAmountA.currency.decimals)
    ),
    distributionY: _distributionY.map((el) =>
      parseDistributionValue(el, parsedAmountB.currency.decimals)
    )
  }
}

/**
 * Returns Curve distribution params for custom bin range
 *
 * @param {number} activeId
 * @param {number[]} binRange
 * @param {CurrencyAmount[]} parsedAmounts
 * @returns
 */
export const getCurveDistributionFromBinRange = (
  activeId: number,
  binRange: number[],
  parsedAmounts: CurrencyAmount[]
): LiquidityDistributionParams => {
  const [parsedAmountA, parsedAmountB] = parsedAmounts

  // init return values
  let deltaIds: number[] = [],
    _distributionX: number[] = [],
    _distributionY: number[] = []

  // get sigma based on radius R
  const getSigma = (_R: number) => {
    const factor =
      _R >= 20
        ? 2.0
        : _R >= 15
        ? 1.8
        : _R >= 10
        ? 1.7
        : _R >= 8
        ? 1.6
        : _R >= 6
        ? 1.5
        : _R >= 5
        ? 1.4
        : 1.0
    return _R / factor
  }

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

    // radius is num of bins
    const R = deltaIds.length - 1
    const sigma = getSigma(R)

    // A = 1 / (sigma  * sqrt(2 * pi))
    const A = 1 / (Math.sqrt(Math.PI * 2) * sigma)

    // dist = 2 * A * exp(-0.5 * (r /sigma) ^ 2)
    // r is distance from right-most bin
    _distributionY = deltaIds.map(
      (_, ind) => 2 * A * Math.exp(-0.5 * Math.pow((R - ind) / sigma, 2))
    )
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

    _distributionY = [...Array(deltaIds.length).fill(0)]

    // radius is num of bins
    const R = deltaIds.length - 1
    const sigma = getSigma(R)

    // A = 1 / (sigma  * sqrt(2 * pi))
    const A = 1 / (Math.sqrt(Math.PI * 2) * sigma)

    // dist = 2 * A * exp(-0.5 * (r /sigma) ^ 2)
    // r is distance from left-most bin
    _distributionX = deltaIds.map(
      (_, ind) => 2 * A * Math.exp(-0.5 * Math.pow(ind / sigma, 2))
    )
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

    // radius is num of bins
    const RX = positiveDeltaIds.length
    const sigmaX = getSigma(RX)

    // A = 1 / (sigma  * sqrt(2 * pi))
    const AX = 1 / (Math.sqrt(Math.PI * 2) * sigmaX)

    // dist = 2 * A * exp(-0.5 * (r /sigma) ^ 2)
    // r is distance from 0
    _distributionX = [
      ...Array(negDelta).fill(0),
      AX,
      ...positiveDeltaIds.map(
        (_, ind) => 2 * AX * Math.exp(-0.5 * Math.pow((ind + 1) / sigmaX, 2))
      )
    ]

    // radius is num of bins
    const RY = negativeDeltaIds.length
    const sigmaY = getSigma(RY)

    // A = 1 / (sigma  * sqrt(2 * pi))
    const AY = 1 / (Math.sqrt(Math.PI * 2) * sigmaY)

    // dist = 2 * A * exp(-0.5 * (r /sigma) ^ 2)
    // r is distance from 0
    _distributionY = [
      ...negativeDeltaIds.map(
        (_, ind) => 2 * AY * Math.exp(-0.5 * Math.pow((RY - ind) / sigmaY, 2))
      ),
      AY,
      ...Array(posDelta).fill(0)
    ]
  }

  // return
  return {
    deltaIds,
    distributionX: _distributionX.map((el) =>
      parseDistributionValue(el, parsedAmountA.currency.decimals)
    ),
    distributionY: _distributionY.map((el) =>
      parseDistributionValue(el, parsedAmountB.currency.decimals)
    )
  }
}

const parseDistributionValue = (value: number, decimals: number) => {
  return parseEther(`${parseFloat(value.toFixed(decimals))}`)
}
