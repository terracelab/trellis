// trellis/dependency-direction — tokens ← icons ← contracts ← react · native ← blocks ← apps.
// 패키지 이름(@terracelab/trellis-*) import와 패키지 경계를 넘는 상대 경로를 함께 본다.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** 패키지 이름 → 계층. 여기에 없는 @terracelab/* 워크스페이스 패키지(apps · starters · templates · 도구)는 app */
export const LAYER_OF = {
  '@terracelab/trellis-tokens': 'tokens',
  '@terracelab/trellis-icons': 'icons',
  '@terracelab/trellis-contracts': 'contracts',
  '@terracelab/trellis-react': 'react',
  '@terracelab/trellis-native': 'native',
  '@terracelab/trellis-blocks': 'blocks',
};

/** 계층마다 import해도 되는 계층(자기 자신은 늘 된다). app은 제한 없음 */
export const ALLOWED = {
  tokens: [],
  icons: ['tokens'],
  contracts: ['tokens', 'icons'],
  react: ['tokens', 'icons', 'contracts'],
  native: ['tokens', 'icons', 'contracts'],
  blocks: ['tokens', 'icons', 'contracts', 'react'],
};

/** 플랫폼 중립 계층이 가져오면 안 되는 외부 패키지 */
const PLATFORM = /^(react|react-dom|react-native|@base-ui-components\/[^/]+|@base-ui\/[^/]+)(\/|$)/;
const NEUTRAL = new Set(['tokens', 'contracts']);

const SCOPE = '@terracelab/';

const pkgCache = new Map();

function readName(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8')).name ?? null;
  } catch {
    return null;
  }
}

/** 경로에서 가장 가까운 package.json의 { name, dir } */
export function nearestPackage(dir) {
  if (pkgCache.has(dir)) return pkgCache.get(dir);
  const file = join(dir, 'package.json');
  const up = dirname(dir);
  const hit = existsSync(file)
    ? { name: readName(file), dir }
    : up === dir
      ? null
      : nearestPackage(up);
  pkgCache.set(dir, hit);
  return hit;
}

function layerOf(name) {
  if (!name) return null;
  if (LAYER_OF[name]) return LAYER_OF[name];
  return name.startsWith(SCOPE) ? 'app' : null;
}

/** '@terracelab/trellis-react/charts' → '@terracelab/trellis-react' */
function packageNameOf(spec) {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/');
  return spec.split('/')[0];
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        '의존 방향 tokens ← icons ← contracts ← react · native ← blocks ← apps를 지킨다. 역방향 import와 패키지 사이 상대 경로를 막는다',
    },
    schema: [],
    messages: {
      reverse:
        '{{from}}({{fromLayer}})는 {{to}}({{toLayer}})를 가져올 수 없다. 의존 방향: tokens ← icons ← contracts ← react · native ← blocks ← apps',
      platform: '{{from}}({{fromLayer}})는 플랫폼 중립이라 {{to}}를 가져올 수 없다',
      relative: '다른 패키지({{to}})를 상대 경로 "{{spec}}"로 가져온다. 패키지 이름으로 가져온다',
    },
  },
  create(context) {
    const filename = context.physicalFilename ?? context.filename;
    if (!filename || filename.startsWith('<')) return {};
    const self = nearestPackage(dirname(resolve(filename)));
    const fromLayer = layerOf(self?.name);
    if (!self || !fromLayer) return {};

    function check(sourceNode) {
      if (!sourceNode || sourceNode.type !== 'Literal' || typeof sourceNode.value !== 'string')
        return;
      const spec = sourceNode.value;
      let target;
      let relative = false;
      if (spec.startsWith('.')) {
        const hit = nearestPackage(resolve(dirname(filename), spec));
        if (!hit || hit.dir === self.dir || !hit.name?.startsWith(SCOPE)) return;
        target = hit.name;
        relative = true;
      } else {
        const name = packageNameOf(spec);
        if (NEUTRAL.has(fromLayer) && PLATFORM.test(spec)) {
          context.report({
            node: sourceNode,
            messageId: 'platform',
            data: { from: self.name, fromLayer, to: spec },
          });
          return;
        }
        if (!name.startsWith(SCOPE) || name === self.name) return;
        target = name;
      }
      const toLayer = layerOf(target);
      const allowed =
        fromLayer === 'app' || toLayer === fromLayer || ALLOWED[fromLayer].includes(toLayer);
      if (!allowed) {
        context.report({
          node: sourceNode,
          messageId: 'reverse',
          data: { from: self.name, fromLayer, to: target, toLayer },
        });
        return;
      }
      if (relative)
        context.report({ node: sourceNode, messageId: 'relative', data: { to: target, spec } });
    }

    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
      TSImportEqualsDeclaration: (node) =>
        node.moduleReference.type === 'TSExternalModuleReference' &&
        check(node.moduleReference.expression),
      TSImportType: (node) =>
        check(node.argument?.type === 'TSLiteralType' ? node.argument.literal : node.argument),
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require')
          check(node.arguments[0]);
      },
    };
  },
};
