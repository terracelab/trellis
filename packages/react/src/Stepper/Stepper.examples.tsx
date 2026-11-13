import { Stepper } from './Stepper.js';

const ORDER_STEPS = [
  { id: 'received', label: '주문 접수', description: '11-03 09:12', state: 'done' },
  { id: 'paid', label: '결제 확인', description: '11-03 09:40', state: 'done' },
  { id: 'picking', label: '피킹 · 검수', description: '이천 1센터', state: 'current' },
  { id: 'shipping', label: '출고', state: 'todo' },
  { id: 'delivered', label: '배송 완료', state: 'todo' },
] as const;

const RECEIVING_STEPS = [
  { id: 'arrived', label: '도착', description: '11-06 14:20 · 부산 신항 보세창고', state: 'done' },
  {
    id: 'inspecting',
    label: '검수',
    description: '수량 차이 12EA · 거래처 확인 요청',
    state: 'error',
  },
  { id: 'putaway', label: '적치', state: 'todo' },
  { id: 'received', label: '입고 완료', state: 'todo' },
] as const;

/** 주문 단계 — 지금 단계는 링, 끝난 단계는 체크와 진한 선 */
export function OrderStages() {
  return <Stepper steps={ORDER_STEPS} label="주문 단계" />;
}

/** 입고 처리(세로) — 좁은 패널에서는 세로로, 멈춘 단계는 위험 색 */
export function ReceivingVertical() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 4)' }}>
      <Stepper steps={RECEIVING_STEPS} orientation="vertical" size="sm" label="입고 처리" />
    </div>
  );
}
