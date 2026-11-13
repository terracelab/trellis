// 업종 어휘(트랙 E PE-01, D-48). 새 업종은 새 색이 아니라 새 어휘와 status 매핑으로 들어온다.
// 라벨은 docs/spec/content.md §6 용어 사전과 같다. 결재 5어휘(APPROVAL_*)는 전자결재에만 쓴다.
import type { StatusKind } from '../_base.js';

/** 상태 색 톤. neutral = 회색(대기 · 취소 · 작성 중). status.neutral 토큰이 승인되기 전에는 fg.tertiary · bg.sunken으로 그린다 */
export type StatusTone = StatusKind | 'neutral';

export interface VocabEntry {
  label: string;
  tone: StatusTone;
}

function vocab<K extends string>(entries: Record<K, VocabEntry>) {
  return entries;
}

/** 처리 단계(작업 · 요청 · 할 일) */
export const PROGRESS_STATES = vocab({
  todo: { label: '대기', tone: 'neutral' },
  doing: { label: '진행', tone: 'info' },
  done: { label: '완료', tone: 'success' },
  hold: { label: '보류', tone: 'warning' },
  cancel: { label: '취소', tone: 'neutral' },
});
export type ProgressState = keyof typeof PROGRESS_STATES;

/** 설비 상태(제조) */
export const MACHINE_STATES = vocab({
  running: { label: '가동', tone: 'success' },
  idle: { label: '대기', tone: 'warning' },
  down: { label: '비가동', tone: 'danger' },
  maintenance: { label: '점검', tone: 'info' },
  setup: { label: '준비', tone: 'neutral' },
});
export type MachineState = keyof typeof MACHINE_STATES;

/** 품질 판정 */
export const QUALITY_RESULTS = vocab({
  pass: { label: '합격', tone: 'success' },
  fail: { label: '불합격', tone: 'danger' },
  hold: { label: '보류', tone: 'warning' },
});
export type QualityResult = keyof typeof QUALITY_RESULTS;

/** 재고 수준 */
export const STOCK_LEVELS = vocab({
  ok: { label: '정상', tone: 'success' },
  low: { label: '부족', tone: 'warning' },
  out: { label: '품절', tone: 'danger' },
  over: { label: '과다', tone: 'info' },
  expiring: { label: '임박', tone: 'warning' },
});
export type StockLevel = keyof typeof STOCK_LEVELS;

/** 주문 단계(이커머스) */
export const ORDER_STAGES = vocab({
  'paid-pending': { label: '결제 대기', tone: 'neutral' },
  paid: { label: '결제 완료', tone: 'info' },
  preparing: { label: '상품 준비', tone: 'info' },
  shipping: { label: '배송 중', tone: 'info' },
  delivered: { label: '배송 완료', tone: 'success' },
  cancelled: { label: '취소', tone: 'neutral' },
  returning: { label: '반품', tone: 'warning' },
  exchanging: { label: '교환', tone: 'warning' },
});
export type OrderStage = keyof typeof ORDER_STAGES;

/** 신고 상태(세무) */
export const FILING_STATES = vocab({
  drafting: { label: '작성 중', tone: 'neutral' },
  review: { label: '검토', tone: 'info' },
  filed: { label: '신고 완료', tone: 'success' },
  amended: { label: '수정신고', tone: 'warning' },
});
export type FilingState = keyof typeof FILING_STATES;

/** 세금계산서 상태(발행 · 국세청 전송) */
export const INVOICE_STATES = vocab({
  draft: { label: '작성 중', tone: 'neutral' },
  ready: { label: '발행 대기', tone: 'info' },
  issued: { label: '발행', tone: 'info' },
  sent: { label: '국세청 전송', tone: 'success' },
  failed: { label: '전송 실패', tone: 'danger' },
  cancelled: { label: '발행 취소', tone: 'neutral' },
});
export type InvoiceState = keyof typeof INVOICE_STATES;

/** 입고 상태(유통 · 물류) */
export const RECEIVING_STATES = vocab({
  scheduled: { label: '입고 예정', tone: 'neutral' },
  arrived: { label: '도착', tone: 'info' },
  inspecting: { label: '검수 중', tone: 'warning' },
  received: { label: '입고 완료', tone: 'success' },
  rejected: { label: '반품', tone: 'danger' },
});
export type ReceivingState = keyof typeof RECEIVING_STATES;

/** 선적 · 통관 상태(무역) */
export const SHIPMENT_STATES = vocab({
  booked: { label: '선적 예약', tone: 'neutral' },
  departed: { label: '출항', tone: 'info' },
  arrived: { label: '입항', tone: 'info' },
  customs: { label: '통관 중', tone: 'warning' },
  cleared: { label: '통관 완료', tone: 'success' },
  held: { label: '통관 보류', tone: 'danger' },
});
export type ShipmentState = keyof typeof SHIPMENT_STATES;

/** 배치 작업 실행 상태(플랫폼 기본) */
export const JOB_STATES = vocab({
  queued: { label: '대기', tone: 'neutral' },
  running: { label: '실행 중', tone: 'info' },
  succeeded: { label: '성공', tone: 'success' },
  failed: { label: '실패', tone: 'danger' },
  skipped: { label: '건너뜀', tone: 'neutral' },
});
export type JobState = keyof typeof JOB_STATES;

/**
 * 에이전트 실행 상태(D-116). 앞 네 이름(queued · running · succeeded · failed)은 JOB_STATES와 같다.
 * waiting = 사람의 확인을 기다린다(ProposalCard). 컴포넌트 상태 7어휘와 다른 축이다: 쓰는 중 표시는 loading, 실패 표시는 error
 */
export const AGENT_RUN_STATES = vocab({
  queued: { label: '대기', tone: 'neutral' },
  running: { label: '실행 중', tone: 'info' },
  waiting: { label: '확인 대기', tone: 'warning' },
  succeeded: { label: '완료', tone: 'success' },
  failed: { label: '실패', tone: 'danger' },
  canceled: { label: '중단', tone: 'neutral' },
});
export type AgentRunState = keyof typeof AGENT_RUN_STATES;
