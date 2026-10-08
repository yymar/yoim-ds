import { describe, expect, it, vi } from 'vitest'

import { DARK, subscribeDark, themeTip } from './thema'

describe('themeTip', () => {
  it('noemt licht en donker bij naam', () => {
    expect(themeTip('licht', 'systeem', true)).toBe('Licht')
    expect(themeTip('donker', 'licht', false)).toBe('Donker')
  })

  it('zegt bij Systeem pas wat het volgt als Systeem gekozen is', () => {
    expect(themeTip('systeem', 'licht', true)).toBe('Systeem · volgt je apparaat')
    expect(themeTip('systeem', 'systeem', false)).toBe('Systeem · volgt je apparaat, nu licht')
    expect(themeTip('systeem', 'systeem', true)).toBe('Systeem · volgt je apparaat, nu donker')
  })
})

describe('subscribeDark', () => {
  it('volgt een wissel van prefers-color-scheme tot je afmeldt', () => {
    const query = new EventTarget()
    const matchMedia = vi.fn(() => query)
    vi.stubGlobal('window', { matchMedia })
    const onChange = vi.fn()

    const stop = subscribeDark(onChange)
    query.dispatchEvent(new Event('change'))
    expect(matchMedia).toHaveBeenCalledWith(DARK)
    expect(onChange).toHaveBeenCalledTimes(1)

    stop()
    query.dispatchEvent(new Event('change'))
    expect(onChange).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
