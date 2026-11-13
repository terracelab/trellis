import { defineContract, type ContractBase } from '../_base.js';

export interface DividerProps extends ContractBase {
  /** horizontal = 가로줄(묶음 사이), vertical = 세로줄(도구 줄 · 메타 글자 사이) */
  orientation?: 'horizontal' | 'vertical';
  /** subtle = 구분선 색(border.divider, 기본), strong = 강조 선(border.strong, 합계 위 · 큰 묶음 사이) */
  variant?: 'subtle' | 'strong';
  /** 선 바깥 여백(가로줄은 위아래, 세로줄은 좌우): none 0 · sm 8 · md 16 · lg 24 */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** 가운데 글자(또는 · 오늘 · 이전 기록). 가로줄에서만 */
  label?: string;
  /** true면 화면 읽기에서 빠진다(카드 테두리처럼 모양만인 선) */
  decorative?: boolean;
}

export const DividerContract = defineContract<DividerProps>({
  name: 'Divider',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      values: ['horizontal', 'vertical'],
      description: '방향(가로줄 · 세로줄)',
    },
    variant: {
      type: "'subtle' | 'strong'",
      default: 'subtle',
      values: ['subtle', 'strong'],
      description: '선 색(subtle border.divider · strong border.strong)',
    },
    spacing: {
      type: "'none' | 'sm' | 'md' | 'lg'",
      default: 'none',
      values: ['none', 'sm', 'md', 'lg'],
      description: '바깥 여백(none 0 · sm 8 · md 16 · lg 24)',
    },
    label: { type: 'string', description: '가운데 글자(가로줄만)' },
    decorative: { type: 'boolean', default: false, description: '화면 읽기에서 뺀다(모양만인 선)' },
  },
  states: ['default'],
  a11y: { role: 'separator', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
