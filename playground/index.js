const swapAmountIn = require('./swapAmountIn')
const swapAmountOut = require('./swapAmountOut')
const pricesAndBinsRelations = require('./pricesAndBinsRelations')
const { config } = require('dotenv')
config() // loads env variables

const main = async () => {
  await swapAmountIn()
  await swapAmountOut()
  await pricesAndBinsRelations()
}

main()
