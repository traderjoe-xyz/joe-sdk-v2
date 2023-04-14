import { Percent } from '@traderjoe-xyz/sdk'
import { BigNumber, BigNumberish } from 'ethers'

export interface LBPair {
  binStep: BigNumberish
  LBPair: string
  createdByOwner: boolean
  isBlacklisted: boolean
}

export interface LBPairReservesAndId {
  reserveX: BigNumberish
  reserveY: BigNumberish
  activeId: BigNumberish
}

export interface LBPairFeeParameters {
  binStep: number
  baseFactor: number
  filterPeriod: number
  decayPeriod: number
  reductionFactor: number
  variableFeeControl: number
  protocolShare: number
  maxVolatilityAccumulated: number
  volatilityAccumulated: number
  volatilityReference: number
  indexRef: number
  time: number
}

export interface LBPairFeePercent {
  baseFeePct: Percent
  variableFeePct: Percent
}

export interface LiquidityParametersStruct {
  tokenX: string
  tokenY: string
  binStep: BigNumberish
  amountX: BigNumberish
  amountY: BigNumberish
  amountXMin: BigNumberish
  amountYMin: BigNumberish
  activeIdDesired: BigNumberish
  idSlippage: BigNumberish
  deltaIds: BigNumberish[]
  distributionX: BigNumberish[]
  distributionY: BigNumberish[]
  to: string
  deadline: BigNumberish
}

export interface BinReserves {
  reserveX: BigNumber
  reserveY: BigNumber
}

export enum LiquidityDistribution {
  SPOT,
  CURVE,
  BID_ASK,
  WIDE
}

export interface LiquidityDistributionParams {
  deltaIds: number[]
  distributionX: BigNumber[]
  distributionY: BigNumber[]
}

export interface CurveLiquidityDistributionParams
  extends LiquidityDistributionParams {
  A: number
  sigma: number
}
