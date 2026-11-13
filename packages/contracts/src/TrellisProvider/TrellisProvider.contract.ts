import type { Locale } from '../_shared/messages.js';
import { defineContract, type ContractBase, type Density, type ThemeMode } from '../_base.js';

/** 회사 테마(D-97 · D-98). 회사 메인 색 하나로 회사 색 토큰 21개를 4모드(라이트 · 다크 · 고대비 2)로 다시 계산한다 */
export interface TrellisThemeInput {
  /** 라이트 · 다크. 주면 data-theme을 맞춘다 */
  mode?: ThemeMode;
  /** 회사 메인 색 #RRGGBB. 기본 테마(#FE5C2B)와 같으면 덮지 않는다 */
  brand?: string;
  /** 회색 톤(D-58). 기본 cool */
  neutral?: 'cool' | 'neutral' | 'warm';
  /** 주 버튼 글자 규칙(D-97 정한 것 1). white = 흰 글자 우선(기본) · input = 입력 색 바탕 */
  buttonText?: 'white' | 'input';
}

export interface TrellisProviderProps extends ContractBase {
  /** 컴포넌트 문구 언어(D-65). 기본 ko. 숫자 · 금액 서식은 바뀌지 않는다 */
  locale?: Locale;
  /** 'light' · 'dark'면 `<html data-theme>`를 맞춘다. 객체면 회사 색까지 새로 고침 없이 입힌다(D-98). 없으면 건드리지 않는다 */
  theme?: ThemeMode | TrellisThemeInput;
  /** true면 이 Provider 안(한 화면 · 미리보기)에만 테마 · 밀도를 입힌다. `<html>`은 건드리지 않는다. 안쪽 Provider는 저절로 범위 지정이다 */
  scope?: boolean;
  /** 글자 크기 112 · 125%(data-font-scale, D-97). 20~24px 제목은 절반, 28px 이상은 그대로 */
  fontScale?: '100' | '112' | '125';
  /** 고대비(data-contrast="high"): 글자 7:1 · 선 4.5:1 */
  contrast?: 'normal' | 'high';
  /** 포커스 강조(data-focus="strong"): 링 3px + 진한 색 */
  focusRing?: 'normal' | 'strong';
  /** 링크 밑줄 항상(data-links="underline") */
  linkUnderline?: boolean;
  /** 색각 친화 차트 색(data-chart="cvd") */
  chartPalette?: 'default' | 'cvd';
  /** 움직임 줄이기(data-motion="reduce"). 기기 설정과 둘 중 하나만 켜져도 멈춘다 */
  motion?: 'auto' | 'reduce';
  /** 본문 최대 너비(data-content-width). auto면 와이드(1920 이상)에서만 1600 */
  contentWidth?: 'auto' | '1280' | '1440' | '1600' | 'full';
  /** 토스트 표시 시간 설정(WCAG 2.2.1). default = 규칙대로 · long = 두 배 · manual = 직접 닫을 때까지 */
  toastDuration?: 'default' | 'long' | 'manual';
  /** 주면 `<html data-density>`를 맞춘다. 휴대폰은 속성과 관계없이 touch(D-61) */
  density?: Density;
  /**
   * 앱 라우터 이동 함수(R-T34). 있으면 Link · PersonLabel href의 앱 안 주소를 새로 고침 없이 이것으로 연다.
   * 바깥 주소 · 새 탭(Ctrl · Cmd · 가운데 단추) · 같은 쪽 안 이동(#id)은 브라우저에 맡긴다. 안쪽 Provider는 바깥 것을 물려받는다
   */
  navigate?: (href: string) => void;
  children?: unknown;
}

export const TrellisProviderContract = defineContract<TrellisProviderProps>({
  name: 'TrellisProvider',
  props: {
    id: { type: 'string', description: '쓰지 않음(감싸는 요소 없음)' },
    testID: { type: 'string', description: '쓰지 않음(감싸는 요소 없음)' },
    locale: {
      type: "'ko' | 'en'",
      default: 'ko',
      values: ['ko', 'en'],
      description: '컴포넌트 문구 언어',
    },
    theme: {
      type: "'light' | 'dark' | { mode?, brand?, neutral?, buttonText? }",
      description: 'html data-theme, 또는 회사 테마(회사 메인 색 하나 → 회사 색 토큰 21개 × 4모드)',
    },
    scope: {
      type: 'boolean',
      default: false,
      description: '이 안에만 테마 · 밀도를 입힌다(미리보기 · 회사 설정 화면)',
    },
    fontScale: {
      type: "'100' | '112' | '125'",
      default: '100',
      values: ['100', '112', '125'],
      description: '글자 크기(data-font-scale)',
    },
    contrast: {
      type: "'normal' | 'high'",
      default: 'normal',
      values: ['normal', 'high'],
      description: '고대비(data-contrast)',
    },
    focusRing: {
      type: "'normal' | 'strong'",
      default: 'normal',
      values: ['normal', 'strong'],
      description: '포커스 강조(data-focus)',
    },
    linkUnderline: { type: 'boolean', default: false, description: '링크 밑줄 항상(data-links)' },
    chartPalette: {
      type: "'default' | 'cvd'",
      default: 'default',
      values: ['default', 'cvd'],
      description: '색각 친화 차트(data-chart)',
    },
    motion: {
      type: "'auto' | 'reduce'",
      default: 'auto',
      values: ['auto', 'reduce'],
      description: '움직임 줄이기(data-motion)',
    },
    contentWidth: {
      type: "'auto' | '1280' | '1440' | '1600' | 'full'",
      default: 'auto',
      values: ['auto', '1280', '1440', '1600', 'full'],
      description: '본문 최대 너비(data-content-width)',
    },
    toastDuration: {
      type: "'default' | 'long' | 'manual'",
      default: 'default',
      values: ['default', 'long', 'manual'],
      description: '토스트 표시 시간 설정(기본 · 길게 · 직접 닫기)',
    },
    density: {
      type: "'compact' | 'comfortable' | 'touch'",
      values: ['compact', 'comfortable', 'touch'],
      description: 'html data-density',
    },
    navigate: {
      type: '(href: string) => void',
      description: '앱 라우터 이동(Link · PersonLabel href의 앱 안 주소를 새로 고침 없이)',
    },
    children: { type: 'ReactNode', description: '앱' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  platforms: { web: true, native: true },
});
