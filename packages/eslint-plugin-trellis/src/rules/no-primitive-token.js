// trellis/no-primitive-token — 컴포넌트 · 블록 · 앱은 semantic 색 토큰만 참조한다.
// primitive 색(--tl-color-brand-500 · tokens.color.neutral[700] · primitives.color.*)은 tokens 패키지 안에서만 쓴다.
// primitives.breakpoint는 색이 아니고 matchMedia에 필요해서 허용한다(_internal/sheet.tsx).
import { keyName, matchLoc, stringVisitors } from '../utils/text.js';

/** primitive 색 이름(tokens/src/primitive/color*.json). brand는 semantic(brand.default 등)과 겹쳐 숫자 단계만 primitive */
export const PRIMITIVE_HUES = [
  'neutral',
  'graphite',
  'blue',
  'red',
  'green',
  'amber',
  'violet',
  'teal',
  'shell',
];
const ONLY_PRIMITIVE = ['base', 'alpha', 'cvd', ...PRIMITIVE_HUES];

/** CSS 변수 이름. \0은 템플릿 식 자리(--tl-color-brand-${state}는 semantic일 수 있어 숫자 단계만 본다) */
const CSS_VAR = new RegExp(
  [
    `--tl-color-alpha-[\\w\\0-]+`,
    // 색각 친화 차트 원색(D-97): semantic chart.series.*를 쓴다
    `--tl-color-cvd-[\\w\\0-]+`,
    `--tl-color-base-(?:white|black|\\0)`,
    `--tl-color-brand-\\d+(?![\\w-])`,
    `--tl-color-(?:${PRIMITIVE_HUES.join('|')})-(?:\\d+|\\0)(?![\\w-])`,
    `--tl-color-\\0-\\d+(?![\\w-])`,
  ].join('|'),
  'g',
);

const TOKENS_MODULE = /^@terracelab\/trellis-tokens(\/(web|native))?$/;

/** 정적 멤버 경로: tokens.color.brand[500] → ['tokens', 'color', 'brand', '500'] */
function memberPath(node) {
  const path = [];
  let cur = node;
  while (cur.type === 'MemberExpression') {
    const p = cur.property;
    if (!cur.computed && p.type === 'Identifier') path.unshift(p.name);
    else if (p.type === 'Literal') path.unshift(String(p.value));
    else path.unshift(null);
    cur = cur.object;
  }
  if (cur.type !== 'Identifier') return null;
  path.unshift(cur.name);
  return { root: cur, path };
}

function isPrimitiveColorPath(segments) {
  const i = segments.indexOf('color');
  if (i < 0) return false;
  const group = segments[i + 1];
  if (group == null) return false;
  if (ONLY_PRIMITIVE.includes(group)) return true;
  const step = segments[i + 2];
  return group === 'brand' && step != null && /^\d+$/.test(step);
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'primitive 색 토큰(--tl-color-<hue>-<step> · tokens.color.<hue>[step] · primitives.*) 직접 참조를 막는다. semantic 토큰을 쓴다',
    },
    schema: [],
    messages: {
      cssVar:
        'primitive 색 변수 "{{value}}". semantic 변수(--tl-color-bg-* · fg-* · brand-default · status-* …)를 쓰고, 없으면 토큰 PR을 먼저 낸다',
      member:
        'primitive 색 토큰 {{value}}. semantic 토큰(tokens.color.bg.* · brand.default · status.* …)을 쓰고, 없으면 토큰 PR을 먼저 낸다',
      primitives:
        'primitives.{{value}}는 raw 값이다. semantic 토큰을 쓴다(primitives.breakpoint만 허용)',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    /** tokens 패키지에서 가져온 지역 이름 → 가져온 이름 */
    const imported = new Map();

    function checkPrimitivesUse(id) {
      const parent = id.parent;
      if (parent.type === 'MemberExpression' && parent.object === id) {
        const name = keyName(parent.property, parent.computed);
        if (name === 'breakpoint') return;
        context.report({ node: parent, messageId: 'primitives', data: { value: name ?? '[…]' } });
        return;
      }
      context.report({ node: id, messageId: 'primitives', data: { value: '*' } });
    }

    return {
      ...stringVisitors((node, read) => {
        for (const m of read.text.matchAll(CSS_VAR))
          context.report({
            node,
            loc: matchLoc(sourceCode, read, m.index, m[0].length),
            messageId: 'cssVar',
            data: { value: m[0].replaceAll('\0', '${…}') },
          });
      }),
      ImportDeclaration(node) {
        if (!TOKENS_MODULE.test(String(node.source.value))) return;
        for (const s of node.specifiers) {
          const name =
            s.type === 'ImportSpecifier'
              ? keyName(s.imported, false)
              : s.type === 'ImportNamespaceSpecifier'
                ? '*'
                : 'default';
          imported.set(s.local.name, name);
          if (name !== 'primitives') continue;
          const variable = sourceCode.getDeclaredVariables(s)[0];
          for (const ref of variable?.references ?? []) checkPrimitivesUse(ref.identifier);
        }
      },
      MemberExpression(node) {
        // 가장 바깥 멤버식에서만 본다
        if (node.parent?.type === 'MemberExpression' && node.parent.object === node) return;
        const mp = memberPath(node);
        if (!mp) return;
        const from = imported.get(mp.root.name);
        if (from === undefined) return;
        const segments = from === '*' ? mp.path.slice(1) : [from, ...mp.path.slice(1)];
        // 네임스페이스 import: T.primitives.color.* · T.tokens.color.neutral[700]
        if (segments[0] === 'primitives') {
          if (from === '*' && segments[1] !== 'breakpoint')
            context.report({ node, messageId: 'primitives', data: { value: segments[1] ?? '*' } });
          return;
        }
        if (
          (segments[0] === 'tokens' || segments[0] === 'themes') &&
          isPrimitiveColorPath(segments)
        )
          context.report({
            node,
            messageId: 'member',
            data: { value: sourceCode.getText(node) },
          });
      },
    };
  },
};
