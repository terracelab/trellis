import { Button } from '../Button/Button.js';
import { Card } from './Card.js';

const grid = {
  display: 'grid',
  gap: 'var(--tl-space-16)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
  alignItems: 'stretch',
} as const;

/** 무게 세 단계 — strong은 "지금 해야 할 것" 한 구역에만, 보통 카드, quiet는 참고 정보(테두리 · 면 없이) */
export function Emphasis() {
  return (
    <div style={grid}>
      <Card
        emphasis="strong"
        tone="danger"
        title="지난 기한 2건"
        subtitle="오늘 처리할 것"
        action={
          <Button size="sm" variant="ghost" iconEnd="chevron-right">
            전체
          </Button>
        }
      >
        10월 원천세 신고 · 2일 경과
        <br />
        4대보험 취득신고(이서연) · 1일 경과
      </Card>
      <Card title="이번 주 일정" subtitle="11월 2주" footer="합계 5건">
        11월 10일(화) 급여 지급
        <br />
        11월 12일(목) 부가세 예정신고
      </Card>
      <Card emphasis="quiet" title="참고" subtitle="지난달 같은 주">
        일정 4건 · 모두 완료
      </Card>
    </div>
  );
}

/** 기본 — 제목 · 기준 · 우상단 동작 · 아래 합계 */
export function Default() {
  return (
    <Card
      title="이번 주 입고 예정"
      subtitle="11월 2주 · 거래처 6곳"
      action={
        <Button size="sm" variant="ghost" iconEnd="chevron-right">
          전체
        </Button>
      }
      footer="합계 18건 · 4,820EA"
    >
      입고 예정 목록이 여기에 온다
    </Card>
  );
}

/** 본문 없는 카드 — 내용이 없으면 footer가 제목 바로 아래에 붙고, 격자에서 늘어난 높이는 카드 아래에 남는다 */
export function NoBody() {
  return (
    <div style={grid}>
      <Card title="미결 결재" subtitle="내 차례" footer="결재할 문서가 없습니다" />
      <Card title="이번 달 입사자" subtitle="11월" footer="2명 · 온보딩 진행 중">
        김테라 · 영업팀
        <br />
        박하나 · 회계팀
        <br />첫 출근 안내 메일 보냄
      </Card>
    </div>
  );
}
