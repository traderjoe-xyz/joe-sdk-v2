import { bidAsk, curve, spotUniform, wide } from './liquidityConfig'

describe('LiquidityConfig', () => {
  it('delta ids, distribution X and distribution Y have same length', () => {
    const allConfigs = [spotUniform, wide, curve, bidAsk]
    allConfigs.forEach((config) => {
      expect(config.deltaIds.length).toBe(config.distributionX.length)
      expect(config.deltaIds.length).toBe(config.distributionY.length)
    })
  })
})
