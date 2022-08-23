const { Token, ChainId, WAVAX: _WAVAX, PairV2, RouteV2, TokenAmount, TradeV2, Percent } = require('../../dist')
const { ethers } = require('ethers')
const { parseUnits } = require('@ethersproject/units')
const JSBI = require('JSBI')

const swapAmountOut = async () => {
  console.debug('\n------- swapAmountOut() called -------\n')

  // Init constants
  const WALLET_PK = process.env.PRIVATE_KEY
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const WAVAX = _WAVAX[ChainId.FUJI]
  const USDC = new Token(ChainId.FUJI, '0x68515E91fA26422Bdb07FaCC14247AC4CAA01838', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0xbda97f5c8C90035E253eab8b785388EFAE9c699a', 6, 'USDT.e', 'Tether USD')
  const BASES = [WAVAX, USDC, USDT]

  // Init: user inputs
  const inputToken = USDC
  const outputToken = USDT
  const typedValueOut = '0.01' // user string input
  const typedValueOutParsed = parseUnits(typedValueOut, inputToken.decimals).toString() // returns 10000
  const amountOut = new TokenAmount(outputToken, JSBI.BigInt(typedValueOutParsed)) // wrap into TokenAmount
  const userSlippageTolerance = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000)) // 0.1%

  // get all [Token, Token] combinations
  const allTokenPairs = PairV2.createAllTokenPairs(inputToken, outputToken, BASES)

  // get pairs
  const allPairs = PairV2.initPairs(allTokenPairs) // console.debug('allPairs', allPairs)

  // routes to consider in finding the best trade
  const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken) // console.debug('allRoutes', allRoutes)

  // get tradess
  const chainId = ChainId.FUJI
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const trades = await TradeV2.getTradesExactOut(allRoutes, amountOut, inputToken, provider, chainId) // console.debug('trades', trades.map(el=>el.toLog()))

  // get gas estimates for each trade
  const signer = new ethers.Wallet(WALLET_PK, provider)
  const estimatedGasCosts = await Promise.all(
    trades.map((trade) => trade.estimateGas(signer, chainId, userSlippageTolerance))
  )

  // get best trade
  const { bestTrade, estimatedGas } = TradeV2.chooseBestTrade(trades, estimatedGasCosts)
  console.log('bestTrade', bestTrade.toLog())
  console.log('swapGasCostEstimate', estimatedGas.toString())
}

module.exports = swapAmountOut
