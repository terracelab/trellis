export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ');

/** undefined 값을 뺀 객체(스프레드로 옵션 props를 넘길 때) */
export function def<T extends object>(o: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]: Exclude<T[K], undefined>;
  };
}

/** 개발 모드 경고(번들러가 process.env.NODE_ENV를 치환한다). */
declare const process: { env: Record<string, string | undefined> } | undefined;
export const isDev = typeof process !== 'undefined' && process?.env?.['NODE_ENV'] !== 'production';
export function warnDev(message: string): void {
  if (isDev) console.warn(`[trellis] ${message}`);
}
