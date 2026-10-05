/* Transacties v2: de pagina zelf. Kop met rekeningen, filters die inklappen bij
   scrollen, de lijst per dag, de kiezers (periode, categorieën, categorie van
   een rij) en de houders voor het detail. De inhoud van het detail staat in
   tx2-detail.js. */
(() => {
const X = window.TX2, { ico, CATS, CAT, tone, TX, store, eur, signed, dayTitle, range, iso, PRESETS, TODAY, MONL, at } = X;
const SET = window.TX2SET = Object.assign({ placement:'onder', variant:'B', apps:[] }, window.TX2SET || {});
X.refreshAll = () => SET.apps.forEach(a => a.refresh());
store.subs.push(X.refreshAll);

if (!document.getElementById('tx2-css')) {
  const s = document.createElement('style'); s.id = 'tx2-css';
  s.textContent = `.tx-pen{position:absolute;right:-1px;bottom:-1px;width:18px;height:18px;border-radius:999px;background:var(--surface-raised);border:1px solid var(--border);display:grid;place-items:center;color:var(--text-muted);opacity:0;transition:opacity .15s;box-sizing:border-box}
.tx-chip{transition:box-shadow .15s}
@media (hover:hover) and (pointer:fine){[data-row]:hover{background:var(--surface-sunken)}.tx-ico:hover .tx-chip{box-shadow:0 0 0 2px var(--surface-raised),0 0 0 3.5px currentColor}.tx-ico:hover .tx-pen{opacity:1}[data-hov]:hover{background:var(--surface-sunken)}}
@keyframes txUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
@keyframes txIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@keyframes txSide{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
@keyframes txFade{from{opacity:0}to{opacity:1}}
.tx-sheet{animation:txUp .28s cubic-bezier(.32,.72,0,1)}.tx-in{animation:txIn .18s ease}.tx-panel{animation:txSide .28s cubic-bezier(.32,.72,0,1)}.tx-scrim{animation:txFade .2s ease}
.tx-hscroll{scrollbar-width:none}.tx-hscroll::-webkit-scrollbar{display:none}
.tx-mono{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace}`;
  document.head.appendChild(s);
}

const chip = (c, s = 36) => `<span class="tx-chip" style="width:${s}px;height:${s}px;border-radius:999px;display:grid;place-items:center;flex:0 0 auto;background:${c ? tone(c).bg : 'var(--surface-sunken)'};color:${c ? tone(c).fg : 'var(--text-muted)'}">${ico(c ? c.icon : 'transfer', Math.round(s * .5))}</span>`;
const logo = (bank, s = 32, off) => `<img src="banks/${bank}.png" alt="" width="${s}" height="${s}" style="flex:0 0 auto;display:block;width:${s}px;height:${s}px;border-radius:${Math.round(s * .3)}px;border:1px solid var(--border);box-shadow:var(--shadow-card);box-sizing:border-box;background:var(--surface-raised);object-fit:cover;${off ? 'filter:grayscale(1);opacity:.45;' : ''}transition:filter .2s,opacity .2s">`;
const amtColor = t => t.transfer ? 'var(--text-muted)' : t.amt > 0 ? 'var(--success)' : 'var(--text)';
const subOf = (t, multi) => [t.transfer ? 'Overboeking, telt niet mee' : t.cat ? CAT[t.cat].name : 'Nakijken', multi ? store.acc(t.acc).name : null].filter(Boolean).join(' · ');
const fbtn = on => `display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px 0 14px;border-radius:999px;border:1px solid ${on ? 'transparent' : 'var(--border)'};background:${on ? 'var(--accent-soft)' : 'var(--surface-raised)'};color:${on ? 'var(--accent-hover)' : 'var(--text)'};font:inherit;font-size:14px;font-weight:${on ? 600 : 500};cursor:pointer;white-space:nowrap;box-sizing:border-box`;
const SPECIAL = { _nk:'Nakijken', _ob:'Overboekingen' };
const switchEl = on => `<span style="flex:0 0 auto;position:relative;width:44px;height:26px;border-radius:999px;background:${on ? 'var(--accent)' : 'var(--border)'};transition:background .15s"><span style="position:absolute;top:3px;left:${on ? 21 : 3}px;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:left .15s"></span></span>`;
X.ui = { chip, logo, amtColor, subOf, switchEl };

function navHTML() {
  const item = (icon, label, on, badge) => `<span style="position:relative;height:48px;display:flex;align-items:center;gap:12px;padding:0 12px;font-size:15px;font-weight:500;color:${on ? 'var(--accent)' : 'var(--text-muted)'};border-radius:var(--radius-lg);${on ? 'background:var(--glass-tint-strong);border:1px solid var(--glass-border);box-shadow:var(--glass-rim);' : ''}">${ico(icon, 20, on ? 2.4 : 1.8)}${label}${badge ? `<span style="margin-left:auto;padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent-hover);font-size:13px;font-weight:600">${badge}</span>` : ''}</span>`;
  return `<nav style="position:absolute;top:0;bottom:0;left:0;width:240px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px;padding:20px 12px 16px;background:var(--glass-tint);backdrop-filter:var(--glass-blur);border-right:1px solid var(--glass-border);box-shadow:var(--glass-highlight);z-index:2"><span style="height:44px;display:flex;align-items:center;padding:0 12px;font-size:20px;font-weight:600;letter-spacing:-.035em">Mone.<span style="color:var(--accent)">Y</span>o<span style="color:var(--botergoud)">Im</span></span><div style="display:flex;flex-direction:column;gap:6px">${item('receiptnav', 'Transacties', true, TX.filter(t => !t.confirmed).length)}${item('wallet', 'Budgetten')}${item('grid', 'Inzicht')}</div><div style="margin-top:auto;display:flex;align-items:center;gap:8px;min-height:48px;padding-left:6px"><span style="width:32px;height:32px;border-radius:999px;background:var(--member-yoran);color:#fff;display:grid;place-items:center;font-size:14px;font-weight:600">Y</span><b style="font-size:14px;font-weight:600">Yoran</b></div></nav>`;
}
function tabHTML() {
  const it = (icon, label, on) => `<span style="height:52px;border-radius:999px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:11px;font-weight:600;color:${on ? 'var(--accent)' : 'var(--text-muted)'};${on ? 'background:var(--glass-tint-strong);box-shadow:var(--glass-rim);' : ''}">${ico(icon, 20, on ? 2.4 : 1.8)}${label}</span>`;
  return `<div style="position:absolute;left:20px;right:20px;bottom:20px;z-index:6;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:6px;border-radius:999px;background:var(--glass-tint);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);box-shadow:var(--glass-rim),var(--shadow-raised)">${it('receiptnav', 'Transacties', true)}${it('wallet', 'Budgetten')}${it('grid', 'Inzicht')}</div>`;
}

function App(root, opt = {}) {
  const phone = opt.mode === 'phone', V = () => opt.variant || SET.variant;
  const st = { view:new Set(opt.view || ['asn-y']), from:'2026-10-01', to:'2026-10-31', preset:'deze', cats:new Set(opt.cats || []), collapsed:false, peek:false, peekY:0, pop:null, popId:null, pos:null, detail:opt.openDetail || null, dpos:null, ym:[2026, 9], anchor:null, q:'', rule:false, toast:null };
  root.style.position = 'relative'; root.style.overflow = 'hidden';
  root.innerHTML = phone
    ? `<div data-scroller style="position:absolute;inset:0;overflow-y:auto;padding:16px 16px 112px;box-sizing:border-box"><div style="display:flex;flex-direction:column;gap:16px;font-family:var(--font-sans);color:var(--text)"><div style="display:flex;align-items:center;justify-content:space-between;padding-left:8px"><b style="font-size:30px;font-weight:600;letter-spacing:-.02em">Transacties</b><span style="width:48px;height:48px;display:grid;place-items:center"><span style="width:36px;height:36px;border-radius:999px;background:var(--member-yoran);color:#fff;display:grid;place-items:center;font-size:14px;font-weight:600">Y</span></span></div><div data-sticky style="position:sticky;top:8px;z-index:4;display:flex;flex-direction:column;gap:8px"></div><div data-list style="display:flex;flex-direction:column;gap:16px"></div></div></div>${tabHTML()}<div data-overlay style="position:absolute;inset:0;pointer-events:none;z-index:30;font-family:var(--font-sans);color:var(--text)"></div>`
    : `${navHTML()}<div data-scroller style="position:absolute;top:0;bottom:0;left:240px;right:0;overflow-y:auto;padding:28px 40px 40px;box-sizing:border-box"><div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:20px;font-family:var(--font-sans);color:var(--text)"><div style="display:flex;align-items:center;gap:12px"><b style="flex:1;font-size:30px;font-weight:600;letter-spacing:-.02em">Transacties</b><label style="display:flex;align-items:center;gap:8px;width:260px;height:44px;padding:0 14px;border-radius:999px;background:var(--surface-raised);border:1px solid var(--border);box-sizing:border-box;color:var(--text-muted)">${ico('search', 16, 2.2)}<input placeholder="Zoek transacties" style="flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:14px;color:var(--text)"></label></div><div data-sticky style="position:sticky;top:20px;z-index:4;display:flex;flex-direction:column;gap:8px"></div><div data-list style="display:flex;flex-direction:column;gap:16px"></div></div></div><div data-overlay style="position:absolute;inset:0;pointer-events:none;z-index:30;font-family:var(--font-sans);color:var(--text)"></div>`;
  const $ = s => root.querySelector(s);
  const scroller = $('[data-scroller]'), stickyEl = $('[data-sticky]'), listEl = $('[data-list]'), overlay = $('[data-overlay]');

  const inView = t => st.view.has(t.acc) && !store.hidden.has(t.acc) && t.d >= st.from && t.d <= st.to;
  const catMatch = t => !st.cats.size || (t.transfer ? st.cats.has('_ob') : (st.cats.has('_nk') && !t.confirmed) || st.cats.has(t.cat));
  const catLabel = () => { const ids = [...st.cats]; return !ids.length ? 'Alle categorieën' : ids.length === 1 ? (SPECIAL[ids[0]] || CAT[ids[0]].name) : `${ids.length} categorieën`; };
  const nameOf = id => SPECIAL[id] || CAT[id].name;
  const presetName = () => PRESETS.find(p => p.id === st.preset)?.name;

  function fixView() {
    [...st.view].forEach(id => store.hidden.has(id) && st.view.delete(id));
    if (!st.view.size) st.view.add(store.visible()[0].id);
  }

  function filtersHTML() {
    const ids = [...st.cats], max = phone ? 2 : 4;
    const per = `<button data-act="pop-period" style="${fbtn(st.preset !== 'deze')}">${ico('calendar', 16, 2.2)}${!phone && presetName() ? `<span>${presetName()}</span><span style="color:${st.preset !== 'deze' ? 'inherit' : 'var(--text-muted)'};font-weight:500">${range(st.from, st.to)}</span>` : `<span>${range(st.from, st.to)}</span>`}${ico('down', 16, 2.2)}</button>`;
    const cats = `<button data-act="pop-cats" style="${fbtn(ids.length > 0)}">${phone ? '' : ico('filter', 16, 2.2)}<span>${catLabel()}</span>${ico('down', 16, 2.2)}</button>`;
    const chips = ids.length > 1 ? ids.slice(0, max).map(id => `<button data-act="rmcat" data-id="${id}" aria-label="${nameOf(id)} weghalen" style="display:flex;align-items:center;gap:6px;min-height:36px;padding:0 8px 0 6px;border-radius:999px;border:0;background:${CAT[id] ? tone(CAT[id]).bg : 'var(--surface-sunken)'};color:${CAT[id] ? tone(CAT[id]).fg : 'var(--text)'};font:inherit;font-size:13px;font-weight:600;cursor:pointer">${CAT[id] ? ico(CAT[id].icon, 14, 2.2) : ''}${nameOf(id)}${ico('x', 14, 2.4)}</button>`).join('') + (ids.length > max ? `<span style="font-size:13px;color:var(--text-muted);padding:0 4px">+${ids.length - max}</span>` : '') : '';
    const dirty = st.preset !== 'deze' || ids.length;
    if (phone) {
      // Telefoon: één rij, geen losse pills. De keuze zit als icoontjes in de knop; weghalen gaat in de sheet.
      const stack = ids.slice(0, 3).map((id, i) => { const c = CAT[id]; return `<span style="flex:0 0 auto;width:24px;height:24px;border-radius:999px;display:grid;place-items:center;margin-left:${i ? -8 : 0}px;box-shadow:0 0 0 2px var(--accent-soft);background:${c ? tone(c).bg : 'var(--surface-sunken)'};color:${c ? tone(c).fg : 'var(--text-muted)'}">${c ? ico(c.icon, 13, 2.2) : id === '_nk' ? '<span style="width:7px;height:7px;border-radius:999px;background:var(--botergoud)"></span>' : ico('transfer', 13, 2.2)}</span>`; }).join('');
      const perP = `<button data-act="pop-period" style="${fbtn(st.preset !== 'deze')};flex:0 0 auto;padding:0 14px">${ico('calendar', 16, 2.2)}<span>${range(st.from, st.to)}</span></button>`;
      const catsP = `<button data-act="pop-cats" aria-label="Categorieën: ${ids.length ? ids.map(nameOf).join(', ') : 'alle'}" style="${fbtn(ids.length > 0)};flex:1 1 auto;min-width:0;padding:0 12px 0 ${ids.length ? 8 : 14}px">${ids.length ? `<span style="display:flex">${stack}</span>` : ico('filter', 16, 2.2)}<span style="min-width:0;overflow:hidden;text-overflow:ellipsis">${ids.length > 1 ? `<b style="font-weight:600">${ids.length}</b>` : catLabel()}</span><span style="margin-left:auto;display:flex">${ico('down', 16, 2.2)}</span></button>`;
      const resetP = dirty ? `<button data-act="reset" aria-label="Filters wissen" title="Wissen" style="flex:0 0 auto;width:44px;height:44px;border-radius:999px;border:1px solid var(--border);background:var(--surface-raised);display:grid;place-items:center;color:var(--text-muted);cursor:pointer">${ico('x', 16, 2.4)}</button>` : '';
      return `<div class="tx-in" style="display:flex;align-items:center;gap:6px">${perP}${catsP}${resetP}</div>`;
    }
    return `<div class="tx-in" style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">${per}${cats}${chips}${dirty ? `<button data-act="reset" style="margin-left:auto;min-height:44px;padding:0 10px;border:0;background:none;font:inherit;font-size:14px;font-weight:600;color:var(--text-muted);cursor:pointer">Wissen</button>` : ''}</div>`;
  }
  function summaryHTML(slim) {
    return `<button data-act="peek" class="tx-in" aria-label="Filters tonen" style="display:flex;align-items:center;gap:8px;width:100%;min-height:${slim ? 40 : 36}px;padding:0 ${slim ? 14 : 4}px;border:0;background:none;font:inherit;font-size:13px;color:var(--text-muted);cursor:pointer;text-align:left;box-sizing:border-box">${ico('filter', 15, 2.2)}<span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><b style="font-weight:600;color:var(--text)">${range(st.from, st.to)}</b> · ${st.cats.size ? [...st.cats].map(nameOf).join(', ') : 'alle categorieën'}</span>${ico('down', 16, 2.2)}</button>`;
  }
  const glass = 'border-radius:var(--radius-lg);background:var(--glass-tint-strong);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);box-shadow:var(--glass-rim),var(--shadow-card);box-sizing:border-box';

  function renderSticky() {
    fixView();
    const accs = store.visible(), shown = accs.filter(a => st.view.has(a.id));
    const bal = shown.filter(a => a.bal != null).reduce((s, a) => s + a.bal, 0);
    const head = `<p style="margin:0;padding:0 4px;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:10px;row-gap:1px;font-size:12px;color:var(--text-muted)"><b style="font-size:${phone ? 18 : 20}px;font-weight:600;letter-spacing:-.01em;color:var(--text);font-variant-numeric:tabular-nums;white-space:nowrap">${eur(bal)}</b><span style="white-space:nowrap">${shown.length === 1 ? shown[0].name : `${shown.length} rekeningen`}</span><span><b style="font-weight:600;color:var(--text);font-variant-numeric:tabular-nums;white-space:nowrap">${bal - 35819 < 0 ? '−' : ''}${eur(bal - 35819)}</b> na vaste lasten die nog komen</span></p>`;
    const chips = `<div role="group" aria-label="Rekeningen in beeld" class="tx-hscroll" style="display:flex;gap:8px;overflow-x:auto;margin:0 -12px;padding:0 12px">${accs.map(a => { const on = st.view.has(a.id); return `<button data-act="acc" data-id="${a.id}" aria-pressed="${on}" style="flex:0 0 auto;display:flex;align-items:center;gap:8px;height:48px;padding:0 14px 0 6px;border-radius:14px;border:1px solid ${on ? 'var(--border)' : 'transparent'};background:${on ? 'var(--surface-raised)' : 'transparent'};box-shadow:${on ? 'var(--shadow-card)' : 'none'};font:inherit;color:${on ? 'var(--text)' : 'var(--text-muted)'};cursor:pointer;text-align:left;transition:background .2s,border-color .2s">${logo(a.bank, 32, !on)}<span style="display:flex;flex-direction:column"><span style="font-size:13px;line-height:1.25;font-weight:${on ? 600 : 500};white-space:nowrap">${a.name}</span>${a.bal != null ? `<span style="font-size:12px;line-height:1.25;color:var(--text-muted);font-variant-numeric:tabular-nums;white-space:nowrap">${eur(a.bal)}</span>` : ''}</span></button>`; }).join('')}</div>`;
    const collapsed = st.collapsed;
    if (SET.placement === 'in') {
      stickyEl.innerHTML = `<div style="${glass};display:flex;flex-direction:column;gap:${collapsed ? 6 : 10}px;padding:10px 12px ${collapsed ? 4 : 12}px">${head}${chips}${collapsed ? summaryHTML(false) : filtersHTML()}</div>`;
    } else {
      stickyEl.innerHTML = `<div style="${glass};display:flex;flex-direction:column;gap:8px;padding:10px 12px 12px">${head}${chips}</div><div style="${glass};${collapsed ? 'border-radius:999px;' : 'padding:8px;'}">${collapsed ? summaryHTML(true) : filtersHTML()}</div>`;
    }
  }

  function rowHTML(t, multi) {
    const c = t.cat ? CAT[t.cat] : null, open = st.detail === t.id;
    return `<div data-row="${t.id}" data-act="detail" style="display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:60px;margin:0 -8px;padding:0 8px;border-radius:14px;cursor:pointer;${open ? 'background:var(--surface-sunken);' : ''}">${t.transfer ? `<span style="display:grid;place-items:center">${chip(null)}</span>` : `<button data-act="cat" data-id="${t.id}" class="tx-ico" aria-label="Categorie van ${t.who} wijzigen" style="position:relative;width:44px;height:44px;margin:-4px;padding:0;border:0;background:none;display:grid;place-items:center;cursor:pointer;border-radius:999px">${chip(c)}<span class="tx-pen">${ico('pencil', 10, 2.4)}</span></button>`}<span style="min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${t.transfer ? 'color:var(--text-muted)' : ''}">${t.who}</span><span style="font-size:13px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${!t.confirmed ? '<span style="display:inline-block;width:7px;height:7px;border-radius:999px;background:var(--botergoud);margin-right:6px;vertical-align:1px"></span>' : ''}${subOf(t, multi)}</span></span><span style="font-size:15px;font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap;color:${amtColor(t)}">${signed(t.amt)}</span></div>${open && V() === 'A' ? `<div class="tx-in" style="padding:4px 0 14px">${window.TX2D.content('A', t, { phone, view:st.view })}</div>` : ''}`;
  }
  function renderList() {
    const rows = TX.filter(t => inView(t) && catMatch(t)), multi = st.view.size > 1;
    const days = [...new Set(rows.map(t => t.d))].sort().reverse();
    listEl.innerHTML = days.length ? days.map(d => {
      const r = rows.filter(t => t.d === d), net = r.filter(t => !t.transfer).reduce((s, t) => s + t.amt, 0);
      return `<section style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;padding:4px 4px 0;font-size:13px;font-weight:600;color:var(--text-muted);font-variant-numeric:tabular-nums;white-space:nowrap"><span>${dayTitle(d)}</span><span style="${net > 0 ? 'color:var(--success)' : ''}">${signed(net)}</span></div><div style="display:flex;flex-direction:column;padding:4px 16px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-card)">${r.map(t => rowHTML(t, multi)).join('')}</div></section>`;
    }).join('') : `<div style="padding:48px 16px;text-align:center;display:flex;flex-direction:column;gap:6px"><b style="font-size:17px;font-weight:600">Niets in deze periode.</b><span style="font-size:14px;color:var(--text-muted)">Kies hierboven een andere periode, categorie of rekening.</span></div>`;
  }

  /* Kiezers */
  function periodHTML() {
    const [y, m] = st.ym, first = new Date(Date.UTC(y, m, 1)), lead = (first.getUTCDay() + 6) % 7, n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cell = phone ? 44 : 38;
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span></span>';
    for (let d = 1; d <= n; d++) {
      const ds = iso(y, m, d), inR = ds >= st.from && ds <= st.to, end = ds === st.from || ds === st.to;
      const dow = (lead + d - 1) % 7, rowStart = dow === 0 || d === 1, rowEnd = dow === 6 || d === n, single = st.from === st.to;
      const band = inR && !single ? `<span aria-hidden="true" style="position:absolute;top:0;bottom:0;left:${ds === st.from ? '50%' : rowStart ? 'calc(50% - ' + cell / 2 + 'px)' : '0'};right:${ds === st.to ? '50%' : rowEnd ? 'calc(50% - ' + cell / 2 + 'px)' : '0'};background:var(--accent-soft);border-radius:${ds !== st.from && rowStart ? '999px' : '0'} ${ds !== st.to && rowEnd ? '999px' : '0'} ${ds !== st.to && rowEnd ? '999px' : '0'} ${ds !== st.from && rowStart ? '999px' : '0'}"></span>` : '';
      cells += `<span style="position:relative;height:${cell}px;display:grid;place-items:center">${band}<button data-act="day" data-d="${ds}" style="position:relative;width:${cell}px;height:${cell}px;border-radius:999px;border:0;font:inherit;font-size:14px;font-variant-numeric:tabular-nums;cursor:pointer;background:${end ? 'var(--accent)' : 'transparent'};color:${end ? 'var(--accent-fg)' : inR ? 'var(--accent-hover)' : 'var(--text)'};font-weight:${end || inR ? 600 : 400};${ds === TODAY && !end ? 'box-shadow:inset 0 0 0 1.5px var(--text-subtle);' : ''}">${d}</button></span>`;
    }
    const presets = PRESETS.map(p => { const on = st.preset === p.id; return `<button data-act="preset" data-id="${p.id}" data-hov style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;min-height:52px;padding:6px 12px;border-radius:14px;border:1px solid ${on ? 'transparent' : phone ? 'var(--border)' : 'transparent'};background:${on ? 'var(--accent-soft)' : 'transparent'};font:inherit;text-align:left;cursor:pointer"><span style="font-size:14px;font-weight:600;color:${on ? 'var(--accent-hover)' : 'var(--text)'}">${p.name}</span><span style="font-size:12px;color:var(--text-muted)">${range(p.from, p.to)}</span></button>`; }).join('');
    const cal = `<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;justify-content:space-between"><button data-act="calnav" data-dir="-1" aria-label="Vorige maand" style="width:40px;height:40px;border-radius:999px;border:0;background:none;display:grid;place-items:center;color:var(--text-muted);cursor:pointer">${ico('left', 18, 2.2)}</button><b style="font-size:14px;font-weight:600">${MONL[m]} ${y}</b><button data-act="calnav" data-dir="1" aria-label="Volgende maand" style="width:40px;height:40px;border-radius:999px;border:0;background:none;display:grid;place-items:center;color:var(--text-muted);cursor:pointer">${ico('right', 18, 2.2)}</button></div><div style="display:grid;grid-template-columns:repeat(7,1fr);font-size:11px;font-weight:600;color:var(--text-subtle);text-align:center">${['ma','di','wo','do','vr','za','zo'].map(d => `<span>${d}</span>`).join('')}</div><div style="display:grid;grid-template-columns:repeat(7,1fr);row-gap:6px">${cells}</div><span style="font-size:12px;color:var(--text-muted);text-align:center;padding-top:2px">${st.anchor ? 'Kies de einddatum' : 'Tik op een begin- en een einddatum'}</span></div>`;
    return phone ? `<div style="display:flex;flex-direction:column;gap:14px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${presets}</div>${cal}</div>`
      : `<div style="display:grid;grid-template-columns:180px 1fr;gap:12px;width:540px"><div style="display:flex;flex-direction:column;gap:2px;padding-right:12px;border-right:1px solid var(--border)">${presets}</div>${cal}</div>`;
  }
  const inPeriod = () => TX.filter(inView);
  function catRow(id, name, c, count, on, act = 'fcat') {
    return `<button data-act="${act}" data-id="${id}" data-hov style="display:flex;align-items:center;gap:10px;min-height:48px;width:100%;padding:0 10px 0 8px;border-radius:12px;border:0;background:transparent;font:inherit;color:var(--text);text-align:left;cursor:pointer;${count === 0 ? 'opacity:.55;' : ''}">${c === 'all' ? `<span style="width:28px;height:28px;border-radius:999px;display:grid;place-items:center;background:var(--surface-sunken);color:var(--text-muted)">${ico('filter', 14, 2.2)}</span>` : c === 'nk' ? `<span style="width:28px;height:28px;border-radius:999px;display:grid;place-items:center;background:var(--surface-sunken)"><span style="width:8px;height:8px;border-radius:999px;background:var(--botergoud)"></span></span>` : chip(c, 28)}<span style="flex:1;min-width:0;font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</span>${count != null ? `<span style="font-size:13px;color:var(--text-muted);font-variant-numeric:tabular-nums">${count}</span>` : ''}<span style="flex:0 0 auto;width:22px;height:22px;border-radius:7px;display:grid;place-items:center;box-sizing:border-box;border:1.5px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'var(--accent)' : 'transparent'};color:var(--accent-fg)">${on ? ico('check', 14, 3) : ''}</span></button>`;
  }
  function catListHTML() {
    const rows = inPeriod(), q = st.q.trim().toLowerCase();
    const cnt = id => rows.filter(t => id === '_ob' ? t.transfer : id === '_nk' ? !t.transfer && !t.confirmed : !t.transfer && t.cat === id).length;
    const cats = CATS.filter(c => !q || c.name.toLowerCase().includes(q)).sort((a, b) => (cnt(b.id) > 0) - (cnt(a.id) > 0) || a.name.localeCompare(b.name, 'nl'));
    const lab = s => `<span style="padding:10px 10px 2px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-subtle)">${s}</span>`;
    return (q ? '' : catRow('', 'Alle categorieën', 'all', null, !st.cats.size) + catRow('_nk', 'Nakijken', 'nk', cnt('_nk'), st.cats.has('_nk')) + catRow('_ob', 'Overboekingen', null, cnt('_ob'), st.cats.has('_ob')) + lab('Categorieën'))
      + cats.map(c => catRow(c.id, c.name, c, cnt(c.id), st.cats.has(c.id))).join('') + (cats.length ? '' : '<span style="padding:12px 10px;font-size:14px;color:var(--text-muted)">Geen categorie gevonden</span>');
  }
  const search = ph => `<label style="display:flex;align-items:center;gap:8px;height:44px;padding:0 14px;border-radius:999px;background:var(--surface-sunken);color:var(--text-muted);flex:0 0 auto">${ico('search', 16, 2.2)}<input data-q value="${st.q}" placeholder="${ph}" style="flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:15px;color:var(--text)"></label>`;
  function catsHTML() {
    return `<div style="display:flex;flex-direction:column;gap:6px;${phone ? '' : 'width:320px;'}">${search('Zoek categorie')}<div data-catlist style="display:flex;flex-direction:column;gap:2px;max-height:${phone ? 460 : 380}px;overflow-y:auto;margin:0 -4px;padding:0 4px">${catListHTML()}</div></div>`;
  }
  function changeListHTML() {
    const t = TX.find(x => x.id === st.popId), q = st.q.trim().toLowerCase();
    return CATS.filter(c => !q || c.name.toLowerCase().includes(q)).map(c => { const on = t.cat === c.id; return `<button data-act="pick" data-id="${c.id}" data-hov style="display:flex;align-items:center;gap:10px;min-height:48px;width:100%;padding:0 10px 0 8px;border-radius:12px;border:0;background:${on ? 'var(--surface-sunken)' : 'transparent'};font:inherit;color:var(--text);text-align:left;cursor:pointer">${chip(c, 28)}<span style="flex:1;font-size:14px;font-weight:${on ? 600 : 500}">${c.name}</span>${on ? `<span style="color:var(--accent)">${ico('check', 18, 2.6)}</span>` : ''}</button>`; }).join('');
  }
  function changeHTML() {
    const t = TX.find(x => x.id === st.popId);
    const used = [...new Set(TX.filter(x => x.who === t.who && x.cat && x.cat !== t.cat).map(x => x.cat))];
    const sug = (used.length ? used : ['other', 'onv']).concat(['other', 'onv']).filter((v, i, a) => a.indexOf(v) === i && v !== t.cat).slice(0, 2).map(id => CAT[id]);
    const count = TX.filter(x => x.who === t.who).length;
    return `<div style="display:flex;flex-direction:column;gap:8px;${phone ? '' : 'width:340px;'}">${phone ? '' : `<div style="display:flex;align-items:center;gap:10px;padding:2px 4px 4px">${chip(t.cat ? CAT[t.cat] : null, 32)}<span style="flex:1;min-width:0;display:flex;flex-direction:column"><b style="font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.who}</b><span style="font-size:12px;color:var(--text-muted)">${signed(t.amt)} · ${X.dm(t.d)}</span></span></div>`}${search('Zoek categorie')}${st.q ? '' : `<span style="padding:6px 6px 0;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-subtle)">Waarschijnlijk</span><div style="display:flex;flex-direction:column;gap:6px">${sug.map(c => `<button data-act="pick" data-id="${c.id}" style="display:flex;align-items:center;gap:12px;min-height:52px;padding:0 14px 0 8px;border-radius:14px;border:0;background:${tone(c).bg};font:inherit;text-align:left;cursor:pointer"><span style="width:36px;height:36px;border-radius:999px;display:grid;place-items:center;background:var(--surface-raised);color:${tone(c).fg}">${ico(c.icon, 18, 2.2)}</span><span style="flex:1;font-size:15px;font-weight:600;color:var(--text)">${c.name}</span></button>`).join('')}</div><span style="padding:8px 6px 0;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-subtle)">Alle categorieën</span>`}<div data-changelist style="display:flex;flex-direction:column;gap:2px;max-height:${phone ? 300 : 232}px;overflow-y:auto;margin:0 -4px;padding:0 4px">${changeListHTML()}</div><button data-act="rule" role="switch" aria-checked="${st.rule}" style="display:flex;align-items:center;gap:12px;min-height:56px;margin-top:4px;padding:6px 12px;border-radius:14px;border:0;background:var(--surface-sunken);font:inherit;text-align:left;cursor:pointer"><span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:14px;font-weight:600;color:var(--text)">${t.who} voortaan zo indelen</span><span style="font-size:12px;color:var(--text-muted)">${count > 1 ? `Ook de ${count - 1} andere keren` : 'Ook toekomstige transacties'}</span></span>${switchEl(st.rule)}</button></div>`;
  }

  const sheet = (title, body) => `<div data-act="close-pop" class="tx-scrim" style="position:absolute;inset:0;background:rgb(14 16 10 / .42);pointer-events:auto"></div><div class="tx-sheet" style="position:absolute;left:0;right:0;bottom:0;max-height:88%;display:flex;flex-direction:column;border-radius:28px 28px 0 0;background:var(--surface-raised);box-shadow:var(--shadow-raised);pointer-events:auto;box-sizing:border-box;padding:8px 16px 28px;overflow-y:auto"><span style="align-self:center;width:36px;height:5px;border-radius:999px;background:var(--border);margin-bottom:6px;flex:0 0 auto"></span><div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;margin-bottom:6px"><b style="font-size:17px;font-weight:600;padding-left:4px">${title}</b><button data-act="close-pop" aria-label="Sluiten" style="width:44px;height:44px;border-radius:999px;border:0;background:var(--surface-sunken);display:grid;place-items:center;color:var(--text-muted);cursor:pointer">${ico('x', 18, 2.2)}</button></div>${body}</div>`;
  const popover = body => `<div data-act="close-pop" style="position:absolute;inset:0;pointer-events:auto"></div><div data-pop style="position:absolute;left:${st.pos.l}px;top:${st.pos.b + 6}px;padding:10px;border-radius:20px;background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-raised);pointer-events:auto;box-sizing:border-box" class="tx-in">${body}</div>`;

  function detailHTML() {
    if (!st.detail || V() === 'A') return '';
    const t = TX.find(x => x.id === st.detail), v = V(), body = window.TX2D.content(v, t, { phone, view:st.view });
    const closeBtn = `<button data-act="close-detail" aria-label="Sluiten" style="position:absolute;top:12px;right:12px;z-index:2;width:40px;height:40px;border-radius:999px;border:0;background:var(--surface-sunken);display:grid;place-items:center;color:var(--text-muted);cursor:pointer">${ico('x', 18, 2.2)}</button>`;
    const scrim = `<div data-act="close-detail" class="tx-scrim" style="position:absolute;inset:0;background:rgb(14 16 10 / .42);pointer-events:auto"></div>`;
    if (phone) {
      if (v === 'C') return `<div class="tx-panel" style="position:absolute;inset:0;overflow-y:auto;background:var(--canvas-wash),var(--surface);pointer-events:auto">${body}</div>`;
      return `${scrim}<div class="tx-sheet" style="position:absolute;left:0;right:0;bottom:0;${v === 'B' ? 'top:56px;' : 'max-height:86%;'}border-radius:28px 28px 0 0;background:var(--surface-raised);box-shadow:var(--shadow-raised);pointer-events:auto;overflow-y:auto;box-sizing:border-box"><span style="display:block;margin:8px auto 0;width:36px;height:5px;border-radius:999px;background:var(--border)"></span>${closeBtn}${body}</div>`;
    }
    if (v === 'B') return `<aside class="tx-panel" style="position:absolute;top:12px;right:12px;bottom:12px;width:420px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-raised);pointer-events:auto;overflow-y:auto;box-sizing:border-box">${closeBtn}${body}</aside>`;
    if (v === 'C') return `${scrim}<div class="tx-sheet" style="position:absolute;left:calc(240px + (100% - 240px - 600px) / 2);top:48px;bottom:48px;width:600px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-raised);pointer-events:auto;overflow-y:auto;box-sizing:border-box">${closeBtn}${body}</div>`;
    if (!st.dpos) { const r = root.querySelector(`[data-row="${st.detail}"]`); if (!r) return ''; st.dpos = rectOf(r); }
    return `<div data-act="close-detail" style="position:absolute;inset:0;pointer-events:auto"></div><div data-dpop style="position:absolute;left:${st.dpos.r - 380}px;top:${st.dpos.b + 4}px;width:380px;border-radius:22px;background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-raised);pointer-events:auto;box-sizing:border-box" class="tx-in">${body}</div>`;
  }
  function popHTML() {
    if (!st.pop) return '';
    const t = st.popId && TX.find(x => x.id === st.popId);
    const [title, body] = st.pop === 'period' ? ['Periode', periodHTML()] : st.pop === 'cats' ? ['Categorieën', catsHTML()] : [`Categorie voor ${t.who}`, changeHTML()];
    return phone ? sheet(title, body) : popover(body);
  }
  function toastHTML() {
    if (!st.toast) return '';
    return `<div role="status" class="tx-in" style="position:absolute;left:${phone ? '50%' : 'calc(240px + (100% - 240px) / 2)'};bottom:${phone ? 100 : 24}px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;min-height:44px;padding:0 6px 0 16px;border-radius:999px;background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-raised);white-space:nowrap;pointer-events:auto;font-size:14px">${ico('check', 16, 2.6)}<span>${st.toast.text}</span><button data-act="undo" style="min-height:36px;padding:0 12px;border-radius:999px;border:0;background:var(--accent-soft);color:var(--accent-hover);font:inherit;font-size:13px;font-weight:600;cursor:pointer">Ongedaan maken</button></div>`;
  }
  function place(el, w) {
    if (!el) return;
    const H = root.offsetHeight, W = root.offsetWidth, h = el.offsetHeight, ww = el.offsetWidth;
    let left = parseFloat(el.style.left), top = parseFloat(el.style.top);
    left = Math.max(phone ? 12 : 252, Math.min(left, W - ww - 16));
    if (top + h > H - 12) top = Math.max(12, (el.hasAttribute('data-dpop') ? st.dpos.t : st.pos.t) - 6 - h);
    el.style.left = left + 'px'; el.style.top = top + 'px';
  }
  function renderOverlay() {
    const keep = overlay.querySelector('[data-catlist],[data-changelist]')?.scrollTop;
    overlay.innerHTML = detailHTML() + popHTML() + toastHTML();
    place(overlay.querySelector('[data-pop]')); place(overlay.querySelector('[data-dpop]'));
    const l = overlay.querySelector('[data-catlist],[data-changelist]'); if (l && keep) l.scrollTop = keep;
  }
  const refresh = () => { renderSticky(); renderList(); renderOverlay(); };
  const rectOf = el => { const f = root.getBoundingClientRect(), k = f.width / root.offsetWidth || 1, r = el.getBoundingClientRect(); return { l:(r.left - f.left) / k, t:(r.top - f.top) / k, b:(r.bottom - f.top) / k, r:(r.right - f.left) / k }; };
  const openPop = (kind, el, id) => { if (st.pop === kind && st.popId === (id || null)) { st.pop = null; renderOverlay(); return; } st.pop = kind; st.popId = id || null; st.q = ''; st.rule = false; st.pos = rectOf(el); st.ym = [at(st.from).getUTCFullYear(), at(st.from).getUTCMonth()]; renderOverlay(); setTimeout(() => !phone && overlay.querySelector('[data-q]')?.focus(), 30); };
  let toastTimer;
  const toast = (text, undo) => { st.toast = { text, undo }; renderOverlay(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { st.toast = null; renderOverlay(); }, 5000); };

  root.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a || !root.contains(a)) return;
    const act = a.dataset.act, id = a.dataset.id;
    if (act === 'acc') { if (st.view.has(id)) { if (st.view.size > 1) st.view.delete(id); } else st.view.add(id); renderSticky(); renderList(); }
    else if (act === 'pop-period') openPop('period', a);
    else if (act === 'pop-cats') openPop('cats', a);
    else if (act === 'peek') { st.peek = true; st.peekY = scroller.scrollTop; st.collapsed = false; renderSticky(); }
    else if (act === 'reset') { Object.assign(st, { from:'2026-10-01', to:'2026-10-31', preset:'deze' }); st.cats.clear(); refresh(); }
    else if (act === 'rmcat') { st.cats.delete(id); renderSticky(); renderList(); }
    else if (act === 'preset') { const p = PRESETS.find(x => x.id === id); Object.assign(st, { from:p.from, to:p.to, preset:p.id, anchor:null, pop:null }); refresh(); }
    else if (act === 'calnav') { let [y, m] = st.ym; m += +a.dataset.dir; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } st.ym = [y, m]; renderOverlay(); }
    else if (act === 'day') {
      const d = a.dataset.d;
      if (!st.anchor) { Object.assign(st, { anchor:d, from:d, to:d, preset:null }); refresh(); }
      else { const [f, t] = [st.anchor, d].sort(); Object.assign(st, { anchor:null, from:f, to:t, preset:PRESETS.find(p => p.from === f && p.to === t)?.id || null }); refresh(); setTimeout(() => { st.pop = null; renderOverlay(); }, 280); }
    }
    else if (act === 'fcat') { if (!id) st.cats.clear(); else st.cats.has(id) ? st.cats.delete(id) : st.cats.add(id); renderSticky(); renderList(); const l = overlay.querySelector('[data-catlist]'); if (l) l.innerHTML = catListHTML(); }
    else if (act === 'cat') { e.stopPropagation(); openPop('change', a, id); }
    else if (act === 'rule') { st.rule = !st.rule; renderOverlay(); }
    else if (act === 'pick') {
      const t = TX.find(x => x.id === st.popId), targets = st.rule ? TX.filter(x => x.who === t.who && !x.transfer) : [t];
      const before = targets.map(x => [x, x.cat, x.confirmed]);
      targets.forEach(x => { x.cat = id; x.confirmed = true; });
      st.pop = null; X.refreshAll();
      toast(st.rule ? `${t.who} is voortaan ${CAT[id].name}` : `Ingedeeld als ${CAT[id].name}`, () => { before.forEach(([x, c, k]) => { x.cat = c; x.confirmed = k; }); X.refreshAll(); });
    }
    else if (act === 'undo') { st.toast?.undo?.(); st.toast = null; renderOverlay(); }
    else if (act === 'close-pop') { st.pop = null; st.anchor = null; renderOverlay(); }
    else if (act === 'close-detail') { st.detail = null; renderList(); renderOverlay(); }
    else if (act === 'detail') {
      const rid = a.dataset.row, toggle = st.detail === rid && V() !== 'B';
      st.detail = toggle ? null : rid;
      if (V() === 'D' && !phone) st.dpos = rectOf(a);
      renderList(); renderOverlay();
    }
  });
  root.addEventListener('input', e => {
    if (!e.target.matches('[data-q]')) return;
    st.q = e.target.value;
    const l = overlay.querySelector('[data-catlist]'), c = overlay.querySelector('[data-changelist]');
    if (l) l.innerHTML = catListHTML();
    if (c) c.innerHTML = changeListHTML();
  });
  scroller.addEventListener('scroll', () => {
    const y = scroller.scrollTop;
    if (!phone && st.pop) { st.pop = null; renderOverlay(); }
    if (!phone && st.detail && V() === 'D') { st.detail = null; renderList(); renderOverlay(); }
    if (y < 8) { st.peek = false; if (st.collapsed) { st.collapsed = false; renderSticky(); } return; }
    if (st.peek) { if (Math.abs(y - st.peekY) > 80) { st.peek = false; st.collapsed = true; renderSticky(); } return; }
    if (y > 60 && !st.collapsed) { st.collapsed = true; renderSticky(); }
  }, { passive:true });

  refresh();
  if (opt.scrollTop) requestAnimationFrame(() => { scroller.scrollTop = opt.scrollTop; });
  if (opt.scrollToDetail && st.detail) requestAnimationFrame(() => { const r = root.querySelector(`[data-row="${st.detail}"]`); if (r) scroller.scrollTop = r.offsetTop - (phone ? 300 : 260); });
  if (opt.openPop) requestAnimationFrame(() => { const el = opt.openPop === 'change' ? root.querySelector(`[data-row="${opt.popId}"] [data-act="cat"]`) : root.querySelector(`[data-act="pop-${opt.openPop}"]`); if (el) openPop(opt.openPop, el, opt.popId); });
  if (opt.dposRow && V() === 'D') requestAnimationFrame(() => { const r = root.querySelector(`[data-row="${st.detail}"]`); if (r) { st.dpos = rectOf(r); renderOverlay(); } });
  const app = { refresh, st, root };
  SET.apps.push(app);
  return app;
}
X.App = App;
})();
