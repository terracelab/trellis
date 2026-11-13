// 모달 창(Dialog · Drawer · Sheet)의 Tab 순환을 바로 처리한다(R-33).
// Base UI는 창 밖 포커스 가드가 포커스를 받은 다음 프레임에 안으로 되돌리는데, Tab을 빨리(자동 검사 · 키 반복)
// 누르면 그 사이에 body와 창 밖 버튼으로 나간다. 마지막 칸에서 Tab → 첫 칸, 첫 칸에서 Shift+Tab → 마지막 칸을
// keydown에서 바로 옮겨 가드까지 가지 않게 한다.
import type { KeyboardEvent } from 'react';

const TABBABLE =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"], summary, audio[controls], video[controls]';

/** root 안에서 Tab으로 닿는 요소(보이는 것만) */
export function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.hasAttribute('disabled') &&
      !el.hasAttribute('data-base-ui-focus-guard') &&
      !(el instanceof HTMLInputElement && el.type === 'hidden') &&
      !el.closest('[hidden], [inert]') &&
      (typeof el.checkVisibility !== 'function' || el.checkVisibility()),
  );
}

/** 모달 창 Popup의 onKeyDown */
export function trapTab(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'Tab' || e.defaultPrevented) return;
  const list = tabbables(e.currentTarget);
  if (list.length === 0) return;
  const first = list[0]!;
  const last = list[list.length - 1]!;
  const active = document.activeElement;
  if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && (active === first || active === e.currentTarget)) {
    e.preventDefault();
    last.focus();
  }
}
