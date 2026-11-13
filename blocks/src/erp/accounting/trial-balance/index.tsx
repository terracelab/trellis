// 합계잔액시산표(Dashboard): 계정과목 | 차변(잔액 · 합계) | 대변(합계 · 잔액). 계정 구분 소계(DataGrid groupBy) ·
// 대차 검증 · 손익 흐름 · 결산 준비(Checklist)
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatPercent,
  formatPeriod,
  type ChecklistItem,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Button,
  Card,
  ChartCard,
  Checklist,
  DataGrid,
  DescriptionList,
  Drawer,
  KpiCard,
  PageHeader,
  SegmentedBar,
  Select,
  TrendChart,
  WaterfallChart,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  ACCOUNT_GROUPS,
  accountMonths,
  CLOSED_MONTH,
  CLOSING,
  isDebitNormal,
  trialBalance,
  type AccountGroup,
  type TrialRow,
} from '../../../_data/erp.js';
import { sum, TODAY } from '../../../_data/index.js';
import { personLabel } from '../../../_data/profile.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import {
  Col,
  ExportButton,
  Figure,
  Grid,
  Page,
  Stack,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

type Row = TrialRow & { key: string; isGroup: boolean };
/** 엑셀 다운로드 열: 구분 소계 행도 함께(계정과목 뒤 "소계"), 금액은 서식 없는 숫자 */
const CSV: CsvColumn<Row>[] = [
  { label: '구분', value: 'group' },
  { label: '계정 코드', value: 'code' },
  { label: '계정과목', value: (r) => (r.isGroup ? `${r.name} 소계` : r.name) },
  { label: '차변 잔액(원)', value: 'debitBal' },
  { label: '차변 합계(원)', value: 'debitSum' },
  { label: '대변 합계(원)', value: 'creditSum' },
  { label: '대변 잔액(원)', value: 'creditBal' },
];

const CLOSE_DUE = CLOSING.due;
const YEAR = Number(TODAY.slice(0, 4));
// slot: closing — 결산 준비 항목의 행동 단추(그 일을 하는 화면 id → 단추 글자). 앱에 없는 화면은 단추를 그리지 않는다
const TASK_ACTIONS: Readonly<Record<string, string>> = {
  'erp/treasury/reconcile': '대사',
  'erp/accounting/journal': '전표 입력',
  'erp/accounting/aging': '연령 보기',
  'scm/inventory/count': '실사',
};
// slot: closing end

const lastDay = (m: number) =>
  `${YEAR}-${String(m).padStart(2, '0')}-${new Date(YEAR, m, 0).getDate()}`;
const groupSum = (rows: TrialRow[], g: AccountGroup, f: (r: TrialRow) => number) =>
  sum(
    rows.filter((r) => r.group === g),
    f,
  );
/** 계정 구분 순서(자산 · 부채 · 자본 · 수익 · 비용) → 코드 순. DataGrid groupBy는 처음 나온 순서로 묶는다 */
const byGroup = (a: TrialRow, b: TrialRow) =>
  ACCOUNT_GROUPS.indexOf(a.group) - ACCOUNT_GROUPS.indexOf(b.group) || a.code.localeCompare(b.code);
/** 금액 칸: 0은 비운다 */
const amount = (v: number) => (v ? formatAmount(v) : null);

