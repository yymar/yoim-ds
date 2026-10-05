/* Transacties v2: data, iconen en gedeelde stand voor de artboards van 5 okt.
   Alles hier is voorbeelddata in de vorm van de repo (mone.accounts, transactions,
   categorizations, rules, reimbursements). */
(() => {
const P = {
  calendar:'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  down:'<path d="m6 9 6 6 6-6"/>', up:'<path d="m18 15-6-6-6 6"/>', left:'<path d="m15 18-6-6 6-6"/>', right:'<path d="m9 18 6-6-6-6"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', check:'<path d="M20 6 9 17l-5-5"/>',
  eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  grip:'<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  filter:'<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  pencil:'<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  transfer:'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  receiptnav:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  grid:'<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  basket:'<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
  utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  house:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  dumbbell:'<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/>',
  umbrella:'<path d="M22 12a10.06 10.06 1 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>',
  plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  dots:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'
};
const ico = (n, s = 18, w = 2) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">${P[n]}</svg>`;

const ACCOUNTS = [
  { id:'asn-y', name:'ASN Yoran', bank:'asn', detail:'Privé · •••• 6974', bal:67032, connected:true, consent:'Toestemming tot 12 mrt 2027 · opgehaald 16:00' },
  { id:'asn-s', name:'ASN Spaargeld', bank:'asn', detail:'Privé · •••• 0316', bal:null, connected:false, iban:'NL19 ASNB 0708 4703 16' },
  { id:'abn', name:'ABN AMRO Yoran & Imke', bank:'abn', detail:'Gedeeld met Imke · •••• 0209', bal:278016, connected:true, shared:true, consent:'Toestemming tot 1 apr 2027 · opgehaald 16:00' },
  { id:'bunq', name:'bunq Yoran', bank:'bunq', detail:'Privé · •••• 5494', bal:1529, connected:true, consent:'Toestemming tot 3 jan 2027 · opgehaald 16:00' },
  { id:'paypal', name:'PayPal Yoran', bank:'paypal', detail:'Privé', bal:0, connected:true, consent:'Toestemming tot 20 feb 2027 · opgehaald 16:00' }
];
const CATS = [
  ['bood','Boodschappen','green','basket'], ['eten','Eten & Drinken','orange','utensils'], ['auto','Auto & Transport','blue','car'],
  ['huis','Huis & Beer','pink','house'], ['shop','Shopping & Persoonlijk','olijf','bag'], ['sport','Sport & Hobbies','blue','dumbbell'],
  ['gez','Gezondheid','red','heart'], ['music','Music','purple','music'], ['vast','Vaste Lasten Yoran','gray','receipt'],
  ['onv','Onvoorziene Kosten','brown','umbrella'], ['reis','Vakantie & Reizen','teal','plane'], ['splin','Splits In','success','undo'],
  ['sal','Salaris','success','wallet'], ['other','Other','gray','dots']
].map(([id, name, color, icon]) => ({ id, name, color, icon }));
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
const tone = c => c.color === 'success' ? { fg:'var(--success)', bg:'var(--accent-soft)' } : { fg:`var(--cat-${c.color})`, bg:`var(--cat-${c.color}-bg)` };
const BUDGETS = { bood:{ kind:'pot', amount:30000 }, eten:{ kind:'pot', amount:8000 }, auto:{ kind:'pot', amount:12000 }, huis:{ kind:'pot', amount:25000 }, shop:{ kind:'pot', amount:10000 }, sport:{ kind:'pot', amount:6000 }, music:{ kind:'fixed', amount:1199 } };

const T = (id, d, tm, acc, who, amt, cat, desc, extra = {}) => ({ id, d, tm, acc, who, amt, cat, desc, confirmed:true, ...extra });
const TX = [
  T('t1','2026-10-05','11:42','asn-y','Beddinghouse Nederland',-17995,'huis','BEA, Betaalpas BEDDINGHOUSE NEDERLAND,PAS412 NR:CT4G21, 05.10.26/11:42 DEN HAAG'),
  T('t2','2026-10-05','08:14','asn-y','Ovpay',-187,'auto','BEA, Google Pay OVpay NS/RET,PAS412 NR:9W3K1L, 05.10.26/08:14 ROTTERDAM',{ confirmed:false }),
  T('t3','2026-10-04','19:05','asn-y','B&S',-200,'auto','BEA, Betaalpas B&S PARKEREN,PAS412 NR:77F1A0, 04.10.26/19:05 DEN HAAG'),
  T('t4','2026-10-04','16:31','asn-y','Bouldermuur Den Haag',-2420,'sport','BEA, Betaalpas BOULDERMUUR DEN HAAG,PAS412 NR:B0M2K1, 04.10.26/16:31 DEN HAAG'),
  T('t5','2026-10-04','14:10','asn-y','Bijenkorf',-3000,'shop','BEA, Apple Pay DE BIJENKORF DEN HAAG,PAS412 NR:BJK093, 04.10.26/14:10 DEN HAAG'),
  T('t6','2026-10-04','13:02','asn-y','Ovpay',-185,'auto','BEA, Google Pay OVpay HTM,PAS412 NR:9W3K7Q, 04.10.26/13:02 DEN HAAG'),
  T('t7','2026-10-04','18:12','asn-y','Bouldermuur Den Haag',-495,'sport','BEA, Betaalpas BOULDERMUUR DEN HAAG,PAS412 NR:B0M2K4, 04.10.26/18:12 DEN HAAG'),
  T('t8','2026-10-04','22:40','bunq','Bar Bodega',-1450,'eten','Bar Bodega Den Haag NL, card 5494'),
  T('t9','2026-10-03','17:48','asn-y','Albert Heijn 1222',-3841,'bood','BEA, Betaalpas ALBERT HEIJN 1222,PAS412 NR:AH1222, 03.10.26/17:48 DEN HAAG'),
  T('t10','2026-10-03','20:15','asn-y','Thuisbezorgd.nl',-2755,'eten','iDEAL Thuisbezorgd.nl via Takeaway.com 0030021 bestelling 7XK2PL'),
  T('t11','2026-10-03','10:20','asn-y','Shell Den Haag',-3500,'auto','BEA, Betaalpas SHELL LAAN VAN NOI,PAS412 NR:SH0091, 03.10.26/10:20 DEN HAAG'),
  T('t12','2026-10-03','11:05','abn','Albert Heijn 1222',-6234,'bood','BEA, Betaalpas Albert Heijn 1222,PAS102 NR:AH1222, 03.10.26/11:05 DEN HAAG'),
  T('t13','2026-10-02','09:30','asn-y','Tikkie van Imke',1500,'splin','Tikkie ID 001290347781, voor Bijenkorf, Van I. de Vries',{ refundFor:'t5' }),
  T('t14','2026-10-02','03:12','asn-y','Spotify',-1199,'music','SEPA Incasso Spotify AB, P2F8D1 Spotify Premium Duo'),
  T('t15','2026-10-02','07:00','asn-y','ASN Spaargeld',-10000,null,'Overboeking naar NL19 ASNB 0708 4703 16, Sparen oktober',{ transfer:true }),
  T('t16','2026-10-01','18:22','asn-y','Albert Heijn 1222',-2410,'bood','BEA, Betaalpas ALBERT HEIJN 1222,PAS412 NR:AH1223, 01.10.26/18:22 DEN HAAG'),
  T('t17','2026-10-01','12:40','asn-y','Kruidvat',-849,'gez','BEA, Betaalpas KRUIDVAT 7104,PAS412 NR:KV7104, 01.10.26/12:40 DEN HAAG'),
  T('t18','2026-10-01','06:00','abn','Florius',-98650,'vast','SEPA Incasso Florius hypotheken, lening 40018832 oktober'),
  T('t19','2026-09-30','18:02','asn-y','Albert Heijn 1222',-1876,'bood','BEA, Betaalpas ALBERT HEIJN 1222,PAS412 NR:AH1218, 30.09.26/18:02 DEN HAAG'),
  T('t20','2026-09-30','19:30','asn-y','Bouldermuur Den Haag',-2420,'sport','BEA, Betaalpas BOULDERMUUR DEN HAAG,PAS412 NR:B0M1Z9, 30.09.26/19:30 DEN HAAG'),
  T('t21','2026-09-28','21:14','asn-y','Bol.com',-2999,'shop','iDEAL bol.com b.v. bestelling 2389910442'),
  T('t22','2026-09-28','08:40','asn-y','Ovpay',-374,'auto','BEA, Google Pay OVpay NS,PAS412 NR:9W3J0P, 28.09.26/08:40 DEN HAAG'),
  T('t23','2026-09-25','06:00','asn-y','Werkgever BV',268450,'sal','SEPA Overboeking Werkgever BV salaris september')
];

const store = {
  order: ACCOUNTS.map(a => a.id), hidden: new Set(), subs: [],
  emit() { this.subs.forEach(f => f()); },
  acc(id) { return ACCOUNTS.find(a => a.id === id); },
  accounts() { return this.order.map(id => this.acc(id)); },
  visible() { return this.accounts().filter(a => !this.hidden.has(a.id)); }
};

const nf = new Intl.NumberFormat('nl-NL', { minimumFractionDigits:2, maximumFractionDigits:2 });
const eur = c => '€\u00a0' + nf.format(Math.abs(c) / 100);
const signed = c => (c < 0 ? '−' : '+') + eur(c);
const MON = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
const MONL = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const DAYS = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
const at = d => new Date(d + 'T12:00:00Z');
const dm = d => { const x = at(d); return `${x.getUTCDate()} ${MON[x.getUTCMonth()]}`; };
const longDate = d => { const x = at(d); return `${DAYS[x.getUTCDay()]} ${x.getUTCDate()} ${MONL[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
const TODAY = '2026-10-05';
const dayTitle = d => { const x = at(d), n = DAYS[x.getUTCDay()]; return d === TODAY ? `Vandaag · ${n.slice(0, 2)} ${dm(d)}` : `${n[0].toUpperCase()}${n.slice(1)} ${dm(d)}`; };
const range = (f, t) => { if (f === t) return dm(f); const a = at(f), b = at(t); return a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear() ? `${a.getUTCDate()} t/m ${dm(t)}` : `${dm(f)} t/m ${dm(t)}`; };
const iso = (y, m, d) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
const PRESETS = [
  { id:'deze', name:'Deze periode', from:'2026-10-01', to:'2026-10-31' },
  { id:'vorige', name:'Vorige periode', from:'2026-09-01', to:'2026-09-30' },
  { id:'30', name:'Laatste 30 dagen', from:'2026-09-06', to:'2026-10-05' },
  { id:'jaar', name:'Dit jaar', from:'2026-01-01', to:'2026-12-31' }
];

/* Budget van een categorie in de lopende periode, op de eigen privé-rekeningen, netto. */
function budgetOf(catId) {
  const b = BUDGETS[catId]; if (!b) return null;
  const own = new Set(['asn-y', 'bunq', 'paypal']);
  const rows = TX.filter(t => t.cat === catId && own.has(t.acc) && t.d >= '2026-10-01' && t.d <= '2026-10-31');
  let spent = -rows.reduce((s, t) => s + t.amt, 0);
  TX.filter(t => t.refundFor && rows.some(r => r.id === t.refundFor)).forEach(r => spent -= r.amt);
  return { ...b, cat: CAT[catId], spent, left: b.amount - spent };
}
/* Eerdere keren bij dezelfde tegenpartij: wat er staat, aangevuld tot zes maanden. */
function history(who) {
  const seen = TX.filter(t => t.who === who && !t.transfer);
  const avg = seen.length ? seen.reduce((s, t) => s + t.amt, 0) / seen.length : -1000;
  let h = [...who].reduce((s, c) => s * 31 + c.charCodeAt(0) >>> 0, 7);
  const rnd = () => (h = (h * 1103515245 + 12345) >>> 0) / 4294967296;
  const past = [];
  for (let m = 1; m <= 5; m++) {
    const n = 1 + Math.floor(rnd() * 2.4);
    for (let i = 0; i < n; i++) past.push({ id:`h${m}${i}`, d: iso(2026, 9 - m, 3 + Math.floor(rnd() * 24)), amt: Math.round(avg * (0.6 + rnd() * 0.9)), acc:'asn-y' });
  }
  const all = [...seen, ...past].sort((a, b) => b.d.localeCompare(a.d));
  const months = [4, 5, 6, 7, 8, 9].map(m => ({ m, label: MON[m], sum: -all.filter(t => at(t.d).getUTCMonth() === m && at(t.d).getUTCFullYear() === 2026).reduce((s, t) => s + t.amt, 0) }));
  return { all, months, count: all.length, avg: Math.round(all.reduce((s, t) => s + t.amt, 0) / all.length) };
}

window.TX2 = { ico, ACCOUNTS, CATS, CAT, tone, TX, store, eur, signed, dm, longDate, dayTitle, range, iso, PRESETS, budgetOf, history, TODAY, MON, MONL, at };
})();
