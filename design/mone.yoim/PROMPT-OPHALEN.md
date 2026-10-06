# Prompt voor Claude Code: zelf ophalen in mone.yoim

Plak alles onder de lijn in Claude Code, in de repo van mone.yoim.

---

Ophalen kan nu alleen in Profiel. Het komt in de kop van Transacties. Het ontwerp staat in het design system: `mone.yoim/Ophalen voorstellen.html` (drie varianten, zeven staten, desktop en telefoon; de logica staat in `oph.js`, prototypecode). **Gekozen: variant A, knop bij het saldo.** Uitgewerkt in `Transacties v2.html` (desktop: knop rechts in de kop; telefoon: omlaag trekken; het derde scherm toont "net opgehaald"); de code staat in `tx2-app.js` (`fetchRun` en het trekken). Alle zeven staten staan in `Ophalen voorstellen.html`. B en C staan er alleen ter vergelijking. Werk chirurgisch, zoals `CLAUDE.md` zegt.

## Gedrag, voor elke variant

### Techniek: zo werkt zelf ophalen met Enable Banking

Lees dit eerst en controleer het tegen de huidige code (`app/api/...` of de edge function die nu "Ophalen" in Profiel bedient) en de docs van Enable Banking. Pas aan wat er al staat; bouw geen tweede route.

- **Geen aparte pagina, geen redirect.** Zelf ophalen is een gewone serveraanroep op de bestaande sessie: `GET /accounts/{id}/balances` en `GET /accounts/{id}/transactions` (met `date_from` vanaf het laatste ophalen min een paar dagen, en `continuation_key` tot het eind). De gebruiker blijft in de app. Alleen een **nieuwe of verlopen toestemming** gaat via de bank (`POST /auth` → redirect → `POST /sessions`); dat is Vernieuwen in de bankmelding, nooit de ververs-knop.
- **PSU-headers bij zelf ophalen.** Stuur bij een ronde die de gebruiker start `Psu-Ip-Address` (IP van de gebruiker uit het request; achter een proxy uit `x-forwarded-for`, eerste waarde) en `Psu-User-Agent` (user-agent van de browser) mee op elke aanroep naar Enable Banking. Volgens de Enable Banking-FAQ vertelt een PSU-header de bank dat de gebruiker er zelf bij is, en geldt de limiet voor ophalen op de achtergrond (vaak 4 per dag) dan niet. Controleer per bank `required_psu_headers` (uit `GET /aspsps`); een fout gevulde header geeft `PSU_HEADER_INVALID`.
- **Nooit PSU-headers bij de geplande rondes** (06:00, 11:00, 16:00, 21:00). Die tellen voor de vier per dag. Een cron die zich voordoet als gebruiker is niet toegestaan, en de app moet nooit doen alsof de gebruiker er was.
- **Bescherming in de server, niet alleen in de knop.** De knop uitzetten is gemak; de server is de waarheid:
  - Een tabel of kolom per persoon `mone.fetch_runs (user_id, started_at, finished_at, kind 'manual'|'scheduled', status, per_account jsonb)`.
  - **Eén ronde tegelijk per persoon:** start alleen als er geen ronde loopt (`finished_at is null` en `started_at` minder dan 5 minuten geleden; een ronde die langer hangt telt als mislukt). Gebruik een advisory lock of een unieke partial index zodat twee tikken tegelijk nooit twee rondes worden.
  - **Afkoelen 5 minuten** na een `manual` ronde: de server weigert met `429` en `retry_at`; de UI toont "Net opgehaald, kan weer om 16:17" uit die `retry_at`, niet uit een eigen klok.
  - **Daglimiet zelf ophalen:** maximaal 12 handmatige rondes per persoon per dag. Daarna: "Vandaag genoeg opgehaald, de app haalt om 21:00 weer op." Zo kan niemand de bank spammen, ook niet met een script of meerdere tabbladen.
  - **Opnieuw voor één mislukte rekening** telt als handmatige ronde voor alleen die rekening, mag tijdens het afkoelen, maximaal 2 keer per rekening per uur.
