import { defineContract, type ContractBase } from '../_base.js';

export interface FieldProps extends ContractBase {
  /** 명사, 콜론 없음(content.md §5) */
  label: string;
  required?: boolean;
  /** 한 문장. 왜가 아니라 어떻게 */
  help?: string;
  /** 무엇이 틀렸고 어떻게 고치는지. 있으면 오류 상태 */
  error?: string | null;
  /** horizontal = 라벨 왼쪽(폼 · 등록 패턴, compact 120) */
  layout?: 'vertical' | 'horizontal';
  disabled?: boolean;
  /** FormSection 격자에서 차지할 칸 수 */
  span?: 1 | 2 | 3;
  children?: unknown;
}

export const FieldContract = defineContract<FieldProps>({
  name: 'Field',
  props: {
    id: { type: 'string', description: '입력 부품 id(없으면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    label: { type: 'string', required: true, description: '라벨' },
    required: { type: 'boolean', default: false, description: '필수(점 표시)' },
    help: { type: 'string', description: '도움말' },
    error: { type: 'string | null', description: '오류 문구' },
    layout: {
      type: "'vertical' | 'horizontal'",
      default: 'vertical',
      values: ['vertical', 'horizontal'],
      description: '라벨 위치',
    },
    disabled: { type: 'boolean', default: false, description: '안의 입력 부품 비활성' },
    span: {
      type: '1 | 2 | 3',
      default: 1,
      values: ['1', '2', '3'],
      description: 'FormSection 칸 수',
    },
    children: { type: 'ReactNode', description: '입력 부품 하나' },
  },
  states: ['default', 'disabled', 'error'],
  a11y: { keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
