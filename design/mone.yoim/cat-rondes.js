/* Categorieën: twee eenmalige rondes om Splits In en Splits Uit uit te faseren.
   1. Oude Tikkies koppelen aan de uitgave waarvoor ze zijn (verandert alleen het netto).
   2. Splits Uit verdelen over de echte categorieën.
   Een kaart tegelijk, zoals Nakijken. Elke stap is een tik van de gebruiker, met Ongedaan maken. */
(() => {
const X = window.TX2, Y = window.CATX, { tone, eur, signed, dm, store, at, iso } = X, { ico } = Y;

const EXP = [
  ['e1','2026-10-01','Loetje Den Haag',-24000,'eten'], ['e10','2026-10-02','Thuisbezorgd.nl',-2755,'eten'], ['e2','2026-09-30','Albert Heijn 1222',-1876,'bood'],
  ['e3','2026-09-28','Bol.com',-2999,'shop'], ['e4','2026-09-28','Bijenkorf',-3000,'shop'], ['e9','2026-09-27','Shell Den Haag',-7200,'auto'],
  ['e5','2026-09-20','Pathé Spuimarkt',-4700,'sport'], ['e6','2026-09-19','Bar Bodega',-6400,'eten'], ['e7','2026-09-13','Albert Heijn 1222',-8240,'bood'],
  ['e8','2026-09-12','Thuisbezorgd.nl',-3480,'eten'], ['e11','2026-09-06','Lidl Laakhaven',-2310,'bood'], ['e12','2026-09-03','Bouldermuur Den Haag',-2420,'sport']
].map(([id, d, who, amt, cat]) => ({ id, d, who, amt, cat }));
const TK = [
  ['k1','2026-10-03','Tikkie van Sanne Bakker',6000,'Tikkie ID 001290412, etentje Loetje, Van S. Bakker','e1','"Loetje" in de omschrijving, 2 dagen eerder'],
  ['k2','2026-10-03','Tikkie van Tim de Wit',6000,'Tikkie ID 001290433, etentje Loetje, Van T. de Wit','e1','"Loetje" in de omschrijving, 2 dagen eerder'],
  ['k3','2026-10-04','Tikkie van Imke de Vries',6000,'Tikkie ID 001290587, Loetje, Van I. de Vries','e1','"Loetje" in de omschrijving, 3 dagen eerder'],
  ['k4','2026-09-29','Tikkie van Imke de Vries',1500,'Tikkie ID 001288190, voor Bijenkorf, Van I. de Vries','e4','"Bijenkorf" in de omschrijving, 1 dag eerder'],
  ['k5','2026-09-21','Tikkie van Tim de Wit',2350,'Tikkie ID 001286630, bios, Van T. de Wit','e5','Precies de helft van € 47,00, 1 dag eerder'],
  ['k6','2026-09-14','Betaalverzoek van Lars Jansen',4120,'ABN AMRO Betaalverzoek, Van L. Jansen','e7','Precies de helft van € 82,40, 1 dag eerder'],
  ['k7','2026-09-08','Tikkie van K. Peters',1200,'Tikkie ID 001284002, Van K. Peters',null,'']
].map(([id, d, who, amt, desc, guess, why]) => ({ id, d, who, amt, desc, guess, why, acc:'asn-y' }));
const SU = [
  ['s1','2026-09-30','Tikkie aan Sanne Bakker',-2200,'Tikkie, weekend Texel huisje, aan S. Bakker',[['reis','"Texel" en "weekend" in de omschrijving'],['eten','Sanne: 3× Eten & Drinken']]],
  ['s2','2026-09-12','Wiebetaaltwat',-3875,'WBW lijst Lowlands 2026, aan L. Jansen',[['sport','"Lowlands": eerder 2× Sport & Hobbies'],['reis','"Lowlands" ook 1× Vakantie & Reizen']]],
  ['s3','2026-09-02','Tikkie aan Tim de Wit',-1450,'Tikkie, pizza, aan T. de Wit',[['eten','"pizza": 12× Eten & Drinken']]],
  ['s4','2026-08-28','Tikkie aan Imke de Vries',-3120,'Tikkie, boodschappen weekend, aan I. de Vries',[['bood','"boodschappen" in de omschrijving'],['vbood','Imke: 2× Vaste Boodschappen']]],
  ['s5','2026-08-15','Tikkie aan K. Peters',-900,'Tikkie, aan K. Peters',[['eten','K. Peters: 1× Eten & Drinken'],['other','Geen woorden om op te gokken']]]
];
const MORE = [
  ['Tikkie aan Tim de Wit','Tikkie, bioscoop, aan T. de Wit',[['sport','"bioscoop": 4× Sport & Hobbies']]],
  ['Tikkie aan Sanne Bakker','Tikkie, Thuisbezorgd, aan S. Bakker',[['eten','"Thuisbezorgd": 31× Eten & Drinken']]],
  ['Tikkie aan Lars Jansen','Tikkie, cadeau Mark, aan L. Jansen',[['shop','"cadeau": 6× Shopping & Persoonlijk']]],
  ['Tikkie aan Tim de Wit','Tikkie, benzine Ardennen, aan T. de Wit',[['auto','"benzine": 22× Auto & Transport'],['reis','"Ardennen" in de omschrijving']]],
  ['Tikkie aan Sanne Bakker','Tikkie, borrel, aan S. Bakker',[['eten','"borrel": 9× Eten & Drinken']]],
  ['Wiebetaaltwat','WBW lijst Skireis 2026, aan L. Jansen',[['reis','"Skireis" in de omschrijving']]],
  ['Tikkie aan Imke de Vries','Tikkie, AH, aan I. de Vries',[['bood','"AH": 40× Boodschappen']]]
];
for (let i = 0; i < 14; i++) { const [who, desc, sug] = MORE[i % MORE.length], d = new Date(Date.UTC(2026, 7, 10) - i * 9 * 864e5).toISOString().slice(0, 10); SU.push([`s${6 + i}`, d, who, -(800 + ((i * 1373) % 4200)), desc, sug]); }
const SUI = SU.map(([id, d, who, amt, desc, sug]) => ({ id, d, who, amt, desc, sug, acc: who === 'Wiebetaaltwat' ? 'bunq' : 'asn-y' }));
const tk = id => TK.find(t => t.id === id), su = id => SUI.find(t => t.id === id), ex = id => EXP.find(e => e.id === id);

function init(ctx, opt) {
  const splin = ctx.get('splin'), splout = ctx.get('splout');
  if (splout) { splout.n = SUI.length; splout.af = -SUI.reduce((s, t) => s + t.amt, 0); }
  ctx.r = { t:{ q:TK.map(t => t.id), log:[], pick:false, pickId:null, pq:'', sum:0, links:{}, total:splin ? splin.n : 0 }, s:{ q:SUI.map(t => t.id), log:[], all:false, aq:'', total:SUI.length } };
  for (let i = 0; i < (opt.tikStep || 0); i++) linkT(ctx, tk(ctx.r.t.q[0]), ex(tk(ctx.r.t.q[0]).guess));
  for (let i = 0; i < (opt.splitsStep || 0); i++) pickS(ctx, su(ctx.r.s.q[0]), su(ctx.r.s.q[0]).sug[0][0]);
}

/* Bewerkingen, elk met een tegenhanger voor Ongedaan maken */
function linkT(ctx, item, e) {
  const R = ctx.r.t, splin = ctx.get('splin'), cat = ctx.get(e.cat);
  R.links[e.id] = (R.links[e.id] || 0) + item.amt; R.sum += item.amt;
  if (splin) { splin.n--; splin.bij -= item.amt; } if (cat) cat.bij += item.amt;
  const en = { type:'link', item, e }; R.log.unshift(en); R.q.splice(R.q.indexOf(item.id), 1); R.pick = false; R.pickId = null; return en;
}
function skipT(ctx, item) { const R = ctx.r.t, en = { type:'skip', item }; R.log.unshift(en); R.q.splice(R.q.indexOf(item.id), 1); R.pick = false; R.pickId = null; return en; }
function undoT(ctx, en) {
  const R = ctx.r.t, i = R.log.indexOf(en); if (i < 0) return; R.log.splice(i, 1); R.q.unshift(en.item.id); R.pick = false; R.pickId = null;
  if (en.type === 'link') { const splin = ctx.get('splin'), cat = ctx.get(en.e.cat); R.links[en.e.id] -= en.item.amt; R.sum -= en.item.amt; if (splin) { splin.n++; splin.bij += en.item.amt; } if (cat) cat.bij -= en.item.amt; }
}
function pickS(ctx, item, catId) {
  const R = ctx.r.s, so = ctx.get('splout'), cat = ctx.get(catId);
  if (cat) { cat.n++; cat.af -= item.amt; } if (so) { so.n--; so.af += item.amt; }
  const en = { type:'pick', item, cat:catId }; R.log.unshift(en); R.q.splice(R.q.indexOf(item.id), 1); R.all = false; R.aq = ''; return en;
}
function skipS(ctx, item) { const R = ctx.r.s, en = { type:'skip', item }; R.log.unshift(en); R.q.splice(R.q.indexOf(item.id), 1); R.all = false; R.aq = ''; return en; }
function undoS(ctx, en) {
  const R = ctx.r.s, i = R.log.indexOf(en); if (i < 0) return; R.log.splice(i, 1); R.q.unshift(en.item.id);
  if (en.type === 'pick') { const so = ctx.get('splout'), cat = ctx.get(en.cat); if (cat) { cat.n--; cat.af += en.item.amt; } if (so) { so.n++; so.af -= en.item.amt; } }
}

/* Opbouw */
const cardS = 'display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-card)';
const mono = s => `<span class="cm-mono" style="padding:10px 12px;border-radius:12px;background:var(--surface-sunken);font-size:12px;line-height:1.5;color:var(--text-muted);word-break:break-word">${s}</span>`;
const stat = (l, v, c) => `<span style="display:flex;flex-direction:column;gap:1px"><span style="font-size:12px;color:var(--text-muted)">${l}</span><b style="font-size:22px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums;${c ? `color:${c}` : ''}">${v}</b></span>`;
const bar = f => `<span style="display:block;height:6px;border-radius:999px;background:var(--surface-sunken);overflow:hidden"><span style="display:block;height:100%;width:${Math.max(2, Math.round(f * 100))}%;border-radius:999px;background:var(--accent);transition:width .3s"></span></span>`;
const btn = (act, label, kind, icon, extra = '', data = '') => `<button data-act="${act}" ${data} style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;min-height:48px;padding:0 16px;border-radius:999px;border:0;font:inherit;font-size:15px;font-weight:600;cursor:pointer;${kind === 'primary' ? 'background:var(--accent);color:var(--accent-fg)' : kind === 'quiet' ? 'background:transparent;color:var(--text-muted)' : 'background:var(--surface-sunken);color:var(--text)'};${extra}">${icon ? ico(icon, 16, 2.4) : ''}${label}</button>`;
const txRow = (c, who, sub, amt, h) => `<div style="display:flex;align-items:center;gap:12px">${h.chip(c, 44)}<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:17px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.esc(who)}</span><span style="font-size:13px;color:var(--text-muted)">${sub}</span></span><b style="font-size:17px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;color:${amt > 0 ? 'var(--success)' : 'var(--text)'}">${signed(amt)}</b></div>`;

function head(ctx, title, sub, stats, f) {
  const { h, phone } = ctx;
  return `<div style="display:flex;flex-direction:column;gap:${phone ? 12 : 14}px"><button data-act="to-list" style="align-self:flex-start;display:flex;align-items:center;gap:2px;min-height:${phone ? 44 : 32}px;padding:0 10px 0 0;border:0;background:none;font:inherit;font-size:${phone ? 15 : 14}px;font-weight:500;color:var(--text-muted);cursor:pointer">${ico('left', phone ? 20 : 16, 2.2)}Categorieën</button><b style="font-size:30px;font-weight:600;letter-spacing:-.02em;line-height:1.1;${phone ? 'padding-left:8px' : ''}">${title}</b><div style="display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-card)"><div style="display:flex;gap:${phone ? 20 : 32}px;flex-wrap:wrap">${stats}</div>${bar(f)}</div></div>`;
}
function logHTML(ctx, R, kind) {
  const { h } = ctx;
  if (!R.log.length) return '';
  const rows = R.log.slice(0, 6).map((en, i) => {
    const what = en.type === 'skip' ? 'Overgeslagen' : kind === 't' ? `Gekoppeld aan ${h.esc(en.e.who)}` : `Ingedeeld als ${h.esc(ctx.get(en.cat) ? ctx.get(en.cat).name : '')}`;
    const c = en.type === 'skip' ? null : kind === 't' ? ctx.get(en.e.cat) : ctx.get(en.cat);
    return `<div style="display:flex;align-items:center;gap:12px;min-height:56px">${c ? h.chip(c, 32) : `<span style="width:32px;height:32px;border-radius:999px;display:grid;place-items:center;background:var(--surface-sunken);color:var(--text-muted);flex:0 0 auto">${ico('right', 16, 2.2)}</span>`}<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.esc(en.item.who)} <span style="color:var(--text-muted);font-variant-numeric:tabular-nums">${signed(en.item.amt)}</span></span><span style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${what}</span></span><button data-act="${kind}undo" data-i="${i}" style="flex:0 0 auto;min-height:44px;padding:0 10px;border:0;background:none;font:inherit;font-size:13px;font-weight:600;color:var(--accent);cursor:pointer">Ongedaan maken</button></div>`;
  }).join('');
  return `<section style="display:flex;flex-direction:column;gap:6px">${h.lab('Gedaan', String(R.log.length))}<div style="${h.card}">${rows}</div></section>`;
}
function nextHTML(ctx, R, kind) {
  const { h } = ctx, ids = R.q.slice(1, 7);
  if (!ids.length) return '';
  const rows = ids.map(id => {
    const it = kind === 't' ? tk(id) : su(id), g = kind === 't' ? (it.guess && ex(it.guess)) : null, c = kind === 't' ? (g ? ctx.get(g.cat) : null) : ctx.get(it.sug[0][0]);
    const sub = kind === 't' ? (g ? `bij ${h.esc(g.who)}` : 'geen voorstel') : `waarschijnlijk ${h.esc(c ? c.name : '')}`;
    return `<button data-act="${kind}jump" data-id="${id}" data-hov style="display:flex;align-items:center;gap:12px;width:calc(100% + 16px);min-height:56px;margin:0 -8px;padding:0 8px;border:0;border-radius:14px;background:transparent;font:inherit;color:var(--text);text-align:left;cursor:pointer">${c ? h.chip(c, 28) : `<span style="width:28px;height:28px;border-radius:999px;background:var(--surface-sunken);flex:0 0 auto"></span>`}<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.esc(it.who)}</span><span style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${dm(it.d)} · ${sub}</span></span><span style="font-size:14px;font-variant-numeric:tabular-nums;white-space:nowrap;color:${it.amt > 0 ? 'var(--success)' : 'var(--text)'}">${signed(it.amt)}</span></button>`;
  }).join('');
  return `<section style="display:flex;flex-direction:column;gap:6px">${h.lab('Hierna')}<div style="${h.card}">${rows}</div></section>`;
}
function layout(ctx, top, cardHTML, R, kind) {
  if (ctx.phone) return `<div style="display:flex;flex-direction:column;gap:16px">${top}${cardHTML}${logHTML(ctx, R, kind)}</div>`;
  return `<div style="max-width:1000px;display:flex;flex-direction:column;gap:20px">${top}<div style="display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;align-items:start"><div style="display:flex;flex-direction:column;gap:16px">${cardHTML}${logHTML(ctx, R, kind)}</div>${nextHTML(ctx, R, kind)}</div></div>`;
}

function tikkiesHTML(ctx) {
  const { h } = ctx, R = ctx.r.t, splin = ctx.get('splin'), left = splin ? splin.n : 0, linked = R.log.filter(e => e.type === 'link').length;
  const top = head(ctx, 'Oude Tikkies koppelen', 'Een Tikkie terug hoort bij de uitgave waarvoor hij is. Koppelen verandert geen categorie, alleen het netto: het etentje van € 240 met drie Tikkies terug kost je € 60.', stat('Nog in Splits In', h.fmt(left)) + stat('Gekoppeld', h.fmt(linked)) + stat('Verrekend', eur(R.sum), 'var(--success)'), R.total ? (R.total - left) / R.total : 1);
  const item = tk(R.q[0]);
  if (!item) return layout(ctx, top, `<div style="${cardS}"><b style="font-size:20px;font-weight:600">Klaar voor nu</b><span style="font-size:15px;line-height:1.5;text-wrap:pretty">${h.fmt(linked)} gekoppeld, ${eur(R.sum)} verrekend. De ${h.fmt(left)} Tikkies die nog in Splits In staan, blijven daar gewoon staan tot je verder gaat.</span>${btn('to-list', 'Terug naar Categorieën', 'soft', null, 'flex:0 0 auto;align-self:flex-start')}</div>`, R, 't');
  const so = ctx.get('splin') || { color:'purple', icon:'split' };
  let body;
  if (R.pick) {
    const q = R.pq.trim().toLowerCase(), from = iso(at(item.d).getUTCFullYear(), at(item.d).getUTCMonth(), at(item.d).getUTCDate() - 14);
    const list = EXP.filter(e => e.d <= item.d && e.d >= from && (!q || e.who.toLowerCase().includes(q)));
    body = `<div class="cm-in" style="display:flex;flex-direction:column;gap:8px">${h.plab('Uitgaven in de twee weken ervoor')}${h.search('pq', R.pq, 'Zoek uitgave')}<div style="display:flex;flex-direction:column;gap:2px;max-height:300px;overflow-y:auto">${list.map(e => { const c = ctx.get(e.cat); return `<button data-act="tpick" data-id="${e.id}" data-hov style="display:flex;align-items:center;gap:12px;min-height:56px;padding:0 10px 0 8px;border-radius:14px;border:0;background:transparent;font:inherit;color:var(--text);text-align:left;cursor:pointer">${c ? h.chip(c, 32) : ''}<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.esc(e.who)}</span><span style="font-size:12px;color:var(--text-muted)">${dm(e.d)}${c ? ` · ${h.esc(c.name)}` : ''}${R.links[e.id] ? ` · al ${eur(R.links[e.id])} terug` : ''}</span></span><span style="font-size:14px;font-variant-numeric:tabular-nums">${signed(e.amt)}</span></button>`; }).join('') || h.hint('Geen uitgave gevonden.')}</div>${btn('tback', 'Terug naar het voorstel', 'quiet')}</div>`;
  } else {
    const e = ex(R.pickId || item.guess);
    if (e) {
      const c = ctx.get(e.cat), before = e.amt + (R.links[e.id] || 0), after = before + item.amt, n = TK.filter(t => R.log.some(l => l.type === 'link' && l.item === t && l.e === e)).length;
      body = `<span style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text-muted)">${ico('link', 15, 2.2)}${R.pickId ? 'Hoort bij' : 'Hoort waarschijnlijk bij'}</span><div style="display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:18px;background:var(--surface-sunken)"><div style="display:flex;align-items:center;gap:12px">${c ? h.chip(c, 36) : ''}<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.esc(e.who)}</span><span style="font-size:12px;color:var(--text-muted)">${dm(e.d)}${c ? ` · ${h.esc(c.name)}` : ''}</span></span><span style="font-size:15px;font-weight:600;font-variant-numeric:tabular-nums">${signed(e.amt)}</span></div>${!R.pickId && item.why ? `<span style="font-size:13px;line-height:1.4;color:var(--text-muted)">${h.esc(item.why)}</span>` : ''}<span style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding-top:10px;border-top:1px solid var(--border);font-size:14px;font-variant-numeric:tabular-nums"><span style="color:var(--text-muted)">Netto${n ? ` (al ${n} terug)` : ''}</span><span>${signed(before)}</span><span style="color:var(--text-subtle)">${ico('arrow', 14, 2.2)}</span><b style="font-weight:600">${signed(after)}</b></span></div><div style="display:flex;gap:8px">${btn('tlink', 'Koppelen', 'primary', 'link')}${btn('tother', 'Andere uitgave', 'sunken')}</div>`;
    } else {
      body = `<div style="padding:14px 16px;border-radius:18px;background:var(--surface-sunken);font-size:14px;line-height:1.45;color:var(--text-muted);text-wrap:pretty">Geen uitgave gevonden die past: geen naam in de omschrijving en geen bedrag dat klopt. Kies er zelf een, of sla hem over.</div><div style="display:flex;gap:8px">${btn('tother', 'Kies een uitgave', 'primary')}</div>`;
    }
  }
  const cardHTML = `<div class="cm-in" style="${cardS}">${txRow(so, item.who, `${dm(item.d)} · ${store.acc(item.acc).name}`, item.amt, h)}${mono(h.esc(item.desc))}${body}${R.pick ? '' : btn('tskip', 'Overslaan, blijft in Splits In', 'quiet', null, 'min-height:44px;font-size:14px')}</div>`;
  return layout(ctx, top, cardHTML, R, 't');
}

function splitsHTML(ctx) {
  const { h } = ctx, R = ctx.r.s, so = ctx.get('splout'), left = so ? so.n : 0, done = R.log.filter(e => e.type === 'pick').length;
  const top = head(ctx, 'Splits Uit verdelen', 'Wat je iemand terugbetaalt, is jouw deel van iets. Zet het in de echte categorie. Er valt niets te koppelen: de uitgave zelf staat op de rekening van de ander.', stat('Nog in Splits Uit', h.fmt(left)) + stat('Verdeeld', h.fmt(done)), R.total ? (R.total - left) / R.total : 1);
  const item = su(R.q[0]);
  if (!item) {
    const empty = so && so.n === 0;
    const c = empty ? `<div style="${cardS}"><b style="font-size:20px;font-weight:600">Splits Uit is leeg</b><span style="font-size:15px;line-height:1.5;text-wrap:pretty">Alle ${h.fmt(R.total)} staan in hun echte categorie. Wat wil je met Splits Uit?</span><div style="display:flex;flex-wrap:wrap;gap:8px">${h.pill('sdelete', 'Verwijderen', 'warn', 'trash')}${h.pill('shide', 'Verbergen in de kiezer', 'soft', 'eyeoff')}${h.pill('to-list', 'Laten staan', 'quiet')}</div></div>`
      : `<div style="${cardS}"><b style="font-size:20px;font-weight:600">Klaar voor nu</b><span style="font-size:15px;line-height:1.5;text-wrap:pretty">${h.fmt(done)} verdeeld. De ${h.fmt(left)} die je overslaat, blijven in Splits Uit staan.</span>${btn('to-list', 'Terug naar Categorieën', 'soft', null, 'flex:0 0 auto;align-self:flex-start')}</div>`;
    return layout(ctx, top, c, R, 's');
  }
  const sug = item.sug.filter(([id]) => ctx.get(id)), sugIds = sug.map(s => s[0]);
  const tileB = (c, hintTxt) => `<button data-act="spick" data-id="${c.id}" style="display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:0 14px 0 10px;border:0;border-radius:16px;background:${tone(c).bg};color:var(--text);font:inherit;text-align:left;cursor:pointer;box-sizing:border-box"><span style="flex:0 0 auto;width:36px;height:36px;border-radius:999px;display:grid;place-items:center;background:var(--surface-raised);color:${tone(c).fg}">${ico(c.icon, 18, 2.2)}</span><span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.esc(c.name)}</span>${hintTxt ? `<span style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.esc(hintTxt)}</span>` : ''}</span></button>`;
  const q = R.aq.trim().toLowerCase(), rest = ctx.cats.filter(c => !['splin', 'splout'].includes(c.id) && !c.hidden && (q ? c.name.toLowerCase().includes(q) : !sugIds.includes(c.id))).sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  const all = R.all || q ? `<div class="cm-in" style="display:flex;flex-direction:column;gap:6px">${h.search('aq', R.aq, 'Zoek categorie')}<div style="display:flex;flex-direction:column;gap:2px;max-height:260px;overflow-y:auto">${rest.map(c => `<button data-act="spick" data-id="${c.id}" data-hov style="display:flex;align-items:center;gap:10px;min-height:48px;padding:0 10px 0 8px;border-radius:12px;border:0;background:transparent;font:inherit;color:var(--text);text-align:left;cursor:pointer">${h.chip(c, 28)}<span style="flex:1;font-size:14px;font-weight:500">${h.esc(c.name)}</span></button>`).join('') || h.hint('Geen categorie gevonden.')}</div></div>` : `<button data-act="sall" style="display:flex;align-items:center;justify-content:space-between;min-height:44px;padding:0 4px;border:0;background:none;font:inherit;font-size:14px;font-weight:600;color:var(--accent);cursor:pointer">Alle categorieën${ico('down', 16, 2.4)}</button>`;
  const cardHTML = `<div class="cm-in" style="${cardS}">${txRow(so || { color:'purple', icon:'split' }, item.who, `${dm(item.d)} · ${store.acc(item.acc).name}`, item.amt, h)}${mono(h.esc(item.desc))}<div style="display:flex;flex-direction:column;gap:8px">${h.plab('Waarschijnlijk')}${sug.map(([id, t]) => tileB(ctx.get(id), t)).join('')}</div>${all}${btn('sskip', 'Overslaan, blijft in Splits Uit', 'quiet', null, 'min-height:44px;font-size:14px')}</div>`;
  return layout(ctx, top, cardHTML, R, 's');
}

