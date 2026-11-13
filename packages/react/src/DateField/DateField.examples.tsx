import type { DateFieldOutOfRange } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Button } from '../Button/Button.js';
import { Field } from '../Field/Field.js';
import { DateField } from './DateField.js';

/** 전표일 · 납기일 — 값은 ISO 'YYYY-MM-DD' */
export function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="전표일" required>
        <DateField defaultValue="2026-11-07" />
      </Field>
      <Field label="납기일" help="(주)한빛무역 발주 건은 12월 안에서 고릅니다">
        <DateField min="2026-12-01" max="2026-12-31" />
      </Field>
      <Field label="입고일" error="입고일은 발주일 이후여야 합니다">
        <DateField defaultValue="2026-10-30" />
      </Field>
      <Field label="마감일" disabled>
        <DateField defaultValue="2026-11-30" size="sm" />
      </Field>
    </div>
  );
}

/** 범위 밖 날짜 — min · max 밖의 날을 치면 값은 그대로 두고 오류와 안내를 보인다. 범위 안 날짜를 치거나 칸을 비우면 걷힌다 */
export function OutOfRange() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="작성일" help="오늘(2026-11-06)까지 넣을 수 있습니다">
        <DateField defaultValue="2026-11-06" today="2026-11-06" max="2026-11-06" />
      </Field>
      <Field label="입고일">
        <DateField
          today="2026-11-06"
          min="2026-11-03"
          outOfRangeText={(bound, date) =>
            bound === 'min' ? `발주일(${date}) 이후로 넣으세요` : `${date}까지 넣을 수 있습니다`
          }
        />
      </Field>
    </div>
  );
}

/** 범위 밖 입력 알리기 — value는 그대로라서 앱은 onOutOfRangeChange로 받아 저장을 막는다 */
export function RangeSignal() {
  const [value, setValue] = useState<string | null>('2029-11-01');
  const [range, setRange] = useState<DateFieldOutOfRange | null>(null);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        justifyItems: 'start',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="자격증 만료일" help="오늘(2026-11-06) 이후 날짜를 넣습니다">
        <DateField
          value={value}
          onChange={setValue}
          min="2026-11-06"
          today="2026-11-06"
          onOutOfRangeChange={setRange}
        />
      </Field>
      <span>저장할 값 {value ?? '없음'}</span>
      <Button variant="primary" disabled={range !== null}>
        저장
      </Button>
    </div>
  );
}

/** 폼 제출 막기 — 범위 밖 글자가 있으면 칸이 브라우저 검사에 걸려 기본 제출이 막힌다 */
export function NativeForm() {
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <form
      style={{
        display: 'grid',
        gap: 'var(--tl-space-12)',
        justifyItems: 'start',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(String(new FormData(e.currentTarget).get('expires')));
      }}
    >
      <Field label="자격증 만료일" help="오늘(2026-11-06) 이후 날짜를 넣습니다">
        <DateField name="expires" defaultValue="2029-11-01" min="2026-11-06" today="2026-11-06" />
      </Field>
      <Button type="submit" variant="primary">
        저장
      </Button>
      {saved && <span>{saved}로 저장했습니다</span>}
    </form>
  );
}
