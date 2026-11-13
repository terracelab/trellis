import { defineContract, type ContractBase } from '../_base.js';
import type { CurrencyCode } from '../_shared/format.js';

export type ColumnFormat =
  'text' | 'amount' | 'number' | 'quantity' | 'percent' | 'currency' | 'date';
/** 열 폭 단계: xs 64 · sm 112(날짜가 들어간다) · md 128 · lg 192 · xl 256 · auto(남는 폭) */
export type ColumnWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
/** 칸 편집기. 없으면 format이 정한다(amount · currency → amount, 숫자 → number, date → date, options가 있으면 select) */
export type DataGridEditor = 'text' | 'number' | 'amount' | 'date' | 'select';

export interface DataGridOption {
  value: string;
  label: string;
}

/** 열 필터 값: text 필터는 글자, values 필터는 고른 값 목록(빈 목록 = 아무것도 안 보임). 키가 없으면 거르지 않는다 */
export type DataGridFilterValue = string | readonly string[];
export type DataGridFilters = Readonly<Record<string, DataGridFilterValue>>;

/** 열 설정: 순서(열 key 전체)와 숨긴 열 */
export interface DataGridColumnState {
  order: readonly string[];
  hidden: readonly string[];
}

/** 열 묶음 머리(PR-30): 이어진 열 위에 한 줄 더 서는 머리. column.group이 이 key를 가리킨다 */
export interface DataGridColumnGroup {
  key: string;
  /** 묶음 이름(명사): 공급가액 · 세액이 든 "금액" */
  header: string;
  /** 묶음 머리를 왼쪽에 고정. 묶음의 열이 sticky일 때 함께 쓴다 */
  sticky?: boolean;
}

/** 불러오기 오류(PR-30). 행 대신 EmptyState kind="error" 블록이 선다 */
export interface DataGridError {
  /** 무엇이 안 됐는지 한 문장. 없으면 "목록을 불러오지 못했습니다" */
  message?: string;
  /** 서버 요청 ID. 블록 아래 한 줄로 보인다(문의할 때 옮겨 적는 값) */
  requestId?: string;
  /** 있으면 "다시 시도" 단추 */
  onRetry?: () => void;
}

export interface DataGridColumn {
  key: string;
  /** 열 이름(명사) */
  header: string;
  width?: ColumnWidth;
  /** 숫자 서식은 기본 right */
  align?: 'left' | 'center' | 'right';
  format?: ColumnFormat;
  currency?: CurrencyCode;
  /** 수량 · 숫자 뒤 단위(흐리게) */
  unit?: string;
  /** 머리 칸 단위 "(원)". 기본: amount = 원, currency = 통화 코드, 나머지 없음. 머리 글자에 괄호가 있거나 저절로 붙는 열이 5개 이상이면 붙이지 않는다(표 위에 한 번). false = 안 붙임(PR-26) */
  headerUnit?: string | false;
  /** 링크색 글자: 행을 누르면 상세가 열린다는 단서(번호 · 이름 열 하나, onRowPress와 함께)(PR-26) */
  link?: boolean;
  /** 결과 열 강조(합계 · 받을 금액): 왼쪽 굵은 선 + 굵은 글자. 바탕을 칠하지 않는다(PR-26) */
  emphasis?: boolean;
  sortable?: boolean;
  /**
   * 가로 스크롤해도 남는 열. true · 'start' = 왼쪽, 'end' = 오른쪽(결과 열: 공제 합계 · 실지급).
   * 여러 열이면 같은 쪽끼리 붙여 둔다(왼쪽은 표 앞, 오른쪽은 표 끝). 키보드 이동 · 읽는 순서는 열 순서 그대로(R-37 4)
   */
  sticky?: boolean | 'start' | 'end';
  /** 합계 행: sum = 더하기, count = 건수 */
  total?: 'sum' | 'count';
  /** 금액 방향 색: 양수 = 수입 빨강, 음수 = 지출 파랑(CLAUDE.md 금융 색) */
  finance?: boolean;
  /** 글자가 길면 줄바꿈(기본은 말줄임) */
  wrap?: boolean;
  /** 웹: (row) => ReactNode */
  render?: unknown;
  /** 칸 편집(onCellChange가 있을 때). Enter 저장 · Esc 취소 · 칸을 떠나면 저장 */
  editable?: boolean;
  editor?: DataGridEditor;
  /** select 편집기 · values 필터의 고를 거리. 있으면 칸도 label로 보인다 */
  options?: readonly DataGridOption[];
  /** 웹: (value, row) => string | null. 글자를 돌려주면 저장하지 않고 그 글자를 보인다 */
  validate?: unknown;
  /** 머리 칸 필터: text = 포함하는 글자, values = 값 고르기 */
  filter?: 'text' | 'values';
  /** 처음에 숨김(열 설정에서 켠다) */
  hidden?: boolean;
  /** 열 설정에서 숨길 수 있는지(기본 true). 행 이름 열은 false로 둔다 */
  hideable?: boolean;
  /** 좁은 화면 카드에서 맡는 자리. 없으면 표가 정한다(첫 글자 열 = title, 첫 금액 열 = trailing, 나머지 = meta 3개까지) */
  mobile?: 'title' | 'meta' | 'trailing' | 'status' | 'hidden';
  /** 이 열이 드는 묶음(groups의 key). 같은 묶음 열은 붙여 둔다(PR-30) */
  group?: string;
  /** low = 폭 1024~1279에서 숨긴다(태블릿 · 작은 노트북에서 덜 중요한 열)(PR-30) */
  priority?: 'low';
}

