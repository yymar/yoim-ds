import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  chooseTheme,
  chosenTheme,
  DARK,
  nextTheme,
  subscribeDark,
  subscribeTheme,
  THEMA_SCRIPT,
  THEMA_SLEUTEL,
  themeColorMedia,
  themeTip,
} from './thema'

const LICHT = '(prefers-color-scheme: light)'

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

describe('themeColorMedia', () => {
  it('laat bij een keuze alleen de meta van dat thema gelden', () => {
    expect(themeColorMedia(DARK, 'donker')).toBe('all')
    expect(themeColorMedia(LICHT, 'donker')).toBe('not all')
    expect(themeColorMedia(DARK, 'licht')).toBe('not all')
    expect(themeColorMedia(LICHT, 'licht')).toBe('all')
  })

  it('zet bij Systeem de oorspronkelijke media terug', () => {
    expect(themeColorMedia(DARK, 'systeem')).toBe(DARK)
    expect(themeColorMedia(LICHT, 'systeem')).toBe(LICHT)
  })
})

/** Een meta als map van attributen, zoals Next hem in de head zet. */
function themeColorMeta(media: string) {
  const attributen = new Map([['media', media]])
  return {
    attributen,
    getAttribute: (naam: string) => attributen.get(naam) ?? null,
    setAttribute: (naam: string, waarde: string) => attributen.set(naam, waarde),
  }
}

describe('THEMA_SCRIPT', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function draai(opgeslagen: string | null) {
    const dataset: Record<string, string> = {}
    const metas = [themeColorMeta(LICHT), themeColorMeta(DARK)]
    const querySelectorAll = vi.fn(() => metas)
    vi.stubGlobal('localStorage', { getItem: () => opgeslagen })
    vi.stubGlobal('document', { documentElement: { dataset }, querySelectorAll })
    new Function(THEMA_SCRIPT)()
    return { dataset, metas, querySelectorAll }
  }

  it('zet een keuze op html en laat de balk die kleur volgen', () => {
    const { dataset, metas, querySelectorAll } = draai('donker')
    expect(dataset.thema).toBe('donker')
    expect(querySelectorAll).toHaveBeenCalledWith('meta[name=theme-color][media]')
    expect(metas.map((m) => m.getAttribute('media'))).toEqual(['not all', 'all'])
    expect(metas.map((m) => m.getAttribute('data-media'))).toEqual([LICHT, DARK])
  })

  it('doet zonder keuze niets', () => {
    const { dataset, metas } = draai(null)
    expect(dataset.thema).toBeUndefined()
    expect(metas.map((m) => m.getAttribute('media'))).toEqual([LICHT, DARK])
  })

  it('negeert een onbekende waarde', () => {
    const { dataset, metas } = draai('paars')
    expect(dataset.thema).toBeUndefined()
    expect(metas[0].getAttribute('media')).toBe(LICHT)
  })

  it('breekt de pagina niet als de opslag niet mag', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError')
      },
    })
    expect(() => new Function(THEMA_SCRIPT)()).not.toThrow()
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
  let metas: ReturnType<typeof themeColorMeta>[]

  beforeEach(() => {
    html = new Map()
    opslag = new Map()
    venster = new EventTarget()
    metas = [themeColorMeta(LICHT), themeColorMeta(DARK)]
    vi.stubGlobal('window', venster)
    vi.stubGlobal('document', {
      documentElement: {
        getAttribute: (naam: string) => html.get(naam) ?? null,
        setAttribute: (naam: string, waarde: string) => html.set(naam, waarde),
        removeAttribute: (naam: string) => html.delete(naam),
      },
      querySelectorAll: () => metas,
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

  const media = () => metas.map((m) => m.getAttribute('media'))

  it('laat de balk de keuze volgen en bij Systeem weer het apparaat', () => {
    chooseTheme('licht')
    expect(media()).toEqual(['all', 'not all'])
    chooseTheme('donker')
    expect(media()).toEqual(['not all', 'all'])
    chooseTheme('systeem')
    expect(media()).toEqual([LICHT, DARK])
  })

  it('laat de balk een keuze in een ander tabblad volgen', () => {
    const stop = subscribeTheme(() => {})
    elders(THEMA_SLEUTEL, 'donker')
    expect(media()).toEqual(['not all', 'all'])
    elders(null, null)
    expect(media()).toEqual([LICHT, DARK])
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
