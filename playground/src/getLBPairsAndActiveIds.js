const { PairV2 } = require('../../dist')
const { ChainId, Token } = require('@traderjoe-xyz/sdk')
const { ethers } = require('ethers')

const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const chainId = ChainId.FUJI
  const USDC = new Token(ChainId.FUJI, '0x8c0f5Ade9cBdb19a49B06aDFB67b6702B459162B', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0x791B0c848AD79549F950f69E6E4CF9e3C112a230', 6, 'USDT.e', 'Tether USD')

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
