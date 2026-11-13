import { defineContract, type ContractBase } from '../_base.js';

export type IssueLevel = 'error' | 'warning';

export interface IssueItem {
  id: string;
  /** error = 저장을 막는다, warning = 확인만 한다 */
  level: IssueLevel;
  /** 위치 · 묶음 꼬리표(3행 · 단가 · 거래처) */
  tag?: string;
  /** 무엇이 틀렸는지 한 줄(단가가 0원입니다) */
  title: string;
  /** 어떻게 고치는지 한 문장 */
  message?: string;
}

export interface IssueListProps extends ContractBase {
  /** 검증 결과. 순서와 관계없이 오류가 먼저, 같은 단계 안에서는 받은 순서 */
  items: readonly IssueItem[];
  /** 머리 제목. 기본 "확인할 항목" */
  title?: string;
  /** 항목을 누를 때(그 행 · 칸으로 이동). 있으면 항목이 단추 */
  onSelect?: (id: string) => void;
  /** 자세히(규칙 설명 · 근거). 있으면 항목마다 "자세히" 단추 */
  onDetail?: (id: string) => void;
  /** 검증 중(Skeleton 목록) */
  loading?: boolean;
  /** 항목이 없을 때 문구. 기본 "확인할 항목이 없습니다" */
  empty?: string;
  /** 목록 최대 높이(CSS 길이). 넘으면 목록만 스크롤 */
  maxHeight?: string;
}

export const IssueListContract = defineContract<IssueListProps>({
  name: 'IssueList',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: {
      type: "{ id: string; level: 'error' | 'warning'; tag?: string; title: string; message?: string }[]",
      required: true,
      description: '검증 결과(오류가 먼저)',
    },
    title: { type: 'string', description: '머리 제목' },
    onSelect: { type: '(id: string) => void', description: '항목을 누를 때(그 행으로 이동)' },
    onDetail: { type: '(id: string) => void', description: '자세히 단추' },
    loading: { type: 'boolean', default: false, description: '검증 중(Skeleton)' },
    empty: { type: 'string', description: '항목이 없을 때 문구' },
    maxHeight: { type: 'string', description: '목록 최대 높이(CSS 길이)' },
  },
  states: ['default', 'hover', 'focus', 'loading'],
  a11y: { keyboard: ['Tab', 'Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
