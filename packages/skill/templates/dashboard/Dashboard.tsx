'use client';
// 대시보드 시작 화면(매출 현황). `npx @terracelab/trellis-skill add dashboard`로 복사한 서비스 코드다.
// 위에서 아래로 화면 제목과 기간 → 숫자 네 개 → 추이와 순위 → 행동할 목록 순서다.
// 데이터는 ./data 한 곳에서 온다. 요청에 맞게 숫자 · 차트 · 표의 열을 바꾼다(스킬의 references/dashboard.md).
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatPercent,
  type CsvColumn,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Button,
  DashboardGrid,
  DashboardGridItem,
  DataGrid,
  KpiCard,
  PageHeader,
  SectionHeader,
  SegmentedControl,
  downloadCsv,
} from '@terracelab/trellis-react';
import { BarList, ChartCard, DataBar, TrendChart } from '@terracelab/trellis-react/charts';
import { useState } from 'react';
import { summarize, useDashboardData, type PartyRow, type Period } from './data';
import './dashboard.css';

const signed = (v: number) => `${formatAmount(v, { digits: 1, sign: 'always' })}%`;

/** 엑셀 다운로드 열. 금액 · 비율은 서식 없는 숫자, 단위는 머리에 한 번 */
const CSV: CsvColumn<PartyRow>[] = [
  { label: '거래처', value: 'name' },
  { label: '담당', value: 'manager' },
  { label: '주문(건)', value: 'orders' },
  { label: '매출(원)', value: 'sales' },
  { label: '전년 동기(원)', value: 'prevSales' },
  { label: '비중(%)', value: 'share' },
  { label: '전년 대비(%)', value: 'delta' },
  { label: '상태', value: (r) => (r.status === 'active' ? '거래 중' : '거래 중지') },
];

