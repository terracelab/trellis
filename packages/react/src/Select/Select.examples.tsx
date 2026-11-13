import { type SelectOption } from '@terracelab/trellis-contracts';
import { Field } from '../Field/Field.js';
import { Select } from './Select.js';

const WAREHOUSES = [
  { value: 'icheon', label: '이천 1센터' },
  { value: 'busan', label: '부산 신항 보세창고' },
  { value: 'pyeongtaek', label: '평택 2센터' },
];

/** 창고 선택 — Field 라벨이 이름이 된다 */
export function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="입고 창고" required>
        <Select options={WAREHOUSES} defaultValue="busan" />
      </Field>
      <Field label="과세 구분">
        <Select
          options={[
            { value: 'tax', label: '과세' },
            { value: 'zero', label: '영세율' },
            { value: 'free', label: '면세' },
          ]}
          placeholder="과세 구분"
        />
      </Field>
    </div>
  );
}

const SITES: SelectOption[] = [
  { value: 'hq', label: '본사', leading: { kind: 'dot', tone: 'series-1' }, note: '기본' },
  { value: 'busan', label: '부산 지사', leading: { kind: 'dot', tone: 'series-2' } },
  { value: 'pyeongtaek', label: '평택 물류센터', leading: { kind: 'dot', tone: 'series-3' } },
  {
    value: 'daegu',
    label: '대구 영업소',
    leading: { kind: 'dot', tone: 'series-4' },
    note: '운영 종료',
    disabled: true,
  },
];

const PROGRESS: SelectOption[] = [
  { value: 'todo', label: '대기', leading: { kind: 'dot', tone: 'neutral' } },
  { value: 'doing', label: '진행', leading: { kind: 'dot', tone: 'info' } },
  { value: 'done', label: '완료', leading: { kind: 'dot', tone: 'success' } },
  { value: 'hold', label: '보류', leading: { kind: 'dot', tone: 'warning' } },
];

const CHANNELS: SelectOption[] = [
  { value: 'mail', label: '메일', leading: { kind: 'icon', icon: 'mail' } },
  { value: 'messenger', label: '메신저', leading: { kind: 'icon', icon: 'message-circle' } },
  { value: 'app', label: '앱 알림', leading: { kind: 'icon', icon: 'bell' }, note: '사용 중' },
];

/** 앞 표시 · note — 점은 차트 계열 · 상태 톤 · 결재 상태 이름으로만 고른다. 고른 선택지의 표시는 닫힌 칸에도 보인다 */
export function Marks() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="사업장" help="점 색은 매출 차트의 사업장 색과 같습니다">
        <Select options={SITES} defaultValue="busan" />
      </Field>
      <Field label="진행 상태">
        <Select options={PROGRESS} defaultValue="doing" />
      </Field>
      <Field label="알림 방법">
        <Select options={CHANNELS} defaultValue="app" />
      </Field>
    </div>
  );
}

/** 빈 목록 — 고를 수 있는 선택지가 없으면 팝업에 안내 한 줄 */
export function Empty() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <Field label="출고 창고" help="창고 관리에서 창고를 먼저 등록하세요">
        <Select options={[]} />
      </Field>
    </div>
  );
}
