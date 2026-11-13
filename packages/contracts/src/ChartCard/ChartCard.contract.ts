import { defineContract, type ContractBase } from '../_base.js';
import type { ChartTable, LegendItem } from '../charts/_shared.js';

export interface ChartCardProps extends ContractBase {
  /** 사용자의 말로 된 블록 제목(판매 추이 · 구매 업체) */
  title: unknown;
  /** 단위 · 기간 · 점선의 뜻("원 · 최근 90일 · 점선은 직전 기간") */
  subtitle?: unknown;
  legend?: readonly LegendItem[];
  /** 우상단 액션(기간 Segmented · 상태 Badge) */
  action?: unknown;
  /** 차트 영역 높이. 로딩·오류·빈 상태도 같은 높이를 지킨다 */
  height?: number;
  loading?: boolean;
  /** 데이터가 있는데 다시 불러오는 중: 차트를 흐리게 두고 자리는 유지 */
  refreshing?: boolean;
  /** 오류 메시지. 있으면 차트 대신 오류 + 다시 시도 */
  error?: string | null;
  /** 빈 상태 메시지(다음 행동 한 줄 포함) */
  empty?: string | null;
  onRetry?: () => void;
  /** 표 대체. 넘기면 "표로 보기" 토글이 생긴다 — 스크린리더·숫자 확인용이라 거의 항상 넘긴다 */
  table?: ChartTable;
  children?: unknown;
}

export const ChartCardContract = defineContract<ChartCardProps>({
  name: 'ChartCard',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'ReactNode', required: true, description: '블록 제목' },
    subtitle: { type: 'ReactNode', description: '단위·기간·점선의 뜻' },
    legend: { type: 'LegendItem[]', description: '범례. 계열이 2개 이상이면 항상 넘긴다' },
    action: { type: 'ReactNode', description: '우상단 액션' },
    height: { type: 'number', default: 240, description: '차트 영역 높이(고정)' },
    loading: { type: 'boolean', default: false, description: '스켈레톤' },
    refreshing: { type: 'boolean', default: false, description: '다시 불러오는 중(흐리게)' },
    error: { type: 'string | null', description: '오류 메시지' },
    empty: { type: 'string | null', description: '빈 상태 메시지' },
    onRetry: { type: '() => void', description: '오류에서 다시 시도' },
    table: { type: 'ChartTable', description: '표 대체 데이터' },
    children: { type: 'ReactNode', description: '차트 1개' },
  },
  states: ['default', 'loading', 'error'],
  a11y: {
    role: 'figure',
    keyboard: ['Tab(표로 보기 토글)', 'Enter', 'Space'],
    labelling: 'label-prop',
  },
  slots: ['title', 'subtitle', 'legend', 'action', 'chart', 'table'],
  platforms: { web: true, native: true },
});
