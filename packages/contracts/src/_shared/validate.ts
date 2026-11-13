// 번호 검증(웹 · 네이티브 · 서버 공용 순수 함수). 서식은 format.ts.

const BIZ_NO_WEIGHTS = [1, 3, 7, 1, 3, 7, 1, 3, 5] as const;

/**
 * 사업자등록번호 10자리의 검증 숫자를 확인한다. 공백 · 하이픈은 무시한다.
 * 앞 9자리에 1·3·7·1·3·7·1·3·5를 곱해 더하고, 9번째 숫자 × 5 ÷ 10의 몫을 더한다.
 * (10 − 합 % 10) % 10 이 10번째 숫자와 같으면 true. 10자리가 아니면 false.
 * 국세청에 있는 번호인지는 알 수 없다(형식 검사).
 */
export function isValidBizNo(value: string): boolean {
  const d = value.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(d)) return false;
  const n = d.split('').map(Number);
  let sum = BIZ_NO_WEIGHTS.reduce((acc, w, i) => acc + w * (n[i] ?? 0), 0);
  sum += Math.floor(((n[8] ?? 0) * 5) / 10);
  return (10 - (sum % 10)) % 10 === n[9];
}
