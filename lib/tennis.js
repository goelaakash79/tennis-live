const ISO3 = {
  and: 'AD',
  arg: 'AR',
  aus: 'AU',
  aut: 'AT',
  bel: 'BE',
  bih: 'BA',
  blr: 'BY',
  bol: 'BO',
  bra: 'BR',
  bul: 'BG',
  can: 'CA',
  chi: 'CL',
  chn: 'CN',
  col: 'CO',
  cro: 'HR',
  cyp: 'CY',
  cze: 'CZ',
  den: 'DK',
  egy: 'EG',
  esp: 'ES',
  fin: 'FI',
  fra: 'FR',
  gbr: 'GB',
  geo: 'GE',
  ger: 'DE',
  gre: 'GR',
  hkg: 'HK',
  hun: 'HU',
  ina: 'ID',
  ita: 'IT',
  jpn: 'JP',
  kaz: 'KZ',
  lat: 'LV',
  ltu: 'LT',
  lux: 'LU',
  mex: 'MX',
  mkd: 'MK',
  mne: 'ME',
  ned: 'NL',
  nor: 'NO',
  nzl: 'NZ',
  par: 'PY',
  per: 'PE',
  phi: 'PH',
  pol: 'PL',
  por: 'PT',
  rom: 'RO',
  rus: 'RU',
  ser: 'RS',
  slo: 'SI',
  srb: 'RS',
  sui: 'CH',
  svk: 'SK',
  tha: 'TH',
  tpe: 'TW',
  tun: 'TN',
  tur: 'TR',
  ukr: 'UA',
  usa: 'US',
  uzb: 'UZ',
  kor: 'KR',
  ind: 'IN',
  swe: 'SE',
  est: 'EE',
  mda: 'MD',
  mar: 'MA',
  rsa: 'ZA',
  ecu: 'EC',
  uru: 'UY',
  isr: 'IL',
  alg: 'DZ',
  ven: 'VE',
  dom: 'DO',
  bah: 'BS',
  mon: 'MC',
};

