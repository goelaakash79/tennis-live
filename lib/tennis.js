/**
 * Match filter (always on):
 * - Grand Slams: Australian Open, French Open / Roland-Garros, Wimbledon, US Open
 * - ATP Masters 1000 / WTA 1000
 * - ATP Finals / WTA Finals
 * - Olympic tennis
 *
 * Uses get_tournaments: any tournament_key whose catalog row matches the rules below
 * is added to an allowlist; livescore/fixture rows pass if tournament_key is allowlisted
 * OR if the row text still matches (covers catalog lag / naming differences).
 */

/** Map of country names (lowercase) as returned by api-tennis get_players → ISO 3166-1 alpha-2 */
const COUNTRY_TO_ISO2 = {
  'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'andorra': 'AD', 'angola': 'AO',
  'argentina': 'AR', 'armenia': 'AM', 'australia': 'AU', 'austria': 'AT', 'azerbaijan': 'AZ',
  'bahamas': 'BS', 'bahrain': 'BH', 'bangladesh': 'BD', 'barbados': 'BB', 'belarus': 'BY',
  'belgium': 'BE', 'belize': 'BZ', 'benin': 'BJ', 'bhutan': 'BT', 'bolivia': 'BO',
  'bosnia': 'BA', 'bosnia and herzegovina': 'BA', 'botswana': 'BW', 'brazil': 'BR',
  'brunei': 'BN', 'bulgaria': 'BG', 'burkina faso': 'BF', 'burundi': 'BI', 'cambodia': 'KH',
  'cameroon': 'CM', 'canada': 'CA', 'cape verde': 'CV', 'chad': 'TD', 'chile': 'CL',
  'china': 'CN', 'chinese taipei': 'TW', 'colombia': 'CO', 'comoros': 'KM', 'congo': 'CG',
  'costa rica': 'CR', 'croatia': 'HR', 'cuba': 'CU', 'cyprus': 'CY', 'czech republic': 'CZ',
  'czechia': 'CZ', 'denmark': 'DK', 'djibouti': 'DJ', 'dominican republic': 'DO',
  'ecuador': 'EC', 'egypt': 'EG', 'el salvador': 'SV', 'eritrea': 'ER', 'estonia': 'EE',
  'ethiopia': 'ET', 'fiji': 'FJ', 'finland': 'FI', 'france': 'FR', 'gabon': 'GA',
  'gambia': 'GM', 'georgia': 'GE', 'germany': 'DE', 'ghana': 'GH', 'great britain': 'GB',
  'greece': 'GR', 'guatemala': 'GT', 'guinea': 'GN', 'haiti': 'HT', 'honduras': 'HN',
  'hong kong': 'HK', 'hungary': 'HU', 'iceland': 'IS', 'india': 'IN', 'indonesia': 'ID',
  'iran': 'IR', 'iraq': 'IQ', 'ireland': 'IE', 'israel': 'IL', 'italy': 'IT',
  'ivory coast': 'CI', "côte d'ivoire": 'CI', 'jamaica': 'JM', 'japan': 'JP', 'jordan': 'JO',
  'kazakhstan': 'KZ', 'kenya': 'KE', 'korea': 'KR', 'south korea': 'KR', 'kuwait': 'KW',
  'kyrgyzstan': 'KG', 'laos': 'LA', 'latvia': 'LV', 'lebanon': 'LB', 'lesotho': 'LS',
  'liberia': 'LR', 'libya': 'LY', 'liechtenstein': 'LI', 'lithuania': 'LT', 'luxembourg': 'LU',
  'macau': 'MO', 'madagascar': 'MG', 'malawi': 'MW', 'malaysia': 'MY', 'maldives': 'MV',
  'mali': 'ML', 'malta': 'MT', 'mauritania': 'MR', 'mauritius': 'MU', 'mexico': 'MX',
  'moldova': 'MD', 'monaco': 'MC', 'mongolia': 'MN', 'montenegro': 'ME', 'morocco': 'MA',
  'mozambique': 'MZ', 'myanmar': 'MM', 'namibia': 'NA', 'nepal': 'NP', 'netherlands': 'NL',
  'new zealand': 'NZ', 'nicaragua': 'NI', 'niger': 'NE', 'nigeria': 'NG', 'north korea': 'KP',
  'north macedonia': 'MK', 'norway': 'NO', 'oman': 'OM', 'pakistan': 'PK', 'panama': 'PA',
  'paraguay': 'PY', 'peru': 'PE', 'philippines': 'PH', 'poland': 'PL', 'portugal': 'PT',
  'qatar': 'QA', 'romania': 'RO', 'russia': 'RU', 'rwanda': 'RW', 'saudi arabia': 'SA',
  'senegal': 'SN', 'serbia': 'RS', 'sierra leone': 'SL', 'singapore': 'SG', 'slovakia': 'SK',
  'slovenia': 'SI', 'somalia': 'SO', 'south africa': 'ZA', 'spain': 'ES', 'sri lanka': 'LK',
  'sudan': 'SD', 'sweden': 'SE', 'switzerland': 'CH', 'syria': 'SY', 'taiwan': 'TW',
  'tajikistan': 'TJ', 'tanzania': 'TZ', 'thailand': 'TH', 'togo': 'TG', 'trinidad and tobago': 'TT',
  'tunisia': 'TN', 'turkey': 'TR', 'turkmenistan': 'TM', 'uganda': 'UG', 'ukraine': 'UA',
  'united arab emirates': 'AE', 'uae': 'AE', 'united kingdom': 'GB', 'uk': 'GB',
  'united states': 'US', 'usa': 'US', 'uruguay': 'UY', 'uzbekistan': 'UZ', 'venezuela': 'VE',
  'vietnam': 'VN', 'yemen': 'YE', 'zambia': 'ZM', 'zimbabwe': 'ZW',
};

