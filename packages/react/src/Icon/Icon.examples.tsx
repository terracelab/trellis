import { Icon } from './Icon.js';

/** 크기 — 16 · 20 · 24. 색은 글자 색을 따른다 */
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-16)', alignItems: 'center' }}>
      <Icon name="receipt" size={16} />
      <Icon name="receipt" size={20} />
      <Icon name="receipt" size={24} label="세금계산서" />
    </div>
  );
}
