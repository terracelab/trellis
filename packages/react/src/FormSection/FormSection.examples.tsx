import { Field } from '../Field/Field.js';
import { Input } from '../Input/Input.js';
import { FormSection } from './FormSection.js';

/** 두 열 — 공급받는 자 정보 */
export function TwoColumns() {
  return (
    <FormSection title="공급받는 자" description="세금계산서에 그대로 찍힙니다">
      <Field label="상호" required>
        <Input defaultValue="(주)한빛무역" />
      </Field>
      <Field label="사업자등록번호" required>
        <Input defaultValue="214-86-30127" />
      </Field>
      <Field label="주소" span={2}>
        <Input defaultValue="서울특별시 중구 세종대로 110" />
      </Field>
    </FormSection>
  );
}

/** 선택 항목 접기 — 꼭 필요한 칸 아래에 접어 둔다. 접혀 있으면 채운 칸 수, 안에 오류가 생기면 저절로 펼친다 */
export function OptionalCollapsed() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-24)' }}>
      <FormSection title="거래" columns={2}>
        <Field label="거래처" required>
          <Input defaultValue="대양상사" />
        </Field>
        <Field label="금액" required>
          <Input defaultValue="1,320,000" />
        </Field>
      </FormSection>
      <FormSection title="선택 항목" columns={2} collapsible>
        <Field label="메모">
          <Input defaultValue="11월 1차 납품분" />
        </Field>
        <Field label="증빙 번호">
          <Input />
        </Field>
      </FormSection>
    </div>
  );
}
