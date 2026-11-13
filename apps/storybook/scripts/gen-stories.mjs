// 스토리 생성기 — 컴포넌트마다 generated/<Name>.stories.tsx 하나(손으로 쓰지 않는다).
// 입력: contracts 폴더 목록 · contract 메타(dist) · react 예시(<Name>.examples.tsx) · 컴포넌트 CSS(data-force-state)
// 출력: 예시 export마다 스토리 1개 + Matrix(variant · tone · shape · size 조합) + States(7 상태 중 그릴 수 있는 것)
//   node scripts/gen-stories.mjs           generated/ 다시 만들기
//   node scripts/gen-stories.mjs --check   스토리 없는 컴포넌트 · generated/ 불일치면 실패(쓰지 않음)
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseExamples } from '../../../scripts/build-docs.mjs';

export const APP = fileURLToPath(new URL('..', import.meta.url));
export const ROOT = join(APP, '../..');
export const OUT = join(APP, 'generated');
const CONTRACTS = join(ROOT, 'packages/contracts/src');
const REACT = join(ROOT, 'packages/react/src');

/** Matrix 축으로 쓰는 enum prop(이 순서로 행을 만들고, size가 있으면 열로) */
export const MATRIX_AXES = ['variant', 'tone', 'shape', 'size'];
/**
 * 컴포넌트 대표 스토리(Matrix · 첫 예시) 밖에 VRT로 찍을 예시: 컴포넌트 → 예시 export → 선택.
 * phone이면 휴대폰 폭(390)으로도 찍는다(라이트 · 다크). 대표 스토리가 덮지 못하는 모양만 올린다(PR-38)
 */
export const EXTRA_VRT = {
  Avatar: { Vacant: {} },
  Banner: { Narrow: {} },
  PersonLabel: { Vacant: {} },
  PageHeader: { Siblings: { phone: true } },
};
/** 휴대폰 폭으로도 찍는 스토리 태그 */
export const PHONE_TAG = 'vrt-phone';

/** 생성 스토리 이름. 예시 export 이름과 겹치면 예시 쪽에 Example을 붙인다 */
const RESERVED = new Set(['Matrix', 'States']);
const STATE_ORDER = ['default', 'hover', 'active', 'focus', 'disabled', 'loading', 'error'];
const FORCEABLE = ['hover', 'active', 'focus'];
/** error 상태를 string prop으로 보여 줄 때의 문구(content.md §5 오류: 어떻게 고치는지) */
const ERROR_TEXT = '값을 확인하세요';

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const read = (f) => readFileSync(f, 'utf8');

/** contracts 아래 컴포넌트 폴더(_* · core · charts · patterns(패턴 spec, §10) · 파일 제외) = 스토리 파일이 있어야 하는 목록 */
export function componentFolders() {
  return readdirSync(CONTRACTS, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        !e.name.startsWith('_') &&
        !['core', 'charts', 'patterns'].includes(e.name),
    )
    .map((e) => e.name)
    .sort();
}

async function loadContracts() {
  const dist = join(ROOT, 'packages/contracts/dist/index.js');
  if (!existsSync(dist))
    throw new Error('contracts dist가 없다. 먼저 `pnpm build`(또는 turbo run build)를 실행한다.');
  const mod = await import(pathToFileURL(dist).href);
  return new Map(
    Object.values(mod)
      .filter((v) => v && typeof v === 'object' && 'name' in v && 'props' in v && 'states' in v)
      .map((c) => [c.name, c]),
  );
}

/** contract 값 → 스토리에 넣을 리터럴. 타입에 따옴표가 없고 전부 숫자면 숫자(Avatar size 24 등) */
function axisValues(meta) {
  const numeric = !meta.type.includes("'") && meta.values.every((v) => /^\d+$/.test(String(v)));
  return meta.values.map((v) => (numeric ? Number(v) : String(v)));
}

/**
 * 컴포넌트 CSS가 data-force-state로 받는 상태. 규칙이 [data-pressable]일 때만 걸리면(누를 수 있는 카드)
 * pressable = true — 상태 칸에 onPress를 넣어 누를 수 있는 모양으로 그린다.
 */
