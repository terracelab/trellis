// 원천세 · 지급명세서(TaxFiling, erp/tax/vat-return과 같은 순서): 귀속 월 · 신고 종류 탭 → 단계(지급 내역 확인 → 신고서 값 → 제출 → 보관)
// → 숫자 셋 → 소득별 표(펴면 사람별, 인사 · 급여 조회 권한이 있을 때) → 어디서 온 금액 → 신고서 값(값 칸 복사) → 제출.
// 근로소득은 급여 대장이 확정 · 지급된 달만, 사업소득은 외주 용역 대금 결재가 승인된 달만 들어온다. 하나라도 확정 전이면 신고서 값 단계로 가지 않는다.
// 사람별 급여액은 가린 값으로 보이고 열면 열람 기록을 남긴다. 제출 · 납부는 국세청 · 지방세 사이트에서 하고 접수증을 첨부해 완료 표시한다
import { formatAmount, formatDate } from '@terracelab/trellis-contracts';
import {
  AmountBreakdown,
  Attachment,
  Badge,
  Banner,
  Button,
  Card,
  DataGrid,
  DueBadge,
  KpiCard,
  MaskedValue,
  PageHeader,
  Select,
  Stepper,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useEffect, useState } from 'react';
import {
  ANNUAL_FILED,
  annualDue,
  monthNo,
  simpleFormValues,
  TODAY,
  WHT,
  WHT_MONTHS,
  WHT_RULES,
  whtFormValues,
  type FiledReturn,
  type WhtIncome,
  type WhtIncomeKey,
} from '../../../_data/tax-filing.js';
import { useCan, useOpenLink, useScreenParams } from '../../../_platform/index.js';
import { Col, Grid, Muted, Page, Stack } from '../../../_ui/index.js';
import { FilingBox, ValueCheckAll, ValueGrid } from './filing.js';

type Tab = 'wht' | 'simple' | 'annual';
const TABS: readonly { value: Tab; label: string }[] = [
  { value: 'wht', label: '원천세 신고' },
  { value: 'simple', label: '간이지급명세서' },
  { value: 'annual', label: '연간 지급명세서' },
];
const MASK = '●,●●●,●●●';
const YEAR = TODAY.slice(0, 4);
const monthLabel = (ym: string) => `${ym.slice(0, 4)}년 ${monthNo(ym)}월 귀속`;

interface IncomeRow {
  id: string;
  label: string;
  people: number | null;
  paid: number;
  incomeTax: number;
  localTax: number;
  status?: string;
  kind: WhtIncomeKey;
  person?: boolean;
  children?: readonly IncomeRow[];
}

