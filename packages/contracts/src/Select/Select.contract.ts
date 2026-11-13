import type { IconName } from '@terracelab/trellis-icons';
import { APPROVAL_STATES, defineContract, SIZES, type ContractBase, type Size } from '../_base.js';
import { CHART_COLORS } from '../charts/_shared.js';

/**
 * 선택지 앞 점의 색. 토큰 이름만 받는다(raw 색 금지).
 * 차트 계열 슬롯(series-1~5 · compare · income · expense · success · warning · danger, 범례와 같은 색) +
 * 상태 톤(info · neutral) + 결재 5상태(draft · pending · approved · rejected · withdrawn, 결재 배지 점과 같은 색)
 */
export const SELECT_MARK_TONES = [...CHART_COLORS, 'info', 'neutral', ...APPROVAL_STATES] as const;
export type SelectMarkTone = (typeof SELECT_MARK_TONES)[number];

/** 선택지 이름 앞 표시. 닫힌 칸에도 고른 선택지의 표시가 보인다 */
export type SelectLeading =
  { kind: 'dot'; tone: SelectMarkTone } | { kind: 'icon'; icon: IconName };

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** 이름 앞 점(토큰 이름) 또는 아이콘 */
  leading?: SelectLeading;
  /** 이름 오른쪽 흐린 보조 글자("사용 중"). disabled와 따로 쓴다 */
  note?: string;
}

export interface SelectProps extends ContractBase {
  options: readonly SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  /** 필터 바처럼 내용 폭만 */
  width?: 'auto' | 'full';
  /** Field 밖에서 쓸 때의 접근성 이름(필터 · 바) */
  label?: string;
}

export const SelectContract = defineContract<SelectProps>({
  name: 'Select',
  props: {
    id: { type: 'string', description: '트리거 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    options: {
      type: 'SelectOption[]',
      required: true,
      description: '선택지(value · label · disabled · leading · note)',
    },
    value: { type: 'string | null', description: '값(제어)' },
    defaultValue: { type: 'string | null', description: '처음 값' },
    onChange: { type: '(value: string | null) => void', description: '바뀔 때' },
    placeholder: { type: 'string', default: '선택', description: '값이 없을 때' },
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
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'combobox',
    keyboard: ['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'Escape', '글자 입력(찾기)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
