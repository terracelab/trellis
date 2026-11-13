import { defineContract, type ContractBase } from '../_base.js';

/** done = 완료, current = 지금 단계, todo = 남은 단계, error = 멈춘 단계(반려 · 실패) */
export type StepperStepState = 'done' | 'current' | 'todo' | 'error';

export interface StepperStep {
  id: string;
  /** 명사 2~6자(주문 접수 · 검수 · 입고 완료) */
  label: string;
  /** 시각 · 담당자 · 사유 한 줄 */
  description?: string;
  state: StepperStepState;
}

export interface StepperProps extends ContractBase {
  steps: readonly StepperStep[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
  /** 목록 이름(aria-label) */
  label?: string;
}

export const StepperContract = defineContract<StepperProps>({
  name: 'Stepper',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    steps: { type: 'StepperStep[]', required: true, description: '단계(이름 · 설명 · 상태)' },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      values: ['horizontal', 'vertical'],
      description: '방향',
    },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '크기' },
    label: { type: 'string', default: '진행 단계', description: '목록 이름(aria-label)' },
  },
  states: ['default'],
  a11y: { role: 'list', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
