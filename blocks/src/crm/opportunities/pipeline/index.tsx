// 영업기회(Dashboard): 파이프라인 KPI · 담당 필터 · 단계별 칸반(KanbanBoard · 건수 · 합계 · 가중 · 옮기기) · 상세 Drawer(단계 이동 · 실주 처리)
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatPercent,
  funnelSteps,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  ChartCard,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  FilterBar,
  FunnelChart,
  Input,
  KanbanBoard,
  KpiCard,
  PageHeader,
  RadioGroup,
  SegmentedControl,
  Stepper,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  ACTIVITY_META,
  CUSTOMERS,
  OCT_WON,
  oppFunnel,
  OPP_STAGE_ORDER,
  OPP_STAGES,
  OPPORTUNITIES,
  SALES_REPS,
  STAGE_PROBABILITY,
  staffLabel,
  type Opportunity,
  type OppStage,
} from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import {
  Col,
  ExportButton,
  Grid,
  monthLabel,
  monthStart,
  Page,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

const OPEN: readonly OppStage[] = ['discover', 'propose', 'quote', 'negotiate'];
const FLOW: readonly OppStage[] = [...OPEN, 'won'];
const LOST_REASONS = ['단가 차이', '납기 맞추기 어려움', '경쟁사 선정', '거래처 사정'];
const weighted = (o: Opportunity) => Math.round((o.amount * o.probability) / 100);
/** 이번 달부터 석 달(키 2026-11 · 이름 11월) */
const MONTHS = [0, 1, 2].map((i) => ({
  key: monthStart(TODAY, i).slice(0, 7),
  label: monthLabel(TODAY, i),
}));
const sum = (os: readonly Opportunity[], f: (o: Opportunity) => number) =>
  os.reduce((a, o) => a + f(o), 0);
/** 엑셀 다운로드 열(보이는 영업기회, 금액은 서식 없는 숫자) */
const CSV: CsvColumn<Opportunity>[] = [
  { label: '번호', value: 'id' },
  { label: '고객', value: 'customer' },
  { label: '건명', value: 'title' },
  { label: '단계', value: (o) => OPP_STAGES[o.stage].label },
  { label: '금액(원)', value: 'amount' },
  { label: '확률(%)', value: 'probability' },
  { label: '가중 금액(원)', value: (o) => weighted(o) },
  { label: '마감 예정일', value: 'closeDate' },
  { label: '담당 영업', value: (o) => staffLabel(o.owner) },
];

export default function Pipeline() {
  const toast = useToast();
  const canEdit = useCan('opportunities', 'update');
  const canCreate = useCan('opportunities', 'create');
  const screens = useScreens();
  const [opps, setOpps] = useState<Opportunity[]>(() => OPPORTUNITIES.map((o) => ({ ...o })));
  const [owner, setOwner] = useState('all');
  /** 단계 전환 깔때기: 건수 · 금액 */
  const [funnelBy, setFunnelBy] = useState<'count' | 'amount'>('count');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  /** 실주 처리 대화상자 대상(상세 Drawer 단추 · 칸반에서 실주 칸으로 옮길 때) */
  const [lostId, setLostId] = useState<string | null>(null);
  const [reason, setReason] = useState(LOST_REASONS[0]!);
  const open = opps.find((o) => o.id === openId) ?? null;
  const lost = opps.find((o) => o.id === lostId) ?? null;
  const activities = open
    ? (CUSTOMERS.find((c) => c.code === open.customerCode)?.activities ?? [])
    : [];

  const mine = opps.filter((o) => owner === 'all' || o.owner === owner);
  const shown = mine.filter((o) => !q || `${o.customer}${o.title}${o.id}`.includes(q));
  const live = mine.filter((o) => OPEN.includes(o.stage));
  const wonNov = mine.filter((o) => o.stage === 'won' && o.closeDate >= `${MONTHS[0]!.key}-01`);
  const closed = mine.filter((o) => o.stage === 'won' || o.stage === 'lost');
  const funnel = oppFunnel(mine);
  const funnelData = funnel.map((f) => ({
    label: f.label,
    value: funnelBy === 'count' ? f.count : f.amount,
  }));
  const funnelUnit = funnelBy === 'count' ? '건' : '원';
  const steps = funnelSteps(funnelData);
  const lastStep = steps[steps.length - 1];
  const byMonth = (prefix: string) =>
    sum(
      live.filter((o) => o.closeDate.startsWith(prefix)),
      weighted,
    );
  const update = (id: string, patch: Partial<Opportunity>) =>
    setOpps((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const move = (o: Opportunity, stage: OppStage) => {
    update(o.id, { stage, probability: STAGE_PROBABILITY[stage] });
    toast.show({
      title: `${OPP_STAGES[stage].label} 단계로 옮겼습니다`,
      description: `${o.customer} · ${o.title}`,
      tone: stage === 'won' ? 'success' : 'neutral',
    });
  };
  const nextOf = (s: OppStage): OppStage | null => {
    const i = OPEN.indexOf(s);
    if (i < 0) return null;
    return i === OPEN.length - 1 ? 'won' : OPEN[i + 1]!;
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: 'CRM' }, { label: '영업기회' }]}
          title="영업기회"
          description={`진행 ${live.length}건 · ${MONTHS[0]!.label} 마감 예정 ${live.filter((o) => o.closeDate.startsWith(MONTHS[0]!.key)).length}건 · ${formatDate(TODAY, 'mdw')} 기준`}
          actions={
            <>
              <ExportButton module="opportunities" name="영업기회" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="plus" disabled={!canCreate}>
                영업기회 등록
              </Button>
            </>
          }
        />
      }
    >
      <Grid>
        <Col span={3}>
          <KpiCard
            label="진행 파이프라인"
            value={sum(live, (o) => o.amount)}
            format="amount"
            unit="원"
            caption={`${live.length}건 · 발굴부터 협상까지`}
            icon="filter"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="가중 예상 매출"
            value={sum(live, weighted)}
            format="amount"
            unit="원"
            caption={MONTHS.map((m) => `${m.label} ${formatCompactWon(byMonth(m.key))}원`).join(
              ' · ',
            )}
            icon="scale"
          />
        </Col>
        {/* slot: funnel — 단계 전환(KPI 옆 두 줄 높이). 지금 담당 필터의 영업기회로 센다 */}
        <Col span={6} rows={2}>
          <ChartCard
            className="tl-block-crm-funnel"
            title="단계 전환"
            subtitle={`${funnelUnit} · ${owner === 'all' ? '전체 담당' : owner} · 실주는 마지막 단계까지 셉니다`}
            action={
              <SegmentedControl
                size="sm"
                label="깔때기 기준"
                value={funnelBy}
                onChange={(v) => setFunnelBy(v as typeof funnelBy)}
                options={[
                  { value: 'count', label: '건수' },
                  { value: 'amount', label: '금액' },
                ]}
              />
            }
            height={224}
            table={{
              columns: [
                '단계',
                `${funnelBy === 'count' ? '건수' : '금액'}(${funnelUnit})`,
                '앞 단계 대비(%)',
                '발굴 대비(%)',
              ],
              rows: steps.map((s) => [s.label, s.value, s.rate ?? '–', s.overall ?? '–']),
            }}
          >
            <FunnelChart
              data={funnelData}
              unit={funnelUnit}
              {...(funnelBy === 'amount' ? { format: formatCompactWon } : {})}
              conversion="both"
              summary={false}
              ariaLabel={`영업 단계 전환. 발굴 ${funnelData[0]!.value}${funnelBy === 'count' ? '건' : '원'}에서 수주 ${funnelBy === 'count' ? `${lastStep?.value ?? 0}건` : `${formatCompactWon(lastStep?.value ?? 0)}원`}, 전환율 ${formatPercent(lastStep?.overall ?? 0)}`}
            />
          </ChartCard>
        </Col>
        {/* slot: funnel end */}
        <Col span={3}>
          <KpiCard
            label={`${MONTHS[0]!.label} 수주`}
            value={sum(wonNov, (o) => o.amount)}
            format="amount"
            unit="원"
            delta={{
              value: Math.round(((sum(wonNov, (o) => o.amount) - OCT_WON) / OCT_WON) * 1000) / 10,
              label: '전월 동기 대비',
              format: 'percent',
              polarity: 'finance',
            }}
            caption={`${wonNov.length}건 · 세금계산서 발행 기준`}
            icon="circle-check"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="수주율"
            value={
              closed.length
                ? (closed.filter((o) => o.stage === 'won').length / closed.length) * 100
                : 0
            }
            format="percent"
            caption={`최근 30일 · 수주 ${closed.filter((o) => o.stage === 'won').length}건 · 실주 ${closed.filter((o) => o.stage === 'lost').length}건`}
            icon="percent"
          />
        </Col>
      </Grid>

      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="고객 · 영업기회"
            label="영업기회 검색"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setOwner('all');
        }}
        resultCount={shown.length}
      >
        <SegmentedControl
          size="sm"
          label="담당 영업"
          value={owner}
          onChange={setOwner}
          options={[
            { value: 'all', label: '전체', count: opps.length },
            ...SALES_REPS.map((n) => ({
              value: n,
              label: n,
              count: opps.filter((o) => o.owner === n).length,
            })),
          ]}
        />
      </FilterBar>

      <KanbanBoard
        label="단계별 영업기회"
        columns={OPP_STAGE_ORDER.map((stage) => {
          const list = shown.filter((o) => o.stage === stage);
          const isOpen = OPEN.includes(stage);
          return {
            id: stage,
            title: OPP_STAGES[stage].label,
            tone: OPP_STAGES[stage].tone,
            ...(isOpen ? { trailing: `확률 ${formatPercent(STAGE_PROBABILITY[stage], 0)}` } : {}),
            caption: isOpen
              ? `가중 ${formatAmount(sum(list, weighted))}원`
              : stage === 'won'
                ? '세금계산서 발행 완료'
                : '사유 기록 완료',
          };
        })}
        cards={[...shown]
          .sort((a, b) => a.closeDate.localeCompare(b.closeDate))
          .map((o) => ({
            id: o.id,
            column: o.stage,
            title: o.customer,
            description: o.title,
            trailing: formatPercent(o.probability, 0),
            amount: o.amount,
            owner: o.owner,
            // 수주 · 실주로 끝난 건은 옮기지 않는다(되돌리기는 상세에서)
            locked: !OPEN.includes(o.stage),
            ...(o.stage === 'lost'
              ? { status: { label: o.lostReason ?? '실주', tone: 'danger' as const } }
              : { due: o.closeDate, done: o.stage === 'won', doneLabel: '수주' }),
          }))}
        today={TODAY}
        warnDays={7}
        activeCardId={openId}
        onCardPress={(c) => setOpenId(c.id)}
        {...(canEdit
          ? {
              onMove: (id: string, to: string) => {
                const o = opps.find((x) => x.id === id);
                if (!o) return;
                // 실주는 사유를 먼저 받는다
                if (to === 'lost') setLostId(id);
                else move(o, to as OppStage);
              },
            }
          : {})}
      />

      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open ? `${open.customer} · ${open.title}` : ''}
        description={open ? `${open.id} · ${staffLabel(open.owner)}` : ''}
        width="lg"
        actions={
          open && <Badge tone={OPP_STAGES[open.stage].tone}>{OPP_STAGES[open.stage].label}</Badge>
        }
        footer={
          open &&
          OPEN.includes(open.stage) && (
            <>
              <Button
                variant="danger"
                icon="circle-x"
                disabled={!canEdit}
                onPress={() => setLostId(open.id)}
              >
                실주 처리
              </Button>
              {(open.stage === 'propose' || open.stage === 'quote') &&
                screens.has('crm/quotes/editor') && (
                  <Button icon="receipt" onPress={() => screens.go('crm/quotes/editor')}>
                    견적서 작성
                  </Button>
                )}
              <Button
                variant="primary"
                iconEnd="chevron-right"
                disabled={!canEdit}
                onPress={() => {
                  const n = nextOf(open.stage);
                  if (n) move(open, n);
                }}
              >
                {nextOf(open.stage) === 'won'
                  ? '수주 처리'
                  : `${OPP_STAGES[nextOf(open.stage)!].label} 단계로`}
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.stage === 'lost' ? (
              <Banner tone="danger" title={`실주 · ${open.lostReason ?? '사유 미입력'}`}>
                {formatDate(open.closeDate, 'md')}에 실주로 처리했습니다. 같은 고객의 다음
                영업기회에 참고하세요.
              </Banner>
            ) : (
              <Stepper
                size="sm"
                label="영업 단계"
                steps={FLOW.map((s, i) => ({
                  id: s,
                  label: OPP_STAGES[s].label,
                  state:
                    open.stage === 'won' || i < FLOW.indexOf(open.stage)
                      ? ('done' as const)
                      : i === FLOW.indexOf(open.stage)
                        ? ('current' as const)
                        : ('todo' as const),
                }))}
              />
            )}
            <DescriptionList
              columns={2}
              items={[
                { label: '고객', value: `${open.customer} · ${open.customerCode}` },
                { label: '담당', value: staffLabel(open.owner) },
                { label: '예상 금액', value: `${formatAmount(open.amount)}원` },
                { label: '확률', value: formatPercent(open.probability, 0) },
                { label: '가중 금액', value: `${formatAmount(weighted(open))}원` },
                { label: '마감 예정', value: formatDate(open.closeDate) },
                { label: '관련 문서', value: open.doc ?? '–' },
                {
                  label: open.stage === 'lost' ? '실주 사유' : '다음 할 일',
                  value: open.stage === 'lost' ? (open.lostReason ?? '–') : (open.next ?? '–'),
                },
              ]}
            />
            {activities.length > 0 && (
              <section className="tl-block-crm-drawer-section" aria-label="고객 최근 활동">
                <h3 className="tl-block-crm-drawer-section__title">
                  {open.customer} 최근 활동 {activities.length}건
                </h3>
                <Timeline
                  ariaLabel={`${open.customer} 최근 활동`}
                  items={activities.map((a) => ({
                    id: a.id,
                    title: `${a.kind} · ${a.title}`,
                    time: a.at,
                    actor: a.by,
                    ...(a.description ? { description: a.description } : {}),
                    tone: ACTIVITY_META[a.kind].tone,
                    icon: ACTIVITY_META[a.kind].icon,
                  }))}
                />
              </section>
            )}
          </div>
        )}
      </Drawer>

      <Dialog
        open={lost !== null}
        onOpenChange={(o) => !o && setLostId(null)}
        tone="danger"
        title="실주로 처리합니다"
        description={
          lost ? `${lost.customer} · ${lost.title} · ${formatAmount(lost.amount)}원` : ''
        }
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="danger"
                  onPress={() => {
                    if (!lost) return;
                    update(lost.id, { stage: 'lost', probability: 0, lostReason: reason });
                    toast.show({
                      title: '실주로 처리했습니다',
                      description: `${lost.customer} · ${reason}`,
                      tone: 'warning',
                    });
                  }}
                >
                  실주 처리
                </Button>
              }
            />
          </>
        }
      >
        <RadioGroup
          label="실주 사유"
          value={reason}
          onChange={setReason}
          options={LOST_REASONS.map((r) => ({ value: r, label: r }))}
        />
      </Dialog>
    </Page>
  );
}
