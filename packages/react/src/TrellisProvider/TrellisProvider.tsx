import {
  TrellisProviderContract,
  type TrellisProviderProps,
  type TrellisThemeInput,
} from '@terracelab/trellis-contracts';
import { DEFAULT_BRAND, createTheme, themeCss } from '@terracelab/trellis-tokens/theme';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useInsertionEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { LocaleContext } from '../_internal/locale.js';
import { NavigateContext } from '../_internal/navigate.js';
import { ToastPreferenceContext } from '../_internal/toastPreference.js';

export type TrellisProviderWebProps = Omit<TrellisProviderProps, 'children' | 'id' | 'testID'> & {
  children?: ReactNode;
};

/** 안쪽 Provider는 <html>을 건드리지 않는다(문서 예시처럼 페이지 일부만 다른 언어일 때) */
const NestedContext = createContext(false);

type RootAttribute =
  | 'lang'
  | 'data-theme'
  | 'data-density'
  | 'data-font-scale'
  | 'data-contrast'
  | 'data-focus'
  | 'data-links'
  | 'data-chart'
  | 'data-motion'
  | 'data-content-width';

/** <html> 속성 하나를 바꾸고, 내려갈 때 원래 값으로 돌린다 */
function useRootAttribute(name: RootAttribute, value: string | undefined, skip: boolean) {
  useEffect(() => {
    if (skip || value === undefined) return;
    const root = document.documentElement;
    const prev = root.getAttribute(name);
    root.setAttribute(name, value);
    return () => {
      if (prev === null) root.removeAttribute(name);
      else root.setAttribute(name, prev);
    };
  }, [name, value, skip]);
}

/** 기본 테마(tokens.css = createTheme(DEFAULT_BRAND))와 같으면 덮을 것이 없다 */
function isDefaultTheme(t: TrellisThemeInput): boolean {
  return (
    (!t.brand || t.brand.toUpperCase() === DEFAULT_BRAND) &&
    (t.neutral ?? 'cool') === 'cool' &&
    (t.buttonText ?? 'white') === 'white'
  );
}

/**
 * 회사 테마 CSS를 <head>에 넣는다(D-98). 같은 입력이면 Node(gen-theme)와 같은 값이다.
 * scope가 있으면 그 범위 선택자 안에만, 없으면 tokens.css와 같은 선택자로 문서 전체에.
 */
function useCompanyTheme(theme: TrellisThemeInput | undefined, scope: string | undefined) {
  const brand = theme?.brand;
  const neutral = theme?.neutral;
  const buttonText = theme?.buttonText;
  const hasTheme = theme !== undefined;
  const css = useMemo(() => {
    if (!hasTheme || isDefaultTheme({ brand, neutral, buttonText })) return null;
    try {
      return themeCss(createTheme({ brand, neutral, buttonText }), { scope });
    } catch {
      // 형식이 틀린 색(입력 중인 글자)은 지금 테마를 그대로 둔다
      return null;
    }
    // theme 객체 자체가 아니라 값이 바뀔 때만 다시 계산한다
  }, [brand, neutral, buttonText, scope, hasTheme]);
  useInsertionEffect(() => {
    if (!css) return;
    const el = document.createElement('style');
    el.setAttribute('data-tl-theme-style', scope ?? 'root');
    el.textContent = css;
    document.head.appendChild(el);
    return () => el.remove();
  }, [css, scope]);
}

/** 접근성 모드 props → data-* 값. 기본값(100 · normal · auto · default · false)이면 속성을 걸지 않는다(D-97) */
function modeAttributes(p: TrellisProviderWebProps): Partial<Record<RootAttribute, string>> {
  const out: Partial<Record<RootAttribute, string>> = {};
  if (p.fontScale && p.fontScale !== '100') out['data-font-scale'] = p.fontScale;
  if (p.contrast === 'high') out['data-contrast'] = 'high';
  if (p.focusRing === 'strong') out['data-focus'] = 'strong';
  if (p.linkUnderline) out['data-links'] = 'underline';
  if (p.chartPalette === 'cvd') out['data-chart'] = 'cvd';
  if (p.motion === 'reduce') out['data-motion'] = 'reduce';
  if (p.contentWidth && p.contentWidth !== 'auto') out['data-content-width'] = p.contentWidth;
  return out;
}

export function TrellisProvider(props: TrellisProviderWebProps) {
  const { locale = 'ko', theme, density, scope = false, children } = props;
  const modes = modeAttributes(props);
  const nested = useContext(NestedContext);
  // 이동 함수는 안쪽 Provider가 주지 않으면 바깥 것을 물려받는다(R-T34)
  const outerNavigate = useContext(NavigateContext);
  const navigate = props.navigate ?? outerNavigate;
  // 안쪽 Provider는 저절로 범위 지정이다(바깥 <html>을 바꾸지 않는다)
  const scoped = scope || nested;
  const input: TrellisThemeInput | undefined =
    typeof theme === 'object' ? theme : theme ? { mode: theme } : undefined;
  const mode = input?.mode;
  const rawId = useId();
  const scopeId = `t${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const scopeSelector = scoped ? `[data-tl-theme="${scopeId}"]` : undefined;

  useRootAttribute('lang', locale, nested);
  useRootAttribute('data-theme', mode, scoped);
  useRootAttribute('data-density', density, scoped);
  useRootAttribute('data-font-scale', modes['data-font-scale'], scoped);
  useRootAttribute('data-contrast', modes['data-contrast'], scoped);
  useRootAttribute('data-focus', modes['data-focus'], scoped);
  useRootAttribute('data-links', modes['data-links'], scoped);
  useRootAttribute('data-chart', modes['data-chart'], scoped);
  useRootAttribute('data-motion', modes['data-motion'], scoped);
  useRootAttribute('data-content-width', modes['data-content-width'], scoped);
  useCompanyTheme(input, scopeSelector);

  const content = (
    <LocaleContext.Provider value={locale}>
      <ToastPreferenceContext.Provider value={props.toastDuration ?? 'default'}>
        <NavigateContext.Provider value={navigate}>{children}</NavigateContext.Provider>
      </ToastPreferenceContext.Provider>
    </LocaleContext.Provider>
  );
  return (
    <NestedContext.Provider value={true}>
      {scoped && (input || density || Object.keys(modes).length > 0) ? (
        // 범위 요소: 박스를 만들지 않는다(display: contents). CSS 변수 · data-* 속성은 그대로 이어진다
        <div
          data-tl-theme={scopeId}
          data-theme={mode}
          data-density={density}
          {...modes}
          className="tl-theme-scope"
        >
          {content}
        </div>
      ) : (
        content
      )}
    </NestedContext.Provider>
  );
}
TrellisProvider.displayName = TrellisProviderContract.name;
