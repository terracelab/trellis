// 미리보기 공용 도우미. 값은 전부 --tl-* 변수 또는 tokens 패키지 산출물에서 온다.
import flatJson from '@terracelab/trellis-tokens/flat';
import type { IconNode } from './generated/icons';
import { won } from './data';

export type Mode = 'value' | 'light' | 'dark' | 'compact' | 'comfortable';
export type Flat = Record<string, Partial<Record<Mode, string | number>>>;
export const flat = flatJson as Flat;

/** CSS 변수 참조 */
export const v = (name: string) => `var(--tl-${name})`;

export function esc(s: string | number): string {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!,
  );
}

/** 모듈 타일 일러스트(icons 패키지 스프라이트)의 사용처. 라벨은 옆 텍스트가 맡으므로 aria-hidden */
export function tile(tileId: string, size: string): string {
  return `<svg class="tl-preview-tile" style="width: ${size}; height: ${size}" aria-hidden="true" focusable="false"><use href="#tl-tile-${tileId}"></use></svg>`;
}

export function svg(node: IconNode, cls = 'tl-preview-icon'): string {
  const children = node
    .map(
      ([tag, attrs]) =>
        `<${tag} ${Object.entries(attrs)
          .map(([k, val]) => `${k}="${esc(val)}"`)
          .join(' ')}></${tag}>`,
    )
    .join('');
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${children}</svg>`;
}

/** #RRGGBBAA를 바탕 위에 합성 */
export function composite(fg: string, bg: string): string {
  if (fg.length !== 9) return fg;
  const a = parseInt(fg.slice(7), 16) / 255;
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) =>
      Math.round(ch(fg, i) * a + ch(bg, i) * (1 - a))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x 대비. 알파 색은 bg 위에 합성 */
export function contrast(fg: string, bg: string): number {
  const a = luminance(composite(fg, bg));
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function value(name: string, mode: Mode): string {
  const entry = flat[`--tl-${name}`];
  const found = entry?.[mode] ?? entry?.value;
  if (found === undefined) throw new Error(`토큰 없음: --tl-${name} (${mode})`);
  return String(found);
}

/** 섹션 = 미리보기의 한 페이지. 제목 + 한 줄 메모 + 내용 */
export const section = (id: string, title: string, note: string, body: string) => `
<section class="tl-preview-page" id="${id}" aria-labelledby="${id}-h">
  <header class="tl-preview-page-head">
    <h2 class="tl-preview-page-title" id="${id}-h">${title}</h2>
    <p class="tl-preview-page-note">${note}</p>
  </header>
  ${body}
</section>`;

/** 금액. 숫자는 tabular, 단위 "원"은 작게(시그니처) */
export const money = (n: number, cls = '') =>
  `<span class="tl-preview-money${cls ? ` ${cls}` : ''}">${won(n)}<span class="tl-preview-unit">원</span></span>`;

/** 카운트. 기본은 조용한 중립 알약, 지연·오류만 danger */
export const count = (n: number, tone: 'neutral' | 'danger' = 'neutral') =>
  `<span class="tl-preview-count" data-tone="${tone}" aria-label="${n}건">${n > 99 ? '99+' : n}</span>`;

export const avatar = (initials: string, size: 24 | 32 | 40 = 32) =>
  `<span class="tl-preview-avatar" style="width: ${v(`size-avatar-${size}`)}; height: ${v(`size-avatar-${size}`)}" aria-hidden="true">${initials}</span>`;

export const card = (cls: string, body: string, tag = 'article') =>
  `<${tag} class="tl-preview-card${cls ? ` ${cls}` : ''}">${body}</${tag}>`;

export const cardHead = (title: string, meta = '', action = '') =>
  `<header class="tl-preview-card-head"><h3 class="tl-preview-card-title">${title}</h3>${meta ? `<span class="tl-preview-meta">${meta}</span>` : ''}${action}</header>`;
