const { PairV2, Bin } = require('../../dist')
const { ChainId, Token, WAVAX: _WAVAX } = require('mc-sdk')
const { ethers } = require('ethers')

const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const chainId = ChainId.FUJI
  const USDC = new Token(
    ChainId.FUJI,
    '0xB6076C93701D6a07266c31066B298AeC6dd65c2d',
    6,
    'USDC',
    'USD Coin'
  )
  const WAVAX = _WAVAX[ChainId.FUJI]

  // fetch LBPairs
  const pair = new PairV2(USDC, WAVAX)
  const LBPairs = await pair.fetchAvailableLBPairs(provider, chainId)

  // fetch reserves and activeIds for each LBPair
  const requests = LBPairs.map((lbPair) =>
    PairV2.getLBPairReservesAndId(lbPair.LBPair, provider)
  )
  const data = await Promise.all(requests)
  data.forEach((data, i) => {
    const lbPair = LBPairs[i]
    console.debug('\nLBPair ', lbPair.LBPair)
    console.debug('BinStep ', lbPair.binStep.toString())
    console.debug('reserveX: ', data.reserveX.toString())
    console.debug('reserveY: ', data.reserveY.toString())
    console.debug('activeId: ', data.activeId.toString())
    console.debug(
      'price: ',
      Bin.getPriceFromId(data.activeId, lbPair.binStep),
      '\n'
    )
  })

  // fetch single LBPair
  const binStep = 10
  const lbPair = await pair.fetchLBPair(binStep, provider, chainId)
  console.log('lbPair', lbPair)
  const lbPairData = await PairV2.getLBPairReservesAndId(
    lbPair.LBPair,
    provider
  )
  console.debug('\nLBPair ', lbPair.LBPair)
  console.debug('reserveX: ', lbPairData.reserveX.toString())
  console.debug('reserveY: ', lbPairData.reserveY.toString())
  console.debug('activeId: ', lbPairData.activeId.toString())
  console.debug(
    'price: ',
    Bin.getPriceFromId(lbPairData.activeId, binStep),
    '\n'
  )
}

module.exports = getLBPairsAndActiveIds
