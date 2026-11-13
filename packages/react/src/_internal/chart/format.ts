import { formatAmount, formatCompactWon, formatPercent } from '@terracelab/trellis-contracts';

export { formatAmount, formatCompactWon, formatPercent };
export const num = (v: number) => formatAmount(v);
export const signed = (v: number) => formatAmount(v, { sign: 'always' });
export const pct = (part: number, total: number) =>
  total > 0 ? formatPercent((part / total) * 100) : '–';

/** 축 라벨 폭 추정(caption 12px): 한글·한자 12, 그 외 7. 가장 긴 라벨 기준, 상한 120.
 * 눈금은 데이터보다 한 자리 넓을 수 있어(438 → 450 · 9.6 → 10 · 음수 부호) 한 글자 여유를 더한다 */
export function axisWidth(labels: string[]): number {
  const measure = (s: string) =>
    [...s].reduce(
      (w, ch) => w + (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u3400-\u9fff]/.test(ch) ? 12 : 7),
      0,
    );
  const longest = labels.reduce((m, l) => Math.max(m, measure(l)), 7);
  return Math.min(120, longest + 19);
}

/** 눈금 후보(최대 4개) */
export function ticksOf(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min];
  const step = niceStep((max - min) / (count - 1));
  const start = Math.floor(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step / 2 && out.length < count + 2; v += step) out.push(v);
  return out;
}

function niceStep(raw: number): number {
  const mag = 10 ** Math.floor(Math.log10(raw));
  const r = raw / mag;
  const nice = r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10;
  return nice * mag;
}