function isoToFlagEmoji(iso2) {
  const code = iso2.toUpperCase();
  return (
    String.fromCodePoint(0x1f1e6 + code.charCodeAt(0) - 65) +
    String.fromCodePoint(0x1f1e6 + code.charCodeAt(1) - 65)
  );
}

function countryNameToFlag(country) {
  const normalized = (country || '').toLowerCase().trim();
  if (normalized === 'world' || normalized === 'neutral') {
    return { flagEmoji: '🌍', flagCode: 'WC' };
  }
  const iso2 = COUNTRY_TO_ISO2[normalized];
  if (!iso2) return { flagEmoji: null, flagCode: '' };
  return { flagEmoji: isoToFlagEmoji(iso2), flagCode: iso2 };
}

/** Server-side in-memory cache: player_key (number) → { flagEmoji, flagCode } */
const _playerFlagCache = new Map();

const GRAND_SLAM_PHRASES = [
  'australian open',
  'melbourne park',
  'roland garros',
  'roland-garros',
  'french open',
  'garros',
  'wimbledon',
  'the championships',
  'us open',
  'u.s. open',
  'flushing meadows',
];

/** Known tournament / series titles for Masters 1000 & WTA 1000 (when API puts level in the name, not only in event_type). */
const MASTERS_WTA1000_NAME_PHRASES = [
  'indian wells',
  'bnp paribas open',
  'miami open',
  'miami presented',
  'miami masters',
  'monte-carlo',
  'monte carlo',
  'rolex monte-carlo',
  'mutua madrid',
  'madrid open',
  'internazionali',
  "d'italia",
  'italian open',
  'rome masters',
  'foro italico',
  'canadian open',
  'rogers cup',
  'national bank open',
  'omnium banque nationale',
  'western & southern',
  'cincinnati',
  'shanghai rolex',
  'shanghai masters',
  'rolex shanghai',
  'paris masters',
  'rolex paris masters',
  'masters paris',
  'bercy',
  'qatar open',
  'qatar total',
  'doha',
  'dubai duty',
  'dubai championships',
  'dubai tennis',
  'wuhan open',
  'china open',
];

const FINALS_PHRASES = [
  'atp finals',
  'wta finals',
  'nitto atp',
  'nitto atp finals',
  'atp final',
  'wta final',
];

/**
 * Venue-only names the API uses as tournament_name for Masters 1000 / WTA 1000 main draws.
 * These are city names that appear WITHOUT a qualifier like "Masters" in the API response.
 */
