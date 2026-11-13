// dist/docs/tokens.md — 이름·값·대비율 표(Storybook 문서 페이지용)
import { wcagContrast } from 'culori';
import { aliasPath } from '../transforms/name.mjs';
import { cssValue } from './css.mjs';
import { HEADER } from './_util.mjs';

/** 알파가 있으면 바탕 위에 합성한 불투명 hex */
export function composite(fg, bg) {
  if (fg.length !== 9) return fg;
  const a = parseInt(fg.slice(7), 16) / 255;
  const ch = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const mix = [0, 1, 2].map((i) => Math.round(ch(fg, i) * a + ch(bg, i) * (1 - a)));
  return `#${mix
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

export function contrastOn(fg, bg) {
  return wcagContrast(composite(fg, bg), bg);
}

const row = (cells) => `| ${cells.join(' | ')} |`;
const code = (s) => `\`${s}\``;

export function docs(b) {
  const surface = (list) => list.find((t) => t.path.join('.') === 'color.bg.surface').$value;
  const sL = surface(b.css.semanticLight);
  const sD = surface(b.css.semanticDark);
  const dark = new Map(b.css.semanticDark.map((t) => [t.path.join('.'), t]));
  const out = [`# Trellis 토큰`, '', `> ${HEADER}`, ''];

  out.push(
    '## Semantic 색',
    '',
    '대비는 같은 모드의 `color.bg.surface` 위에서 잰 WCAG 2 대비(알파 색은 합성 후).',
    '',
  );
  out.push(
    row(['토큰', 'Light', 'Dark', '대비 L', '대비 D', '용도']),
    row(['---', '---', '---', '---:', '---:', '---']),
  );
  for (const t of b.css.semanticLight) {
    const d = dark.get(t.path.join('.'));
    const ref = (x) => `${code(x.$value)} ← ${code(x.original.$value.slice(1, -1))}`;
    out.push(
      row([
        code(`--${t.name}`),
        ref(t),
        ref(d),
        contrastOn(t.$value, sL).toFixed(2),
        contrastOn(d.$value, sD).toFixed(2),
        t.$description ?? '',
      ]),
    );
  }

  const hues = [
    ...new Set(
      b.css.primitive
        .filter((t) => t.path[0] === 'color' && /^\d+$/.test(t.path[2]))
        .map((t) => t.path[1]),
    ),
  ];
  // 단계 = 모든 hue 단계의 합집합(사이드바 톤 shell은 단계가 다르다, 없는 칸은 –)
  const steps = [
    ...new Set(
      b.css.primitive
        .filter((t) => t.path[0] === 'color' && /^\d+$/.test(t.path[2]))
        .map((t) => t.path[2]),
    ),
  ].sort((x, y) => Number(x) - Number(y));
  out.push(
    '',
    '## Primitive 색',
    '',
    row(['hue', ...steps]),
    row(['---', ...steps.map(() => '---')]),
  );
  for (const hue of hues) {
    out.push(
      row([
        hue,
        ...steps.map((s) => {
          const t = b.css.primitive.find((x) => x.path.join('.') === `color.${hue}.${s}`);
          return t ? code(t.$value) : '–';
        }),
      ]),
    );
  }

  out.push('', '## 그 밖의 primitive', '', row(['토큰', '값', '설명']), row(['---', '---', '---']));
  for (const t of b.css.primitive.filter(
    (x) => x.path[0] !== 'color' || !/^\d+$/.test(x.path[2] ?? ''),
  )) {
    out.push(row([code(`--${t.name}`), code(String(t.$value)), t.$description ?? '']));
  }

  const comfortable = new Map(b.css.densityComfortable.map((t) => [t.path.join('.'), t]));
  const touch = new Map(b.css.densityTouch.map((t) => [t.path.join('.'), t]));
  out.push(
    '',
    '## Density',
    '',
    'touch는 휴대폰(breakpoint.sm 미만)에서 루트에 자동으로 적용된다.',
    '',
    row(['토큰', 'compact', 'comfortable', 'touch']),
    row(['---', '---:', '---:', '---:']),
  );
  for (const t of b.css.densityCompact) {
    const key = t.path.join('.');
    out.push(
      row([
        code(`--${t.name}`),
        code(t.$value),
        code(comfortable.get(key).$value),
        code(touch.get(key).$value),
      ]),
    );
  }

  out.push('', '## Typography', '', row(['토큰', '값']), row(['---', '---']));
  for (const t of b.css.typography) out.push(row([code(`--${t.name}`), code(cssValue(t))]));

  const paperBg = b.css.paper.find((t) => t.path.join('.') === 'paper.bg').$value;
  out.push(
    '',
    '## Paper',
    '',
    '종이 서식(A4 · A5 인쇄 · PDF). 테마와 무관하게 라이트 · 다크 값이 같다. 색 대비는 `paper.bg` 위에서 잰다.',
    '',
    row(['토큰', '값', '대비', '용도']),
    row(['---', '---', '---:', '---']),
  );
  for (const t of b.css.paper) {
    const ref = aliasPath(t.original.$value);
    const value = ref ? `${code(t.$value)} ← ${code(ref.join('.'))}` : code(String(t.$value));
    const ratio = t.$type === 'color' ? contrastOn(t.$value, paperBg).toFixed(2) : '';
    out.push(row([code(`--${t.name}`), value, ratio, t.$description ?? '']));
  }
  return `${out.join('\n')}\n`;
}
