#!/usr/bin/env node
// 화면 블록을 서비스 앱으로 복사한다(D-51 · D-58). 서비스 저장소 루트에서:
//   node trellis/scripts/add-block.mjs <블록 id> [--to apps/web/src/blocks] [--force]
//   node trellis/scripts/add-block.mjs --list
//   node trellis/scripts/add-block.mjs --outdated          복사한 뒤 Trellis에서 바뀐 블록
//   node trellis/scripts/add-block.mjs --diff <블록 id 또는 복사한 폴더>   복사한 커밋 뒤로 어떻게 바뀌었나
// 블록 폴더 밖을 가리키는 상대 경로(_data · _platform · _ui · 다른 블록의 CSS)는 @terracelab/trellis-blocks 경로로 바꾼다.
// 복사한 블록은 서비스가 소유한다. 출처 커밋은 .trellis/blocks.lock에 복사한 폴더별로 남긴다.
// 같은 블록을 여러 곳(--to)에 복사할 수 있다. 예전 기록(블록 id 키)도 그대로 읽는다.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const TRELLIS = fileURLToPath(new URL('..', import.meta.url));
const BLOCKS = join(TRELLIS, 'blocks', 'src');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);

function allBlocks() {
  const out = [];
  for (const g of readdirSync(BLOCKS)) {
    if (g.startsWith('_') || !statSync(join(BLOCKS, g)).isDirectory()) continue;
    for (const m of readdirSync(join(BLOCKS, g)))
      for (const s of readdirSync(join(BLOCKS, g, m))) {
        const f = join(BLOCKS, g, m, s, 'block.json');
        if (existsSync(f)) out.push(JSON.parse(readFileSync(f, 'utf8')));
      }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

// 기록 한 줄 = { 폴더: { id, trellis } }. 예전 모양 { id: { trellis, to } }도 읽는다
const lockEntries = (lock) =>
  Object.entries(lock).map(([key, e]) =>
    e.id ? { id: e.id, to: key, trellis: e.trellis } : { id: key, to: e.to, trellis: e.trellis },
  );

if (flag('--list')) {
  for (const b of allBlocks()) console.log(`${b.id.padEnd(36)} ${b.title}`);
  process.exit(0);
}

// 복사 기록과 지금 Trellis를 비교한다(.trellis/blocks.lock)
if (flag('--outdated') || flag('--diff')) {
  const lockPath = join(process.cwd(), '.trellis', 'blocks.lock');
  if (!existsSync(lockPath)) {
    console.log('복사한 블록이 없다(.trellis/blocks.lock 없음)');
    process.exit(0);
  }
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  const git = (...a) => execFileSync('git', ['-C', TRELLIS, ...a], { encoding: 'utf8' });
  const only = flag('--diff') ? opt('--diff', null) : null;
  const entries = lockEntries(lock).filter((e) => !only || e.id === only || e.to === only);
  if (only && entries.length === 0) {
    console.error(`복사 기록에 없는 블록: ${only}`);
    process.exit(1);
  }
  const head = git('rev-parse', '--short', 'HEAD').trim();
  let changed = 0;
  for (const entry of entries) {
    const path = `blocks/src/${entry.id}`;
    const label =
      entries.length > 1 || entry.to !== `apps/web/src/blocks/${entry.id}`
        ? `${entry.id} → ${entry.to}`
        : entry.id;
    let stat;
    try {
      stat = git('diff', '--stat', `${entry.trellis}..HEAD`, '--', path).trim();
    } catch {
      console.log(`? ${label}: 커밋 ${entry.trellis}를 찾을 수 없다(git -C trellis fetch)`);
      continue;
    }
    if (!stat) {
      if (only) console.log(`${label}: 복사한 뒤 바뀐 것이 없다`);
      continue;
    }
    changed += 1;
    if (only) {
      if (entries.length > 1) console.log(`\n# ${label}`);
      process.stdout.write(git('diff', `${entry.trellis}..HEAD`, '--', path));
    } else
      console.log(
        `${label}  (복사 ${entry.trellis} → 지금 ${head})\n${stat
          .split('\n')
          .map((l) => `    ${l}`)
          .join('\n')}`,
      );
  }
  if (!only)
    console.log(
      changed ? `\n바뀐 블록 ${changed}개. 내용은 --diff <블록 id>` : '복사한 블록 전부 최신',
    );
  process.exit(0);
}

const id = args.find((a) => !a.startsWith('--') && a !== opt('--to', null));
if (!id) {
  console.error(
    '사용법: node trellis/scripts/add-block.mjs <블록 id> [--to apps/web/src/blocks] [--force]',
  );
  console.error('목록:   node trellis/scripts/add-block.mjs --list');
  process.exit(1);
}
const src = join(BLOCKS, id);
if (!existsSync(join(src, 'block.json'))) {
  console.error(`블록 없음: ${id}. --list로 id를 확인하세요`);
  process.exit(1);
}
const to = opt('--to', 'apps/web/src/blocks');
const dest = join(process.cwd(), to, id);
if (existsSync(dest) && !flag('--force')) {
  console.error(
    `이미 있음: ${relative(process.cwd(), dest)}. 덮어쓰려면 --force (서비스에서 고친 내용은 사라집니다)`,
  );
  process.exit(1);
}

const PKG = '@terracelab/trellis-blocks';
// 블록 폴더 밖을 가리키는 상대 경로(from · 부수 효과 import 모두)를 패키지 경로로 바꾼다.
//   ../../../_data/trade.js        → @terracelab/trellis-blocks/data/trade
//   ../../../_ui/index.js          → @terracelab/trellis-blocks/ui
//   ../../tax/invoice-issue/style.css → @terracelab/trellis-blocks/erp/tax/invoice-issue/style.css
const SHARED = { _data: 'data', _platform: 'platform', _ui: 'ui' };
const toPackage = (fromDir, spec) => {
  const target = join(fromDir, spec);
  const rel = relative(BLOCKS, target).split('\\').join('/');
  if (rel.startsWith('..')) return null;
  const [top, ...rest] = rel.split('/');
  if (SHARED[top] && rest.length === 1 && rest[0].endsWith('.js')) {
    const file = rest[0].slice(0, -3);
    return file === 'index' ? `${PKG}/${SHARED[top]}` : `${PKG}/${SHARED[top]}/${file}`;
  }
  if (rel.endsWith('.js')) {
    const base = rel.slice(0, -3);
    const ext = ['.tsx', '.ts'].find((e) => existsSync(join(BLOCKS, base + e)));
    return ext ? `${PKG}/${base}${ext}` : null;
  }
  return existsSync(target) ? `${PKG}/${rel}` : null;
};
const rewrite = (code, fromDir, name, warnings) =>
  code.replace(/((?:from|import)\s+)'(\.\.\/[^']+)'/g, (whole, head, spec) => {
    if (!join(fromDir, spec).startsWith(src)) {
      const pkg = toPackage(fromDir, spec);
      if (pkg) return `${head}'${pkg}'`;
      warnings.push(`${name}: 블록 밖 상대 경로 ${spec} 는 직접 고쳐야 합니다`);
    }
    return whole;
  });

