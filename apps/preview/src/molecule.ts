// 모듈 지도(히어로 오른쪽)의 좌표 계산. modules.json의 묶음 7개와 모듈 35개를 뾰족 위 육각 격자에 놓는다.
// import가 없는 순수 모듈이다. 미리보기(Vite)와 scripts/export-showcase.mjs(Node 타입 제거)가 같은 파일을 읽는다.
// 격자에 맞지 않는 간선 · 겹치는 꼭짓점 · 겹치는 라벨 · 모듈 수와 다른 가지 수는 빌드에서 던진다.

/** 격자 좌표 (i, j) → 픽셀 (i·U, j·H). j mod 3 = 0은 고리 중심, 1은 위형 꼭짓점(U · DR · DL), 2는 아래형(D · UR · UL) */
export type Lattice = readonly [number, number];
export type Dir = 'U' | 'D' | 'UR' | 'UL' | 'DR' | 'DL';
export type VertexName = 'N' | 'NE' | 'SE' | 'S' | 'SW' | 'NW';

/** 고리 반지름(꼭짓점까지). 간선 길이와 같다 */
export const RING_R = 60;
const U = (RING_R * Math.sqrt(3)) / 2;
const H = RING_R / 2;
/** 라벨 글자 크기(viewBox 단위). 묶음 이름은 GROUP_FONT */
export const LABEL_FONT = 15;
export const GROUP_FONT = 20;
const LABEL_GAP = 9;

const STEP: Record<Dir, Lattice> = {
  U: [0, -2],
  D: [0, 2],
  UR: [1, -1],
  UL: [-1, -1],
  DR: [1, 1],
  DL: [-1, 1],
};
const LEGAL: Record<1 | 2, readonly Dir[]> = { 1: ['U', 'DR', 'DL'], 2: ['D', 'UR', 'UL'] };
const RING: Record<VertexName, Lattice> = {
  N: [0, -2],
  NE: [1, -1],
  SE: [1, 1],
  S: [0, 2],
  SW: [-1, 1],
  NW: [-1, -1],
};
const RING_ORDER: readonly VertexName[] = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];

const key = ([i, j]: Lattice) => `${i},${j}`;
const vtype = ([, j]: Lattice) => (((j % 3) + 3) % 3) as 0 | 1 | 2;
export const toPx = ([i, j]: Lattice): [number, number] => [i * U, j * H];

function step(from: Lattice, dir: Dir): Lattice {
  const t = vtype(from);
  if (t === 0 || !LEGAL[t].includes(dir))
    throw new Error(`molecule: (${key(from)})에서 ${dir} 방향 간선은 격자에 없다`);
  return [from[0] + STEP[dir][0], from[1] + STEP[dir][1]];
}

/**
 * 고리 하나의 배치. branches는 고리 꼭짓점에서 시작하는 가지 경로다. 'NW UL U UR'은 NW 꼭짓점에서
 * UL · U · UR 순서로 간다. 같은 앞부분을 가진 경로는 한 나무로 합쳐지고, 경로 끝이 모듈 라벨 자리다.
 * 경로는 modules.json의 그 묶음 모듈 순서대로 하나씩 대응한다.
 */
export interface RingSpec {
  group: string;
  center: Lattice;
  branches: readonly string[];
}

export interface MoleculeModule {
  id: string;
  group: string;
  label: string;
}

export interface MoleculeInput {
  groups: Record<string, { label: string }>;
  modules: readonly MoleculeModule[];
}

export interface MoleculeNode {
  id: string;
  lattice: Lattice;
  x: number;
  y: number;
  group: string;
  kind: 'ring' | 'branch' | 'leaf';
}
export interface MoleculeEdge {
  from: string;
  to: string;
  group: string;
  kind: 'ring' | 'branch';
}
export interface MoleculeLabel {
  module: string;
  group: string;
  text: string;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  baseline: 'auto' | 'middle' | 'hanging';
  /** 대략의 글자 상자(겹침 검사용) */
  box: { x: number; y: number; w: number; h: number };
}
export interface MoleculeRing {
  group: string;
  label: string;
  /** 색 토큰 이름(점 경로). 화면은 --tl-color-module-<묶음>-default */
  color: string;
  center: { x: number; y: number };
  /** N · NE · SE · S · SW · NW 순서 */
  vertices: { x: number; y: number }[];
  /** 고리 안쪽 이중선(벤젠 고리처럼 하나 걸러 하나) */
  inner: { x1: number; y1: number; x2: number; y2: number }[];
}
export interface Molecule {
  viewBox: { x: number; y: number; width: number; height: number };
  rings: MoleculeRing[];
  nodes: MoleculeNode[];
  edges: MoleculeEdge[];
  labels: MoleculeLabel[];
}

