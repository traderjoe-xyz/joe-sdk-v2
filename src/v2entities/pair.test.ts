import { ChainId, WAVAX, Token } from '@traderjoe-xyz/sdk'
import { PairV2 } from './pair'
import { createPublicClient, http } from 'viem'
import { avalancheFuji } from 'viem/chains'
import { describe, it, expect } from 'vitest'

describe('PairV2 entity', () => {
  const CLIENT = createPublicClient({
    chain: avalancheFuji,
    transport: http()
  })
  const CHAIN_ID = ChainId.FUJI

  // init tokens
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
  const AVAX = WAVAX[ChainId.FUJI]

  // init pairs
  const pair1 = new PairV2(USDC, AVAX)
  const pair2 = new PairV2(AVAX, USDC)
  const pair3 = new PairV2(USDC, USDT)

  it('can be initialized in any order of tokens', async () => {
    expect(pair1.equals(pair2)).toEqual(true)
  })

  it('can fetch all available v2 LBPairs', async () => {
    const LBPairs = await pair1.fetchAvailableLBPairs(false, CLIENT, CHAIN_ID)
    expect(LBPairs.length).toBeGreaterThan(0)
  })

  it('can fetch single v2 LBPair given the bin step', async () => {
    const binStep = 10
    const LBPair = await pair1.fetchLBPair(binStep, false, CLIENT, CHAIN_ID)
    expect(LBPair.binStep).toEqual(binStep)
    expect(LBPair.LBPair).not.toBeUndefined()
  })

  it('can fetch all available v2.1 LBPairs', async () => {
    const LBPairs = await pair1.fetchAvailableLBPairs(true, CLIENT, CHAIN_ID)
    expect(LBPairs.length).toBeGreaterThan(0)
  })

  it('can fetch single v2.1 LBPair given the bin step', async () => {
    const binStep = 10
    const LBPair = await pair1.fetchLBPair(binStep, false, CLIENT, CHAIN_ID)
    expect(LBPair.binStep).toEqual(binStep)
    expect(LBPair.LBPair).not.toBeUndefined()
  })

  describe('PairV2.equals()', () => {
    it('returns true for equal pairs', () => {
      expect(pair1.equals(pair2)).toEqual(true)
    })
    it('returns false for different pairs', () => {
      expect(pair3.equals(pair2)).toEqual(false)
    })
  })

  describe('PairV2.createAllTokenPairs() / PairV2.initPairs()', () => {
    it('creates all possible combination of token pairs', () => {
      const TOKEN1 = new Token(
        ChainId.FUJI,
        '0x0000000000000000000000000000000000000001',
        6,
        'TOKEN1',
        'TOKEN1'
      )
      const TOKEN2 = new Token(
        ChainId.FUJI,
        '0x0000000000000000000000000000000000000002',
        6,
        'TOKEN2',
        'TOKEN2'
      )
      const BASES = [TOKEN1, TOKEN2]

      const allTokenPairs = PairV2.createAllTokenPairs(USDC, AVAX, BASES)
      expect(allTokenPairs.length).toEqual(7)

      const allUniquePairs = PairV2.initPairs(allTokenPairs)
      expect(allUniquePairs.length).toEqual(6)
    })
  })

  describe('PairV2.getLBPairReservesAndId()', () => {
    it('can fetch LBPair v2 reserves and activeId', async () => {
      const binStep = 10
      const isV21 = false
      const LBPair = await pair1.fetchLBPair(binStep, isV21, CLIENT, CHAIN_ID)

      const lbPairData = await PairV2.getLBPairReservesAndId(
        LBPair.LBPair,
        isV21,
        CLIENT
      )

      expect(lbPairData.activeId).not.toBeUndefined()
      expect(lbPairData.reserveX).not.toBeUndefined()
      expect(lbPairData.reserveY).not.toBeUndefined()
    })

    it('can fetch LBPair v2.1 reserves and activeId', async () => {
      const binStep = 20
      const isV21 = true
      const LBPair = await pair1.fetchLBPair(binStep, isV21, CLIENT, CHAIN_ID)

      const lbPairData = await PairV2.getLBPairReservesAndId(
        LBPair.LBPair,
        isV21,
        CLIENT
      )

      expect(lbPairData.activeId).not.toBeUndefined()
      expect(lbPairData.reserveX).not.toBeUndefined()
      expect(lbPairData.reserveY).not.toBeUndefined()
    })
  })

  describe('PairV2.getFeeParameters()', () => {
    it('can fetch LBPair fee parameters', async () => {
      const binStep = 10
      const LBPair = await pair1.fetchLBPair(binStep, false, CLIENT, CHAIN_ID)

      const lbPairFeeParams = await PairV2.getFeeParameters(
        LBPair.LBPair,
        CLIENT
      )

      expect(lbPairFeeParams.baseFactor).not.toBeUndefined()
      expect(lbPairFeeParams.maxVolatilityAccumulated).not.toBeUndefined()
    })
  })

  describe('PairV2.calculateAmounts()', () => {
    it('can accurately amounts when activeBin is included', async () => {
      const liquidity = ['13333333', '13600300', '13903508']
      const binIds = [8376297, 8376298, 8376299]
      const activeBin = 8376298
      const binsReserves = [
        {
          reserveX: '0',
          reserveY: '420588469'
        },
        {
          reserveX: '16644559640250455745',
          reserveY: '75236144'
        },
        {
          reserveX: '20272546666666666600',
          reserveY: '0'
        }
      ].map((el) => ({
        reserveX: BigInt(el.reserveX),
        reserveY: BigInt(el.reserveY)
      }))
      const totalSupplies = ['420588467', '421669945', '422789291'].map((el) =>
        BigInt(el)
      )

      const { amountX, amountY } = PairV2.calculateAmounts(
        binIds,
        activeBin,
        binsReserves,
        totalSupplies,
        liquidity
      )

      expect(amountX.toString()).toBe('1203510695082363975')
      expect(amountY.toString()).toBe('15759956')
    })
    it('can accurately calculate amounts when bin < activeBin', async () => {
      const liquidity = ['13333333']
      const binIds = [8376297]
      const activeBin = 8376298
      const binsReserves = [
        {
          reserveX: '0',
          reserveY: '420588469'
        }
      ].map((el) => ({
        reserveX: BigInt(el.reserveX),
        reserveY: BigInt(el.reserveY)
      }))
      const totalSupplies = ['420588467'].map((el) => BigInt(el))

      const { amountX, amountY } = PairV2.calculateAmounts(
        binIds,
        activeBin,
        binsReserves,
        totalSupplies,
        liquidity
      )

      expect(amountX.toString()).toBe('0')
      expect(amountY.toString()).toBe('13333333')
    })
    it('can accurately calculate amounts when bin > activeBin', async () => {
      const liquidity = ['13903508']
      const binIds = [8376299]
      const activeBin = 8376298
      const binsReserves = [
        {
          reserveX: '20272546666666666600',
          reserveY: '0'
        }
      ].map((el) => ({
        reserveX: BigInt(el.reserveX),
        reserveY: BigInt(el.reserveY)
      }))
      const totalSupplies = ['422789291'].map((el) => BigInt(el))

      const { amountX, amountY } = PairV2.calculateAmounts(
        binIds,
        activeBin,
        binsReserves,
        totalSupplies,
        liquidity
      )

      expect(amountX.toString()).toBe('666666636928543519')
      expect(amountY.toString()).toBe('0')
    })
  })
})
