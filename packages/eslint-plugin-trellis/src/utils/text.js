// 규칙이 공통으로 쓰는 문자열 읽기 · 스타일 문맥 판정.
// 문자열 리터럴과 템플릿 리터럴을 한 줄 텍스트로 펴고(식 자리는 \0), 매치 위치를 원본 위치로 되돌린다.

/** 식(`${…}`) 자리 표시. 숫자 · 글자가 아니라서 `${n}px` 같은 단위 붙이기는 px 리터럴로 잡히지 않는다 */
export const HOLE = '\0';

/** 스타일 값을 감싸도 문맥이 바뀌지 않는 노드 */
const TRANSPARENT = new Set([
  'ConditionalExpression',
  'LogicalExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'ChainExpression',
]);

/** 검사할 필요 없는 문자열 자리(모듈 경로 · 키 · 타입 · 지시문) */
export function isIgnorableLiteral(node) {
  const p = node.parent;
  if (!p) return false;
  switch (p.type) {
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportAllDeclaration':
    case 'ImportExpression':
    case 'TSExternalModuleReference':
    case 'TSLiteralType':
    case 'TSImportType':
      return true;
    case 'Property':
    case 'PropertyDefinition':
    case 'MethodDefinition':
    case 'TSPropertySignature':
      return p.key === node && !p.computed;
    case 'TSEnumMember':
      return p.id === node;
    case 'ExpressionStatement':
      return Boolean(p.directive);
    case 'CallExpression':
      // require('…')
      return p.callee.type === 'Identifier' && p.callee.name === 'require';
    default:
      return false;
  }
}

/**
 * 문자열 · 템플릿 노드를 검사용 텍스트로 편다.
 * @returns {{ text: string, at: (index: number) => number } | null} at은 텍스트 위치 → 소스 위치
 */
export function readText(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    const raw = node.raw ?? JSON.stringify(node.value);
    const start = node.range[0] + 1;
    return { text: raw.slice(1, -1), at: (i) => start + i };
  }
  if (node.type === 'TemplateLiteral') {
    const parts = [];
    let text = '';
    node.quasis.forEach((q, i) => {
      if (i > 0) text += HOLE;
      parts.push({ from: text.length, start: q.range[0] + 1 });
      text += q.value.raw;
    });
    return {
      text,
      at: (index) => {
        let part = parts[0];
        for (const p of parts) if (p.from <= index) part = p;
        return part.start + (index - part.from);
      },
    };
  }
  return null;
}

/** 리포트 위치: 텍스트 안 매치 범위 → loc */
export function matchLoc(sourceCode, read, index, length) {
  return {
    start: sourceCode.getLocFromIndex(read.at(index)),
    end: sourceCode.getLocFromIndex(read.at(index + length)),
  };
}

/** 이름(식별자 · 문자열 키) */
export function keyName(key, computed) {
  if (!key) return null;
  if (key.type === 'Identifier' && !computed) return key.name;
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value;
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0)
    return key.quasis[0].value.cooked;
  return null;
}

/** JSX 속성 이름 */
export function jsxAttrName(attr) {
  if (attr.name.type === 'JSXIdentifier') return attr.name.name;
  if (attr.name.type === 'JSXNamespacedName')
    return `${attr.name.namespace.name}:${attr.name.name.name}`;
  return null;
}

/** 값 노드에서 투명 래퍼 · 템플릿 끼움 · 문자열 더하기를 거슬러 올라간 실제 자리 */
export function climb(node) {
  let child = node;
  let p = node.parent;
  while (p) {
    if (TRANSPARENT.has(p.type)) {
      if (p.type === 'ConditionalExpression' && p.test === child) break;
      child = p;
      p = p.parent;
      continue;
    }
    if (p.type === 'TemplateLiteral' && p.expressions.includes(child)) {
      child = p;
      p = p.parent;
      continue;
    }
    if (p.type === 'BinaryExpression' && p.operator === '+') {
      child = p;
      p = p.parent;
      continue;
    }
    break;
  }
  return { node: child, parent: p };
}

const STYLE_TYPE = /\b(CSSProperties|ViewStyle|TextStyle|ImageStyle|StyleProp)\b/;

function typeText(sourceCode, typeNode) {
  return typeNode ? sourceCode.getText(typeNode) : '';
}

/** 스타일 속성 이름(style · contentStyle · labelStyle …) */
export function isStyleAttrName(name) {
  return typeof name === 'string' && (name === 'style' || /Style$/.test(name));
}

/** 객체 리터럴이 스타일 객체인가: style={{…}}, CSSProperties 타입, StyleSheet.create, Object.assign(el.style, …) */
export function isStyleObject(sourceCode, obj) {
  let child = obj;
  let p = obj.parent;
  while (p) {
    if (TRANSPARENT.has(p.type) || p.type === 'ArrayExpression' || p.type === 'SpreadElement') {
      if (
        (p.type === 'TSAsExpression' ||
          p.type === 'TSSatisfiesExpression' ||
          p.type === 'TSTypeAssertion') &&
        STYLE_TYPE.test(typeText(sourceCode, p.typeAnnotation))
      )
        return true;
      if (p.type === 'SpreadElement' && p.parent?.type === 'ObjectExpression') {
        return isStyleObject(sourceCode, p.parent);
      }
      child = p;
      p = p.parent;
      continue;
    }
    break;
  }
  if (!p) return false;
  if (p.type === 'JSXExpressionContainer' && p.parent?.type === 'JSXAttribute') {
    return isStyleAttrName(jsxAttrName(p.parent));
  }
  if (p.type === 'VariableDeclarator' && p.init === child) {
    return STYLE_TYPE.test(typeText(sourceCode, p.id.typeAnnotation));
  }
  if (p.type === 'Property' && p.value === child) {
    if (isStyleAttrName(keyName(p.key, p.computed))) return true;
    // StyleSheet.create({ name: { … } })
    const outer = p.parent;
    const call = outer?.parent;
    if (
      call?.type === 'CallExpression' &&
      call.arguments[0] === outer &&
      call.callee.type === 'MemberExpression' &&
      sourceCode.getText(call.callee) === 'StyleSheet.create'
    )
      return true;
    return false;
  }
  if (p.type === 'CallExpression' && p.arguments.includes(child)) {
    const callee = sourceCode.getText(p.callee);
    if (callee === 'Object.assign' && p.arguments[0] && isStyleMember(p.arguments[0])) return true;
    return false;
  }
  if (p.type === 'ReturnStatement' || p.type === 'ArrowFunctionExpression') {
    const fn = p.type === 'ReturnStatement' ? enclosingFunction(p) : p;
    return Boolean(fn && STYLE_TYPE.test(typeText(sourceCode, fn.returnType)));
  }
  return false;
}

