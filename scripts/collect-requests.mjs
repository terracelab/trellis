#!/usr/bin/env node
// 서비스 저장소의 보강 요청(.trellis/requests.md)을 모아 backlog에 붙일 줄을 출력한다(R-T05).
//   node scripts/collect-requests.mjs <서비스 경로 또는 requests.md 경로…> [--all]
// backlog(docs/plan/backlog.md)에 같은 내용이 이미 있는 줄과 상태가 '요청'이 아닌 줄은 뺀다(--all이면 상태와 관계없이).
// backlog는 고치지 않는다. 출력을 보고 사람이 붙이고, 같은 요청은 한 줄로 합친다.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const COLUMNS = ['날짜', '서비스', '종류', '내용', '임시 처리', '상태'];

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** 마크다운 표 줄을 칸 배열로. 머리줄 · 구분줄은 뺀다. 칸 안 `\|`는 그대로 둔다 */
export function parseRequestRows(md) {
  const rows = [];
  for (const line of md.split('\n')) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split(/(?<!\\)\|/)
      .map((c) => c.trim());
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue;
    if (cells[0] === COLUMNS[0] && cells[3] === COLUMNS[3]) continue;
    if (cells.length < COLUMNS.length) continue;
    rows.push(Object.fromEntries(COLUMNS.map((k, i) => [k, cells[i] ?? ''])));
  }
  return rows;
}

/** backlog에 없는 새 줄. 내용 칸이 backlog 어딘가에 그대로 있으면 옮긴 것으로 본다 */
export function newRequests(rows, backlog, { all = false } = {}) {
  const text = norm(backlog);
  return rows.filter((r) => {
    if (!norm(r['내용'])) return false;
    if (!all && r['상태'] && r['상태'] !== '요청') return false;
    return !text.includes(norm(r['내용']));
  });
}

const line = (r) => `| ${COLUMNS.map((k) => r[k]).join(' | ')} |`;

function requestsFile(arg) {
  const p = resolve(arg);
  if (existsSync(p) && statSync(p).isFile()) return p;
  return join(p, '.trellis', 'requests.md');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  const args = process.argv.slice(2);
  const targets = args.filter((a) => !a.startsWith('--'));
  if (!targets.length) {
    console.error('사용법: node scripts/collect-requests.mjs <서비스 경로…> [--all]');
    process.exit(1);
  }
  const backlog = readFileSync(join(ROOT, 'docs', 'plan', 'backlog.md'), 'utf8');
  let total = 0;
  for (const t of targets) {
    const file = requestsFile(t);
    if (!existsSync(file)) {
      console.error(`없음: ${file}`);
      continue;
    }
    const rows = parseRequestRows(readFileSync(file, 'utf8'));
    const fresh = newRequests(rows, backlog, { all: args.includes('--all') });
    // 서비스 칸이 비어 있으면 저장소 폴더 이름
    const service = basename(resolve(t).replace(/[\\/]\.trellis[\\/]requests\.md$/, ''));
    console.error(`${file}: ${rows.length}줄 · 새 줄 ${fresh.length}`);
    for (const r of fresh) console.log(line({ ...r, 서비스: r['서비스'] || service }));
    total += fresh.length;
  }
  console.error(
    total
      ? `\n새 줄 ${total}개. docs/plan/backlog.md 표 맨 아래에 붙이고, 같은 요청은 한 줄로 합친다`
      : '\n새 줄 없음',
  );
}
