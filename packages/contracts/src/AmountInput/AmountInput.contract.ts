import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';
import type { CurrencyCode } from '../_shared/format.js';

export interface AmountInputProps extends ContractBase {
  /** Field 밖(표 칸 · 필터)에서 쓸 때의 접근성 이름 */
  label?: string;
  /** 숫자 값. 비었으면 null */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  /** KRW = 뒤에 원, 그 밖 = 앞에 통화 코드 + 소수 2자리(JPY는 0자리) */
  currency?: CurrencyCode;
  /** 음수 입력 허용(환불 · 차감) */
  allowNegative?: boolean;
  /** 아래에 한글 금액(일금 …원정)을 보인다. KRW만 */
  showKorean?: boolean;
  min?: number;
  max?: number;
  /** 예시 값만 */
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: Size;
  name?: string;
}

export const AmountInputContract = defineContract<AmountInputProps>({
  name: 'AmountInput',
  props: {
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
    id: { type: 'string', description: 'DOM id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'number | null', description: '금액(제어)' },
    defaultValue: { type: 'number | null', description: '처음 금액(비제어)' },
    onChange: { type: '(value: number | null) => void', description: '금액이 바뀔 때' },
    currency: {
      type: "'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY'",
      default: 'KRW',
      values: ['KRW', 'USD', 'EUR', 'JPY', 'CNY'],
      description: '통화',
    },
    allowNegative: { type: 'boolean', default: false, description: '음수 허용' },
    showKorean: { type: 'boolean', default: false, description: '한글 금액 표시(KRW)' },
    min: { type: 'number', description: '최소(벗어나면 오류 표시)' },
    max: { type: 'number', description: '최대(벗어나면 오류 표시)' },
    placeholder: { type: 'string', description: '예시 값' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    name: { type: 'string', description: '폼 이름(숫자 그대로 제출)' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: { role: 'textbox', keyboard: ['숫자 입력', 'Tab'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
