# home.yoim in Claude Design

Het ontwerp van de lampbediening in het ronde menu van home.yoim.nl, uit het Claude
Design-project "Yoim Design System" (`ui_kits/home/`). Hier bewaard zodat een volledige
sync het niet kwijtmaakt. De kaarten laden `../../styles.css` uit dat project; buiten
Claude Design staan ze dus zonder tokens.

| Bestand | Wat |
| --- | --- |
| `Lampbediening.html` | het gekozen ontwerp: een levend exemplaar in licht en donker, elke toestand, de stip en de tabellen met maten, tokens, beweging, gedrag en toetsenbord |
| `Lampbediening-richtingen.html` | de richtingen naast elkaar waaruit Yoran per onderdeel koos |
| `PROMPT-LAMPBEDIENING.md` | de bouwopdracht: deel 1 hier (v0.9.0), deel 2 in home.yoim |

## Waar het landde

| Component | Bestand | Klasse |
| --- | --- | --- |
| `RadialMenu` | `components/radial-menu.tsx` | `.radiaal` |
| `ArcSlider` | `components/arc-slider.tsx` | `.boog` |
| `Swatch` | `components/swatch.tsx` | `.staal` |
| `ColorWheel` | `components/color-wheel.tsx` | `.kleurwiel` |
| `Hotspot` | `components/hotspot.tsx` | `.hotspot` |

De CSS staat in `styles/radiaal.css`, de meetkunde (boog, wiel, ring) met tests in
`radial.ts`. Waar de tabellen in `Lampbediening.html` en de code verschillen, wint de tabel.