function flagFromUrl(url) {
  const m = (url || '').match(/countries\/\d+\/([a-z]+)\.png/i);
  if (!m) return { emoji: null, code: '?' };
  const code3 = m[1].toUpperCase();
  const alpha2 = ISO3[m[1].toLowerCase()];
  if (!alpha2) return { emoji: null, code: code3.slice(0, 3) };
  const emoji = String.fromCodePoint(
    ...[...alpha2].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
  return { emoji, code: code3.slice(0, 3) };
}

const TOP_TIER_KEYWORDS = [
  'australian open',
  'roland garros',
  'french open',
  'wimbledon',
  'us open',
  'indian wells',
  'miami open',
  'monte-carlo',
  'monte carlo',
  'madrid open',
  'mutua madrid',
  'internazionali',
  "d'italia",
  'canadian open',
  'rogers cup',
  'national bank open',
  'western & southern',
  'cincinnati',
  'shanghai',
  'paris masters',
  'rolex paris',
  'qatar total',
  'qatar open',
  'dubai duty',
  'wuhan open',
  'china open',
  'atp finals',
  'wta finals',
  'nitto atp',
  'olympic',
];

function isTopTier(name) {
  const n = (name || '').toLowerCase();
  return TOP_TIER_KEYWORDS.some((kw) => n.includes(kw));
}

function inferSurface(name) {
  const n = (name || '').toLowerCase();
  if (
    n.includes('wimbledon') ||
    n.includes('grass') ||
    n.includes('halle') ||
    n.includes("queen's")
  )
    return 'grass';
  if (
    n.includes('clay') ||
    n.includes('roland') ||
    n.includes('madrid') ||
    n.includes('rome') ||
    n.includes('italia') ||
    n.includes('barcelona') ||
    n.includes('monte') ||
    n.includes('hamburg') ||
    n.includes('geneva') ||
    n.includes('munich') ||
    n.includes('estoril') ||
    n.includes('bucharest') ||
    n.includes('lyon') ||
    n.includes('istanbul') ||
    n.includes('marrakech')
  )
    return 'clay';
  if (
    n.includes('indoor') ||
    n.includes('rotterdam') ||
    n.includes('sofia') ||
    n.includes('marseille') ||
    n.includes('montpellier')
  )
    return 'indoor';
  return 'hard';
}

const TOURNEY_FLAGS = {
  "internazionali bnl d'italia": '🇮🇹',
  'roland garros': '🇫🇷',
  wimbledon: '🇬🇧',
  'us open': '🇺🇸',
  'australian open': '🇦🇺',
  'mutua madrid open': '🇪🇸',
  'madrid open': '🇪🇸',
  'monte-carlo': '🇲🇨',
  'monte carlo': '🇲🇨',
  'barcelona open': '🇪🇸',
  hamburg: '🇩🇪',
  'geneva open': '🇨🇭',
  'lyon open': '🇫🇷',
  'halle open': '🇩🇪',
  "queen's club": '🇬🇧',
  eastbourne: '🇬🇧',
  jiangxi: '🇨🇳',
  istanbul: '🇹🇷',
  madrid: '🇪🇸',
  rome: '🇮🇹',
  roma: '🇮🇹',
};

function flagForTournament(name) {
  const n = name.toLowerCase();
  for (const [key, flag] of Object.entries(TOURNEY_FLAGS)) {
    if (n.includes(key)) return flag;
  }
  return '🎾';
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function mapCompetition(comp, tournament) {
  const state = comp.status?.type?.state;
  if (!state) return null;
  const status = state === 'in' ? 'live' : state === 'post' ? 'past' : 'upcoming';

  const comps = [...(comp.competitors || [])].sort((a, b) => a.order - b.order);
  if (comps.length < 2) return null;

  const c1 = comps[0];
  const c2 = comps[1];
  const a1 = c1.athlete || {};
  const a2 = c2.athlete || {};

  const ls1 = c1.linescores || [];
  const ls2 = c2.linescores || [];
  const sets = ls1.map((s, i) => ({
    p1: s.value ?? 0,
    p2: ls2[i]?.value ?? 0,
    done: status !== 'live' || i < ls1.length - 1,
  }));

  let winner = null;
  if (status === 'past') {
    if (c1.winner) winner = 'p1';
    else if (c2.winner) winner = 'p2';
  }

  const dateObj = new Date(comp.startDate || comp.date);
  const f1 = flagFromUrl(a1.flag?.href);
  const f2 = flagFromUrl(a2.flag?.href);

  return {
    id: comp.id,
    tournament,
    status,
    round: comp.round?.displayName || '',
    court: comp.venue?.court || '',
    date: dateObj.toISOString().slice(0, 10),
    startMs: dateObj.getTime(),
    p1: {
      name: a1.shortName || a1.displayName || 'Player 1',
      flagEmoji: f1.emoji,
      flagCode: f1.code,
      rank: c1.curatedRank?.current || null,
      serving: false,
    },
    p2: {
      name: a2.shortName || a2.displayName || 'Player 2',
      flagEmoji: f2.emoji,
      flagCode: f2.code,
      rank: c2.curatedRank?.current || null,
      serving: false,
    },
    sets: sets.length ? sets : null,
    currentGame: null,
    winner,
  };
}

export async function fetchTennis() {
  const [atpData, wtaData] = await Promise.all([
    fetchJSON('https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard'),
    fetchJSON('https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard'),
  ]);

  const seenComps = new Set();
  const all = { live: [], upcoming: [], past: [] };

  for (const data of [atpData, wtaData]) {
    for (const event of data.events || []) {
      if (!isTopTier(event.name)) continue;
      for (const group of event.groupings || []) {
        const slug = group.grouping?.slug || '';
        const isWomens = slug.includes('women');
        const tournament = {
          id: `${event.id}-${slug}`,
          name: event.name,
          location: event.venue?.fullName || '',
          surface: inferSurface(event.name),
          flag: flagForTournament(event.name),
          tour: isWomens ? 'WTA' : 'ATP',
        };
        for (const comp of group.competitions || []) {
          if (seenComps.has(comp.id)) continue;
          seenComps.add(comp.id);
          const match = mapCompetition(comp, tournament);
          if (match) all[match.status].push(match);
        }
      }
    }
  }
  return all;
}
