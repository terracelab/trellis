import { defineContract, type ContractBase } from '../_base.js';

export interface FilterBarProps extends ContractBase {
  /** 필터 컨트롤(Select · MultiSelect · 기간). 한 줄, 좁으면 줄바꿈. 화면이 좁으면 칩 가로 줄 + 시트 */
  children?: unknown;
  /** 맨 앞 검색 입력 */
  search?: unknown;
  /** 있으면 초기화 버튼을 보인다 */
  onReset?: () => void;
  /** 검색 결과 건수 */
  resultCount?: number;
  /** 기본값에서 바꾼 필터 수. 좁은 화면의 필터 버튼에 보인다(필터 2) */
  activeCount?: number;
  /** 오른쪽 동작(엑셀 다운로드 · 등록) */
  actions?: unknown;
  /** inline = 한 줄 도구 줄(기본), grid = 라벨 열 + 입력 칸 격자 + 검색 단추 줄(조건을 고른 뒤 검색하는 조회 화면)(PR-26) */
  layout?: 'inline' | 'grid';
  /** grid 한 줄 칸 수 */
  columns?: 2 | 3;
  /** grid의 검색 단추(있으면 보인다). 입력 칸에서 Enter도 같은 일을 한다 */
  onSearch?: () => void;
  /** grid 검색 중: 검색 단추가 로딩 모양이 되고 다시 누를 수 없다(PR-30) */
  searching?: boolean;
  /** grid 접기 단추. 접으면 격자 대신 적용한 조건을 칩 한 줄로 요약한다(PR-30) */
  collapsible?: boolean;
  /**
   * 칩 해제(×) 단추를 누를 때(PR-30). name = 컨트롤의 name, 없으면 label.
   * 없으면 컨트롤의 onChange에 기본값을 보낸다(Select = 첫 선택지 값, MultiSelect = 빈 목록)
   */
  onClearFilter?: (name: string) => void;
  /**
   * 검색 영역(role="search")의 이름. 없으면 "검색 조건". 한 화면에 FilterBar가 둘 이상이면
   * 묶음마다 다른 이름을 준다(같은 이름의 영역이 둘이면 보조 기술에서 구별되지 않는다)
   */
  label?: string;
}

export const FilterBarContract = defineContract<FilterBarProps>({
  name: 'FilterBar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    children: { type: 'ReactNode', description: '필터 컨트롤' },
    search: { type: 'ReactNode', description: '맨 앞 검색 입력' },
    onReset: { type: '() => void', description: '초기화(있으면 버튼 표시)' },
    resultCount: { type: 'number', description: '검색 결과 건수' },
    activeCount: { type: 'number', description: '바꾼 필터 수(좁은 화면 필터 버튼)' },
    actions: { type: 'ReactNode', description: '오른쪽 동작' },
    layout: {
      type: "'inline' | 'grid'",
      default: 'inline',
      values: ['inline', 'grid'],
      description: '한 줄 도구 줄 · 라벨 격자(조회 화면)',
    },
    columns: { type: '2 | 3', default: 2, values: ['2', '3'], description: 'grid 한 줄 칸 수' },
    onSearch: { type: '() => void', description: 'grid 검색 단추 · 입력 칸 Enter' },
    searching: {
      type: 'boolean',
      default: false,
      description: 'grid 검색 중(검색 단추 로딩)',
    },
    collapsible: {
      type: 'boolean',
      default: false,
      description: 'grid 접기(접으면 적용한 조건을 칩으로 요약)',
    },
    onClearFilter: {
      type: '(name: string) => void',
      description: '칩 해제 단추(없으면 컨트롤 onChange에 기본값)',
    },
    label: {
      type: 'string',
      description: '검색 영역 이름(없으면 "검색 조건", 한 화면에 둘 이상이면 따로)',
    },
  },
  states: ['default'],
  a11y: {
    role: 'search',
    keyboard: ['Tab', 'Enter(grid 검색)', 'Space · Enter(칩 해제 · 접기 단추)'],
    labelling: 'aria-label',
  },
  slots: ['search', 'actions'],
  platforms: { web: true, native: true },
});
