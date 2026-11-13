import { IssueList } from './IssueList.js';

const ISSUES = [
  {
    id: 'w1',
    level: 'warning' as const,
    tag: '5행',
    title: '단가가 지난 발주보다 18% 높습니다',
    message: '거래처 단가표를 확인하세요',
  },
  {
    id: 'e1',
    level: 'error' as const,
    tag: '3행',
    title: '단가가 0원입니다',
    message: '단가를 넣거나 줄을 삭제하세요',
  },
  { id: 'e2', level: 'error' as const, tag: '거래처', title: '사업자등록번호가 없습니다' },
  { id: 'w2', level: 'warning' as const, tag: '7행', title: '유통기한이 30일 남았습니다' },
];

/** 저장 전 — 오류가 먼저, 그다음 경고. 항목을 누르면 그 행으로 간다 */
export function BeforeSave() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <IssueList title="저장 전 확인" items={ISSUES} onSelect={() => {}} />
    </div>
  );
}

/** 자세히 — 항목마다 규칙 설명을 여는 자세히 단추 */
export function WithDetail() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <IssueList items={ISSUES.slice(0, 2)} onSelect={() => {}} onDetail={() => {}} />
    </div>
  );
}

/** 상태 — 검증 중은 Skeleton 목록, 항목이 없으면 문구 한 줄, 길면 maxHeight 안에서 스크롤 */
export function States() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4)), 1fr))',
        gap: 'var(--tl-space-24)',
      }}
    >
      <IssueList items={[]} loading />
      <IssueList items={[]} empty="저장할 수 있습니다. 확인할 항목이 없습니다" />
      <IssueList items={ISSUES} maxHeight="calc(var(--tl-space-64) * 2)" />
    </div>
  );
}
