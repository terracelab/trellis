// 이름 변환: 토큰 경로 → `tl-` 접두 케밥. 숫자 키는 그대로 둔다.
//   color.bg.surface → tl-color-bg-surface, type.amountLg.fontSize → tl-type-amount-lg-font-size
const ALIAS = /^\{([A-Za-z0-9_.-]+)\}$/;

export function kebab(segment) {
  return String(segment)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function cssName(path) {
  return ['tl', ...path.map(kebab)].join('-');
}

export function cssVar(path) {
  return `var(--${cssName(path)})`;
}

/** `{color.neutral.50}` 이면 참조 경로 배열, 아니면 null */
export function aliasPath(value) {
  const m = typeof value === 'string' ? ALIAS.exec(value) : null;
  return m ? m[1].split('.') : null;
}

export function registerNameTransform(StyleDictionary) {
  StyleDictionary.registerTransform({
    name: 'trellis/name/kebab',
    type: 'name',
    transform: (token) => cssName(token.path),
  });
}
