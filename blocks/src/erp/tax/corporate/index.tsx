// 법인세 신고(TaxFiling, erp/tax/vat-return과 같은 순서): 사업연도 · 기한 · 조정 구분 → 단계(결산 확정 → 세무조정 → 신고서 값 → 점검 → 제출,
// 앞 단계가 끝나야 다음이 열린다) → 숫자 넷 → 세액이 나온 과정 · 소득이 나온 과정 → 서식별 신고서 값(값 칸 복사) → 제출 전 점검
// → 입력 순서(외부 조정이면 세무 대리인) → 접수증 · 완료 표시 → 법인지방소득세.
// 결산 전 사업연도는 장부 누계 + 남은 달 예상으로 계산하고 1단계에서 멈춘다. 직전 사업연도 수입금액이 기준 이상이면
// 외부 세무조정 대상이라 세무조정계산서는 세무 대리인이 쓰고, 회사는 값을 확인하고 접수증을 받아 보관한다
import { formatAmount, formatDate, type ChecklistItem } from '@terracelab/trellis-contracts';
import {
  AmountBreakdown,
  Badge,
  Banner,
  Card,
  Checklist,
  Citation,
  DescriptionList,
  DueBadge,
  IssueList,
  KpiCard,
  PageHeader,
  Select,
  Stepper,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useEffect, useMemo, useState } from 'react';
import {
  CORP_FORMS,
  CORP_YEARS,
  corpCalcOf,
  corpFormValues,
  corpYearOf,
  EXTERNAL_ADJUST_REVENUE,
  TAX_AGENT,
  TODAY,
  type CorpForm,
  type FiledReturn,
} from '../../../_data/tax-filing.js';
import { useCan, useScreenParams } from '../../../_platform/index.js';
import { Col, ExportButton, Grid, Muted, Page, Stack } from '../../../_ui/index.js';
import { FilingBox, ValueCheckAll, ValueGrid } from '../withholding/filing.js';

type StepState = 'done' | 'current' | 'todo' | 'error';
/** 반올림 단위 글자(1,000,000 → 백만 원) */
const roundLabel = (n: number) =>
  ({ 1_000: '천 원', 10_000: '만 원', 1_000_000: '백만 원', 100_000_000: '억 원' })[n] ??
  `${formatAmount(n)}원`;
const md = (date: string) => `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일`;

