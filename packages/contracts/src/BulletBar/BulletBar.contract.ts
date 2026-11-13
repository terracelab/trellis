import { defineContract, type ContractBase } from '../_base.js';
import type { ValueFormatter } from '../charts/_shared.js';

export interface BulletBarProps extends ContractBase {
  label: string;
  value: number;
  target: number;
  /** 트랙 길이. 기본은 max(value, target) × 1.1 */
  max?: number;
  unit?: string;
  format?: ValueFormatter;
  /** up-good: 목표 이상이면 달성. up-bad(취소율·미수): 목표 이하가 좋음 */
  polarity?: 'up-good' | 'up-bad';
  /** 주의 경계(목표 대비 비율). 기본 0.9 */
  warnAt?: number;
  caption?: string;
  size?: 'sm' | 'md';
  /** 상태 칩(기본·달성·주의·초과) 표시 */
  showState?: boolean;
  /** 목표가 아닌 기준과 견줄 때 그 이름(평균). "/ 평균 9.1%"처럼 기준 값 앞에 붙는다 */
  targetLabel?: string;
  /** 오른쪽 비율(값 ÷ 목표). 기준과 견줄 때는 끈다 */
  showRatio?: boolean;
}

export const BulletBarContract = defineContract<BulletBarProps>({
  name: 'BulletBar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    label: { type: 'string', required: true, description: '행 이름' },
    value: { type: 'number', required: true, description: '현재 값' },
    target: { type: 'number', required: true, description: '목표·한도(세로 표식)' },
    max: { type: 'number', description: '트랙 최댓값' },
    unit: { type: 'string', description: '단위' },
    format: { type: '(v: number) => string', description: '값 서식' },
    polarity: {
      type: "'up-good' | 'up-bad'",
      default: 'up-good',
      values: ['up-good', 'up-bad'],
      description: '늘면 좋음/나쁨',
    },
    warnAt: { type: 'number', default: 0.9, description: '주의 경계 비율' },
    caption: { type: 'string', description: '보조 글자' },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '행 높이' },
    showState: { type: 'boolean', default: true, description: '상태 칩' },
    targetLabel: {
      type: 'string',
      description: '기준 이름(평균). 목표 대신 기준 값 앞에 붙는다',
    },
    showRatio: { type: 'boolean', default: true, description: '오른쪽 비율(값 ÷ 목표)' },
  },
  states: ['default'],
  a11y: { role: 'meter', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
