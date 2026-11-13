// 차트 계열이 공유하는 타입. 색은 토큰 슬롯 이름만 받는다 — hex·CSS 문자열은 타입으로 막는다(토큰 밖의 값 없음).
export const CHART_COLORS = [
  'series-1',
  'series-2',
  'series-3',
  'series-4',
  'series-5',
  'compare',
  'income',
  'expense',
  'success',
  'warning',
  'danger',
] as const;
/** `color.chart.series.n` · `color.chart.compare` · `color.finance.*` · `color.status.*.default` 로 해석된다 */
export type ChartColor = (typeof CHART_COLORS)[number];

/** 계열 정의. key는 data 행의 필드 이름, label은 범례·툴팁·표 머리글 */
export interface SeriesDef {
  key: string;
  label: string;
  type?: 'line' | 'area' | 'bar';
  /** 비교·직전 기간은 점선 + compare 색 */
  dashed?: boolean;
  color?: ChartColor;
}

/** 부분-전체(도넛·세그먼트 바)·범주 막대의 한 항목 */
export interface Slice {
  label: string;
  value: number;
  color?: ChartColor;
}

export interface LegendItem {
  label: string;
  color: ChartColor;
  /** 차트의 선 모양과 같게: 점선은 dashed, 선은 line, 막대·칸은 square */
  shape?: 'square' | 'line' | 'dashed';
}

/** 차트의 표 대체(ChartCard "표로 보기"). 첫 열이 범주, 숫자는 우측 정렬·tabular */
export interface ChartTable {
  columns: readonly string[];
  rows: readonly (readonly (string | number)[])[];
}

export type ValueFormatter = (value: number) => string;
export type CurveKind = 'smooth' | 'linear' | 'step';

export interface WaterfallStep {
  label: string;
  value: number;
  kind: 'start' | 'delta' | 'total';
  /** 비율·보조 설명(막대 아래 작은 글자) */
  caption?: string;
}

export interface HeatDatum {
  /** YYYY-MM-DD */
  date: string;
  value: number;
}

/** 차트 공통 props 메타(contract.ts에서 재사용) */
export const CHART_PROP_META = {
  unit: {
    type: 'string',
    description: '단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다',
  },
  height: {
    type: 'number',
    description:
      '차트 높이(SVG 사용자 단위). 카드가 높이를 고정해 로딩 때 레이아웃이 뛰지 않게 한다',
  },
  format: {
    type: '(value: number) => string',
    description: '값 서식. 기본은 formatAmount(천 단위)',
  },
  ariaLabel: {
    type: 'string',
    required: true,
    description: '차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름',
  },
} as const;
