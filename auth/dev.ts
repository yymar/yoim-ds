import { NextResponse } from 'next/server'

import { createServerSupabase } from './server'

/** De twee huisgenoten uit de lokale seed. Niemand anders. */
const PEOPLE = {
  yoran: 'yoran.de.haan@gmail.com',
  imke: 'imkedoorakkers@gmail.com',
} as const

/**
 * Of de app in development met een database op deze machine praat. De
 * dev-login werkt met een bekend wachtwoord, en dat mag tegen de echte
 * database nooit werken.
 */
export function isLocalDatabase(url = process.env.NEXT_PUBLIC_SUPABASE_URL, env = process.env.NODE_ENV): boolean {
  if (!url || env !== 'development') return false
  try {
    const { hostname } = new URL(url)
    return hostname === '127.0.0.1' || hostname === 'localhost'
  } catch {
    return false
  }
}

/**
 * Inloggen als Yoran (of `?as=imke`) met het wachtwoord van de seed, alleen
 * tegen een lokale database; overal anders bestaat deze route niet. Google
 * heeft een geregistreerde redirect nodig, en die heeft een lokale stack niet.
 * Hier logt ook de e2e-check van dit pakket mee in.
 *
 *   // app/auth/dev/route.ts
 *   export { GET } from '@yoim/ds/auth/dev'
 */
export async function GET(request: Request) {
  if (!isLocalDatabase()) {
    return new NextResponse('Not found', { status: 404 })
  }

  const { searchParams, origin } = new URL(request.url)
  const email = searchParams.get('as') === 'imke' ? PEOPLE.imke : PEOPLE.yoran

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password: 'dev' })

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?fout=inloggen_mislukt`)
  }

  return NextResponse.redirect(`${origin}/`)
}