export function Dashboard() {
  const [period, setPeriod] = useState<Period>('ytd');
  const { data, loading, error, reload } = useDashboardData();
  const s = summarize(data, period);
  const year = data.asOf.slice(0, 4);
  const best = s.rows.reduce<PartyRow | null>((a, b) => (a && a.sales >= b.sales ? a : b), null);
  const topShare = Math.max(1, ...s.rows.map((r) => r.share));
  const first = data.months[0];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="매출 현황"
        description={
          data.asOf ? `${formatDate(data.asOf, 'md')} 기준 · 단위 원 · 전년 같은 기간과 비교` : ''
        }
        actions={
          <>
            <SegmentedControl
              label="기간"
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              options={[
                { value: 'month', label: '이번 달' },
                { value: 'ytd', label: '올해 누계' },
              ]}
            />
            <Button
              icon="download"
              disabled={s.rows.length === 0}
              onPress={() =>
                downloadCsv({
                  name: `매출 현황 거래처 ${s.label}`,
                  date: data.asOf,
                  rows: s.rows,
                  columns: CSV,
                })
              }
            >
              엑셀 다운로드
            </Button>
          </>
        }
      />

      <DashboardGrid label="매출 현황">
        {/* 숫자 네 개. 증감은 비교 대상을 함께 적는다 */}
        <DashboardGridItem span={3}>
          <KpiCard
            label={`${s.monthLabel} 매출`}
            value={s.month.sales}
            format="amount"
            delta={{ value: s.delta.month, label: '전년 동월 대비' }}
            icon="trending-up"
            loading={loading}
            error={Boolean(error)}
            onRetry={reload}
          />
        </DashboardGridItem>
        <DashboardGridItem span={3}>
          <KpiCard
            label={`${s.range} 누계 매출`}
            value={s.ytd.sales}
            format="amount"
            delta={{ value: s.delta.ytd, label: '전년 동기 대비' }}
            icon="chart-bar"
            loading={loading}
            error={Boolean(error)}
            onRetry={reload}
          />
        </DashboardGridItem>
        <DashboardGridItem span={3}>
          <KpiCard
            label={`${s.label} 주문`}
            value={s.now.orders}
            unit="건"
            caption="취소한 주문은 뺀다"
            icon="clipboard-list"
            loading={loading}
            error={Boolean(error)}
            onRetry={reload}
          />
        </DashboardGridItem>
        <DashboardGridItem span={3}>
          <KpiCard
            label="주문 한 건 평균"
            value={s.average}
            format="amount"
            caption={`${s.label} 매출 ÷ 주문 건수`}
            icon="coins"
            loading={loading}
            error={Boolean(error)}
            onRetry={reload}
          />
        </DashboardGridItem>

        {/* 추이(넓게) + 순위(좁게). 차트마다 표로 보기(table)와 한 문장 설명(ariaLabel)을 준다 */}
        <DashboardGridItem span={8}>
          <ChartCard
            title="월별 매출"
            subtitle={`원 · 실선은 ${year}년, 점선은 전년 같은 달`}
            legend={[
              { label: `${year}년`, color: 'series-1' },
              { label: `${Number(year) - 1}년`, color: 'compare', shape: 'dashed' },
            ]}
            height={280}
            loading={loading}
            error={error}
            onRetry={reload}
            empty={!loading && data.months.length === 0 ? '이 기간에 매출이 없습니다' : null}
            table={{
              columns: ['월', `${year}년(원)`, `${Number(year) - 1}년(원)`],
              rows: data.months.map((m) => [m.label, m.sales, m.prevSales]),
            }}
          >
            <TrendChart
              data={data.months}
              x="label"
              series={[
                { key: 'sales', label: `${year}년`, type: 'area', color: 'series-1' },
                {
                  key: 'prevSales',
                  label: `${Number(year) - 1}년`,
                  color: 'compare',
                  dashed: true,
                },
              ]}
              unit="원"
              height={260}
              yFormat={formatCompactWon}
              ariaLabel={
                first
                  ? `${year}년 ${s.range} 월별 매출. ${first.label} ${formatCompactWon(first.sales)}원에서 ${s.monthLabel} ${formatCompactWon(s.month.sales)}원`
                  : '월별 매출'
              }
            />
          </ChartCard>
        </DashboardGridItem>
        <DashboardGridItem span={4}>
          <ChartCard
            title="거래처별 매출"
            subtitle={`원 · ${s.label}`}
            height={280}
            loading={loading}
            error={error}
            onRetry={reload}
            empty={!loading && s.rows.length === 0 ? '거래처가 없습니다' : null}
            table={{
              columns: ['거래처', '매출(원)', '전년 동기(원)'],
              rows: s.rows.map((r) => [r.name, r.sales, r.prevSales]),
            }}
          >
            <BarList
              data={s.rows.slice(0, 6).map((r) => ({ label: r.name, value: r.sales }))}
              layout="horizontal"
              showValues
              format={formatCompactWon}
              unit="원"
              height={260}
              ariaLabel={
                best
                  ? `${s.label} 거래처별 매출. ${best.name} ${formatCompactWon(best.sales)}원으로 가장 많다`
                  : '거래처별 매출'
              }
            />
          </ChartCard>
        </DashboardGridItem>

        {/* 행동할 목록. 표는 카드로 감싸지 않고 화면 바탕에 바로 둔다 */}
        <DashboardGridItem span={12}>
          <SectionHeader
            title="거래처"
            countLabel={`${s.rows.length}곳`}
            description={`${s.label} · 매출 순`}
          >
            <DataGrid
              caption="거래처별 매출"
              rows={s.rows}
              rowKey="id"
              loading={loading}
              error={error ? { message: error, onRetry: reload } : null}
              empty="거래처가 없습니다"
              defaultSort={{ key: 'sales', direction: 'desc' }}
              summary
              columns={[
                { key: 'name', header: '거래처' },
                { key: 'manager', header: '담당', width: 'sm' },
                {
                  key: 'orders',
                  header: '주문',
                  width: 'sm',
                  format: 'number',
                  headerUnit: '건',
                  sortable: true,
                },
                {
                  key: 'sales',
                  header: '매출',
                  width: 'md',
                  format: 'amount',
                  total: 'sum',
                  sortable: true,
                },
                {
                  key: 'share',
                  header: '비중',
                  width: 'md',
                  sortable: true,
                  render: (r) => (
                    <DataBar
                      value={r.share}
                      max={topShare}
                      width={48}
                      format={(v) => formatPercent(v)}
                      label={`${r.name} 비중`}
                    />
                  ),
                },
                {
                  key: 'delta',
                  header: '전년 대비',
                  width: 'sm',
                  format: 'percent',
                  finance: true,
                  sortable: true,
                  render: (r) => signed(r.delta),
                },
                {
                  key: 'status',
                  header: '상태',
                  width: 'sm',
                  render: (r) =>
                    r.status === 'active' ? (
                      <Badge tone="success">거래 중</Badge>
                    ) : (
                      <Badge tone="neutral">거래 중지</Badge>
                    ),
                },
              ]}
            />
          </SectionHeader>
        </DashboardGridItem>
      </DashboardGrid>
    </div>
  );
}
