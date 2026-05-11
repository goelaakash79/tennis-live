// ── DATE HELPERS ──

function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr()     { return localDateStr(); }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return localDateStr(d); }
function tomorrowStr()  { const d = new Date(); d.setDate(d.getDate() + 1); return localDateStr(d); }

function localDateFromMs(ms) {
  return ms ? localDateStr(new Date(ms)) : null;
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const today = todayStr();
  const yesterday = yesterdayStr();
  const tomorrow = tomorrowStr();
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(startMs) {
  if (!startMs) return '';
  return new Date(startMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function renderFlag(p) {
  if (p.flagEmoji) return `<span class="player-flag">${p.flagEmoji}</span>`;
  return `<span class="player-flag flag-abbr">${p.flagCode || '?'}</span>`;
}

// ── SURFACE CLASSES ──
function surfaceClass(s) {
  return { clay: 'surface-clay', grass: 'surface-grass', hard: 'surface-hard', indoor: 'surface-indoor' }[s] || 'surface-hard';
}

// ── RENDER MATCH CARD ──
function renderSets(match) {
  const { sets, status, currentGame } = match;
  if (!sets || sets.length === 0) return null;

  const servingP1 = match.p1.serving;
  const p1Cols = sets.map((s, i) => {
    const isLast = i === sets.length - 1 && status === 'live';
    const won = s.p1 > s.p2;
    return `<div class="set-score${won ? ' won' : ''}${isLast ? ' current-live' : ''}">${s.p1}</div>`;
  });
  const p2Cols = sets.map((s, i) => {
    const isLast = i === sets.length - 1 && status === 'live';
    const won = s.p2 > s.p1;
    return `<div class="set-score${won ? ' won' : ''}${isLast ? ' current-live' : ''}">${s.p2}</div>`;
  });

  let p1game = '', p2game = '';
  if (status === 'live' && currentGame) {
    p1game = `<div class="games-badge${servingP1 ? ' serving' : ''}">${currentGame.p1}</div>`;
    p2game = `<div class="games-badge${!servingP1 ? ' serving' : ''}">${currentGame.p2}</div>`;
  }

  return { p1: [...p1Cols, p1game].join(''), p2: [...p2Cols, p2game].join('') };
}

function renderMatch(match) {
  const { status, round, court, date, time, p1, p2, winner, currentGame } = match;
  const isLive = status === 'live';
  const isPast = status === 'past';

  const statusLabel = isLive
    ? `<span class="match-status status-live">● Live</span>`
    : isPast
    ? `<span class="match-status status-past">Completed</span>`
    : `<span class="match-status status-upcoming">Upcoming</span>`;

  const roundHtml = round ? `<span class="match-round">${round}</span>` : '';
  const courtHtml = court ? `<span class="match-court">${court}</span>` : '';

  const scoreCols = renderSets(match);
  const p1IsWinner = isPast && winner === 'p1';
  const p2IsWinner = isPast && winner === 'p2';

  const p1Rank = p1.rank ? `<span class="player-rank">#${p1.rank}</span>` : '';
  const p2Rank = p2.rank ? `<span class="player-rank">#${p2.rank}</span>` : '';

  const p1Score = scoreCols ? `<div class="score-cols">${scoreCols.p1}</div>` : '';
  const p2Score = scoreCols ? `<div class="score-cols">${scoreCols.p2}</div>` : '';
  const noScore = !scoreCols ? `<span class="score-placeholder">vs</span>` : '';

  const timeLabel = [fmtDate(date), fmtTime(match.startMs)].filter(Boolean).join(' · ');
  const footerLeft = `<span class="match-time"><span class="icon">🕐</span>${timeLabel}</span>`;
  const footerRight = isLive && currentGame
    ? `<span class="live-score-point">${currentGame.p1} – ${currentGame.p2}</span>`
    : match.duration ? `<span class="match-duration">⏱ ${match.duration}</span>` : '';

  return `
    <div class="match-card ${status}">
      <div class="card-topbar">
        ${statusLabel}
        ${roundHtml}
        ${courtHtml}
      </div>
      <div class="card-body">
        <div class="players">
          <div class="player-row ${p1IsWinner ? 'winner' : ''}">
            ${renderFlag(p1)}
            <span class="player-name">${p1.name}${p1Rank}</span>
            ${scoreCols ? p1Score : noScore}
          </div>
          <div class="player-divider"></div>
          <div class="player-row ${p2IsWinner ? 'winner' : ''}">
            ${renderFlag(p2)}
            <span class="player-name">${p2.name}${p2Rank}</span>
            ${scoreCols ? p2Score : ''}
          </div>
        </div>
      </div>
      <div class="card-footer">
        ${footerLeft}
        ${footerRight}
      </div>
    </div>`;
}

function renderTournamentGroup(tournament, matches) {
  const { name, location, surface, flag } = tournament;
  return `
    <div class="tournament-group">
      <div class="tournament-header">
        <span class="tournament-flag">${flag}</span>
        <div class="tournament-info">
          <div class="tournament-name">${name}</div>
          ${location ? `<div class="tournament-meta">${location}</div>` : ''}
        </div>
        ${surface ? `<span class="tournament-surface ${surfaceClass(surface)}">${surface}</span>` : ''}
      </div>
      ${matches.map(renderMatch).join('')}
    </div>`;
}

function groupByTournament(matches) {
  const map = new Map();
  matches.forEach(m => {
    const key = m.tournament.id;
    if (!map.has(key)) map.set(key, { tournament: m.tournament, matches: [] });
    map.get(key).matches.push(m);
  });
  return [...map.values()];
}

function renderGroups(matches) {
  if (!matches.length) return renderEmpty();
  return groupByTournament(matches).map(g => renderTournamentGroup(g.tournament, g.matches)).join('');
}

function renderEmpty(msg = 'No matches right now.') {
  return `<div class="empty-state"><div class="icon">🎾</div><p>${msg}</p></div>`;
}

function renderSkeleton(count = 3) {
  return Array.from({ length: count }, () => `<div class="skeleton-card"><div class="sk sk-line wide"></div><div class="sk sk-line med"></div><div class="sk sk-line short"></div></div>`).join('');
}

function renderError(msg) {
  return `<div class="error-state"><div class="icon">⚠️</div><p>${msg}</p><button class="retry-btn" onclick="loadAll()">Retry</button></div>`;
}

// ── DATA FETCHING ──

let cache = { live: null, today: null, yesterday: null };

async function fetchAllMatches() {
  const res = await fetch('/api/matches');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json(); // { live, upcoming, past }
}

// ── RENDER TABS ──

function renderLiveTab(matches) {
  if (!matches.length) return renderEmpty('No live matches at the moment.');
  return renderGroups(matches);
}

function renderUpcomingTab(upcoming) {
  if (!upcoming.length) return renderEmpty('No upcoming matches scheduled.');

  // group by date
  const byDate = new Map();
  upcoming.forEach(m => {
    const k = localDateFromMs(m.startMs) || m.date || 'Unknown date';
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k).push(m);
  });

  return [...byDate.entries()].map(([date, matches]) => {
    return `<div class="section-label">${fmtDate(date)}</div>${renderGroups(matches)}`;
  }).join('');
}

function renderResultsTab(past) {
  if (!past.length) return renderEmpty('No results yet today.');

  const sorted = [...past].sort((a, b) => (b.startMs || 0) - (a.startMs || 0));

  const byDate = new Map();
  sorted.forEach(m => {
    const k = localDateFromMs(m.startMs) || m.date || 'Unknown date';
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k).push(m);
  });

  return [...byDate.entries()].map(([date, matches]) => {
    return `<div class="section-label">${fmtDate(date)}</div>${renderGroups(matches)}`;
  }).join('');
}

// ── MAIN LOAD ──

let refreshTimer = null;

async function loadAll() {
  document.getElementById('tab-live').innerHTML     = renderSkeleton(3);
  document.getElementById('tab-upcoming').innerHTML = renderSkeleton(4);
  document.getElementById('tab-past').innerHTML     = renderSkeleton(3);

  try {
    const data = await fetchAllMatches();
    document.getElementById('tab-live').innerHTML     = renderLiveTab(data.live || []);
    document.getElementById('tab-upcoming').innerHTML = renderUpcomingTab(data.upcoming || []);
    document.getElementById('tab-past').innerHTML     = renderResultsTab(data.past || []);
    updateLiveBadge((data.live || []).length);
  } catch (err) {
    ['tab-live', 'tab-upcoming', 'tab-past'].forEach(id => {
      document.getElementById(id).innerHTML = renderError(err.message);
    });
  }
}

async function refreshLive() {
  try {
    const data = await fetchAllMatches();
    document.getElementById('tab-live').innerHTML = renderLiveTab(data.live || []);
    updateLiveBadge((data.live || []).length);
  } catch (e) { /* silent */ }
}

function updateLiveBadge(count) {
  const btn = document.querySelector('[data-tab="live"]');
  const existing = btn.querySelector('.live-count');
  if (count > 0) {
    if (!existing) {
      const badge = document.createElement('span');
      badge.className = 'live-count';
      badge.textContent = count;
      btn.appendChild(badge);
    } else {
      existing.textContent = count;
    }
  } else {
    if (existing) existing.remove();
  }
}

// ── THEME TOGGLE ──

(function () {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored ? stored === 'dark' : prefersDark;

  function apply(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    btn.textContent = dark ? '☀︎' : '☾';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  apply(isDark);
  btn.addEventListener('click', () => apply(root.getAttribute('data-theme') !== 'dark'));
})();

// ── INIT ──


// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

loadAll();

// Auto-refresh live data every 30 seconds
setInterval(refreshLive, 30_000);