export default function Corporate() {
  const params = useScreenParams();
  const toast = useToast();
  const canEdit = useCan('tax', 'update');
  // 기본: 신고를 마치지 않은 가장 이른 사업연도
  const [year, setYear] = useState(
    () => CORP_YEARS.find((y) => !y.filed)?.year ?? CORP_YEARS.at(-1)!.year,
  );
  useEffect(() => {
    const y = params['year'];
    if (y && CORP_YEARS.some((x) => x.year === y)) setYear(y);
  }, [params]);
  const [form, setForm] = useState<CorpForm>(CORP_FORMS[0]);
  const [checks, setChecks] = useState<Readonly<Record<string, boolean>>>({});
  const [receipts, setReceipts] = useState<
    Readonly<Record<string, readonly { name: string; size: number }[]>>
  >({});
  const [marked, setMarked] = useState<Readonly<Record<string, FiledReturn>>>({});

  const y = corpYearOf(year);
  const c = useMemo(() => corpCalcOf(y), [y]);
  const forms = useMemo(() => corpFormValues(y, c), [y, c]);
  const allValues = useMemo(() => Object.values(forms).flat(), [forms]);
  const filingKey = `corp:${year}`;
  const filed = marked[filingKey] ?? y.filed;
  const isChecked = (key: string) => !!filed || !!checks[`${filingKey}:${key}`];
  const unchecked = allValues.filter((v) => !isChecked(v.key)).length;
  const files = receipts[filingKey] ?? [];
  const balanced = y.balanceSheet.assets === y.balanceSheet.liabilities + y.balanceSheet.equity;

  // slot: checks-rules — 제출 전 점검(오류가 있으면 제출 단계로 가지 않는다)
  const issues = [
    ...(c.estimate
      ? [
          {
            id: 'estimate',
            level: 'error' as const,
            tag: '결산 전',
            title: '결산 전 예상 값입니다',
            message: `월마감 ${y.closedMonths}/12 · 결산을 확정하면 장부 값으로 다시 계산합니다`,
          },
        ]
      : []),
    ...(balanced
      ? []
      : [
          {
            id: 'balance',
            level: 'error' as const,
            tag: '대차',
            title: '자산과 부채 · 자본 합계가 다릅니다',
            message: `자산 ${formatAmount(y.balanceSheet.assets)}원 · 부채와 자본 ${formatAmount(y.balanceSheet.liabilities + y.balanceSheet.equity)}원`,
          },
        ]),
    ...(filed ? [] : y.credits).map((cr) => ({
      id: `credit-${cr.name}`,
      level: 'warning' as const,
      tag: '공제 요건',
      title: `${cr.name} 요건을 확인하세요`,
      message: `${cr.basis} · 늘어난 인원을 다음 2년 동안 유지해야 공제가 남습니다`,
    })),
    ...(unchecked && !c.estimate
      ? [
          {
            id: 'unchecked',
            level: 'warning' as const,
            tag: '확인',
            title: `확인 안 한 칸 ${unchecked}개`,
            message: '신고서에 넣은 뒤 칸마다 확인 표시를 합니다',
          },
        ]
      : []),
  ];
  // slot: checks-rules end
  const hasError = issues.some((i) => i.level === 'error');

  const done = {
    closing: y.closed,
    adjust: y.closed && (!c.external || !!y.adjustedAt),
    values: unchecked === 0,
    check: !hasError,
    file: !!filed,
  };
  // 앞 단계가 끝나야 다음 단계가 열린다(처음 안 끝난 단계가 current, 그 뒤는 todo)
  const order = ['closing', 'adjust', 'values', 'check', 'file'] as const;
  const firstOpen = filed ? -1 : order.findIndex((k) => !done[k]);
  const state = Object.fromEntries(
    order.map((k, i): [string, StepState] => [
      k,
      firstOpen === -1 || i < firstOpen ? 'done' : i === firstOpen ? 'current' : 'todo',
    ]),
  ) as Record<(typeof order)[number], StepState>;
  const valuesOpen = state.values !== 'todo' && !filed && !c.estimate;
  const fileReady = state.file === 'current';

  const lockedReason = filed
    ? '신고를 마친 사업연도입니다'
    : c.estimate
      ? '결산 전 예상 값입니다. 확인 표시는 결산 · 세무조정 뒤에 합니다'
      : state.values === 'todo'
        ? '결산 확정 · 세무조정 뒤에 확인합니다'
        : !canEdit
          ? '확인 표시는 세무 수정 권한이 있어야 합니다'
          : undefined;
  const valueProps = {
    values: forms[form],
    checked: isChecked,
    onCheck: (keys: readonly string[], on: boolean) =>
      setChecks((st) => ({
        ...st,
        ...Object.fromEntries(keys.map((k) => [`${filingKey}:${k}`, on])),
      })),
    editable: canEdit && valuesOpen,
  };

  const mark = () => {
    setMarked((s) => ({
      ...s,
      [filingKey]: {
        filedAt: TODAY,
        files: files.map((f) => f.name),
        ...(c.external ? { by: TAX_AGENT.name } : {}),
      },
    }));
    toast.show({
      title: '완료 표시를 했습니다',
      description: `${year} 사업연도 법인세 · 접수증 ${files.length}개를 보관했습니다`,
      tone: 'success',
    });
  };

  // slot: guide — 입력 순서(자기 조정) · 세무 대리인과 할 일(외부 조정)
  const guide: ChecklistItem[] = (
    c.external
      ? [
          {
            id: 'h1',
            title: '세무조정계산서 받기',
            description: y.adjustedAt
              ? `${TAX_AGENT.name} · ${formatDate(y.adjustedAt)}`
              : `${TAX_AGENT.name} · 결산 확정 뒤`,
          },
          {
            id: 'h2',
            title: '신고서 값 확인',
            description: '서식마다 장부 · 조정 내역과 맞춰 봅니다',
          },
          {
            id: 'h3',
            title: '전자신고 요청',
            description: `${TAX_AGENT.contact} · 기한 ${formatDate(y.due)}`,
          },
          {
            id: 'h4',
            title: '접수증 · 납부확인서 받기',
            description: c.payable ? `납부 ${formatAmount(c.payable)}원` : '납부할 세액 없음',
          },
        ]
      : [
          {
            id: 'h1',
            title: '홈택스 · 법인세 정기신고(일반)',
            description: '법인 인증서로 로그인 · 기본 사항 확인',
          },
          { id: 'h2', title: '표준재무제표 넣기', description: '표준재무제표 서식의 값' },
          { id: 'h3', title: '소득금액조정합계표 넣기', description: '세무조정 항목과 소득 처분' },
          { id: 'h4', title: '공제감면세액 넣기', description: '공제감면세액 서식의 값' },
          {
            id: 'h5',
            title: '세액조정계산서 · 과세표준 및 세액신고서 확인',
            description: '산출세액 · 공제감면세액 · 납부할 세액',
          },
          {
            id: 'h6',
            title: '제출 · 접수증 저장 · 납부',
            description: `기한 ${formatDate(y.due)}`,
          },
        ]
  ).map((g) => ({ ...g, state: filed ? 'done' : 'pending' }));
  // slot: guide end

  const reviewRows = [
    ...y.incomeStatement.map((r) => ({ group: '손익계산서', name: r.name, value: r.value })),
    { group: '재무상태표', name: '자산 총계', value: y.balanceSheet.assets },
    { group: '재무상태표', name: '부채 총계', value: y.balanceSheet.liabilities },
    { group: '재무상태표', name: '자본 총계', value: y.balanceSheet.equity },
    ...y.adjustments.map((a) => ({
      group: `세무조정 · ${a.kind}`,
      name: a.title,
      value: a.amount,
    })),
    ...allValues.map((v) => ({
      group: v.form,
      name: v.line,
      value: typeof v.value === 'number' ? v.value : 0,
    })),
  ];
  const rate = y.brackets.map((b) => `${b.rate}%`).join(' · ');

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '세무' }, { label: '법인세 신고' }]}
          title="법인세 신고"
          meta={
            <>
              <Badge tone={filed ? 'success' : c.estimate ? 'neutral' : 'info'}>
                {filed ? '신고 완료' : c.estimate ? '결산 전' : '신고 전'}
              </Badge>
              {!filed && <DueBadge due={y.due} today={TODAY} warnDays={30} />}
            </>
          }
          description={`${year} 사업연도(${y.period.from}~${y.period.to.slice(5)}) · 신고 기한 ${formatDate(y.due)} · ${c.external ? '외부 조정' : '자기 조정'}${c.estimate ? ' · 결산 전 예상' : ''} · 단위 원`}
          actions={
            <Select
              size="sm"
              width="auto"
              label="사업연도"
              value={year}
              onChange={(v) => v && setYear(v)}
              options={[...CORP_YEARS].reverse().map((x) => ({
                value: x.year,
                label: `${x.year} 사업연도${(marked[`corp:${x.year}`] ?? x.filed) ? ' · 신고 완료' : ''}`,
              }))}
            />
          }
        />
      }
    >
      {/* slot: steps — 결산 확정 → 세무조정 → 신고서 값 → 점검 → 제출 */}
      <Card>
        <Stepper
          label="법인세 신고 단계"
          steps={[
            {
              id: 'closing',
              label: '결산 확정',
              description: y.closed ? '확정' : `월마감 ${y.closedMonths}/12`,
              state: state.closing,
            },
            {
              id: 'adjust',
              label: '세무조정',
              description: c.external
                ? y.adjustedAt
                  ? `조정계산서 ${md(y.adjustedAt)}`
                  : '세무 대리인 작성'
                : `조정 ${y.adjustments.length}건`,
              state: state.adjust,
            },
            {
              id: 'values',
              label: '신고서 값',
              description: `확인 ${allValues.length - unchecked}/${allValues.length}칸`,
              state: state.values,
            },
            {
              id: 'check',
              label: '점검',
              ...(state.check === 'todo' ? {} : { description: hasError ? '오류 있음' : '통과' }),
              state: state.check,
            },
            {
              id: 'file',
              label: '제출',
              ...(state.file === 'todo'
                ? {}
                : { description: filed ? md(filed.filedAt) : '접수증 첨부' }),
              state: state.file,
            },
          ]}
        />
      </Card>
      {/* slot: steps end */}

      {!filed && !c.estimate && y.due < TODAY && (
        <Banner tone="warning" title={`신고 기한(${formatDate(y.due)})이 지났습니다`}>
          이미 제출했다면 접수증을 첨부해 보관하세요. 제출하지 않았다면 기한 후 신고를 해야 합니다.
        </Banner>
      )}

      <Grid>
        <Col span={3}>
          <KpiCard
            label={c.estimate ? '과세표준(예상)' : '과세표준'}
            value={c.base}
            format="amount"
            unit="원"
            caption="각 사업연도 소득 − 이월결손금"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={c.estimate ? '산출세액(예상)' : '산출세액'}
            value={c.tax}
            format="amount"
            unit="원"
            caption={`구간 세율 ${rate}`}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="공제감면세액"
            value={c.credit}
            format="amount"
            unit="원"
            caption={y.credits.map((cr) => cr.name).join(' · ') || '결산 뒤 확인'}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={c.estimate ? '납부할 세액(예상)' : '납부할 세액'}
            value={c.payable}
            format="amount"
            unit="원"
            caption="산출세액 − 공제감면 − 기납부"
          />
        </Col>

        {/* slot: calc — 세액이 나온 과정 · 소득이 나온 과정 */}
        <Col span={6}>
          <Card
            title="세액이 나온 과정"
            subtitle={c.estimate ? '예상 · 결산 뒤 장부 값으로 바뀝니다' : '과세표준 → 세액'}
          >
            <Stack>
              <AmountBreakdown
                unit="원"
                rows={[
                  {
                    key: 'income',
                    label: '각 사업연도 소득',
                    value: c.income,
                    hint: c.estimate ? '소득 예상의 가정' : '소득이 나온 과정',
                  },
                  { key: 'loss', label: '이월결손금', value: y.carryLoss, op: '−' },
                  { key: 'base', label: '과세표준', value: c.base, op: '=' },
                  { key: 'tax', label: '산출세액', value: c.tax, hint: `구간 세율 ${rate}` },
                  {
                    key: 'credit',
                    label: '공제감면세액',
                    value: c.credit,
                    op: '−',
                    hint: y.credits.map((cr) => cr.name).join(' · ') || '결산 뒤 확인',
                  },
                  {
                    key: 'prepaid',
                    label: '기납부세액',
                    value: c.prepaid,
                    op: '−',
                    hint: y.prepaid.map((p) => p.name).join(' · ') || '없음',
                  },
                  { key: 'payable', label: '납부할 세액', value: c.payable, op: '=' },
                ]}
                activeKey="payable"
              />
              {c.payable === 0 && <Muted>납부할 세액이 없어도 신고는 해야 합니다.</Muted>}
              <Citation
                label="근거"
                sources={[
                  { index: 1, title: c.estimate ? '소득 예상의 가정' : '소득금액조정합계표' },
                  { index: 2, title: '과세표준 구간 세율', location: `${year} 사업연도` },
                  { index: 3, title: '공제감면세액' },
                ]}
                onOpen={(s) => {
                  if (s.index === 1 && !c.estimate) setForm(CORP_FORMS[2]);
                  if (s.index === 2) setForm(CORP_FORMS[1]);
                  if (s.index === 3) setForm(CORP_FORMS[3]);
                }}
              />
            </Stack>
          </Card>
        </Col>
        <Col span={6}>
          {c.estimate && y.estimate ? (
            <Card
              title="소득 예상의 가정"
              subtitle={`장부 ${y.closedMonths}개월 누계 + 남은 달 예상 + 세무조정 예상`}
            >
              <Stack>
                <AmountBreakdown
                  unit="원"
                  rows={[
                    {
                      key: 'pretax',
                      label: `1~${y.closedMonths}월 법인세 차감 전 이익`,
                      value: c.pretax,
                      hint: '손익계산서 누계',
                    },
                    ...y.estimate.lines.map((l) => ({
                      key: l.key,
                      label: l.label,
                      value: l.amount,
                      op: '+' as const,
                      hint: l.basis,
                    })),
                    {
                      key: 'adjust',
                      label: '세무조정 예상',
                      value: c.add - c.deduct,
                      op: '+' as const,
                      hint: y.adjustments.map((a) => a.title.replace('(예상)', '')).join(' · '),
                    },
                    {
                      key: 'sum',
                      label: '각 사업연도 소득(예상)',
                      value: c.netIncome + c.add - c.deduct,
                      op: '=' as const,
                    },
                  ]}
                  activeKey="sum"
                />
                <Muted>
                  {`${roundLabel(y.estimate.round)} 단위로 반올림해 ${formatAmount(c.income)}원으로 계산합니다. 세율은 신고 때 그 해 세법으로 다시 확인합니다.`}
                </Muted>
              </Stack>
            </Card>
          ) : (
            <Card title="소득이 나온 과정" subtitle="당기순이익 → 세무조정 → 각 사업연도 소득">
              <AmountBreakdown
                unit="원"
                rows={[
                  {
                    key: 'net',
                    label: '결산서상 당기순이익',
                    value: c.netIncome,
                    hint: `법인세 차감 전 이익 ${formatAmount(c.pretax)} − 법인세 비용 ${formatAmount(y.taxExpense)}`,
                  },
                  {
                    key: 'add',
                    label: '익금산입 · 손금불산입',
                    value: c.add,
                    op: '+',
                    hint: `${y.adjustments.filter((a) => a.kind === '익금산입' || a.kind === '손금불산입').length}건`,
                  },
                  {
                    key: 'deduct',
                    label: '손금산입 · 익금불산입',
                    value: c.deduct,
                    op: '−',
                    hint: `${y.adjustments.filter((a) => a.kind === '손금산입' || a.kind === '익금불산입').length}건`,
                  },
                  { key: 'income', label: '각 사업연도 소득', value: c.income, op: '=' },
                ]}
                activeKey="income"
              />
            </Card>
          )}
        </Col>
        {/* slot: calc end */}
      </Grid>

      {/* slot: values — 서식별 신고서 값(칸 · 값 · 근거 · 확인, 값 칸 복사) */}
      <Card
        title="신고서 값"
        subtitle={lockedReason ?? '서식마다 칸 · 값 · 근거 · 확인 · 값 칸의 복사 단추'}
        action={<ValueCheckAll {...valueProps} />}
        padding="none"
      >
        <Stack gap="sm">
          <div className="tl-block-tax-inset">
            <Tabs
              label="서식"
              value={form}
              onChange={(v) => setForm(v as CorpForm)}
              items={CORP_FORMS.map((f) => ({ value: f, label: f }))}
            />
          </div>
          <ValueGrid caption={form} {...valueProps} />
        </Stack>
      </Card>
      {/* slot: values end */}

      <Grid>
        {/* slot: checks — 제출 전 점검 · 입력 순서(외부 조정이면 세무 대리인) */}
        <Col span={6}>
          <Card title="제출 전 점검" subtitle="오류가 있으면 제출 단계로 가지 않습니다">
            <IssueList
              items={issues}
              empty="점검을 모두 통과했습니다"
              onSelect={(id) => {
                if (id !== 'unchecked') return;
                const next = CORP_FORMS.find((f) => forms[f].some((v) => !isChecked(v.key)));
                if (next) setForm(next);
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          {c.external ? (
            <Card
              title="세무 대리인"
              subtitle={`외부 세무조정 대상 · 직전 사업연도 수입금액 ${formatAmount(y.prevRevenue)}원(기준 ${formatAmount(EXTERNAL_ADJUST_REVENUE)}원 이상)`}
            >
              <Stack>
                <Checklist label="세무 대리인과 할 일" items={guide} showProgress={false} />
                <div className="tl-block-row">
                  <ExportButton
                    module="tax"
                    name={`법인세 검토용 자료 ${year}`}
                    rows={reviewRows}
                    columns={[
                      { label: '구분', value: 'group' },
                      { label: '항목', value: 'name' },
                      { label: '금액(원)', value: 'value' },
                    ]}
                    size="sm"
                  >
                    검토용 자료 다운로드
                  </ExportButton>
                </div>
              </Stack>
            </Card>
          ) : (
            <Card
              title="홈택스 입력 순서"
              subtitle="단계마다 넣을 서식 · 값은 위 표에서 복사합니다"
            >
              <Checklist label="홈택스 입력 순서" items={guide} showProgress={false} />
            </Card>
          )}
        </Col>
        {/* slot: checks end */}

        {/* slot: filing — 접수증 · 납부확인서 → 완료 표시 */}
        <Col span={6}>
          <FilingBox
            // 완료 표시 뒤 신고 서류를 모아 두는 화면. 앱에 없으면 단추가 없다
            archive="ecm/my-docs/browser?folder=tax"
            title="제출"
            guide={[
              {
                id: 'f1',
                title: c.external ? '세무 대리인 전자신고' : '홈택스에서 신고서 제출',
                description: '접수증 PDF',
              },
              {
                id: 'f2',
                title: c.payable ? `납부 ${formatAmount(c.payable)}원` : '납부할 세액 없음',
                description: c.payable ? '납부확인서' : '신고만 합니다',
              },
            ]}
            ready={fileReady}
            blockedReason={
              c.estimate
                ? '결산 전 예상이라 제출 단계가 아닙니다'
                : '앞 단계(결산 · 세무조정 · 신고서 값 · 점검)를 끝내야 합니다'
            }
            filed={filed}
            files={files}
            onFiles={(fs) => setReceipts((s) => ({ ...s, [filingKey]: [...files, ...fs] }))}
            onRemove={(name) =>
              setReceipts((s) => ({ ...s, [filingKey]: files.filter((f) => f.name !== name) }))
            }
            onMark={mark}
            confirmTitle={`${year} 사업연도 법인세 신고를 완료로 표시합니다`}
            confirmBody="첨부한 접수증 · 납부확인서를 신고 보관함에 넣고 처리 기록에 남깁니다. 다음 해 신고가 이 값을 이월값으로 읽습니다."
          />
        </Col>
        {/* slot: filing end */}

        {/* slot: local — 법인지방소득세 */}
        <Col span={6}>
          <Card
            title="법인지방소득세"
            subtitle={`위택스 · 기한 ${formatDate(y.localDue)} · 세율은 법인세율의 10분의 1`}
          >
            <Stack>
              <DescriptionList
                columns={1}
                items={[
                  { label: '과세표준', value: c.base },
                  { label: '산출세액', value: c.local.tax },
                  { label: '특별징수세액', value: c.local.prepaid },
                  { label: '납부할 세액', value: c.local.payable },
                ].map((r) => ({
                  label: r.label,
                  value: formatAmount(r.value),
                  copyable: true,
                  copyText: String(r.value),
                }))}
              />
              <div>
                <DueBadge
                  due={y.localDue}
                  today={TODAY}
                  warnDays={30}
                  done={!!y.localFiled}
                  doneLabel="신고 완료"
                />
              </div>
            </Stack>
          </Card>
        </Col>
        {/* slot: local end */}
      </Grid>
    </Page>
  );
}
