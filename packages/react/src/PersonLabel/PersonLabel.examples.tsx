import { presenceToStatus } from '@terracelab/trellis-contracts';
import { Button } from '../Button/Button.js';
import { DataGrid } from '../DataGrid/DataGrid.js';
import { PersonLabel } from './PersonLabel.js';

const TEAM = [
  { name: '이도윤', meta: '대표', presence: 'working' },
  { name: '한서연', meta: '인사팀 · 매니저', presence: 'remote' },
  { name: '정민호', meta: '국내영업팀 · 책임', presence: 'fieldwork' },
  { name: '오하늘', meta: '플랫폼팀 · 선임', presence: 'leave' },
] as const;

const ROWS = [
  {
    id: 'E-0012',
    name: '한서연',
    meta: '인사팀 · 매니저',
    presence: 'remote',
    hired: '2022-03-02',
    leave: 11.5,
  },
  {
    id: 'E-0031',
    name: '정민호',
    meta: '국내영업팀 · 책임',
    presence: 'working',
    hired: '2020-07-13',
    leave: 6,
  },
  {
    id: 'E-0047',
    name: '오하늘',
    meta: '플랫폼팀 · 선임',
    presence: 'leave',
    hired: '2024-01-08',
    leave: 3,
  },
] as const;

/** 구성원 목록 — 이름 아래 직책 · 부서와 오늘 근무 상태(점 + 글자) */
export function Team() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      {TEAM.map((p) => (
        <PersonLabel key={p.name} name={p.name} meta={p.meta} presence={p.presence} />
      ))}
    </div>
  );
}

/** 표 칸 — sm은 한 줄이라 표 행 높이를 늘리지 않는다. 근무 상태는 점만 보여 이름이 폭을 지킨다 */
export function InTable() {
  return (
    <DataGrid
      caption="구성원"
      rowKey="id"
      rows={ROWS}
      columns={[
        {
          key: 'name',
          header: '이름',
          width: 'lg',
          render: (row: (typeof ROWS)[number]) => (
            <PersonLabel size="sm" name={row.name} meta={row.meta} presence={row.presence} />
          ),
        },
        { key: 'id', header: '사번', width: 'sm' },
        { key: 'hired', header: '입사일', width: 'sm', format: 'date' },
        { key: 'leave', header: '남은 연차', width: 'sm', format: 'number', unit: '일' },
      ]}
    />
  );
}

/** 링크 — 누르면 구성원 상세가 열린다. 가리키면 이름에 밑줄 */
export function Link() {
  return (
    <PersonLabel name="한서연" meta="인사팀 · 매니저" href="#member-E-0012" presence="working" />
  );
}

/** 접속 상태 — 메신저 접속은 아바타 점(status), 오늘 근무는 점 + 글자(presence). 근무 상태만 알면 presenceToStatus로 점을 만든다 */
export function Status() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <PersonLabel name="한서연" meta="인사팀 · 매니저" status="online" />
      <PersonLabel name="정민호" meta="국내영업팀 · 책임" status="busy" presence="fieldwork" />
      <PersonLabel name="오하늘" meta="플랫폼팀 · 선임" status={presenceToStatus('leave')} />
    </div>
  );
}

/** 공석 — 담당자가 없으면 점선 아바타 + "담당자 없음". 사람 있는 줄과 높이가 같고, 지정 단추는 action으로 붙인다 */
export function Vacant() {
  const row = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--tl-space-16)',
  } as const;
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <div style={row}>
        <PersonLabel name="한서연" meta="Operations 담당" />
        <PersonLabel vacant meta="Employees 담당" />
        <PersonLabel
          vacant
          meta="Numbers 담당"
          action={
            <Button size="sm" variant="secondary" icon="user-plus">
              담당자 지정
            </Button>
          }
        />
      </div>
      <div style={row}>
        <PersonLabel name="한서연" size="sm" />
        <PersonLabel vacant size="sm" />
        <PersonLabel
          vacant
          size="sm"
          action={
            <Button size="xs" variant="ghost">
              지정
            </Button>
          }
        />
      </div>
    </div>
  );
}
