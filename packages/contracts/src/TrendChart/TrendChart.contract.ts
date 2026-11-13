import { defineContract, type ContractBase } from '../_base.js';
import {
  CHART_PROP_META,
  type CurveKind,
  type SeriesDef,
  type ValueFormatter,
} from '../charts/_shared.js';

/**
 * 예측 구간(수요 예측 · 발주 추천). from번째 행까지는 실적(실선), from번째 행부터는 예측(점선)이다.
 * 같은 계열 key 하나를 이어 그린다. 신뢰 구간은 lower · upper 필드로 음영을 깐다
 */
export interface TrendForecast {
  /** 예측이 시작하는 행 index(0부터). 이 행은 실적의 마지막 점이자 예측의 첫 점이다 */
  from: number;
  /** 예측으로 이어 그릴 계열 key. 없으면 series[0] */
  key?: string;
  /** 신뢰 구간 아래 · 위 필드(같은 단위). 둘 다 있어야 음영을 그린다 */
  lower?: string;
  upper?: string;
  /** 범례 · 툴팁 이름. 없으면 "예측" */
  label?: string;
  /** 신뢰 구간 이름. 없으면 "예측 범위" */
  bandLabel?: string;
}

export interface TrendChartProps<T extends object = Record<string, unknown>> extends ContractBase {
  data: readonly T[];
  /** x축 필드(날짜·월) */
  x: string;
  /** 같은 단위의 계열만. 다른 단위는 차트를 나눈다(이중 축 금지) */
  series: readonly SeriesDef[];
  unit?: string;
  height?: number;
  xFormat?: (value: string | number) => string;
  yFormat?: ValueFormatter;
  curve?: CurveKind;
  showDots?: boolean;
  /** 끝점 값 글자를 붙일 계열 key(최대 1개) */
  endLabel?: string;
  yDomain?: readonly [number | 'auto', number | 'auto'];
  /** 기준 구간(목표 범위·영업시간) 음영 */
  band?: { from: number; to: number; label?: string };
  /** 예측 구간: from번째 행부터 점선 + 신뢰 구간 음영 */
  forecast?: TrendForecast;
  ariaLabel: string;
}

export const TrendChartContract = defineContract<TrendChartProps>({
  name: 'TrendChart',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: { type: 'T[]', required: true, description: '행 배열' },
    x: { type: 'keyof T', required: true, description: 'x축 필드' },
    series: {
      type: 'SeriesDef[]',
      required: true,
      description: '계열(선·영역). 비교는 dashed + compare',
    },
    unit: CHART_PROP_META.unit,
    height: { ...CHART_PROP_META.height, default: 240 },
    xFormat: { type: '(v) => string', description: 'x 라벨 서식(MM-DD · n월)' },
    yFormat: { type: '(v: number) => string', description: 'y 라벨 서식(만·억)' },
    curve: {
      type: "'smooth' | 'linear' | 'step'",
      default: 'smooth',
      values: ['smooth', 'linear', 'step'],
      description: '선 보간. 전망처럼 꺾이는 선은 linear',
    },
    showDots: { type: 'boolean', default: false, description: '모든 점에 마커' },
    endLabel: { type: 'string', description: '끝점 값 글자를 붙일 계열' },
    yDomain: { type: "[number | 'auto', number | 'auto']", description: 'y 범위' },
    band: { type: '{ from; to; label? }', description: '기준 구간 음영' },
    forecast: {
      type: '{ from: number; key?; lower?; upper?; label?; bandLabel? }',
      description: '예측: from번째 행부터 같은 계열을 점선으로, lower~upper를 신뢰 구간 음영으로',
    },
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