mkdirSync(dest, { recursive: true });
const warnings = [];
for (const name of readdirSync(src)) {
  const from = join(src, name);
  if (statSync(from).isDirectory()) continue;
  let body = readFileSync(from, 'utf8');
  if (/\.(tsx?|mts)$/.test(name)) body = rewrite(body, src, name, warnings);
  writeFileSync(join(dest, name), body);
}

let commit = 'unknown';
try {
  commit = execFileSync('git', ['-C', TRELLIS, 'rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
} catch {
  /* git 없이 복사한 경우 */
}
const lockPath = join(process.cwd(), '.trellis', 'blocks.lock');
mkdirSync(dirname(lockPath), { recursive: true });
const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : {};
const toRel = relative(process.cwd(), dest).split('\\').join('/');
// 예전 모양(블록 id 키)으로 같은 폴더를 기록했으면 새 모양으로 옮긴다
if (lock[id] && !lock[id].id && lock[id].to === toRel) delete lock[id];
lock[toRel] = { id, trellis: commit };
const sorted = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(lockPath, `${JSON.stringify(sorted, null, 2)}\n`);

const meta = JSON.parse(readFileSync(join(src, 'block.json'), 'utf8'));
console.log(`복사함: ${id} (${meta.title}) → ${relative(process.cwd(), dest)} · trellis ${commit}`);
console.log(
  `쓰는 법: import ${meta.id
    .split('/')
    .pop()
    .replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())} from './blocks/${id}/index.js';`,
);
for (const w of warnings) console.warn(`주의: ${w}`);
