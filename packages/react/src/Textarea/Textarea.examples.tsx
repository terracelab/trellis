import { Field } from '../Field/Field.js';
import { Textarea } from './Textarea.js';

/** 적요 · 반려 사유 — 글자 수 한도가 있으면 오른쪽 아래에 보인다 */
export function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="적요" help="전표 목록에 함께 보입니다">
        <Textarea
          defaultValue="(주)한빛무역 10월분 원자재 매입 대금"
          maxLength={200}
          placeholder="대양상사 11월 운송료"
        />
      </Field>
      <Field label="반려 사유" required error="반려 사유를 입력하세요">
        <Textarea rows={4} maxLength={500} />
      </Field>
      <Field label="비고">
        <Textarea readOnly resize="none" defaultValue="누리식품 납품 건은 12월 결산에 반영" />
      </Field>
    </div>
  );
}
