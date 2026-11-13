import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

export interface IconProps extends ContractBase {
  /** @terracelab/trellis-icons의 ICON_NAMES 중 하나(Lucide 이름) */
  name: IconName;
  size?: 16 | 20 | 24;
  /** 뜻이 있는 아이콘이면 라벨. 없으면 장식(aria-hidden) */
  label?: string;
}

export const IconContract = defineContract<IconProps>({
  name: 'Icon',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    name: { type: 'IconName', required: true, description: '아이콘 이름(Lucide)' },
    size: { type: '16 | 20 | 24', default: 16, values: ['16', '20', '24'], description: '크기' },
    label: { type: 'string', description: '뜻이 있는 아이콘의 접근성 이름. 없으면 장식' },
  },
  states: ['default'],
  a11y: { role: 'img', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