const MASTERS_VENUE_NAMES = [
  'rome', 'roma', 'madrid', 'miami', 'indian wells',
  'monte-carlo', 'monte carlo', 'toronto', 'montreal',
  'cincinnati', 'shanghai', 'paris', 'beijing', 'doha', 'dubai', 'wuhan',
  'canada', 'china',
];

const OLYMPIC_PHRASES = ['olympic', 'olympics', 'olympic games'];

/**
 * When event_type contains Masters 1000 / WTA 1000 / ATP 1000, tournament_name is often just the city.
 * Venues align with the joint ATP M1000 + WTA 1000 calendar (incl. Canada, Middle East, China swings).
 */
const TIER1000_VENUE_PHRASES = [
  'indian wells',
  'miami',
  'monte-carlo',
  'monte carlo',
  'madrid',
  'rome',
  'roma',
  'internazionali',
  "d'italia",
  'italian open',
  'toronto',
  'montreal',
  'canada',
  'national bank',
  'rogers',
  'omnium',
  'cincinnati',
  'shanghai',
  'paris masters',
  'rolex paris',
  'bercy',
  'doha',
  'dubai',
  'wuhan',
  'beijing',
  'china open',
];

function textMatchesAny(n, phrases) {
  return phrases.some((kw) => n.includes(kw));
}

/** Normalize API strings so curly apostrophes etc. still match phrase lists. */
function normalizeFilterText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'");
}

function isGrandSlamEvent(n) {
  return textMatchesAny(n, GRAND_SLAM_PHRASES);
}

function isMastersOrWta1000ByName(n) {
  return textMatchesAny(n, MASTERS_WTA1000_NAME_PHRASES);
}

function isTier1000EventType(n) {
  return (
    /\bmasters\s*1000\b/i.test(n) ||
    /\bwta\s*1000\b/i.test(n) ||
    /\batp\s*1000\b/i.test(n) ||
    /\bm1000\b/i.test(n) ||
    n.includes('premier mandatory') ||
    n.includes('premier 5')
  );
}

function isMastersOrWta1000ByTypeAndVenue(n) {
  if (!isTier1000EventType(n)) return false;
  return textMatchesAny(n, TIER1000_VENUE_PHRASES);
}

function isAtpOrWtaFinals(n) {
  if (textMatchesAny(n, FINALS_PHRASES)) return true;
  // API returns "Finals - Turin" / "Finals - Riyadh" where venue rotates each year
  return /\bfinals?\b/.test(n) && /\b(atp|wta)\b/.test(n) && !/\bchallenger\b/.test(n);
}

/**
 * Matches Masters 1000 / WTA 1000 main-draw entries where the API uses just the city name
 * (e.g. tournament_name = "Rome", event_type_type = "Atp Singles").
 * Excludes ITF, Challenger, juniors, and wheelchair events.
 */
function isMasters1000MainDrawByVenueName(n) {
  if (/\b(itf|challenger|boys|girls|junior|wheelchair)\b/.test(n)) return false;
  if (!/\b(atp|wta)\b/.test(n)) return false;
  return MASTERS_VENUE_NAMES.some((v) => n.startsWith(v + ' ') || n === v);
}

function isOlympicTennis(n) {
  return textMatchesAny(n, OLYMPIC_PHRASES);
}

function isDefaultTournamentSet(n) {
  return (
    isGrandSlamEvent(n) ||
    isMastersOrWta1000ByName(n) ||
    isMastersOrWta1000ByTypeAndVenue(n) ||
    isMasters1000MainDrawByVenueName(n) ||
    isAtpOrWtaFinals(n) ||
    isOlympicTennis(n)
  );
}

function rowFilterHaystack(row) {
  const raw = [row.tournament_name, row.event_type_type, row.event_place, row.event_location]
    .filter(Boolean)
    .join(' ');
  return normalizeFilterText(raw);
}

/** Catalog row from get_tournaments — only name + type (no place fields). */
function catalogHaystack(t) {
  const raw = [t.tournament_name, t.event_type_type].filter(Boolean).join(' ');
  return normalizeFilterText(raw);
}

/**
 * Keys from API-Tennis get_tournaments whose tournament_name + event_type_type
 * already qualify as a showcase event (same rules as match rows).
 */
