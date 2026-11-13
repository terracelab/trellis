import { Skeleton } from './Skeleton.js';

/** 모양 — 글자 줄 · 블록 · 원 */
export function Shapes() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Skeleton lines={3} />
      <Skeleton shape="rect" height="var(--tl-space-48)" />
      <Skeleton shape="circle" width="var(--tl-size-avatar-40)" />
    </div>
  );
}

/** 목록 자리 — 실제 행과 같은 크기로 두어 다 불러온 뒤 밀리지 않게 */
export function ListPlaceholder() {
  return (
    <div aria-busy="true" style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--tl-space-12)', alignItems: 'center' }}>
          <Skeleton shape="circle" width="var(--tl-size-avatar-32)" />
          <div style={{ flex: 1 }}>
            <Skeleton lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 목록 묶음 — 아바타 + 두 줄 행. 행 높이가 실제 두 줄 행(row.heightTall)과 같다 */
export function ListShape() {
  return <Skeleton shape="list" lines={4} immediate />;
}

/** 표 묶음 — 머리 + 행 · 열. 첫 열(이름)이 넓다 */
export function TableShape() {
  return <Skeleton shape="table" lines={5} columns={6} immediate />;
}

/** 숫자 카드 · 카드 묶음 — 화면 첫 줄 KPI와 본문 카드 자리 */
export function CardShapes() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <Skeleton shape="kpi" immediate />
      <Skeleton shape="kpi" immediate />
      <Skeleton shape="kpi" immediate />
      <div style={{ gridColumn: '1 / -1' }}>
        <Skeleton shape="card" lines={4} immediate />
      </div>
    </div>
  );
}
