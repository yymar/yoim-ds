# Prompt voor Claude Code: @yoim/ds v0.4, wat mone nodig heeft

Plak alles onder de lijn in Claude Code, in de repo `yoim-ds`.

---

mone.yoim.nl komt erbij en heeft acht dingen nodig die niet van mone alleen zijn. Bouw ze in `@yoim/ds` als v0.4, daarna pas in mone. Het ontwerp staat in het design system als template `templates/mone-onderdelen/` (`MoneOnderdelen.dc.html` toont alles in licht en donker, `mone-tokens.css` is het tokenblok). Deze prompt is de volledige spec als je daar niet bij kunt.

Werk zoals de repo werkt: commentaar in het Nederlands en uitleggen *waarom*, tokens in plaats van hex, glas alleen als materiaallaag met dekkende inhoud, capsules, concentrische radii, hover alleen als tint onder `(hover: hover) and (pointer: fine)`, layout op 745px (`breed`) en 1120px (`plannen`), 48px tap-vloer, geen em-dashes en geen en-dashes in microcopy.

## 0. Tokens

Plak `mone-tokens.css` in `tokens/colors.css` (`:root` en `[data-thema="licht"]`) en `tokens/dark.css` (media query en `[data-thema="donker"]`).

| token | licht | donker |
|---|---|---|
| `--cat-red` / `-bg` | `#a8434a` / `#f8e3e4` | `#e58a92` / `#2e1b1e` |
| `--cat-teal` / `-bg` | `#2b7d74` / `#e0efed` | `#6fc2b8` / `#172a27` |
| `--cat-olijf` / `-bg` | `#4c5c35` / `#e9ecdf` | `#c3d6a1` / `#22281a` |
| `--heat-0` | `#eceae1` | `#262a22` |
| `--heat-1` | `#dadfd2` | `#3d4530` |
| `--heat-2` | `#aeb99c` | `#63724b` |
| `--heat-3` / `--heat-3-fg` | `#6b7f4b` / `#ffffff` | `#9cb573` / `#161a12` |

- **`--cat-red` krijgt een eigen tint.** Hij had de waarde van `--danger`; dan is een categorie niet van een signaal te onderscheiden. De nieuwe tint ligt een stap richting framboos en blijft rood genoeg voor de Notion-lijst.
- Daardoor: `Melding` toon `fout` gebruikt `--danger` als tekst en een eigen achtergrond, niet meer `--cat-red`/`--cat-red-bg`. Zoek ook in weekl en energ naar `--cat-red` als signaal (energ: de tegelkleur "slecht") en zet die op `--danger`.
- `--heat-*` zijn letterlijke waarden, geen `color-mix`: een `var()` in een custom property lost op waar hij gedeclareerd wordt. Ze volgen het accent, omdat uitgeven geen goed of fout is. energ mag zijn `color-mix` in `Kalender` houden; dat is een eigen schaal op groen.

## 1. `Navigatie`

Eén onderdeel dat `OnderNavigatie` en `ZijNavigatie` samenvoegt; die twee blijven als interne vormen.

```ts
type Route = { id: string; label: string; icoon: string; aantal?: number };
<Navigatie routes={Route[]} actief={string} onKies merk={ReactNode}
  account={{ naam, huishouden, initiaal, kleur }} thema onThema onUitloggen />
```

- 3 tot 5 routes; buiten dat bereik een `console.warn`. De lozenge rekent met `routes.length`, niet met een vaste 3.
- **Onder 745px:** de zwevende capsule zoals nu, 16px van de randen, 12px plus safe area van onder. Labels 11px, `nowrap`; bij vijf routes is elk vak ~70px, dus labels tot 12 tekens. Account staat dan niet in de capsule: de app zet een avatar (36px in een tapvlak van 48px) rechts in `PaginaKop`.
- **Vanaf 745px:** de rail van `--rail-b`, regular glas, geen buitenschaduw. Drie zones:
  - `merk`: een slot, de app levert zijn woordmerk. Het `YoIm`-woordmerk dat nu hard in `ZijNavigatie` staat, verhuist naar weekl.
  - routes met de schuivende lozenge, `aantal` als capsule rechts.
  - voet: thema-segment (Licht/Donker), dan de accountrij (avatar 32px, naam, huishouden) met rechts een icoonknop `log-out` van 48px met `aria-label="Uitloggen"`.
- `aantal` op de telefoon: een badge van 16px in accent rechtsboven het icoon.

## 2. `StatusRegel`

```ts
<StatusRegel toestand="binnenkort" | "verlopen" | "mislukt" tekst actie onActie />
```

- Geen toestand of `toestand="goed"`: rendert `null`. Hooguit één tegelijk; de app kiest de ergste.
- Thin glas (`--glass-thin`, `--glass-blur-thin`, `--glass-border`, `--glass-rim`), capsule, `min-height: var(--tap)`. De hele regel is de knop; `actie` staat rechts in `--accent`, semibold.
- Links een rondje van 30px met een icoon van 16px:
  - binnenkort: `clock`, `--botergoud` op `--botergoud-soft`, tekst `--text`;
  - verlopen: `circle-alert`, `--surface-raised` op `--danger`, tekst `--text`;
  - mislukt: `cloud-off`, `--text-muted` op `--surface-sunken`, tekst `--text-muted`.
- Boven de inhoud, onder de paginakop niet: hij staat bovenaan de kolom, voor de titel.
- `role="status"`; bij verlopen `role="alert"`.

