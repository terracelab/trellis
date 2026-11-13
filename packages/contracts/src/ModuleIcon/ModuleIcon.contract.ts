import { defineContract, type ContractBase, type ModuleId } from '../_base.js';

export interface ModuleIconProps extends ContractBase {
  /** modules.json의 모듈 id(accounting · mail · inventory …) */
  module: ModuleId;
  size?: 32 | 40 | 48;
  /** 접근성 이름. 없으면 모듈 라벨(회계) */
  label?: string;
  /** 옆에 모듈 이름 글자가 있으면 true */
  decorative?: boolean;
}

export const ModuleIconContract = defineContract<ModuleIconProps>({
  name: 'ModuleIcon',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    module: { type: 'ModuleId', required: true, description: '모듈 id' },
    size: {
      type: '32 | 40 | 48',
      default: 40,
      values: ['32', '40', '48'],
      description: '한 변(size.module-icon 토큰)',
    },
    label: { type: 'string', description: '접근성 이름(기본 모듈 라벨)' },
    decorative: {
      type: 'boolean',
      default: false,
      description: '장식(옆에 모듈 이름이 있을 때)',
    },
  },
  states: ['default'],
  a11y: { role: 'img', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
