import { useLayoutEffect } from 'react';

/**
 * Base UI 콤보박스는 입력 칸이 팝업 밖에 있으면 열릴 때 바깥 전체에 aria-hidden="true"를 붙인다.
 * 바깥의 다른 입력 칸은 그대로 초점을 받아서 axe aria-hidden-focus(serious)가 난다(R-35).
 * ARIA 콤보박스 패턴은 바깥을 숨기지 않으므로, 열린 동안 새로 붙은 aria-hidden만 걷는다.
 * 이미 숨어 있던 것(아이콘 · 대화 상자가 숨긴 바깥)은 Base UI도 건드리지 않으니 그대로 남는다.
 */
export function useUnhideOutside(open: boolean) {
  useLayoutEffect(() => {
    if (!open || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target;
        if (
          r.oldValue === null &&
          el instanceof Element &&
          el.getAttribute('aria-hidden') === 'true'
        )
          el.removeAttribute('aria-hidden');
      }
    });
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden'],
      attributeOldValue: true,
    });
    return () => observer.disconnect();
  }, [open]);
}
