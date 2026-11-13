import { defineContract, type ContractBase } from '../_base.js';

export interface TextareaProps extends ContractBase {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 예시 값만. 라벨 대신 쓰지 않는다(content.md §5) */
  placeholder?: string;
  /** 보이는 줄 수 */
  rows?: number;
  /** 있으면 오른쪽 아래에 "12 / 200" 글자 수를 보인다 */
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  /** vertical = 세로로만 늘린다, none = 고정 */
  resize?: 'vertical' | 'none';
}

export const TextareaContract = defineContract<TextareaProps>({
  name: 'Textarea',
  props: {
    id: { type: 'string', description: 'DOM id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'string', description: '값(제어)' },
    defaultValue: { type: 'string', description: '처음 값(비제어)' },
    onChange: { type: '(value: string) => void', description: '값이 바뀔 때' },
    placeholder: { type: 'string', description: '예시 값' },
    rows: { type: 'number', default: 3, description: '보이는 줄 수' },
    maxLength: { type: 'number', description: '최대 글자 수(글자 수 표시)' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    readOnly: { type: 'boolean', default: false, description: '읽기 전용' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    name: { type: 'string', description: '폼 이름' },
    resize: {
      type: "'vertical' | 'none'",
      default: 'vertical',
      values: ['vertical', 'none'],
      description: '높이 조절',
    },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: { role: 'textbox', keyboard: ['Tab'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