function html(ctx) { return ctx.st.view === 'tikkies' ? tikkiesHTML(ctx) : splitsHTML(ctx); }
function act(a, b, ctx) {
  const st = ctx.st, T = ctx.r.t, S = ctx.r.s, h = ctx.h;
  if (a === 'to-list') { st.view = 'list'; st.reset = ['list']; return true; }
  if (a === 'tlink') { const it = tk(T.q[0]), e = ex(T.pickId || it.guess), en = linkT(ctx, it, e); ctx.toast(`Gekoppeld aan ${h.esc(e.who)}`, () => undoT(ctx, en)); return true; }
  if (a === 'tskip') { const en = skipT(ctx, tk(T.q[0])); ctx.toast('Overgeslagen, blijft in Splits In', () => undoT(ctx, en)); return true; }
  if (a === 'tother') { T.pick = true; T.pq = ''; return true; }
  if (a === 'tback') { T.pick = false; return true; }
  if (a === 'tpick') { T.pickId = b.dataset.id; T.pick = false; return true; }
  if (a === 'tundo') { undoT(ctx, T.log[+b.dataset.i]); st.toast = null; return true; }
  if (a === 'tjump') { const id = b.dataset.id; T.q.splice(T.q.indexOf(id), 1); T.q.unshift(id); T.pick = false; T.pickId = null; return true; }
  if (a === 'spick') { const it = su(S.q[0]), c = ctx.get(b.dataset.id), en = pickS(ctx, it, c.id); ctx.toast(`Ingedeeld als ${h.esc(c.name)}`, () => undoS(ctx, en)); return true; }
  if (a === 'sskip') { const en = skipS(ctx, su(S.q[0])); ctx.toast('Overgeslagen, blijft in Splits Uit', () => undoS(ctx, en)); return true; }
  if (a === 'sall') { S.all = true; return true; }
  if (a === 'sundo') { undoS(ctx, S.log[+b.dataset.i]); st.toast = null; return true; }
  if (a === 'sjump') { const id = b.dataset.id; S.q.splice(S.q.indexOf(id), 1); S.q.unshift(id); S.all = false; return true; }
  if (a === 'sdelete') { const so = ctx.get('splout'); ctx.cats.splice(ctx.cats.indexOf(so), 1); st.view = 'list'; ctx.toast('Splits Uit is weg'); return true; }
  if (a === 'shide') { const so = ctx.get('splout'); so.hidden = true; st.view = 'list'; ctx.toast('Splits Uit staat niet meer in de kiezer', () => { so.hidden = false; }); return true; }
  return false;
}
function input(k, v, ctx) {
  if (k === 'pq') { ctx.r.t.pq = v; return true; }
  if (k === 'aq') { ctx.r.s.aq = v; return true; }
  return false;
}
window.CATR = { init, html, act, input };
})();
