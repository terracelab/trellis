// 휴가 신청(FormRegister): 휴가 종류 → 사용 단위(종일 · 오전 반차 · 오후 반차) → 기간 → 사유 · 업무 대행 → 남은 연차 · 결재선 → 신청.
// 신청하면 전자결재 저장소에 휴가 신청서가 생기고 상태가 기안 → 진행으로 바뀐다. 결재는 팀장(팀장이면 그 위) 승인 한 칸
import { formatAmount, formatDate, type ApprovalLineApprover } from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import {
  ActionBar,
  ApprovalLine,
  Badge,
  Button,
  Card,
  DateField,
  EmptyState,
  ErrorSummary,
  Field,
  FormSection,
  Input,
  LeaveBalance,
  PageHeader,
  SegmentedControl,
  Select,
  SelectableCard,
  StatusDot,
  Textarea,
  useMessages,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  approvalStore,
  DRAFT_SAMPLE,
  EMPLOYEES,
  empLabel,
  GW_NOW,
  leaderOf,
  LEAVE_BALANCE,
  meOf,
  MY_REQUESTS,
  type ApprovalDoc,
} from '../../../_data/groupware.js';
import { HOLIDAYS, MY_LEAVE_TYPES, TEAM_EVENTS } from '../../../_data/hr.js';
import { TODAY } from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { useCan, usePlatform, useScreens } from '../../../_platform/index.js';
import { addDays, Col, Grid, josa, Page, Stack, yymm } from '../../../_ui/index.js';
import './style.css';

type KindId = 'annual' | 'compensatory' | 'family' | 'sick';
type Unit = 'full' | 'am' | 'pm';

interface KindRule {
  value: KindId;
  icon: IconName;
  /** 이 휴가가 빼는 잔여(없으면 잔여와 무관) */
  balance?: 'annual' | 'compensatory';
  /** 반차로 쓸 수 있다(0.5일) */
  half?: boolean;
  /** 지난 날도 신청할 수 있다(병가) */
  past?: boolean;
  /** 카드 설명(잔여가 없는 종류) */
  note?: string;
}

// slot: kinds — 회사 휴가 규정(종류 · 차감 · 반차 · 증빙 안내). 이름은 문구 사전(worktime.kind.*)
const KINDS: readonly KindRule[] = [
  { value: 'annual', icon: 'calendar-days', balance: 'annual', half: true },
  { value: 'compensatory', icon: 'calendar-plus', balance: 'compensatory', half: true },
  { value: 'family', icon: 'users', note: '증빙은 인사 담당에게' },
  { value: 'sick', icon: 'activity', past: true, note: '3일 넘으면 진단서' },
];
// slot: kinds end
/** 반차 시간(회사 근무제). 오전은 출근부터, 오후는 점심 뒤부터 */
const HALF_HOURS: Record<Exclude<Unit, 'full'>, string> = {
  am: `${PROFILE.work.start}~13:00`,
  pm: `14:00~${PROFILE.work.end}`,
};

// slot: rules — 사유 최소 글자 · 결재 기한(영업일) · 참조(인사 담당을 찾는 담당 업무 글자)
const REASON_MIN = 2;
const DUE_DAYS = 3;
const HR_DUTY = '인사';
// slot: rules end

const DAY = 86_400_000;
const weekday = (d: string) => new Date(Date.parse(d)).getUTCDay();
const isOff = (d: string) =>
  weekday(d) === 0 || weekday(d) === 6 || HOLIDAYS.some((h) => h.date === d);
/** 기간 안 근무일 수(주말 · 공휴일 뺌) */
function workdays(from: string, to: string): number {
  let n = 0;
  for (let t = Date.parse(from); t <= Date.parse(to); t += DAY)
    if (!isOff(new Date(t).toISOString().slice(0, 10))) n += 1;
  return n;
}
/** n영업일 뒤 */
function addWorkdays(from: string, n: number): string {
  let d = from;
  for (let left = n; left > 0;) {
    d = addDays(d, 1);
    if (!isOff(d)) left -= 1;
  }
  return d;
}
const days = (v: number) => `${formatAmount(v, { digits: Number.isInteger(v) ? 0 : 1 })}일`;
/** 11월 27일(금) · 11월 27일(금)~12월 1일(화) */
const periodText = (from: string, to: string) =>
  from === to ? formatDate(from, 'mdw') : `${formatDate(from, 'mdw')}~${formatDate(to, 'mdw')}`;
