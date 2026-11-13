import { RunSteps, type RunStepWeb } from './RunSteps.js';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 9)' };

const ALL: RunStepWeb[] = [
  {
    id: 's1',
    name: '전표 조회',
    description: '11월 · 미지급금',
    state: 'succeeded',
    durationMs: 1240,
  },
  { id: 's2', name: '거래처 원장 대사', state: 'failed', durationMs: 3800 },
  { id: 's3', name: '단가 변경 제안', description: '한빛식품 3품목', state: 'waiting' },
  { id: 's4', name: '세금계산서 확인', state: 'running', durationMs: 5200 },
  { id: 's5', name: '지급 예정표 작성', state: 'queued' },
  { id: 's6', name: '결재 요청 작성', state: 'canceled' },
];

/** 실행 상태 6개 — 대기 · 실행 중 · 확인 대기 · 완료 · 실패 · 중단. 상태는 점 색과 글자로 함께 보인다 */
export function AllStates() {
  return (
    <div style={BOX}>
      <RunSteps steps={ALL} />
    </div>
  );
}

const DONE: RunStepWeb[] = [
  {
    id: 'd1',
    name: '규정 문서 찾기',
    description: '취업규칙 · 연차 기준',
    state: 'succeeded',
    durationMs: 820,
  },
  {
    id: 'd2',
    name: '연차 사용 현황 조회',
    description: '인사팀 · 2025',
    state: 'succeeded',
    durationMs: 2140,
  },
  { id: 'd3', name: '답변 작성', state: 'succeeded', durationMs: 4300 },
];

/** 요약 한 줄 — 답변 위에서는 접어 둔다. 상태 · 단계 수 · 걸린 시간이 보이고 누르면 펼쳐진다 */
export function Collapsed() {
  return (
    <div style={BOX}>
      <RunSteps steps={DONE} collapsible />
    </div>
  );
}

const FAILED: RunStepWeb[] = [
  { id: 'f1', name: '전표 조회', state: 'succeeded', durationMs: 960 },
  {
    id: 'f2',
    name: '거래처 원장 대사',
    description: '한빛식품',
    state: 'failed',
    durationMs: 3800,
    detail: '거래처 원장을 불러오지 못했습니다. 11월 원장이 아직 마감되지 않았습니다.',
  },
  {
    id: 'f3',
    name: '단가 변경 제안',
    state: 'waiting',
    detail: '담당자 확인을 기다립니다. 확인 대기 카드에서 승인하면 다음 단계로 넘어갑니다.',
  },
];

/** 펼친 상세 — 실패 · 확인 대기 단계는 처음부터 펼쳐 둔다. 줄을 누르면 접고 편다 */
export function Details() {
  return (
    <div style={BOX}>
      <RunSteps steps={FAILED} collapsible defaultOpen />
    </div>
  );
}
