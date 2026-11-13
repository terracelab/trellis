// dist/json/flat.json — CSS 변수 이름 → 모드별 해석값. 린트 허용 값 목록·드리프트 스캔용
export function flat(b) {
  const out = {};
  const put = (tokens, mode) => {
    for (const t of tokens) (out[`--${t.name}`] ??= {})[mode] = t.$value;
  };
  put(b.css.primitive, 'value');
  put(b.css.semanticLight, 'light');
  put(b.css.semanticDark, 'dark');
  put(b.css.densityCompact, 'compact');
  put(b.css.densityComfortable, 'comfortable');
  put(b.css.densityTouch, 'touch');
  put(b.css.typography, 'value');
  put(b.css.paper, 'value');
  return `${JSON.stringify(out, null, 2)}\n`;
}
