import { Bin } from './bin'
import { describe, it, expect } from 'vitest'

describe('Bin', () => {
  describe('Bin.getIdFromPrice()', () => {
    it('works when the price is lower than 1', () => {
      expect(Bin.getIdFromPrice(0.9999, 1)).toEqual(8388607)
    })
    it('works when the price is greather than 1', () => {
      expect(Bin.getIdFromPrice(1.0001, 1)).toEqual(8388609)
    })
  })
})
