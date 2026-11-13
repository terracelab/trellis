import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

/** min · max 밖의 날을 글자로 다 쳤을 때 앱에 알리는 내용(onOutOfRangeChange) */
export interface DateFieldOutOfRange {
  /** 넘은 쪽 */
  bound: 'min' | 'max';
  /** 그 경계 날짜 'YYYY-MM-DD'(min 또는 max) */
  date: string;
  /** 사용자가 친 날짜 'YYYY-MM-DD'. value에는 들어가지 않았다 */
  typed: string;
  /** 칸에 보이는 안내 문구(outOfRangeText 또는 기본 문구) */
  text: string;
}

export interface DateFieldProps extends ContractBase {
  /** Field 밖(표 칸 · 필터)에서 쓸 때의 접근성 이름 */
  label?: string;
  /** 'YYYY-MM-DD'. 비었으면 null */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** 고를 수 있는 첫날 'YYYY-MM-DD' */
  min?: string;
  /** 고를 수 있는 마지막 날 'YYYY-MM-DD' */
  max?: string;
  /**
   * min · max 밖의 날을 글자로 다 쳤을 때의 안내. bound = 넘은 쪽, date = 그 경계 날짜('YYYY-MM-DD').
   * 없으면 "{min} 이후 날짜를 넣으세요" · "{max}까지 넣을 수 있습니다"(locale 사전). Field error가 있으면 그것이 보인다
   */
  outOfRangeText?: (bound: 'min' | 'max', date: string) => string;
  /**
   * 범위 밖 입력 상태가 생기거나 바뀔 때(다른 날짜 · 다른 쪽) 그 내용으로, 걷힐 때 null로 부른다.
   * value는 그대로라서 앱은 이것으로 저장을 막는다. 칸이 사라질 때 상태가 남아 있으면 null로 한 번 더 부른다
   */
  onOutOfRangeChange?: (error: DateFieldOutOfRange | null) => void;
  /** 달력에서 오늘로 표시할 날 'YYYY-MM-DD'(데모 · 테스트). 없으면 기기 날짜 */
  today?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: Size;
  name?: string;
}

export const DateFieldContract = defineContract<DateFieldProps>({
  name: 'DateField',
  props: {
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
    id: { type: 'string', description: 'DOM id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'string | null', description: "값 'YYYY-MM-DD'(제어)" },
    defaultValue: { type: 'string | null', description: '처음 값(비제어)' },
    onChange: { type: '(value: string | null) => void', description: '날짜가 바뀔 때' },
    min: { type: 'string', description: '첫날' },
    max: { type: 'string', description: '마지막 날' },
    outOfRangeText: {
      type: "(bound: 'min' | 'max', date: string) => string",
      description: '범위 밖 날을 쳤을 때의 안내(없으면 기본 문구)',
    },
    onOutOfRangeChange: {
      type: '(error: DateFieldOutOfRange | null) => void',
      description: '범위 밖 입력이 생기거나 바뀔 때 그 내용, 걷힐 때 null',
    },
    today: { type: 'string', description: '달력의 오늘(없으면 기기 날짜)' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    name: { type: 'string', description: '폼 이름' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    keyboard: [
      '숫자 입력',
      'Alt+ArrowDown(달력)',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'PageUp',
      'PageDown',
      'Enter',
      'Escape',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
