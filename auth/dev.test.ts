import { describe, expect, it } from 'vitest'

import { isLocalDatabase } from './dev'

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
