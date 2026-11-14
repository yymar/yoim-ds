# home.yoim in Claude Design

Het ontwerp van het ronde menu in home.yoim.nl, uit het Claude Design-project "Yoim
Design System" (`ui_kits/home/`). Hier bewaard zodat een volledige sync het niet
kwijtmaakt. De kaarten laden `../../styles.css` uit dat project; buiten Claude Design
staan ze dus zonder tokens.

| Bestand | Wat |
| --- | --- |
| `Lampbediening.html` | de lamp: een levend exemplaar in licht en donker, elke toestand, de stip en de tabellen met maten, tokens, beweging, gedrag en toetsenbord |
| `Lampbediening-richtingen.html` | de richtingen naast elkaar waaruit Yoran per onderdeel koos |
| `PROMPT-LAMPBEDIENING.md` | de bouwopdracht van de lamp: deel 1 hier (v0.9.0), deel 2 in home.yoim |
| `Apparaten.html` | de andere apparaten (airco, tv-hoek, HomePod, Scooby, stekker, droger, P1-meter) in hetzelfde menu, met hun toestanden en tabellen |
| `PROMPT-APPARATEN.md` | de bouwopdracht van de apparaten: deel 1 hier (v0.10.0), deel 2 in home.yoim |

## Waar het landde

| Component | Bestand | Klasse |
| --- | --- | --- |
| `RadialMenu` | `components/radial-menu.tsx` | `.radiaal` |
| `ArcSlider` | `components/arc-slider.tsx` | `.boog` |
| `Swatch` | `components/swatch.tsx` | `.staal` |
| `ColorWheel` | `components/color-wheel.tsx` | `.kleurwiel` |
| `NowPlaying` | `components/now-playing.tsx` | `.speelt` |
| `PillRow` | `components/pill-row.tsx` | `.pilrij` |
| `PeekCard` | `components/peek-card.tsx` | `.kijkkaart` |
| `Hotspot` | `components/hotspot.tsx` | `.hotspot` |

De CSS staat in `styles/radiaal.css`, de meetkunde (boog, wiel, ring) met tests in
`radial.ts`. Waar de tabellen in `Lampbediening.html` en de code verschillen, wint de tabel.

## Waar de code bewust afwijkt

- **De kleine keuzes** (de leden van een groep, `PillRow`): in de HTML losse knopjes met een
  rand en een streepje in de kleur van het lid. Sinds 0.10.2 één baan zoals
  `SegmentedChoice`, met een stip per lid en het label van een `PillRow` erboven (Yoran,
  2026-11-14: de losse knopjes vond hij niet mooi). Neem dit mee bij een volgende ronde in
  Claude Design.
