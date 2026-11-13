import { Spinner } from './Spinner.js';

/** 크기 — 16 · 20 · 24 */
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-16)', alignItems: 'center' }}>
      <Spinner />
      <Spinner size={20} />
      <Spinner size={24} label="세금계산서 발행 중" />
    </div>
  );
}
