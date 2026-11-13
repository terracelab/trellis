import { defineContract, type ContractBase } from '../_base.js';

export interface SectionHeaderProps extends ContractBase {
  /** 구역 제목(카드 묶음 · 표 위). 사용자의 말로 */
  title: unknown;
  /** 건수. 제목 뒤 흐린 글자("12건"). 단위가 건이 아니면 countLabel */
  count?: number;
  /** 건수 글자를 바꿀 때(예: "3명"). count보다 이것이 이긴다 */
  countLabel?: string;
  /** 제목 아래 한 줄 설명 */
  description?: unknown;
  /** 오른쪽 동작(전체 보기 · 추가). 단추 하나 */
  action?: unknown;
  /** 제목 단계. 없으면 문맥(화면 바로 아래 h2) */
  headingLevel?: 2 | 3 | 4;
  /** 아래 내용(카드 묶음). 주면 그 안 카드 제목이 한 단계 아래가 된다 */
  children?: unknown;
}

export const SectionHeaderContract = defineContract<SectionHeaderProps>({
  name: 'SectionHeader',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'ReactNode', required: true, description: '구역 제목' },
    count: { type: 'number', description: '건수(제목 뒤 흐린 글자)' },
    countLabel: { type: 'string', description: '건수 글자(단위가 건이 아닐 때)' },
    description: { type: 'ReactNode', description: '제목 아래 설명' },
    action: { type: 'ReactNode', description: '오른쪽 동작' },
    headingLevel: {
      type: '2 | 3 | 4',
      values: ['2', '3', '4'],
      description: '제목 단계(없으면 문맥: 화면 h2)',
    },
    children: { type: 'ReactNode', description: '아래 내용(안 카드 제목이 한 단계 아래)' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  slots: ['action'],
  platforms: { web: true, native: true },
});
