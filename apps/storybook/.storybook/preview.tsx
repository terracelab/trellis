// 전역 툴바(테마 · 밀도 · 문구 언어)와 데코레이터. CSS는 소비 앱과 같은 세 파일을 같은 순서로.
import '@terracelab/trellis-tokens/fonts.css';
import '@terracelab/trellis-tokens/tokens.css';
import '@terracelab/trellis-react/styles.css';
import './preview.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import type { Density, Locale, ThemeMode } from '@terracelab/trellis-contracts';
import { TrellisProvider } from '@terracelab/trellis-react';
import { useLayoutEffect, type ReactNode } from 'react';

/** 회사 색 툴바(PR-30): 검증 색 중 넷. 기본 주황은 tokens.css 그대로라 덮지 않는다 */
export const BRANDS = {
  orange: { title: '주황(기본)', hex: '#FE5C2B' },
  blue: { title: '파랑', hex: '#1F56E2' },
  yellow: { title: '노랑', hex: '#FFD400' },
  black: { title: '거의 검정', hex: '#111111' },
} as const;
type BrandId = keyof typeof BRANDS;

/** <html data-theme data-density>는 그리기 전에 맞춘다(VRT 첫 화면이 바로 그 조합이어야 한다) */
function Frame({
  theme,
  density,
  locale,
  brand,
  children,
}: {
  theme: ThemeMode;
  density: Density;
  locale: Locale;
  brand: BrandId;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.dataset['theme'] = theme;
    html.dataset['density'] = density;
  }, [theme, density]);
  return (
    <TrellisProvider locale={locale} theme={{ brand: (BRANDS[brand] ?? BRANDS.orange).hex }}>
      <div className="tl-storybook-frame">{children}</div>
    </TrellisProvider>
  );
}

const withTrellis: Decorator = (Story, { globals }) => (
  <Frame
    theme={globals['theme'] as ThemeMode}
    density={globals['density'] as Density}
    locale={globals['locale'] as Locale}
    brand={(globals['brand'] as BrandId) ?? 'orange'}
  >
    <Story />
  </Frame>
);

const preview: Preview = {
  decorators: [withTrellis],
  globalTypes: {
    theme: {
      description: '테마',
      toolbar: {
        title: '테마',
        icon: 'contrast',
        items: [
          { value: 'light', title: '라이트' },
          { value: 'dark', title: '다크' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: '밀도(640 미만 폭은 속성과 관계없이 touch)',
      toolbar: {
        title: '밀도',
        icon: 'component',
        items: [
          { value: 'compact', title: 'compact' },
          { value: 'comfortable', title: 'comfortable' },
          { value: 'touch', title: 'touch' },
        ],
        dynamicTitle: true,
      },
    },
    brand: {
      description: '회사 색(TrellisProvider theme.brand, D-98). 회사 색 토큰 21개만 바뀐다',
      toolbar: {
        title: '회사 색',
        icon: 'paintbrush',
        items: Object.entries(BRANDS).map(([value, b]) => ({
          value,
          title: `${b.title} ${b.hex}`,
        })),
        dynamicTitle: true,
      },
    },
    locale: {
      description: '컴포넌트 문구 언어(TrellisProvider locale)',
      toolbar: {
        title: '언어',
        icon: 'globe',
        items: [
          { value: 'ko', title: '한국어' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', density: 'compact', locale: 'ko', brand: 'orange' },
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default preview;
