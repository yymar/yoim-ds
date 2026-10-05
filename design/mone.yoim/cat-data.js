/* Categorieën: voorbeelddata van Yoran in de vorm van de repo (mone.categories,
   rules, budgets) en de iconen die er bovenop komen. Laadt na tx2-data.js. */
(() => {
const X = window.TX2;
const EX = {
  landmark:'<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M12 2 20 7H4z"/>',
  percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  coins:'<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  briefcase:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  rotate:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  split:'<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>',
  banknote:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  coffee:'<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  cap:'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  phone:'<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  shirt:'<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  sprout:'<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  merge:'<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
  arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  tag:'<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
};
const ico = (n, s = 18, w = 2) => EX[n] ? `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">${EX[n]}</svg>` : X.ico(n, s, w);

/* Iconen in de kiezer, met zoekwoorden. */
const ICONS = [
  ['basket','boodschappen supermarkt winkel'], ['utensils','eten drinken restaurant uit'], ['coffee','koffie lunch'], ['car','auto transport vervoer'],
  ['plane','vakantie reizen vliegen'], ['house','huis wonen'], ['sprout','tuin planten'], ['shirt','kleding'],
  ['bag','shopping persoonlijk'], ['heart','gezondheid zorg'], ['dumbbell','sport hobby'], ['music','muziek abonnement'],
  ['mic','optreden artiest'], ['gift','cadeau verjaardag'], ['cap','studie school'], ['briefcase','werk zakelijk'],
  ['phone','telefoon abonnement'], ['zap','energie stroom gas'], ['shield','verzekering vaste lasten'], ['receipt','rekening factuur'],
  ['landmark','belasting bank gemeente'], ['percent','rente interest'], ['coins','geld inkomsten'], ['wallet','salaris loon'],
  ['banknote','kosten contant'], ['split','splits delen tikkie'], ['rotate','terug retour refund'], ['umbrella','onvoorzien'],
  ['tag','overig label'], ['dots','overig other']
];
const COLORS = ['green','success','teal','blue','purple','pink','red','orange','yellow','brown','olijf','gray'];
const SOORT = { vast:'Vast', var:'Variabel', ink:'Inkomen' };

const R = (who, extra = {}) => ({ who, src:'spendee', ...extra });
const C = (id, name, color, icon, soort, n, af, bij, budget, rules = [], extra = {}) => ({ id, name, color, icon, soort, n, af, bij, budget, rules, since:'2021', ...extra });
const CATS = [
  C('vlast','Vaste Lasten','gray','shield','vast',455,1183800,540000,'Maandlasten',[R('Florius',{ acc:'abn' }),R('Centraal Beheer'),R('Vattenfall'),R('Gemeente Den Haag'),R('Ziggo'),R('I. de Vries',{ acc:'abn' })]),
  C('vly','Vaste Lasten Yoran','blue','receipt','vast',158,214300,0,null,[R('Simyo'),R('Zilveren Kruis')]),
  C('vbood','Vaste Boodschappen','orange','rotate','vast',378,186400,0,'Vaste boodschappen',[R('Picnic',{ day:'maandag' }),R('Albert Heijn 1222',{ acc:'abn' }),R('Jumbo Den Haag Centrum')],{ icon:'basket' }),
  C('bood','Boodschappen','green','basket','var',706,348000,6750,'Boodschappen',[R('Albert Heijn 1222'),R('Jumbo Den Haag Centrum'),R('Lidl Laakhaven'),R('Picnic'),R('Ekoplaza',{ src:'kiezer', date:'28 sep' })]),
  C('eten','Eten & Drinken','orange','utensils','var',621,214500,18300,'Uit eten',[R('Thuisbezorgd.nl'),R('Bar Bodega',{ acc:'bunq' }),R('Starbucks Den Haag CS'),R('Uber Eats')]),
  C('shop','Shopping & Persoonlijk','olijf','bag','var',453,162000,21900,'Shopping',[R('Bol.com'),R('Bijenkorf'),R('Zara')]),
  C('auto','Auto & Transport','blue','car','var',384,131200,0,'Vervoer',[R('Ovpay',{ src:'kiezer', date:'5 okt' }),R('Shell Den Haag'),R('B&S'),R('NS Reizigers')]),
  C('sport','Sport & Hobbies','teal','dumbbell','var',358,96800,0,'Sport',[R('Bouldermuur Den Haag'),R('Decathlon'),R('Basic-Fit')]),
  C('onv','Onvoorziene Kosten','brown','umbrella','var',186,84300,12000,'Onvoorzien'),
  C('huis','Huis & Beer','pink','house','var',158,120400,0,'Huis',[R('Beddinghouse Nederland'),R('IKEA Delft'),R('Praxis')]),
  C('other','Other','gray','dots','var',144,31200,4800,null),
  C('reis','Vakantie & Reizen','yellow','plane','var',111,241000,0,null,[R('Transavia'),R('Booking.com')]),
  C('fees','Transfer Fees','gray','banknote','var',94,4230,0,null,[R('Wise'),R('PayPal',{ acc:'paypal' })]),
  C('gez','Gezondheid','red','heart','var',46,38450,0,null,[R('Kruidvat'),R('Etos'),R('Tandarts Laakkwartier')]),
  C('music','Music','purple','music','var',41,14388,0,null,[R('Spotify')]),
  C('splout','Splits Uit','purple','split','var',19,22000,0,null,[R('Tikkie',{ acc:'bunq' }),R('Wiebetaaltwat')]),
  C('werk','Werk','blue','briefcase','var',13,8900,0,null),
  C('prod','Producer Refunds','red','rotate','var',10,3000,0,null,[],{ hidden:true }),
  C('ymar','@00.ymar','teal','mic','ink',1223,0,182000,null,[R('DistroKid'),R('Spotify AB',{ acc:'paypal' })]),
  C('overig','Overige Inkomsten','blue','coins','ink',487,0,98000,null),
  C('splin','Splits In','purple','split','ink',381,0,412000,null,[R('Tikkie'),R('I. de Vries')]),
  C('sal','Salaris','success','wallet','ink',119,0,3221400,null,[R('Werkgever BV')]),
  C('int','Interest','green','percent','ink',37,0,4120,null,[R('ASN Bank')]),
  C('bel','Belastingdienst','blue','landmark','ink',30,0,142000,null,[R('Belastingdienst')])
];

const n0 = new Intl.NumberFormat('nl-NL', { maximumFractionDigits:0 });
const eur0 = c => '€\u00a0' + n0.format(Math.round(Math.abs(c) / 100));
const net = c => c.bij - c.af;
const netStr = v => v === 0 ? '€\u00a00' : (v < 0 ? '−' : '+') + eur0(v);

window.CATX = { ico, ICONS, COLORS, SOORT, CATS, eur0, net, netStr };
})();
