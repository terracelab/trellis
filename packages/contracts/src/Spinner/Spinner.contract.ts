import { defineContract, type ContractBase } from '../_base.js';

export interface SpinnerProps extends ContractBase {
  size?: 16 | 20 | 24;
  /** 스크린리더용 문구. 기본 "불러오는 중" */
  label?: string;
}

export const SpinnerContract = defineContract<SpinnerProps>({
  name: 'Spinner',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    size: { type: '16 | 20 | 24', default: 16, values: ['16', '20', '24'], description: '크기' },
    label: { type: 'string', default: '불러오는 중', description: '접근성 문구' },
  },
  states: ['loading'],
  a11y: { role: 'status', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
