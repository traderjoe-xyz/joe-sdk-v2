import { BigNumberish } from 'ethers'

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

// TODO: define new distribution shapes
export enum LiquidityDistribution {
  FLAT, // same liquidity in all bins
}

// TODO: define new remove liquidity options
export enum RemoveLiquidityOptions{
  ALL, // removes all positions in every bin
  HALF_EQUAL, // removing half of the position in every bin,
}