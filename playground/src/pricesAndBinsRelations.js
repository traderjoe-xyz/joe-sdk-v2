const { PairV2, Percent } = require('../../dist')
const JSBI = require('JSBI')

const pricesAndBinsRelations = async () => {
  console.log('\n------- pricesAndBinsRelations() called -------\n')

  // This returns 1 because we're in the center bin
  console.log('getPriceFromId', PairV2.getPriceFromId(8388608, 100))

  // If bin step = 100, every bin jump is a 0.5% price shift (20_000 basis)
  console.log('1 bin jump', PairV2.getPriceFromId(8388608 + 1, 100))

  // We can get the current active bin based on price
  console.log('getIdFromPrice', PairV2.getIdFromPrice(20, 100))

  //  Considering a 5% price slippage
  const idSlippage = PairV2.getIdSlippageFromPriceSlippage(0.05, 100)

  // We find the correct slippage
  console.log('5% slippage', PairV2.getPriceFromId(8388608 + idSlippage, 100))
}

module.exports = pricesAndBinsRelations
