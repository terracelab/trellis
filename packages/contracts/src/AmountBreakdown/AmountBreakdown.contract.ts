import { defineContract, type ContractBase } from '../_base.js';

/** 줄 앞 기호. 빼기는 U+2212(−). '='는 합계 줄 */
export type AmountBreakdownOp = '+' | '−' | '=';

export interface AmountBreakdownRow {
  key: string;
  /** 항목 이름(기본급 · 공제 합계 · 실지급액) */
  label: string;
  /** 금액. 빼는 줄도 크기(양수)로 넘기고 op로 뺀다 */
  value: number;
  /** 앞 기호. 첫 줄은 생략, 합계 줄은 '=' */
  op?: AmountBreakdownOp;
  /** 계산 근거 한 줄(공급가액의 10% · 2.5시간 × 1.5배) */
  hint?: string;
}

export type AmountBreakdownStatus = 'idle' | 'calculating' | 'updated' | 'error';

export interface AmountBreakdownProps extends ContractBase {
  rows: readonly AmountBreakdownRow[];
  /** 제목(명사구). 없으면 접근성 이름만 "금액 계산" */
  title?: string;
  /** 금액 단위. 머리에 한 번만 "단위 원"(칸마다 붙이지 않는다) */
  unit?: string;
  /** 지금 고치는 입력과 이어진 줄. 바탕이 한 단계 올라간다 */
  activeKey?: string;
  /** 금액 자리에 Skeleton(라벨은 그대로) */
  loading?: boolean;
  /** 계산 상태: calculating = 계산 중, updated = updatedAt 기준, error = 오류 + 다시 계산 */
  status?: AmountBreakdownStatus;
  /** status = updated일 때 보일 시각 글자(14:32) */
  updatedAt?: string;
  /** status = error일 때 다시 계산 단추 */
  onRecalculate?: () => void;
}

export const AmountBreakdownContract = defineContract<AmountBreakdownProps>({
  name: 'AmountBreakdown',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    rows: {
      type: "{ key: string; label: string; value: number; op?: '+' | '−' | '='; hint?: string }[]",
      required: true,
      description: '줄 목록(위에서 아래로 계산 순서)',
    },
    title: { type: 'string', description: '제목' },
    unit: { type: 'string', description: '금액 단위(머리에 한 번)' },
    activeKey: { type: 'string', description: '바탕을 올릴 줄 key' },
    loading: { type: 'boolean', default: false, description: '금액 자리 Skeleton' },
    status: {
      type: "'idle' | 'calculating' | 'updated' | 'error'",
      default: 'idle',
      values: ['idle', 'calculating', 'updated', 'error'],
      description: '계산 상태',
    },
    updatedAt: { type: 'string', description: 'updated 기준 시각 글자' },
    onRecalculate: { type: '() => void', description: '다시 계산(status = error)' },
  },
  states: ['default', 'loading', 'error'],
  a11y: { keyboard: ['Tab', 'Enter'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
