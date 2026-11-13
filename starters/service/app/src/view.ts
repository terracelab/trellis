// 테마 · 밀도: <html data-theme · data-density>에 두고 저장한다(index.html이 첫 페인트 전에 읽는다)
import { useEffect, useState } from 'react';

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function useHtmlAttr(attr: 'theme' | 'density', fallback: string) {
  const [value, setValue] = useState(
    () => document.documentElement.dataset[attr] ?? stored(attr) ?? fallback,
  );
  useEffect(() => {
    document.documentElement.dataset[attr] = value;
    try {
      localStorage.setItem(attr, value);
    } catch {
      /* 저장소를 못 쓰면 이번 방문만 */
    }
  }, [attr, value]);
  return [value, setValue] as const;
}

export const useTheme = () => useHtmlAttr('theme', 'light');
export const useDensity = () => useHtmlAttr('density', 'compact');
