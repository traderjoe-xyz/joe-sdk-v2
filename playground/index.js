const swapAmountIn = require('./swapAmountIn')
const swapAmountOut = require('./swapAmountOut')
const { config }  = require('dotenv')
config() // loads env variables

const main = async () => {
  await swapAmountIn()
  await swapAmountOut()
}

main()
