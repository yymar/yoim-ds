import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { cookieOptions } from './cookie'

/**
 * Supabase-client voor server components, route handlers en server actions.
 *
 * `cookies()` is in Next 16 volledig async, vandaar dat deze functie awaited
 * moet worden. De setAll-catch is nodig omdat server components geen cookies
 * mogen schrijven; het verversen van de sessie gebeurt daar in proxy.ts.
 *
 * Elke app wikkelt dit in een eigen `createClient` met zijn Database-type en
 * eventueel zijn schema (`energy`, `home`); `public` is de standaard.
 */
export async function createServerSupabase<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Db = any,
  // Zelfde constraint als @supabase/ssr zelf, anders past S niet op zijn signature.
  S extends string & keyof Omit<Db, '__InternalSupabase'> = 'public' extends keyof Omit<Db, '__InternalSupabase'>
    ? 'public'
    : string & keyof Omit<Db, '__InternalSupabase'>,
>(schema?: S) {
  const cookieStore = await cookies()

  return createServerClient<Db, S>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      db: schema ? { schema } : undefined,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Aangeroepen vanuit een server component. proxy.ts ververst de
            // sessie, dus dit is veilig te negeren.
          }
        },
      },
    },
  )
}
