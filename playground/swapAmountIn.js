const { 
  Token, 
  ChainId, 
  WAVAX: _WAVAX, 
  PairV2, 
  RouteV2, 
  TokenAmount,
  TradeV2,
  Percent
} = require('../dist')
const { ethers } = require('ethers')
const { parseUnits } = require('@ethersproject/units') 
const JSBI = require('JSBI')

const swapAmountIn = async () => {
  console.log('\n------- swapAmountIn() called -------\n')
  
  // Init constants
  const WALLET_PK = process.env.PRIVATE_KEY;
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const WAVAX = _WAVAX[ChainId.FUJI]
  const USDC = new Token(ChainId.FUJI, '0x68515E91fA26422Bdb07FaCC14247AC4CAA01838', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0xbda97f5c8C90035E253eab8b785388EFAE9c699a', 6, 'USDT.e', 'Tether USD')
  const BASES = [WAVAX, USDC, USDT]

  // Init: user inputs
  const inputToken = USDC
  const outputToken = USDT
  const typedValueIn = "0.01" // user string input 
  const typedValueInParsed = parseUnits(typedValueIn, inputToken.decimals).toString() // returns 10000
  const amountIn = new TokenAmount(inputToken, JSBI.BigInt(typedValueInParsed)) // wrap into TokenAmount
  const userSlippageTolerance = new Percent(JSBI.BigInt(10), JSBI.BigInt(10000)) // 0.1%

  // get all [Token, Token] combinations
  const allTokenPairs = PairV2.createAllTokenPairs(inputToken, outputToken, BASES) 

  // get pairs
  const allPairs = PairV2.fetchAndInitPairs(allTokenPairs); // console.log('allPairs', allPairs)

  // routes to consider in finding the best trade
  const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken); // console.log('allRoutes', allRoutes)

  // get tradess
  const chainId = ChainId.FUJI
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const signer = new ethers.Wallet(WALLET_PK, provider)
  const trades = await TradeV2.getTradesExactIn(allRoutes, amountIn, outputToken, provider, chainId); // console.log('trades', trades.map(el=>el.toLog()))

  // get best trade
  const bestTrade = trades[0]
  console.log('bestTrade', bestTrade.toLog())

  // get gas estimage
  const swapGasCostEstimate = await bestTrade.estimateGas(signer, chainId, userSlippageTolerance)
  console.log('swapGasCostEstimate', swapGasCostEstimate)
}

module.exports = swapAmountIn
