import { defineContract, type ContractBase } from '../_base.js';
import type { ChartColor } from '../charts/_shared.js';

export interface CheckboxGroupOption {
  value: string;
  label: string;
  /** 라벨 아래 한 줄 설명 */
  description?: string;
  /** 라벨 앞 색 점(캘린더 · 범주 범례, R-T58). 토큰 슬롯이고 뜻은 라벨이 말한다 */
  color?: ChartColor;
  /**
   * 줄 끝 보조 정보(건수 · 배지 · 링크). 웹은 ReactNode. 라벨 밖에 놓여 링크를 넣을 수 있고,
   * 상자의 설명(aria-describedby)으로 읽힌다
   */
  meta?: unknown;
  disabled?: boolean;
}

/** onChange 둘째 인자: 이번에 바뀐 선택지와 바뀐 뒤 상태(바로 저장할 때 무엇을 보낼지) */
export interface CheckboxGroupChange {
  /** 바뀐 선택지 값(옵션 순서). 하나를 누르면 하나, 전체 선택이면 상태가 바뀐 것 전부 */
  values: string[];
  /** 바뀐 뒤 상태 */
  checked: boolean;
}

export interface CheckboxGroupProps extends ContractBase {
  /** Field 밖에서 쓸 때의 접근성 이름. Field 안이면 Field 라벨이 이름이 된다 */
  label?: string;
  options: readonly CheckboxGroupOption[];
  /** 고른 값들(옵션 순서와 관계없이 고른 순서로 들어올 수 있다) */
  value?: readonly string[];
  defaultValue?: readonly string[];
  /** 옵션 순서로 정렬한 배열을 넘긴다. change = 이번에 바뀐 선택지와 바뀐 뒤 상태 */
  onChange?: (value: string[], change: CheckboxGroupChange) => void;
  /**
   * 저장 중인 선택지 값(바뀌면 바로 저장하는 화면). 그 선택지는 loading이다(Spinner · aria-busy).
   * 끝날 때까지 누를 수 없고 포커스는 남는다. 하나라도 있으면 전체 선택도 loading이다
   */
  pending?: readonly string[];
  /** vertical = 한 줄에 하나(설명이 있을 때), horizontal = 나란히 감싸기(짧은 라벨) */
  orientation?: 'vertical' | 'horizontal';
  /** 맨 위 전체 선택 체크박스의 라벨(true면 "전체"). 일부만 고르면 indeterminate */
  selectAll?: string | boolean;
  /** 처음 보일 선택지 수. 넘치면 "n개 더 보기" 단추 */
  maxVisible?: number;
  disabled?: boolean;
  invalid?: boolean;
  /** 하나 이상 골라야 한다(Field required면 자동) */
  required?: boolean;
  name?: string;
}

export const CheckboxGroupContract = defineContract<CheckboxGroupProps>({
  name: 'CheckboxGroup',
  props: {
    label: { type: 'string', description: '접근성 이름(Field 밖)' },
    id: { type: 'string', description: '묶음 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    options: { type: 'CheckboxGroupOption[]', required: true, description: '선택지' },
    value: { type: 'string[]', description: '고른 값(제어)' },
    defaultValue: { type: 'string[]', description: '처음 값(비제어)' },
    onChange: {
      type: '(value: string[], change: CheckboxGroupChange) => void',
      description: '바뀔 때(옵션 순서) + 바뀐 선택지 · 상태',
    },
    pending: {
      type: 'string[]',
      description: '저장 중인 선택지(loading, 누를 수 없음)',
    },
    orientation: {
      type: "'vertical' | 'horizontal'",
      default: 'vertical',
      values: ['vertical', 'horizontal'],
      description: '배치 방향',
    },
    selectAll: {
      type: 'string | boolean',
      description: '전체 선택 체크박스 라벨(true면 "전체")',
    },
    maxVisible: { type: 'number', description: '처음 보일 선택지 수(넘치면 더 보기)' },
    disabled: { type: 'boolean', default: false, description: '전체 비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: {
      type: 'boolean',
      default: false,
      description: '하나 이상 필수(Field required면 자동)',
    },
    name: { type: 'string', description: '폼 이름(고른 값마다 하나씩 제출)' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'loading', 'error'],
  a11y: { role: 'group', keyboard: ['Tab', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
