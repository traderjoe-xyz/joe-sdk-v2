import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from 'ethers'

import { CurrencyAmount } from '@traderjoe-xyz/sdk'

import { spotUniform, maxUniform, bidAsk, normal } from './constants'
import { LiquidityDistribution } from './types/pair'

// warns if addresses are not checksummed
export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address)
    warning(address === checksummedAddress, `${address} is not checksummed.`)
    return checksummedAddress
  } catch (error) {
    invariant(false, `${address} is not a valid address.`)
  }
}

/**
 * Converts currency amount into hex encoding
 *
 * @param {CurrencyAmount} currencyAmount
 * @returns {string}
 */
export function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}

/**
 * Returns true if the string value is zero in hex
 *
 * @param {string} hexNumberString
 * @returns {boolean}
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}

/**
 * Returns distribution params for on-chain addLiquidity() call
 * 
 * @param {LiquidityDistribution} distribution 
 * @returns {deltaIds: number[], distributionX: number[], distributionY: number[]}
}
 */
export const getLiquidityConfig = (
  distribution: LiquidityDistribution
): {
  deltaIds: number[]
  distributionX: BigNumber[]
  distributionY: BigNumber[]
} => {
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