function buildAllowedTournamentKeySet(catalogRows) {
  const set = new Set();
  if (!Array.isArray(catalogRows)) return set;
  for (const t of catalogRows) {
    const n = catalogHaystack(t);
    if (!n.trim()) continue;
    if (!isDefaultTournamentSet(n)) continue;
    const k = t.tournament_key;
    if (k == null || k === '') continue;
    set.add(String(k).trim());
  }
  return set;
}

/**
 * @param {object} row — livescore or fixtures row
 * @param {Set<string>} allowedTournamentKeys — from get_tournaments + same filter rules
 */
function includeMatchRow(row, allowedTournamentKeys) {
  const tk = row.tournament_key != null ? String(row.tournament_key).trim() : '';
  if (allowedTournamentKeys.size > 0 && tk && allowedTournamentKeys.has(tk)) return true;
  const n = rowFilterHaystack(row);
  if (!n.trim()) return false;
  return isDefaultTournamentSet(n);
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

function parsePointToken(v) {
  if (v == null) return null;
  const s = String(v).trim().toUpperCase();
  if (!s) return null;
  if (s === 'A' || s === 'AD') return 'Ad';
  if (['0', '15', '30', '40'].includes(s)) return s;
  return null;
}

function inferTourFromEventType(eventType) {
  const n = String(eventType || '').toLowerCase();
  if (n.includes('women') || n.includes('wta')) return 'WTA';
  return 'ATP';
}

function parseApiTennisCurrentGame(value) {
  const m = String(value || '').match(/(\d+|A|AD)\s*-\s*(\d+|A|AD)/i);
  if (!m) return null;
  const p1 = parsePointToken(m[1]);
  const p2 = parsePointToken(m[2]);
  if (!p1 || !p2) return null;
  return { p1, p2 };
}

/** `event_final_result` like "6-4, 6-2" — only when multiple segments to avoid "2-0" set-count confusion. */
function parseApiTennisSetsFromFinalResult(eventFinalResult) {
  const txt = String(eventFinalResult || '').trim();
  if (!txt || txt === '-') return null;
  const parts = txt.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const sets = [];
  for (const part of parts) {
    const m = part.match(/(\d+)\s*[-:]\s*(\d+)/);
    if (m) sets.push({ p1: Number(m[1]), p2: Number(m[2]), done: true });
  }
  return sets.length ? sets : null;
}

function parseApiTennisSets(pointbypoint) {
  const setsMap = new Map();
  for (const row of pointbypoint || []) {
    const s = String(row.set_number || '').match(/Set\s+(\d+)/i);
    if (!s) continue;
    const setIdx = Number(s[1]);
    const score = String(row.score || '').match(/(\d+)\s*-\s*(\d+)/);
    if (!score) continue;
    setsMap.set(setIdx, {
      set_number: setIdx,
      p1: Number(score[1]),
      p2: Number(score[2]),
    });
  }
  const sets = [...setsMap.values()]
    .sort((a, b) => a.set_number - b.set_number)
    .map((s, i, arr) => ({ p1: s.p1, p2: s.p2, done: i < arr.length - 1 }));
  return sets.length ? sets : null;
}

/** Official per-set games from `scores` array in fixtures/livescore response. */
function parseApiTennisScoresArray(scores, status) {
  if (!Array.isArray(scores) || !scores.length) return null;
  const sorted = [...scores].sort(
    (a, b) => Number(a.score_set || 0) - Number(b.score_set || 0),
  );
  return sorted.map((s, i, arr) => ({
    p1: Number(s.score_first) || 0,
    p2: Number(s.score_second) || 0,
    done: status !== 'live' || i < arr.length - 1,
  }));
}

/** Latest point score in the current set (point-by-point feed). */
function currentGameFromPointByPoint(pointbypoint) {
  if (!Array.isArray(pointbypoint) || !pointbypoint.length) return null;
  let lastSetRow = null;
  for (const row of pointbypoint) {
    if (String(row.set_number || '').match(/Set\s+\d+/i)) lastSetRow = row;
  }
  const points = lastSetRow?.points;
  if (!Array.isArray(points) || !points.length) return null;
  const lastPoint = points[points.length - 1];
  return parseApiTennisCurrentGame(lastPoint?.score);
}

function statusFromApiTennisRow(m) {
  if (m.event_live === '1') return 'live';
  const st = String(m.event_status || '').toLowerCase();
  if (m.event_winner || st === 'finished' || st === 'retired' || st === 'walkover') return 'past';
  return 'upcoming';
}

function mapApiTennisMatch(m) {
  const status = statusFromApiTennisRow(m);
  let timePart = '00:00';
  if (m.event_time && String(m.event_time).trim()) {
    const t = String(m.event_time).trim();
    timePart = t.length >= 5 ? t.slice(0, 5) : t;
  }
  const start = new Date(`${m.event_date}T${timePart}:00Z`);
  const tournamentName = m.tournament_name || 'Tournament';
  const tour = inferTourFromEventType(m.event_type_type);
  const sets =
    parseApiTennisSets(m.pointbypoint) ||
    parseApiTennisScoresArray(m.scores, status) ||
    parseApiTennisSetsFromFinalResult(m.event_final_result) ||
    null;
  const currentGame =
    status === 'live'
      ? currentGameFromPointByPoint(m.pointbypoint) || parseApiTennisCurrentGame(m.event_game_result)
      : null;

  let winner = null;
  if (status === 'past') {
    if (m.event_winner === 'First Player') winner = 'p1';
    if (m.event_winner === 'Second Player') winner = 'p2';
  }

  return {
    id: String(m.event_key),
    tournament: {
      id: String(m.tournament_key || m.event_key),
      name: tournamentName,
      location: '',
      surface: inferSurface(tournamentName),
      flag: flagForTournament(tournamentName),
      tour,
    },
    status,
    round: m.tournament_round || '',
    court: '',
    date: m.event_date || start.toISOString().slice(0, 10),
    startMs: Number.isFinite(start.getTime()) ? start.getTime() : Date.now(),
    p1: {
      name: m.event_first_player || 'Player 1',
      flagEmoji: null,
      flagCode: '',
      rank: null,
      serving: m.event_serve === 'First Player',
    },
    p2: {
      name: m.event_second_player || 'Player 2',
      flagEmoji: null,
      flagCode: '',
      rank: null,
      serving: m.event_serve === 'Second Player',
    },
    sets,
    currentGame,
    winner,
  };
}

async function resolvePlayerFlag(playerKey, apiKey, apiHost) {
  const k = Number(playerKey);
  if (!k || _playerFlagCache.has(k)) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const url = new URL(apiHost);
    url.searchParams.set('method', 'get_players');
    url.searchParams.set('APIkey', apiKey);
    url.searchParams.set('player_key', String(k));
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    if (!res.ok) return;
    const data = await res.json();
    const player = Array.isArray(data.result) ? data.result[0] : null;
    if (!player?.player_country) return;
    _playerFlagCache.set(k, countryNameToFlag(player.player_country));
  } catch {
    clearTimeout(timer);
  }
}

