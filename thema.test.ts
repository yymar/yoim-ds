import { describe, expect, it, vi } from 'vitest'

import { DARK, nextTheme, subscribeDark, themeTip } from './thema'

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

  it('zegt met een volgende keuze waar een klik heen gaat', () => {
    expect(themeTip('licht', 'licht', false, 'donker')).toBe('Licht. Klik voor donker')
    expect(themeTip('donker', 'donker', true, 'systeem')).toBe('Donker. Klik voor systeem')
    expect(themeTip('systeem', 'systeem', true, 'licht')).toBe(
      'Systeem · volgt je apparaat, nu donker. Klik voor licht',
    )
  })
})

describe('nextTheme', () => {
  it('schuift door licht, donker en systeem', () => {
    expect(nextTheme('licht', true)).toBe('donker')
    expect(nextTheme('donker', true)).toBe('systeem')
    expect(nextTheme('systeem', true)).toBe('licht')
  })

  it('wisselt zonder systeem alleen tussen licht en donker', () => {
    expect(nextTheme('licht', false)).toBe('donker')
    expect(nextTheme('donker', false)).toBe('licht')
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
