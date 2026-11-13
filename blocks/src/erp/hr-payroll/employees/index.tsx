// 인사 기록(ListDetail): 사원 목록(부서 · 직급 · 입사일 · 재직 상태) → 프로필 · 재직 정보 · 연차 잔여 · 발령 이력 · 발령 등록
// PR-27: 이름 칸은 PersonLabel(오늘 근무 상태), 상세는 ProfileHeader + 인사기록카드(재직 · 발령), 전체 카드는 인사 마스터 화면
// 목록은 데이터 범위(Role.scope) 안의 사람만: 팀장 = 자기 부서, 구성원 = 본인
import { formatDate } from '@terracelab/trellis-contracts';
import {
  Banner,
  Button,
  DataBar,
  DataGrid,
  DateField,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  Field,
  FilterBar,
  HrRecord,
  Input,
  PageHeader,
  PersonLabel,
  ProfileHeader,
  Progress,
  Select,
  StatusDot,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  annualLeave,
  DEPARTMENTS,
  EMPLOYEES,
  EMPLOYMENT_STATES,
  tenure,
  type Appointment,
  type Employee,
  type EmploymentState,
} from '../../../_data/erp.js';
import { hrRecordOf, PRESENCE, statusOf, typeOf } from '../../../_data/hr.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, useScope, useScreens } from '../../../_platform/index.js';
import {
  ExportButton,
  monthStart,
  Page,
  useSiblings,
  type CsvColumn,
  type SiblingScreen,
} from '../../../_ui/index.js';
import './style.css';

const TITLES = ['사원', '주임', '대리', '과장', '차장', '팀장', '반장'];
/** 발령일 기본값: 다음 달 1일 */
const NEXT_MONTH = monthStart(TODAY, 1);
const ID = 'erp/hr-payroll/employees';
const MASTER = 'erp/hr-payroll/hr-master';

// slot: siblings — 제목 줄 탭(같은 묶음 화면). 라벨은 그 화면의 PageHeader title과 같게. 앱에 없는 화면은 빠진다
const SIBLINGS: readonly SiblingScreen[] = [
  { id: ID, label: '인사 기록' },
  { id: MASTER, label: '인사 마스터' },
  { id: 'erp/hr-payroll/org-chart', label: '조직도' },
];
// slot: siblings end
const tenureText = (e: Employee) => {
  const t = tenure(e.hiredAt, e.status === 'retired' ? e.history.at(-1)!.date : TODAY);
  return t.years ? `${t.years}년 ${t.months}개월` : `${t.months}개월`;
};

/** 엑셀 다운로드 열(표와 같은 순서, 데이터 범위 안 사람만). 연차는 서식 없는 숫자 */
const CSV: CsvColumn<Employee & { leaveTotal: number; leaveLeft: number }>[] = [
  { label: '사원', value: 'name' },
  { label: '사번', value: 'id' },
  { label: '부서', value: 'department' },
  { label: '직급', value: 'title' },
  { label: '입사일', value: 'hiredAt' },
  { label: '근속', value: (r) => tenureText(r) },
  { label: '고용 형태', value: 'employment' },
  { label: '연차 잔여(일)', value: (r) => (r.status === 'retired' ? null : r.leaveLeft) },
  { label: '연차 전체(일)', value: 'leaveTotal' },
  { label: '재직 상태', value: (r) => EMPLOYMENT_STATES[r.status].label },
];

interface Draft {
  kind: Appointment['kind'];
  date: string | null;
  department: string | null;
  title: string | null;
  detail: string;
}

