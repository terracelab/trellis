import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { CodeSearch } from './CodeSearch.js';

const ACCOUNTS = [
  { value: '1010', label: '현금', meta: '자산' },
  { value: '1030', label: '보통예금', meta: '자산' },
  { value: '1080', label: '외상매출금', meta: '자산' },
  { value: '1350', label: '부가세대급금', meta: '자산' },
  { value: '2510', label: '외상매입금', meta: '부채' },
  { value: '2550', label: '부가세예수금', meta: '부채' },
  { value: '4010', label: '상품매출', meta: '수익' },
  { value: '5110', label: '운반비', meta: '비용' },
];

const PARTNERS = [
  { value: 'C-0012', label: '(주)한빛무역', description: '214-88-12345 · 김도윤', meta: '매출처' },
  { value: 'C-0027', label: '대양상사', description: '105-81-55210 · 이서연', meta: '매입처' },
  { value: 'C-0031', label: '누리식품', description: '312-86-77001 · 박지호', meta: '매입처' },
];

/** 계정과목 · 거래처 — 코드나 이름 일부를 치고 Enter */
export function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="계정과목" required>
        <CodeSearch options={ACCOUNTS} defaultValue="1080" />
      </Field>
      <Field label="거래처" help="사업자등록번호는 목록에서 확인합니다">
        <CodeSearch options={PARTNERS} />
      </Field>
      <Field label="HS 코드" error="목록에 있는 코드를 고르세요">
        <CodeSearch options={[{ value: '0901.21', label: '볶은 커피(카페인 있음)' }]} />
      </Field>
    </div>
  );
}

const CLIENTS = [
  { value: 'cl-01', label: '대양상사', meta: '부산' },
  { value: 'cl-02', label: '한결물산', meta: '대구' },
  { value: 'cl-03', label: '누리식품', meta: '서울' },
];

/** 찾는 항목이 없으면 새로 등록 — 목록 맨 아래 줄을 고르면 등록 화면을 연다. 여기서는 바로 목록에 더하고 고른다 */
export function CreateNew() {
  const [options, setOptions] = useState(CLIENTS);
  const [value, setValue] = useState<string | null>(null);
  return (
    <Field label="거래처" help="목록에 없으면 맨 아래 새로 등록">
      <CodeSearch
        options={options}
        value={value}
        onChange={setValue}
        showCode={false}
        placeholder="거래처 이름"
        onCreate={(name) => {
          const next = {
            value: `cl-${options.length + 1}`,
            label: name || '새 거래처',
            meta: '새로 등록',
          };
          setOptions((o) => [...o, next]);
          setValue(next.value);
        }}
      />
    </Field>
  );
}

/** 자유 입력 — 목록에서 고르거나, 없으면 이름을 그대로 친다(거래 입력의 거래처) */
export function FreeText() {
  const [typed, setTyped] = useState<string | null>(null);
  return (
    <Field
      label="거래처"
      help={typed ? `목록에 없는 이름: ${typed}` : '목록에 없으면 이름을 그대로 칩니다'}
    >
      <CodeSearch
        options={CLIENTS}
        showCode={false}
        allowCustomValue
        onCustomValue={setTyped}
        onChange={() => setTyped(null)}
        placeholder="거래처 이름"
      />
    </Field>
  );
}
