const { 
  Token, 
  ChainId, 
  WAVAX: _WAVAX, 
  PairV2, 
  RouteV2, 
  TokenAmount,
  TradeV2
} = require('./dist')
const { ethers } = require('./node_modules/ethers')
const { parseUnits } = require('./node_modules/@ethersproject/units') 
const JSBI = require('./node_modules/JSBI')


/**
 * Playground to simulate how SDK v2 will be used in the frontend
 * - Requirements: USDC, USDT, WAVAX balance in fuji + approve "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901" and "0xE9e38190D2440d6cD28cF0Ce453FB86CB8725f8A" 
 */

const main = async () => {
  // Init constants
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const WAVAX = _WAVAX[ChainId.FUJI]
  const USDC = new Token(ChainId.FUJI, '0x68515E91fA26422Bdb07FaCC14247AC4CAA01838', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0xbda97f5c8C90035E253eab8b785388EFAE9c699a', 6, 'USDT.e', 'Tether USD')
  const BASES = [WAVAX, USDC, USDT]

  // Init: input Token and desired output Token
  const inputToken = USDC
  const outputToken = USDT
  const typedValueIn = "0.01" // user string input 
  const typedValueInParsed = parseUnits(typedValueIn, inputToken.decimals).toString() // returns 10000
  const amountIn = new TokenAmount(inputToken, JSBI.BigInt(typedValueInParsed)) // wrap into TokenAmount
  
  // get all [Token, Token] combinations
  const allTokenPairs = PairV2.createAllTokenPairs(inputToken, outputToken, BASES) 

  // get pairs
  const allPairs = PairV2.fetchAndInitPairs(allTokenPairs); // console.debug('allPairs', allPairs)

  // routes to consider in finding the best trade
  const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken); // console.debug('allRoutes', allRoutes)

  // get tradess
  const chainId = ChainId.FUJI
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const trades = await TradeV2.getTradesExactIn(allRoutes, amountIn, outputToken, provider, chainId); // console.debug('trades', trades.map(el=>el.toLog()))

  // get best trade
  const bestTrade = trades[0]
  console.debug('bestTrade', bestTrade.toLog())
}

main()