## 3. `LeegStaat`

De bestaande krijgt een optionele prop `icoon`: lucide, 28px, `--text-subtle`, dikte 1,8, zonder plaat, 6px extra ruimte eronder. Het icoon zegt waar je bent (lijst nakijken, rekeningen), niet wat er mist. Werk het commentaar bij: "geen icoon" wordt "icoon mag, als plaats, nooit als metafoor van leegte". `actie` blijft een stille knop (`--surface-sunken`, capsule, 48px), nooit accentgevuld. weekl gebruikt daarna deze, niet zijn eigen.

## 4. `Balk`

```ts
<Balk waarde={number} max={number} markering?={number /* 0..1 */} />
```

- Spoor 8px, `--surface-sunken`, capsule. Vulling in de toestandskleur.
- Toestand op `x = waarde / max`:
  - `over` als `x > 1`, in `--danger`;
  - `bijna` als `0,9 <= x < 1`, in `--botergoud`;
  - anders `binnen`, in `--accent`. **Precies 1 is binnen.**
- Markering: 2px breed, 16px hoog, `--text`, met een ring van 2px in `--surface-raised` zodat hij los van de vulling leest.
- Bij `over` schaalt de balk naar de waarde: vulling 100%, en de markering staat op `max / waarde` en betekent dan het einde van het budget.
- Voor "deze periode naast het gemiddelde": `max = max(waarde, gemiddelde) * 1,25`, markering op `gemiddelde / max`, vulling in `--accent`.
- Exporteer `toestand(x)` los, zodat de regeltekst ernaast dezelfde regel volgt. De regel eronder is `--text-muted` ("nog € 331,80", "nog € 9,00, bijna op", "precies op"), alleen bij over `--danger` ("€ 28,50 over"). Kleur op de balk, niet op de tekst: botergoud haalt op wit geen 4,5:1.
- `role="meter"` met `aria-valuenow`, `aria-valuemax` en een `aria-valuetext` met het bedrag.

## 5. Heatmap

Alleen de tokens uit §0. Niveau 0 is geen uitgaven; 1 tot 3 zijn de terciles van de dagen met uitgaven in de periode. Exporteer een helper `heatNiveau(waarden: number[]) => (v) => 0|1|2|3`. Op niveau 3 is de tekst `--heat-3-fg`, op 0 `--text-muted`, anders `--text`.

## 6. Categoriekleuren

Zie §0. Elf paren. In mone staat een categoriekleur altijd naast icoon en naam, nooit los als signaal; met de nieuwe `--cat-red` is dat ook visueel waar. Werk `CategorieLabel` bij zodat `teal` en `olijf` geldige waarden zijn.

## 7. `DonutLijst`

```ts
<DonutLijst items={{ naam, icoon, kleur, bedrag, budget? }[]} totaal kop />
```

- Donut 112px op de telefoon, 160px vanaf `breed` (container query). Ring 14px, 2px lucht tussen de stukken via `stroke-dasharray`, start bovenaan, met de klok mee, grootste eerst. Geen labels in de ring.
- Naast de donut: `kop` (13px, `--text-muted`) en het totaal als `Bedrag` groot.
- Daaronder de lijst: per rij een stip van 8px in de categoriekleur, het icoon 18px in `--text-muted`, de naam, het bedrag rechts. Met `budget` komt `Balk` eronder, ingesprongen tot onder de naam, 6px hoog, markering op vandaag.
- De lijst is de hoofdzaak: de donut is `aria-hidden`, de lijst draagt alle informatie.

## 8. `Bedrag`

```ts
<Bedrag waarde={number} soort="uit" | "in" | "neutraal" | "telt-niet" grootte="groot" | "regel" | "klein" />
formatBedrag(waarde, soort): string
```

- `€`, harde spatie, `nl-NL` met twee decimalen: `€ 1.234,56`. Altijd twee decimalen, ook bij ronde bedragen.
- Het teken staat voor het euroteken, zodat een kolom op het teken lijnt:
  - `uit`: echte min (U+2212), `−€ 42,18`, in `--text`. **Nooit rood voor een gewone uitgave.**
  - `in`: `+€ 2.400,00` in `--success`.
  - `telt-niet` (overboeking tussen eigen rekeningen): geen teken, `--text-subtle`; de naam in de rij wordt `--text-muted`.
- Altijd `font-variant-numeric: tabular-nums`, in kolommen rechts uitgelijnd.
- Groottes: groot 30px semibold `-0.02em`, regel 15px medium, klein 13px regular.
- Voor schermlezers: `aria-label` met "min" of "plus" voluit.

## Klaar als

- [ ] Tokens staan in licht, donker en beide `[data-thema]` spiegels.
- [ ] `Melding` fout en de energ-tegel "slecht" gebruiken `--danger`, niet `--cat-red`.
- [ ] `Navigatie` klopt met 3, 4 en 5 routes op 390 en op 1280; de lozenge staat op de goede plek.
- [ ] `Balk`: tests voor 0,89, 0,9, 0,999, 1 en 1,01.
- [ ] `formatBedrag`: tests voor 0, 0,5, 1234,56, −42,18 en 1000000.
- [ ] Cards in het design system voor alle acht, in licht en donker.
- [ ] Versie naar 0.4.0, CHANGELOG bijgewerkt, daarna `/design-sync`.
