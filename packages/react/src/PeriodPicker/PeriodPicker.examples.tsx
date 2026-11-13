import { type PeriodCompare, type PeriodValue } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { PeriodPicker } from './PeriodPicker.js';

/** 조회 기간 — 프리셋을 누르면 바로 적용, 날짜를 고치면 적용을 누른다 */
export function Basic() {
  return (
    <Field label="조회 기간">
      <PeriodPicker today="2026-11-07" defaultValue={{ from: '2026-11-01', to: '2026-11-30' }} />
    </Field>
  );
}

/** 부가세 신고 — 1기 · 2기 프리셋 */
export function VatPeriod() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <PeriodPicker
        today="2026-11-07"
        presets={['vatPeriod1', 'vatPeriod2', 'thisQuarter', 'thisYear']}
        defaultValue={{ from: '2026-07-01', to: '2026-12-31' }}
      />
      <PeriodPicker today="2026-11-07" size="sm" />
      <PeriodPicker disabled defaultValue={{ from: '2026-10-01', to: '2026-10-31' }} />
    </div>
  );
}

/** 조회 한도 — max 뒤 날짜는 고를 수 없고, maxDays를 넘으면 경고만 보인다. 아래 줄에 일수 */
export function Limits() {
  return (
    <Field label="매출 조회 기간">
      <PeriodPicker
        today="2026-11-07"
        max="2026-11-07"
        maxDays={31}
        defaultValue={{ from: '2026-11-01', to: '2026-11-07' }}
      />
    </Field>
  );
}

/** 비교 기간 — 날짜 아래에서 직전 기간 · 전년 동기 · 직접 선택을 고른다. 트리거에 비교 기간이 붙는다 */
export function Compare() {
  const [period, setPeriod] = useState<PeriodValue>({ from: '2026-11-01', to: '2026-11-30' });
  const [compare, setCompare] = useState<PeriodCompare | null>({
    mode: 'previous',
    from: '2026-10-01',
    to: '2026-10-31',
  });
  return (
    <Field label="매출 비교 기간">
      <PeriodPicker
        today="2026-11-07"
        value={period}
        onChange={setPeriod}
        compare={compare}
        onCompareChange={setCompare}
      />
    </Field>
  );
}
