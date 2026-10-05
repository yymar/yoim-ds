/* Categorieën: de pagina zelf. Lijst per soort, wijzigen in een paneel (desktop) of
   sheet (telefoon), nieuw, samenvoegen met voorvertoning, verwijderen met keuze en
   de regels van een categorie. De twee rondes voor Splits staan in cat-rondes.js. */
(() => {
const X = window.TX2, Y = window.CATX, { tone, store } = X, { ico, ICONS, COLORS, SOORT, eur0, net, netStr } = Y;
if (!document.getElementById('cat-css')) {
  const s = document.createElement('style'); s.id = 'cat-css';
  s.textContent = `@keyframes cmUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}@keyframes cmSide{from{transform:translateX(16px);opacity:0}to{transform:none;opacity:1}}@keyframes cmIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}@keyframes cmFade{from{opacity:0}to{opacity:1}}
.cm-sheet{animation:cmUp .28s cubic-bezier(.32,.72,0,1)}.cm-panel{animation:cmSide .24s cubic-bezier(.32,.72,0,1)}.cm-in{animation:cmIn .18s ease}.cm-scrim{animation:cmFade .2s ease}
.cm-mono{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace}
[data-cm] input::placeholder{color:var(--text-subtle)}[data-cm] button:disabled{opacity:.45;cursor:default}
@media (hover:hover) and (pointer:fine){[data-cm] [data-hov]:hover{background:var(--surface-sunken)!important}}`;
  document.head.appendChild(s);
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = n => new Intl.NumberFormat('nl-NL').format(n);
const tx = n => `${fmt(n)} ${n === 1 ? 'transactie' : 'transacties'}`;
const KLEUR = { green:'Groen', success:'Mos', teal:'Petrol', blue:'Blauw', purple:'Paars', pink:'Roze', red:'Rood', orange:'Oranje', yellow:'Geel', brown:'Bruin', olijf:'Olijf', gray:'Grijs' };
const OUT = { splin:'gaat over in koppelen', splout:'gaat naar de echte categorie' };

const chip = (c, s = 36, off) => `<span style="width:${s}px;height:${s}px;border-radius:999px;display:grid;place-items:center;flex:0 0 auto;background:${tone(c).bg};color:${tone(c).fg};${off ? 'filter:grayscale(1);opacity:.5;' : ''}">${ico(c.icon, Math.round(s * .5), 2)}</span>`;
const lab = (l, r = '') => `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:4px 4px 0;font-size:13px;font-weight:600;color:var(--text-muted)"><span>${l}</span>${r ? `<span style="font-weight:500;font-variant-numeric:tabular-nums">${r}</span>` : ''}</div>`;
const plab = (l, r = '') => `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:0 4px"><span style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-subtle)">${l}</span>${r ? `<span style="font-size:12px;color:var(--text-muted);font-variant-numeric:tabular-nums">${r}</span>` : ''}</div>`;
const sec = (l, body, r) => `<div style="display:flex;flex-direction:column;gap:8px">${plab(l, r)}${body}</div>`;
const hint = s => `<span style="padding:0 4px;font-size:12px;line-height:1.45;color:var(--text-muted);text-wrap:pretty">${s}</span>`;
const PILL = {
  primary:'background:var(--accent);color:var(--accent-fg);border:1px solid transparent',
  soft:'background:var(--surface-raised);color:var(--text);border:1px solid var(--border)',
  sunken:'background:var(--surface-sunken);color:var(--text);border:1px solid transparent',
  quiet:'background:transparent;color:var(--text-muted);border:1px solid transparent',
  warn:'background:var(--botergoud-soft);color:var(--botergoud);border:1px solid transparent',
  on:'background:var(--accent-soft);color:var(--accent-hover);border:1px solid transparent'
};
const pill = (act, label, kind = 'soft', icon, disabled, extra = '') => `<button data-act="${act}" ${disabled ? 'disabled' : ''} style="display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:0 ${icon ? '16px 0 14px' : '16px'};border-radius:999px;${PILL[kind]};font:inherit;font-size:14px;font-weight:600;white-space:nowrap;cursor:pointer;box-sizing:border-box;${extra}">${icon ? ico(icon, 16, 2.2) : ''}${label}</button>`;
const radio = on => `<span style="flex:0 0 auto;width:22px;height:22px;border-radius:999px;box-sizing:border-box;border:${on ? '7px solid var(--accent)' : '1.5px solid var(--border)'};background:var(--surface-raised)"></span>`;
const check = on => `<span style="flex:0 0 auto;width:22px;height:22px;border-radius:7px;display:grid;place-items:center;box-sizing:border-box;border:1.5px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'var(--accent)' : 'transparent'};color:var(--accent-fg)">${on ? ico('check', 14, 3) : ''}</span>`;
const switchEl = on => `<span style="flex:0 0 auto;position:relative;width:44px;height:26px;border-radius:999px;background:${on ? 'var(--accent)' : 'var(--border)'};transition:background .15s"><span style="position:absolute;top:3px;left:${on ? 21 : 3}px;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:left .15s"></span></span>`;
const search = (k, v, ph, raised) => `<label style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;height:44px;padding:0 14px;border-radius:999px;box-sizing:border-box;${raised ? 'background:var(--surface-raised);border:1px solid var(--border)' : 'background:var(--surface-sunken)'};color:var(--text-muted)">${ico('search', 16, 2.2)}<input data-k="${k}" value="${esc(v)}" placeholder="${ph}" style="flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:15px;color:var(--text)"></label>`;
const field = (k, v, ph, trail = '') => `<span style="display:flex;align-items:center;gap:4px;height:48px;padding:0 4px 0 16px;border-radius:999px;background:var(--surface-raised);border:1px solid var(--border);box-sizing:border-box"><input data-k="${k}" value="${esc(v)}" placeholder="${ph}" maxlength="40" style="flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:15px;color:var(--text)">${trail}</span>`;
const line = (i, t) => `<span style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4"><span style="color:var(--text-muted);padding-top:1px">${ico(i, 16, 2)}</span><span style="text-wrap:pretty">${t}</span></span>`;
const warn = t => `<div style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:16px;background:var(--botergoud-soft);font-size:14px;line-height:1.4"><span style="color:var(--botergoud);padding-top:1px">${ico('alert', 16, 2.2)}</span><span style="text-wrap:pretty">${t}</span></div>`;
const tile = 'display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:18px;background:var(--surface-sunken)';
const card = 'display:flex;flex-direction:column;gap:2px;padding:4px 16px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-card)';
const dupName = (cats, name, except = []) => cats.some(o => !except.includes(o) && o.name.toLowerCase() === name.trim().toLowerCase());
const ruleKey = r => [r.who, r.acc || '', r.day || ''].join('|');
const ruleN = r => r.n ?? 2 + [...r.who].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7) % 60;
const ruleSub = r => [`${ruleN(r)} keer`, r.acc ? `alleen op ${store.acc(r.acc).name}` : '', r.day ? `alleen op ${r.day}` : '', r.src === 'kiezer' ? `sinds ${r.date}` : ''].filter(Boolean).join(' · ');

function navHTML() {
  const item = (icon, label) => `<span style="height:48px;display:flex;align-items:center;gap:12px;padding:0 12px;font-size:15px;font-weight:500;color:var(--text-muted);border-radius:var(--radius-lg)">${ico(icon, 20, 1.8)}${label}</span>`;
  return `<nav style="position:absolute;top:0;bottom:0;left:0;width:240px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px;padding:20px 12px 16px;background:var(--glass-tint);backdrop-filter:var(--glass-blur);border-right:1px solid var(--glass-border);box-shadow:var(--glass-highlight);z-index:2;font-family:var(--font-sans);color:var(--text)"><span style="height:44px;display:flex;align-items:center;padding:0 12px;font-size:20px;font-weight:600;letter-spacing:-.035em">Mone.<span style="color:var(--accent)">Y</span>o<span style="color:var(--botergoud)">Im</span></span><div style="display:flex;flex-direction:column;gap:6px">${item('receiptnav', 'Transacties')}${item('wallet', 'Budgetten')}${item('grid', 'Inzicht')}</div><div style="margin-top:auto;display:flex;align-items:center;gap:8px;min-height:48px;padding:0 12px 0 6px;border-radius:var(--radius-lg);background:var(--glass-tint-strong);border:1px solid var(--glass-border);box-shadow:var(--glass-rim)"><span style="width:32px;height:32px;border-radius:999px;background:var(--member-yoran);color:#fff;display:grid;place-items:center;font-size:14px;font-weight:600">Y</span><b style="font-size:14px;font-weight:600">Yoran</b><span style="margin-left:auto;font-size:13px;color:var(--text-muted)">Profiel</span></div></nav>`;
}

function App(root, opt = {}) {
  const phone = opt.mode === 'phone';
  const cats = Y.CATS.map(c => ({ ...c, rules: c.rules.map(r => ({ ...r })) }));
  const get = id => cats.find(c => c.id === id);
  const st = { view:opt.view || 'list', q:'', open:opt.open || null, sel:new Set(opt.sel || []), selecting:!!opt.sel, merge:!!opt.merge, mergeTo:opt.mergeTo || null, mergeName:opt.mergeName ?? null, other:false, oq:'', del:!!opt.del, delChoice:opt.delChoice || 'merge', delTo:opt.delTo || null, dq:'', draft:null, look:!!opt.look, iq:'', nw:null, showHidden:!!opt.showHidden, toast:null, anim:true, reset:[] };
  if (st.open === 'new') st.nw = { name:opt.newName || '', color:opt.newColor || 'yellow', icon:opt.newIcon || 'gift', soort:null };
  if (st.del) st.scrollTo = '[data-deltile]';
  root.style.position = 'relative'; root.style.overflow = 'hidden'; root.dataset.cm = '';
  let tt;
  const toast = (text, undo) => { st.toast = { text, undo }; clearTimeout(tt); tt = setTimeout(() => { st.toast = null; render(); }, 6000); };
  const ctx = { phone, st, cats, get, toast, render:() => render(), h:{ esc, fmt, tx, chip, lab, plab, sec, hint, pill, radio, check, search, line, warn, tile, card } };
  window.CATR && CATR.init(ctx, opt);

  /* Lijst */
  function rowHTML(c) {
    const sel = st.selecting, on = st.sel.has(c.id), open = st.open === c.id && !sel, v = net(c);
    const sub = c.hidden ? `Verborgen in de kiezer · ${tx(c.n)}` : [tx(c.n), OUT[c.id] || (c.budget ? `budget ${c.budget}` : '')].filter(Boolean).join(' · ');
    return `<button data-act="${sel ? 'tsel' : 'open'}" data-id="${c.id}" data-hov style="display:grid;grid-template-columns:36px minmax(0,1fr) auto${sel ? ' 22px' : ''};gap:12px;align-items:center;width:calc(100% + 16px);min-height:60px;margin:0 -8px;padding:0 8px;border:0;border-radius:14px;background:${open || on ? 'var(--surface-sunken)' : 'transparent'};font:inherit;color:var(--text);text-align:left;cursor:pointer">${chip(c, 36, c.hidden)}<span style="min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${c.hidden ? 'color:var(--text-muted)' : ''}">${esc(c.name)}</span><span style="font-size:13px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub}</span></span><span style="font-size:14px;font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap;color:${v > 0 ? 'var(--success)' : c.hidden ? 'var(--text-muted)' : 'var(--text)'}">${netStr(v)}</span>${sel ? check(on) : ''}</button>`;
  }
  function bannerHTML() {
    const a = get('splin'), b = get('splout');
    if ((!a && !b) || st.q || st.selecting) return '';
    return `<div style="${tile}"><div style="display:flex;gap:12px;align-items:flex-start"><span style="width:36px;height:36px;border-radius:999px;display:grid;place-items:center;background:var(--surface-raised);color:var(--text-muted);flex:0 0 auto">${ico('split', 18, 2)}</span><b style="flex:1;min-width:0;align-self:center;font-size:15px;font-weight:600">${a && b ? 'Splits In en Splits Uit gaan eruit' : `${(a || b).name} gaat eruit`}</b></div><div style="display:flex;flex-wrap:wrap;gap:8px">${a ? pill('round-tikkies', `Oude Tikkies koppelen <span style="font-weight:500;color:var(--text-muted)">${fmt(a.n)}</span>`, 'soft', 'link') : ''}${b ? pill('round-splits', `Splits Uit verdelen <span style="font-weight:500;color:var(--text-muted)">${fmt(b.n)}</span>`, 'soft', 'split') : ''}</div></div>`;
  }
  function listHTML() {
    const q = st.q.trim().toLowerCase(), match = c => !q || c.name.toLowerCase().includes(q);
    const vis = cats.filter(c => !c.hidden && match(c));
    const groups = [['vast', 'Vast'], ['var', 'Variabel'], ['ink', 'Inkomen'], [null, 'Zonder soort']].map(([k, l]) => {
      const g = vis.filter(c => (c.soort || null) === k).sort((a, b) => b.n - a.n);
      return g.length ? `<section style="display:flex;flex-direction:column;gap:6px">${lab(l, netStr(g.reduce((s, c) => s + net(c), 0)))}<div style="${card}">${g.map(rowHTML).join('')}</div></section>` : '';
    }).join('');
    const hid = cats.filter(c => c.hidden && match(c)), showH = st.showHidden || q;
    const hidden = hid.length ? `<section style="display:flex;flex-direction:column;gap:6px"><button data-act="hidden" aria-expanded="${!!showH}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:0 4px;border:0;background:none;font:inherit;font-size:13px;font-weight:600;color:var(--text-muted);cursor:pointer"><span style="display:flex;align-items:center;gap:6px">${ico('eyeoff', 15, 2)}Verborgen in de kiezer</span><span style="display:flex;align-items:center;gap:4px;font-weight:500">${hid.length}<span style="display:flex;transition:transform .2s;${showH ? 'transform:rotate(180deg)' : ''}">${ico('down', 16, 2.2)}</span></span></button>${showH ? `<div class="cm-in" style="${card}">${hid.map(rowHTML).join('')}</div>` : ''}</section>` : '';
    const empty = !vis.length && !hid.length ? `<div style="padding:48px 16px;text-align:center;display:flex;flex-direction:column;gap:6px"><b style="font-size:17px;font-weight:600">Geen categorie die zo heet.</b><span style="font-size:14px;color:var(--text-muted)">Maak hem aan met Nieuw.</span></div>` : '';
    return `${bannerHTML()}${groups}${hidden}${empty}`;
  }
  function selBarHTML() {
    if (!st.selecting) return '';
    const n = st.sel.size;
    return `<div style="position:sticky;bottom:${phone ? 20 : 16}px;z-index:5;display:flex;justify-content:center;pointer-events:none;margin-top:16px"><div class="cm-in" style="pointer-events:auto;display:flex;align-items:center;gap:4px;min-height:56px;padding:6px 6px 6px 18px;border-radius:999px;background:var(--glass-tint-strong);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);box-shadow:var(--glass-rim),var(--shadow-raised);white-space:nowrap;box-sizing:border-box"><span style="font-size:14px;font-weight:600;padding-right:4px">${n < 2 ? 'Kies er twee of meer' : `${n} gekozen`}</span>${pill('cancel-sel', 'Annuleren', 'quiet')}${st.merge && !phone ? '' : pill('go-merge', 'Samenvoegen', 'primary', 'merge', n < 2)}</div></div>`;
  }

  /* Paneel: wijzigen */
  function lookHTML(cur) {
    const q = st.iq.trim().toLowerCase(), list = ICONS.filter(([n, k]) => !q || n.includes(q) || k.includes(q));
    return `<div style="display:flex;flex-wrap:wrap;gap:2px">${COLORS.map(k => { const on = cur.color === k, t = tone({ color:k }); return `<button data-act="color" data-v="${k}" aria-label="${KLEUR[k]}" aria-pressed="${on}" title="${KLEUR[k]}" style="width:44px;height:44px;border-radius:999px;border:0;padding:0;display:grid;place-items:center;cursor:pointer;background:transparent"><span style="width:28px;height:28px;border-radius:999px;background:${t.fg};box-shadow:${on ? `0 0 0 3px var(--surface-raised),0 0 0 5px ${t.fg}` : 'none'}"></span></button>`; }).join('')}</div>${search('iq', st.iq, 'Zoek icoon, bijvoorbeeld cadeau')}<div style="display:grid;grid-template-columns:repeat(${phone ? 6 : 7},minmax(0,1fr));gap:4px">${list.map(([n]) => { const on = cur.icon === n, t = tone({ color:cur.color }); return `<button data-act="icon" data-v="${n}" aria-pressed="${on}" ${on ? '' : 'data-hov'} style="height:44px;border-radius:12px;border:0;display:grid;place-items:center;cursor:pointer;background:${on ? t.bg : 'transparent'};color:${on ? t.fg : 'var(--text-muted)'}">${ico(n, 20, on ? 2.2 : 1.8)}</button>`; }).join('')}</div>${list.length ? '' : hint('Geen icoon gevonden. Probeer een ander woord.')}`;
  }
  function soortHTML(cur, optional) {
    return `<div role="radiogroup" style="display:flex;gap:2px;padding:3px;border-radius:999px;background:var(--surface-sunken)">${Object.entries(SOORT).map(([k, l]) => { const on = cur.soort === k; return `<button data-act="soort" data-v="${k}" role="radio" aria-checked="${on}" style="flex:1;height:38px;border-radius:999px;border:0;font:inherit;font-size:14px;font-weight:${on ? 600 : 500};cursor:pointer;background:${on ? 'var(--surface-raised)' : 'transparent'};color:${on ? 'var(--text)' : 'var(--text-muted)'};box-shadow:${on ? 'var(--shadow-card)' : 'none'}">${l}</button>`; }).join('')}</div>`;
  }
  function detailHTML(c) {
    const v = net(c), d = st.draft ?? c.name, dirty = d.trim() && d.trim() !== c.name, dup = dirty && dupName(cats, d, [c]);
    const head = `<div style="display:flex;align-items:center;gap:14px;padding-right:48px">${chip(c, 56, c.hidden)}<span style="min-width:0;display:flex;flex-direction:column;gap:2px"><b style="font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.2;text-wrap:balance">${esc(c.name)}</b><span style="font-size:13px;color:var(--text-muted)">${c.n ? `${tx(c.n)} sinds ${c.since}` : 'Nog geen transacties'}</span></span></div>`;
    const out = OUT[c.id] ? `<div style="${tile}"><span style="font-size:15px;font-weight:600">${esc(c.name)} gaat eruit</span>${pill(c.id === 'splin' ? 'round-tikkies' : 'round-splits', c.id === 'splin' ? 'Oude Tikkies koppelen' : 'Splits Uit verdelen', 'primary', c.id === 'splin' ? 'link' : 'split', false, 'align-self:flex-start')}</div>` : '';
    const netto = `<div style="display:flex;flex-direction:column;gap:2px;padding:14px 16px;border-radius:18px;background:var(--surface-sunken)"><span style="font-size:12px;color:var(--text-muted)">Netto dit jaar · ${v < 0 ? 'staat bij Uitgaven' : v > 0 ? 'staat bij Inkomsten' : 'staat nergens'}</span><b style="font-size:24px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:${v > 0 ? 'var(--success)' : 'var(--text)'}">${netStr(v)}</b><span style="font-size:13px;color:var(--text-muted);font-variant-numeric:tabular-nums">${eur0(c.af)} af · ${eur0(c.bij)} bij</span></div>`;
    const note = c.note ? hint(c.note) : '';
    const name = sec('Naam', field('name', d, 'Naam', dirty && !dup ? `<button data-act="save" style="height:40px;padding:0 14px;border-radius:999px;border:0;background:var(--accent);color:var(--accent-fg);font:inherit;font-size:13px;font-weight:600;cursor:pointer">Opslaan</button>` : '') + (dup ? hint('Die naam heb je al. Kies een andere, of voeg ze samen.') : ''));
    const look = sec('Kleur en icoon', st.look ? `<div class="cm-in" style="display:flex;flex-direction:column;gap:10px">${lookHTML(c)}</div>` : `<button data-act="look" style="display:flex;align-items:center;gap:12px;min-height:56px;padding:0 14px 0 10px;border-radius:16px;border:0;background:var(--surface-sunken);font:inherit;color:var(--text);text-align:left;cursor:pointer">${chip(c, 36)}<span style="flex:1;font-size:15px;font-weight:500">${KLEUR[c.color]}, ${(ICONS.find(i => i[0] === c.icon) || [c.icon, c.icon])[1].split(' ')[0]}</span><span style="font-size:14px;font-weight:600;color:var(--accent)">Wijzigen</span></button>`);
    const soort = sec('Soort', soortHTML(c));
    const budget = sec('Budget', c.budget ? `<div style="display:flex;align-items:center;gap:12px;min-height:56px;padding:0 14px 0 10px;border-radius:16px;background:var(--surface-sunken)"><span style="width:36px;height:36px;border-radius:999px;display:grid;place-items:center;background:var(--surface-raised);color:var(--text-muted);flex:0 0 auto">${ico('wallet', 18, 2)}</span><span style="flex:1;min-width:0;font-size:15px;font-weight:500">Telt in budget ${esc(c.budget)}</span><span style="color:var(--text-subtle)">${ico('right', 18, 2.2)}</span></div>` : hint('Telt in geen budget.'));
    const rules = sec(`Vanzelf ${esc(c.name)} voor`, c.rules.length ? `<div style="display:flex;flex-direction:column;gap:2px;padding:4px;border-radius:18px;background:var(--surface-sunken)">${c.rules.map((r, i) => `<div style="display:flex;align-items:center;gap:8px;min-height:56px;padding:4px 4px 4px 12px;border-radius:14px;box-sizing:border-box"><span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.who)}</span><span style="font-size:12px;line-height:1.35;color:var(--text-muted)">${ruleSub(r)}</span></span><button data-act="rdel" data-i="${i}" aria-label="${esc(r.who)} niet meer vanzelf als ${esc(c.name)}" title="Niet meer vanzelf" style="flex:0 0 auto;width:40px;height:40px;margin:-2px 0;border-radius:999px;border:0;background:transparent;color:var(--text-muted);display:grid;place-items:center;cursor:pointer" data-hov>${ico('x', 16, 2.2)}</button></div>`).join('')}</div>` : hint('Nog niets. Kies bij een transactie voor voortaan zo indelen.'), c.rules.length ? String(c.rules.length) : '');
    const kiezer = sec('In de kiezer', `<button data-act="hide" role="switch" aria-checked="${!c.hidden}" style="display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 10px 8px 14px;border-radius:16px;border:0;background:var(--surface-sunken);font:inherit;text-align:left;cursor:pointer;color:var(--text)"><span style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;font-size:15px;font-weight:500">Tonen in de kiezer<span style="padding:1px 8px;border-radius:999px;background:var(--surface-raised);font-size:11px;font-weight:600;color:var(--text-muted)">Optioneel</span></span>${switchEl(!c.hidden)}</button>`);
    const acts = st.del ? delHTML(c) : `<div style="display:flex;flex-wrap:wrap;gap:8px">${pill('mergewith', 'Samenvoegen met…', 'sunken', 'merge')}${pill('ask-del', 'Verwijderen', 'sunken', 'trash')}</div>`;
    return [head, out, netto, note, name, look, soort, budget, rules, kiezer, acts].filter(Boolean).join('');
  }
  function delHTML(c) {
    const r = c.rules.length, rs = `${r} ${r === 1 ? 'regel' : 'regels'}`;
    if (!c.n) return `<div class="cm-in" data-deltile style="${tile}"><span style="font-size:15px;font-weight:600">${esc(c.name)} heeft geen transacties.</span><span style="font-size:14px;line-height:1.45;color:var(--text-muted)">Hij kan direct weg${r ? `, de ${rs} gaan mee` : ''}.</span><div style="display:flex;justify-content:flex-end;gap:4px">${pill('cancel-del', 'Annuleren', 'quiet')}${pill('dodel', 'Verwijderen', 'warn')}</div></div>`;
    const choice = (k, t, s, extra = '') => { const on = st.delChoice === k; return `<div style="display:flex;flex-direction:column;gap:10px;padding:4px;border-radius:16px;background:var(--surface-raised);${on ? 'box-shadow:0 0 0 2px var(--accent)' : ''}"><button data-act="dchoice" data-v="${k}" role="radio" aria-checked="${on}" style="display:flex;align-items:flex-start;gap:12px;min-height:56px;padding:10px 10px 10px 12px;border:0;border-radius:12px;background:transparent;font:inherit;text-align:left;cursor:pointer;color:var(--text)"><span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">${t}</span><span style="font-size:13px;line-height:1.45;color:var(--text-muted);text-wrap:pretty">${s}</span></span>${radio(on)}</button>${on ? extra : ''}</div>`; };
    const q = st.dq.trim().toLowerCase(), cand = cats.filter(o => o !== c && !o.hidden && !OUT[o.id] && (!q || o.name.toLowerCase().includes(q))).sort((a, b) => b.n - a.n);
    const picker = `<div class="cm-in" style="display:flex;flex-direction:column;gap:6px;padding:0 8px 8px">${search('dq', st.dq, 'Zoek categorie')}<div data-scroll="dlist" style="display:flex;flex-direction:column;gap:2px;max-height:228px;overflow-y:auto">${cand.map(o => `<button data-act="delto" data-id="${o.id}" ${st.delTo === o.id ? '' : 'data-hov'} style="display:flex;align-items:center;gap:10px;min-height:48px;padding:0 10px 0 8px;border-radius:12px;border:0;background:${st.delTo === o.id ? 'var(--surface-sunken)' : 'transparent'};font:inherit;color:var(--text);text-align:left;cursor:pointer">${chip(o, 28)}<span style="flex:1;min-width:0;font-size:14px;font-weight:${st.delTo === o.id ? 600 : 500};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(o.name)}</span><span style="font-size:12px;color:var(--text-muted);font-variant-numeric:tabular-nums">${fmt(o.n)}</span>${radio(st.delTo === o.id)}</button>`).join('')}</div></div>`;
    const to = st.delTo && get(st.delTo), ok = st.delChoice === 'nk' || to;
    return `<div class="cm-in" data-deltile style="${tile}"><span style="font-size:15px;font-weight:600;line-height:1.4;text-wrap:pretty">${esc(c.name)} heeft ${tx(c.n)} en ${rs}. Waar moeten ze heen?</span>${choice('merge', 'Samenvoegen met een andere categorie', `De ${tx(c.n)} en ${rs} gaan naar de categorie die je kiest.`, picker)}${choice('nk', 'Naar Nakijken', `De ${tx(c.n)} krijgen geen categorie meer en staan weer in Nakijken, zodat je ze opnieuw indeelt. De ${rs} gaan weg.`)}${c.budget ? line('wallet', `Het budget ${esc(c.budget)} telt ${esc(c.name)} daarna niet meer.`) : ''}${line('user', 'Imkes indelingen veranderen niet.')}<div style="display:flex;justify-content:flex-end;flex-wrap:wrap;gap:4px">${pill('cancel-del', 'Annuleren', 'quiet')}${pill('dodel', st.delChoice === 'merge' ? (to ? `Samenvoegen in ${esc(to.name)}` : 'Kies eerst een categorie') : 'Verwijderen', 'warn', null, !ok)}</div></div>`;
  }

  /* Paneel: samenvoegen */
  function mergePlan() {
    const src = [...st.sel].map(get).filter(Boolean);
    if (src.length < 2) return { src };
    const auto = src.slice().sort((a, b) => b.n - a.n)[0];
    const tgt = (st.mergeTo && get(st.mergeTo)) || auto, moving = src.filter(c => c !== tgt);
    const name = (st.mergeName ?? tgt.name);
    const have = new Set(tgt.rules.map(ruleKey)), mr = moving.flatMap(m => m.rules);
    const seen = new Set(have); let dup = 0; mr.forEach(r => { const k = ruleKey(r); if (seen.has(k)) dup++; else seen.add(k); });
    return { src, tgt, moving, name, N: moving.reduce((s, m) => s + m.n, 0), R: mr.length - dup, dup, bm: [...new Set(moving.map(m => m.budget).filter(Boolean))], nameDup: name.trim().toLowerCase() !== tgt.name.toLowerCase() && dupName(cats, name, [tgt, ...moving]) };
  }
  function mergeHTML() {
    const p = mergePlan();
    const head = `<div style="display:flex;align-items:center;min-height:40px;padding-right:48px"><b style="font-size:20px;font-weight:600;letter-spacing:-.01em">Samenvoegen</b></div>`;
    const srcRows = p.src.map(c => `<div style="display:flex;align-items:center;gap:10px;min-height:52px;padding:0 4px 0 10px;border-radius:14px">${chip(c, 32)}<span style="flex:1;min-width:0;display:flex;flex-direction:column"><span style="font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.name)}</span><span style="font-size:12px;color:var(--text-muted)">${tx(c.n)}</span></span><button data-act="tsel" data-id="${c.id}" aria-label="${esc(c.name)} niet meenemen" style="width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:var(--text-muted);display:grid;place-items:center;cursor:pointer" data-hov>${ico('x', 16, 2.2)}</button></div>`).join('');
    const van = sec('Van', `<div style="display:flex;flex-direction:column;gap:2px;padding:4px;border-radius:18px;background:var(--surface-sunken)">${srcRows || ''}</div>${p.src.length < 2 ? hint(phone ? 'Kies er in de lijst nog een bij.' : 'Kies links nog een categorie bij.') : ''}`, `${p.src.length}`);
    if (p.src.length < 2) return head + van;
    const tRow = c => { const on = c === p.tgt; return `<button data-act="mto" data-id="${c.id}" role="radio" aria-checked="${on}" ${on ? '' : 'data-hov'} style="display:flex;align-items:center;gap:10px;min-height:52px;padding:0 10px;border-radius:14px;border:0;background:${on ? 'var(--surface-raised)' : 'transparent'};${on ? 'box-shadow:var(--shadow-card);' : ''}font:inherit;color:var(--text);text-align:left;cursor:pointer">${chip(c, 28)}<span style="flex:1;min-width:0;font-size:15px;font-weight:${on ? 600 : 500};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.name)}</span>${radio(on)}</button>`; };
    const extra = p.src.includes(p.tgt) ? [] : [p.tgt];
    const oq = st.oq.trim().toLowerCase(), others = cats.filter(c => !st.sel.has(c.id) && !c.hidden && !OUT[c.id] && (!oq || c.name.toLowerCase().includes(oq))).sort((a, b) => b.n - a.n);
    const naar = sec('Naar', `<div style="display:flex;flex-direction:column;gap:2px;padding:4px;border-radius:18px;background:var(--surface-sunken)">${[...p.src, ...extra].map(tRow).join('')}<button data-act="mother" aria-expanded="${st.other}" style="display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:0 10px;border:0;background:transparent;font:inherit;font-size:14px;font-weight:600;color:var(--accent);cursor:pointer">Een andere categorie<span style="display:flex;transition:transform .2s;${st.other ? 'transform:rotate(180deg)' : ''}">${ico('down', 16, 2.2)}</span></button>${st.other ? `<div class="cm-in" style="display:flex;flex-direction:column;gap:4px;padding:0 4px 6px">${search('oq', st.oq, 'Zoek categorie', true)}<div data-scroll="olist" style="display:flex;flex-direction:column;gap:2px;max-height:200px;overflow-y:auto">${others.map(tRow).join('')}</div></div>` : ''}</div>`);
    const naam = sec('Naam daarna', field('mname', p.name, 'Naam') + (p.nameDup ? hint('Die naam heb je al bij een andere categorie.') : ''));
    const nm = esc(p.name.trim() || p.tgt.name), tb = p.tgt.budget, sub = [], warns = [];
    if (p.R) sub.push(`${p.R} ${p.R === 1 ? 'tegenpartij gaat' : 'tegenpartijen gaan'} voortaan vanzelf mee`);
    p.bm.forEach((b, i) => { if (b === tb) return; if (!tb && i === 0) sub.push(`budget ${esc(b)} telt voortaan ${nm}`); else warns.push(warn(`Budget ${esc(b)} blijft leeg achter.`)); });
    const preview = `<div style="${tile};gap:4px"><b style="font-size:17px;font-weight:600;line-height:1.35;text-wrap:pretty">${tx(p.N)} naar ${nm}</b>${sub.length ? `<span style="font-size:14px;line-height:1.45;color:var(--text-muted);text-wrap:pretty">${sub.join(', ').replace(/^./, s => s.toUpperCase())}</span>` : ''}</div>${warns.join('')}`;
    const go = `<div style="display:flex;flex-direction:column;gap:8px">${pill('domerge', `Samenvoegen in ${nm}`, 'primary', 'merge', p.nameDup || !p.name.trim(), 'width:100%;min-height:48px;font-size:15px')}<span style="text-align:center;font-size:12px;color:var(--text-muted)">Niet terug te draaien</span></div>`;
    return head + van + naar + naam + preview + go;
  }
  function doMerge(tgt, moving, name) {
    const have = new Set(tgt.rules.map(ruleKey));
    moving.forEach(m => { tgt.n += m.n; tgt.af += m.af; tgt.bij += m.bij; m.rules.forEach(r => { const k = ruleKey(r); if (!have.has(k)) { have.add(k); tgt.rules.push(r); } }); if (!tgt.budget && m.budget) tgt.budget = m.budget; const i = cats.indexOf(m); if (i > -1) cats.splice(i, 1); });
    tgt.name = name.trim() || tgt.name;
  }

  /* Paneel: nieuw */
  function newHTML() {
    const nw = st.nw, dup = nw.name.trim() && dupName(cats, nw.name);
    const head = `<div style="display:flex;align-items:center;gap:14px;padding-right:48px">${chip(nw, 56)}<span style="min-width:0;display:flex;flex-direction:column;gap:2px"><b style="font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nw.name.trim() ? esc(nw.name) : 'Nieuwe categorie'}</b></span></div>`;
    return head + sec('Naam', field('nname', nw.name, 'Bijvoorbeeld Cadeaus') + (dup ? hint('Die naam heb je al. Kies een andere.') : '')) + sec('Kleur en icoon', lookHTML(nw)) + sec('Soort', soortHTML(nw, true)) + `<div style="display:flex;justify-content:flex-end;gap:4px">${pill('close', 'Annuleren', 'quiet')}${pill('donew', 'Toevoegen', 'primary', 'plus', !nw.name.trim() || dup)}</div>`;
  }

  /* Opbouw */
  const panelOpen = () => st.view === 'list' && (st.merge || !!st.open);
  function panelBody() { return `<div style="display:flex;flex-direction:column;gap:20px;padding:${phone ? '6px 16px 40px' : '22px 20px 28px'}">${st.merge ? mergeHTML() : st.open === 'new' ? newHTML() : detailHTML(get(st.open))}</div>`; }
  const closeBtn = `<button data-act="close" aria-label="Sluiten" style="position:absolute;top:12px;right:12px;z-index:2;width:40px;height:40px;border-radius:999px;border:0;background:var(--surface-sunken);display:grid;place-items:center;color:var(--text-muted);cursor:pointer">${ico('x', 18, 2.2)}</button>`;
  const mergeBtn = () => pill('selmode', st.selecting ? 'Kies categorieën' : 'Samenvoegen', st.selecting ? 'on' : 'soft', 'merge');
  function toastHTML() {
    if (!st.toast) return '';
    return `<div role="status" class="cm-in" style="position:absolute;z-index:40;left:${phone ? '50%' : 'calc(240px + (100% - 240px) / 2)'};bottom:${phone ? (st.selecting ? 92 : 24) : 24}px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;min-height:44px;max-width:calc(100% - 32px);padding:0 ${st.toast.undo ? 6 : 16}px 0 16px;border-radius:999px;background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-raised);box-sizing:border-box;font-family:var(--font-sans);color:var(--text);font-size:14px">${ico('check', 16, 2.6)}<span style="min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${st.toast.text}</span>${st.toast.undo ? `<button data-act="undo" style="flex:0 0 auto;min-height:36px;padding:0 12px;border-radius:999px;border:0;background:var(--accent-soft);color:var(--accent-hover);font:inherit;font-size:13px;font-weight:600;cursor:pointer">Ongedaan maken</button>` : ''}</div>`;
  }
  function html() {
    const font = 'font-family:var(--font-sans);color:var(--text)';
    if (st.view !== 'list') {
      const body = CATR.html(ctx);
      return phone ? `<div data-scroll="main" style="position:absolute;inset:0;overflow-y:auto;padding:16px 16px 40px;box-sizing:border-box;${font}">${body}</div>${toastHTML()}` : `${navHTML()}<div data-scroll="main" style="position:absolute;top:0;bottom:0;left:240px;right:0;overflow-y:auto;padding:28px 40px 40px;box-sizing:border-box;${font}">${body}</div>${toastHTML()}`;
    }
    if (phone) {
      const head = `<div style="display:flex;align-items:center;justify-content:space-between;min-height:48px"><button data-act="back" style="display:flex;align-items:center;gap:2px;min-height:44px;padding:0 10px 0 0;border:0;background:none;font:inherit;font-size:15px;font-weight:500;color:var(--text-muted);cursor:pointer">${ico('left', 20, 2.2)}Profiel</button><button data-act="new" aria-label="Nieuwe categorie" style="width:44px;height:44px;border-radius:999px;border:0;background:var(--accent);color:var(--accent-fg);display:grid;place-items:center;cursor:pointer">${ico('plus', 20, 2.4)}</button></div><div style="display:flex;flex-direction:column;gap:4px;padding-left:8px"><b style="font-size:30px;font-weight:600;letter-spacing:-.02em">Categorieën</b></div><div style="display:flex;gap:8px">${search('q', st.q, 'Zoek categorie', true)}${mergeBtn()}</div>`;
      const sheet = panelOpen() ? `<div data-act="close" class="${st.anim ? 'cm-scrim' : ''}" style="position:absolute;inset:0;z-index:20;background:var(--scrim, rgb(14 16 10 / .42))"></div><div data-scroll="panel" class="${st.anim ? 'cm-sheet' : ''}" style="position:absolute;left:0;right:0;bottom:0;top:56px;z-index:21;border-radius:28px 28px 0 0;background:var(--surface-raised);box-shadow:var(--shadow-raised);overflow-y:auto;box-sizing:border-box;${font}"><span style="display:block;margin:8px auto 0;width:36px;height:5px;border-radius:999px;background:var(--border)"></span>${closeBtn}${panelBody()}</div>` : '';
      return `<div data-scroll="list" style="position:absolute;inset:0;overflow-y:auto;padding:16px 16px 40px;box-sizing:border-box;${font}"><div style="display:flex;flex-direction:column;gap:16px">${head}${listHTML()}</div>${selBarHTML()}</div>${sheet}${toastHTML()}`;
    }
    const head = `<div style="display:flex;flex-direction:column;gap:4px;flex:0 0 auto"><button data-act="back" style="align-self:flex-start;display:flex;align-items:center;gap:2px;min-height:32px;padding:0 8px 0 0;border:0;background:none;font:inherit;font-size:14px;font-weight:500;color:var(--text-muted);cursor:pointer">${ico('left', 16, 2.2)}Profiel</button><div style="display:flex;align-items:center;gap:8px"><b style="flex:1;font-size:30px;font-weight:600;letter-spacing:-.02em">Categorieën</b><span style="display:flex;width:240px">${search('q', st.q, 'Zoek categorie', true)}</span>${mergeBtn()}${pill('new', 'Nieuw', 'primary', 'plus')}</div></div>`;
    const panel = panelOpen() ? `<aside data-scroll="panel" class="${st.anim ? 'cm-panel' : ''}" style="position:relative;min-height:0;overflow-y:auto;margin-bottom:24px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-card)">${closeBtn}${panelBody()}</aside>` : '';
    return `${navHTML()}<div style="position:absolute;top:0;bottom:0;left:240px;right:0;display:flex;flex-direction:column;gap:20px;padding:28px 40px 0;box-sizing:border-box;${font}">${head}<div style="flex:1;min-height:0;display:grid;grid-template-columns:${panel ? 'minmax(0,1fr) 420px' : 'minmax(0,720px)'};gap:24px"><div data-scroll="list" style="min-height:0;overflow-y:auto;margin:0 -6px;padding:2px 6px 24px"><div style="display:flex;flex-direction:column;gap:16px">${listHTML()}</div>${selBarHTML()}</div>${panel}</div></div>${toastHTML()}`;
  }
  function render() {
    const a = document.activeElement, k = a && root.contains(a) && a.dataset && a.dataset.k, pos = k ? [a.selectionStart, a.selectionEnd] : null, sc = {};
    root.querySelectorAll('[data-scroll]').forEach(e => sc[e.dataset.scroll] = e.scrollTop);
    root.innerHTML = html();
    root.querySelectorAll('[data-scroll]').forEach(e => { if (sc[e.dataset.scroll] != null && !st.reset.includes(e.dataset.scroll)) e.scrollTop = sc[e.dataset.scroll]; });
    if (k) { const n = root.querySelector(`[data-k="${k}"]`); if (n) { n.focus({ preventScroll:true }); try { n.setSelectionRange(pos[0], pos[1]); } catch (e) {} } }
    if (st.scrollTo) { const el = root.querySelector(st.scrollTo), p = root.querySelector('[data-scroll="panel"]'); if (el && p) p.scrollTop = el.offsetTop - 80; st.scrollTo = null; }
    st.anim = false; st.reset = [];
  }
  const fresh = () => { st.anim = true; st.reset = ['panel']; st.draft = null; st.del = false; st.look = false; st.iq = ''; };

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || !root.contains(b) || b.disabled) return;
    const a = b.dataset.act, id = b.dataset.id, v = b.dataset.v, c = st.open && st.open !== 'new' ? get(st.open) : null;
    if (window.CATR && CATR.act(a, b, ctx)) return render();
    if (a === 'open') { if (st.open === id && !phone) { st.open = null; } else { st.open = id; st.merge = false; fresh(); } }
    else if (a === 'close') { st.open = null; st.merge = false; st.nw = null; st.del = false; if (phone && st.selecting && st.sel.size < 2) {} }
    else if (a === 'new') { st.open = 'new'; st.merge = false; st.selecting = false; st.sel.clear(); st.nw = { name:'', color:'yellow', icon:'gift', soort:null }; fresh(); }
    else if (a === 'selmode') { if (st.selecting) { st.selecting = false; st.sel.clear(); st.merge = false; } else { st.selecting = true; st.sel.clear(); st.open = null; } }
    else if (a === 'tsel') { st.sel.has(id) ? st.sel.delete(id) : st.sel.add(id); if (st.mergeTo === id) st.mergeTo = null; st.mergeName = null; }
    else if (a === 'cancel-sel') { st.selecting = false; st.sel.clear(); st.merge = false; st.mergeTo = null; st.mergeName = null; }
    else if (a === 'go-merge') { st.merge = true; st.open = null; st.other = false; st.mergeTo = null; st.mergeName = null; fresh(); }
    else if (a === 'mergewith') { st.selecting = true; st.sel = new Set([c.id]); st.open = null; st.merge = !phone; st.mergeTo = null; st.mergeName = null; fresh(); }
    else if (a === 'mto') { st.mergeTo = id; st.mergeName = null; st.other = false; }
    else if (a === 'mother') st.other = !st.other;
    else if (a === 'domerge') { const p = mergePlan(); doMerge(p.tgt, p.moving, p.name); st.selecting = false; st.sel.clear(); st.merge = false; st.mergeTo = null; st.mergeName = null; st.open = p.tgt.id; fresh(); toast(`Samengevoegd in ${esc(p.tgt.name)}: ${tx(p.N)} erbij`); }
    else if (a === 'color' || a === 'icon') { (st.open === 'new' ? st.nw : c)[a] = v; }
    else if (a === 'soort') { const t = st.open === 'new' ? st.nw : c; t.soort = st.open === 'new' && t.soort === v ? null : v; }
    else if (a === 'look') st.look = true;
    else if (a === 'save') { const old = c.name; c.name = st.draft.trim(); st.draft = null; toast(`${esc(old)} heet nu ${esc(c.name)}`, () => { c.name = old; }); }
    else if (a === 'rdel') { const i = +b.dataset.i, r = c.rules.splice(i, 1)[0]; toast(`${esc(r.who)} niet meer vanzelf als ${esc(c.name)}`, () => c.rules.splice(i, 0, r)); }
    else if (a === 'hide') { c.hidden = !c.hidden; const cc = c; toast(c.hidden ? `${esc(c.name)} staat niet meer in de kiezer` : `${esc(c.name)} staat weer in de kiezer`, () => { cc.hidden = !cc.hidden; }); }
    else if (a === 'ask-del') { st.del = true; st.delChoice = 'merge'; st.delTo = null; st.dq = ''; st.scrollTo = '[data-deltile]'; }
    else if (a === 'cancel-del') st.del = false;
    else if (a === 'dchoice') st.delChoice = v;
    else if (a === 'delto') st.delTo = id;
    else if (a === 'dodel') {
      const i = cats.indexOf(c);
      if (c.n && st.delChoice === 'merge') { const t = get(st.delTo); doMerge(t, [c], t.name); toast(`${esc(c.name)} is opgegaan in ${esc(t.name)}`); }
      else { cats.splice(i, 1); toast(c.n ? `${esc(c.name)} is weg. ${tx(c.n)} staan in Nakijken.` : `${esc(c.name)} is weg`, c.n ? null : () => cats.splice(i, 0, c)); }
      st.open = null; st.del = false;
    }
    else if (a === 'donew') { const nw = st.nw, n = { id:'n' + cats.length + Date.now(), name:nw.name.trim(), color:nw.color, icon:nw.icon, soort:nw.soort, n:0, af:0, bij:0, budget:null, rules:[], since:'2026' }; cats.push(n); st.nw = null; st.open = n.id; fresh(); toast(`${esc(n.name)} toegevoegd`, () => { cats.splice(cats.indexOf(n), 1); st.open = null; }); }
    else if (a === 'hidden') st.showHidden = !st.showHidden;
    else if (a === 'undo') { const u = st.toast && st.toast.undo; st.toast = null; if (u) u(); }
    else if (a === 'round-tikkies' || a === 'round-splits') { st.view = a === 'round-tikkies' ? 'tikkies' : 'splits'; st.open = null; st.merge = false; st.selecting = false; st.sel.clear(); st.reset = ['main']; }
    else return;
    render();
  });
  root.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k; if (!k) return;
    const v = e.target.value;
    if (k === 'q') st.q = v; else if (k === 'name') st.draft = v; else if (k === 'nname') st.nw.name = v; else if (k === 'mname') st.mergeName = v; else if (k === 'iq') st.iq = v; else if (k === 'dq') st.dq = v; else if (k === 'oq') st.oq = v;
    else if (window.CATR && CATR.input(k, v, ctx)) {} else return;
    render();
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.k === 'name') { const s = root.querySelector('[data-act="save"]'); s && s.click(); } });
  render();
  return { st, render };
}
window.CATAPP = { App };
})();
