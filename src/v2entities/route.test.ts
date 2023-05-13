import { ChainId, WNATIVE, Token } from '@traderjoe-xyz/sdk'
import { PairV2 } from './pair'
import { RouteV2 } from './route'
import { describe, it, expect } from 'vitest'

describe('RouteV2.createAllRoute()', () => {
  // init tokens and route bases
  const USDC = new Token(
    ChainId.FUJI,
    '0xB6076C93701D6a07266c31066B298AeC6dd65c2d',
    6,
    'USDC',
    'USD Coin'
  )
  const USDT = new Token(
    ChainId.FUJI,
    '0xAb231A5744C8E6c45481754928cCfFFFD4aa0732',
    6,
    'USDT.e',
    'Tether USD'
  )
  const AVAX = WNATIVE[ChainId.FUJI]
  const BASES = [AVAX, USDC, USDT]

  // init input / output
  const inputToken = USDC
  const outputToken = AVAX

  // token pairs
  const allTokenPairs = PairV2.createAllTokenPairs(
    inputToken,
    outputToken,
    BASES
  )
  const allPairs = PairV2.initPairs(allTokenPairs) // console.log('allPairs', allPairs)

  // generate routes
  const hops = 4
  const allRoutes = RouteV2.createAllRoutes(
    allPairs,
    inputToken,
    outputToken,
    hops
  )

  it('generates routes with <= hops', () => {
    allRoutes.forEach((route) => {
      expect(route.pairs.length).toBeLessThanOrEqual(hops)
    })
  })

  it('generates routes with the correct input token', () => {
    allRoutes.forEach((route) => {
      expect(route.input.address).toBe(inputToken.address)
    })
  })

  it('generates routes with the correct output token', () => {
    allRoutes.forEach((route) => {
      expect(route.output.address).toBe(outputToken.address)
    })
  })

  it('generates routes without any overlapping tokens', () => {
    allRoutes.forEach((route) => {
      const set = new Set()
      route.path.forEach((token) => {
        expect(set.has(token.address)).toBe(false)
        set.add(token.address)
      })
    })
  })
})
