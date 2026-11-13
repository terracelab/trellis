import {
  BANK_ACCOUNT_FORMATS,
  formatBankAccount,
  maskAccount,
} from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { MaskedValue } from '../MaskedValue/MaskedValue.js';
import { Select } from '../Select/Select.js';
import { MaskedInput } from './MaskedInput.js';

/** 거래처 등록 — 숫자만 치면 구분 글자가 들어가고, 저장 값은 숫자만 */
export function Presets() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="사업자등록번호" required>
        <MaskedInput mask="bizNo" defaultValue="2148812345" />
      </Field>
      <Field label="법인등록번호">
        <MaskedInput mask="corpNo" />
      </Field>
      <Field label="대표 전화" help="02 · 010 · 지역번호에 맞춰 나눕니다">
        <MaskedInput mask="phone" defaultValue="0215885678" />
      </Field>
      <Field label="우편번호">
        <MaskedInput mask="zip" defaultValue="06236" size="sm" />
      </Field>
    </div>
  );
}

/** 직접 패턴 · 오류 — '#'이 숫자 한 자리 */
export function Pattern() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="계좌번호" help="대양상사 결제 계좌">
        <MaskedInput mask="###-######-##-###" defaultValue="11012345612345" />
      </Field>
      <Field label="사업자등록번호" error="사업자등록번호는 10자리입니다">
        <MaskedInput mask="bizNo" defaultValue="1234567" />
      </Field>
    </div>
  );
}

/** 결제 계좌 등록 — 은행을 먼저 고르면 계좌번호가 그 은행 형식으로 나뉜다. 은행이 없으면 숫자만 받는다 */
export function BankAccount() {
  const [bank, setBank] = useState<string | null>('003');
  const [digits, setDigits] = useState('02411842001011');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="은행" required>
        <Select
          value={bank}
          onChange={setBank}
          options={BANK_ACCOUNT_FORMATS.map((b) => ({ value: b.code, label: b.name }))}
        />
      </Field>
      <Field label="계좌번호" required help="저장 값은 숫자와 은행 코드입니다">
        <MaskedInput mask="bankAccount" bank={bank} value={digits} onChange={setDigits} />
      </Field>
      <Field label="계좌번호" help="은행을 모르면 숫자만 받습니다">
        <MaskedInput mask="bankAccount" defaultValue="110123456789" />
      </Field>
      <MaskedValue label="결제 계좌" value={maskAccount(formatBankAccount(digits, bank))} />
    </div>
  );
}

/** 직원 등록 — 주민등록번호는 뒷자리 첫 숫자만 보이고 나머지는 가린다. 사업자등록번호는 validate로 검증 숫자를 본다 */
export function Secret() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="주민등록번호" required help="보기 버튼을 누르면 잠깐 펼칩니다">
        <MaskedInput mask="rrn" secret defaultValue="9001011234567" />
      </Field>
      <Field label="외국인등록번호">
        <MaskedInput mask="rrn" secret />
      </Field>
      <Field label="사업자등록번호" required>
        <MaskedInput mask="bizNo" validate defaultValue="1234567890" />
      </Field>
    </div>
  );
}
