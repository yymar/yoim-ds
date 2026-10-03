# mone.yoim in Claude Design

De groep `mone.yoim` in het Claude Design-project "Yoim Design System" komt uit deze map.
Hij staat daar als losse map `mone.yoim/`, naast de vergrendelde delen (`components/`,
`ui_kits/`, `tokens/`), en is hier bewaard zodat een volledige sync hem niet kwijtmaakt.

| Bestand | Kaart |
| --- | --- |
| `Onderdelen.html` | Onderdelen v0.4: de acht onderdelen van `@yoim/ds` v0.4, licht en donker |
| `Telefoon.html` | Overzicht · telefoon (390 x 844), licht en donker |
| `Desktop.html` | Overzicht · desktop (1280 x 832, zijrail), licht en donker |
| `mone-tokens.css` | de tokens die de kaarten naast `../styles.css` laden |
| `PROMPT-CLAUDE-CODE.md` | de bouwspec van v0.4 |

## Opnieuw maken

De kaarten zijn omgezet uit de Claude Design-templates in `bron/` (`*.dc.html`). `convert.cjs`
vult per thema de waarden in, haalt `sc-if` weg en zet de iconen om naar inline lucide-SVG;
`card.py` zet de thema's naast elkaar met de `@dsCard`-regel voor groep `mone.yoim`.

```sh
cd bron
node convert.cjs MoneOnderdelen.dc.html '{"thema":"licht","routes":"3"}' > licht.html
node convert.cjs MoneOnderdelen.dc.html '{"thema":"donker","routes":"3"}' > donker.html
python3 card.py ../Onderdelen.html "Onderdelen v0.4" 2460x5400 "<subtitel>" licht.html donker.html
```

Telefoon en desktop gaan net zo, met `MoneTelefoon.dc.html` en `MoneDesktop.dc.html`, props
`{"thema":"licht","status":"binnenkort"}` en viewports 940x1020 en 2720x1020.

Uploaden gaat met DesignSync naar `mone.yoim/**` in het project, gevolgd door het seintje
`_ds_needs_recompile` zodat Claude Design zijn kaartindex opnieuw opbouwt.
