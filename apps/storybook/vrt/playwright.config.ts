// VRT 설정(docs/spec/pipeline.md §3). 고정 Docker 이미지 안에서만 돈다 — vrt/run.mjs가 감싼다.
import { defineConfig } from '@playwright/test';

const PORT = Number(process.env['VRT_PORT'] ?? 6107);
const workers = process.env['VRT_WORKERS'] ? Number(process.env['VRT_WORKERS']) : undefined;

export default defineConfig({
  testDir: '.',
  testMatch: 'vrt.spec.ts',
  outputDir: '../test-results',
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: true,
  // 플레이크 정책: 2회 재시도 후에도 다르면 실패(갱신할 때는 재시도 없음)
  retries: process.env['VRT_UPDATE'] === '1' ? 0 : 2,
  ...(workers ? { workers } : {}),
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  webServer: {
    command: `node vrt/serve.mjs ${PORT}`,
    cwd: '..',
    url: `http://127.0.0.1:${PORT}/index.json`,
    reuseExistingServer: false,
    stdout: 'ignore',
  },
});
