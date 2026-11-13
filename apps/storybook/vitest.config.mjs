// vitest는 생성기 검사만 돈다(vrt/vrt.spec.ts는 Playwright 몫이라 뺀다)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['scripts/**/*.test.mjs'] },
});
