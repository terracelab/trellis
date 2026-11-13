// 본문 마크다운 표를 가로 스크롤 칸(div.tl-site-md-table)으로 감싸고, 칸이 넘칠 때만 키보드로 갈 수 있는
// 영역(tabindex="0" · role="region" · 이름은 표 머리 글자)으로 만든다(axe scrollable-region-focusable, WCAG 2.1.1).
// 넘치지 않으면 속성을 떼어 탭 정류장을 늘리지 않는다. 폭 · 글꼴이 바뀌면 다시 본다.
// 토큰 표(TokenTable.astro)의 tl-site-table-wrap과 같은 방법이다. Astro 7 기본 마크다운 처리기는 rehype
// 플러그인을 돌리지 않으므로 감싸기도 여기서 한다. 스크립트가 없으면 Starlight 기본(표 자신이 스크롤)이다.
// 표 안 코드의 긴 경로(erp/tax/invoice-list)는 "/" 뒤에서 줄을 바꿀 수 있게 <wbr>을 넣는다. 끊을 곳이 없으면
// 그 열이 글자 길이만큼 넓어져 표가 본문 폭을 넘는다. <wbr>은 복사한 글에 들어가지 않는다.
// astro.config.mjs가 이 파일을 모든 페이지 head의 인라인 script로 넣는다.
(() => {
  const breakPaths = (table) => {
    for (const code of table.querySelectorAll('code')) {
      const text = code.textContent ?? '';
      if (code.childElementCount > 0 || !/[^/\s]\/[^/\s]/.test(text)) continue;
      const parts = text.split(/(?<=\/)/);
      code.textContent = '';
      parts.forEach((part, i) => {
        if (i > 0) code.append(document.createElement('wbr'));
        code.append(part);
      });
    }
  };
  const nameOf = (table) => {
    const caption = table.querySelector('caption')?.textContent?.trim();
    if (caption) return caption;
    return [...table.querySelectorAll('thead th')]
      .map((th) => th.textContent?.trim())
      .filter(Boolean)
      .join(' · ');
  };
  const sync = (wrap) => {
    const wide = wrap.scrollWidth > wrap.clientWidth;
    if (wide && !wrap.hasAttribute('tabindex')) {
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', nameOf(wrap.firstElementChild));
    } else if (!wide && wrap.hasAttribute('tabindex')) {
      wrap.removeAttribute('tabindex');
      wrap.removeAttribute('role');
      wrap.removeAttribute('aria-label');
    }
  };
  const start = () => {
    const tables = document.querySelectorAll('.sl-markdown-content table:not(.not-content table)');
    if (tables.length === 0) return;
    const wraps = [...tables].map((table) => {
      breakPaths(table);
      const wrap = document.createElement('div');
      wrap.className = 'tl-site-md-table';
      table.replaceWith(wrap);
      wrap.append(table);
      return wrap;
    });
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const wrap = entry.target.closest('.tl-site-md-table');
        if (wrap) sync(wrap);
      }
    });
    for (const wrap of wraps) {
      sync(wrap);
      observer.observe(wrap);
      observer.observe(wrap.firstElementChild);
    }
    document.fonts?.ready.then(() => wraps.forEach(sync));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