/** 위 세 고리(ECM · ERP · CRM)와 아래 네 고리(그룹웨어 · 유통·물류 · 제조 · 이커머스)가 맞붙은 벌집. */
export const MOLECULE_LAYOUT: readonly RingSpec[] = [
  {
    group: 'ecm',
    center: [1, 0],
    branches: ['NW UL U UL U', 'NW UL U UL DL', 'NW UL U UR', 'NW UL DL UL'],
  },
  {
    group: 'erp',
    center: [3, 0],
    branches: [
      'N U UL U UL U',
      'N U UL U UL DL',
      'N U UL U UR U',
      'N U UL DL',
      'N U UR U UR U',
      'N U UR U UR DR',
      'N U UR DR',
    ],
  },
  {
    group: 'crm',
    center: [5, 0],
    branches: ['NE UR U UR U', 'NE UR U UR DR', 'NE UR U UL', 'NE UR DR UR'],
  },
  {
    group: 'groupware',
    center: [0, 3],
    branches: [
      'NW UL DL UL',
      'NW UL DL D DL UL',
      'NW UL DL D DL D',
      'SW DL D DL D DL',
      'SW DL D DL D DR',
      'SW DL D DR',
    ],
  },
  {
    group: 'scm',
    center: [2, 3],
    branches: ['S D DL UL', 'S D DL D DL UL', 'S D DL D DL D', 'S D DL D DR D'],
  },
  {
    group: 'mes',
    center: [4, 3],
    branches: ['S D DR D DL D', 'S D DR D DR D', 'S D DR D DR UR', 'S D DR UR'],
  },
  {
    group: 'commerce',
    center: [6, 3],
    branches: [
      'NE UR DR UR',
      'NE UR DR D DR D',
      'SE DR D DL',
      'SE DR D DR D DL',
      'NE UR DR D DR UR',
      'SE DR D DR D DR',
    ],
  },
];

/** 글자 폭 어림(한글 1em, 라틴 · 숫자 0.6em, 가운뎃점 · 공백 0.35em) */
function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) w += /[가-힣]/.test(ch) ? 1 : /[·\s]/.test(ch) ? 0.35 : 0.6;
  return w * size;
}

function overlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  pad = 0,
) {
  return (
    a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad
  );
}