function forcedStates(name) {
  const dir = join(REACT, name);
  if (!existsSync(dir)) return { states: [], pressable: false };
  const css = readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => read(join(dir, f)))
    .join('\n');
  const selectors = [...css.matchAll(/([^{}]*data-force-state[^{}]*)\{/g)].map((m) => m[1]);
  return {
    states: FORCEABLE.filter((s) => new RegExp(`data-force-state=['"]?${s}\\b`).test(css)),
    pressable: selectors.length > 0 && selectors.every((sel) => sel.includes('[data-pressable]')),
  };
}

/** 예시 파일이 컴포넌트를 가져오는 상대 경로(예: './Button.js') */
function componentImport(src, name) {
  for (const m of src.matchAll(/^import \{([^}]+)\} from '(\.[^']+)';$/gm)) {
    const names = m[1].split(',').map((s) => s.trim().replace(/^type\s+/, ''));
    if (names.includes(name)) return m[2];
  }
  return null;
}

/**
 * 상태 칸 계획. 그릴 수 없는 상태는 unsupported에 이유와 함께 남긴다(스토리 아래에 보인다).
 * 기본 · 강제 칸은 상태 prop을 끈다(예시의 첫 요소가 disabled일 수도 있다).
 * @returns {{ cells: { state: string, props?: Record<string, unknown>, force?: string }[], unsupported: string[], pressable: boolean }}
 */
function planStates(contract, { states: forced, pressable }) {
  const props = contract.props;
  const reset = Object.fromEntries(
    ['disabled', 'loading', 'invalid', 'error'].filter((p) => props[p]).map((p) => [p, undefined]),
  );
  const cells = [];
  const unsupported = [];
  const declared = STATE_ORDER.filter((s) => contract.states.includes(s));
  for (const state of declared) {
    if (state === 'default') cells.push({ state, props: reset });
    else if (FORCEABLE.includes(state)) {
      if (forced.includes(state)) cells.push({ state, force: state, props: reset });
      else unsupported.push(`${state}(CSS가 data-force-state를 받지 않음)`);
    } else if (state === 'disabled') {
      if (props.disabled) cells.push({ state, props: { disabled: true } });
      else unsupported.push('disabled(disabled prop 없음)');
    } else if (state === 'loading') {
      if (props.loading) cells.push({ state, props: { loading: true } });
      // 화면 틀(AppShell)은 불러오는 중을 busy로 받는다
      else if (props.busy) cells.push({ state, props: { busy: true } });
      else if (!declared.includes('default')) cells.push({ state });
      else unsupported.push('loading(loading prop 없음)');
    } else if (state === 'error') {
      if (props.invalid) cells.push({ state, props: { invalid: true } });
      else if (props.error?.type.includes('string'))
        cells.push({ state, props: { error: ERROR_TEXT } });
      else unsupported.push('error(invalid · error prop 없음)');
    }
  }
  return { cells, unsupported, pressable: pressable && Boolean(props.onPress) };
}

/** 컴포넌트 하나의 스토리 계획 */
function planComponent(name, contract) {
  const exFile = join(REACT, name, `${name}.examples.tsx`);
  const entry = '@terracelab/trellis-react';
  const src = existsSync(exFile) ? read(exFile) : '';
  const examples = src ? parseExamples(src, entry) : [];
  const plan = {
    name,
    title: `Components/${name}`,
    examplesFile: exFile,
    examples: examples.map((e) => ({
      exportName: e.name,
      storyExport: RESERVED.has(e.name) ? `${e.name}Example` : e.name,
      title: e.title,
      description: e.description,
    })),
    matrix: null,
    states: null,
    skipped: [],
    vrt: null,
  };
  if (!contract) {
    plan.skipped.push('contract 없음(dist가 오래됐으면 pnpm build)');
    return finish(plan);
  }
  const importPath = componentImport(src, name);
  const tag = new RegExp(`<${name}[\\s/>]`);
  const base = examples.find((e) => tag.test(e.code));
  const overlay = Boolean(contract.props.trigger);
  const reason = !base
    ? `예시가 <${name}>를 직접 그리지 않음`
    : !importPath
      ? `예시가 ${name}를 상대 경로로 가져오지 않음`
      : overlay
        ? 'trigger로 여는 겹침 컴포넌트(칸마다 같은 트리거만 보인다)'
        : null;
  const axes = MATRIX_AXES.filter((p) => contract.props[p]?.values?.length).map((p) => ({
    prop: p,
    values: axisValues(contract.props[p]),
  }));
  if (reason) {
    if (axes.length) plan.skipped.push(`Matrix: ${reason}`);
    plan.skipped.push(`States: ${reason}`);
    return finish(plan);
  }
  plan.base = { exportName: base.name, importPath };
  if (axes.length) plan.matrix = { axes };
  const states = planStates(contract, forcedStates(name));
  if (states.cells.length >= 2) plan.states = { ...states, rootClass: `tl-${kebab(name)}` };
  else plan.skipped.push('States: 그릴 수 있는 상태가 기본 하나뿐');
  return finish(plan);
}

