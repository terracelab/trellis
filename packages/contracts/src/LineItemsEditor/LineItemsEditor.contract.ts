import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { ColumnFormat, ColumnWidth } from '../DataGrid/DataGrid.contract.js';
import type { CurrencyCode } from '../_shared/format.js';

export interface LineItemsColumn {
  key: string;
  /** 열 이름(명사). 칸 접근성 이름은 "<표 이름> <행> <열 이름>"(품목 2 단가) */
  header: string;
  /** 머리에 필수 표시. 칸 입력에도 required가 이어진다 */
  required?: boolean;
  width?: ColumnWidth;
  /** 숫자 서식은 기본 right */
  align?: 'left' | 'center' | 'right';
  /** 웹: (line, { index, label, update }) => ReactNode. 편집 칸(Trellis 입력). 없으면 value를 format으로 보이는 읽기 칸 */
  render?: unknown;
  /** 웹: (line) => unknown. 읽기 칸 · 합계에 쓸 값(없으면 line[key]) */
  value?: unknown;
  format?: ColumnFormat;
  currency?: CurrencyCode;
  /** 웹: (line) => 'danger' | 'warning' | 'success' | undefined. 읽기 칸 상태(앞 아이콘 + 숨은 상태 글자) */
  tone?: unknown;
  /** 합계 행: sum = 더하기 */
  total?: 'sum';
  /** 표가 안 들어가는 폭(줄 · 카드)에서: title = 번호 옆 머리 줄 · full = 한 줄 다 · half = 반 칸 · hidden. 없으면 폭이 lg · xl · auto면 full */
  mobile?: 'title' | 'full' | 'half' | 'hidden';
}

export interface LineItemsEditorProps extends ContractBase {
  /** 표 이름(스크린리더). 보이는 제목과 같게 */
  caption: string;
  /** 줄 목록 */
  value: readonly Record<string, unknown>[];
  onChange: (lines: Record<string, unknown>[]) => void;
  /** 줄 식별 열 이름 */
  lineKey: string;
  columns: readonly LineItemsColumn[];
  /** 줄 추가 때 새 줄 */
  newLine: () => Record<string, unknown>;
  /** 이보다 적게 지울 수 없다(전표 2 · 발주 1) */
  minLines?: number;
  maxLines?: number;
  /** 왼쪽 번호 열 */
  numbered?: boolean;
  /** 웹: (line, index) => string | null. 줄 전체 오류(합계 참여율 120%). 줄 아래 한 줄, 그 줄 첫 입력 칸의 설명으로 잇는다 */
  lineError?: unknown;
  /** 웹: (line, index, key) => string | null. 칸 오류. 칸 아래 글자 + 칸 입력 aria-invalid */
  cellError?: unknown;
  /** 웹: { label, value: ReactNode }[]. 표 아래 오른쪽 숫자 묶음(공급가액 · 세액 · 합계). 줄이 0개면 그리지 않는다 */
  totals?: unknown;
  /** 웹: ReactNode. 합계 아래 한 줄(한글 금액). 줄이 0개면 그리지 않는다 */
  footnote?: unknown;
  /** 줄이 0개일 때 글자(minLines 0). 이때 합계 행 · totals · footnote는 모든 모양에서 빠진다 */
  empty?: string;
  /** 합계 행(total: 'sum' 열). 줄이 0개면 그리지 않는다 */
  summary?: boolean;
  summaryLabel?: string;
  /** 줄 추가 단추 글자 */
  addLabel?: string;
  /** 줄 추가 단추 아이콘(기본 plus). 인력은 user-plus */
  addIcon?: IconName;
  /** Enter로 다음 칸, 마지막 칸이면 줄 추가(기본 true) */
  enterToNext?: boolean;
  disabled?: boolean;
  /** 폼 이름(useTrellisForm bind가 넘긴다) */
  name?: string;
}

export const LineItemsEditorContract = defineContract<LineItemsEditorProps>({
  name: 'LineItemsEditor',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    caption: { type: 'string', required: true, description: '표 이름(접근성)' },
    value: { type: 'Line[]', required: true, description: '줄 목록' },
    onChange: {
      type: '(lines) => void',
      required: true,
      description: '줄이 바뀔 때(추가 · 삭제 · 칸 수정)',
    },
    lineKey: { type: 'string', required: true, description: '줄 식별 열' },
    columns: {
      type: 'LineItemsColumn[]',
      required: true,
      description: '열 정의(편집 칸은 render)',
    },
    newLine: { type: '() => Line', required: true, description: '줄 추가 때 새 줄' },
    minLines: { type: 'number', default: 1, description: '남겨야 하는 줄 수' },
    maxLines: { type: 'number', description: '최대 줄 수' },
    numbered: { type: 'boolean', default: false, description: '번호 열' },
    lineError: { type: '(line, index) => string | null', description: '줄 전체 오류(줄 아래)' },
    cellError: { type: '(line, index, key) => string | null', description: '칸 오류(칸 아래)' },
    totals: { type: '{ label, value }[]', description: '표 아래 합계 묶음(줄이 없으면 숨김)' },
    footnote: { type: 'ReactNode', description: '합계 아래 한 줄(줄이 없으면 숨김)' },
    empty: { type: 'string', description: '줄이 없을 때 글자' },
    summary: { type: 'boolean', default: false, description: '합계 행(줄이 없으면 숨김)' },
    summaryLabel: { type: 'string', description: '합계 행 첫 칸 글자' },
    addLabel: { type: 'string', description: '줄 추가 단추 글자' },
    addIcon: { type: 'IconName', default: 'plus', description: '줄 추가 단추 아이콘' },
    enterToNext: {
      type: 'boolean',
      default: true,
      description: 'Enter로 다음 칸 · 마지막 칸이면 줄 추가',
    },
    disabled: { type: 'boolean', default: false, description: '추가 · 삭제 막음' },
    name: { type: 'string', description: '폼 이름' },
  },
  states: ['default', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'table',
    keyboard: ['Tab(칸)', 'Enter(다음 칸 · 마지막 칸이면 줄 추가)', 'Shift+Enter(그대로)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
