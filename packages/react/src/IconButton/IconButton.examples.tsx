import { IconButton } from './IconButton.js';

/** 글로벌 바 — 알림 카운트는 위험 색, 나머지는 회색 */
export function GlobalBar() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
      <IconButton icon="bell" label="알림" count={12} />
      <IconButton icon="mail" label="메일" count={3} countTone="neutral" />
      <IconButton icon="settings" label="설정" />
      <IconButton icon="ellipsis" label="더 보기" variant="secondary" />
    </div>
  );
}