/** Resolve player flags with a concurrency cap to avoid hammering the API. */
async function resolvePlayerFlagsAll(playerKeys, apiKey, apiHost) {
  const uncached = [...playerKeys].filter((k) => !_playerFlagCache.has(k));
  const CONCURRENCY = 10;
  for (let i = 0; i < uncached.length; i += CONCURRENCY) {
    await Promise.all(
      uncached.slice(i, i + CONCURRENCY).map((k) => resolvePlayerFlag(k, apiKey, apiHost)),
    );
  }
}

async function apiTennisFetch(method, extraParams = {}) {
  const key = process.env.TENNIS_API_KEY;
  const host = process.env.TENNIS_API_HOST || 'https://api.api-tennis.com/tennis/';
  if (!key) throw new Error('TENNIS_API_KEY is required');

  const url = new URL(host);
  url.searchParams.set('method', method);
  url.searchParams.set('APIkey', key);
  url.searchParams.set('timezone', 'UTC');
  for (const [k, v] of Object.entries(extraParams)) {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`api-tennis ${method} failed (${res.status}): ${body.slice(0, 160)}`);
  }
  const payload = await res.json();
  const rows = Array.isArray(payload.result) ? payload.result : [];
  if (payload.success !== 1 && rows.length === 0) {
    throw new Error(payload.message || payload.error || `api-tennis ${method} returned no data`);
  }
  return rows;
}

