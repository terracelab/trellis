import { RECEIVING_STATES } from '@terracelab/trellis-contracts';
import { Timeline } from './Timeline.js';

const RECEIVING = [
  {
    id: 'r4',
    title: RECEIVING_STATES.received.label,
    description: '냉동 새우 2kg 240EA · A구역 3번 로케이션',
    time: '2026-11-07 14:20',
    actor: '정물류',
    tone: RECEIVING_STATES.received.tone,
    icon: 'package-check' as const,
  },
  {
    id: 'r3',
    title: RECEIVING_STATES.inspecting.label,
    description: '유통기한 2027-05-30 확인 · 파손 2EA 반품 대기',
    time: '2026-11-07 13:05',
    actor: '이검수',
    tone: RECEIVING_STATES.inspecting.tone,
  },
  {
    id: 'r2',
    title: RECEIVING_STATES.arrived.label,
    time: '2026-11-07 11:40',
    actor: '(주)한빛식자재',
    tone: RECEIVING_STATES.arrived.tone,
    icon: 'truck' as const,
  },
  {
    id: 'r1',
    title: RECEIVING_STATES.scheduled.label,
    description: '발주번호 PO-2611-0142',
    time: '2026-11-05 09:00',
    actor: '이구매',
    tone: RECEIVING_STATES.scheduled.tone,
  },
];

const APPROVAL = [
  {
    id: 'a3',
    title: '반려',
    description: '반려 사유 · 견적서 2부 첨부 누락',
    time: '11월 6일(금) 16:10',
    actor: '최회계 부장',
    tone: 'danger' as const,
  },
  {
    id: 'a2',
    title: '승인',
    time: '11월 6일(금) 10:32',
    actor: '박영업 팀장',
    tone: 'success' as const,
  },
  {
    id: 'a1',
    title: '결재 요청',
    time: '11월 5일(목) 17:45',
    actor: '김테라 대리',
    tone: 'info' as const,
  },
];

/** 입고 처리 이력 — 어휘의 tone과 라벨을 그대로 쓴다 */
export function Receiving() {
  return <Timeline ariaLabel="입고 처리 이력" items={RECEIVING} />;
}

/** 결재 이력 — 반려는 색과 제목 글자로 함께 말한다 */
export function Approval() {
  return <Timeline ariaLabel="결재 이력" items={APPROVAL} dense />;
}
