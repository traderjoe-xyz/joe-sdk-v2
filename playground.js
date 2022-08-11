/**
 * Playground to simulate how SDK v2's entities will be used in the frontend
 */

const { Token, ChainId, WAVAX: _WAVAX, PairV2, RouteV2, Quote } = require('./dist')
const { ethers } = require('./node_modules/ethers')

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
  const amountIn = 10_000

  // Init: Pairs to consider in finding all routes
  const allPairs = PairV2.createAllPairs(inputToken, outputToken, BASES)
  console.debug('allPairs', allPairs)

  // Init: Routes to consider in finding the best trade
  const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken)
  console.debug('allRoutes', allRoutes)
  const allRoutesStr = allRoutes.map((route) => route.pathToStrArr())
  console.debug('allRoutesStr', allRoutesStr)

  // Get Quotes
  const chainId = ChainId.FUJI
  console.debug(typeof chainId)
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const quotes = await Quote.getQuotes(allRoutesStr, amountIn, provider, chainId)
  console.debug('quotes', quotes)
}

main()
