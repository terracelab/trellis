export type NeutralTone = 'cool' | 'neutral' | 'warm';
/** 주 버튼 글자 규칙(D-97 정한 것 1). white = A(흰 글자 우선, 바탕을 진하게) · input = B(입력 색 바탕) */
export type ButtonTextRule = 'white' | 'input';
export type ThemeModeKey = 'light' | 'dark' | 'hcLight' | 'hcDark';
export type Step = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type Scale = Record<Step, string>;

export interface ThemeInput {
  /** 회사 메인 색 #RRGGBB. 기본 DEFAULT_BRAND */
  brand?: string;
  neutral?: NeutralTone;
  buttonText?: ButtonTextRule;
}

export interface ThemeCheck {
  mode: ThemeModeKey;
  name: string;
  fg: string;
  bg: string;
  /** 대비(WCAG) 또는 색차(ΔEOK, 이름에 "구분됨"이 들어간 검사) */
  ratio: number;
  min: number;
  pass: boolean;
}

export interface ThemeWarning {
  id: 'danger' | 'income' | 'success' | 'warning' | 'expense' | 'info' | 'chart1';
  label: string;
  mode: 'light' | 'dark';
  role: string;
  brand: string;
  fixed: string;
  deltaE: number;
  /** 색상(hue)만 돌려 겹치지 않는 가까운 색 */
  alternatives: string[];
  /** 입력 색 바탕(B)으로 바꾸면 풀릴 때 'input' */
  buttonTextAlternative: ButtonTextRule | null;
  message: string;
}

export interface Theme {
  /** 입력한 회사 색(대문자) */
  input: string;
  tone: NeutralTone;
  buttonText: ButtonTextRule;
  brand: Scale;
  /** 사이드바 톤(회사 색상 · 저채도) */
  shell: Record<string, string>;
  alpha: Record<'8' | '16' | '24', string>;
  /** 600 단계를 흰 글자 5:1에 맞춰 옮겼는가 */
  anchored: boolean;
  neutral: Scale;
  graphite: Scale;
  /** 모드별 토큰 경로 → primitive 참조('brand.600' · 'shell.800' · 'alpha.brand.16' · 'base.white') */
  refs: Record<ThemeModeKey, Record<string, string>>;
  /** 모드별로 덮을 CSS 변수 → 값 */
  light: Record<string, string>;
  dark: Record<string, string>;
  hcLight: Record<string, string>;
  hcDark: Record<string, string>;
  checks: ThemeCheck[];
  ok: boolean;
  /** 단계를 옮긴 이유 */
  notes: string[];
  warnings: ThemeWarning[];
  /** 다른 규칙 제안(R-T52). 아주 밝은 회사 색에서 흰 글자 규칙이 주 버튼 · 강조를 멀리 옮겼고 입력 색 바탕이 검사를 모두 넘을 때 */
  suggestions: ThemeSuggestion[];
}

export interface ThemeSuggestion {
  buttonText: ButtonTextRule;
  /** 지금 규칙의 라이트 주 버튼 */
  button: string;
  /** 제안 규칙의 라이트 주 버튼 */
  inputButton: string;
  /** 주 버튼 · 강조 중 입력 색에 가까운 쪽의 색차(ΔEOK) */
  deltaE: number;
  message: string;
}

export interface ThemePreset {
  id: string;
  label: string;
  brand: string;
  neutral: NeutralTone;
}

export const DEFAULT_BRAND: string;
export const MODES: readonly ThemeModeKey[];
export const STEPS: readonly Step[];
export const BUTTON_TARGET: number;
export const OVERLAP_DE: number;
export const FAR_FROM_INPUT_DE: number;
export const SHELL_L: Record<string, number>;
export const SHELL_CHROMA: number;
export const BRAND_TOKENS: readonly string[];
export const NEUTRAL_MAP: Record<ThemeModeKey, Record<string, string>>;
export const FIXED_COLORS: readonly {
  id: ThemeWarning['id'];
  label: string;
  path: string;
  light: string;
  dark: string;
}[];
export const MODE_SELECTORS: Record<ThemeModeKey, string[]>;

export function createTheme(input?: ThemeInput): Theme;
export function themeCss(theme: Theme, options?: { header?: string; scope?: string }): string;
export function scopedSelectors(scope: string): Record<ThemeModeKey, string[]>;
export function brandScale(hex: string): { scale: Scale; moved: boolean; anchored: boolean };
export function shellScale(hex: string): Record<string, string>;
export function neutralScale(tone: NeutralTone): Scale;
export function graphiteScale(tone: NeutralTone): Scale;
export function hexToOklch(hex: string): { l: number; c: number; h: number };
export function oklchToHex(color: { l: number; c: number; h: number }): string;
export function normalizeHex(hex: string): string;
export function contrast(a: string, b: string): number;
export function deltaE(a: string, b: string): number;
export function composite(fg: string, bg: string): string;
export function cssVarOf(path: string): string;
export const NEUTRAL_TONES: readonly { id: NeutralTone; label: string; description: string }[];
export const THEME_PRESETS: readonly ThemePreset[];
export const THEME_VARS: readonly string[];
export const BASE_BRAND: Scale;
export const BASE_NEUTRAL: Scale;
export const BASE_GRAPHITE: Scale;
export function readThemeChoice(
  css: string | null | undefined,
): { brand: string; neutral: NeutralTone; buttonText?: ButtonTextRule } | null;
