import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

/**
 * 단위 하나(PG-38): 표기와 기준 단위 환산 계수. 기준 단위는 factor 1인 단위다(BOX = 24 EA면 EA는 1, BOX는 24).
 * factor가 없으면 환산하지 않는다
 */
export interface QuantityUnit {
  /** 현장 표기 그대로(EA · BOX · PLT · KG) */
  unit: string;
  /** 기준 단위 몇 개인지. 1이면 이 단위가 기준 단위 */
  factor?: number;
}

/** 단위 표기(글자든 QuantityUnit이든) */
export const unitName = (u: string | QuantityUnit): string => (typeof u === 'string' ? u : u.unit);

/** 기준 단위: factor가 1인 첫 단위. 없으면 환산하지 않는다 */
export function baseUnitOf(units?: readonly (string | QuantityUnit)[]): QuantityUnit | undefined {
  return units?.find((u): u is QuantityUnit => typeof u !== 'string' && u.factor === 1);
}

/**
 * 기준 단위 수량: value × (unit의 factor). 기준 단위가 없거나 unit에 factor가 없으면 null.
 * 실사 차이 · 피킹 부족처럼 단위가 섞인 수량을 더하고 뺄 때 쓴다
 *
 * ```ts
 * toBaseQuantity(10, 'BOX', [{ unit: 'EA', factor: 1 }, { unit: 'BOX', factor: 24 }]) // 240
 * ```
 */
export function toBaseQuantity(
  value: number | null | undefined,
  unit: string,
  units?: readonly (string | QuantityUnit)[],
): number | null {
  if (value == null || !Number.isFinite(value) || !baseUnitOf(units)) return null;
  const u = units?.find((x) => unitName(x) === unit);
  const factor = u && typeof u !== 'string' ? u.factor : undefined;
  if (factor == null || !Number.isFinite(factor)) return null;
  // 소수 단위(0.5KG)를 곱해도 자릿수 오차가 남지 않게 6자리에서 맞춘다
  return Math.round(value * factor * 1e6) / 1e6;
}

export interface QuantityInputProps extends ContractBase {
  /** Field 밖(표 칸 · 필터)에서 쓸 때의 접근성 이름 */
  label?: string;
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  /** 단위(현장 표기 그대로: EA · BOX · kg) */
  unit?: string;
  /**
   * 있으면 단위를 고를 수 있다. QuantityUnit의 factor를 주면 기준 단위(factor 1)로 바꾼 수량을 칸 아래에 보인다
   * (10BOX → = 240EA). factor가 없으면 고르기만 한다
   */
  units?: readonly (string | QuantityUnit)[];
  onUnitChange?: (unit: string) => void;
  /** 증감 단위(버튼 · 화살표 키) */
  step?: number;
  min?: number;
  max?: number;
  /** 소수 자릿수 */
  digits?: number;
  /** − / + 버튼 */
  showStepper?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: Size;
  name?: string;
}

export const QuantityInputContract = defineContract<QuantityInputProps>({
  name: 'QuantityInput',
  props: {
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
    id: { type: 'string', description: 'DOM id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'number | null', description: '수량(제어)' },
    defaultValue: { type: 'number | null', description: '처음 수량(비제어)' },
    onChange: { type: '(value: number | null) => void', description: '수량이 바뀔 때' },
    unit: { type: 'string', default: 'EA', description: '단위(units가 있으면 고른 단위)' },
    units: {
      type: '(string | { unit: string; factor?: number })[]',
      description: '고를 수 있는 단위(factor = 기준 단위 몇 개, 있으면 기준 수량을 보인다)',
    },
    onUnitChange: { type: '(unit: string) => void', description: '단위가 바뀔 때' },
    step: { type: 'number', default: 1, description: '증감 단위' },
    min: { type: 'number', default: 0, description: '최소' },
    max: { type: 'number', description: '최대' },
    digits: { type: 'number', default: 0, description: '소수 자릿수' },
    showStepper: { type: 'boolean', default: true, description: '− / + 버튼' },
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
    role: 'textbox',
    keyboard: ['숫자 입력', 'ArrowUp', 'ArrowDown', 'Shift+Arrow(×10)', 'Home', 'End'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
