const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3401;
const BASE = __dirname;

const MIME = {
  '.html': 'text/html', '.css': 'text/css',
  '.js': 'application/javascript', '.json': 'application/json',
};

// ── ESPN country code → Alpha2 for flag emoji ──
const ISO3 = {
  and:'AD', arg:'AR', aus:'AU', aut:'AT', bel:'BE', bih:'BA', blr:'BY',
  bol:'BO', bra:'BR', bul:'BG', can:'CA', chi:'CL', chn:'CN', col:'CO',
  cro:'HR', cyp:'CY', cze:'CZ', den:'DK', egy:'EG', esp:'ES', fin:'FI',
  fra:'FR', gbr:'GB', geo:'GE', ger:'DE', gre:'GR', hkg:'HK', hun:'HU',
  ina:'ID', ita:'IT', jpn:'JP', kaz:'KZ', lat:'LV', ltu:'LT', lux:'LU',
  mex:'MX', mkd:'MK', mne:'ME', ned:'NL', nor:'NO', nzl:'NZ', par:'PY',
  per:'PE', phi:'PH', pol:'PL', por:'PT', rom:'RO', rus:'RU', ser:'RS',
  slo:'SI', srb:'RS', sui:'CH', svk:'SK', tha:'TH', tpe:'TW', tun:'TN',
  tur:'TR', ukr:'UA', usa:'US', uzb:'UZ', kor:'KR', ind:'IN', swe:'SE',
  est:'EE', mda:'MD', mar:'MA', rsa:'ZA', ecu:'EC', uru:'UY', isr:'IL',
  alg:'DZ', ven:'VE', dom:'DO', bah:'BS', mon:'MC',
};

function flagFromUrl(url) {
  const m = (url || '').match(/countries\/\d+\/([a-z]+)\.png/i);
  if (!m) return { emoji: null, code: '?' };
  const code3 = m[1].toUpperCase();
  const alpha2 = ISO3[m[1].toLowerCase()];
  if (!alpha2) return { emoji: null, code: code3.slice(0, 3) };
  const emoji = String.fromCodePoint(...[...alpha2].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
  return { emoji, code: code3.slice(0, 3) };
}

function inferSurface(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('wimbledon') || n.includes('grass') || n.includes('halle') || n.includes("queen's")) return 'grass';
  if (n.includes('clay') || n.includes('roland') || n.includes('madrid') ||
      n.includes('rome') || n.includes('italia') || n.includes('barcelona') ||
      n.includes('monte') || n.includes('hamburg') || n.includes('geneva') ||
      n.includes('munich') || n.includes('estoril') || n.includes('bucharest') ||
      n.includes('lyon') || n.includes('istanbul') || n.includes('marrakech')) return 'clay';
  if (n.includes('indoor') || n.includes('rotterdam') || n.includes('sofia') ||
      n.includes('marseille') || n.includes('montpellier')) return 'indoor';
  return 'hard';
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get({ hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: { 'Accept': 'application/json' }, timeout: 10000 }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── Map ESPN competition → our match format ──
function mapCompetition(comp, tournament) {
  const state = comp.status?.type?.state; // 'pre' | 'in' | 'post'
  if (!state) return null;

  const status = state === 'in' ? 'live' : state === 'post' ? 'past' : 'upcoming';

  // Sort competitors by order (1 = top player)
  const comps = [...(comp.competitors || [])].sort((a, b) => a.order - b.order);
  if (comps.length < 2) return null;

  const c1 = comps[0];
  const c2 = comps[1];
  const a1 = c1.athlete || {};
  const a2 = c2.athlete || {};

  // Set scores from linescores
  const ls1 = c1.linescores || [];
  const ls2 = c2.linescores || [];
  const sets = ls1.map((s, i) => ({
    p1: s.value ?? 0,
    p2: ls2[i]?.value ?? 0,
    done: status !== 'live' || i < ls1.length - 1,
  }));

  // Winner
  let winner = null;
  if (status === 'past') {
    if (c1.winner) winner = 'p1';
    else if (c2.winner) winner = 'p2';
  }

  // Time — send raw UTC ms so the browser can render in user's local timezone
  const dateObj = new Date(comp.startDate || comp.date);
  const dateStr = dateObj.toISOString().slice(0, 10);

  const f1 = flagFromUrl(a1.flag?.href);
  const f2 = flagFromUrl(a2.flag?.href);

  return {
    id: comp.id,
    tournament,
    status,
    round: comp.round?.displayName || '',
    court: comp.venue?.court || '',
    date: dateStr,
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

function tournamentFlag(event) {
  // Try to get flag from venue country or first competitor
  for (const g of (event.groupings || [])) {
    for (const comp of (g.competitions || [])) {
      for (const c of (comp.competitors || [])) {
        const f = flagFromUrl(c.athlete?.flag?.href);
        if (f !== '🎾') return f; // skip — we want venue flag, not player
      }
    }
  }
  return '🎾';
}

// Map tournament name → host country flag
const TOURNEY_FLAGS = {
  "internazionali bnl d'italia": '🇮🇹',
  'roland garros': '🇫🇷',
  'wimbledon': '🇬🇧',
  'us open': '🇺🇸',
  'australian open': '🇦🇺',
  'mutua madrid open': '🇪🇸',
  'madrid open': '🇪🇸',
  'monte-carlo': '🇲🇨',
  'monte carlo': '🇲🇨',
  'barcelona open': '🇪🇸',
  'hamburg': '🇩🇪',
  'geneva open': '🇨🇭',
  'lyon open': '🇫🇷',
  'halle open': '🇩🇪',
  "queen's club": '🇬🇧',
  'eastbourne': '🇬🇧',
  'jiangxi': '🇨🇳',
  'istanbul': '🇹🇷',
  'madrid': '🇪🇸',
  'rome': '🇮🇹', 'roma': '🇮🇹',
};

function flagForTournament(name) {
  const n = name.toLowerCase();
  for (const [key, flag] of Object.entries(TOURNEY_FLAGS)) {
    if (n.includes(key)) return flag;
  }
  return '🎾';
}

async function fetchTennis() {
  const [atpData, wtaData] = await Promise.all([
    fetchJSON('https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard'),
    fetchJSON('https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard'),
  ]);

  const seenComps = new Set();
  const all = { live: [], upcoming: [], past: [] };

  for (const data of [atpData, wtaData]) {
    for (const event of (data.events || [])) {
      for (const group of (event.groupings || [])) {
        const slug = group.grouping?.slug || '';
        const isWomens = slug.includes('women');
        const tour = isWomens ? 'WTA' : 'ATP';

        const tournament = {
          id: `${event.id}-${slug}`,
          name: event.name,
          location: event.venue?.fullName || '',
          surface: inferSurface(event.name),
          flag: flagForTournament(event.name),
          tour,
        };

        for (const comp of (group.competitions || [])) {
          if (seenComps.has(comp.id)) continue; // deduplicate across endpoints
          seenComps.add(comp.id);

          const match = mapCompetition(comp, tournament);
          if (match) all[match.status].push(match);
        }
      }
    }
  }

  return all;
}

// ── HTTP SERVER ──

http.createServer(async (req, res) => {
  const reqPath = req.url.split('?')[0];

  if (reqPath === '/api/matches') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const data = await fetchTennis();
      res.end(JSON.stringify(data));
    } catch (err) {
      console.error('API error:', err.message);
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  const filePath = path.join(BASE, reqPath === '/' ? 'index.html' : reqPath);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Tennis tracker on http://localhost:${PORT}`));
