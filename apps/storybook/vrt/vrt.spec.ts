// 컴포넌트마다 VRT 태그 스토리 1개(Matrix, 없으면 첫 예시) × 라이트 · 다크 × compact · comfortable.
// 스냅샷: vrt/__snapshots__/<Name>/<story>-<theme>-<density>.png
import { expect, test } from '@playwright/test';
import {
  BRAND_COMPONENTS,
  BRAND_VARIANTS,
  DENSITIES,
  PHONE_VIEWPORT,
  THEMES,
  brandSnapshotPath,
  phoneSnapshotPath,
  snapshotPath,
  vrtStories,
} from './targets.mjs';

/** 날짜를 쓰는 컴포넌트(DueBadge · 달력)가 매일 다르게 그리지 않게(샘플 회사의 오늘) */
const FIXED_NOW = new Date('2026-11-06T09:00:00+09:00');
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

async function shoot(
  page: import('@playwright/test').Page,
  id: string,
  theme: string,
  density: string,
  brand: string,
  name: string[],
) {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.protocol.startsWith('http') && !LOCAL_HOSTS.has(url.hostname)) external.push(r.url());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};density:${density};locale:ko;brand:${brand}`,
  );
  await page.waitForFunction(
    ([t, d]) =>
      (document.body.classList.contains('sb-show-main') ||
        document.body.classList.contains('sb-show-errordisplay')) &&
      document.documentElement.dataset['theme'] === t &&
      document.documentElement.dataset['density'] === d,
    [theme, density] as const,
  );
  await expect(page.locator('body')).not.toHaveClass(/sb-show-errordisplay/);
  // 회사 색은 <head> style 하나로 들어온다(기본 주황은 없다)
  if (brand !== 'orange')
    await page.waitForSelector('style[data-tl-theme-style]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(name);
  expect(errors, '페이지 오류').toEqual([]);
  expect(external, '외부 요청').toEqual([]);
}

for (const { id, component, story, phone } of vrtStories()) {
  if (phone)
    for (const theme of THEMES)
      test(`${component} ${story} ${theme}-phone`, async ({ page }) => {
        await page.setViewportSize(PHONE_VIEWPORT);
        await shoot(
          page,
          id,
          theme,
          'compact',
          'orange',
          phoneSnapshotPath(component, story, theme),
        );
      });
  for (const theme of THEMES) {
    for (const density of DENSITIES) {
      test(`${component} ${story} ${theme}-${density}`, async ({ page }) => {
        await shoot(
          page,
          id,
          theme,
          density,
          'orange',
          snapshotPath(component, story, theme, density),
        );
      });
    }
  }
  if (!BRAND_COMPONENTS.includes(component)) continue;
  for (const brand of BRAND_VARIANTS) {
    for (const theme of THEMES) {
      test(`${component} ${story} brand-${brand} ${theme}-compact`, async ({ page }) => {
        await shoot(
          page,
          id,
          theme,
          'compact',
          brand,
          brandSnapshotPath(component, story, brand, theme),
        );
      });
    }
  }
}
