import { defineContract, type ContractBase } from '../_base.js';

/** 요약에 서는 오류 하나. id는 고칠 칸(입력 요소)의 id */
export interface ErrorSummaryItem {
  id: string;
  /** 칸 이름(Field label) */
  label: string;
  /** 무엇을 하면 되는지(합니다체 · 해라체 짧은 문장) */
  message: string;
}

export interface ErrorSummaryProps extends ContractBase {
  /** 비어 있으면 아무것도 그리지 않는다 */
  errors: readonly ErrorSummaryItem[];
  /** 제목. 없으면 "확인할 항목 N개" */
  title?: string;
  /** 이 값이 바뀌고 오류가 있으면 요약으로 포커스를 옮긴다(제출 횟수를 넘긴다) */
  focusKey?: number;
  /** 항목을 누를 때. 기본은 그 칸으로 포커스 · 스크롤 */
  onSelect?: (item: ErrorSummaryItem) => void;
}

export const ErrorSummaryContract = defineContract<ErrorSummaryProps>({
  name: 'ErrorSummary',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    errors: {
      type: 'ErrorSummaryItem[]',
      required: true,
      description: '오류 목록(칸 id · 이름 · 문장)',
    },
    title: { type: 'string', description: '제목(없으면 "확인할 항목 N개")' },
    focusKey: { type: 'number', description: '바뀌면 요약으로 포커스(제출 횟수)' },
    onSelect: { type: '(item) => void', description: '항목을 누를 때(기본은 칸으로 이동)' },
  },
  states: ['default', 'focus'],
  a11y: { role: 'alert', keyboard: ['Tab', 'Enter'], labelling: 'children' },
  platforms: { web: true, native: true },
});
