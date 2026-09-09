import { createBrowserClient } from '@supabase/ssr'

import { cookieOptions } from './cookie'

/**
 * Supabase-client voor client components. RLS is de enige autorisatielaag;
 * er is bewust geen service-role client aan de browserkant.
 *
 * Elke app wikkelt dit in een eigen `createClient` met zijn Database-type.
 */
export function createBrowserSupabase<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Db = any,
  // Zelfde constraint als @supabase/ssr zelf, anders past S niet op zijn signature.
  S extends string & keyof Omit<Db, '__InternalSupabase'> = 'public' extends keyof Omit<Db, '__InternalSupabase'>
    ? 'public'
    : string & keyof Omit<Db, '__InternalSupabase'>,
>(schema?: S) {
  return createBrowserClient<Db, S>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      db: schema ? { schema } : undefined,
    },
  )
}
