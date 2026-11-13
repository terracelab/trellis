import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

export interface ScanFieldProps extends ContractBase {
  /** 접근성 이름 · 위 라벨(바코드 스캔) */
  label: string;
  placeholder?: string;
  /** 스캐너가 Enter로 끝내면(또는 손으로 입력하고 Enter) */
  onScan?: (code: string) => void;
  /** 포커스를 잃으면 2초 안에 되찾는다(키보드 웨지 스캐너용) */
  keepFocus?: boolean;
  /** 최근 스캔(위가 최신) */
  recent?: readonly string[];
  disabled?: boolean;
  size?: Size;
}

export const ScanFieldContract = defineContract<ScanFieldProps>({
  name: 'ScanField',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    label: { type: 'string', required: true, description: '이름' },
    placeholder: { type: 'string', default: '바코드를 스캔하거나 입력하세요', description: '예시' },
    onScan: { type: '(code: string) => void', description: '스캔 완료' },
    keepFocus: { type: 'boolean', default: true, description: '포커스 유지' },
    recent: { type: 'string[]', description: '최근 스캔' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'lg',
      values: SIZES,
      description: '높이(현장은 lg)',
    },
  },
  states: ['default', 'focus', 'disabled'],
  a11y: {
    role: 'textbox',
    keyboard: ['Enter(스캔 완료)', 'Escape(지우기)'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
