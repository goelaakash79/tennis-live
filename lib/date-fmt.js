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

/** 12h clock, uppercase AM/PM — same on Node and browsers (avoids hydration mismatch from `[]` locale). */
export function fmtTime(startMs) {
  if (!startMs) return '';
  const d = new Date(startMs);
  const h24 = d.getHours();
  const m = d.getMinutes();
  const isPm = h24 >= 12;
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${isPm ? 'PM' : 'AM'}`;
}