export default function Employees() {
  const toast = useToast();
  const canUpdate = useCan('hr-payroll', 'update');
  const screens = useScreens();
  const { canSee } = useScope();
  const titleTabs = useSiblings(ID, SIBLINGS);
  const [people, setPeople] = useState<Employee[]>(() => [...EMPLOYEES]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [dept, setDept] = useState<string | null>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  // 데이터 범위 밖 사람은 목록 · 건수에 넣지 않는다(서버가 같은 판정을 다시 한다)
  const rows = useMemo(
    () =>
      people
        .filter((e) => canSee({ name: e.name, department: e.department }))
        .map((e) => {
          const total = annualLeave(e.hiredAt);
          return { ...e, leaveTotal: total, leaveLeft: Math.max(0, total - e.leaveUsed) };
        }),
    [people, canSee],
  );
  const departments = DEPARTMENTS.filter((d) => rows.some((r) => r.department === d));
  const count = (s: EmploymentState) => rows.filter((r) => r.status === s).length;
  const shown = rows.filter(
    (r) =>
      (tab === 'all' || r.status === tab) &&
      (dept === 'all' || !dept || r.department === dept) &&
      (!q || `${r.name}${r.id}${r.department}`.includes(q)),
  );
  const open = rows.find((r) => r.id === openId) ?? null;

  const appoint = () => {
    if (!open || !draft?.date) return;
    const detail =
      draft.detail ||
      (draft.kind === '승진'
        ? `${open.title} → ${draft.title}`
        : draft.kind === '전보'
          ? `${open.department} → ${draft.department}`
          : draft.kind);
    setPeople((ps) =>
      ps.map((p) =>
        p.id === open.id
          ? {
              ...p,
              title: draft.kind === '승진' && draft.title ? draft.title : p.title,
              department:
                draft.kind === '전보' && draft.department ? draft.department : p.department,
              status: draft.kind === '휴직' ? 'leave' : draft.kind === '복직' ? 'active' : p.status,
              history: [...p.history, { date: draft.date!, kind: draft.kind, detail }],
            }
          : p,
      ),
    );
    setDraft(null);
    toast.show({
      title: `${open.name} ${draft.kind} 발령을 등록했습니다`,
      description: `${formatDate(draft.date)} · ${detail}`,
      tone: 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '인사·급여' }, { label: '인사 기록' }]}
          title="인사 기록"
          {...titleTabs}
          description={`${formatDate(TODAY, 'mdw')} 기준 · 재직 ${count('active')}명 · 휴직 ${count('leave')}명`}
          actions={
            <>
              <ExportButton module="hr-payroll" name="인사 기록" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button icon="printer">인사기록카드 인쇄</Button>
            </>
          }
          tabs={
            <Tabs
              label="재직 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: rows.length },
                { value: 'active', label: '재직', count: count('active') },
                { value: 'leave', label: '휴직', count: count('leave') },
                { value: 'retired', label: '퇴직', count: count('retired') },
              ]}
            />
          }
        />
      }
    >
      {/* slot: filters — 검색 칸 · 부서. 범위 안 부서가 하나면 부서 고르기를 뺀다 */}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="이름 · 사번"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setDept('all');
          setTab('all');
        }}
        resultCount={shown.length}
      >
        {departments.length > 1 && (
          <Select
            label="부서"
            size="sm"
            width="auto"
            value={dept}
            onChange={setDept}
            options={[
              { value: 'all', label: '부서 전체' },
              ...departments.map((d) => ({ value: d, label: d })),
            ]}
          />
        )}
      </FilterBar>
      {/* slot: filters end */}
      <DataGrid
        caption="인사 기록"
        height="fill"
        rows={shown}
        rowKey="id"
        onRowPress={(r) => setOpenId(r.id)}
        activeRowKey={openId}
        rowTone={(r) => (r.status === 'leave' ? 'warning' : undefined)}
        empty="이 조건의 사원이 없습니다. 상태나 부서를 바꿔 보세요"
        // slot: columns — 열 이름 · 폭 · 순서. 열은 모두 폭을 정한다(auto 열이 있으면 좁은 폭에서 접힌다)
        columns={[
          {
            key: 'name',
            header: '사원',
            width: 'lg',
            sticky: true,
            sortable: true,
            render: (r) => <PersonLabel size="sm" name={r.name} presence={PRESENCE[r.id]} />,
          },
          { key: 'id', header: '사번', width: 'sm', sortable: true },
          { key: 'department', header: '부서', width: 'md', sortable: true },
          { key: 'title', header: '직급', width: 'sm' },
          { key: 'hiredAt', header: '입사일', width: 'sm', format: 'date', sortable: true },
          {
            key: 'tenure',
            header: '근속',
            width: 'sm',
            align: 'right',
            value: (r) => r.hiredAt,
            render: (r) => tenureText(r),
          },
          { key: 'employment', header: '고용 형태', width: 'sm' },
          {
            key: 'leaveLeft',
            header: '연차 잔여',
            // 막대 + "/ 15일"이 잘리지 않는 폭
            width: 'lg',
            render: (r) =>
              r.status === 'retired' ? (
                <span className="tl-block-muted">정산 완료</span>
              ) : (
                <span className="tl-block-emp-leave-cell">
                  <DataBar
                    value={r.leaveLeft}
                    max={r.leaveTotal}
                    width={80}
                    unit="일"
                    color={r.leaveLeft <= 3 ? 'warning' : 'series-1'}
                    label={`${r.name} 연차 잔여`}
                  />
                  <span className="tl-block-emp-leave-cell__total">/ {r.leaveTotal}일</span>
                </span>
              ),
          },
          {
            key: 'status',
            header: '재직 상태',
            width: 'sm',
            // 행마다 알약을 세우지 않는다(D-57): 점 + 글자
            render: (r) => (
              <StatusDot tone={EMPLOYMENT_STATES[r.status].tone}>
                {EMPLOYMENT_STATES[r.status].label}
              </StatusDot>
            ),
          },
        ]}
        // slot: columns end
      />

      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title="인사 정보"
        description={open ? `${open.department} · 사번 ${open.id}` : ''}
        width="lg"
        footer={
          open && (
            <>
              {screens.has(MASTER) ? (
                <Button icon="contact" onPress={() => screens.go(MASTER, { id: open.id })}>
                  인사기록카드
                </Button>
              ) : (
                <Button icon="printer">인사기록카드 인쇄</Button>
              )}
              <Button
                variant="primary"
                icon="stamp"
                disabled={!canUpdate || open.status === 'retired'}
                onPress={() =>
                  setDraft({
                    kind: open.status === 'leave' ? '복직' : '승진',
                    date: NEXT_MONTH,
                    department: open.department,
                    title: open.title,
                    detail: '',
                  })
                }
              >
                발령 등록
              </Button>
            </>
          )
        }
      >
        {/* slot: profile — 상세 서랍에 보일 것(프로필 머리 · 연락처 · 연차 · 재직 정보와 발령 이력) */}
        {open && (
          <div className="tl-block-drawer-stack">
            <ProfileHeader
              headingLevel={3}
              name={open.name}
              department={open.department}
              position={hrRecordOf(open).employment.position ?? open.title}
              {...(hrRecordOf(open).employment.role
                ? { role: hrRecordOf(open).employment.role }
                : {})}
              status={statusOf(open)}
              {...(PRESENCE[open.id] ? { presence: PRESENCE[open.id] } : {})}
              employeeNo={open.id}
              hireDate={open.hiredAt}
              employmentType={typeOf(open)}
              today={open.status === 'retired' ? open.history.at(-1)!.date : TODAY}
            />
            {open.note && (
              <Banner tone={open.status === 'leave' ? 'warning' : 'neutral'} title={open.note} />
            )}
            <DescriptionList
              columns={2}
              items={[
                { label: '메일', value: open.email, copyable: true, span: 2 },
                { label: '연락처', value: open.phone },
              ]}
            />
            {open.status !== 'retired' && (
              <section className="tl-block-emp-leave" aria-label="연차">
                <Progress
                  value={open.leaveLeft}
                  max={open.leaveTotal}
                  unit="일"
                  label="연차 잔여"
                  tone={open.leaveLeft <= 3 ? 'warning' : undefined}
                />
                <span className="tl-block-emp-leave__note">
                  {TODAY.slice(0, 4)}년 발생 {open.leaveTotal}일 · 사용 {open.leaveUsed}일 · 입사일
                  기준
                </span>
              </section>
            )}
            {/* 재직 정보 · 발령 이력만. 인적 사항 · 급여 · 학력은 인사 마스터 화면에서 본다 */}
            <HrRecord
              record={hrRecordOf(open)}
              sections={['employment', 'appointments']}
              nav={false}
              headingLevel={3}
              today={TODAY}
            />
          </div>
        )}
        {/* slot: profile end */}
      </Drawer>

      <Dialog
        open={draft !== null}
        onOpenChange={(o) => !o && setDraft(null)}
        title={open ? `${open.name} 발령 등록` : '발령 등록'}
        description="발령일부터 부서 · 직급 · 재직 상태에 반영합니다. 급여는 다음 달 대장부터 바뀝니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <Button variant="primary" disabled={!draft?.date} onPress={appoint}>
              등록
            </Button>
          </>
        }
      >
        {/* slot: appointments — 발령 구분 · 입력 칸(회사 발령 규정). 등록 처리는 위 appoint */}
        {draft && open && (
          <div className="tl-block-emp-form">
            <Field label="발령 구분" required>
              <Select
                value={draft.kind}
                onChange={(v) => setDraft({ ...draft, kind: (v ?? '승진') as Draft['kind'] })}
                options={(['승진', '전보', '직책', '휴직', '복직'] as const).map((k) => ({
                  value: k,
                  label: k,
                }))}
              />
            </Field>
            <Field label="발령일" required>
              <DateField
                today={TODAY}
                value={draft.date}
                onChange={(v) => setDraft({ ...draft, date: v })}
              />
            </Field>
            <Field label="부서" disabled={draft.kind !== '전보'}>
              <Select
                value={draft.department}
                onChange={(v) => setDraft({ ...draft, department: v })}
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />
            </Field>
            <Field label="직급" disabled={draft.kind !== '승진'}>
              <Select
                value={draft.title}
                onChange={(v) => setDraft({ ...draft, title: v })}
                options={TITLES.map((t) => ({ value: t, label: t }))}
              />
            </Field>
            <Field label="내용" help="비우면 구분과 바뀐 값으로 채웁니다">
              <Input
                value={draft.detail}
                onChange={(v) => setDraft({ ...draft, detail: v })}
                placeholder="대리 → 과장"
              />
            </Field>
          </div>
        )}
        {/* slot: appointments end */}
      </Dialog>
    </Page>
  );
}
