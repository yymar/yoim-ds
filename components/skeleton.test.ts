import { describe, expect, it } from 'vitest'

import { skeletonWidth } from './skeleton'

describe('skeletonWidth', () => {
  it('geeft per index een vaste breedte', () => {
    expect(skeletonWidth(0)).toBe(64)
    expect(skeletonWidth(1)).toBe(48)
    expect(skeletonWidth(3, 2)).toBe(skeletonWidth(5))
  })

  it('loopt rond en blijft tussen 44 en 76 procent', () => {
    for (let i = -20; i < 40; i++) {
      const w = skeletonWidth(i)
      expect(w).toBeGreaterThanOrEqual(44)
      expect(w).toBeLessThanOrEqual(76)
    }
    expect(skeletonWidth(10)).toBe(skeletonWidth(0))
  })
})
