// 토큰 이름 전체 목록 → NAMES.lock (한 줄에 하나, 정렬). G1 이후 이름이 사라지면 major changeset이 필요하다.
//   node scripts/lock-names.mjs          NAMES.lock을 쓴다
//   node scripts/lock-names.mjs --check  최신이 아니면 종료 코드 1
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PKG = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(PKG, 'src');
export const LOCK_PATH = join(PKG, 'NAMES.lock');
const NOT_TOKENS = new Set(['modules.json', 'modules.schema.json']);

function listJson(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? listJson(join(dir, e.name))
      : e.name.endsWith('.json') && !NOT_TOKENS.has(e.name)
        ? [join(dir, e.name)]
        : [],
  );
}

function collect(node, path, out) {
  if (!node || typeof node !== 'object') return;
  if ('$value' in node) return out.add(path.join('.'));
  for (const [key, child] of Object.entries(node))
    if (!key.startsWith('$')) collect(child, [...path, key], out);
}

export function tokenNames() {
  const names = new Set();
  for (const file of listJson(SRC)) collect(JSON.parse(readFileSync(file, 'utf8')), [], names);
  return [...names].sort();
}

export function serialize(names) {
  return `${names.join('\n')}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const next = serialize(tokenNames());
  if (process.argv.includes('--check')) {
    const current = (() => {
      try {
        return readFileSync(LOCK_PATH, 'utf8');
      } catch {
        return '';
      }
    })();
    if (current !== next) {
      console.error('NAMES.lock이 최신이 아니다. node scripts/lock-names.mjs 를 실행한다.');
      process.exitCode = 1;
    }
  } else {
    writeFileSync(LOCK_PATH, next);
    console.log(`NAMES.lock: ${next.trim().split('\n').length}개 이름`);
  }
}
