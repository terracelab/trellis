import { defineContract, type ContractBase } from '../_base.js';

export interface SelectableCardOption {
  value: string;
  /** 카드 제목. 카드의 접근성 이름이 된다 */
  title: string;
  /** 제목 아래 설명 한두 줄 */
  description?: string;
  /** 제목 왼쪽. 아이콘 이름(@terracelab/trellis-icons) 또는 웹 요소(색 견본 · 로고) */
  icon?: unknown;
  /** 제목 줄 오른쪽 보조 정보(상태 · 배지 · 금액). 웹은 ReactNode */
  meta?: unknown;
  /** 설명 아래 내용(수치 · 진행률). 웹은 ReactNode. 누르는 요소는 넣지 않는다 */
  content?: unknown;
  disabled?: boolean;
}

interface SelectableCardBaseProps extends ContractBase {
  options: readonly SelectableCardOption[];
  /** 한 줄 카드 수. auto는 카드 최소 폭으로 채운다. 좁은 자리에서는 줄고 휴대폰 폭은 한 열 */
  columns?: 'auto' | 1 | 2 | 3 | 4;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  /** Field 밖에서 쓸 때의 접근성 이름. Field 안이면 Field 라벨이 이름이 된다 */
  label?: string;
}

/** single = 하나 고르기(radio) */
export interface SelectableCardSingleProps extends SelectableCardBaseProps {
  mode?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
}

/** multiple = 여러 개 고르기(checkbox) */
export interface SelectableCardMultipleProps extends SelectableCardBaseProps {
  mode: 'multiple';
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
}

export type SelectableCardProps = SelectableCardSingleProps | SelectableCardMultipleProps;

export const SelectableCardContract = defineContract<SelectableCardProps>({
  name: 'SelectableCard',
  props: {
    id: { type: 'string', description: '묶음 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    options: { type: 'SelectableCardOption[]', required: true, description: '카드 목록' },
    mode: {
      type: "'single' | 'multiple'",
      default: 'single',
      values: ['single', 'multiple'],
      description: '하나 고르기(radio) · 여러 개 고르기(checkbox)',
    },
    value: {
      type: 'string | null | string[]',
      description: '고른 값(제어). single은 문자열, multiple은 배열',
    },
    defaultValue: { type: 'string | null | string[]', description: '처음 값(비제어)' },
    onChange: {
      type: '(value: string | string[]) => void',
      description: '바뀔 때. single은 문자열, multiple은 배열',
    },
    columns: {
      type: "'auto' | 1 | 2 | 3 | 4",
      default: 'auto',
      values: ['auto', '1', '2', '3', '4'],
      description: '한 줄 카드 수(좁으면 줄어든다)',
    },
    disabled: { type: 'boolean', default: false, description: '전체 비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    name: { type: 'string', description: '폼 이름(고른 값 제출)' },
    label: { type: 'string', description: '접근성 이름(Field 밖)' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'radiogroup',
    keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
