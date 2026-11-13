// Trellis 미리보기 v0. 토큰 빌드 산출물(tokens.css·fonts.css·flat·modules)만으로 그린다.
import '@terracelab/trellis-tokens/fonts.css';
import '@terracelab/trellis-tokens/tokens.css';
import '@terracelab/trellis-react/styles.css';
import './styles.css';
import { moduleTileSprite } from '@terracelab/trellis-icons/module-tiles';
import { value } from './lib';
import { chartsSection, mountCharts } from './sections/charts';
import { componentsSection } from './sections/components';
import { iconsSection, tokensSection, typographySection } from './sections/foundations';
import { homeSection } from './sections/home';
import { patternSection } from './sections/patterns';
import { showcaseSection } from './sections/showcase';

const WIDTHS = ['1440', '1024', '390'] as const;
type Width = (typeof WIDTHS)[number];

const segment = (key: string, label: string, options: [string, string][], current: string) => `
<div class="tl-preview-segment" role="group" aria-label="${label}">
  ${options.map(([val, text]) => `<button type="button" data-set="${key}" data-value="${val}" aria-pressed="${val === current}">${text}</button>`).join('')}
</div>`;

const NAV: [string, string][] = [
  ['showcase', '쇼케이스'],
  ['home', '업무 홈'],
  ['charts', '차트'],
  ['tokens', '토큰'],
  ['typography', '타이포그래피'],
  ['icons', '아이콘'],
  ['components', '컴포넌트'],
  ['pattern', '밀도'],
];

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<div class="tl-preview-app" data-theme="light" data-density="compact" data-width="1440">
  ${moduleTileSprite}
  <header class="tl-preview-bar">
    <div class="tl-preview-bar-brand"><h1 class="tl-preview-bar-title">Trellis</h1><span class="tl-preview-meta">미리보기 v0</span></div>
    <nav class="tl-preview-bar-nav" aria-label="섹션">${NAV.map(([id, label], i) => `<a href="#${id}"${i === 0 ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    <div class="tl-preview-bar-controls">
      ${segment(
        'theme',
        '테마',
        [
          ['light', 'Light'],
          ['dark', 'Dark'],
        ],
        'light',
      )}
      ${segment(
        'density',
        '밀도',
        [
          ['compact', 'Compact'],
          ['comfortable', 'Comfortable'],
        ],
        'compact',
      )}
      ${segment(
        'width',
        '프레임 폭',
        WIDTHS.map((w) => [w, w]),
        '1440',
      )}
    </div>
  </header>
  <main class="tl-preview-content">
    <div class="tl-preview-frame">
      ${showcaseSection()}${homeSection()}${chartsSection()}${tokensSection()}${typographySection()}${iconsSection()}${componentsSection()}${patternSection()}
    </div>
  </main>
  <footer class="tl-preview-foot"><span>토큰 값은 가안 · G2에서 확정</span><span>대비 승인 대기 5쌍 · docs/plan/notes/contrast-2026-11.md</span><span>2026-11-07</span></footer>
</div>`;

const root = app.querySelector<HTMLDivElement>('.tl-preview-app')!;
mountCharts(root);
const navLinks = [...app.querySelectorAll<HTMLAnchorElement>('.tl-preview-bar-nav a')];

function setWidth(width: Width, pressButton = true) {
  root.dataset['width'] = width;
  if (!pressButton) return;
  for (const b of app.querySelectorAll<HTMLButtonElement>('button[data-set="width"]'))
    b.setAttribute('aria-pressed', String(b.dataset['value'] === width));
}

app.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-set]');
  if (!button) return;
  const { set, value: val } = button.dataset as { set: string; value: string };
  if (set === 'width') setWidth(val as Width);
  else root.dataset[set] = val;
  for (const sibling of button.parentElement!.querySelectorAll('button'))
    sibling.setAttribute('aria-pressed', String(sibling === button));
});

// 실제 창이 좁으면(breakpoint.lg 미만) 390 레이아웃을 자동으로 쓴다
const narrow = matchMedia(`(max-width: ${value('breakpoint-lg', 'value')})`);
const syncWidth = () => {
  if (narrow.matches) setWidth('390');
};
narrow.addEventListener('change', syncWidth);
syncWidth();

// 보이는 섹션을 상단 탭에 표시
const sections = navLinks.map((a) => document.getElementById(a.getAttribute('href')!.slice(1))!);
const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    for (const a of navLinks) {
      if (a.getAttribute('href') === `#${visible.target.id}`)
        a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
  },
  { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.1, 0.5] },
);
for (const s of sections) observer.observe(s);