export interface DataGridSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataGridProps extends ContractBase {
  columns: readonly DataGridColumn[];
  rows: readonly Record<string, unknown>[];
  /** 행 식별 열 이름 */
  rowKey: string;
  /** 표 이름(스크린리더). 보이는 제목과 같게 */
  caption: string;
  selectable?: boolean;
  selected?: readonly string[];
  onSelectedChange?: (keys: string[]) => void;
  /** 행을 누르면(상세 Drawer 열기) */
  onRowPress?: (row: Record<string, unknown>) => void;
  /** 지금 열린 행 */
  activeRowKey?: string | null;
  sort?: DataGridSort | null;
  defaultSort?: DataGridSort | null;
  onSortChange?: (sort: DataGridSort | null) => void;
  loading?: boolean;
  /** 빈 상태: 무엇이 없는지 + 다음 행동 */
  empty?: unknown;
  /** 합계 행 */
  summary?: boolean;
  /** fill = 부모 남은 높이까지 자라고 넘치면 안에서 스크롤(목록 · 상세 패턴). 줄이 적으면 내용 높이 */
  height?: 'auto' | 'fill';
  /** 웹: (row) => StatusTone | undefined. 행 왼쪽에 상태 띠 */
  rowTone?: unknown;
  /** 좁은 화면(breakpoint.sm 미만): cards = 행마다 카드(기본), scroll = 표 그대로 가로 스크롤(열끼리 비교하는 매트릭스) */
  mobile?: 'cards' | 'scroll';
  /** 칸 편집을 저장할 때. value는 편집기가 바꾼 값(number · amount = 숫자, date = 'YYYY-MM-DD', 비우면 null) */
  onCellChange?: (row: Record<string, unknown>, key: string, value: unknown) => void;
  /** 열 필터(제어). 필터는 받은 행 안에서 거른다. 서버 검색은 FilterBar */
  filters?: DataGridFilters;
  defaultFilters?: DataGridFilters;
  onFiltersChange?: (filters: DataGridFilters) => void;
  /** 머리 끝 열 설정 단추(숨김 · 순서). storageKey가 있으면 이 기기에 저장한다 */
  columnSettings?: boolean | { storageKey?: string };
  /** 열 설정(제어) */
  columnState?: DataGridColumnState;
  onColumnStateChange?: (state: DataGridColumnState) => void;
  /** 이 열 값으로 행을 묶고 묶음마다 소계 행(total: 'sum' 열)을 단다. 묶음 머리를 눌러 접는다 */
  groupBy?: string;
  /** 웹: (value, rows) => ReactNode. 묶음 머리 글자(없으면 그 열 서식) */
  groupLabel?: unknown;
  /** 이 열에 든 자식 행으로 트리를 그린다(계정 과목 · BOM · 조직) */
  childrenKey?: string;
  /** 처음 펼친 트리 행(key 목록 또는 'all') */
  defaultExpanded?: readonly string[] | 'all';
  /** 보이는 행만 그린다. auto = height fill이고 행이 200개를 넘을 때 */
  virtualize?: boolean | 'auto';
  /** 웹: (row) => ReactNode. 행 끝 행동 칸(기본 행동 단추 1개 + 더보기 Menu). 누르면 행 열기(onRowPress)는 일어나지 않는다(PR-26) */
  rowActions?: unknown;
  /** 칸 구분선: rows = 가로선만, all = 세로선까지, auto = 오른쪽 정렬(숫자) 열이 4개 이상이면 all(PR-26) */
  dividers?: 'rows' | 'all' | 'auto';
  /** 불러오기 오류. 있으면 행 대신 오류 블록(메시지 · 요청 ID · 다시 시도)(PR-30) */
  error?: DataGridError | null;
  /** 바깥 검색 · 필터(FilterBar) 조건이 걸려 있다. 행이 없으면 "조건에 맞는 항목이 없습니다" 모양(PR-30) */
  filtered?: boolean;
  /** 열 묶음 머리(column.group이 가리킨다)(PR-30) */
  groups?: readonly DataGridColumnGroup[];
  /** 저장 전 칸이면 true. 칸 오른쪽 위에 작은 점 + 숨은 글자(dirtyHint)(PR-30) */
  isDirty?: (row: Record<string, unknown>, key: string) => boolean;
  /** 저장 전 칸의 숨은 글자. 기본 "저장 전" */
  dirtyHint?: string;
  /** 이 key의 행이 보이게 스크롤한다(바뀔 때마다)(PR-30) */
  scrollToKey?: string | null;
  /** 이 key의 행에 1초 동안 선택 행 바탕을 준다(방금 저장 · 추가한 행)(PR-30) */
  flashKey?: string | null;
}

