// 사이트 공통 동작: 다크 테마 토글 · 회사 색 고르기 · 상단 바 그림자.
// 회사 색 프리셋은 presets.css에 범위 CSS로 들어 있어 속성만 바꾼다. 직접 고른 색(custom)은 테마 페이지가 만든다.
const root = document.documentElement;
const THEME_KEY = 'trellis-site-theme';
const BRAND_KEY = 'trellis-site-brand';
const BRAND_CSS_KEY = 'trellis-site-brand-css';
const STYLE_ID = 'tl-theme-preview';

const save = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* 저장소를 못 쓰면 이번 방문만 */
  }
};

export const currentBrand = () => root.dataset['brand'] ?? 'orange';

/**
 * 프리셋 id로 회사 색을 바꾼다. css를 주면 직접 고른 색(custom)이다.
 * persist: false는 저장하지 않는다(홈의 자동 전환). 저장한 색은 다음 방문과 다른 페이지에 이어진다
 */
export function setBrand(
  id: string,
  { css, persist = true }: { css?: string; persist?: boolean } = {},
) {
  root.dataset['brand'] = id;
  let style = document.getElementById(STYLE_ID);
  if (id === 'custom' && css) {
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = css;
  } else style?.remove();
  if (persist) {
    save(BRAND_KEY, id);
    save(BRAND_CSS_KEY, id === 'custom' && css ? css : null);
  }
  paintBrand();
  window.dispatchEvent(new CustomEvent('tl-site-brand', { detail: { id } }));
}

function paintBrand() {
  const now = currentBrand();
  for (const el of document.querySelectorAll<HTMLElement>('[data-brand-pick]:not([role="radio"])'))
    el.setAttribute('aria-pressed', String(el.dataset['brandPick'] === now));
  // 라디오 묶음: 고른 것만 탭으로 닿는다. 묶음에 고른 색이 없으면 첫 칸
  for (const group of document.querySelectorAll('[role="radiogroup"]')) {
    const items = [...group.querySelectorAll<HTMLElement>('[role="radio"][data-brand-pick]')];
    const checked = items.find((el) => el.dataset['brandPick'] === now);
    for (const el of items) {
      el.setAttribute('aria-checked', String(el === checked));
      el.tabIndex = el === (checked ?? items[0]) ? 0 : -1;
    }
  }
}

function paintTheme() {
  const dark = root.dataset['theme'] === 'dark';
  for (const el of document.querySelectorAll('[data-theme-toggle]'))
    el.setAttribute('aria-pressed', String(dark));
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('[data-theme-toggle]')) {
    root.dataset['theme'] = root.dataset['theme'] === 'dark' ? 'light' : 'dark';
    save(THEME_KEY, root.dataset['theme']);
    paintTheme();
    window.dispatchEvent(new CustomEvent('tl-site-theme'));
    return;
  }
  const pick = target?.closest<HTMLElement>('[data-brand-pick]');
  if (pick?.dataset['brandPick']) setBrand(pick.dataset['brandPick']);
});

// 라디오 묶음은 화살표로 옮긴다(선택이 포커스를 따라간다)
document.addEventListener('keydown', (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (target?.getAttribute('role') !== 'radio' || !target.dataset['brandPick']) return;
  const step =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : 0;
  if (!step) return;
  const group = target.closest('[role="radiogroup"]');
  const items = [...(group?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [])];
  const next = items[(items.indexOf(target) + step + items.length) % items.length];
  if (!next?.dataset['brandPick']) return;
  event.preventDefault();
  setBrand(next.dataset['brandPick']);
  next.focus();
});

// 스크롤하면 상단 바에 구분선
const bar = document.querySelector<HTMLElement>('[data-site-bar]');
const onScroll = () => bar?.toggleAttribute('data-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });

onScroll();
paintTheme();
paintBrand();
