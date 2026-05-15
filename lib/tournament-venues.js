/**
 * Tournament → venue lookup. API-Tennis livescore/fixtures do not include per-match
 * court fields; we resolve the hosting stadium from tournament name/key (and show-court
 * names for late-round matches at majors when round text indicates a final).
 */

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .trim();
}

/** Longer / more specific phrases first. */
const VENUE_BY_PHRASE = [
  ['indian wells', 'Indian Wells Tennis Garden'],
  ['bnp paribas open', 'Indian Wells Tennis Garden'],
  ['miami open', 'Hard Rock Stadium'],
  ['monte-carlo', 'Monte Carlo Country Club'],
  ['monte carlo', 'Monte Carlo Country Club'],
  ['mutua madrid', 'Caja Mágica'],
  ['madrid open', 'Caja Mágica'],
  ['internazionali', 'Foro Italico'],
  ["d'italia", 'Foro Italico'],
  ['italian open', 'Foro Italico'],
  ['foro italico', 'Foro Italico'],
  ['rogers cup', 'IGA Stadium'],
  ['national bank open', 'IGA Stadium'],
  ['omnium banque', 'IGA Stadium'],
  ['western & southern', 'Lindner Family Tennis Center'],
  ['cincinnati', 'Lindner Family Tennis Center'],
  ['shanghai', 'Qizhong Forest Sports City Arena'],
  ['rolex paris', 'Accor Arena'],
  ['paris masters', 'Accor Arena'],
  ['bercy', 'Accor Arena'],
  ['australian open', 'Melbourne Park'],
  ['melbourne park', 'Melbourne Park'],
  ['roland garros', 'Stade Roland Garros'],
  ['roland-garros', 'Stade Roland Garros'],
  ['french open', 'Stade Roland Garros'],
  ['wimbledon', 'All England Club'],
  ['the championships', 'All England Club'],
  ['us open', 'Arthur Ashe Stadium'],
  ['flushing meadows', 'Arthur Ashe Stadium'],
  ['u.s. open', 'Arthur Ashe Stadium'],
  ['atp finals', 'Inalpi Arena'],
  ['nitto atp', 'Inalpi Arena'],
  ['wta finals', 'Fort Worth (Dickies Arena)'],
  ['bengaluru', 'KSLTA Tennis Stadium'],
  ['bangalore', 'KSLTA Tennis Stadium'],
  ['karnataka open', 'KSLTA Tennis Stadium'],
  ['chennai open', 'SDAT Tennis Stadium'],
  ['madras open', 'SDAT Tennis Stadium'],
  ['delhi open', 'DLTA Complex'],
  ['new delhi open', 'DLTA Complex'],
  ['mumbai open', 'Maharashtra Tennis Association'],
  ['tata open maharashtra', 'Maharashtra Tennis Association'],
  ['maharashtra open', 'Maharashtra Tennis Association'],
  ['pune open', 'Shree Shiv Chhatrapati Sports Complex'],
  ['kolkata open', 'Calcutta South Club'],
  ['hyderabad open', 'Gachibowli Stadium'],
  ['doha', 'Khalifa International Tennis Centre'],
  ['dubai', 'Dubai Duty Free Tennis Stadium'],
  ['beijing', 'National Tennis Center'],
  ['china open', 'National Tennis Center'],
  ['wuhan', 'Optics Valley International Tennis Center'],
  ['rome', 'Foro Italico'],
  ['roma', 'Foro Italico'],
  ['miami', 'Hard Rock Stadium'],
  ['madrid', 'Caja Mágica'],
  ['toronto', 'Sobeys Stadium'],
  ['montreal', 'IGA Stadium'],
  ['paris', 'Accor Arena'],
];

const VENUE_BY_TOURNAMENT_KEY = {
  '2010': 'Foro Italico',
  '2011': 'Foro Italico',
  '2799': 'KSLTA Tennis Stadium',
  '2800': 'KSLTA Tennis Stadium',
  '5256': 'KSLTA Tennis Stadium',
  '5257': 'KSLTA Tennis Stadium',
};

/** Show courts for tournament finals (round text must include "final", not "semi"). */
const FINAL_SHOW_COURT = [
  ['wimbledon', 'Centre Court'],
  ['the championships', 'Centre Court'],
  ['roland garros', 'Philippe-Chatrier'],
  ['roland-garros', 'Philippe-Chatrier'],
  ['french open', 'Philippe-Chatrier'],
  ['garros', 'Philippe-Chatrier'],
  ['us open', 'Arthur Ashe Stadium'],
  ['flushing', 'Arthur Ashe Stadium'],
  ['australian open', 'Rod Laver Arena'],
  ['melbourne park', 'Rod Laver Arena'],
  ['indian wells', 'Stadium 1'],
  ['miami open', 'Grandstand'],
  ['rome', 'Campo Centrale'],
  ['internazionali', 'Campo Centrale'],
  ["d'italia", 'Campo Centrale'],
];

function lookupVenueByPhrase(haystack) {
  for (const [phrase, venue] of VENUE_BY_PHRASE) {
    if (haystack.includes(phrase)) return venue;
  }
  return '';
}

function lookupFinalShowCourt(haystack, roundHaystack) {
  if (!/\bfinal\b/.test(roundHaystack) || /\bsemi\b/.test(roundHaystack)) return '';
  for (const [phrase, court] of FINAL_SHOW_COURT) {
    if (haystack.includes(phrase)) return court;
  }
  return '';
}

/**
 * @param {{ tournamentName?: string, tournamentKey?: string|number, round?: string, apiCourt?: string }} opts
 * @returns {string} Stadium or show-court label for display
 */
export function resolveTournamentVenue(opts) {
  const apiCourt = String(opts.apiCourt || '').trim();
  if (apiCourt) return apiCourt;

  const nameHaystack = norm(opts.tournamentName);
  const roundHaystack = norm(opts.round);
  const haystack = `${nameHaystack} ${roundHaystack}`.trim();
  if (!haystack) return '';

  const showCourt = lookupFinalShowCourt(nameHaystack, roundHaystack);
  if (showCourt) return showCourt;

  const key = String(opts.tournamentKey ?? '').trim();
  if (key && VENUE_BY_TOURNAMENT_KEY[key]) return VENUE_BY_TOURNAMENT_KEY[key];

  return lookupVenueByPhrase(nameHaystack) || lookupVenueByPhrase(haystack);
}
