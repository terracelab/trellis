// trellis/hover-transition (PR-26): hover가 색 · 배경 · 테두리 · 그림자를 바꾸면 그 요소에 transition이 있어야 한다.
// 손이 닿을 때마다 뚝뚝 끊기지 않게(components.md §8 "상태 전환"). 같은 파일 안에서
// hover 대상(선택자 마지막 조각)의 클래스를 모두 가진 규칙 중 하나가 transition을 선언하면 통과.
//   .tl-button:hover { background } ← .tl-button { transition: background-color … }
//   .tl-grid__row:hover > .tl-grid__cell { background } ← .tl-grid__cell { transition … }
// 일부러 즉시 바꾸는 곳은 /* stylelint-disable-next-line trellis/hover-transition */ + 이유.
import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

export const ruleName = 'trellis/hover-transition';
export const messages = ruleMessages(ruleName, {
  missing: (selector, props) =>
    `"${selector}"가 hover에서 ${props}을(를) 바꾸는데 대상 요소에 transition이 없다. 대상의 기본 규칙에 transition: <속성> var(--tl-duration-fast) var(--tl-easing-standard)를 둔다`,
});

const VISUAL = new Set([
  'background',
  'background-color',
  'color',
  'border-color',
  'box-shadow',
  'fill',
  'stroke',
  'outline-color',
  'text-decoration-color',
]);

/** 선택자 하나의 마지막 조각(결합자 뒤) */
function lastCompound(selector) {
  // 괄호 안 결합자(:not(a b), :has(> x))는 건너뛴다
  let depth = 0;
  let cut = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const ch = selector[i];
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    else if (depth === 0 && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')) cut = i + 1;
  }
  return selector.slice(cut).trim();
}

/** 조각에서 괄호 밖 클래스만 */
function classesOf(compound) {
  const out = new Set();
  let depth = 0;
  for (let i = 0; i < compound.length; i += 1) {
    const ch = compound[i];
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    else if (depth === 0 && ch === '.') {
      const m = /^\.([a-zA-Z0-9_-]+)/.exec(compound.slice(i));
      if (m) out.add(m[1]);
    }
  }
  return out;
}

const splitList = (selector) => {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const ch = selector[i];
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    else if (depth === 0 && ch === ',') {
      out.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(selector.slice(start).trim());
  return out.filter(Boolean);
};

const inReducedMotion = (node) => {
  for (let p = node.parent; p; p = p.parent)
    if (p.type === 'atrule' && /prefers-reduced-motion/.test(p.params)) return true;
  return false;
};

const ruleFunction = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary })) return;

  /** transition을 선언한 규칙들의 마지막 조각 클래스 집합 */
  const animated = [];
  root.walkRules((rule) => {
    if (inReducedMotion(rule)) return;
    const has = rule.nodes?.some(
      (d) =>
        d.type === 'decl' &&
        /^transition(-property)?$/.test(d.prop) &&
        !/^\s*none\s*$/.test(d.value),
    );
    if (!has) return;
    for (const s of splitList(rule.selector)) {
      const cls = classesOf(lastCompound(s));
      if (cls.size) animated.push(cls);
    }
  });

  root.walkRules((rule) => {
    if (!/:hover/.test(rule.selector) || inReducedMotion(rule)) return;
    const props = (rule.nodes ?? [])
      .filter((d) => d.type === 'decl' && VISUAL.has(d.prop))
      .map((d) => d.prop);
    if (!props.length) return;
    for (const s of splitList(rule.selector)) {
      if (!s.includes(':hover')) continue;
      const target = classesOf(lastCompound(s.replace(/:hover/g, '')));
      if (!target.size) continue;
      const ok = animated.some((cls) => [...cls].every((c) => target.has(c)));
      if (!ok) {
        report({
          ruleName,
          result,
          node: rule,
          message: messages.missing(s, [...new Set(props)].join(' · ')),
        });
        break;
      }
    }
  });
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = { url: 'docs/spec/components.md' };

export default createPlugin(ruleName, ruleFunction);
