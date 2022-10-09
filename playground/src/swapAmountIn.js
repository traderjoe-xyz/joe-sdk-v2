const { PairV2, RouteV2, TradeV2, LBFactoryABI } = require('../../dist')
const {
  Token,
  ChainId,
  WAVAX: _WAVAX,
  TokenAmount,
  Percent
} = require('@traderjoe-xyz/sdk')
const { parseUnits } = require('@ethersproject/units')
const { JsonRpcProvider } = require('@ethersproject/providers')
const JSBI = require('JSBI')

const swapAmountIn = async () => {
  console.log('LBFactoryABI', LBFactoryABI)
  console.log('\n------- swapAmountIn() called -------\n')

  // Init constants
  const WALLET_PK = process.env.PRIVATE_KEY
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const WAVAX = _WAVAX[ChainId.FUJI]
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
  const BASES = [WAVAX, USDC, USDT]

  // Init: user inputs
  const inputToken = WAVAX
  const outputToken = USDT
  const typedValueIn = '0.01' // user string input
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString() // returns 10000
  const amountIn = new TokenAmount(inputToken, JSBI.BigInt(typedValueInParsed)) // wrap into TokenAmount
  const userSlippageTolerance = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000)) // 0.5%

  // get all [Token, Token] combinations
  const allTokenPairs = PairV2.createAllTokenPairs(
    inputToken,
    outputToken,
    BASES
  )

  // get pairs
  const allPairs = PairV2.initPairs(allTokenPairs) // console.log('allPairs', allPairs)

  // routes to consider in finding the best trade
  const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken) // console.log('allRoutes', allRoutes)

  // get trades
  const chainId = ChainId.FUJI
  const provider = new JsonRpcProvider(FUJI_URL)
  const trades = await TradeV2.getTradesExactIn(
    allRoutes,
    amountIn,
    outputToken,
    provider,
    chainId
  ) // console.log('trades', trades.map(el=>el.toLog()))

  for (let trade of trades) {
    console.log('\n', trade.toLog())
    const { totalFeePct, feeAmountIn } = await trade.getTradeFee(provider)
    console.debug('Total fees percentage', totalFeePct.toSignificant(6), '%')
    console.debug(
      `Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`
    ) // in token's decimals
  }

  // get gas estimates for each trade
  // const signer = new ethers.Wallet(WALLET_PK, provider)
  // const estimatedGasCosts = await Promise.all(
  //   trades.map((trade) => trade.estimateGas(signer, chainId, userSlippageTolerance))
  // )

  // // get best trade
  // const { bestTrade, estimatedGas } = TradeV2.chooseBestTrade(trades, estimatedGasCosts)
  // console.log('bestTrade', bestTrade.toLog())
  // console.log('swapGasCostEstimate', estimatedGas.toString())
}

module.exports = swapAmountIn