function utcYmd(offsetDays = 0) {
  const d = new Date();
  const u = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + offsetDays));
  return u.toISOString().slice(0, 10);
}

/**
 * API-Tennis only: get_livescore (live + point-by-point) and get_fixtures (upcoming / past).
 * https://api.api-tennis.com/tennis/
 */
async function fetchTennisFromApiTennisOnly() {
  const dateStart = utcYmd(-1);
  const dateStop = utcYmd(2);

  const [liveRows, fixtureRows, tournamentCatalog] = await Promise.all([
    apiTennisFetch('get_livescore'),
    apiTennisFetch('get_fixtures', { date_start: dateStart, date_stop: dateStop }),
    apiTennisFetch('get_tournaments').catch((err) => {
      console.warn('api-tennis get_tournaments failed, using name-only filter:', err.message);
      return [];
    }),
  ]);

  const allowedTournamentKeys = buildAllowedTournamentKeySet(tournamentCatalog);

  const isSingles = (row) => !(row.event_type_type || '').toLowerCase().includes('doubles');

  const liveKeys = new Set();
  const live = [];

  for (const row of liveRows) {
    if (!isSingles(row)) continue;
    if (!includeMatchRow(row, allowedTournamentKeys)) continue;
    const match = mapApiTennisMatch(row);
    if (match.status === 'live') {
      liveKeys.add(String(row.event_key));
      live.push(match);
    }
  }

  const upcoming = [];
  const past = [];
  const seenUpcoming = new Set();
  const seenPast = new Set();

  for (const row of fixtureRows) {
    if (!isSingles(row)) continue;
    if (!includeMatchRow(row, allowedTournamentKeys)) continue;
    const key = String(row.event_key);
    if (liveKeys.has(key)) continue;

    const match = mapApiTennisMatch(row);
    if (match.status === 'live') {
      liveKeys.add(key);
      live.push(match);
      continue;
    }
    if (match.status === 'past') {
      if (seenPast.has(key)) continue;
      seenPast.add(key);
      past.push(match);
      continue;
    }
    if (seenUpcoming.has(key)) continue;
    seenUpcoming.add(key);
    upcoming.push(match);
  }

  // Fetch player nationalities — singles only (doubles use "team keys" that don't map
  // to individual players in get_players and produce wrong results).
  const apiKey = process.env.TENNIS_API_KEY;
  const apiHost = process.env.TENNIS_API_HOST || 'https://api.api-tennis.com/tennis/';
  const uniquePlayerKeys = new Set();
  for (const row of [...liveRows, ...fixtureRows]) {
    if (!isSingles(row)) continue;
    if (row.first_player_key) uniquePlayerKeys.add(Number(row.first_player_key));
    if (row.second_player_key) uniquePlayerKeys.add(Number(row.second_player_key));
  }
  await resolvePlayerFlagsAll(uniquePlayerKeys, apiKey, apiHost);

  // Build a fast lookup from event_key → player keys (from raw rows)
  const eventPlayerKeys = new Map();
  for (const row of [...liveRows, ...fixtureRows]) {
    eventPlayerKeys.set(String(row.event_key), {
      p1: Number(row.first_player_key),
      p2: Number(row.second_player_key),
    });
  }

  // Apply cached flags — skip doubles team names (contain "/")
  for (const match of [...live, ...upcoming, ...past]) {
    const keys = eventPlayerKeys.get(match.id);
    if (!keys) continue;
    const f1 = _playerFlagCache.get(keys.p1);
    const f2 = _playerFlagCache.get(keys.p2);
    if (f1) { match.p1.flagEmoji = f1.flagEmoji; match.p1.flagCode = f1.flagCode; }
    if (f2) { match.p2.flagEmoji = f2.flagEmoji; match.p2.flagCode = f2.flagCode; }
  }

  return { live, upcoming, past };
}

export async function fetchTennis() {
  if (!process.env.TENNIS_API_KEY) {
    throw new Error('TENNIS_API_KEY is required (API-Tennis only mode)');
  }
  return fetchTennisFromApiTennisOnly();
}
