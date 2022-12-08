import { ethers } from 'ethers'
import {
  ChainId,
  WAVAX as _WAVAX,
  Token,
  TokenAmount,
  JSBI,
  Percent
} from 'mc-sdk'
import { parseUnits } from '@ethersproject/units'
import { PairV2 } from './pair'
import { RouteV2 } from './route'
import { TradeV2 } from './trade'

describe('TradeV2 entity', () => {
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const PROVIDER = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const CHAIN_ID = ChainId.FUJI

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
  const WAVAX = _WAVAX[ChainId.FUJI]
  const BASES = [WAVAX, USDC, USDT]

  // init input / output
  const inputToken = USDC
  const outputToken = WAVAX

  // token pairs
  const allTokenPairs = PairV2.createAllTokenPairs(
    inputToken,
    outputToken,
    BASES
  )
  const allPairs = PairV2.initPairs(allTokenPairs) // console.log('allPairs', allPairs)

  // all routes
  const allRoutes = RouteV2.createAllRoutes(
    allPairs,
    inputToken,
    outputToken,
    2
  )

  // user input for exactIn trade
  const typedValueIn = '20'
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString()

  const amountIn = new TokenAmount(inputToken, JSBI.BigInt(typedValueInParsed))

  // user input for exactOut trade
  const typedValueOut = '1'
  const typedValueOutParsed = parseUnits(
    typedValueOut,
    outputToken.decimals
  ).toString()
  const amountOut = new TokenAmount(
    outputToken,
    JSBI.BigInt(typedValueOutParsed)
  )

  describe('TradeV2.getTradesExactIn()', () => {
    it('generates at least one trade', async () => {
      const trades = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        false,
        PROVIDER,
        CHAIN_ID
      )

      expect(trades.length).toBeGreaterThan(0)
    })
  })
  describe('TradeV2.getTradesExactOut()', () => {
    it('generates at least one exact out trade', async () => {
      const trades = await TradeV2.getTradesExactOut(
        allRoutes,
        amountOut,
        inputToken,
        false,
        false,
        PROVIDER,
        CHAIN_ID
      )

      expect(trades.length).toBeGreaterThan(0)
    })
  })
  describe('TradeV2.chooseBestTrade()', () => {
    it('chooses the best trade among exactIn trades', async () => {
      const trades = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        false,
        PROVIDER,
        CHAIN_ID
      )

      const isExactIn = true

      let maxOutputAmount = (trades[0] as TradeV2).outputAmount.raw

      trades.forEach((trade) => {
        if (trade) {
          if (JSBI.greaterThan(trade.outputAmount.raw, maxOutputAmount)) {
            maxOutputAmount = trade.outputAmount.raw
          }
        }
      })

      const bestTrade = TradeV2.chooseBestTrade(trades as TradeV2[], isExactIn)

      expect(
        JSBI.equal(maxOutputAmount, (bestTrade as TradeV2).outputAmount.raw)
      ).toBe(true)
    })
    it('chooses the best trade among exactOut trades', async () => {
      const trades = await TradeV2.getTradesExactOut(
        allRoutes,
        amountOut,
        inputToken,
        false,
        false,
        PROVIDER,
        CHAIN_ID
      )

      const isExactIn = false

      let minInputAmount = (trades[0] as TradeV2).inputAmount.raw

      trades.forEach((trade) => {
        if (trade) {
          if (JSBI.lessThan(trade.inputAmount.raw, minInputAmount)) {
            minInputAmount = trade.inputAmount.raw
          }
        }
      })

      const bestTrade = TradeV2.chooseBestTrade(trades as TradeV2[], isExactIn)

      expect(
        JSBI.equal(minInputAmount, (bestTrade as TradeV2).inputAmount.raw)
      ).toBe(true)
    })
  })
  describe('TradeV2.getTradesExactIn() and TradeV2.getTradesExactIn()', () => {
    it('generates the same route for the same inputToken / outputToken', async () => {
      const tradesExactIn = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        false,
        PROVIDER,
        CHAIN_ID
      )

      const tradesExactOut = await TradeV2.getTradesExactOut(
        allRoutes,
        amountOut,
        inputToken,
        false,
        false,
        PROVIDER,
        CHAIN_ID
      )

      const isExactIn = true
      const bestTradeExactIn = TradeV2.chooseBestTrade(
        tradesExactIn as TradeV2[],
        isExactIn
      )
      const bestTradeExactOut = TradeV2.chooseBestTrade(
        tradesExactOut as TradeV2[],
        !isExactIn
      )

      expect((bestTradeExactIn as TradeV2).route.path.length).toBe(
        (bestTradeExactOut as TradeV2).route.path.length
      )

      if (bestTradeExactIn && bestTradeExactOut) {
        bestTradeExactIn.route.path.forEach((token, i) => {
          const otherRouteToken = bestTradeExactOut.route.path[i]
          expect(token.address).toBe(otherRouteToken.address)
        })
      }
    })
  })
  describe('TradeV2.swapCallParameters()', () => {
    it('generates swapExactTokensForAVAX method', async () => {
      const isAvaxOut = true

      const trades = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        isAvaxOut,
        PROVIDER,
        CHAIN_ID
      )

      const bestTrade = TradeV2.chooseBestTrade(trades as TradeV2[], true)

      const options = {
        allowedSlippage: new Percent(JSBI.BigInt(50), JSBI.BigInt(10000)),
        ttl: 1000,
        recipient: '0x0000000000000000000000000000000000000000'
      }
      expect(bestTrade?.swapCallParameters(options)?.methodName).toBe(
        'swapExactTokensForAVAX'
      )
    })
    it('generates swapExactTokensForTokens method', async () => {
      const isAvaxOut = false

      const trades = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        isAvaxOut,
        PROVIDER,
        CHAIN_ID
      )

      const bestTrade = TradeV2.chooseBestTrade(trades as TradeV2[], true)

      const options = {
        allowedSlippage: new Percent(JSBI.BigInt(50), JSBI.BigInt(10000)),
        ttl: 1000,
        recipient: '0x0000000000000000000000000000000000000000'
      }
      expect(bestTrade?.swapCallParameters(options)?.methodName).toBe(
        'swapExactTokensForTokens'
      )
    })
  })
})
