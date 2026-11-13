import { defineContract, type ContractBase } from '../_base.js';

/** 링 지름 80 · 120 · 160. 컨트롤 높이가 아니라서 Size(xs~xl)와 따로 둔다 */
export type RadialMeterSize = 'sm' | 'md' | 'lg';

export interface RadialMeterProps extends ContractBase {
  value: number;
  max?: number;
  label: string;
  caption?: string;
  unit?: string;
  size?: RadialMeterSize;
  /** accent: series-1. 상태 톤은 상태일 때만(아이콘·글자와 함께) */
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  digits?: number;
}

export const RadialMeterContract = defineContract<RadialMeterProps>({
  name: 'RadialMeter',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'number', required: true, description: '현재 값' },
    max: { type: 'number', default: 100, description: '최댓값(= 링 한 바퀴)' },
    label: { type: 'string', required: true, description: '지표 이름(달성률 · 재구매율)' },
    caption: { type: 'string', description: '보조 글자(목표 대비)' },
    unit: { type: 'string', default: '%', description: '값 단위' },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      values: ['sm', 'md', 'lg'],
      description: '지름 80 · 120 · 160',
    },
    tone: {
      type: "'accent' | 'success' | 'warning' | 'danger'",
      default: 'accent',
      values: ['accent', 'success', 'warning', 'danger'],
      description: '링 색',
    },
    digits: { type: 'number', default: 0, description: '소수 자릿수' },
  },
  states: ['default'],
  a11y: { role: 'meter', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
