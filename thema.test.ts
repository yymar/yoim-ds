import { describe, expect, it } from 'vitest'

import { themeTip } from './thema'

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