- **Als de bank remt.** Antwoord `429` of `ASPSP_RATE_LIMIT_EXCEEDED` voor een rekening: zet die rekening op `paused_until` (gebruik `Retry-After` als die er is, anders 30 minuten) en sla haar over in handmatige én geplande rondes tot dan. De kop zegt "ABN vraagt even geduld, weer om 16:20". Geen automatische herhaling binnen de ronde, geen exponentieel opnieuw proberen door de client.
- **Toestemming verlopen** (`401`, sessie `EXPIRED`/`REVOKED`, of `valid_until` voorbij): sla de rekening over zonder aanroep naar de bank, markeer haar als verlopen, en toon de bankmelding met Vernieuwen. Nooit proberen op te halen bij een verlopen sessie.
- **Zuinig ophalen.** Per rekening één keer saldo en één keer transacties per ronde; alle rekeningen van één sessie achter elkaar, niet parallel per bank (max. 2 tegelijk over alle banken). Geen extra `GET /accounts/{id}/details` bij elke ronde.
- **Voortgang naar de app.** De ronde draait op de server en schrijft per rekening de status (`wacht`, `bezig`, `klaar +n`, `fout`) in `fetch_runs.per_account`; de app luistert via Supabase Realtime (of pollt elke 2 s zolang de ronde loopt). Sluit je de app tijdens een ronde, dan loopt die gewoon af. Bij terugkomst toont de kop het resultaat.
- **Tests:** twee gelijktijdige starts geven één ronde; een start binnen 5 minuten geeft `429` met `retry_at`; de 13e handmatige ronde van de dag wordt geweigerd; een rekening met `paused_until` wordt overgeslagen; een verlopen sessie doet geen aanroep naar de bank; geplande rondes sturen nooit PSU-headers.

### In de interface

- **Eén ronde tegelijk.** Tijdens het ophalen is de knop uit (`aria-disabled`, uitleg in `title`: "Bezig met ophalen").
- **Afkoelen.** Na een ronde staat de knop vijf minuten uit: "Net opgehaald, kan weer om 16:17". Zo belasten we de banken niet, ook al telt zelf ophalen niet mee voor de vier automatische keren.
- **Opnieuw** na een mislukte rekening haalt alleen die rekening op en mag tijdens het afkoelen.
- **Laatst opgehaald** staat voor alles samen in de kop: "Opgehaald 16:00", of "gisteren 21:00", of "zo 4 okt". Neem het oudste tijdstip van de gekoppelde rekeningen.
- **Per rekening** zie je in het kaartje hoe het ging: een ring om het logo terwijl die rekening bezig is (grijs als hij nog wacht, met een draaiend stuk in `--accent` als hij bezig is). Daarna een badge: "+3" in `--accent` bij nieuwe transacties, een vinkje bij niets nieuws, "!" in `--botergoud` bij een fout. Bij variant C staat het als tekst in plaats van het saldo.
- **Nieuw in de lijst:** nieuwe transacties krijgen een gok uit de regels, maar zijn nog niet bevestigd. Ze staan dus in Nakijken en tonen de bestaande botergouden stip voor de gok (zoals in `Transacties v2.html`), geen tweede stip. Wat ze "nieuw" maakt: de rij licht één keer kort op in `--accent-soft` (2,4 s, daarna weer gewoon een rij; zonder animatie bij reduced motion), en rechts in het daghoofd staat "2 nieuw" tot je de pagina verlaat. Geen blijvende achtergrond: dat wordt een kaart in een kaart. Het getal bij Nakijken (zijbalk, tabbalk) loopt mee op. Komt punt 8b uit `PROMPT-CATEGORIEEN.md` later (vanzelf indelen als de app zeker is), dan krijgen alleen de onzekere de botergouden stip; de rest is gewoon nieuw.
- **Staten in de kop:**
  - Rust: "Opgehaald 16:00".
  - Bezig: "Ophalen, 1 van 4".
  - Klaar: "5 nieuw · 16:12" of "Alles was al bij · 16:12".
  - Deels mislukt: "bunq lukte niet" met **Opnieuw**.
  - Te veel verzoeken: "ABN vraagt even geduld, weer om 16:20".
  - Toestemming verlopen: in de kop alleen "Opgehaald 16:00 · PayPal overgeslagen", zonder knop. Vernieuwen zit in de bankmelding.
  - Waarschuwingen in `--botergoud`, nooit rood.
