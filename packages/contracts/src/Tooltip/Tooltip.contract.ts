import { defineContract, type ContractBase } from '../_base.js';

export interface TooltipProps extends ContractBase {
  /** 보조 설명 한 줄. 트리거의 접근성 이름(aria-label)과 같은 말로 */
  content: string;
  /** 포커스를 받을 수 있는 트리거 하나(IconButton · Button) */
  children: unknown;
  /** 트리거 기준 위치. 공간이 없으면 반대쪽으로 뒤집힌다 */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** 마우스를 올린 뒤 열릴 때까지(ms) */
  delay?: number;
}

export const TooltipContract = defineContract<TooltipProps>({
  name: 'Tooltip',
  props: {
    id: { type: 'string', description: '말풍선(popup) id' },
    testID: { type: 'string', description: '테스트 식별자(말풍선)' },
    content: { type: 'string', required: true, description: '보조 설명 한 줄' },
    children: { type: 'ReactElement', required: true, description: '트리거 요소 하나' },
    side: {
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: 'top',
      values: ['top', 'bottom', 'left', 'right'],
      description: '위치',
    },
    delay: { type: 'number', default: 400, description: '열림 지연(ms)' },
  },
  states: ['default'],
  a11y: { role: 'tooltip', keyboard: ['Escape'], labelling: 'label-prop' },
  platforms: { web: true, native: false },
});
