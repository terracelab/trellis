// 모듈 지도(히어로)의 좌표를 dist/showcase/molecule.json으로 쓴다. Figma 쇼케이스(PG-20)가 이 좌표로 벡터를 그리고
// 선 색을 color/module/<묶음>/default 변수에 묶는다. 계산은 미리보기와 같은 src/molecule.ts(Node 타입 제거로 읽는다).
//   node scripts/export-showcase.mjs [출력 경로]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import modules from '@terracelab/trellis-tokens/modules' with { type: 'json' };
import { GROUP_FONT, LABEL_FONT, RING_R, layoutMolecule } from '../src/molecule.ts';

/** molecule.json 본문. 묶음별로 고리 · 모듈 라벨을 모으고, 간선 · 꼭짓점은 전체 목록으로 둔다 */
export function moleculeJson() {
  const m = layoutMolecule(modules);
  const groupIds = Object.keys(modules.groups);
  return {
    $schema: 'trellis-showcase-molecule/1',
    source: 'apps/preview/src/molecule.ts',
    unit: 'viewBox',
    viewBox: m.viewBox,
    ringRadius: RING_R,
    font: { label: LABEL_FONT, group: GROUP_FONT, labelWeight: 500, groupWeight: 700 },
    counts: { groups: groupIds.length, modules: m.labels.length },
    groups: groupIds.map((id) => {
      const ring = m.rings.find((r) => r.group === id);
      return {
        id,
        label: modules.groups[id].label,
        /** 토큰 점 경로 · CSS 변수 · Figma 변수 이름 */
        color: {
          token: ring.color,
          css: `--tl-color-module-${id}-default`,
          figma: `color/module/${id}/default`,
        },
        ring: { center: ring.center, vertices: ring.vertices, inner: ring.inner },
        modules: m.labels
          .filter((l) => l.group === id)
          .map((l) => ({
            id: l.module,
            label: l.text,
            x: l.x,
            y: l.y,
            anchor: l.anchor,
            baseline: l.baseline,
          })),
      };
    }),
    nodes: m.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, group: n.group, kind: n.kind })),
    edges: m.edges,
  };
}

export function writeMoleculeJson(file) {
  const json = moleculeJson();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  return json;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file =
    process.argv[2] ?? fileURLToPath(new URL('../dist/showcase/molecule.json', import.meta.url));
  const json = writeMoleculeJson(file);
  console.log(
    `molecule.json: 묶음 ${json.counts.groups} · 모듈 ${json.counts.modules} · 간선 ${json.edges.length} → ${file}`,
  );
}
