const { PairV2 } = require('../../dist')
const { ChainId, Token } = require('@traderjoe-xyz/sdk')
const { ethers } = require('ethers')

const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const chainId = ChainId.FUJI
  const USDC = new Token(ChainId.FUJI, '0xe03bF9AD3e347bb311A9620Ee424c50E0b947385', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0x8FFf749D5356E5F564fe3e37884df413A4a8cDE1', 6, 'USDT.e', 'Tether USD')

  // fetch LBPairs
  const pair = new PairV2(USDC, USDT)
  const LBPairs = await pair.fetchAvailableLBPairs(provider, chainId)

  // fetch reserves and activeIds for each LBPair
  LBPairs.forEach(async (lbPair) => {
    const data = await PairV2.getLBPairReservesAndId(lbPair.LBPair, provider)
    console.debug('\nLBPair ', lbPair.LBPair)
    console.debug('BinStep ', lbPair.binStep.toString())
    console.debug('reserveX: ', data.reserveX.toString())
    console.debug('reserveY: ', data.reserveY.toString())
    console.debug('activeId: ', data.activeId.toString())
    console.debug('price: ', PairV2.getPriceFromId(data.activeId, lbPair.binStep), '\n')
  })
}

module.exports = getLBPairsAndActiveIds
