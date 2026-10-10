import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { COLLAPSE_AFTER, EXPAND_BELOW, isScrolled, nextScrolled, subscribeScrolled } from './scroll'

describe('nextScrolled', () => {
  it('klapt pas in voorbij 40px', () => {
    expect(nextScrolled(false, 0)).toBe(false)
    expect(nextScrolled(false, COLLAPSE_AFTER)).toBe(false)
    expect(nextScrolled(false, COLLAPSE_AFTER + 1)).toBe(true)
  })

  it('klapt pas weer uit onder 12px', () => {
    expect(nextScrolled(true, COLLAPSE_AFTER)).toBe(true)
    expect(nextScrolled(true, EXPAND_BELOW + 1)).toBe(true)
    expect(nextScrolled(true, EXPAND_BELOW)).toBe(false)
    expect(nextScrolled(true, 0)).toBe(false)
  })

  it('blijft tussen de twee drempels in de stand waarin hij was', () => {
    for (const y of [13, 20, 30, 40]) {
      expect(nextScrolled(false, y)).toBe(false)
      expect(nextScrolled(true, y)).toBe(true)
    }
  })

  it('is uitgeklapt in de overscroll van iOS boven de top', () => {
    expect(nextScrolled(false, -30)).toBe(false)
    expect(nextScrolled(true, -30)).toBe(false)
  })
})

describe('subscribeScrolled', () => {
  let scrollY = 0
  let handler: (() => void) | undefined
  let frames: Array<() => void> = []

  beforeEach(() => {
    scrollY = 0
    handler = undefined
    frames = []
    vi.stubGlobal('window', {
      get scrollY() {
        return scrollY
      },
      addEventListener: (_: string, h: () => void) => {
        handler = h
      },
      removeEventListener: () => {
        handler = undefined
      },
    })
    vi.stubGlobal('requestAnimationFrame', (f: () => void) => frames.push(f))
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => vi.unstubAllGlobals())

  function scrollTo(y: number) {
    scrollY = y
    handler?.()
    handler?.()
    const nu = frames
    frames = []
    nu.forEach((f) => f())
  }

  it('leest de stand bij het abonneren, meldt alleen een wissel en meet hooguit eens per frame', () => {
    scrollY = 100
    const listener = vi.fn()
    const stop = subscribeScrolled(listener)
    expect(isScrolled()).toBe(true)

    scrollTo(20)
    expect(listener).not.toHaveBeenCalled()

    scrollTo(5)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(isScrolled()).toBe(false)

    scrollY = 50
    handler?.()
    handler?.()
    expect(frames).toHaveLength(1)

    stop()
    expect(handler).toBeUndefined()
  })

  it('deelt één luisteraar tussen abonnees', () => {
    const a = vi.fn()
    const b = vi.fn()
    const stopA = subscribeScrolled(a)
    const stopB = subscribeScrolled(b)

    scrollTo(60)
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)

    stopA()
    expect(handler).toBeDefined()
    stopB()
    expect(handler).toBeUndefined()
  })
})