/** 선분과 상자의 교차(라벨이 간선을 덮는지). 선분을 촘촘히 표본한다 */
function segmentHitsBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  b: { x: number; y: number; w: number; h: number },
) {
  for (let t = 0; t <= 1; t += 0.05) {
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return true;
  }
  return false;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** 묶음 · 모듈 → 좌표. 격자 · 겹침 · 개수 검사를 통과하지 못하면 던진다 */
export function layoutMolecule(
  input: MoleculeInput,
  layout: readonly RingSpec[] = MOLECULE_LAYOUT,
): Molecule {
  const groupIds = Object.keys(input.groups);
  const laid = new Set(layout.map((r) => r.group));
  for (const g of groupIds)
    if (!laid.has(g)) throw new Error(`molecule: 묶음 ${g}의 고리 배치가 없다(MOLECULE_LAYOUT)`);
  for (const r of layout)
    if (!input.groups[r.group]) throw new Error(`molecule: modules.json에 없는 묶음 ${r.group}`);

  const nodes = new Map<string, MoleculeNode>();
  const edges: MoleculeEdge[] = [];
  const edgeKeys = new Set<string>();
  const rings: MoleculeRing[] = [];
  const labels: MoleculeLabel[] = [];
  const ringVertexOwner = new Map<string, string>();
  const centers = new Set(layout.map((r) => key(r.center)));

  const addNode = (p: Lattice, group: string, kind: MoleculeNode['kind']) => {
    const k = key(p);
    const [x, y] = toPx(p);
    const found = nodes.get(k);
    if (found) {
      if (found.kind === 'ring' && kind === 'ring') return found;
      if (found.group !== group || found.kind === 'ring' || kind === 'ring')
        throw new Error(`molecule: 꼭짓점 (${k})을 ${found.group}와 ${group}가 같이 쓴다`);
      if (found.kind === 'leaf' || kind === 'leaf') {
        if (found.kind !== kind)
          throw new Error(`molecule: (${k})이 라벨 자리이면서 가지 중간이다`);
        throw new Error(`molecule: ${group}의 라벨 자리 (${k})가 겹친다`);
      }
      return found;
    }
    if (centers.has(k)) throw new Error(`molecule: 고리 중심 (${k})에 가지가 들어간다`);
    const node: MoleculeNode = { id: k, lattice: p, x: round(x), y: round(y), group, kind };
    nodes.set(k, node);
    return node;
  };
  const addEdge = (a: Lattice, b: Lattice, group: string, kind: MoleculeEdge['kind']) => {
    const k = [key(a), key(b)].sort().join('|');
    if (edgeKeys.has(k)) return;
    edgeKeys.add(k);
    edges.push({ from: key(a), to: key(b), group, kind });
  };

  // 1. 고리
  for (const r of layout) {
    const verts = RING_ORDER.map((n): Lattice => [
      r.center[0] + RING[n][0],
      r.center[1] + RING[n][1],
    ]);
    verts.forEach((p, i) => {
      addNode(p, r.group, 'ring');
      if (!ringVertexOwner.has(key(p))) ringVertexOwner.set(key(p), r.group);
      const next = verts[(i + 1) % 6]!;
      // 고리 변도 격자 간선이어야 한다
      const d = (Object.keys(STEP) as Dir[]).find(
        (dir) => p[0] + STEP[dir][0] === next[0] && p[1] + STEP[dir][1] === next[1],
      );
      if (!d) throw new Error(`molecule: ${r.group} 고리 변이 격자에 없다`);
      step(p, d);
      addEdge(p, next, r.group, 'ring');
    });
    const [cx, cy] = toPx(r.center);
    const px = verts.map(toPx);
    const inner = [0, 2, 4].map((k) => {
      const [ax, ay] = px[k]!;
      const [bx, by] = px[(k + 1) % 6]!;
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      const nl = Math.hypot(cx - mx, cy - my);
      const ox = ((cx - mx) / nl) * 7;
      const oy = ((cy - my) / nl) * 7;
      const dx = (bx - ax) * 0.16;
      const dy = (by - ay) * 0.16;
      return {
        x1: round(ax + ox + dx),
        y1: round(ay + oy + dy),
        x2: round(bx + ox - dx),
        y2: round(by + oy - dy),
      };
    });
    rings.push({
      group: r.group,
      label: input.groups[r.group]!.label,
      color: `color.module.${r.group}.default`,
      center: { x: round(cx), y: round(cy) },
      vertices: px.map(([x, y]) => ({ x: round(x), y: round(y) })),
      inner,
    });
  }

  // 2. 가지와 라벨
  for (const r of layout) {
    const mods = input.modules.filter((m) => m.group === r.group);
    if (mods.length !== r.branches.length)
      throw new Error(
        `molecule: ${r.group} 모듈 ${mods.length}개, 가지 ${r.branches.length}개. MOLECULE_LAYOUT을 맞춘다`,
      );
    const leaves = new Set<string>();
    const interior = new Set<string>();
    const paths = r.branches.map((spec) => {
      const [start, ...dirs] = spec.trim().split(/\s+/) as [VertexName, ...Dir[]];
      if (!RING[start]) throw new Error(`molecule: ${r.group} 가지 '${spec}'의 시작 꼭짓점이 없다`);
      if (!dirs.length) throw new Error(`molecule: ${r.group} 가지 '${spec}'에 간선이 없다`);
      const root: Lattice = [r.center[0] + RING[start][0], r.center[1] + RING[start][1]];
      if (ringVertexOwner.get(key(root)) !== r.group || isShared(root, layout))
        throw new Error(
          `molecule: ${r.group} 가지 '${spec}'는 다른 고리와 붙은 꼭짓점에서 시작한다`,
        );
      const pts: Lattice[] = [root];
      for (const d of dirs) pts.push(step(pts.at(-1)!, d));
      pts.slice(1, -1).forEach((p) => interior.add(key(p)));
      leaves.add(key(pts.at(-1)!));
      return { pts, last: dirs.at(-1)! };
    });
    for (const l of leaves)
      if (interior.has(l))
        throw new Error(`molecule: ${r.group}의 (${l})이 라벨 자리이면서 가지 중간이다`);
    if (leaves.size !== paths.length) throw new Error(`molecule: ${r.group}의 라벨 자리가 겹친다`);
    paths.forEach(({ pts, last }, idx) => {
      pts.slice(1).forEach((p, i) => {
        addNode(p, r.group, i === pts.length - 2 ? 'leaf' : 'branch');
        addEdge(pts[i]!, p, r.group, 'branch');
      });
      const m = mods[idx]!;
      const [x, y] = toPx(pts.at(-1)!);
      const right = last === 'UR' || last === 'DR';
      const left = last === 'UL' || last === 'DL';
      const anchor = right ? 'start' : left ? 'end' : 'middle';
      const lx = x + (right ? LABEL_GAP : left ? -LABEL_GAP : 0);
      const ly = y + (last === 'U' ? -LABEL_GAP : last === 'D' ? LABEL_GAP : 0);
      const baseline = last === 'U' ? 'auto' : last === 'D' ? 'hanging' : 'middle';
      const w = textWidth(m.label, LABEL_FONT);
      const h = LABEL_FONT * 1.2;
      const bx = anchor === 'start' ? lx : anchor === 'end' ? lx - w : lx - w / 2;
      const by = baseline === 'auto' ? ly - h : baseline === 'hanging' ? ly : ly - h / 2;
      labels.push({
        module: m.id,
        group: r.group,
        text: m.label,
        x: round(lx),
        y: round(ly),
        anchor,
        baseline,
        box: { x: round(bx), y: round(by), w: round(w), h: round(h) },
      });
    });
  }

  // 3. 라벨 겹침: 라벨끼리, 라벨과 간선
  const all = [...nodes.values()];
  const byId = new Map(all.map((n) => [n.id, n]));
  labels.forEach((a, i) => {
    labels.slice(i + 1).forEach((b) => {
      if (overlap(a.box, b.box, 4))
        throw new Error(`molecule: 라벨 ${a.text}와 ${b.text}가 겹친다`);
    });
    for (const e of edges) {
      const p = byId.get(e.from)!;
      const q = byId.get(e.to)!;
      if (segmentHitsBox(p.x, p.y, q.x, q.y, a.box))
        throw new Error(`molecule: 라벨 ${a.text}가 ${e.group} 간선(${e.from} → ${e.to})을 덮는다`);
    }
  });

  // 4. 범위: 꼭짓점과 라벨 상자에 여백
  const xs = [...all.map((n) => n.x), ...labels.flatMap((l) => [l.box.x, l.box.x + l.box.w])];
  const ys = [...all.map((n) => n.y), ...labels.flatMap((l) => [l.box.y, l.box.y + l.box.h])];
  const pad = 12;
  const x0 = Math.min(...xs) - pad;
  const y0 = Math.min(...ys) - pad;
  return {
    viewBox: {
      x: round(x0),
      y: round(y0),
      width: round(Math.max(...xs) + pad - x0),
      height: round(Math.max(...ys) + pad - y0),
    },
    rings,
    nodes: all,
    edges,
    labels,
  };
}

/** 두 고리 이상이 쓰는 꼭짓점(가지를 낼 수 없다) */
function isShared(p: Lattice, layout: readonly RingSpec[]): boolean {
  let n = 0;
  for (const r of layout)
    for (const v of RING_ORDER)
      if (r.center[0] + RING[v][0] === p[0] && r.center[1] + RING[v][1] === p[1]) n += 1;
  return n > 1;
}
