import { defineContract, type ContractBase } from '../_base.js';
import type { DeltaFormat } from '../_shared/format.js';

/** finance = 증가 finance.income(빨강) · 감소 finance.expense(파랑). up-good · up-bad = 상태 아이콘 + 중립 글자 */
export type DeltaPolarity = 'finance' | 'up-good' | 'up-bad';

export interface DeltaProps extends ContractBase {
  /** 증감 값(+ 증가 · − 감소). percent면 12.4 = 12.4%, point면 0.3 = 0.3%p(비율끼리의 차이) */
  value: number;
  /** 서식(contracts formatDelta). 기본 percent */
  format?: DeltaFormat;
  /** 색이 말하는 방향의 뜻. 기본 finance(한국 관습: 증가 빨강 · 감소 파랑) */
  polarity?: DeltaPolarity;
  /** 비교 대상(전월 대비 · 전일 대비 · 전년 동기 대비). 값 앞에 둔다 */
  label?: string;
  /** number 서식의 단위(건 · EA). amount는 원 */
  unit?: string;
  /** 소수 자릿수. 기본 percent · point 1, amount · number 0 */
  digits?: number;
  /** sm = 카드 · 표 칸 보조(caption 글자), md = 본문 글자 */
  size?: 'sm' | 'md';
}

export const DeltaContract = defineContract<DeltaProps>({
  name: 'Delta',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'number', required: true, description: '증감 값(+ 증가 · − 감소)' },
    format: {
      type: "'percent' | 'point' | 'amount' | 'number'",
      default: 'percent',
      values: ['percent', 'point', 'amount', 'number'],
      description: '서식(percent 12.4% · point 0.3%p · amount 원 · number 단위)',
    },
    polarity: {
      type: "'finance' | 'up-good' | 'up-bad'",
      default: 'finance',
      values: ['finance', 'up-good', 'up-bad'],
      description: '색의 뜻(finance = 증가 빨강 · 감소 파랑)',
    },
    label: { type: 'string', description: '비교 대상(전월 대비)' },
    unit: { type: 'string', description: 'number 서식의 단위(건 · EA)' },
    digits: { type: 'number', description: '소수 자릿수(percent · point 1, 그 밖 0)' },
    size: {
      type: "'sm' | 'md'",
      default: 'md',
      values: ['sm', 'md'],
      description: '글자 크기(sm caption · md 본문)',
    },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  platforms: { web: true, native: true },
});
