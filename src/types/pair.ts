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
  binStep: BigNumberish
  baseFactor: BigNumberish
  filterPeriod: BigNumberish
  decayPeriod: BigNumberish
  reductionFactor: BigNumberish
  variableFeeControl: BigNumberish
  protocolShare: BigNumberish
  maxVolatilityAccumulated: BigNumberish
  volatilityAccumulated: BigNumberish
  volatilityReference: BigNumberish
  indexRef: BigNumberish
  time: BigNumberish
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

export interface Bin {
  reserveX: BigNumber
  reserveY: BigNumber
}

export enum LiquidityDistribution {
  SPOT,
  MAX,
  BID_ASK,
  NORMAL
}
