export function formatTime(ts: number, locale = 'zh-CN'): string {
  const date = new Date(ts);
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatSessionTime(ts: number, locale = 'zh-CN'): string {
  const now = Date.now();
  const diff = now - ts;

  if (diff < 60_000) {
    return locale.startsWith('zh') ? '刚刚' : 'now';
  }

  if (diff < 3_600_000) {
    const mins = Math.floor(diff / 60_000);
    return locale.startsWith('zh') ? `${mins}分钟前` : `${mins}m ago`;
  }

  return formatTime(ts, locale);
}
