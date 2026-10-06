/* Ophalen: drie voorstellen voor zelf verversen in de kop van Transacties.
   A Bij het saldo · B Lijn in de kaart · C Eerste kaartje. Laadt na tx2-data.js. */
(() => {
const X = window.TX2, { ico, ACCOUNTS, CAT, tone, TX, eur, signed } = X;
if (!document.getElementById('oph-css')) {
  const s = document.createElement('style'); s.id = 'oph-css';
  s.textContent = `@keyframes ophSpin{to{transform:rotate(360deg)}}@keyframes ophPulse{50%{opacity:.35}}@keyframes ophIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}@keyframes ophFlash{0%,35%{background:var(--accent-soft)}100%{background:transparent}}@keyframes ophSheen{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
.oph-spin{animation:ophSpin 1s linear infinite;transform-origin:50% 50%}.oph-pulse{animation:ophPulse 1.4s ease-in-out infinite}.oph-in{animation:ophIn .2s ease}.oph-flash{animation:ophFlash 2.4s ease-out both}.oph-sheen{animation:ophSheen 1.2s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.oph-flash{animation:none}.oph-spin{animation:ophPulse 1.6s ease-in-out infinite}.oph-sheen{animation:none;opacity:.6}.oph-in{animation:none}}
.oph-hs{scrollbar-width:none}.oph-hs::-webkit-scrollbar{display:none}
@media (hover:hover) and (pointer:fine){[data-oph] [data-hov]:hover{background:var(--surface-sunken)!important}}`;
  document.head.appendChild(s);
}
const P = { refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>', alert:'<path d="M12 8v4"/><path d="M12 16h.01"/><circle cx="12" cy="12" r="10"/>', clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>' };
const ic = (n, s = 18, w = 2, cls = '') => P[n] ? `<svg ${cls ? `class="${cls}"` : ''} xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;display:block">${P[n]}</svg>` : ico(n, s, w);
const glass = 'position:relative;border-radius:var(--radius-lg);background:var(--glass-tint-strong);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);box-shadow:var(--glass-rim),var(--shadow-card)';
const logo = (bank, s, off) => `<img src="banks/${bank}.png" alt="" width="${s}" height="${s}" style="display:block;width:${s}px;height:${s}px;border-radius:${Math.round(s * .3)}px;border:1px solid var(--border);box-sizing:border-box;background:var(--surface-raised);object-fit:cover;${off ? 'filter:grayscale(1);opacity:.45;' : ''}">`;
const chipC = (c, s = 36) => `<span style="width:${s}px;height:${s}px;border-radius:999px;display:grid;place-items:center;flex:0 0 auto;background:${tone(c).bg};color:${tone(c).fg}">${ico(c.icon, Math.round(s * .5))}</span>`;

const LINKED = ACCOUNTS.filter(a => a.connected);
const NEW = { 'asn-y':3, abn:2, bunq:0, paypal:0 };
const NOW = '16:12';
const PRESET = {
  rust:    { last:'16:00', s:{} },
  oud:     { last:'gisteren 21:00', s:{} },
  bezig:   { last:'16:00', busy:true, s:{ 'asn-y':['ok', 3], abn:['busy'], bunq:['wait'], paypal:['wait'] } },
  klaar:   { last:NOW, cool:true, s:{ 'asn-y':['ok', 3], abn:['ok', 2], bunq:['ok', 0], paypal:['ok', 0] } },
  deels:   { last:NOW, cool:true, s:{ 'asn-y':['ok', 3], abn:['ok', 2], bunq:['fail'], paypal:['ok', 0] } },
  teveel:  { last:NOW, cool:true, s:{ 'asn-y':['ok', 3], abn:['limit'], bunq:['ok', 0], paypal:['ok', 0] } },
  verlopen:{ last:'16:00', s:{ paypal:['expired'] } }
};

function Mock(root, opt) {
  const phone = opt.mode === 'phone', V = opt.variant, pull = phone && V === 'A';
  const view = new Set(phone ? ['asn-y', 'abn'] : ['asn-y', 'abn']);
  let st, timers = [];
  root.dataset.oph = ''; root.style.position = 'relative'; root.style.overflow = 'hidden';
  function set(name) {
    timers.forEach(clearTimeout); timers = [];
    const p = PRESET[name];
    st = { name, last:p.last, busy:!!p.busy, cool:!!p.cool, acc:{} };
    LINKED.forEach(a => { const v = p.s[a.id]; st.acc[a.id] = v ? { s:v[0], n:v[1] || 0 } : { s:'idle', n:0 }; });
    render();
  }
  const accs = () => LINKED.map(a => ({ ...a, ...st.acc[a.id] }));
  const sum = () => {
    const l = accs(), act = l.filter(a => a.s !== 'idle' && a.s !== 'expired'), done = act.filter(a => !['wait', 'busy'].includes(a.s));
    return { l, act, done, n:done.reduce((s, a) => s + (a.s === 'ok' ? a.n : 0), 0), fail:l.filter(a => a.s === 'fail'), limit:l.filter(a => a.s === 'limit'), exp:l.filter(a => a.s === 'expired') };
  };
  function run(retry) {
    if (st.busy || (st.cool && !retry)) return;
    const ids = LINKED.filter(a => st.acc[a.id].s !== 'expired' && (!retry || ['fail'].includes(st.acc[a.id].s))).map(a => a.id);
    st.busy = true; ids.forEach(id => st.acc[id] = { s:'wait', n:0 }); render();
    ids.forEach((id, i) => {
      timers.push(setTimeout(() => { st.acc[id] = { s:'busy', n:0 }; render(); }, 250 + i * 650));
      timers.push(setTimeout(() => { st.acc[id] = { s:'ok', n:retry ? 1 : NEW[id] }; if (ids.every(x => st.acc[x].s === 'ok')) { st.busy = false; st.cool = true; st.last = NOW; } render(); }, 1100 + i * 650));
    });
  }

  /* Gedeelde stukjes */
  const statusText = () => {
    const S = sum();
    if (st.busy) return { t:`Ophalen, ${S.done.length} van ${S.act.length}`, tone:'busy' };
    if (S.exp.length && !st.cool) return { t:`Opgehaald ${st.last} · ${S.exp[0].name.split(' ')[0]} overgeslagen`, tone:'rest' };
    if (S.fail.length) return { t:`${S.fail[0].name.split(' ')[0]} lukte niet`, tone:'warn', act:'Opnieuw', a:'retry' };
    if (S.limit.length) return { t:`${S.limit[0].name.split(' ')[0]} vraagt even geduld, weer om 16:20`, tone:'warn' };
    if (st.cool) return { t:S.n ? `${S.n} nieuw · ${st.last}` : `Alles was al bij · ${st.last}`, tone:'ok' };
    return { t:`Opgehaald ${st.last}`, tone:'rest' };
  };
  const spinIcon = (s, w = 2.2) => ic('refresh', s, w, st.busy ? 'oph-spin' : '');
  const btnState = () => st.busy ? { dis:true, label:'Bezig met ophalen' } : st.cool ? { dis:true, label:`Net opgehaald, kan weer om 16:17` } : { dis:false, label:'Rekeningen ophalen' };
  const badge = a => {
    const B = (bg, fg, inner) => `<span class="oph-in" style="position:absolute;right:-5px;bottom:-5px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:999px;display:grid;place-items:center;background:${bg};color:${fg};border:2px solid var(--surface-raised);font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1">${inner}</span>`;
    if (a.s === 'ok' && a.n) return B('var(--accent)', 'var(--accent-fg)', `+${a.n}`);
    if (a.s === 'ok') return B('var(--surface-sunken)', 'var(--text-muted)', ic('check', 10, 3.4));
    if (['fail', 'limit', 'expired'].includes(a.s)) return B('var(--botergoud)', '#fff', '!');
    return '';
  };
  const ring = a => ['wait', 'busy'].includes(a.s) ? `<svg class="${a.s === 'busy' ? 'oph-spin' : ''}" width="42" height="42" viewBox="0 0 42 42" style="position:absolute;left:-5px;top:-5px;pointer-events:none" aria-hidden="true"><circle cx="21" cy="21" r="19" fill="none" stroke="var(--border)" stroke-width="2"/>${a.s === 'busy' ? '<circle cx="21" cy="21" r="19" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="28 92"/>' : ''}</svg>` : '';
  const sub = a => {
    if (V === 'C' && a.s !== 'idle') return { wait:'wacht', busy:'ophalen…', ok:a.n ? `${a.n} nieuw` : 'niets nieuw', fail:'lukte niet', limit:'weer om 16:20', expired:'toestemming verlopen' }[a.s];
    if (a.s === 'expired') return 'toestemming verlopen';
    return a.bal != null ? eur(a.bal) : '';
  };
  const subColor = a => V === 'C' && a.s === 'ok' && a.n ? 'var(--accent-hover)' : ['fail', 'limit', 'expired'].includes(a.s) ? 'var(--botergoud)' : 'var(--text-muted)';
  function chipsHTML() {
    const all = ACCOUNTS.filter(a => a.id !== 'asn-s' || true);
    const first = V === 'C' ? (() => { const b = btnState(), stt = statusText(); return `<button data-act="run" ${b.dis ? 'aria-disabled="true"' : ''} aria-label="${b.label}" title="${b.label}" style="flex:0 0 auto;display:flex;align-items:center;gap:8px;height:48px;padding:0 14px 0 8px;border-radius:14px;border:1px solid ${st.busy ? 'transparent' : 'var(--border)'};background:${st.busy ? 'var(--accent-soft)' : 'var(--surface-raised)'};box-shadow:${st.busy ? 'none' : 'var(--shadow-card)'};font:inherit;color:${st.busy ? 'var(--accent-hover)' : 'var(--text)'};cursor:${b.dis ? 'default' : 'pointer'};text-align:left"><span style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:${st.busy ? 'transparent' : 'var(--surface-sunken)'};color:${st.busy ? 'var(--accent)' : 'var(--text-muted)'}">${spinIcon(18)}</span><span style="display:flex;flex-direction:column"><span style="font-size:13px;line-height:1.25;font-weight:600;white-space:nowrap">${st.busy ? 'Ophalen' : st.cool ? 'Opgehaald' : 'Ophalen'}</span><span style="font-size:12px;line-height:1.25;color:${st.busy ? 'var(--accent-hover)' : 'var(--text-muted)'};font-variant-numeric:tabular-nums;white-space:nowrap">${st.busy ? `${sum().done.length} van ${sum().act.length}` : st.last}</span></span></button>`; })() : '';
    return `<div class="oph-hs" style="display:flex;gap:8px;overflow-x:auto;margin:0 -12px;padding:6px 12px 6px">${first}${all.map(a0 => { const a = { ...a0, ...(st.acc[a0.id] || { s:'idle', n:0 }) }, on = view.has(a.id), noLink = !a.connected; return `<span style="flex:0 0 auto;display:flex;align-items:center;gap:8px;height:48px;padding:0 14px 0 6px;border-radius:14px;border:1px solid ${on ? 'var(--border)' : 'transparent'};background:${on ? 'var(--surface-raised)' : 'transparent'};box-shadow:${on ? 'var(--shadow-card)' : 'none'};color:${on ? 'var(--text)' : 'var(--text-muted)'};box-sizing:border-box"><span style="position:relative;width:32px;height:32px;flex:0 0 auto">${logo(a.bank, 32, !on || ['wait'].includes(a.s))}${V !== 'B' ? ring(a) : ''}${V === 'A' ? badge(a) : V === 'C' && ['fail', 'limit', 'expired'].includes(a.s) ? badge(a) : V === 'B' && ['fail', 'limit', 'expired'].includes(a.s) ? badge(a) : ''}</span><span style="display:flex;flex-direction:column"><span style="font-size:13px;line-height:1.25;font-weight:${on ? 600 : 500};white-space:nowrap">${a.name}</span><span class="${V === 'C' ? 'oph-in' : ''}" style="font-size:12px;line-height:1.25;color:${subColor(a)};font-weight:${V === 'C' && a.s === 'ok' && a.n ? 600 : 400};font-variant-numeric:tabular-nums;white-space:nowrap">${noLink ? 'zonder koppeling' : sub(a)}</span></span></span>`; }).join('')}</div>`;
  }
  function headLine() {
    const stt = statusText(), b = btnState();
    const sal = `<b style="font-size:${phone ? 18 : 20}px;font-weight:600;letter-spacing:-.01em;color:var(--text);font-variant-numeric:tabular-nums;white-space:nowrap">${eur(345048)}</b><span style="white-space:nowrap">2 rekeningen</span>`;
    const actBtn = stt.act ? `<button data-act="${stt.a}" style="min-height:32px;padding:0 10px;margin:-6px 0;border-radius:999px;border:0;background:var(--botergoud-soft);color:var(--botergoud);font:inherit;font-size:12px;font-weight:600;cursor:pointer">${stt.act}</button>` : '';
    const col = stt.tone === 'warn' ? 'var(--botergoud)' : stt.tone === 'busy' || (stt.tone === 'ok' && sum().n) ? 'var(--accent-hover)' : 'var(--text-muted)';
    if (V === 'A') {
      const status = pull && !stt.act ? `<button data-act="run" ${b.dis ? 'aria-disabled="true"' : ''} aria-label="${b.label}" class="oph-in" style="display:inline-flex;align-items:center;min-height:24px;margin:-4px 0;padding:0;border:0;background:none;font:inherit;color:${col};font-weight:${stt.tone === 'rest' ? 400 : 600};white-space:nowrap;cursor:${b.dis ? 'default' : 'pointer'}">${stt.t}</button>` : `<span class="oph-in" style="display:inline-flex;align-items:center;gap:6px;color:${col};font-weight:${stt.tone === 'rest' ? 400 : 600};white-space:nowrap">${stt.t}${actBtn}</span>`;
      if (pull) return `<p style="margin:0;padding:0 4px;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:10px;row-gap:1px;font-size:12px;color:var(--text-muted)">${sal}${status}</p>`;
      return `<div style="display:flex;align-items:center;gap:8px;padding-left:4px"><p style="flex:1;min-width:0;margin:0;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:10px;row-gap:1px;font-size:12px;color:var(--text-muted)">${sal}${status}</p><button data-act="run" ${b.dis ? 'aria-disabled="true"' : ''} aria-label="${b.label}" title="${b.label}" style="flex:0 0 auto;width:44px;height:44px;margin:-4px -2px -4px 0;border-radius:999px;border:1px solid ${st.busy ? 'transparent' : 'var(--glass-border)'};display:grid;place-items:center;background:${st.busy ? 'var(--accent-soft)' : st.cool ? 'transparent' : 'var(--surface-raised)'};color:${st.busy ? 'var(--accent)' : st.cool ? 'var(--text-subtle)' : 'var(--text)'};cursor:${b.dis ? 'default' : 'pointer'};box-shadow:${st.busy || st.cool ? 'none' : 'var(--shadow-card)'}">${st.cool && !st.busy && !stt.act ? ic('check', 18, 2.4) : spinIcon(18)}</button></div>`;
    }
    if (V === 'B') {
      const pillBg = st.busy ? 'var(--accent-soft)' : stt.tone === 'warn' ? 'var(--botergoud-soft)' : stt.tone === 'ok' && sum().n ? 'var(--accent-soft)' : 'transparent';
      return `<div style="display:flex;align-items:center;gap:8px;padding-left:4px"><p style="flex:1;min-width:0;margin:0;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:10px;row-gap:1px;font-size:12px;color:var(--text-muted)">${sal}${phone ? '' : `<span><b style="font-weight:600;color:var(--text);font-variant-numeric:tabular-nums">${eur(309229)}</b> na vaste lasten die nog komen</span>`}</p><button data-act="${stt.a || 'run'}" ${b.dis && !stt.a ? 'aria-disabled="true"' : ''} aria-label="${stt.a ? stt.act : b.label}" title="${stt.a ? stt.act : b.label}" style="flex:0 0 auto;display:flex;align-items:center;gap:6px;min-height:44px;margin:-6px -4px -6px 0;padding:0 12px;border-radius:999px;border:0;background:${pillBg};color:${col};font:inherit;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;cursor:${b.dis && !stt.a ? 'default' : 'pointer'}">${stt.tone === 'warn' ? ic('alert', 14, 2.2) : spinIcon(14, 2.4)}<span class="oph-in">${stt.a ? `${stt.t} · ${stt.act}` : stt.t}</span></button></div>`;
    }
    return `<p style="margin:0;padding:0 4px;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:10px;row-gap:1px;font-size:12px;color:var(--text-muted)">${sal}<span><b style="font-weight:600;color:var(--text);font-variant-numeric:tabular-nums">${eur(309229)}</b> na vaste lasten die nog komen</span>${stt.tone === 'warn' ? `<span class="oph-in" style="display:inline-flex;align-items:center;gap:6px;color:var(--botergoud);font-weight:600;white-space:nowrap">${stt.t}${actBtn}</span>` : ''}</p>`;
  }
  function barHTML() {
    if (V !== 'B') return '';
    const S = sum(); if (!st.busy && !st.cool && !S.fail.length && !S.limit.length) return '';
    return `<span aria-hidden="true" style="position:absolute;left:14px;right:14px;top:-1px;height:3px;display:flex;gap:3px">${S.act.map(a => { const c = a.s === 'ok' ? 'var(--accent)' : ['fail', 'limit'].includes(a.s) ? 'var(--botergoud)' : 'var(--border)'; return `<span style="flex:1;position:relative;overflow:hidden;border-radius:0 0 3px 3px;background:${c};transition:background .3s">${a.s === 'busy' ? '<span class="oph-sheen" style="position:absolute;top:0;bottom:0;width:40%;background:var(--accent);border-radius:3px"></span>' : ''}</span>`; }).join('')}</span>`;
  }
  function listHTML() {
    const S = sum(), nNew = (st.acc['asn-y'] && st.acc['asn-y'].s === 'ok' ? st.acc['asn-y'].n : 0) + (st.acc.abn && st.acc.abn.s === 'ok' ? st.acc.abn.n : 0);
    const rows = TX.filter(t => ['asn-y', 'abn'].includes(t.acc)).slice(0, phone ? 6 : 7);
    const day = d => rows.filter(t => t.d === d);
    const days = [...new Set(rows.map(t => t.d))];
    const newIds = new Set(rows.slice(0, nNew).map(t => t.id));
    return days.map(d => { const dn = day(d).filter(t => newIds.has(t.id)).length; return `<section style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;padding:4px 4px 0;font-size:13px;font-weight:600;color:var(--text-muted)"><span>${X.dayTitle(d)}</span>${dn ? `<span class="oph-in" style="color:var(--accent-hover)">${dn} nieuw</span>` : ''}</div><div style="display:flex;flex-direction:column;gap:2px;padding:4px 16px;border-radius:var(--radius-lg);background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-card)">${day(d).map(t => { const isNew = newIds.has(t.id), c = t.cat ? CAT[t.cat] : null; return `<div class="${isNew ? 'oph-flash' : ''}" style="display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:60px;margin:0 -8px;padding:0 8px;border-radius:14px">${c ? chipC(c) : '<span></span>'}<span style="min-width:0;display:flex;flex-direction:column;gap:1px"><span style="display:flex;align-items:center;gap:6px;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.who}</span><span style="font-size:13px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isNew ? '<span style="display:inline-block;width:7px;height:7px;border-radius:999px;background:var(--botergoud);margin-right:6px;vertical-align:1px"></span>' : ''}${c ? c.name : ''}</span></span><span style="font-size:15px;font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap;color:${t.amt > 0 ? 'var(--success)' : 'var(--text)'}">${signed(t.amt)}</span></div>`; }).join('')}</div></section>`; }).join('');
  }
  function bankMelding() {
    const S = sum(); if (!S.exp.length) return '';
    return `<div class="oph-in" style="display:flex;align-items:center;gap:10px;min-height:48px;padding:0 6px 0 14px;border-radius:999px;background:var(--botergoud-soft);font-size:14px"><span style="color:var(--botergoud)">${ic('alert', 16, 2.2)}</span><span style="flex:1;min-width:0">Toestemming PayPal verlopen</span><button data-act="renew" style="min-height:36px;padding:0 14px;border-radius:999px;border:0;background:var(--surface-raised);color:var(--text);font:inherit;font-size:13px;font-weight:600;cursor:pointer">Vernieuwen</button></div>`;
  }
  function render() {
    const title = `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding-left:${phone ? 8 : 0}px;min-height:48px"><b style="font-size:30px;font-weight:600;letter-spacing:-.02em">Transacties</b>${phone ? `<span style="position:relative;width:48px;height:48px;display:grid;place-items:center"><span style="width:36px;height:36px;border-radius:999px;background:var(--member-yoran);color:#fff;display:grid;place-items:center;font-size:14px;font-weight:600">Y</span>${sum().exp.length ? '<span style="position:absolute;right:4px;top:4px;width:16px;height:16px;border-radius:999px;background:var(--botergoud);color:#fff;border:2px solid var(--surface);display:grid;place-items:center;font-size:10px;font-weight:700">!</span>' : ''}</span>` : ''}</div>`;
    const ind = pull ? `<div data-pull aria-hidden="true" style="position:absolute;left:50%;top:0;z-index:5;display:flex;align-items:center;gap:8px;height:36px;padding:0;border-radius:999px;transform:translate(-50%,-48px);opacity:0;pointer-events:none;transition:transform .25s cubic-bezier(.32,.72,0,1),opacity .2s;font-family:var(--font-sans)"><span data-pull-i style="width:36px;height:36px;border-radius:999px;display:grid;place-items:center;background:var(--surface-raised);border:1px solid var(--border);box-shadow:var(--shadow-card);color:var(--text-muted);transition:color .15s,background .15s;flex:0 0 auto"><span data-pull-r style="display:block">${ic('refresh', 16, 2.2)}</span></span><span data-pull-t style="display:none;font-size:13px;font-weight:600;color:var(--text-muted);white-space:nowrap"></span></div>` : '';
    root.innerHTML = `${ind}<div data-scroller style="position:absolute;inset:0;overflow-y:auto;padding:${phone ? '16px 16px 40px' : '28px 40px 40px'};box-sizing:border-box;font-family:var(--font-sans);color:var(--text)"><div data-pullc style="display:flex;flex-direction:column;gap:16px;transition:transform .25s cubic-bezier(.32,.72,0,1)">${title}${bankMelding()}<div style="${glass};position:sticky;top:${phone ? 8 : 20}px;z-index:4;display:flex;flex-direction:column;gap:4px;padding:12px 12px 6px">${barHTML()}${headLine()}${chipsHTML()}</div>${listHTML()}</div></div>`;
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'run') run(false);
    else if (a === 'retry') run(true);
    else if (a === 'renew') { st.acc.paypal = { s:'idle', n:0 }; st.last = '16:00'; render(); }
  });
  /* Omlaag trekken (telefoon, variant A). Tijdens ophalen of afkoelen doet trekken niets en zegt het waarom. */
  let pd = null;
  const TH = 56;
  const pullStart = (y, t) => { if (!pull) return; const sc = root.querySelector('[data-scroller]'); if (!sc || sc.scrollTop > 0 || (t && t.closest && t.closest('button'))) return; pd = { y, d:0, on:false }; };
  const pullMove = (y, e) => {
    if (!pd) return false;
    const k = root.getBoundingClientRect().height / root.offsetHeight || 1, dy = (y - pd.y) / k;
    if (dy <= 0 && !pd.on) return false;
    if (!pd.on && dy > 6) pd.on = true;
    if (!pd.on) return false;
    e && e.cancelable && e.preventDefault();
    const blocked = st.busy || st.cool, d = Math.max(0, Math.min(blocked ? 56 : 88, dy * .5)), ready = d >= TH;
    pd.d = d;
    const c = root.querySelector('[data-pullc]'), ind = root.querySelector('[data-pull]'), i = root.querySelector('[data-pull-i]'), r = root.querySelector('[data-pull-r]'), t = root.querySelector('[data-pull-t]');
    c.style.transition = 'none'; c.style.transform = `translateY(${d}px)`;
    ind.style.transition = 'none'; ind.style.transform = `translate(-50%,${Math.max(-48, (16 + d) / 2 - 18)}px)`; ind.style.opacity = Math.max(0, Math.min(1, (d - 12) / 28));
    r.style.transform = `rotate(${d * 4}deg)`;
    i.style.color = blocked ? 'var(--text-subtle)' : ready ? 'var(--accent)' : 'var(--text-muted)';
    i.style.background = ready && !blocked ? 'var(--accent-soft)' : 'var(--surface-raised)';
    t.style.display = blocked && d > 36 ? 'block' : 'none';
    t.textContent = st.busy ? 'Bezig met ophalen' : 'Net opgehaald, weer om 16:17';
    return true;
  };
  const pullEnd = () => {
    if (!pd) return;
    const go = pd.on && pd.d >= TH && !st.busy && !st.cool;
    const c = root.querySelector('[data-pullc]'), ind = root.querySelector('[data-pull]');
    if (c) { c.style.transition = ''; c.style.transform = ''; }
    if (ind) { ind.style.transition = ''; ind.style.transform = 'translate(-50%,-48px)'; ind.style.opacity = 0; }
    pd = null;
    if (go) setTimeout(() => run(false), 200);
  };
  root.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') pullStart(e.clientY, e.target); });
  window.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && pd) { if (pullMove(e.clientY, e)) document.getSelection().removeAllRanges(); } });
  window.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') pullEnd(); });
  root.addEventListener('touchstart', e => pullStart(e.touches[0].clientY, e.target), { passive:true });
  root.addEventListener('touchmove', e => pullMove(e.touches[0].clientY, e), { passive:false });
  root.addEventListener('touchend', pullEnd); root.addEventListener('touchcancel', pullEnd);
  set(opt.state || 'rust');
  return { set };
}
window.OPH = { Mock };
})();
