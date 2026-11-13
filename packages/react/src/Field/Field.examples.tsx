import { Input } from '../Input/Input.js';
import { Field } from './Field.js';

/** 라벨 · 필수 · 도움말 · 오류 */
export function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="거래처" required help="사업자등록번호나 상호로 찾습니다">
        <Input icon="search" placeholder="한빛무역" />
      </Field>
      <Field label="사업자등록번호" required error="사업자등록번호는 10자리입니다">
        <Input defaultValue="123-45-678" />
      </Field>
      <Field label="담당자 메일" layout="horizontal">
        <Input type="email" placeholder="name@company.co.kr" />
      </Field>
    </div>
  );
}
