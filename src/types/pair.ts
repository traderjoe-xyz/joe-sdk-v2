import { Percent } from '@traderjoe-xyz/sdk'
import { Hex } from 'viem'

export interface LBPair {
  binStep: number
  LBPair: Hex
  createdByOwner: boolean
  ignoredForRouting: boolean
}

export interface LBPairReservesAndId {
  reserveX: bigint
  reserveY: bigint
  activeId: number
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
  binStep: bigint
  amountX: bigint
  amountY: bigint
  amountXMin: bigint
  amountYMin: bigint
  activeIdDesired: bigint
  idSlippage: bigint
  deltaIds: bigint[]
  distributionX: bigint[]
  distributionY: bigint[]
  to: string
  deadline: bigint
}

export interface BinReserves {
  reserveX: bigint
  reserveY: bigint
}

export enum LiquidityDistribution {
  SPOT,
  CURVE,
  BID_ASK
}

export interface LiquidityDistributionParams {
  deltaIds: number[]
  distributionX: bigint[]
  distributionY: bigint[]
}
