/**
 * De sessiecookie hoort bij het merk en niet bij één subdomein: met
 * `domain=.yoim.nl` is één Google-login goed voor yoim.nl, energ.yoim.nl en
 * home.yoim.nl tegelijk.
 *
 * Waarom een env var en niet `.yoim.nl` in de code: een browser weigert een
 * cookie voor `.yoim.nl` van `localhost`, en dan kun je lokaal niet meer
 * inloggen. Zet `NEXT_PUBLIC_COOKIE_DOMEIN=.yoim.nl` in Vercel en laat hem
 * lokaal leeg.
 *
 * `secure` staat erbij omdat @supabase/ssr het zelf niet zet. Zonder dat stuurt
 * de browser deze cookie, met het refresh token erin, ook naar een `*.yoim.nl`
 * host die geen https doet. Het hoort bij deze tak en niet erbuiten: lokaal
 * draait de app op http en dan zou de cookie nooit meer geschreven worden.
 */
export const cookieOptions = process.env.NEXT_PUBLIC_COOKIE_DOMEIN
  ? { domain: process.env.NEXT_PUBLIC_COOKIE_DOMEIN, secure: true }
  : undefined
