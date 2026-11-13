import { Button } from '../Button/Button.js';
import { Card } from '../Card/Card.js';
import { SectionHeader } from './SectionHeader.js';

const grid = {
  display: 'grid',
  gap: 'var(--tl-space-16)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
} as const;

/** 카드 묶음 위 — 구역 제목 · 건수 · 설명 · 동작 하나. 묶음을 감싸면 안 카드 제목이 한 단계 아래(h3)가 된다 */
export function Default() {
  return (
    <SectionHeader
      title="이번 달 기한"
      count={12}
      description="11월 신고 · 납부 · 갱신"
      action={
        <Button size="sm" variant="ghost" iconEnd="chevron-right">
          전체 보기
        </Button>
      }
    >
      <div style={grid}>
        <Card title="Operations" subtitle="4건">
          계약 갱신 · 인증 연장
        </Card>
        <Card title="Numbers" subtitle="5건">
          원천세 · 부가세 예정신고
        </Card>
        <Card title="Employees" subtitle="3건">
          4대보험 취득신고
        </Card>
      </div>
    </SectionHeader>
  );
}

/** 제목만 — 표 위에 놓는 짧은 머리. 단위가 건이 아니면 countLabel */
export function Plain() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-24)' }}>
      <SectionHeader title="구성원" countLabel="8명" />
      <SectionHeader title="참고 자료" description="지난 분기 보고서와 규정" />
    </div>
  );
}