const overlaps = (aFrom: string, aTo: string, bFrom: string, bTo: string) =>
  aFrom <= bTo && bFrom <= aTo;

/** 이미 신청한 휴가(진행 · 승인). 내 신청 목록의 하루짜리 휴가 */
const BOOKED = MY_REQUESTS.filter(
  (r) =>
    (r.kind === '연차' || r.kind === '반차') && r.state !== 'rejected' && r.state !== 'withdrawn',
).map((r) => ({ from: r.date, to: r.date }));

const ID_PREFIX = `LV-${yymm(TODAY)}-`;
/** 다음 문서 번호: 이번 달 휴가 문서 중 가장 큰 번호 + 1 */
const nextDocId = () => {
  const used = [...approvalStore.get().map((d) => d.id), ...MY_REQUESTS.map((r) => r.id)]
    .filter((id) => id.startsWith(ID_PREFIX))
    .map((id) => Number(id.slice(ID_PREFIX.length)));
  return `${ID_PREFIX}${String(Math.max(0, ...used) + 1).padStart(4, '0')}`;
};

export default function LeaveRequest() {
  const t = useMessages();
  const toast = useToast();
  const screens = useScreens();
  const { session } = usePlatform();
  const canRequest = useCan('approval', 'create');
  const me = meOf(session.user.id);
  const leader = leaderOf(me);
  const cc = EMPLOYEES.find(
    (e) => e.duty.includes(HR_DUTY) && e.id !== me.id && e.id !== leader.id,
  );
  const teammates = EMPLOYEES.filter((e) => e.team === me.team && e.id !== me.id);

  const [kind, setKind] = useState<KindId>('annual');
  const [from, setFrom] = useState<string | null>(DRAFT_SAMPLE.leave.from);
  const [to, setTo] = useState<string | null>(DRAFT_SAMPLE.leave.to);
  const [unit, setUnit] = useState<Unit>('full');
  const [reason, setReason] = useState('');
  const [proxy, setProxy] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [sent, setSent] = useState<ApprovalDoc | null>(null);
  /** 이 화면에서 신청한 연차(잔여 계산) · 기간(겹침 검사) */
  const [extraPending, setExtraPending] = useState(0);
  const [extraBooked, setExtraBooked] = useState<{ from: string; to: string }[]>([]);

  const rule = KINDS.find((k) => k.value === kind)!;
  const half = rule.half && unit !== 'full' ? unit : null;
  const end = half ? from : to;
  const count =
    from && end && end >= from ? (half ? (isOff(from) ? 0 : 0.5) : workdays(from, end)) : 0;
  const pending = LEAVE_BALANCE.pending + extraPending;
  const annualLeft = LEAVE_BALANCE.granted - LEAVE_BALANCE.used - pending;
  const comp = MY_LEAVE_TYPES.find((x) => x.kind === 'compensatory');
  const compLeft = comp && 'granted' in comp ? comp.granted - comp.used : 0;
  const available =
    rule.balance === 'annual' ? annualLeft : rule.balance === 'compensatory' ? compLeft : Infinity;
  /** 결재 문서 · 요약 글자: 연차 · 연차 오후 반차 */
  const kindLabel = (k: KindRule) =>
    `${t(`worktime.kind.${k.value}`)}${half ? ` ${t(half === 'am' ? 'worktime.kind.halfAm' : 'worktime.kind.halfPm')}` : ''}`;

  // 검사: 제출을 한 번 누른 뒤부터 칸 아래에 보인다
  const booked =
    from && end
      ? [...BOOKED, ...extraBooked].find((b) => overlaps(from, end, b.from, b.to))
      : undefined;
  const errors = {
    kind:
      count > available
        ? `신청할 수 있는 ${rule.balance === 'annual' ? '연차' : '보상 휴가'}는 ${days(Math.max(0, available))}입니다. 기간을 줄이거나 다른 종류를 고르세요`
        : null,
    from: !from
      ? '시작일을 고르세요'
      : from < TODAY && !rule.past
        ? '오늘 이후 날짜를 고르세요. 지난 날은 병가만 신청합니다'
        : booked
          ? `${formatDate(booked.from, 'md')}은 이미 신청한 휴가가 있습니다`
          : end && end >= from && count === 0
            ? '고른 기간에 근무일이 없습니다. 주말 · 공휴일은 빼고 셉니다'
            : null,
    to: half
      ? null
      : !to
        ? '종료일을 고르세요'
        : from && to < from
          ? '종료일이 시작일보다 앞섭니다'
          : null,
    reason: reason.trim().length < REASON_MIN ? `사유를 ${REASON_MIN}글자 이상 쓰세요` : null,
  };
  const shown = (e: string | null) => (tries > 0 && !sent ? e : null);
  const summary = (
    [
      ['leave-kind', '휴가 종류', errors.kind],
      ['leave-from', half ? '날짜' : '시작일', errors.from],
      ['leave-to', '종료일', errors.to],
      ['leave-reason', '사유', errors.reason],
    ] as const
  )
    .filter(([, , m]) => m)
    .map(([id, label, message]) => ({ id, label, message: message! }));

  // slot: approvalLine — 결재선(기안 → 팀장 승인). 회사 결재 규정에 맞춰 단계를 더한다
  const approvers: ApprovalLineApprover[] = [
    {
      id: me.id,
      name: me.name,
      title: me.title,
      role: '기안',
      state: 'draft',
      ...(sent ? { time: `${TODAY.slice(5)} ${GW_NOW}` } : {}),
    },
    {
      id: leader.id,
      name: leader.name,
      title: leader.title,
      role: '승인',
      state: sent ? 'pending' : 'waiting',
    },
  ];
  // slot: approvalLine end
  // slot: teamOverlap — 같은 기간 팀원 일정(휴가 · 출장 · 교육)
  const overlapping =
    from && end && end >= from
      ? TEAM_EVENTS.filter(
          (e) =>
            teammates.some((m) => m.id === e.personId) &&
            overlaps(from, end, e.start, e.end ?? e.start),
        )
      : [];
  // slot: teamOverlap end

  const submit = () => {
    setTries((n) => n + 1);
    if (summary.length || !from || !end) return;
    const id = nextDocId();
    const label = kindLabel(rule);
    const doc: ApprovalDoc = {
      id,
      form: 'leave',
      title: `${label} ${from === end ? formatDate(from, 'md') : `${formatDate(from, 'md')}~${formatDate(end, 'md')}`}(${days(count)})`,
      drafterId: me.id,
      draftedAt: `${TODAY} ${GW_NOW}`,
      dueDate: addWorkdays(TODAY, DUE_DAYS),
      state: 'pending',
      line: [
        { empId: me.id, role: '기안', state: 'draft', time: `${TODAY.slice(5)} ${GW_NOW}` },
        { empId: leader.id, role: '승인', state: 'pending' },
      ],
      cc: cc ? [cc.id] : [],
      fields: [
        { label: '휴가 종류', value: label },
        {
          label: '기간',
          value: half
            ? `${from} ${HALF_HOURS[half]}`
            : from === end
              ? from
              : `${from}~${end.slice(5)}`,
        },
        { label: '일수', value: days(count) },
        ...(rule.balance === 'annual'
          ? [{ label: '잔여 연차', value: `${days(annualLeft)} → ${days(annualLeft - count)}` }]
          : []),
        { label: '업무 대행', value: proxy ? empLabel(proxy) : '–' },
      ],
      body: reason.trim(),
      files: [],
    };
    approvalStore.add(doc);
    if (rule.balance === 'annual') setExtraPending((n) => n + count);
    setExtraBooked((b) => [...b, { from, to: end }]);
    setSent(doc);
    toast.show({
      title: '휴가를 신청했습니다',
      description: `${id} · ${empLabel(leader.id)}에게 결재를 요청했습니다`,
      tone: 'success',
    });
  };
  const reset = () => {
    setSent(null);
    setTries(0);
    setReason('');
    setProxy(null);
    setKind('annual');
    setUnit('full');
    setFrom(DRAFT_SAMPLE.leave.from);
    setTo(DRAFT_SAMPLE.leave.to);
  };
  const cancel = () =>
    screens.has('groupware/attendance/my') ? screens.go('groupware/attendance/my') : reset();
  const locked = !!sent;

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[
            { label: '근태' },
            ...(screens.has('groupware/attendance/my')
              ? [{ label: '내 근태', href: screens.href('groupware/attendance/my') }]
              : []),
            { label: '휴가 신청' },
          ]}
          title="휴가 신청"
          meta={<Badge approval={sent ? 'pending' : 'draft'} />}
          description={`${me.name} ${me.title} · ${me.team} · 결재 ${empLabel(leader.id)}`}
        />
      }
    >
      <Grid>
        <Col span={8}>
          <Card>
            <Stack gap="lg">
              <ErrorSummary errors={sent ? [] : tries > 0 ? summary : []} focusKey={tries} />
              <FormSection title="휴가" columns={2}>
                <Field
                  id="leave-kind"
                  label="휴가 종류"
                  required
                  span={2}
                  disabled={locked}
                  error={shown(errors.kind)}
                >
                  <SelectableCard
                    columns={4}
                    value={kind}
                    onChange={(v) => {
                      setKind(v as KindId);
                      if (!KINDS.find((k) => k.value === v)?.half) setUnit('full');
                    }}
                    options={KINDS.map((k) => ({
                      value: k.value,
                      title: t(`worktime.kind.${k.value}`),
                      icon: k.icon,
                      description:
                        k.balance === 'annual'
                          ? `남은 ${days(annualLeft + pending)} · 신청 중 ${days(pending)}`
                          : k.balance === 'compensatory'
                            ? `남은 ${days(compLeft)}`
                            : k.note,
                    }))}
                  />
                </Field>
                <Field
                  label="사용 단위"
                  span={2}
                  disabled={locked || !rule.half}
                  help={
                    rule.half
                      ? '반차는 0.5일을 뺍니다'
                      : `${josa(t(`worktime.kind.${rule.value}`), '은/는')} 종일로만 씁니다`
                  }
                >
                  <SegmentedControl
                    value={rule.half ? unit : 'full'}
                    onChange={(v) => {
                      setUnit(v as Unit);
                      if (v !== 'full') setTo(from);
                    }}
                    options={[
                      { value: 'full', label: '종일' },
                      { value: 'am', label: t('worktime.kind.halfAm') },
                      { value: 'pm', label: t('worktime.kind.halfPm') },
                    ]}
                  />
                </Field>
                <Field
                  id="leave-from"
                  label={half ? '날짜' : '시작일'}
                  required
                  disabled={locked}
                  error={shown(errors.from)}
                >
                  <DateField
                    today={TODAY}
                    value={from}
                    onChange={(v) => {
                      setFrom(v);
                      if (half || (v && to && to < v)) setTo(v);
                    }}
                    {...(rule.past ? {} : { min: TODAY })}
                  />
                </Field>
                {half ? (
                  <Field label="시간" disabled={locked} help="회사 근무제 기준입니다">
                    <Input value={HALF_HOURS[half]} readOnly />
                  </Field>
                ) : (
                  <Field
                    id="leave-to"
                    label="종료일"
                    required
                    disabled={locked}
                    error={shown(errors.to)}
                    help={
                      from && to && to >= from && count > 0 ? `근무일 ${days(count)}` : undefined
                    }
                  >
                    <DateField
                      today={TODAY}
                      value={to}
                      onChange={setTo}
                      {...(from ? { min: from } : {})}
                    />
                  </Field>
                )}
              </FormSection>
              <FormSection title="내용" columns={2}>
                <Field
                  id="leave-reason"
                  label="사유"
                  required
                  span={2}
                  disabled={locked}
                  error={shown(errors.reason)}
                  help="결재자와 참조자가 봅니다"
                >
                  <Textarea
                    rows={3}
                    maxLength={200}
                    value={reason}
                    onChange={setReason}
                    placeholder="개인 사유"
                  />
                </Field>
                <Field
                  label="업무 대행"
                  disabled={locked}
                  help="휴가 동안 문의와 결재를 넘겨받습니다"
                >
                  <Select
                    value={proxy}
                    onChange={setProxy}
                    placeholder="고르지 않음"
                    options={teammates.map((e) => ({
                      value: e.id,
                      label: `${e.name} ${e.title} · ${e.duty}`,
                    }))}
                  />
                </Field>
              </FormSection>
            </Stack>
          </Card>
        </Col>
        <Col span={4}>
          <Stack>
            <LeaveBalance
              granted={LEAVE_BALANCE.granted}
              used={LEAVE_BALANCE.used}
              basis="fiscal"
              expiresOn={LEAVE_BALANCE.expiresAt}
            />
            <p className="tl-block-leave-note">
              신청 중 {days(pending)}
              {rule.balance === 'annual' && count > 0 && !sent
                ? ` · 이번 신청 ${days(count)} · 승인되면 남은 연차 ${days(annualLeft - count)}`
                : ` · 승인되면 남은 연차 ${days(annualLeft)}`}
            </p>
            <Card
              title="결재선"
              subtitle={
                sent
                  ? `${empLabel(leader.id)} 승인 대기 · 기한 ${formatDate(sent.dueDate, 'mdw')}`
                  : `신청하면 ${empLabel(leader.id)}에게 알림이 갑니다`
              }
            >
              <Stack gap="sm">
                <ApprovalLine approvers={approvers} orientation="vertical" />
                {cc && <p className="tl-block-leave-note">참조 {empLabel(cc.id)}</p>}
              </Stack>
            </Card>
            <Card
              title="같은 기간 팀 일정"
              subtitle={from && end && end >= from ? periodText(from, end) : '기간을 고르세요'}
            >
              {overlapping.length ? (
                <ul className="tl-block-leave-team">
                  {overlapping.map((e) => (
                    <li key={e.id}>
                      <span>{empLabel(e.personId)}</span>
                      <StatusDot size="sm" tone="neutral">
                        {e.label ?? t(`worktime.kind.${e.kind}`)} ·{' '}
                        {periodText(e.start, e.end ?? e.start)}
                      </StatusDot>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  size="sm"
                  icon="users"
                  title="겹치는 팀 일정이 없습니다"
                  description={`${me.team} ${teammates.length}명의 휴가 · 출장 · 교육을 봤습니다`}
                />
              )}
            </Card>
          </Stack>
        </Col>
      </Grid>
      <ActionBar
        sticky
        summary={
          sent
            ? `결재 진행 · ${sent.id} · ${empLabel(leader.id)} 승인 대기`
            : count > 0 && from && end
              ? `${kindLabel(rule)} · ${periodText(from, end)} · ${days(count)}`
              : '기간을 고르세요'
        }
      >
        {sent ? (
          <>
            <Button onPress={reset}>새로 신청</Button>
            {screens.has('groupware/approval/document') && (
              <Button
                variant="primary"
                icon="file-text"
                onPress={() => screens.go('groupware/approval/document', { id: sent.id })}
              >
                결재 문서
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onPress={cancel}>취소</Button>
            <Button
              variant="primary"
              icon="send"
              disabled={!canRequest}
              {...(!canRequest ? { disabledReason: '휴가를 신청할 권한이 없습니다' } : {})}
              onPress={submit}
            >
              신청
            </Button>
          </>
        )}
      </ActionBar>
    </Page>
  );
}
