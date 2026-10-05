# mone.yoim in Claude Design

De groep `mone.yoim` in het Claude Design-project "Yoim Design System" komt uit deze map.
Hij staat daar als losse map `mone.yoim/`, naast de vergrendelde delen (`components/`,
`ui_kits/`, `tokens/`), en is hier bewaard zodat een volledige sync hem niet kwijtmaakt.

| Bestand | Kaart |
| --- | --- |
| `Onderdelen.html` | Onderdelen v0.4: de acht onderdelen van `@yoim/ds` v0.4, licht en donker |
| `Transacties`, `Budgetten`, `Budgetten leeg`, `Budget detail`, `Budget sheet`, `Profiel`, `Inzicht` (`telefoon` en `desktop`) | de pagina's, licht en donker; telefoon is af, desktop ligt qua structuur vast |
| `nakijken.js` | het gedrag van de nakijkkaart (vegen, kiezer) dat de Transacties-kaarten laden |
| `PROMPT-PAGINAS.md`, `CONTEXT-BUDGETTEN.md` | de bouwopdracht voor de pagina's en de logica van budgetten |
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

De pagina's worden in Claude Design zelf gemaakt en hier alleen bewaard (met DesignSync
`get_file` opgehaald); `Budgetten varianten.html` is groter dan 256 KiB en staat er daarom niet bij.

Uploaden gaat met DesignSync naar `mone.yoim/**` in het project, gevolgd door het seintje
`_ds_needs_recompile` zodat Claude Design zijn kaartindex opnieuw opbouwt.