export default function TrialBalance() {
  const screens = useScreens();
  const canClose = useCan('accounting', 'update');
  const [through, setThrough] = useState(CLOSED_MONTH);
  const [group, setGroup] = useState<string | null>('all');
  const [open, setOpen] = useState<Row | null>(null);
  const [tasks, setTasks] = useState(CLOSING.tasks);
  const tb = useMemo(() => trialBalance(through), [through]);
  /** 표 행: 계정만(소계 행은 DataGrid groupBy가 단다) */
  const rows = useMemo<Row[]>(
    () =>
      tb
        .filter((r) => group === 'all' || r.group === group)
        .sort(byGroup)
        .map((r) => ({ ...r, key: r.code, isGroup: false })),
    [tb, group],
  );
  /** 엑셀 다운로드 행: 구분마다 소계 행을 앞에 둔다 */
  const csvRows = useMemo<Row[]>(
    () =>
      ACCOUNT_GROUPS.filter((g) => group === 'all' || g === group).flatMap((g) => {
        const items = tb.filter((r) => r.group === g);
        const head: Row = {
          key: `g-${g}`,
          code: '',
          name: g,
          group: g,
          isGroup: true,
          debitSum: groupSum(items, g, (r) => r.debitSum),
          creditSum: groupSum(items, g, (r) => r.creditSum),
          debitBal: groupSum(items, g, (r) => r.debitBal),
          creditBal: groupSum(items, g, (r) => r.creditBal),
        };
        return [head, ...items.map((r) => ({ ...r, key: r.code, isGroup: false }))];
      }),
    [tb, group],
  );

  const dSum = sum(tb, (r) => r.debitSum);
  const cSum = sum(tb, (r) => r.creditSum);
  const dBal = sum(tb, (r) => r.debitBal);
  const cBal = sum(tb, (r) => r.creditBal);
  const balanced = dSum === cSum && dBal === cBal;
  const bal = (g: AccountGroup) =>
    groupSum(tb, g, (r) =>
      isDebitNormal(g) ? r.debitBal - r.creditBal : r.creditBal - r.debitBal,
    );
  const assets = bal('자산');
  const liabilities = bal('부채');
  const equity = bal('자본');
  const revenue = bal('수익');
  const expense = bal('비용');
  const profit = revenue - expense;
  const of = (code: string) => tb.find((r) => r.code === code);
  const sales = of('4010')?.creditBal ?? 0;
  const cogs = of('4510')?.debitBal ?? 0;
  const sga = sum(
    tb.filter((r) => r.code.startsWith('8')),
    (r) => r.debitBal,
  );
  const nonOp = sum(
    tb.filter((r) => r.code.startsWith('9')),
    (r) => r.creditBal - r.debitBal,
  );
  const period = formatPeriod(`${YEAR}-01-01`, lastDay(through));
  const months = open && !open.isGroup ? accountMonths(open.code, through) : [];
  const checklist = tasks.map((task): ChecklistItem => ({
    id: task.id,
    title: task.title,
    description: task.note,
    state: task.state,
    due: task.due,
    owner: personLabel(task.ownerId),
    ...(task.link && TASK_ACTIONS[task.link] && screens.has(task.link)
      ? {
          action: {
            label: TASK_ACTIONS[task.link]!,
            onPress: () => screens.go(task.link!),
          },
        }
      : {}),
  }));

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '회계' }, { label: '합계잔액시산표' }]}
          title="합계잔액시산표"
          meta={
            through <= CLOSED_MONTH ? (
              <Badge tone="success">{through}월 마감</Badge>
            ) : (
              <Badge tone="neutral">마감 전</Badge>
            )
          }
          description={`${period} · 전기 이월 포함 · 단위 원`}
          actions={
            <>
              <Select
                label="기준월"
                width="auto"
                value={String(through)}
                onChange={(v) => setThrough(Number(v ?? CLOSED_MONTH))}
                // slot: period — 고를 수 있는 기준월(마감한 달부터 넉 달)
                options={[0, 1, 2, 3]
                  .map((i) => CLOSED_MONTH - i)
                  .filter((m) => m > 0)
                  .map((m) => ({ value: String(m), label: `${YEAR}년 ${m}월` }))}
                // slot: period end
              />
              <Button icon="printer">인쇄</Button>
              <ExportButton
                module="accounting"
                name={`합계잔액시산표 ${YEAR}년 ${through}월`}
                rows={csvRows}
                columns={CSV}
              >
                엑셀 다운로드
              </ExportButton>
            </>
          }
        />
      }
    >
      <Grid>
        <Col span={3}>
          <KpiCard
            label="자산"
            value={assets}
            format="amount"
            unit="원"
            caption={`보통예금 ${formatCompactWon(of('1030')?.debitBal ?? 0)}원 포함`}
            icon="landmark"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="부채"
            value={liabilities}
            format="amount"
            unit="원"
            caption={`부채비율 ${formatPercent((liabilities / (equity + profit)) * 100)}`}
            icon="scale"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="자본(기초)"
            value={equity}
            format="amount"
            unit="원"
            caption="자본금 · 이월이익잉여금"
            icon="building-2"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={`당기순이익 1~${through}월`}
            value={profit}
            format="amount"
            unit="원"
            caption={`매출 대비 ${formatPercent((profit / sales) * 100)}`}
            icon="trending-up"
          />
        </Col>

        <Col span={8}>
          <Card
            title="시산표"
            subtitle={`${tb.length}개 계정 · 계정을 누르면 월별 증감을 봅니다`}
            padding="none"
            action={
              <Select
                label="계정 구분"
                size="sm"
                width="auto"
                value={group}
                onChange={setGroup}
                // slot: accountGroups — 계정 구분 거르기(구분 순서는 _data ACCOUNT_GROUPS)
                options={[
                  { value: 'all', label: '전체 구분' },
                  ...ACCOUNT_GROUPS.map((g) => ({ value: g, label: g })),
                ]}
                // slot: accountGroups end
              />
            }
          >
            <DataGrid
              caption="합계잔액시산표"
              className="tl-block-tb-grid"
              rows={rows}
              rowKey="key"
              groupBy="group"
              summary={group === 'all'}
              activeRowKey={open?.key ?? null}
              onRowPress={setOpen}
              // slot: columns — 계정과목 | 차변(잔액 · 합계) | 대변(합계 · 잔액). 단위는 머리 설명에 한 번(단위 원)
              columns={[
                {
                  key: 'name',
                  header: '계정과목',
                  hideable: false,
                  render: (r) => (
                    <span className="tl-block-tb-account">
                      <span className="tl-block-code">{r.code}</span>
                      <span>{r.name}</span>
                    </span>
                  ),
                },
                // 묶을 열(소계 행 머리 글자). 칸으로는 보이지 않는다
                { key: 'group', header: '계정 구분', hidden: true },
                {
                  key: 'debitBal',
                  header: '차변 잔액',
                  width: 'md',
                  format: 'amount',
                  headerUnit: false,
                  total: 'sum',
                  render: (r) => amount(r.debitBal),
                },
                {
                  key: 'debitSum',
                  header: '차변 합계',
                  width: 'md',
                  format: 'amount',
                  headerUnit: false,
                  total: 'sum',
                  render: (r) => amount(r.debitSum),
                },
                {
                  key: 'creditSum',
                  header: '대변 합계',
                  width: 'md',
                  format: 'amount',
                  headerUnit: false,
                  total: 'sum',
                  render: (r) => amount(r.creditSum),
                },
                {
                  key: 'creditBal',
                  header: '대변 잔액',
                  width: 'md',
                  format: 'amount',
                  headerUnit: false,
                  total: 'sum',
                  render: (r) => amount(r.creditBal),
                },
              ]}
              // slot: columns end
            />
          </Card>
        </Col>
        <Col span={4}>
          <Stack gap="lg">
            <Card
              title="대차 검증"
              subtitle={period}
              action={
                balanced ? (
                  <Badge tone="success">대차 일치</Badge>
                ) : (
                  <Badge tone="danger">대차 불일치</Badge>
                )
              }
            >
              <div className="tl-block-tb-check">
                <Figure label="차변 합계" value={formatAmount(dSum)} unit="원" />
                <Figure label="대변 합계" value={formatAmount(cSum)} unit="원" />
                <Figure label="차변 잔액" value={formatAmount(dBal)} unit="원" />
                <Figure label="대변 잔액" value={formatAmount(cBal)} unit="원" />
              </div>
            </Card>
            <ChartCard
              title="손익 흐름"
              subtitle={`원 · 1~${through}월 누계 · 매출에서 순이익까지`}
              height={220}
              table={{
                columns: ['구분', '금액(원)'],
                rows: [
                  ['매출', sales],
                  ['매출원가', -cogs],
                  ['판매비와관리비', -sga],
                  ['영업외 손익', nonOp],
                  ['당기순이익', profit],
                ],
              }}
            >
              <WaterfallChart
                height={200}
                unit="원"
                format={formatCompactWon}
                steps={[
                  { label: '매출', value: sales, kind: 'start' },
                  { label: '원가', value: -cogs, kind: 'delta' },
                  { label: '판관비', value: -sga, kind: 'delta' },
                  { label: '영업외', value: nonOp, kind: 'delta' },
                  { label: '순이익', value: profit, kind: 'total' },
                ]}
                ariaLabel={`1~${through}월 매출 ${formatCompactWon(sales)}원에서 원가 · 판관비 · 영업외 손익을 더해 당기순이익 ${formatCompactWon(profit)}원`}
              />
            </ChartCard>
            <Card
              title={`${CLOSING.month}월 결산 준비`}
              subtitle={`마감 목표 ${formatDate(CLOSE_DUE, 'mdw')}`}
            >
              <Checklist
                label={`${CLOSING.month}월 결산 준비`}
                today={TODAY}
                items={checklist}
                {...(canClose
                  ? {
                      onChange: (id: string, done: boolean) =>
                        setTasks((list) =>
                          list.map((t) =>
                            t.id === id ? { ...t, state: done ? 'done' : 'pending' } : t,
                          ),
                        ),
                    }
                  : {})}
              />
            </Card>
            <Card title="재무상태 구성" subtitle="자산 = 부채 + 자본 + 당기순이익">
              <SegmentedBar
                unit="원"
                format={formatCompactWon}
                data={[
                  { label: '부채', value: liabilities, color: 'series-4' },
                  { label: '자본', value: equity, color: 'series-1' },
                  { label: '당기순이익', value: profit, color: 'series-2' },
                ]}
                ariaLabel={`자산 ${formatCompactWon(assets)}원 중 부채 ${formatCompactWon(liabilities)}원, 자본 ${formatCompactWon(equity)}원, 당기순이익 ${formatCompactWon(profit)}원`}
              />
            </Card>
          </Stack>
        </Col>
      </Grid>

      {/* slot: detail — 계정을 누르면 여는 월별 증감 · 잔액 추이 */}
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open ? `${open.code} ${open.name}` : ''}
        description={open ? `${open.group} · ${period}` : ''}
        width="lg"
        actions={open && <Badge tone="neutral">{open.group}</Badge>}
        footer={
          <>
            <Button icon="download">계정별 원장 다운로드</Button>
            {screens.has('erp/accounting/journal') && (
              <Button
                variant="primary"
                icon="file-pen"
                onPress={() => screens.go('erp/accounting/journal')}
              >
                전표 입력
              </Button>
            )}
          </>
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={2}
              items={[
                { label: '차변 합계', value: `${formatAmount(open.debitSum)}원` },
                { label: '대변 합계', value: `${formatAmount(open.creditSum)}원` },
                {
                  label: '잔액',
                  value: `${formatAmount(Math.max(open.debitBal, open.creditBal))}원(${open.debitBal >= open.creditBal ? '차변' : '대변'})`,
                },
                {
                  label: '정상 잔액',
                  value: isDebitNormal(open.group)
                    ? '차변(자산 · 비용)'
                    : '대변(부채 · 자본 · 수익)',
                },
              ]}
            />
            <DataGrid
              caption="월별 증감"
              rows={months}
              rowKey="month"
              summary
              columns={[
                { key: 'label', header: '월', width: 'sm' },
                { key: 'debit', header: '차변', format: 'amount', total: 'sum' },
                { key: 'credit', header: '대변', format: 'amount', total: 'sum' },
                { key: 'balance', header: '잔액', format: 'amount' },
              ]}
            />
            <ChartCard title="잔액 추이" subtitle={`원 · 월말 잔액 · 1~${through}월`} height={180}>
              <TrendChart
                data={months.filter((m) => m.month > 0)}
                x="label"
                series={[{ key: 'balance', label: '잔액', color: 'series-1' }]}
                unit="원"
                height={180}
                yFormat={formatCompactWon}
                showDots
                ariaLabel={`${open.name} 월말 잔액. 1월 ${formatCompactWon(months[1]?.balance ?? 0)}원에서 ${through}월 ${formatCompactWon(months[through]?.balance ?? 0)}원`}
              />
            </ChartCard>
          </div>
        )}
      </Drawer>
      {/* slot: detail end */}
    </Page>
  );
}
