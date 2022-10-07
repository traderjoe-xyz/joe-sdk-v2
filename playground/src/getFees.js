const { PairV2 } = require('../../dist')
const { ChainId, Token, Percent, Pair } = require('@traderjoe-xyz/sdk')
const { ethers } = require('ethers')

const getFees = async () => {
  console.log('\n------- getFees() called -------\n')

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

  const pair = new PairV2(USDC, USDT)

  const binStep = 1
  const lbPair = await pair.fetchLBPair(binStep, provider, chainId)
  console.log('lbPair', lbPair)
  const data = await PairV2.getFeeParameters(lbPair.LBPair, provider)
  console.log('feeParameters', data)
  const { baseFeePct, variableFeePct } = PairV2.calculateFeePercentage(data)
  console.debug('\nBase fees percentage', baseFeePct.toSignificant(6), '%')
  console.debug(
    '\nVariable fees percentage',
    variableFeePct.toSignificant(6),
    '%'
  )
}

module.exports = getFees