- **Geen dubbele meldingen.** Op Transacties gebruik je de toast niet voor ophalen; de kop zegt het al. Een verlopen toestemming blijft de bankmelding (capsule) met Vernieuwen plus de "!" op de avatar en op het kaartje. Dat is de enige plek met Vernieuwen: de kop zegt alleen "PayPal overgeslagen", zonder tweede knop, en ophalen slaat die rekening over. Vanuit Profiel blijft de bestaande toast.
- **Telefoon: omlaag trekken, geen knop.** Bovenaan de lijst omlaag trekken start de ronde, zoals in iOS. De pagina schuift mee met de helft van de afstand, tot maximaal 88px. In de ruimte die daarboven vrijkomt staat een rond icoon van 36px, verticaal gecentreerd. Het icoon staat altijd boven de titel en nooit over de inhoud. Het draait mee met hoe ver je trekt en wordt vanaf 56px `--accent` op `--accent-soft`: loslaten haalt op. Tijdens ophalen of afkoelen gaat de pagina maar 56px mee, en staat naast het grijze icoon "Bezig met ophalen" of "Net opgehaald, weer om 16:17". Loslaten doet dan niets, er draait nooit een tweede ronde. Na het loslaten veert alles terug; de voortgang staat daarna in de kop, niet in de trekzone. De status in de kop ("Opgehaald 16:00") is als terugval ook een knop met dezelfde regels, voor wie niet trekt of een schermlezer gebruikt. Op desktop is de status zelf de knop (zie variant A).
- **`prefers-reduced-motion`:** geen draaien maar een rustige puls, en geen in- of uitschuiven.
- Tikvlakken minimaal 44px. Hover alleen op `(hover: hover) and (pointer: fine)`. Alleen tokens, microcopy zonder em-dashes of en-dashes.

## De varianten

- **A · Status als knop:** op desktop één stille capsule rechts in de eerste regel van de kop, 36px hoog, met icoon en tekst samen: "↻ Opgehaald 16:00". Geen losse ronde knop. Tijdens het ophalen staat er "Ophalen, 1 van 4" op `--accent-soft` met een draaiend icoon; daarna "✓ 3 nieuw · 16:12" en de knop is uit tijdens het afkoelen. Hover (`--surface-sunken`) alleen op fijne pointers. Ingeklapt staat dezelfde capsule rechts in de rekeningenregel. Op de telefoon geen knop, alleen omlaag trekken (zie boven).
- **B · Lijn in de kaart:** de status is zelf de knop (capsule rechts in de kop, 44px hoog). Bovenin de kaart loopt een lijn van 3px met een stuk per rekening, dat vol loopt in `--accent` (of `--botergoud` bij een fout).
- **C · Eerste kaartje:** een kaartje "Ophalen · 16:00" vooraan in de rij rekeningen. De kaartjes tonen tijdens en na de ronde hun status als tekst.

## Klaar als

- [ ] Zelf ophalen zonder redirect, met PSU-headers; geplande rondes zonder.
- [ ] Bescherming in de server: één ronde tegelijk, 5 minuten afkoelen, max. 12 per dag, `paused_until` na een `429` van de bank, met tests.
- [ ] Eén ronde tegelijk, vijf minuten afkoelen, Opnieuw alleen voor de mislukte rekening.
- [ ] Alle zeven staten zoals in het prototype, op telefoon en desktop, licht en donker.
- [ ] Nieuwe transacties herkenbaar in de lijst tot je de pagina verlaat.
- [ ] Geen toast voor ophalen op Transacties, geen dubbele melding bij verlopen toestemming.
- [ ] Reduced motion gerespecteerd.
