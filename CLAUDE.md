# @yoim/ds

Design system en inloglaag van de yoim-apps (Yoran en Imke): tokens, glas, auth, het
inlogscherm en de gedeelde componenten. Bronbestanden zonder build; elke app pint een tag.

| Nodig | Lees |
| --- | --- |
| Gebruik in een app, wat erin zit, uitrollen | `README.md` |
| Wat er per versie veranderde en wat een app moet doen | `CHANGELOG.md` |
| Het landschap en hoe Claude Design hierop aansluit | `docs/claude-design-brief.md` |
| Ontwerpen die hier als component landen | `design/` (per app een map met een README) |
| De afnemers | `../yoim` (hub), `../weekl.yoim`, `../energ.yoim`, `../mone.yoim`, `../home.yoim` |
| Master-roadmap van het hele huis | `../home.yoim/ROADMAP.md` |

## Invarianten

Harde regels. De rest van dit bestand is voorkeur; dit niet.

- **Dit is de enige plek voor tokens, glas en auth.** Een app stylt nooit
  buiten de tokens om en kopieert nooit iets hieruit. Wat een app mist, komt
  hier eerst bij.
- **Geen build, geen bundel.** Bronbestanden met relatieve imports; de app
  transpileert via `transpilePackages` en scant dit pakket met
  `@source "../node_modules/@yoim/ds"` in zijn `globals.css`. Zonder dat laatste
  genereert Tailwind de utility-klassen uit dit pakket niet.
- **Nooit een buitenschaduw op een oppervlak met `backdrop-filter`.** Zie de
  toelichting in `styles/glas.css`.
- **Een kaart heeft zijn titel erboven (`.groepkop`).** `.kaart` is een lijst
  van `.rij` zonder padding, of inhoud met `p-5`.
- **Elke wijziging is een versie.** Tag na elke merge die apps raakt; apps
  pinnen een tag, nooit `main`. Een breaking change krijgt in `CHANGELOG.md` een
  blok "Let op bij het bijwerken" met wat elke app moet aanpassen.
- **De tests blijven groen** (`npm test`) en `npm run typecheck` schoon
  voor elke tag.
- **Nooit een absoluut pad naar een andere repo.** Dit landschap wordt op meer
  dan een machine gebouwd: op de desktop staan de repo's in
  `C:/d/repositories/`, op de laptop in `~/Sandbox/`. Wat op allebei waar is,
  is dat ze naast elkaar in een map staan, dus een verwijzing schrijf je als
  `../naam`.
- **Nooit iets met Info Support (Yorans werkgever) op GitHub.** Geen rechten vragen of goedkeuren
  die de organisaties `infosupport` of `InfoSupportNederland` raken (geen `gh auth refresh` of
  `gh auth login` met extra scopes, geen OAuth-schermen), en nooit hun repo's lezen of wijzigen.
  Alleen `yymar/*`; op de MacBook gaat pushen via SSH, op de Windows-desktop via https met Yorans eigen Git-login; nooit een token of login met extra scopes.

## Werkwijze

- **Chirurgisch.** Raak alleen wat de vraag vereist; elke gewijzigde regel is herleidbaar naar
  de vraag. Geen aangrenzende code verbeteren. Wel: imports en variabelen opruimen die je eigen
  wijziging ongebruikt maakte.
- **Vragen in plaats van raden** als een verzoek twee lezingen heeft die tot wezenlijk ander
  werk leiden.
- **Pure logica zonder I/O** (`thema.ts`, `week.ts`, `money.ts`, `auth/*.ts` zonder netwerk)
  krijgt unit tests in een `*.test.ts` ernaast (vitest). Componenten en CSS niet; die controleer
  je in een app, in licht en donker, op telefoon en desktop.
- **Commit lokaal, push en tag pas als Yoran het zegt.** Hij wil een wijziging eerst zelf in een
  app bekijken. Een tag pushen is uitrollen: elke app die hem pint, krijgt hem bij de volgende
  `npm i`. Na het committen meld je welke commits klaarstaan.
- **Een app bijwerken naar een nieuwe versie** is een eigen commit in die app, met de punten uit
  "Let op bij het bijwerken". Een app die op een feature-branch staat, laat je met rust tot
  Yoran zegt waar het heen moet.
- **Comments zijn zeldzaam en kort.** Standaard geen. Alleen voor een niet-voor-de-hand-liggende
  keuze, een externe beperking of een waarschuwing. Nooit de code navertellen. Een gemeten maat
  (zoals `--nav-h`) zegt in zijn comment hoe hij gemeten is.
- **Ontwerp komt uit Claude Design** en landt hier als token of component, nooit rechtstreeks
  in een app.
- **Backlog staat op één plek:** `../home.yoim/ROADMAP.md`.
- **Diagrammen zijn Mermaid in fenced blocks**, bijgewerkt in dezelfde commit als de code.

## Voor elke commit

```bash
npm test
npm run typecheck
```

# Schrijfstijl

Gebruik geen em-dashes (U+2014) in code, comments, commit messages, documentatie
of antwoorden. En-dashes (U+2013) zijn ook geen vervanging. Gebruik in plaats
daarvan een komma, een dubbele punt, haakjes of gewoon twee zinnen.

**Taal in code.** Code is Engels: functies, variabelen, types, props, bestanden in `lib/`, en
in de database tabellen, kolommen, functies en policies. Een domeinbegrip zonder goede Engelse
vertaling mag Nederlands blijven (`potje`, `Nakijken`). Comments, UI-tekst, URL's, docs en
commits blijven Nederlands. Geldt voor nieuwe code; bestaande namen zet je alleen om als je ze
toch aanraakt, en een bestaande databasetabel hernoem je nooit alleen om de taal. In dit pakket
blijven klassen en tokens die apps al gebruiken (`.glas`, `--botergoud`) zoals ze zijn: hernoemen
breekt elke afnemer.
