// 데모 설정 저장: 테마 · 접근성 · 옆 칸 폭. 이 브라우저에만 남는다(저장소를 못 쓰면 이번 방문만)
import type { TrellisProviderProps } from '@terracelab/trellis-contracts';
import { useEffect, useState } from 'react';

export const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* 저장소를 못 쓰면 이번 방문만 */
    }
  },
};

/** 데모가 놓인 자리의 한 단계 위(소개 사이트). /trellis/demo/ → /trellis/ */
export const HOME_HREF = import.meta.env.BASE_URL.replace(/demo\/$/, '');

/**
 * 테마 저장 키. 소개 사이트와 같은 주소(origin)에 묶여 나가므로 사이트에서 고른 테마를 데모가 따르고,
 * 데모에서 바꾸면 둘 다에 적는다. index.html의 첫 페인트 스크립트와 읽는 순서가 같다(사이트 → 데모 → 기기)
 */
export const THEME_KEYS = ['trellis-site-theme', 'tl-demo-theme'] as const;

export function saveTheme(theme: string) {
  for (const k of THEME_KEYS) store.set(k, theme);
}

/** 접근성 설정. TrellisProvider의 접근성 모드 props로 넘긴다(D-97) */
export interface A11ySettings {
  fontScale: '100' | '112' | '125';
  contrast: boolean;
  focusRing: boolean;
  linkUnderline: boolean;
  chartPalette: boolean;
  motion: boolean;
}

export const A11Y_DEFAULT: A11ySettings = {
  fontScale: '100',
  contrast: false,
  focusRing: false,
  linkUnderline: false,
  chartPalette: false,
  motion: false,
};

/** index.html의 첫 페인트 스크립트가 같은 키 · 같은 모양을 읽는다 */
export const A11Y_KEY = 'tl-demo-a11y';
const SCALES = ['100', '112', '125'] as const;

function readA11y(): A11ySettings {
  try {
    const raw = JSON.parse(store.get(A11Y_KEY) ?? 'null') as Partial<A11ySettings> | null;
    if (!raw || typeof raw !== 'object') return A11Y_DEFAULT;
    return {
      fontScale: SCALES.find((s) => s === raw.fontScale) ?? '100',
      contrast: raw.contrast === true,
      focusRing: raw.focusRing === true,
      linkUnderline: raw.linkUnderline === true,
      chartPalette: raw.chartPalette === true,
      motion: raw.motion === true,
    };
  } catch {
    return A11Y_DEFAULT;
  }
}

export function useA11y() {
  const [a11y, setA11y] = useState<A11ySettings>(readA11y);
  useEffect(() => {
    store.set(A11Y_KEY, JSON.stringify(a11y));
  }, [a11y]);
  return { a11y, setA11y };
}

/** 켠 접근성 설정 수(바 단추의 이름에 붙인다) */
export const a11yCount = (a: A11ySettings) =>
  [
    a.fontScale !== '100',
    a.contrast,
    a.focusRing,
    a.linkUnderline,
    a.chartPalette,
    a.motion,
  ].filter(Boolean).length;

export const a11yProps = (
  a: A11ySettings,
): Pick<
  TrellisProviderProps,
  'fontScale' | 'contrast' | 'focusRing' | 'linkUnderline' | 'chartPalette' | 'motion'
> => ({
  fontScale: a.fontScale,
  contrast: a.contrast ? 'high' : 'normal',
  focusRing: a.focusRing ? 'strong' : 'normal',
  linkUnderline: a.linkUnderline,
  chartPalette: a.chartPalette ? 'cvd' : 'default',
  motion: a.motion ? 'reduce' : 'auto',
});
