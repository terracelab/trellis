// React Native 값 변환. 모두 멱등(두 번 적용해도 같은 값)이어야 alias 토큰에서도 안전하다.
const PX = /^(-?\d+(?:\.\d+)?)px$/;
const EM = /^(-?\d+(?:\.\d+)?)em$/;
const MS = /^(\d+(?:\.\d+)?)ms$/;
const MM = /^(\d+(?:\.\d+)?)mm$/;
const PT = /^(\d+(?:\.\d+)?)pt$/;
/** CSS 기준 픽셀(96dpi)로 1mm. 종이 크기 · 여백(paper.*, D-77)만 mm다 */
export const PX_PER_MM = 96 / 25.4;
/** CSS 기준 픽셀로 1pt(1/72in). 종이 글자(paper.type.*)만 pt다 */
export const PX_PER_PT = 96 / 72;

const round2 = (n) => Math.round(n * 100) / 100;

export function toNumber(value) {
  if (typeof value === 'number') return value;
  const mm = MM.exec(value);
  if (mm) return round2(Number(mm[1]) * PX_PER_MM);
  const pt = PT.exec(value);
  if (pt) return round2(Number(pt[1]) * PX_PER_PT);
  const m = PX.exec(value) ?? EM.exec(value) ?? MS.exec(value);
  if (!m) throw new Error(`숫자로 바꿀 수 없는 값: ${value}`);
  return Number(m[1]);
}

/** CSS 그림자 레이어 배열 → RN 그림자 하나. 레이어가 여럿이면 blur가 가장 큰 것을 쓴다. */
export function toRnShadow(value) {
  if (!Array.isArray(value) && value.shadowColor) return value;
  const layers = [value].flat();
  const main = layers.reduce((a, b) => (toNumber(b.blur) > toNumber(a.blur) ? b : a));
  const hex = main.color.toUpperCase();
  const alpha = hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1;
  const blur = toNumber(main.blur);
  return {
    shadowColor: hex.slice(0, 7),
    shadowOffset: { width: toNumber(main.offsetX), height: toNumber(main.offsetY) },
    shadowOpacity: Math.round(alpha * 1000) / 1000,
    shadowRadius: blur / 2,
    elevation: Math.round(blur / 2),
  };
}

export function registerNativeTransforms(StyleDictionary) {
  const byType = (type) => (token) => token.$type === type;
  StyleDictionary.registerTransform({
    name: 'trellis/native/dimension',
    type: 'value',
    filter: byType('dimension'),
    transform: (token) => toNumber(token.$value),
  });
  StyleDictionary.registerTransform({
    name: 'trellis/native/duration',
    type: 'value',
    filter: byType('duration'),
    transform: (token) => toNumber(token.$value),
  });
  StyleDictionary.registerTransform({
    name: 'trellis/native/fontWeight',
    type: 'value',
    filter: byType('fontWeight'),
    transform: (token) => String(token.$value),
  });
  StyleDictionary.registerTransform({
    name: 'trellis/native/fontFamily',
    type: 'value',
    filter: byType('fontFamily'),
    transform: (token) => [token.$value].flat()[0],
  });
  StyleDictionary.registerTransform({
    name: 'trellis/native/shadow',
    type: 'value',
    filter: byType('shadow'),
    transform: (token) => toRnShadow(token.$value),
  });
}
