// VRT 대상과 스냅샷 이름(docs/spec/pipeline.md §3). vrt.spec.ts와 run.mjs(오래된 스냅샷 정리)가 같이 쓴다.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const APP = fileURLToPath(new URL('..', import.meta.url));
export const STATIC_DIR = fileURLToPath(new URL('../storybook-static/', import.meta.url));
export const SNAPSHOT_DIR = fileURLToPath(new URL('./__snapshots__/', import.meta.url));
/** 이 태그가 붙은 스토리만 찍는다(생성기가 컴포넌트마다 Matrix, 없으면 첫 예시에 붙인다) */
export const VRT_TAG = 'vrt';
export const THEMES = /** @type {const} */ (['light', 'dark']);
export const DENSITIES = /** @type {const} */ (['compact', 'comfortable']);
/** 회사 색을 바꿔도 깨지지 않는지(PR-30): 대표 컴포넌트 × 파랑 · 노랑 × 라이트 · 다크(compact) */
export const BRAND_VARIANTS = /** @type {const} */ (['blue', 'yellow']);
export const BRAND_COMPONENTS = [
  'Button',
  'Badge',
  'Tabs',
  'Input',
  'Select',
  'Checkbox',
  'Switch',
  'DataGrid',
  'AppShell',
  'SideNav',
  'Toast',
  'Dialog',
  'KpiCard',
  'TrendChart',
];

/** 휴대폰 폭 스냅샷(PR-38): 태그 vrt-phone이 붙은 스토리를 이 크기로 한 번 더 찍는다(라이트 · 다크, compact 속성. 폭 640 미만이라 화면은 touch) */
export const PHONE_TAG = 'vrt-phone';
export const PHONE_VIEWPORT = { width: 390, height: 844 };

/**
 * storybook-static/index.json → VRT 대상
 * @returns {{ id: string, component: string, story: string, phone: boolean }[]}
 */
export function vrtStories() {
  const index = JSON.parse(readFileSync(`${STATIC_DIR}index.json`, 'utf8'));
  return Object.values(index.entries)
    .filter((e) => e.type === 'story' && e.tags?.includes(VRT_TAG))
    .map((e) => ({
      id: e.id,
      component: e.title.split('/').pop(),
      story: e.id.split('--')[1],
      phone: e.tags.includes(PHONE_TAG),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** __snapshots__ 아래 상대 경로: <Name>/<story>-<theme>-<density>.png */
export function snapshotPath(component, story, theme, density) {
  return [component, `${story}-${theme}-${density}.png`];
}

/** 회사 색 변형: <Name>/<story>-brand-<id>-<theme>-compact.png */
export function brandSnapshotPath(component, story, brand, theme) {
  return [component, `${story}-brand-${brand}-${theme}-compact.png`];
}

/** 휴대폰 폭: <Name>/<story>-<theme>-phone.png */
export function phoneSnapshotPath(component, story, theme) {
  return [component, `${story}-${theme}-phone.png`];
}

/** 대상 전체 × 4조합 + 대표 컴포넌트 × 회사 색 2 × 테마 2 + 휴대폰 폭 스토리 × 테마 2의 스냅샷 상대 경로 */
export function expectedSnapshots() {
  const stories = vrtStories();
  return [
    ...stories.flatMap(({ component, story }) =>
      THEMES.flatMap((t) => DENSITIES.map((d) => snapshotPath(component, story, t, d).join('/'))),
    ),
    ...stories
      .filter(({ component }) => BRAND_COMPONENTS.includes(component))
      .flatMap(({ component, story }) =>
        BRAND_VARIANTS.flatMap((b) =>
          THEMES.map((t) => brandSnapshotPath(component, story, b, t).join('/')),
        ),
      ),
    ...stories
      .filter(({ phone }) => phone)
      .flatMap(({ component, story }) =>
        THEMES.map((t) => phoneSnapshotPath(component, story, t).join('/')),
      ),
  ];
}
