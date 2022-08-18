const { PairV2, ChainId, Token } = require('../dist')
const { ethers } = require('ethers')

const getLBPairsAndActiveIds = async () => {

  // init consts
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const chainId = ChainId.FUJI
  const USDC = new Token(ChainId.FUJI, '0x68515E91fA26422Bdb07FaCC14247AC4CAA01838', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0xbda97f5c8C90035E253eab8b785388EFAE9c699a', 6, 'USDT.e', 'Tether USD')

  // fetch LBPairs
  const pair = new PairV2(USDC, USDT)
  const LBPairs = await pair.fetchAvailableLBPairs(provider, chainId)

  // fetch reserves and activeIds for each LBPair
  LBPairs.forEach(async lbPair => {
    const data = await PairV2.getLBPairReservesAndId(lbPair.LBPair, provider)
    console.debug('\nLBPair ', lbPair.LBPair)
    console.debug('BinStep ', lbPair.binStep.toString())
    console.debug('reserveX: ', data.reserveX.toString())
    console.debug('reserveY: ', data.reserveY.toString())
    console.debug('activeId: ', data.activeId.toString())
    console.debug('price: ', PairV2.getPriceFromId(data.activeId, lbPair.binStep))
  })

}

module.exports = getLBPairsAndActiveIds
