import { Field } from '../Field/Field.js';
import { AmountInput } from './AmountInput.js';

/** 공급가액 — 입력하는 동안 천 단위 쉼표, 아래에 한글 금액 */
export function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="공급가액" required help="(주)한빛무역 11월 매입분">
        <AmountInput defaultValue={12480000} showKorean placeholder="1,000,000" />
      </Field>
      <Field label="차감 금액" help="반품 · 할인은 음수로 입력합니다">
        <AmountInput defaultValue={-320000} allowNegative />
      </Field>
    </div>
  );
}

/** 외화 · 범위 — 통화 코드는 앞에, 소수 2자리(JPY는 0자리) */
export function Currency() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="수입 단가">
        <AmountInput currency="USD" defaultValue={1250.5} />
      </Field>
      <Field label="엔화 운임">
        <AmountInput currency="JPY" defaultValue={84000} size="sm" />
      </Field>
      <Field label="법인카드 한도 내 금액" error="한도 5,000,000원을 넘었습니다">
        <AmountInput defaultValue={5400000} max={5000000} />
      </Field>
      <Field label="대양상사 선급금" disabled>
        <AmountInput defaultValue={3000000} />
      </Field>
    </div>
  );
}
