import { Avatar } from './Avatar.js';

/** 크기 — 표 행 24 · 목록 32 · 결재선 40 · 프로필 48 */
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)', alignItems: 'center' }}>
      <Avatar name="김테라" size={24} />
      <Avatar name="김테라" size={32} />
      <Avatar name="김테라" size={40} />
      <Avatar name="김테라" size={48} />
    </div>
  );
}

/** 근무 상태 — 메신저 · 조직도의 우하단 점과 접근성 이름 */
export function Status() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)', alignItems: 'center' }}>
      <Avatar name="박영업" status="online" />
      <Avatar name="이구매" status="away" />
      <Avatar name="최회계" status="busy" />
      <Avatar name="정물류" status="offline" />
    </div>
  );
}

/** 이름 옆 — 이름 글자가 이미 있으면 장식으로 숨긴다 */
export function WithName() {
  return (
    <span style={{ display: 'inline-flex', gap: 'var(--tl-space-8)', alignItems: 'center' }}>
      <Avatar name="한결재" size={24} decorative />
      한결재 · 영업2팀 과장
    </span>
  );
}

/** 모양 · 색 — 사람은 둥근 사각형이 기본, 색은 이름으로 고른다(같은 사람 = 같은 색)(PR-27) */
export function ShapesAndTones() {
  const names = ['김테라', '이민호', '최유진', '정하늘', '한지민', '오세훈'];
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
        {names.map((n) => (
          <Avatar key={n} name={n} size={40} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
        {names.map((n) => (
          <Avatar key={n} name={n} size={40} shape="circle" />
        ))}
      </div>
    </div>
  );
}

/** 공석 — 담당자가 없는 자리. 점선 테두리 + 사람 아이콘이고 "담당자 없음"으로 읽는다. 크기 · 모양은 사람 아바타와 같다 */
export function Vacant() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-8)' }}>
        {([24, 32, 40, 48] as const).map((size) => (
          <Avatar key={size} vacant size={size} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-8)' }}>
        <Avatar name="김테라" size={32} />
        <Avatar vacant size={32} />
        <Avatar name="김테라" size={32} shape="circle" />
        <Avatar vacant size={32} shape="circle" />
      </div>
    </div>
  );
}
