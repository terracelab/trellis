// 토큰 빌드. Style Dictionary가 소스를 합치고 alias를 풀고 이름·값을 변환하면,
// sd/formats/*의 포맷이 docs/spec/tokens.md §4의 산출물 8종을 만든다.
//
//   node sd.config.mjs            dist/에 쓴다
//   build({ outDir })             테스트가 임시 폴더에 빌드할 때
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { tokensCss, fontsCss } from './sd/formats/css.mjs';
import { docs } from './sd/formats/docs.mjs';
import { figma } from './sd/formats/figma.mjs';
import { flat } from './sd/formats/flat.mjs';
import { native } from './sd/formats/native.mjs';
import { tailwind } from './sd/formats/tailwind.mjs';
import { web } from './sd/formats/web.mjs';
import { registerNameTransform } from './sd/transforms/name.mjs';
import { registerNativeTransforms } from './sd/transforms/native.mjs';

const PKG = dirname(fileURLToPath(import.meta.url));
const SRC = join(PKG, 'src');

registerNameTransform(StyleDictionary);
registerNativeTransforms(StyleDictionary);

const PLATFORMS = {
  css: {
    transforms: ['trellis/name/kebab', 'shadow/css/shorthand', 'cubicBezier/css', 'fontFamily/css'],
  },
  native: {
    transforms: [
      'trellis/name/kebab',
      'trellis/native/dimension',
      'trellis/native/duration',
      'trellis/native/fontWeight',
      'trellis/native/fontFamily',
      'trellis/native/shadow',
    ],
  },
};

function listJson(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? listJson(join(dir, e.name))
        : e.name.endsWith('.json')
          ? [join(dir, e.name)]
          : [],
    )
    .sort();
}

const rel = (file) => relative(SRC, file).split(sep).join('/');
const primitiveFiles = () => listJson(join(SRC, 'primitive'));

/** 모드 조합별 소스 집합. 순서가 산출물 순서를 정한다. */
export const SETS = {
  light: () => [
    ...primitiveFiles(),
    join(SRC, 'typography.json'),
    join(SRC, 'density/compact.json'),
    join(SRC, 'semantic/color.light.json'),
    join(SRC, 'paper.json'),
  ],
  dark: () => [
    ...primitiveFiles(),
    join(SRC, 'typography.json'),
    join(SRC, 'density/comfortable.json'),
    join(SRC, 'semantic/color.dark.json'),
    join(SRC, 'paper.json'),
  ],
  // 고대비 · 색각 친화 차트(D-97): 바뀌는 semantic만 담은 파일. 같은 primitive 위에서 따로 푼다
  hcLight: () => [...primitiveFiles(), join(SRC, 'semantic/color.hc-light.json')],
  hcDark: () => [...primitiveFiles(), join(SRC, 'semantic/color.hc-dark.json')],
  cvdLight: () => [...primitiveFiles(), join(SRC, 'semantic/chart.cvd-light.json')],
  cvdDark: () => [...primitiveFiles(), join(SRC, 'semantic/chart.cvd-dark.json')],
  // 휴대폰 밀도(D-61). 색은 라이트를 다시 읽을 뿐 쓰지 않는다
  touch: () => [
    ...primitiveFiles(),
    join(SRC, 'typography.json'),
    join(SRC, 'density/touch.json'),
    join(SRC, 'semantic/color.light.json'),
    join(SRC, 'paper.json'),
  ],
};

function layer(token) {
  const file = rel(token.filePath);
  if (file.startsWith('primitive/')) return 'primitive';
  if (file.startsWith('semantic/')) return 'semantic';
  if (file.startsWith('density/')) return 'density';
  // 종이 서식(D-77): 테마와 무관한 한 벌. 모든 모드 조합에 같은 파일이 들어간다
  if (file === 'paper.json') return 'paper';
  return 'typography';
}

/** 소스 파일 순서 → 파일 안 리프 순서. Style Dictionary는 같은 그룹(color.brand 등)을 합치면서 순서를 섞는다. */
function sourceOrder(files) {
  const order = new Map();
  const walk = (node, path) => {
    if (node && typeof node === 'object' && '$value' in node)
      return order.set(path.join('.'), order.size);
    for (const [k, v] of Object.entries(node ?? {}))
      if (!k.startsWith('$') && typeof v === 'object') walk(v, [...path, k]);
  };
  for (const file of files) walk(JSON.parse(readFileSync(file, 'utf8')), []);
  return order;
}

async function load(files) {
  const sd = new StyleDictionary({
    source: files,
    platforms: PLATFORMS,
    log: { verbosity: 'silent', warnings: 'error' },
  });
  const order = sourceOrder(files);
  const split = async (platform) => {
    const { allTokens } = await sd.getPlatformTokens(platform);
    const sorted = [...allTokens].sort(
      (a, b) => order.get(a.path.join('.')) - order.get(b.path.join('.')),
    );
    const by = (name) => sorted.filter((t) => layer(t) === name);
    return {
      primitive: by('primitive'),
      semantic: by('semantic'),
      density: by('density'),
      typography: by('typography'),
      paper: by('paper'),
    };
  };
  return { css: await split('css'), native: await split('native') };
}

/** 두 모드 조합을 읽어 포맷이 쓰는 묶음으로 만든다 */
export async function collect() {
  const light = await load(SETS.light());
  const dark = await load(SETS.dark());
  const touch = await load(SETS.touch());
  const modes = {};
  for (const m of ['hcLight', 'hcDark', 'cvdLight', 'cvdDark']) modes[m] = await load(SETS[m]());
  const pick = (p) => ({
    semanticHcLight: modes.hcLight[p].semantic,
    semanticHcDark: modes.hcDark[p].semantic,
    chartCvdLight: modes.cvdLight[p].semantic,
    chartCvdDark: modes.cvdDark[p].semantic,
    primitive: light[p].primitive,
    semanticLight: light[p].semantic,
    semanticDark: dark[p].semantic,
    densityCompact: light[p].density,
    densityComfortable: dark[p].density,
    densityTouch: touch[p].density,
    typography: light[p].typography,
    paper: light[p].paper,
  });
  return { css: pick('css'), native: pick('native') };
}

export async function build({ outDir = join(PKG, 'dist') } = {}) {
  const b = await collect();
  const files = {
    'css/tokens.css': tokensCss(b),
    'css/fonts.css': fontsCss(b),
    ...web(b),
    ...native(b),
    'tailwind/theme.css': tailwind(b),
    'figma/variables.json': figma(b),
    'json/flat.json': flat(b),
    'json/modules.json': readFileSync(join(SRC, 'modules.json'), 'utf8'),
    'docs/tokens.md': docs(b),
  };
  rmSync(outDir, { recursive: true, force: true });
  for (const [file, content] of Object.entries(files)) {
    const target = join(outDir, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return Object.keys(files).sort();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const written = await build();
  console.log(`dist/ ${written.length}개 파일: ${written.join(', ')}`);
}
