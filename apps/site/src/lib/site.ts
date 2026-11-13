// 사이트 공통: 주소 만들기 · 내비게이션 · 숫자. 숫자는 전부 빌드 때 저장소에서 읽는다(손으로 적지 않는다).
import manifest from '@terracelab/trellis-react/docs/manifest.json';
import { TRELLIS } from '@terracelab/seo';
import { ICON_NAMES } from '@terracelab/trellis-icons';
import { THEME_PRESETS, createTheme } from '@terracelab/trellis-tokens/theme';

/** 검색 · 답변 엔진이 읽는 사이트 이름과 한 문단 소개. 문서 사이트와 같은 글이다(@terracelab/seo) */
export const SITE_NAME = TRELLIS.name;
export const SITE_ABOUT = TRELLIS.about.ko;

/** 사이트가 놓이는 경로. 도메인 루트면 '/', GitHub Pages 프로젝트 주소면 '/trellis/' 같은 값 */
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** 사이트 안 주소. to('docs/guide/install/') → '/trellis/docs/guide/install/' */
export const to = (path = '') => BASE + path.replace(/^\//, '');

export const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** 문서(apps/docs) · 데모(apps/demo)는 같은 묶음 안의 다른 앱이다. 주소만 여기서 정한다 */
export const LINKS = {
  home: to(''),
  components: to('components/'),
  blocks: to('blocks/'),
  themes: to('themes/'),
  faq: to('faq/'),
  docs: to('docs/guide/overview/'),
  start: to('docs/guide/install/'),
  agents: to('docs/guide/agents/'),
  theming: to('docs/guide/theme/'),
  principles: to('docs/guide/principles/'),
  content: to('docs/guide/content/'),
  tokens: to('docs/foundations/tokens/'),
  changelog: to('docs/changelog/'),
  english: to('en/'),
  figma: to('docs/guide/figma/'),
  versions: to('docs/guide/versions/'),
  llms: to('llms.txt'),
  demo: to('demo/'),
  /** 공개 소스 저장소(D-153) */
  source: 'https://github.com/terracelab/trellis',
  component: (name: string) => to(`docs/components/${kebab(name)}/`),
  block: (id: string) => to(`demo/#/${id}`),
} as const;

export const NAV = [
  { key: 'docs', label: '문서', href: LINKS.docs },
  { key: 'components', label: '컴포넌트', href: LINKS.components },
  { key: 'blocks', label: '블록', href: LINKS.blocks },
  { key: 'themes', label: '테마', href: LINKS.themes },
  { key: 'demo', label: '데모', href: LINKS.demo },
] as const;

export type PageKey = (typeof NAV)[number]['key'] | 'home' | 'faq';

const blockFiles = import.meta.glob('../../../../blocks/src/*/*/*/block.json', { eager: true });

export const FACTS = {
  version: manifest.docsVersion,
  /** 패키지 버전(1.0.0 꼴). 구조화 데이터에 쓴다. 화면에는 문서 버전(v1.0 꼴)을 보인다 */
  release: manifest.version,
  tokens: manifest.tokens.count,
  components: manifest.components.length,
  charts: manifest.components.filter((c) => c.category === 'chart').length,
  modules: manifest.modules.modules.length,
  blocks: Object.keys(blockFiles).length,
  icons: ICON_NAMES.length,
  presets: THEME_PRESETS.length,
  /** 회사 테마 하나에 도는 대비 검사 수(라이트 · 다크 · 고대비 라이트 · 고대비 다크) */
  themeChecks: createTheme().checks.length,
} as const;

export const n = (value: number) => value.toLocaleString('ko-KR');
