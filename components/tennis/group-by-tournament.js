export function groupByTournament(matches) {
  const map = new Map();
  matches.forEach((m) => {
    const key = m.tournament.id;
    if (!map.has(key)) map.set(key, { tournament: m.tournament, matches: [] });
    map.get(key).matches.push(m);
  });
  return [...map.values()];
}
