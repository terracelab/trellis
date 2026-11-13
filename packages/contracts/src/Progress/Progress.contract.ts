import { defineContract, type ContractBase } from '../_base.js';
import type { StatusTone } from '../_shared/vocab.js';

export interface ProgressProps extends ContractBase {
  /** 현재 값. null이면 끝을 모르는 진행(막대가 오간다) */
  value: number | null;
  max?: number;
  /** 무엇의 진행인지(명사): 엑셀 업로드 · 월 마감 체크리스트 */
  label: string;
  /** 오른쪽 값 글자(62% 또는 124 / 200건) */
  showValue?: boolean;
  /** 있으면 "값 / 최댓값 + 단위", 없으면 퍼센트 */
  unit?: string;
  /** 상태 톤. 없으면 brand(일반 진행) */
  tone?: StatusTone;
  size?: 'sm' | 'md';
}

export const ProgressContract = defineContract<ProgressProps>({
  name: 'Progress',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'number | null', required: true, description: '현재 값(null = 끝을 모름)' },
    max: { type: 'number', default: 100, description: '최댓값' },
    label: { type: 'string', required: true, description: '무엇의 진행인지' },
    showValue: { type: 'boolean', default: true, description: '값 글자 표시' },
    unit: { type: 'string', description: '단위(있으면 값 / 최댓값)' },
    tone: {
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      values: ['neutral', 'info', 'success', 'warning', 'danger'],
      description: '막대 색(없으면 brand)',
    },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '막대 굵기' },
  },
  states: ['default'],
  a11y: { role: 'progressbar', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