export const DataGridContract = defineContract<DataGridProps>({
  name: 'DataGrid',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    columns: { type: 'DataGridColumn[]', required: true, description: '열 정의' },
    rows: { type: 'Row[]', required: true, description: '행' },
    rowKey: { type: 'string', required: true, description: '행 식별 열' },
    caption: { type: 'string', required: true, description: '표 이름(접근성)' },
    selectable: { type: 'boolean', default: false, description: '행 선택 체크박스' },
    selected: { type: 'string[]', description: '선택된 행(제어)' },
    onSelectedChange: { type: '(keys: string[]) => void', description: '선택이 바뀔 때' },
    onRowPress: { type: '(row) => void', description: '행을 누를 때' },
    activeRowKey: { type: 'string | null', description: '열린 행' },
    sort: { type: 'DataGridSort | null', description: '정렬(제어)' },
    defaultSort: { type: 'DataGridSort | null', description: '처음 정렬' },
    onSortChange: { type: '(sort) => void', description: '정렬이 바뀔 때(없으면 표가 직접 정렬)' },
    loading: { type: 'boolean', default: false, description: '스켈레톤 행' },
    empty: { type: 'ReactNode', description: '빈 상태' },
    summary: { type: 'boolean', default: false, description: '합계 행' },
    height: {
      type: "'auto' | 'fill'",
      default: 'auto',
      values: ['auto', 'fill'],
      description: '높이',
    },
    rowTone: {
      type: '(row) => StatusTone | undefined',
      description: '행 상태 값(data-tone). 띠 · 바탕을 그리지 않는다. 상태는 상태 열이 보인다',
    },
    mobile: {
      type: "'cards' | 'scroll'",
      default: 'cards',
      values: ['cards', 'scroll'],
      description: '좁은 화면 모양',
    },
    onCellChange: { type: '(row, key, value) => void', description: '칸 편집을 저장할 때' },
    filters: { type: 'DataGridFilters', description: '열 필터(제어)' },
    defaultFilters: { type: 'DataGridFilters', description: '처음 열 필터' },
    onFiltersChange: { type: '(filters) => void', description: '열 필터가 바뀔 때' },
    columnSettings: {
      type: 'boolean | { storageKey?: string }',
      default: false,
      description: '열 설정 단추(숨김 · 순서, storageKey = 이 기기에 저장)',
    },
    columnState: { type: 'DataGridColumnState', description: '열 순서 · 숨김(제어)' },
    onColumnStateChange: { type: '(state) => void', description: '열 설정이 바뀔 때' },
    groupBy: { type: 'string', description: '묶을 열(소계 행)' },
    groupLabel: { type: '(value, rows) => ReactNode', description: '묶음 머리 글자' },
    childrenKey: { type: 'string', description: '자식 행이 든 열(트리)' },
    defaultExpanded: { type: "string[] | 'all'", description: '처음 펼친 트리 행' },
    virtualize: {
      type: "boolean | 'auto'",
      default: 'auto',
      description: '보이는 행만 그리기(auto = fill이고 200행 넘을 때)',
    },
    rowActions: {
      type: '(row) => ReactNode',
      description: '행 끝 행동 칸(기본 행동 1개 + 더보기)',
    },
    dividers: {
      type: "'rows' | 'all' | 'auto'",
      default: 'auto',
      values: ['rows', 'all', 'auto'],
      description: '칸 구분선(auto = 숫자 열 4개 이상이면 세로선까지)',
    },
    error: {
      type: '{ message?, requestId?, onRetry? } | null',
      description: '불러오기 오류(행 대신 오류 블록 · 다시 시도)',
    },
    filtered: {
      type: 'boolean',
      default: false,
      description: '바깥 검색 · 필터가 걸림(빈 상태를 검색 결과 없음으로)',
    },
    groups: { type: 'DataGridColumnGroup[]', description: '열 묶음 머리(column.group)' },
    isDirty: { type: '(row, key) => boolean', description: '저장 전 칸(모서리 점 + 숨은 글자)' },
    dirtyHint: { type: 'string', default: '저장 전', description: '저장 전 칸의 숨은 글자' },
    scrollToKey: { type: 'string | null', description: '이 행이 보이게 스크롤' },
    flashKey: { type: 'string | null', description: '이 행에 1초 선택 바탕(방금 바뀐 행)' },
  },
  states: ['default', 'hover', 'focus', 'loading'],
  a11y: {
    // 편집 칸이 있으면 role="grid"(칸 이동). 없으면 table
    role: 'table',
    keyboard: [
      'Tab(행 · 칸, 편집 칸이 있으면 다음 편집 칸)',
      'Shift+Tab(이전 편집 칸)',
      '방향키(칸 이동, 편집 칸이 있는 표)',
      'Home · End(행의 첫 칸 · 끝 칸)',
      'Ctrl+Home · Ctrl+End(첫 행 첫 칸 · 끝 행 끝 칸)',
      'PageUp · PageDown(한 화면 위 · 아래)',
      'Enter(행 열기 · 칸 편집 시작 · 저장)',
      'F2(칸 편집 시작)',
      'Esc(편집 취소)',
      'Space(선택)',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
