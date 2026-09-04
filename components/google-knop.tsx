'use client'

import { useState } from 'react'

import { createBrowserSupabase } from '../auth/client'

/**
 * De enige manier naar binnen: één knop over de volle breedte. Geen e-mail,
 * geen wachtwoord, geen "account aanmaken", de allowlist bepaalt wie erin mag.
 */
export function GoogleKnop({ label }: { label?: string }) {
  const [bezig, setBezig] = useState(false)

  async function inloggen() {
    setBezig(true)

    const supabase = createBrowserSupabase()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // Zonder deze twee geeft Google na de eerste keer geen refresh token
          // meer, en dan moeten Yoran en Imke telkens opnieuw inloggen.
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      setBezig(false)
    }
  }

  // Inloggen met Google is Google's knop: dekkend, nooit accentgevuld. Die
  // vorm en dat oppervlak zijn niet van ons om in glas te zetten; zijn
  // container mag wel materiaal zijn, en op het inlogscherm is dat de tray.
  return (
    <button
      type="button"
      onClick={inloggen}
      disabled={bezig}
      className="relative flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-[var(--radius-tray-knop)] border border-[var(--border)] bg-[var(--surface-raised)] px-5 text-base font-medium text-[var(--text)] shadow-[var(--glass-highlight),var(--glass-lift-1)] transition-transform duration-[var(--dur-glas)] ease-[var(--ease-glas)] active:scale-[var(--press-scale)] disabled:text-[var(--text-muted)] disabled:opacity-60"
    >
      <GoogleLogo />
      {bezig ? 'Bezig met inloggen…' : (label ?? 'Inloggen met Google')}
    </button>
  )
}

function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}
