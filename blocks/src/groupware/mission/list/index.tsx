// 내 임무(ListDetail): 숫자 줄 → 정시 완수 기록 → 탭 · 조회 줄 · 표 → 상세 서랍.
// 완료는 증빙을 붙여야 켜진다. 시스템 확인 임무는 관련 화면에서 일을 마치면 그 화면이 완료한다.
// 보류는 사유를 받고 연속 일수를 끊지 않는다. 기한 변경 · 재배정은 사유와 함께 팀장 결재로 올린다.
import { formatDate } from '@terracelab/trellis-contracts';
import {
  Attachment,
  Badge,
  Banner,
  Button,
  CalendarHeatmap,
  Card,
  Checklist,
  DataGrid,
  DataGridLines,
  DateField,
  DescriptionList,
  Dialog,
  Drawer,
  DueBadge,
  Field,
  FileUpload,
  FilterBar,
  IconButton,
  Input,
  KpiCard,
  Menu,
  PageHeader,
  PersonLabel,
  ReasonDialog,
  Select,
  Tabs,
  Tag,
  Textarea,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useEffect, useMemo, useState } from 'react';
import { EMPLOYEES } from '../../../_data/groupware.js';
import { TODAY } from '../../../_data/index.js';
import {
  AGENT_NAMES,
  businessDay,
  completeBlock,
  CONDITION_LABELS,
  inTab,
  KIND_LABELS,
  MISSION_SCREENS,
  MISSIONS,
  missionAt,
  monthRate,
  SOURCE_LABELS,
  STATUS_LABELS,
  streakCount,
  streakDays,
  TAB_LABELS,
  todayOf,
  type Mission,
  type MissionCondition,
  type MissionFile,
  type MissionKind,
  type MissionTab,
} from '../../../_data/mission.js';
import { NOW } from '../../../_data/profile.js';
import {
  useCan,
  useOpenLink,
  usePlatform,
  useScope,
  useScreenParams,
  useScreens,
} from '../../../_platform/index.js';
import {
  Col,
  Figure,
  Grid,
  monthLabel,
  monthStart,
  Muted,
  Page,
  Stack,
} from '../../../_ui/index.js';
import './style.css';

// slot: tabs — 탭 다섯(주소 값 ?tab=)과 빈 탭 문구
const TABS = Object.keys(TAB_LABELS) as MissionTab[];
const EMPTY: Record<MissionTab, string> = {
  today: '당일 기한인 임무가 없습니다. 이번 주 임무를 확인하세요',
  week: '이번 주 기한인 임무가 없습니다',
  overdue: '기한 지난 임무가 없습니다',
  blocked: '보류한 임무가 없습니다',
  done: '완료한 임무가 없습니다',
};
// slot: tabs end

const STATE_TONE = {
  pending: 'neutral',
  doing: 'info',
  done: 'success',
  blocked: 'warning',
} as const;
const moduleLabel = (id: string) => modules.modules.find((m) => m.id === id)?.label ?? id;
const person = (id: string) => EMPLOYEES.find((e) => e.id === id);
const personName = (id: string) => {
  const e = person(id);
  return e ? `${e.name} ${e.title}` : id;
};
/** 이력 시각(MM-DD HH:MM) */
const STAMP = `${TODAY.slice(5)} ${NOW}`;

interface Draft {
  title: string;
  ownerId: string;
  due: string | null;
  kind: MissionKind;
  condition: MissionCondition;
  link: string | null;
}

