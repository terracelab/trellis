import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { StatusTone } from '../_shared/vocab.js';

export interface TimelineItem {
  id: string;
  /** 무슨 일이 있었는지(입고 완료 · 반려 · 실행 실패) */
  title: string;
  description?: string;
  /** 이미 서식을 맞춘 시각 글자(2026-11-07 14:20 · 09:12) */
  time: string;
  /** 처리한 사람 · 시스템 */
  actor?: string;
  /** 점 색. 어휘(vocab.ts)의 tone */
  tone?: StatusTone;
  /** 점 대신 아이콘 */
  icon?: IconName;
}

export interface TimelineProps extends ContractBase {
  /** 위에서 아래로 그린다(최신을 위에 둘지는 화면이 정한다) */
  items: readonly TimelineItem[];
  /** 행 간격을 줄인다(배치 실행 로그처럼 줄이 많을 때) */
  dense?: boolean;
  /** 목록 이름(결재 이력 · 입고 처리 이력) */
  ariaLabel?: string;
}

export const TimelineContract = defineContract<TimelineProps>({
  name: 'Timeline',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: {
      type: '{ id; title; description?; time; actor?; tone?: StatusTone; icon?: IconName }[]',
      required: true,
      description: '이력 항목',
    },
    dense: { type: 'boolean', default: false, description: '촘촘한 간격' },
    ariaLabel: { type: 'string', description: '목록 이름' },
  },
  states: ['default'],
  a11y: { role: 'list', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
