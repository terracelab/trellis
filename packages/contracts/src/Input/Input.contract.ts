import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

export interface InputProps extends ContractBase {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 예시 값만. 라벨 대신 쓰지 않는다(content.md §5) */
  placeholder?: string;
  type?: 'text' | 'search' | 'email' | 'tel' | 'password' | 'url';
  size?: Size;
  icon?: IconName;
  /** 앞 글자(₩ · USD) */
  prefix?: string;
  /** 뒤 단위(원 · EA · %) */
  suffix?: string;
  /** 숫자는 right */
  align?: 'left' | 'right';
  /** 고정폭 글꼴(코드 · 번호 · 시각 입력). `font.family.mono` + `type.mono` */
  mono?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  maxLength?: number;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'search';
  autoComplete?: string;
  /** Enter를 눌렀을 때(검색 · 다음 칸) */
  onEnter?: () => void;
  /** Field 밖(필터 · 검색)에서 쓸 때의 접근성 이름 */
  label?: string;
}

export const InputContract = defineContract<InputProps>({
  name: 'Input',
  props: {
    id: { type: 'string', description: 'DOM id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'string', description: '값(제어)' },
    defaultValue: { type: 'string', description: '처음 값(비제어)' },
    onChange: { type: '(value: string) => void', description: '값이 바뀔 때' },
    placeholder: { type: 'string', description: '예시 값' },
    type: {
      type: "'text' | 'search' | 'email' | 'tel' | 'password' | 'url'",
      default: 'text',
      description: '입력 종류',
    },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    icon: { type: 'IconName', description: '앞 아이콘' },
    prefix: { type: 'string', description: '앞 글자' },
    suffix: { type: 'string', description: '뒤 단위' },
    align: {
      type: "'left' | 'right'",
      default: 'left',
      values: ['left', 'right'],
      description: '글자 정렬',
    },
    mono: { type: 'boolean', default: false, description: '고정폭 글꼴(코드 · 번호 입력)' },
    clearable: { type: 'boolean', default: false, description: '지우기 버튼' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    readOnly: { type: 'boolean', default: false, description: '읽기 전용' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    name: { type: 'string', description: '폼 이름' },
    maxLength: { type: 'number', description: '최대 글자 수' },
    inputMode: {
      type: "'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'search'",
      description: '모바일 키보드',
    },
    autoComplete: { type: 'string', description: '자동 완성' },
    onEnter: { type: '() => void', description: 'Enter' },
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: { role: 'textbox', keyboard: ['Enter', 'Escape(지우기)'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
