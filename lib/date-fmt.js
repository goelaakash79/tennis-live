export function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayStr() {
  return localDateStr();
}

export function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

export function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return localDateStr(d);
}

export function localDateFromMs(ms) {
  return ms ? localDateStr(new Date(ms)) : null;
}

export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const today = todayStr();
  const yesterday = yesterdayStr();
  const tomorrow = tomorrowStr();
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function fmtTime(startMs) {
  if (!startMs) return '';
  return new Date(startMs).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
