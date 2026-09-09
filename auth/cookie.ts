/**
 * De sessiecookie hoort bij het merk en niet bij één subdomein: met
 * `domain=.yoim.nl` is één Google-login goed voor yoim.nl, energ.yoim.nl en
 * home.yoim.nl tegelijk.
 *
 * Waarom een env var en niet `.yoim.nl` in de code: een browser weigert een
 * cookie voor `.yoim.nl` van `localhost`, en dan kun je lokaal niet meer
 * inloggen. Zet `NEXT_PUBLIC_COOKIE_DOMEIN=.yoim.nl` in Vercel en laat hem
 * lokaal leeg.
 */
export const cookieOptions = process.env.NEXT_PUBLIC_COOKIE_DOMEIN
  ? { domain: process.env.NEXT_PUBLIC_COOKIE_DOMEIN }
  : undefined
