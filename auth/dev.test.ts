import { describe, expect, it } from 'vitest'

import { isLocalDatabase, isLocalHost } from './dev'

describe('isLocalHost', () => {
  it('laat alleen een verzoek aan deze machine door', () => {
    expect(isLocalHost('localhost:3003')).toBe(true)
    expect(isLocalHost('127.0.0.1:3003')).toBe(true)
    expect(isLocalHost('localhost')).toBe(true)
  })

  it('niet via het netwerk, een andere naam of zonder Host', () => {
    expect(isLocalHost('192.168.1.20:3003')).toBe(false)
    expect(isLocalHost('kwaad.example:3003')).toBe(false)
    expect(isLocalHost('localhost.kwaad.example')).toBe(false)
    expect(isLocalHost(null)).toBe(false)
  })
})

describe('isLocalDatabase', () => {
  it('staat de dev-login alleen toe tegen een database op deze machine', () => {
    expect(isLocalDatabase('http://127.0.0.1:54331', 'development')).toBe(true)
    expect(isLocalDatabase('http://localhost:54331', 'development')).toBe(true)
  })

  it('nooit tegen de echte database', () => {
    expect(isLocalDatabase('https://abc.supabase.co', 'development')).toBe(false)
  })

  it('nooit buiten development, ook niet lokaal', () => {
    expect(isLocalDatabase('http://127.0.0.1:54331', 'production')).toBe(false)
    expect(isLocalDatabase('http://127.0.0.1:54331', 'test')).toBe(false)
  })

  it('niet zonder of met een kapotte url', () => {
    expect(isLocalDatabase(undefined, 'development')).toBe(false)
    expect(isLocalDatabase('geen url', 'development')).toBe(false)
  })
})
