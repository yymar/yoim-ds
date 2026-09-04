# @yoim/ds

Design system en inloglaag van de yoim-apps. Zie `README.md` voor gebruik.

## Invarianten

- **Dit is de enige plek voor tokens, glas en auth.** Een app stylt nooit
  buiten de tokens om en kopieert nooit iets hieruit.
- **Geen build, geen bundel.** Bronbestanden met relatieve imports; de app
  transpileert via `transpilePackages`.
- **Nooit een buitenschaduw op een oppervlak met `backdrop-filter`.** Zie de
  toelichting in `styles/glas.css`.
- **Elke wijziging is een versie.** Tag na elke merge die apps raakt; apps
  pinnen een tag, nooit `main`.
- **`auth/*.test.ts` blijft groen** (`npm test`) en `npm run typecheck` schoon
  voor elke tag.

## Schrijfstijl

Geen em-dashes (U+2014), ook geen en-dashes als vervanging. Comments zeldzaam
en kort, alleen voor een niet-voor-de-hand-liggende keuze of waarschuwing.