export default function MissionList() {
  const toast = useToast();
  const { session } = usePlatform();
  const { canSee, scope, label: scopeLabel } = useScope();
  const canCreate = useCan('mission', 'create');
  const canAssign = useCan('mission', 'approve');
  const openLink = useOpenLink();
  const screens = useScreens();
  const params = useScreenParams();
  const meId = session.user.id;
  const meName = session.user.name;

  const [all, setAll] = useState<Mission[]>(() => [...MISSIONS]);
  const [tab, setTab] = useState<MissionTab>(
    TABS.includes(params['tab'] as MissionTab) ? (params['tab'] as MissionTab) : 'today',
  );
  // ?id= 로 오면 그 임무를 연다(일정 · 홈에서 기한을 눌렀을 때. 이번 주 뒤의 임무는 탭에 없어서 바로 연다)
  const [openId, setOpenId] = useState<string | null>(params['id'] ?? null);
  useEffect(() => {
    if (TABS.includes(params['tab'] as MissionTab)) setTab(params['tab'] as MissionTab);
    if (params['id']) setOpenId(params['id']);
  }, [params]);
  const [kind, setKind] = useState<string | null>('all');
  const [mod, setMod] = useState<string | null>('all');
  const [owner, setOwner] = useState<string | null>('me');
  const [q, setQ] = useState('');
  const [blockId, setBlockId] = useState<string | null>(null);
  const [change, setChange] = useState<{ id: string; kind: 'due' | 'owner' } | null>(null);
  const [changeValue, setChangeValue] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    title: '',
    ownerId: meId,
    due: TODAY,
    kind: 'adhoc',
    condition: 'evidence',
    link: null,
  });

  const update = (id: string, title: string, fn: (x: Mission) => Mission) =>
    setAll((xs) =>
      xs.map((x) =>
        x.id === id
          ? { ...fn(x), log: [{ time: STAMP, title, actor: meName }, ...(x.log ?? [])] }
          : x,
      ),
    );

  // 데이터 범위: 구성원은 본인, 팀장은 부서, 전사 역할은 모두
  const visible = useMemo(
    () => all.filter((x) => canSee({ userId: x.ownerId, department: person(x.ownerId)?.team })),
    [all, canSee],
  );
  const people = [...new Set(visible.map((x) => x.ownerId))];
  const filtered = visible.filter(
    (x) =>
      (owner === 'all' || !owner || (owner === 'me' ? x.ownerId === meId : x.ownerId === owner)) &&
      (kind === 'all' || !kind || x.kind === kind) &&
      (mod === 'all' || !mod || x.module === mod) &&
      (!q || x.title.includes(q)),
  );
  const shown = filtered.filter((x) => inTab(x, tab)).sort((a, b) => a.due.localeCompare(b.due));
  const open = all.find((x) => x.id === openId) ?? null;

  // 숫자는 내 임무(개인 기록)로 센다
  const today = todayOf(all, meId);
  const days = streakDays(all, meId);
  const streak = streakCount(days);
  const thisMonth = monthRate(days, 0);
  const lastMonth = monthRate(days, -1);
  const months = [-2, -1, 0].map((n) => ({ label: monthLabel(TODAY, n), ...monthRate(days, n) }));
  const heat = days
    .filter((d) => d.date >= monthStart(TODAY, -2))
    .map((d) => ({ date: d.date, value: d.onTime }));

  const complete = (x: Mission) => {
    if (completeBlock(x)) return;
    update(x.id, '완료', (y) => ({ ...y, status: 'done', doneAt: missionAt(TODAY, NOW) }));
    toast.show({ title: '완료했습니다', description: x.title, tone: 'success' });
  };
  const attach = (id: string, files: readonly MissionFile[]) =>
    update(id, `증빙 ${files.length}개 첨부`, (x) => ({
      ...x,
      evidence: [...(x.evidence ?? []), ...files],
    }));
  const block = (id: string, reason: string) =>
    update(id, `보류 · ${reason}`, (x) => ({ ...x, status: 'blocked', blockedReason: reason }));
  const unblock = (id: string) =>
    update(id, '보류 풀기', (x) => ({ ...x, status: 'pending', blockedReason: undefined }));
  const assignable = canAssign ? [...new Set([meId, ...people])] : [meId];
  const linkable = MISSION_SCREENS.filter((s) => screens.has(s.id));

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: moduleLabel('mission') }, { label: '내 임무' }]}
          title="내 임무"
          description={`${formatDate(TODAY, 'mdw')} · ${scopeLabel} 범위 · 기한 순`}
          actions={
            <Button
              variant="primary"
              icon="plus"
              disabled={!canCreate}
              onPress={() => setCreating(true)}
            >
              임무 등록
            </Button>
          }
          tabs={
            <Tabs
              label="임무"
              value={tab}
              onChange={(v) => setTab(v as MissionTab)}
              items={TABS.map((t) => ({
                value: t,
                label: TAB_LABELS[t],
                count: filtered.filter((x) => inTab(x, t)).length,
              }))}
            />
          }
        />
      }
    >
      {/* slot: record — 개인 기록(당일 · 정시 완수율 · 연속 일수와 달력). 내 임무로만 센다 */}
      <Grid gap="tight">
        <Col span={4}>
          <KpiCard
            label="당일 기한"
            value={today.total}
            unit="건"
            caption={`${today.total}건 가운데 ${today.done}건 완료`}
            icon="list-checks"
          />
        </Col>
        <Col span={4}>
          <KpiCard
            label="당월 정시 완수율"
            value={thisMonth.rate}
            format="percent"
            caption={`${thisMonth.total}건 가운데 ${thisMonth.onTime}건 · 전월 ${lastMonth.rate}%`}
            delta={{
              value: thisMonth.rate - lastMonth.rate,
              label: '전월 대비',
              format: 'point',
              polarity: 'up-good',
            }}
            icon="circle-check"
          />
        </Col>
        <Col span={4}>
          <KpiCard
            label="연속 일수"
            value={streak}
            unit="일"
            caption="휴일과 보류는 끊지 않습니다"
            icon="flag"
          />
        </Col>
      </Grid>
      <Card
        title="정시 완수 기록"
        subtitle="최근 3개월 · 날짜별 정시 완수 건수 · 휴일과 보류는 빠집니다"
      >
        <div className="tl-block-mission-record">
          <div className="tl-block-mission-record__months">
            {months.map((r) => (
              <Stack key={r.label} gap="sm">
                <Figure label={`${r.label} 정시 완수율`} value={r.rate} unit="%" />
                <Muted>{`${r.total}건 가운데 ${r.onTime}건`}</Muted>
              </Stack>
            ))}
          </div>
          <div className="tl-block-mission-record__heat">
            <CalendarHeatmap
              data={heat}
              layout="year"
              unit="건"
              ariaLabel="최근 3개월 날짜별 정시 완수 건수"
            />
          </div>
        </div>
      </Card>
      {/* slot: record end */}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="임무 찾기"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        resultCount={shown.length}
        onReset={() => {
          setKind('all');
          setMod('all');
          setOwner('me');
          setQ('');
        }}
      >
        <Select
          size="sm"
          width="auto"
          label="종류"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'all', label: '종류 전체' },
            ...(Object.keys(KIND_LABELS) as MissionKind[]).map((k) => ({
              value: k,
              label: KIND_LABELS[k],
            })),
          ]}
        />
        <Select
          size="sm"
          width="auto"
          label="모듈"
          value={mod}
          onChange={setMod}
          options={[
            { value: 'all', label: '모듈 전체' },
            ...modules.modules
              .filter((m) => visible.some((x) => x.module === m.id))
              .map((m) => ({ value: m.id, label: m.label })),
          ]}
        />
        {scope !== 'self' && (
          <Select
            size="sm"
            width="auto"
            label="담당"
            value={owner}
            onChange={setOwner}
            options={[
              { value: 'me', label: '나' },
              { value: 'all', label: `${scopeLabel} 전체` },
              ...people.filter((p) => p !== meId).map((p) => ({ value: p, label: personName(p) })),
            ]}
          />
        )}
      </FilterBar>
      <DataGrid
        caption={`${TAB_LABELS[tab]} 임무`}
        rows={shown}
        rowKey="id"
        activeRowKey={openId}
        onRowPress={(x) => setOpenId(x.id)}
        filtered={q !== '' || kind !== 'all' || mod !== 'all' || owner !== 'me'}
        empty={EMPTY[tab]}
        // slot: columns — 기한 · 임무 · 종류 · 모듈 · 담당 · 완료 조건 · 상태 + 행 행동(완료 · 더 보기)
        columns={[
          {
            key: 'due',
            header: '기한',
            width: 'sm',
            mobile: 'meta',
            // 완료한 임무는 상태 열이 완료를 보이므로 기한 날짜만 쓴다
            render: (x) =>
              x.status === 'done' ? (
                formatDate(x.due, 'md')
              ) : (
                <DueBadge due={x.due} today={TODAY} size="sm" />
              ),
          },
          {
            key: 'title',
            header: '임무',
            mobile: 'title',
            render: (x) => (
              <DataGridLines
                primary={x.title}
                secondary={x.agentId ? AGENT_NAMES[x.agentId] : SOURCE_LABELS[x.source]}
              />
            ),
          },
          {
            key: 'kind',
            header: '종류',
            width: 'xs',
            mobile: 'hidden',
            render: (x) => <Tag size="sm">{KIND_LABELS[x.kind]}</Tag>,
          },
          {
            key: 'module',
            header: '모듈',
            width: 'sm',
            mobile: 'meta',
            render: (x) => moduleLabel(x.module),
          },
          {
            key: 'owner',
            header: '담당',
            width: 'md',
            mobile: 'meta',
            render: (x) => (
              <PersonLabel
                size="sm"
                name={person(x.ownerId)?.name ?? x.ownerId}
                meta={person(x.ownerId)?.title}
              />
            ),
          },
          {
            key: 'condition',
            header: '완료 조건',
            width: 'sm',
            mobile: 'hidden',
            render: (x) => CONDITION_LABELS[x.condition],
          },
          {
            key: 'status',
            header: '상태',
            width: 'sm',
            mobile: 'status',
            render: (x) => <Badge tone={STATE_TONE[x.status]}>{STATUS_LABELS[x.status]}</Badge>,
          },
        ]}
        rowActions={(x) => (
          <>
            {x.condition === 'evidence' && x.status !== 'done' && (
              <Button
                size="sm"
                disabled={!!completeBlock(x)}
                disabledReason={completeBlock(x) ?? undefined}
                onPress={() => complete(x)}
              >
                완료
              </Button>
            )}
            <Menu
              align="end"
              trigger={<IconButton size="sm" icon="ellipsis" label={`${x.title} 더 보기`} />}
              items={[
                {
                  id: 'block',
                  label: '보류',
                  icon: 'circle-pause',
                  disabled: x.status === 'done' || x.status === 'blocked',
                  onSelect: () => setBlockId(x.id),
                },
                {
                  id: 'due',
                  label: '기한 변경',
                  icon: 'calendar',
                  disabled: x.status === 'done',
                  onSelect: () => {
                    setChange({ id: x.id, kind: 'due' });
                    setChangeValue(x.due);
                    setChangeReason('');
                  },
                },
                {
                  id: 'owner',
                  label: '재배정',
                  icon: 'user',
                  disabled: x.status === 'done' || scope === 'self',
                  ...(scope === 'self' ? { disabledReason: '팀장에게 요청하세요' } : {}),
                  onSelect: () => {
                    setChange({ id: x.id, kind: 'owner' });
                    setChangeValue(null);
                    setChangeReason('');
                  },
                },
              ]}
            />
          </>
        )}
        // slot: columns end
      />

      {/* slot: detail — 상세 서랍(설명 · 관련 화면 · 하위 단계 · 증빙 · 이력) */}
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.title ?? ''}
        description={
          open
            ? `${KIND_LABELS[open.kind]} · ${moduleLabel(open.module)} · ${personName(open.ownerId)}`
            : ''
        }
        width="lg"
        actions={open && <Badge tone={STATE_TONE[open.status]}>{STATUS_LABELS[open.status]}</Badge>}
        footer={
          open &&
          open.status !== 'done' && (
            <>
              {open.status === 'blocked' ? (
                <Button icon="play" onPress={() => unblock(open.id)}>
                  보류 풀기
                </Button>
              ) : (
                <Button icon="circle-pause" onPress={() => setBlockId(open.id)}>
                  보류
                </Button>
              )}
              {open.condition === 'evidence' && (
                <Button
                  variant="primary"
                  icon="check"
                  disabled={!!completeBlock(open)}
                  disabledReason={completeBlock(open) ?? undefined}
                  onPress={() => complete(open)}
                >
                  완료
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.status === 'blocked' && (
              <Banner tone="warning" title="보류한 임무입니다">
                {open.blockedReason} · 보류한 날은 연속 일수를 끊지 않습니다.
              </Banner>
            )}
            {open.status === 'pending' || open.status === 'doing'
              ? completeBlock(open) && <Banner tone="info">{completeBlock(open)}</Banner>
              : null}
            <DescriptionList
              columns={2}
              items={[
                {
                  label: '기한',
                  value: (
                    <>
                      <DueBadge
                        due={open.due}
                        today={TODAY}
                        done={open.status === 'done'}
                        size="sm"
                      />{' '}
                      {formatDate(open.due)}
                    </>
                  ),
                },
                { label: '담당', value: personName(open.ownerId) },
                { label: '종류', value: KIND_LABELS[open.kind] },
                { label: '완료 조건', value: CONDITION_LABELS[open.condition] },
                {
                  label: '만든 곳',
                  value: open.agentId
                    ? `${AGENT_NAMES[open.agentId]} · ${SOURCE_LABELS[open.source]}`
                    : SOURCE_LABELS[open.source],
                },
                ...(open.doneAt
                  ? [
                      {
                        label: '완료',
                        value: `${open.doneAt.slice(0, 10)} ${open.doneAt.slice(11, 16)}${open.doneAt.slice(0, 10) > open.due ? ' · 기한 뒤 완료(정시 완수 아님)' : ''}`,
                      },
                    ]
                  : []),
              ]}
            />
            {openLink(open.link) && (
              <div>
                <Button icon="external-link" onPress={openLink(open.link)}>
                  관련 화면 열기
                </Button>
              </div>
            )}
            {open.steps && (
              <Checklist
                label="하위 단계"
                today={TODAY}
                items={open.steps.map((s) => ({
                  id: s.id,
                  title: s.title,
                  state: s.done ? 'done' : 'pending',
                }))}
                onChange={(stepId, d) =>
                  setAll((xs) =>
                    xs.map((x) =>
                      x.id === open.id
                        ? {
                            ...x,
                            steps: x.steps?.map((s) => (s.id === stepId ? { ...s, done: d } : s)),
                          }
                        : x,
                    ),
                  )
                }
              />
            )}
            {open.condition === 'evidence' && (
              <Field label="증빙" help="파일을 하나 이상 붙이면 완료할 수 있습니다">
                <FileUpload
                  multiple
                  files={[]}
                  disabled={open.status === 'done'}
                  onFilesChange={(files) =>
                    files.length &&
                    attach(
                      open.id,
                      files.map((f) => ({ name: f.name, size: f.size })),
                    )
                  }
                />
              </Field>
            )}
            {!!open.evidence?.length && (
              <Attachment
                files={open.evidence.map((f) => ({ ...f }))}
                {...(open.status === 'done'
                  ? {}
                  : {
                      onRemove: (name: string) =>
                        setAll((xs) =>
                          xs.map((x) =>
                            x.id === open.id
                              ? {
                                  ...x,
                                  evidence: (x.evidence ?? []).filter((f) => f.name !== name),
                                }
                              : x,
                          ),
                        ),
                    })}
              />
            )}
            {!!open.log?.length && (
              <Timeline
                ariaLabel="이력"
                dense
                items={open.log.map((l, i) => ({
                  id: `${open.id}-${i}`,
                  title: l.title,
                  time: l.time,
                  actor: l.actor,
                }))}
              />
            )}
          </div>
        )}
      </Drawer>
      {/* slot: detail end */}

      <ReasonDialog
        open={blockId !== null}
        onOpenChange={(o) => !o && setBlockId(null)}
        title="임무 보류"
        description="외부 사정으로 막힌 임무를 보류합니다. 보류한 날은 연속 일수를 끊지 않습니다"
        label="보류 사유"
        confirmLabel="보류"
        onConfirm={(reason) => {
          if (blockId) block(blockId, reason);
          setBlockId(null);
          toast.show({ title: '보류했습니다', tone: 'success' });
        }}
      />

      <Dialog
        open={change !== null}
        onOpenChange={(o) => !o && setChange(null)}
        title={change?.kind === 'owner' ? '재배정 요청' : '기한 변경 요청'}
        description="사유와 함께 팀장 결재로 올립니다. 승인되면 임무가 바뀝니다"
        footer={
          <>
            <Button onPress={() => setChange(null)}>취소</Button>
            <Button
              variant="primary"
              disabled={!changeValue || !changeReason.trim()}
              onPress={() => {
                if (!change || !changeValue) return;
                // 서비스는 여기서 결재 문서를 만든다. 승인되면 기한 · 담당을 바꾼다
                const after =
                  change.kind === 'due' ? formatDate(changeValue) : personName(changeValue);
                update(
                  change.id,
                  `${change.kind === 'due' ? '기한 변경' : '재배정'} 결재 요청 · ${after}`,
                  (x) => x,
                );
                setChange(null);
                toast.show({
                  title: '결재를 올렸습니다',
                  description: '팀장 결재 · 진행',
                  tone: 'success',
                });
              }}
            >
              결재 올리기
            </Button>
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          {change?.kind === 'due' ? (
            <Field label="새 기한" required>
              <DateField value={changeValue} onChange={setChangeValue} today={TODAY} min={TODAY} />
            </Field>
          ) : (
            <Field label="새 담당" required>
              <Select
                value={changeValue}
                onChange={setChangeValue}
                options={people
                  .filter((p) => p !== all.find((x) => x.id === change?.id)?.ownerId)
                  .map((p) => ({ value: p, label: personName(p) }))}
              />
            </Field>
          )}
          <Field label="사유" required>
            <Textarea value={changeReason} onChange={setChangeReason} rows={3} />
          </Field>
        </div>
      </Dialog>

      {/* slot: register — 임무 등록(제목 · 담당 · 기한 · 종류 · 완료 조건 · 관련 화면) */}
      <Dialog
        open={creating}
        onOpenChange={setCreating}
        title="임무 등록"
        footer={
          <>
            <Button onPress={() => setCreating(false)}>취소</Button>
            <Button
              variant="primary"
              disabled={!draft.title.trim() || !draft.due}
              onPress={() => {
                const screen = MISSION_SCREENS.find((s) => s.id === draft.link);
                const id = `m${all.length + 1}`;
                setAll((xs) => [
                  ...xs,
                  {
                    id,
                    title: draft.title.trim(),
                    kind: draft.kind,
                    module: screen && screen.module !== 'platform' ? screen.module : 'mission',
                    ownerId: draft.ownerId,
                    due: businessDay(draft.due ?? TODAY),
                    status: 'pending',
                    condition: draft.condition,
                    source: 'person',
                    ...(draft.link ? { link: draft.link } : {}),
                    log: [{ time: STAMP, title: '임무 등록', actor: meName }],
                  },
                ]);
                setCreating(false);
                setDraft((d) => ({ ...d, title: '', link: null }));
                toast.show({ title: '임무를 등록했습니다', tone: 'success' });
              }}
            >
              등록
            </Button>
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <Field label="제목" required>
            <Input value={draft.title} onChange={(v) => setDraft((d) => ({ ...d, title: v }))} />
          </Field>
          <Field
            label="담당"
            help={canAssign ? undefined : '다른 사람에게 배정하려면 팀장에게 요청하세요'}
          >
            <Select
              value={draft.ownerId}
              onChange={(v) => setDraft((d) => ({ ...d, ownerId: v ?? meId }))}
              options={assignable.map((p) => ({ value: p, label: personName(p) }))}
              disabled={!canAssign}
            />
          </Field>
          <Field label="기한" required help="토 · 일 · 공휴일이면 다음 영업일로 정합니다">
            <DateField
              value={draft.due}
              onChange={(v) => setDraft((d) => ({ ...d, due: v }))}
              today={TODAY}
              min={TODAY}
            />
          </Field>
          <Field label="종류">
            <Select
              value={draft.kind}
              onChange={(v) => setDraft((d) => ({ ...d, kind: (v ?? 'adhoc') as MissionKind }))}
              options={(Object.keys(KIND_LABELS) as MissionKind[]).map((k) => ({
                value: k,
                label: KIND_LABELS[k],
              }))}
            />
          </Field>
          <Field label="완료 조건">
            <Select
              value={draft.condition}
              onChange={(v) =>
                setDraft((d) => ({ ...d, condition: (v ?? 'evidence') as MissionCondition }))
              }
              options={(Object.keys(CONDITION_LABELS) as MissionCondition[]).map((c) => ({
                value: c,
                label: CONDITION_LABELS[c],
              }))}
            />
          </Field>
          {linkable.length > 0 && (
            <Field label="관련 화면">
              <Select
                value={draft.link}
                onChange={(v) => setDraft((d) => ({ ...d, link: v }))}
                placeholder="없음"
                options={linkable.map((s) => ({ value: s.id, label: s.title }))}
              />
            </Field>
          )}
        </div>
      </Dialog>
      {/* slot: register end */}
    </Page>
  );
}
