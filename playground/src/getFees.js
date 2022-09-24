const { PairV2 } = require('../../dist')
const { ChainId, Token } = require('@traderjoe-xyz/sdk')
const { ethers } = require('ethers')

const getFees = async () => {
  console.log('\n------- getFees() called -------\n')

  // init consts
  const FUJI_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const provider = new ethers.providers.JsonRpcProvider(FUJI_URL)
  const chainId = ChainId.FUJI
  const USDC = new Token(ChainId.FUJI, '0x8c0f5Ade9cBdb19a49B06aDFB67b6702B459162B', 6, 'USDC', 'USD Coin')
  const USDT = new Token(ChainId.FUJI, '0x791B0c848AD79549F950f69E6E4CF9e3C112a230', 6, 'USDT.e', 'Tether USD')

  const pair = new PairV2(USDC, USDT)

  const binStep = 1
  const lbPair = await pair.fetchLBPair(binStep, provider, chainId)
  console.log('lbPair', lbPair)
  const data = await PairV2.getFeeParameters(lbPair.LBPair, provider)
  console.log('feeParameters', data)
  // On the contract level, fees are with a 1e18 precision
  const baseFee = data.baseFactor * data.binStep * 1e10
  console.debug('\nBase fees percentage', (baseFee / 1e18) * 100, '%')
  const variableFee =
    data.variableFeeControl === 0
      ? 0
      : (((data.volatilityAccumulated * data.binStep) ^ 2) * data.variableFeeControl) / 100
  console.debug('\nVariable fees percentage', (variableFee / 1e18) * 100, '%')
}

module.exports = getFees
