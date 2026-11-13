/**
 * 말줄임으로 잘린 칸에만 전체 글자를 title로 단다(R-37 4 · 8). 가리킬 때 재므로 잘리지 않은 칸에는
 * title이 생기지 않는다. 앱이 직접 단 title은 건드리지 않는다. 화면 낭독기는 원래 전체 글자를 읽는다
 */
const AUTO = 'data-auto-title';

/** 숨은 글자(tl-sr-only) · aria-hidden을 뺀 보이는 글자 */
function visibleText(root: Element): string {
  let out = '';
  const walk = (node: Node) => {
    if (node.nodeType === 3) {
      out += node.textContent ?? '';
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.classList.contains('tl-sr-only')) return;
    node.childNodes.forEach(walk);
  };
  walk(root);
  return out.replace(/\s+/g, ' ').trim();
}

/** 이 요소나 바로 안 요소 하나가 가로로 넘치면 true. 숨은 글자는 1px 상자라 넘쳐 보여도 뺀다 */
function isCut(el: HTMLElement): boolean {
  if (el.scrollWidth > el.clientWidth + 1) return true;
  for (const child of Array.from(el.children)) {
    if (!(child instanceof HTMLElement) || child.classList.contains('tl-sr-only')) continue;
    if (child.clientWidth > 0 && child.scrollWidth > child.clientWidth + 1) return true;
  }
  return false;
}

/** el이 잘렸으면 보이는 전체 글자를 title로, 아니면 이 함수가 단 title을 걷는다 */
export function syncTruncatedTitle(el: HTMLElement): void {
  const own = el.hasAttribute('title') && !el.hasAttribute(AUTO);
  if (own) return;
  const text = isCut(el) ? visibleText(el) : '';
  if (text) {
    el.setAttribute('title', text);
    el.setAttribute(AUTO, '');
  } else if (el.hasAttribute(AUTO)) {
    el.removeAttribute('title');
    el.removeAttribute(AUTO);
  }
}
