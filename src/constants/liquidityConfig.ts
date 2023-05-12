import { parseEther } from 'viem'

/**
 * Configurations for Adding Liquidity Presets
 */

// 1) Spot (Uniform)
export const spotUniform = {
  deltaIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
  distributionX: [
    0, 0, 0, 0, 0, 0.090909, 0.181818, 0.181818, 0.181818, 0.181818, 0.181818
  ].map((el) => parseEther(`${el}`)),
  distributionY: [
    0.181818, 0.181818, 0.181818, 0.181818, 0.181818, 0.090909, 0, 0, 0, 0, 0
  ].map((el) => parseEther(`${el}`))
}

// 2) Curve
export const curve = {
  deltaIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
  distributionX: [0, 0, 0, 0, 0, 0.18, 0.3, 0.24, 0.16, 0.08, 0.04].map((el) =>
    parseEther(`${el}`)
  ),
  distributionY: [0.04, 0.08, 0.16, 0.24, 0.3, 0.18, 0, 0, 0, 0, 0].map((el) =>
    parseEther(`${el}`)
  )
}

// 3) Bid-Ask
export const bidAsk = {
  deltaIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
  distributionX: [0, 0, 0, 0, 0, 0.04, 0.12, 0.16, 0.2, 0.24, 0.24].map((el) =>
    parseEther(`${el}`)
  ),
  distributionY: [0.24, 0.24, 0.2, 0.16, 0.12, 0.04, 0, 0, 0, 0, 0].map((el) =>
    parseEther(`${el}`)
  )
}
