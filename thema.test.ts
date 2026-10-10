import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  chooseTheme,
  chosenTheme,
  DARK,
  nextTheme,
  subscribeDark,
  subscribeTheme,
  THEMA_SLEUTEL,
  themeTip,
} from './thema'

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

describe('de themakeuze', () => {
  let html: Map<string, string>
  let opslag: Map<string, string>
  let venster: EventTarget

  beforeEach(() => {
    html = new Map()
    opslag = new Map()
    venster = new EventTarget()
    vi.stubGlobal('window', venster)
    vi.stubGlobal('document', {
      documentElement: {
        getAttribute: (naam: string) => html.get(naam) ?? null,
        setAttribute: (naam: string, waarde: string) => html.set(naam, waarde),
        removeAttribute: (naam: string) => html.delete(naam),
      },
    })
    vi.stubGlobal('localStorage', {
      setItem: (sleutel: string, waarde: string) => opslag.set(sleutel, waarde),
      removeItem: (sleutel: string) => opslag.delete(sleutel),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const elders = (key: string | null, newValue: string | null) =>
    venster.dispatchEvent(Object.assign(new Event('storage'), { key, newValue }))

  it('volgt zonder keuze het systeem', () => {
    expect(chosenTheme()).toBe('systeem')
  })

  it('zet licht of donker op html en in de opslag', () => {
    chooseTheme('donker')
    expect(html.get('data-thema')).toBe('donker')
    expect(opslag.get(THEMA_SLEUTEL)).toBe('donker')
    expect(chosenTheme()).toBe('donker')
  })

  it('haalt de keuze weg bij Systeem', () => {
    chooseTheme('licht')
    chooseTheme('systeem')
    expect(html.has('data-thema')).toBe(false)
    expect(opslag.has(THEMA_SLEUTEL)).toBe(false)
    expect(chosenTheme()).toBe('systeem')
  })

  it('kiest ook als de opslag niet mag', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('SecurityError')
      },
    })
    chooseTheme('donker')
    expect(chosenTheme()).toBe('donker')
  })

  it('leest alleen licht en donker van html', () => {
    html.set('data-thema', 'paars')
    expect(chosenTheme()).toBe('systeem')
  })

  it('seint een keuze in dit tabblad tot je afmeldt', () => {
    const onChange = vi.fn()
    const stop = subscribeTheme(onChange)
    chooseTheme('donker')
    expect(onChange).toHaveBeenCalledTimes(1)

    stop()
    chooseTheme('licht')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('volgt een keuze in een ander tabblad', () => {
    const onChange = vi.fn()
    const stop = subscribeTheme(onChange)

    elders(THEMA_SLEUTEL, 'donker')
    expect(chosenTheme()).toBe('donker')
    elders(THEMA_SLEUTEL, null)
    expect(chosenTheme()).toBe('systeem')
    expect(onChange).toHaveBeenCalledTimes(2)

    html.set('data-thema', 'licht')
    elders(null, null)
    expect(chosenTheme()).toBe('systeem')
    expect(onChange).toHaveBeenCalledTimes(3)
    stop()
  })

  it('negeert een andere sleutel in de opslag', () => {
    const onChange = vi.fn()
    const stop = subscribeTheme(onChange)
    chooseTheme('licht')
    elders('iets-anders', 'donker')
    expect(chosenTheme()).toBe('licht')
    expect(onChange).toHaveBeenCalledTimes(1)
    stop()
  })
})