function finish(plan) {
  plan.vrt = plan.matrix ? 'Matrix' : (plan.examples[0]?.storyExport ?? null);
  return plan;
}

/** 모든 컴포넌트 폴더의 계획(예시가 없으면 examples가 빈 배열 — 검사에서 실패) */
export async function planStories() {
  const contracts = await loadContracts();
  return componentFolders().map((name) => planComponent(name, contracts.get(name)));
}

const lit = (v) => JSON.stringify(v);
const comment = (s) => s.replace(/\*\//g, '*\\/');
const js = (v) =>
  JSON.stringify(v, (_k, x) => (x === undefined ? '__undefined__' : x)).replace(
    /"__undefined__"/g,
    'undefined',
  );

/** 계획 → 스토리 파일 소스 */
export function renderStory(plan) {
  const fromOut = (abs) => relative(OUT, abs).split('\\').join('/');
  const exImport = fromOut(plan.examplesFile).replace(/\.tsx$/, '.js');
  const lines = [
    `// 생성물 — apps/storybook/scripts/gen-stories.mjs. 고치지 않는다.`,
    `// 예시 원본: packages/react/src/${plan.name}/${plan.name}.examples.tsx`,
    `import type { Meta, StoryObj } from '@storybook/react-vite';`,
    `import * as Examples from '${exImport}';`,
  ];
  const needsHarness = plan.matrix || plan.states;
  if (needsHarness) {
    const compImport = fromOut(join(REACT, plan.name, plan.base.importPath));
    lines.push(`import { ${plan.name} } from '${compImport}';`);
    const h = [plan.matrix && 'MatrixStory', plan.states && 'StatesStory'].filter(Boolean);
    lines.push(`import { ${h.join(', ')} } from '../src/harness.js';`);
  }
  lines.push(
    '',
    `const meta = {`,
    `  title: ${lit(plan.title)},`,
    `  parameters: { trellis: { component: ${lit(plan.name)} } },`,
    `} satisfies Meta;`,
    `export default meta;`,
    `type Story = StoryObj<typeof meta>;`,
  );
  if (needsHarness)
    lines.push(
      '',
      `/** 같은 컴포넌트를 여러 번 그리는 스토리: 같은 이름의 랜드마크가 겹치는 것은 스토리 탓이라 뺀다 */`,
      `const COPIES = { a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } } };`,
    );
  for (const e of plan.examples) {
    const extra = EXTRA_VRT[plan.name]?.[e.exportName];
    const tagList =
      plan.vrt === e.storyExport || extra
        ? ['vrt', ...(extra?.phone ? [PHONE_TAG] : [])].map((t) => `'${t}'`).join(', ')
        : '';
    const tags = tagList ? `\n  tags: [${tagList}],` : '';
    lines.push(
      '',
      `/** ${comment(e.title)}${e.description ? ` — ${comment(e.description)}` : ''} */`,
      `export const ${e.storyExport}: Story = {`,
      `  name: ${lit(e.title)},${tags}`,
      `  render: () => <Examples.${e.exportName} />,`,
      `  parameters: { docs: { description: { story: ${lit(e.description)} } } },`,
      `};`,
    );
  }
  if (plan.matrix) {
    const axes = plan.matrix.axes.map((a) => a.prop).join(' × ');
    lines.push(
      '',
      `/** 모든 조합(${axes}). 첫 요소의 props는 예시 ${plan.base.exportName}에서 가져온다 */`,
      `export const Matrix: Story = {`,
      `  name: 'Matrix',`,
      `  tags: ['vrt'],`,
      `  parameters: COPIES,`,
      `  render: () => (`,
      `    <MatrixStory`,
      `      example={Examples.${plan.base.exportName}}`,
      `      component={${plan.name}}`,
      `      axes={${js(plan.matrix.axes)}}`,
      `    />`,
      `  ),`,
      `};`,
    );
  }
  if (plan.states) {
    lines.push(
      '',
      `/** 상태(contract states). hover · active · focus는 data-force-state로 강제한다 */`,
      `export const States: Story = {`,
      `  name: 'States',`,
      `  parameters: COPIES,`,
      `  render: () => (`,
      `    <StatesStory`,
      `      example={Examples.${plan.base.exportName}}`,
      `      component={${plan.name}}`,
      `      rootClass=${lit(plan.states.rootClass)}`,
      `      cells={${js(plan.states.cells)}}`,
      ...(plan.states.pressable ? [`      pressable`] : []),
      `      unsupported={${js(plan.states.unsupported)}}`,
      `    />`,
      `  ),`,
      `};`,
    );
  }
  return `${lines.join('\n')}\n`;
}

/** 계획의 문제(스토리 없는 컴포넌트 · VRT 대상 없음) */
export function problems(plans) {
  const out = [];
  for (const p of plans) {
    if (p.examples.length === 0)
      out.push(
        `${p.name}: 스토리 없음(packages/react/src/${p.name}/${p.name}.examples.tsx에 예시 export가 없다)`,
      );
    if (!p.vrt) out.push(`${p.name}: VRT 대상 스토리 없음`);
  }
  return out;
}

/** 예시가 하나도 없으면 파일을 만들지 않는다(스토리 없는 CSF는 Storybook이 거부한다 — problems가 잡는다) */
const writable = (plans) => plans.filter((p) => p.examples.length > 0);

/** generated/와 계획이 같은지(파일 목록 · 내용) */
export function drift(plans) {
  if (!existsSync(OUT)) return [`generated/ 없음`];
  const want = new Map(writable(plans).map((p) => [`${p.name}.stories.tsx`, renderStory(p)]));
  const have = readdirSync(OUT).filter((f) => f.endsWith('.stories.tsx'));
  const out = [];
  for (const f of have) if (!want.has(f)) out.push(`남은 파일: generated/${f}`);
  for (const [f, src] of want) {
    if (!have.includes(f)) out.push(`없는 파일: generated/${f}`);
    else if (read(join(OUT, f)) !== src) out.push(`오래된 파일: generated/${f}`);
  }
  return out;
}

function write(plans) {
  mkdirSync(OUT, { recursive: true });
  const keep = new Set(writable(plans).map((p) => `${p.name}.stories.tsx`));
  for (const f of readdirSync(OUT)) if (!keep.has(f)) rmSync(join(OUT, f));
  for (const p of writable(plans)) {
    const file = join(OUT, `${p.name}.stories.tsx`);
    const src = renderStory(p);
    if (!existsSync(file) || read(file) !== src) writeFileSync(file, src);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const plans = await planStories();
  const errors = problems(plans);
  if (process.argv.includes('--check')) {
    errors.push(...drift(plans));
    if (errors.length) {
      console.error(`stories 검사 실패:\n- ${errors.join('\n- ')}`);
      process.exit(1);
    }
    console.log(`stories 검사 통과: 컴포넌트 ${plans.length} = 스토리 파일 ${plans.length}`);
  } else {
    write(plans);
    const count = (k) => plans.filter((p) => p[k]).length;
    const examples = plans.reduce((s, p) => s + p.examples.length, 0);
    console.log(
      `stories: 컴포넌트 ${plans.length} · 예시 ${examples} · Matrix ${count('matrix')} · States ${count('states')} → ${relative(ROOT, OUT)}`,
    );
    if (errors.length) {
      console.error(`- ${errors.join('\n- ')}`);
      process.exit(1);
    }
  }
}