function enclosingFunction(node) {
  let p = node.parent;
  while (p) {
    if (
      p.type === 'FunctionDeclaration' ||
      p.type === 'FunctionExpression' ||
      p.type === 'ArrowFunctionExpression'
    )
      return p;
    p = p.parent;
  }
  return null;
}

/** `x.style` 또는 `x.style.prop` */
export function isStyleMember(node) {
  if (node.type !== 'MemberExpression') return false;
  const name = keyName(node.property, node.computed);
  if (name === 'style') return true;
  return (
    node.object.type === 'MemberExpression' &&
    keyName(node.object.property, node.object.computed) === 'style'
  );
}

/**
 * 값 노드가 놓인 스타일 문맥.
 * @returns {{ prop: string | null } | null} prop은 CSS 속성 이름(알 수 없으면 null). 스타일 문맥이 아니면 null
 */
export function styleContext(sourceCode, node) {
  const { node: child, parent: p } = climb(node);
  if (!p) return null;
  if (p.type === 'Property' && p.value === child && p.parent?.type === 'ObjectExpression') {
    if (isStyleObject(sourceCode, p.parent)) return { prop: keyName(p.key, p.computed) };
    return null;
  }
  if (p.type === 'JSXExpressionContainer' && p.parent?.type === 'JSXAttribute') {
    return isStyleAttrName(jsxAttrName(p.parent)) ? { prop: null } : null;
  }
  if (p.type === 'JSXAttribute') {
    return isStyleAttrName(jsxAttrName(p)) ? { prop: null } : null;
  }
  if (
    p.type === 'AssignmentExpression' &&
    p.right === child &&
    p.left.type === 'MemberExpression'
  ) {
    const left = p.left;
    const prop = keyName(left.property, left.computed);
    if (prop === 'cssText' && isStyleMember(left.object)) return { prop: null };
    if (
      left.object.type === 'MemberExpression' &&
      keyName(left.object.property, left.object.computed) === 'style'
    )
      return { prop };
    return null;
  }
  if (
    p.type === 'CallExpression' &&
    p.callee.type === 'MemberExpression' &&
    keyName(p.callee.property, p.callee.computed) === 'setProperty' &&
    isStyleMember(p.callee.object) &&
    p.arguments[1] === child
  ) {
    const name = p.arguments[0];
    return { prop: name?.type === 'Literal' && typeof name.value === 'string' ? name.value : null };
  }
  return null;
}

/** 값 노드가 붙은 이름: 객체 키 · JSX 속성 이름(스타일 문맥이 아니어도) */
export function ownerName(node) {
  const { node: child, parent: p } = climb(node);
  if (!p) return null;
  if (p.type === 'Property' && p.value === child) return keyName(p.key, p.computed);
  if (p.type === 'JSXAttribute') return jsxAttrName(p);
  if (p.type === 'JSXExpressionContainer' && p.parent?.type === 'JSXAttribute')
    return jsxAttrName(p.parent);
  if (p.type === 'AssignmentExpression' && p.right === child && p.left.type === 'MemberExpression')
    return keyName(p.left.property, p.left.computed);
  return null;
}

/** camelCase → kebab-case (CSS 속성 비교용) */
export function kebab(name) {
  return name.startsWith('--') ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * 텍스트 안 CSS 선언(`prop: value` · HTML 속성 `prop="value"`)의 값 범위.
 * @returns {Array<{ prop: string, from: number, to: number }>}
 */
export function declarations(text) {
  const out = [];
  // CSS 선언과 HTML 속성을 따로 찾는다(style="color: …"는 속성 하나 + 선언 하나)
  const css = /(^|[\s;{"'`(])(-{0,2}[a-zA-Z][\w-]*)\s*:\s*([^;{}<>"'`\n]*)/g;
  const attr = /(^|\s)([a-zA-Z][\w:-]*)\s*=\s*["']([^"'<>]*)/g;
  for (const m of [...text.matchAll(css), ...text.matchAll(attr)]) {
    const value = m[3];
    const from = m.index + m[0].length - value.length;
    out.push({ prop: m[2].toLowerCase(), from, to: from + value.length });
  }
  return out;
}

/** 공통 방문자: 문자열 · 템플릿 노드마다 cb(node, read) */
export function stringVisitors(cb) {
  return {
    Literal(node) {
      if (typeof node.value !== 'string' || isIgnorableLiteral(node)) return;
      const read = readText(node);
      if (read) cb(node, read);
    },
    TemplateLiteral(node) {
      const read = readText(node);
      if (read) cb(node, read);
    },
  };
}
