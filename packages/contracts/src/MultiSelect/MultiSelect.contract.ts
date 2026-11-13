import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';
import { formatMessage, type Locale } from '../_shared/messages.js';
import type { SelectOption } from '../Select/Select.contract.js';

export interface MultiSelectProps extends ContractBase {
  options: readonly SelectOption[];
  /** 고른 값들. 아무것도 고르지 않으면 [](필터면 전체) */
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
  /** 아무것도 고르지 않았을 때 보이는 글자(필터면 '전체 채널') */
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  /** 폼 이름. 고른 값마다 같은 이름으로 보낸다 */
  name?: string;
  /** 필터 바처럼 내용 폭만 */
  width?: 'auto' | 'full';
  /** Field 밖에서 쓸 때의 접근성 이름. 좁은 화면 시트의 제목도 된다 */
  label?: string;
}

/** 트리거 글자: 없음 → placeholder, 하나 → 그 이름, 여럿 → '첫 이름 외 n' */
export function multiSelectSummary(
  options: readonly SelectOption[],
  value: readonly string[],
  placeholder: string,
  locale: Locale = 'ko',
): string {
  const picked = options.filter((o) => value.includes(o.value));
  if (picked.length === 0) return placeholder;
  if (picked.length === 1) return picked[0]!.label;
  return formatMessage(locale, 'multiSelect.more', {
    first: picked[0]!.label,
    rest: picked.length - 1,
  });
}

export const MultiSelectContract = defineContract<MultiSelectProps>({
  name: 'MultiSelect',
  props: {
    id: { type: 'string', description: '트리거 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    options: {
      type: 'SelectOption[]',
      required: true,
      description: '선택지(value · label · disabled · leading · note)',
    },
    value: { type: 'string[]', description: '고른 값들(제어)' },
    defaultValue: { type: 'string[]', description: '처음 값' },
    onChange: { type: '(value: string[]) => void', description: '바뀔 때(고른 값 전부)' },
    placeholder: { type: 'string', default: '전체', description: '아무것도 고르지 않았을 때' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류' },
    required: { type: 'boolean', default: false, description: '필수' },
    name: { type: 'string', description: '폼 이름' },
    width: {
      type: "'auto' | 'full'",
      default: 'full',
      values: ['auto', 'full'],
      description: '폭',
    },
    label: { type: 'string', description: 'Field 밖 접근성 이름 · 시트 제목' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'combobox',
    keyboard: ['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'Escape', '글자 입력(찾기)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
