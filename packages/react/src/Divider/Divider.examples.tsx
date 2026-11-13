import { Divider } from './Divider.js';

const SECTION = { margin: 0, fontSize: 'var(--tl-type-label-font-size)' } as const;

/** 가로줄 — 묶음 사이. 여백은 spacing으로 한 번에 정한다 */
export function Basic() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <p style={SECTION}>기본 정보 · 거래처 한결물산 · 담당 정민호</p>
      <Divider spacing="md" />
      <p style={SECTION}>결제 조건 · 월말 마감 다음 달 25일 · 계좌 이체</p>
    </div>
  );
}

/** 세로줄 — 메타 글자 · 도구 줄 사이. 줄 높이를 따른다 */
export function Vertical() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        color: 'var(--tl-color-fg-secondary)',
        fontSize: 'var(--tl-type-caption-font-size)',
      }}
    >
      <span>작성 2026-11-06</span>
      <Divider orientation="vertical" spacing="sm" />
      <span>수정 2026-11-09</span>
      <Divider orientation="vertical" spacing="sm" />
      <span>조회 42</span>
    </div>
  );
}

/** 가운데 글자 · 강조 선 — 글자는 separator 이름이 된다. strong은 합계 위 · 큰 묶음 사이 */
export function Labelled() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Divider label="이전 기록" />
      <Divider variant="strong" />
      <Divider decorative />
    </div>
  );
}