export default function Withholding() {
  const params = useScreenParams();
  const openLink = useOpenLink();
  const toast = useToast();
  const canEdit = useCan('tax', 'update');
  // slot: people — 사람별 금액을 보는 권한(인사 · 급여 조회)
  const canSeePeople = useCan('hr-payroll', 'read');
  // slot: people end
  const firstOpen = WHT_MONTHS.find((m) => !WHT[m]!.filed) ?? WHT_MONTHS.at(-1)!;
  const [month, setMonth] = useState(firstOpen);
  const [tab, setTab] = useState<Tab>('wht');
  useEffect(() => {
    const m = params['month'];
    const t = params['tab'];
    if (m && WHT_MONTHS.includes(m)) setMonth(m);
    if (t && TABS.some((x) => x.value === t)) setTab(t as Tab);
  }, [params]);
  /** 칸 확인 표시(귀속 월 · 신고 종류 · 칸) */
  const [checks, setChecks] = useState<Readonly<Record<string, boolean>>>({});
  const [receipts, setReceipts] = useState<
    Readonly<Record<string, readonly { name: string; size: number }[]>>
  >({});
  /** 이 화면에서 완료 표시한 신고 */
  const [marked, setMarked] = useState<Readonly<Record<string, FiledReturn>>>({});

  const m = WHT[month]!;
  const simple = tab === 'simple';
  const filingKey = `${simple ? 'simple' : 'wht'}:${month}`;
  const filed = marked[filingKey] ?? (simple ? m.simpleFiled : m.filed);
  const due = simple ? m.simpleDue : m.due;
  const values = simple ? simpleFormValues(m) : whtFormValues(m);
  const isChecked = (key: string) => !!filed || !!checks[`${filingKey}:${key}`];
  const allChecked = values.length > 0 && values.every((v) => isChecked(v.key));
  const files = receipts[filingKey] ?? [];
  const [labor, business] = m.incomes;
  const shown: readonly WhtIncome[] = simple ? [business] : m.incomes;
  const sources = [...new Set(shown.map((x) => x.source))].join(' · ');
  const total = shown.reduce<{ people: number; paid: number; incomeTax: number; localTax: number }>(
    (a, x) => ({
      people: a.people + x.people,
      paid: a.paid + x.paid,
      incomeTax: a.incomeTax + x.incomeTax,
      localTax: a.localTax + x.localTax,
    }),
    { people: 0, paid: 0, incomeTax: 0, localTax: 0 },
  );
  const step = (done: boolean, open: boolean) =>
    (filed || done ? 'done' : open ? 'current' : 'todo') as 'done' | 'current' | 'todo';
  const statusTone = filed ? 'success' : m.ready ? 'info' : 'warning';
  const statusLabel = filed ? '신고 완료' : m.ready ? '신고 전' : '확정 전';

  const rows: IncomeRow[] = shown.map((x) => ({
    id: x.key,
    label: x.label,
    people: x.people,
    paid: x.paid,
    incomeTax: x.incomeTax,
    localTax: x.localTax,
    status: x.status,
    kind: x.key,
    ...(canSeePeople && x.persons.length
      ? {
          children: x.persons.map((p) => ({
            id: `${x.key}-${p.id}`,
            label: p.work ? `${p.name} · ${p.work}` : p.name,
            people: null,
            paid: p.paid,
            incomeTax: p.incomeTax,
            localTax: p.localTax,
            kind: x.key,
            person: true,
          })),
        }
      : {}),
  }));

  // slot: annual — 연간 지급명세서(올해 귀속 달별 합계)
  const annual = WHT_MONTHS.map((x) => {
    const w = WHT[x]!;
    const [l, b] = w.incomes;
    const done = !!(marked[`wht:${x}`] ?? w.filed);
    return {
      id: x,
      month: `${monthNo(x)}월`,
      laborPeople: l.people,
      laborPaid: l.paid,
      bizPeople: b.people,
      bizPaid: b.paid,
      incomeTax: w.total.incomeTax,
      status: done ? '신고 완료' : w.ready ? '신고 전' : '확정 전',
    };
  });
  const prevYear = String(Number(YEAR) - 1);
  const prevAnnual = ANNUAL_FILED[prevYear];
  // slot: annual end

  const lockedReason = filed
    ? '신고를 마친 달입니다'
    : !m.ready
      ? '급여 · 대금이 확정되면 확인할 수 있습니다'
      : !canEdit
        ? '확인 표시는 세무 수정 권한이 있어야 합니다'
        : undefined;
  const valueProps = {
    values,
    checked: isChecked,
    onCheck: (keys: readonly string[], on: boolean) =>
      setChecks((st) => ({
        ...st,
        ...Object.fromEntries(keys.map((k) => [`${filingKey}:${k}`, on])),
      })),
    editable: canEdit && m.ready && !filed,
  };

  const mark = () => {
    setMarked((s) => ({ ...s, [filingKey]: { filedAt: TODAY, files: files.map((f) => f.name) } }));
    toast.show({
      title: '완료 표시를 했습니다',
      description: `${monthLabel(month)} · 접수증 ${files.length}개를 보관했습니다`,
      tone: 'success',
    });
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '세무' }, { label: '원천세 · 지급명세서' }]}
          title="원천세 · 지급명세서"
          meta={
            tab === 'annual' ? undefined : (
              <>
                <Badge tone={statusTone}>{statusLabel}</Badge>
                {!filed && <DueBadge due={due} today={TODAY} warnDays={7} />}
              </>
            )
          }
          description={
            tab === 'annual'
              ? `${YEAR}년 귀속 · 근로소득 지급명세서 제출 기한 ${formatDate(annualDue(YEAR))} · 단위 원`
              : `${monthLabel(month)} · ${simple ? '제출' : '신고 · 납부'} 기한 ${formatDate(due)} · 단위 원`
          }
          actions={
            tab !== 'annual' && (
              <Select
                size="sm"
                width="auto"
                label="귀속 월"
                value={month}
                onChange={(v) => v && setMonth(v)}
                options={[...WHT_MONTHS].reverse().map((x) => ({
                  value: x,
                  label: `${monthLabel(x)}${(marked[`wht:${x}`] ?? WHT[x]!.filed) ? ' · 신고 완료' : ''}`,
                }))}
              />
            )
          }
          tabs={
            <Tabs
              label="신고 종류"
              value={tab}
              onChange={(v) => setTab(v as Tab)}
              items={TABS.map((t) => ({ ...t }))}
            />
          }
        />
      }
    >
      {tab === 'annual' ? (
        <>
          <Card
            title={`${YEAR}년 귀속 달별 합계`}
            subtitle={`12월 급여와 연말정산을 마친 뒤 근로소득 지급명세서를 만듭니다 · 줄을 누르면 그 달 신고`}
            padding="none"
          >
            <DataGrid
              caption={`${YEAR}년 귀속 달별 합계`}
              className="tl-block-flat-grid"
              rows={annual}
              rowKey="id"
              summary
              onRowPress={(r) => {
                setMonth(r.id);
                setTab('wht');
              }}
              columns={[
                { key: 'month', header: '귀속 월', width: 'sm', mobile: 'title' },
                {
                  key: 'laborPeople',
                  header: '근로 인원',
                  width: 'sm',
                  format: 'number',
                  unit: '명',
                  mobile: 'hidden',
                },
                {
                  key: 'laborPaid',
                  header: '근로 총지급액',
                  width: 'lg',
                  format: 'amount',
                  total: 'sum',
                  mobile: 'hidden',
                },
                {
                  key: 'bizPeople',
                  header: '사업 인원',
                  width: 'sm',
                  format: 'number',
                  unit: '명',
                  mobile: 'hidden',
                },
                {
                  key: 'bizPaid',
                  header: '사업 총지급액',
                  width: 'md',
                  format: 'amount',
                  total: 'sum',
                  mobile: 'hidden',
                },
                {
                  key: 'incomeTax',
                  header: '소득세',
                  width: 'md',
                  format: 'amount',
                  total: 'sum',
                  mobile: 'trailing',
                },
                {
                  key: 'status',
                  header: '상태',
                  width: 'sm',
                  mobile: 'status',
                  render: (r: (typeof annual)[number]) => (
                    <Badge
                      tone={
                        r.status === '신고 완료'
                          ? 'success'
                          : r.status === '신고 전'
                            ? 'info'
                            : 'warning'
                      }
                    >
                      {r.status}
                    </Badge>
                  ),
                },
              ]}
            />
          </Card>
          {prevAnnual && (
            <Card
              title={`${prevYear}년 귀속 지급명세서`}
              subtitle={`${formatDate(prevAnnual.filedAt)} 제출 · 접수증 ${prevAnnual.files.length}개`}
            >
              <Attachment files={prevAnnual.files.map((name) => ({ name, size: 184_320 }))} />
            </Card>
          )}
        </>
      ) : (
        <>
          {/* slot: steps — 지급 내역 확인 → 신고서 값 → 제출 → 보관 */}
          <Card>
            <Stepper
              label="원천세 신고 단계"
              steps={[
                {
                  id: 'source',
                  label: '지급 내역 확인',
                  description: m.ready ? sources : `확정 전 ${m.blockers.length}건`,
                  state: step(m.ready, true),
                },
                {
                  id: 'values',
                  label: '신고서 값',
                  description: `확인 ${values.filter((v) => isChecked(v.key)).length}/${values.length}칸`,
                  state: step(m.ready && allChecked, m.ready),
                },
                {
                  id: 'file',
                  label: '제출',
                  description: simple ? '홈택스 · 접수증' : '홈택스 · 위택스 · 접수증',
                  state: step(!!filed, m.ready && allChecked),
                },
                { id: 'archive', label: '보관', state: step(!!filed, !!filed) },
              ]}
            />
          </Card>
          {/* slot: steps end */}

          {m.blockers
            .filter((b) => !simple || b.key === 'business')
            .map((b) => {
              const open = openLink(b.link);
              return (
                <Banner
                  key={b.key}
                  tone="warning"
                  title={b.title}
                  action={
                    open && (
                      <Button size="sm" iconEnd="arrow-right" onPress={open}>
                        {b.label}
                      </Button>
                    )
                  }
                >
                  {b.body}. 확정 전에는 신고서 값 단계로 가지 않습니다.
                </Banner>
              );
            })}

          <Grid>
            <Col span={4}>
              <KpiCard
                label="지급 인원"
                value={total.people}
                format="number"
                unit="명"
                caption={shown.map((x) => `${x.label} ${x.people}명`).join(' · ')}
              />
            </Col>
            <Col span={4}>
              <KpiCard
                label="총지급액"
                value={total.paid}
                format="amount"
                unit="원"
                caption={monthLabel(month)}
              />
            </Col>
            <Col span={4}>
              <KpiCard
                label={simple ? '원천징수한 소득세' : '납부할 소득세'}
                value={total.incomeTax}
                format="amount"
                unit="원"
                caption={
                  simple
                    ? `지급액의 ${WHT_RULES.businessRate}% · 신고 · 납부는 원천세 신고`
                    : `지방소득세 ${formatAmount(total.localTax)}원은 위택스`
                }
              />
            </Col>
          </Grid>

          <Grid>
            {/* slot: incomes — 소득 종류별(펴면 사람별) */}
            <Col span={8}>
              <Card
                title="소득별"
                subtitle={
                  filed && !shown.some((x) => x.persons.length)
                    ? '신고를 마친 달은 보관한 합계만 보입니다'
                    : canSeePeople
                      ? '줄을 펴면 사람별 금액 · 급여액은 가린 값'
                      : '사람별 금액은 인사 · 급여 조회 권한이 있어야 보입니다'
                }
                padding="none"
              >
                <DataGrid
                  caption="소득별 지급 · 원천징수"
                  className="tl-block-flat-grid"
                  rows={rows}
                  rowKey="id"
                  childrenKey="children"
                  summary
                  columns={[
                    { key: 'label', header: '소득 종류', mobile: 'title' },
                    {
                      key: 'status',
                      header: '상태',
                      width: 'sm',
                      mobile: 'meta',
                      render: (r: IncomeRow) =>
                        r.person ? null : (
                          <Badge
                            tone={
                              r.status === '작성 중' || r.status === '결재 중'
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {r.status}
                          </Badge>
                        ),
                    },
                    {
                      key: 'people',
                      header: '인원',
                      width: 'xs',
                      format: 'number',
                      unit: '명',
                      mobile: 'meta',
                    },
                    {
                      key: 'paid',
                      header: '총지급액',
                      // 화면 폭 1280에서도 표가 카드 안에 들게 md(열 폭 합 9.25단위, lg면 카드보다 넓다)
                      width: 'md',
                      format: 'amount',
                      total: 'sum',
                      mobile: 'trailing',
                      render: (r: IncomeRow) =>
                        r.person && r.kind === 'labor' ? (
                          <MaskedValue
                            label={`${r.label} 급여액`}
                            value={MASK}
                            onReveal={async () => {
                              toast.show({
                                title: `${r.label}의 급여액을 열었습니다`,
                                description: `${monthLabel(month)} · 열람 기록을 남겼습니다`,
                                tone: 'info',
                              });
                              return formatAmount(r.paid);
                            }}
                          />
                        ) : (
                          formatAmount(r.paid)
                        ),
                    },
                    {
                      key: 'incomeTax',
                      header: '소득세',
                      width: 'md',
                      format: 'amount',
                      total: 'sum',
                      mobile: 'hidden',
                    },
                  ]}
                />
              </Card>
            </Col>
            {/* slot: incomes end */}

            {/* slot: sources — 어디서 온 금액인가 */}
            <Col span={4}>
              <Card title="어디서 온 금액인가" subtitle={sources}>
                <Stack>
                  <AmountBreakdown
                    unit="원"
                    rows={[
                      ...(simple
                        ? []
                        : [
                            {
                              key: 'labor',
                              label: `근로소득(${labor.people}명)`,
                              value: labor.incomeTax,
                              hint: `${labor.source} · ${labor.status}`,
                            },
                          ]),
                      {
                        key: 'business',
                        label: `사업소득(${business.people}명)`,
                        value: business.incomeTax,
                        ...(simple ? {} : { op: '+' as const }),
                        hint: `지급액의 ${WHT_RULES.businessRate}% · ${business.status}`,
                      },
                      {
                        key: 'sum',
                        label: '소득세 합계',
                        value: total.incomeTax,
                        op: '=' as const,
                      },
                    ]}
                    activeKey="sum"
                  />
                  <div className="tl-block-row">
                    {shown.map((x) => {
                      const open = openLink(x.link);
                      return (
                        open && (
                          <Button key={x.key} size="sm" onPress={open}>
                            {`${x.source} · ${x.people}명`}
                          </Button>
                        )
                      );
                    })}
                  </div>
                </Stack>
              </Card>
            </Col>
            {/* slot: sources end */}
          </Grid>

          {/* slot: values — 신고서 값(칸 · 값 · 근거 · 확인, 값 칸 복사) */}
          <Card
            title="신고서 값"
            subtitle={`${simple ? '간이지급명세서(거주자의 사업소득)' : '원천징수이행상황신고서'} · ${lockedReason ?? '홈택스에 넣을 값 · 값 칸의 복사 단추'}`}
            action={values.length > 0 && <ValueCheckAll {...valueProps} />}
            padding="none"
          >
            {values.length ? (
              <ValueGrid caption="신고서 값" {...valueProps} />
            ) : (
              <div className="tl-block-tax-inset">
                <Muted>
                  {filed ? '보관함에 신고서 값이 있습니다' : '이 달은 넣을 값이 없습니다'}
                </Muted>
              </div>
            )}
          </Card>
          {/* slot: values end */}

          {/* slot: filing — 제출 안내 · 접수증 · 완료 표시 */}
          <FilingBox
            // 완료 표시 뒤 신고 서류를 모아 두는 화면. 앱에 없으면 단추가 없다
            archive="ecm/my-docs/browser?folder=tax"
            title={simple ? '간이지급명세서 제출' : '원천세 신고 · 납부'}
            guide={
              simple
                ? [
                    {
                      id: 'g1',
                      title: '홈택스 · 지급명세서 제출',
                      description: '간이지급명세서(거주자의 사업소득) 직접 작성',
                    },
                    {
                      id: 'g2',
                      title: '사람별 지급액 · 소득세 넣기',
                      description: '위 표의 값 칸마다 복사 단추가 있습니다',
                    },
                    {
                      id: 'g3',
                      title: '제출 · 접수증 저장',
                      description: `기한 ${formatDate(m.simpleDue)}`,
                    },
                  ]
                : [
                    {
                      id: 'g1',
                      title: '홈택스 · 원천세 정기신고',
                      description: '원천징수이행상황신고서 일반 작성',
                    },
                    {
                      id: 'g2',
                      title: '코드별 인원 · 총지급액 · 소득세 넣기',
                      description: 'A01(근로) · A25(사업) · A99(합계)',
                    },
                    {
                      id: 'g3',
                      title: '제출 · 접수증 저장 · 납부',
                      description: `기한 ${formatDate(m.due)}`,
                    },
                    {
                      id: 'g4',
                      title: '위택스 · 지방소득세(특별징수) 신고 · 납부',
                      description: `소득세의 ${WHT_RULES.localRate}% · 같은 기한`,
                    },
                  ]
            }
            ready={m.ready && allChecked}
            blockedReason={
              !m.ready ? '급여 · 대금이 확정되어야 합니다' : '신고서 값을 모두 확인해야 합니다'
            }
            filed={filed}
            files={files}
            onFiles={(fs) => setReceipts((s) => ({ ...s, [filingKey]: [...files, ...fs] }))}
            onRemove={(name) =>
              setReceipts((s) => ({ ...s, [filingKey]: files.filter((f) => f.name !== name) }))
            }
            onMark={mark}
            confirmTitle={`${monthLabel(month)} ${simple ? '간이지급명세서 제출' : '원천세 신고'}를 완료로 표시합니다`}
            confirmBody="첨부한 접수증을 신고 보관함에 넣고 처리 기록에 남깁니다."
            split
          />
          {/* slot: filing end */}
        </>
      )}
    </Page>
  );
}
