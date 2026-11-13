// 포맷 공용 도우미: 경로로 중첩 객체 만들기, JS·TS 리터럴 출력
export const HEADER = '생성물 — 수정 금지. pnpm --filter @terracelab/trellis-tokens build';

export function setPath(root, path, value) {
  let node = root;
  for (const key of path.slice(0, -1)) node = node[key] ??= {};
  node[path.at(-1)] = value;
  return root;
}

export function treeOf(tokens, valueOf, strip = 0) {
  const root = {};
  for (const t of tokens) setPath(root, t.path.slice(strip), valueOf(t));
  return root;
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const key = (k) => (IDENT.test(k) ? k : JSON.stringify(k));

/** 값을 JS 리터럴로 */
export function js(value, indent = 0) {
  const pad = '  '.repeat(indent + 1);
  const end = '  '.repeat(indent);
  if (Array.isArray(value)) return `[${value.map((v) => js(v, indent + 1)).join(', ')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => `${pad}${key(k)}: ${js(v, indent + 1)},`);
    return `{\n${entries.join('\n')}\n${end}}`;
  }
  return JSON.stringify(value);
}

/** 값을 readonly 리터럴 TS 타입으로 */
export function ts(value, indent = 0) {
  const pad = '  '.repeat(indent + 1);
  const end = '  '.repeat(indent);
  if (Array.isArray(value)) return `readonly [${value.map((v) => ts(v, indent + 1)).join(', ')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(
      ([k, v]) => `${pad}readonly ${key(k)}: ${ts(v, indent + 1)};`,
    );
    return `{\n${entries.join('\n')}\n${end}}`;
  }
  return JSON.stringify(value);
}

export const pathOf = (t) => t.path.join('.');
