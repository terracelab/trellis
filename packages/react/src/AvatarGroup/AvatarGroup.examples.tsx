import { AvatarGroup } from './AvatarGroup.js';

const MEMBERS = [
  { name: '한서연' },
  { name: '정민호' },
  { name: '박서연' },
  { name: '이도윤' },
  { name: '최하늘' },
  { name: '오세린' },
];

/** 참석자 — 자리가 넘치면 마지막 자리에 "+N". 이름은 "앞 이름들 외 N명"으로 읽는다 */
export function Basic() {
  return <AvatarGroup people={MEMBERS} max={4} />;
}

/** 크기 · 모양 — 24는 표 칸 · 카드, 32 · 40은 머리. 원은 사람 칩과 맞출 때 */
export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)', justifyItems: 'start' }}>
      <AvatarGroup people={MEMBERS} size={24} />
      <AvatarGroup people={MEMBERS} size={32} max={5} />
      <AvatarGroup people={MEMBERS.slice(0, 3)} size={40} shape="circle" label="결재자 3명" />
    </div>
  );
}

/** 목록 안 — 방 이름 옆에 멤버를 겹쳐 보인다. 넘친 사람 이름은 +N을 가리키면 보인다 */
export function InRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--tl-space-12)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <span style={{ flex: 1, fontWeight: 'var(--tl-font-weight-600)' }}>11월 영업 회의</span>
      <AvatarGroup people={MEMBERS} max={3} label={`참석자 ${MEMBERS.length}명`} />
    </div>
  );
}
