import { defineContract, type ContractBase } from '../_base.js';
import { CHART_PROP_META, type ChartColor, type ValueFormatter } from '../charts/_shared.js';

/** 단계 하나. 단계 순서 = 배열 순서(문의 → 견적 → 협상 → 계약) */
export interface FunnelStage {
  label: string;
  value: number;
}

/** 단계마다 계산한 값. rate · overall은 퍼센트(0~100), 첫 단계의 rate는 null */
export interface FunnelStep extends FunnelStage {
  /** 바로 앞 단계 대비 전환율(%). 첫 단계는 null, 앞 단계가 0이면 null */
  rate: number | null;
  /** 첫 단계 대비 누적 전환율(%). 첫 단계가 0이면 null */
  overall: number | null;
  /** 앞 단계에서 빠진 수(첫 단계는 0) */
  drop: number;
}

/**
 * 단계 → 전환율 표. 표 대체(ChartCard.table)와 네이티브 구현이 같은 계산을 쓴다.
 * 소수 한 자리로 반올림한다(formatPercent와 같은 자리).
 */
export function funnelSteps(stages: readonly FunnelStage[]): FunnelStep[] {
  const first = stages[0]?.value ?? 0;
  const round = (v: number) => Math.round(v * 10) / 10;
  return stages.map((s, i) => {
    const prev = i > 0 ? stages[i - 1]!.value : null;
    return {
      label: s.label,
      value: s.value,
      rate: prev === null || prev <= 0 ? null : round((s.value / prev) * 100),
      overall: first > 0 ? round((s.value / first) * 100) : null,
      drop: prev === null ? 0 : prev - s.value,
    };
  });
}

export interface FunnelChartProps extends ContractBase {
  /** 단계(위 → 아래). 값은 단계에 도달한 수(건수 · 금액) */
  data: readonly FunnelStage[];
  unit?: string;
  format?: ValueFormatter;
  /** 막대 색. 한 측정값이므로 단계마다 바꾸지 않는다 */
  color?: ChartColor;
  /** 오른쪽 비율 칸: previous = 앞 단계 대비, overall = 첫 단계 대비, both = 둘 다 */
  conversion?: 'previous' | 'overall' | 'both';
  /** 아래 요약 줄(첫 단계 → 마지막 단계 전체 전환율) */
  summary?: boolean;
  ariaLabel: string;
}

export const FunnelChartContract = defineContract<FunnelChartProps>({
  name: 'FunnelChart',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: {
      type: 'FunnelStage[]',
      required: true,
      description: '단계(위 → 아래 순서). { label, value }',
    },
    unit: CHART_PROP_META.unit,
    format: CHART_PROP_META.format,
    color: {
      type: 'ChartColor',
      default: 'series-1',
      description: '막대 색 슬롯. 단계마다 바꾸지 않는다',
    },
    conversion: {
      type: "'previous' | 'overall' | 'both'",
      default: 'previous',
      values: ['previous', 'overall', 'both'],
      description: '비율 칸: 앞 단계 대비 · 첫 단계 대비 · 둘 다',
    },
    summary: { type: 'boolean', default: true, description: '아래 전체 전환율 한 줄' },
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
