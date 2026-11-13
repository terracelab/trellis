import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

export interface CodeOption {
  /** 코드(계정과목 1080 · 거래처 C-0012 · HS 0901.21) */
  value: string;
  /** 이름 */
  label: string;
  /** 이름 아래 보조 설명 */
  description?: string;
  /** 오른쪽 끝 보조 정보(구분 · 단위 · 잔액) */
  meta?: string;
}

export interface CodeSearchProps extends ContractBase {
  /** Field 밖(표 칸 · 필터)에서 쓸 때의 접근성 이름 */
  label?: string;
  options: readonly CodeOption[];
  /** 고른 코드. 없으면 null */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  /** 찾는 코드가 없을 때 */
  emptyText?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  /** 있으면 목록 맨 아래에 "새로 등록" 줄. 고르면 닫고 onCreate(입력한 글자)를 부른다. 값은 바꾸지 않는다(등록이 끝나면 부모가 value를 넣는다) */
  onCreate?: (query: string) => void;
  /** "새로 등록" 줄 글자. 기본 q ? '"q" 새로 등록' : '새로 등록' */
  createLabel?: (query: string) => string;
  /** 목록에 없는 글자를 그대로 받는다(Enter · 칸을 떠날 때). 칸에는 그 글자가 남고 value는 null */
  allowCustomValue?: boolean;
  /** allowCustomValue일 때 목록에 없는 글자를 받았을 때 */
  onCustomValue?: (text: string) => void;
  /** 코드를 보일지(기본 true). 거래처 이름 · 직원처럼 사람이 볼 코드가 없는 목록은 false. value는 그대로 고유 키 */
  showCode?: boolean;
}

export const CodeSearchContract = defineContract<CodeSearchProps>({
  name: 'CodeSearch',
  props: {
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
    id: { type: 'string', description: '입력 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    options: { type: 'CodeOption[]', required: true, description: '코드 목록' },
    value: { type: 'string | null', description: '고른 코드(제어)' },
    defaultValue: { type: 'string | null', description: '처음 코드(비제어)' },
    onChange: { type: '(value: string | null) => void', description: '고르거나 지울 때' },
    placeholder: { type: 'string', default: '코드 또는 이름', description: '빈 칸 안내' },
    emptyText: {
      type: 'string',
      default: '검색 결과가 없습니다',
      description: '결과가 없을 때',
    },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    name: { type: 'string', description: '폼 이름(코드 제출)' },
    onCreate: {
      type: '(query: string) => void',
      description: '"새로 등록" 줄을 고를 때(값은 그대로)',
    },
    createLabel: { type: '(query: string) => string', description: '"새로 등록" 줄 글자' },
    allowCustomValue: {
      type: 'boolean',
      default: false,
      description: '목록에 없는 글자를 그대로 받기',
    },
    onCustomValue: { type: '(text: string) => void', description: '목록에 없는 글자를 받았을 때' },
    showCode: { type: 'boolean', default: true, description: '코드 보이기(false = 이름만)' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'combobox',
    keyboard: ['글자 입력(코드 · 이름)', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
