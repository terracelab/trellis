// primitive 색 스케일 생성기. scales.config.json → src/primitive/color.json
// 결정적이다: 같은 설정이면 몇 번을 실행해도 같은 파일이 나온다.
//
//   node scripts/gen-color-scale.mjs          파일을 쓴다
//   node scripts/gen-color-scale.mjs --check  파일이 최신이 아니면 종료 코드 1
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { clampChroma, converter, formatHex } from 'culori';

export const CONFIG_PATH = fileURLToPath(new URL('../scales.config.json', import.meta.url));
export const OUTPUT_PATH = fileURLToPath(new URL('../src/primitive/color.json', import.meta.url));

const HEX = /^#[0-9A-F]{6}$/;
const toOklch = converter('oklch');

export function readConfig(path = CONFIG_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function fail(message) {
  throw new Error(`scales.config.json: ${message}`);
}

function checkHex(value, where) {
  if (typeof value !== 'string' || !HEX.test(value)) {
    fail(`${where} = ${JSON.stringify(value)} 는 대문자 6자리 hex(#RRGGBB)가 아니다`);
  }
}

function validate(config) {
  const { steps, lightness, chroma, hues, base } = config;
  if (!steps.includes(500)) fail('steps에 500이 없다');
  const sorted = [...steps].sort((a, b) => a - b);
  if (sorted.some((s, i) => s !== steps[i])) fail('steps는 오름차순이어야 한다');

  const lighter = steps.filter((s) => s < 500).reverse(); // 400 → 50
  const darker = steps.filter((s) => s > 500); // 600 → 950
  for (const [side, list, weights] of [
    ['towardLight', lighter, lightness.towardLight],
    ['towardDark', darker, lightness.towardDark],
  ]) {
    let prev = 0;
    for (const s of list) {
      const w = weights[s];
      if (typeof w !== 'number') fail(`lightness.${side}.${s} 가 없다`);
      if (!(w > prev && w <= 1))
        fail(`lightness.${side}는 500에서 멀어질수록 커져야 하고 1 이하여야 한다(${s})`);
      prev = w;
    }
    if (prev !== 1) fail(`lightness.${side}의 마지막 단계는 1이어야 한다`);
  }
  for (const s of steps) {
    if (typeof chroma[s] !== 'number' || chroma[s] < 0) fail(`chroma.${s} 가 없거나 음수다`);
  }
  if (chroma[500] !== 1) fail('chroma.500은 1이어야 한다');

  checkHex(base.white, 'base.white');
  checkHex(base.black, 'base.black');
  for (const [name, hue] of Object.entries(hues)) {
    checkHex(hue.base, `hues.${name}.base`);
    for (const [step, value] of Object.entries(hue.anchors ?? {})) {
      if (!steps.includes(Number(step)) || Number(step) === 500)
        fail(`hues.${name}.anchors.${step}는 쓸 수 없는 단계다`);
      checkHex(value, `hues.${name}.anchors.${step}`);
    }
  }
}

function token(value, description) {
  return description
    ? { $value: value, $type: 'color', $description: description }
    : { $value: value, $type: 'color' };
}

/** 설정으로 DTCG 형식의 primitive 색 트리를 만든다. 파일은 쓰지 않는다. */
export function generateColorScale(config) {
  validate(config);
  const { steps, lightness, chroma, hues, base } = config;

  const color = {
    $description:
      '생성물: pnpm --filter @terracelab/trellis-tokens gen:colors. 직접 고치지 말고 scales.config.json을 고친다.',
    base: { white: token(base.white), black: token(base.black) },
  };

  for (const [name, hue] of Object.entries(hues)) {
    const anchors = hue.anchors ?? {};
    const mid = toOklch(hue.base);
    const lightEnd = anchors[steps[0]] ? toOklch(anchors[steps[0]]).l : lightness.lightEnd;
    const darkEnd = anchors[steps.at(-1)] ? toOklch(anchors[steps.at(-1)]).l : lightness.darkEnd;
    if (!(darkEnd < mid.l && mid.l < lightEnd)) {
      fail(
        `hues.${name}.base의 L(${mid.l.toFixed(3)})이 끝값 사이(${darkEnd}~${lightEnd})에 있지 않다`,
      );
    }

    const group = {};
    for (const step of steps) {
      if (step === 500) {
        group[step] = token(hue.base, '기준값(scales.config.json)');
        continue;
      }
      if (anchors[step]) {
        group[step] = token(anchors[step], '앵커(scales.config.json)');
        continue;
      }
      const l =
        step < 500
          ? mid.l + (lightEnd - mid.l) * lightness.towardLight[step]
          : mid.l - (mid.l - darkEnd) * lightness.towardDark[step];
      const c = mid.c * chroma[step];
      // sRGB 밖이면 L·H를 고정한 채 C만 줄인다(CSS Color 4 toGamut은 마지막 clip에서 H가 최대 16° 틀어짐)
      const inGamut = clampChroma({ mode: 'oklch', l, c, h: mid.h ?? 0 }, 'oklch');
      const hex = formatHex(inGamut).toUpperCase();
      group[step] = token(hex);
    }
    color[name] = group;
  }

  return { color };
}

export function serialize(tree) {
  return `${JSON.stringify(tree, null, 2)}\n`;
}

function main(argv) {
  const next = serialize(generateColorScale(readConfig()));
  if (argv.includes('--check')) {
    let current = '';
    try {
      current = readFileSync(OUTPUT_PATH, 'utf8');
    } catch {
      // 파일이 없으면 최신이 아니다
    }
    if (current !== next) {
      console.error(
        'src/primitive/color.json 이 최신이 아니다. pnpm --filter @terracelab/trellis-tokens gen:colors 를 실행한다.',
      );
      process.exitCode = 1;
      return;
    }
    console.log('src/primitive/color.json 최신');
    return;
  }
  writeFileSync(OUTPUT_PATH, next);
  console.log(`src/primitive/color.json 작성 (${Object.keys(readConfig().hues).length} hue)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
