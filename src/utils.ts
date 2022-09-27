import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import JSBI from 'jsbi'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from 'ethers'

import { CurrencyAmount } from '@traderjoe-xyz/sdk'

import {
  BigintIsh,
  ZERO,
  ONE,
  TWO,
  THREE,
  SolidityType,
  SOLIDITY_TYPE_MAXIMA,
  spotUniform,
  maxUniform,
  bidAsk,
  normal
} from './constants'
import { LiquidityDistribution } from './types/pair'

export function validateSolidityTypeInstance(
  value: JSBI,
  solidityType: SolidityType
): void {
  invariant(
    JSBI.greaterThanOrEqual(value, ZERO),
    `${value} is not a ${solidityType}.`
  )
  invariant(
    JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]),
    `${value} is not a ${solidityType}.`
  )
}

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

export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === 'bigint'
    ? JSBI.BigInt(bigintIsh.toString())
    : JSBI.BigInt(bigintIsh)
}

// mock the on-chain sqrt function
export function sqrt(y: JSBI): JSBI {
  validateSolidityTypeInstance(y, SolidityType.uint256)
  let z: JSBI = ZERO
  let x: JSBI
  if (JSBI.greaterThan(y, THREE)) {
    z = y
    x = JSBI.add(JSBI.divide(y, TWO), ONE)
    while (JSBI.lessThan(x, z)) {
      z = x
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE
  }
  return z
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
