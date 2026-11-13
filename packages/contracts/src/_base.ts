// 공통 타입 · defineContract — docs/spec/components.md §2 그대로.
/**
 * 컨트롤 크기(D-97). 높이는 `density.control-height-{xs,sm,md,lg,xl}`
 * (compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56)
 */
export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Size = (typeof SIZES)[number];
/** touch = 휴대폰(breakpoint.sm 미만) 루트에 자동 적용(D-61) */
export type Density = 'compact' | 'comfortable' | 'touch';
export type ThemeMode = 'light' | 'dark';
export const STATES = [
  'default',
  'hover',
  'active',
  'focus',
  'disabled',
  'loading',
  'error',
] as const;
export type State = (typeof STATES)[number];
export const APPROVAL_STATES = ['draft', 'pending', 'approved', 'rejected', 'withdrawn'] as const;
export type ApprovalState = (typeof APPROVAL_STATES)[number];
export const APPROVAL_LABELS: Record<ApprovalState, string> = {
  draft: '기안',
  pending: '진행',
  approved: '승인',
  rejected: '반려',
  withdrawn: '회수',
};
export type StatusKind = 'info' | 'success' | 'warning' | 'danger';
export type FinanceKind = 'income' | 'expense' | 'neutral';
export type ModuleGroup = 'erp' | 'groupware' | 'ecm' | 'crm' | 'scm' | 'commerce' | 'mes';
/** modules.json에서 생성(P1-01 `gen-module-types.mjs`). 그때까지는 string */
export type ModuleId = string;

/** 플랫폼 공통 최소 props */
export interface ContractBase {
  id?: string;
  testID?: string;
}

export interface PropMeta {
  type: string;
  default?: unknown;
  required?: boolean;
  values?: readonly string[];
  description: string;
}

export interface Contract<P> {
  /** = 폴더 이름 = displayName = Figma 컴포넌트 이름 */
  name: string;
  props: { [K in keyof P]-?: PropMeta };
  /** 7개 중 지원하는 것 */
  states: readonly State[];
  a11y: {
    role?: string;
    keyboard: readonly string[];
    labelling: 'children' | 'aria-label' | 'label-prop';
  };
  slots?: readonly string[];
  /** native=false면 네이티브 parity 검사 제외 */
  platforms: { web: true; native: boolean };
}

export function defineContract<P>(c: Contract<P>): Contract<P> {
  return c;
}
