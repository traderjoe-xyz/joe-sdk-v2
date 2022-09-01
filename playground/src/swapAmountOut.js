const { PairV2, RouteV2, TradeV2 } = require('../../dist')
const { Token, ChainId, WAVAX: _WAVAX, TokenAmount, Percent } = require('@traderjoe-xyz/sdk')
const { parseUnits } = require('@ethersproject/units')
const { JsonRpcProvider } = require('@ethersproject/providers')
const JSBI = require('JSBI')

const swapAmountOut = async () => {
  console.debug('\n------- swapAmountOut() called -------\n')

  // Init constants
  const WALLET_PK = process.env.PRIVATE_KEY
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const WAVAX = _WAVAX[ChainId.FUJI]
  const USDC = new Token(ChainId.FUJI, '0xe03bF9AD3e347bb311A9620Ee424c50E0b947385', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0x8FFf749D5356E5F564fe3e37884df413A4a8cDE1', 6, 'USDT.e', 'Tether USD')
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
  const provider = new JsonRpcProvider(FUJI_URL)
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