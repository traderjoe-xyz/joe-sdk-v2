const { PairV2 } = require('../../dist')
const { ChainId, Token } = require('@traderjoe-xyz/sdk')
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
  const USDT = new Token(
    ChainId.FUJI,
    '0xAb231A5744C8E6c45481754928cCfFFFD4aa0732',
    6,
    'USDT.e',
    'Tether USD'
  )

  // fetch LBPairs
  const pair = new PairV2(USDC, USDT)
  // const LBPairs = await pair.fetchAvailableLBPairs(provider, chainId)

  // // fetch reserves and activeIds for each LBPair
  // LBPairs.forEach(async (lbPair) => {
  //   const data = await PairV2.getLBPairReservesAndId(lbPair.LBPair, provider)
  //   console.debug('\nLBPair ', lbPair.LBPair)
  //   console.debug('BinStep ', lbPair.binStep.toString())
  //   console.debug('reserveX: ', data.reserveX.toString())
  //   console.debug('reserveY: ', data.reserveY.toString())
  //   console.debug('activeId: ', data.activeId.toString())
  //   console.debug('price: ', PairV2.getPriceFromId(data.activeId, lbPair.binStep), '\n')
  // })

  // fetch LBPair
  const binStep = 1
  const lbPair = await pair.fetchLBPair(binStep, provider, chainId)
  console.log('lbPair', lbPair)
  const data = await PairV2.getLBPairReservesAndId(lbPair.LBPair, provider)
  console.debug('\nLBPair ', lbPair.LBPair)
  console.debug('reserveX: ', data.reserveX.toString())
  console.debug('reserveY: ', data.reserveY.toString())
  console.debug('activeId: ', data.activeId.toString())
  console.debug('price: ', PairV2.getPriceFromId(data.activeId, binStep), '\n')
}

module.exports = getLBPairsAndActiveIds
