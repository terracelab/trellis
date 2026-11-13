// 데모(apps/demo/dist)를 사이트 dist/demo로 복사한다. one.terracelab.co.kr/demo/ 로 함께 배포된다(D-54).
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../../demo/dist', import.meta.url));
const OUT = fileURLToPath(new URL('../dist/demo', import.meta.url));
if (!existsSync(SRC)) {
  console.error(
    '데모 빌드가 없다. pnpm --filter @terracelab/demo build 를 먼저(turbo는 의존으로 자동 실행)',
  );
  process.exit(1);
}
rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });
console.log('demo → dist/demo');
