import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { TimeField } from './TimeField.js';

/** 회의 시각 — 시작 · 종료 두 칸. 종료 칸은 시작 이후만 고르고 목록 행 끝에 걸리는 시간을 보인다 */
export function Meeting() {
  const [start, setStart] = useState<string | null>('14:00');
  const [end, setEnd] = useState<string | null>('15:00');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="시작">
        <TimeField value={start} onChange={setStart} min="08:00" max="20:00" />
      </Field>
      <Field label="종료">
        <TimeField
          value={end}
          onChange={setEnd}
          min={start ?? '08:00'}
          max="21:00"
          durationFrom={start ?? undefined}
        />
      </Field>
    </div>
  );
}

/** 간격 · 범위 — 출근 시각은 10분 간격 07:00~11:00, 교대는 1시간 간격. 글자로는 간격 밖 시각도 넣는다 */
export function Steps() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 3), 1fr))',
      }}
    >
      <Field label="출근 시각" help="10분 간격입니다">
        <TimeField defaultValue="08:50" step={10} min="07:00" max="11:00" />
      </Field>
      <Field label="교대 시작">
        <TimeField defaultValue="22:00" step={60} />
      </Field>
      <Field label="퇴근 시각" required>
        <TimeField defaultValue={null} min="12:00" max="23:30" />
      </Field>
    </div>
  );
}

/** 글자 입력 · 오류 — 930 · 9시 30분처럼 쳐도 09:30이 된다. 읽을 수 없거나 범위 밖이면 칸 아래 오류 */
export function Typed() {
  const [value, setValue] = useState<string | null>('09:30');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 3)',
      }}
    >
      <Field label="회의실 사용 시작" help="09:00~18:00 사이에 예약합니다">
        <TimeField value={value} onChange={setValue} min="09:00" max="18:00" />
      </Field>
      <p style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }} aria-live="polite">
        값: {value ?? '없음'}
      </p>
      <Field label="퇴근 시각" error="퇴근 시각을 넣으세요">
        <TimeField value={null} />
      </Field>
    </div>
  );
}
