// 매출 분석(Dashboard): 전년 동기 대비 KPI · 월별 매출과 이익률 · 거래처 · 분류 구성 · 상위 품목
import {
  formatAmount,
  formatCompactWon,
  formatPercent,
  formatQuantity,
} from '@terracelab/trellis-contracts';
import {
  BarList,
  Card,
  ChartCard,
  ComboChart,
  DataBar,
  DataGrid,
  DataGridLines,
  Donut,
  KpiCard,
  PageHeader,
  SegmentedControl,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import { CATEGORIES, CUSTOMER_MIX, ITEM_MIX, mixOf, SALES_MONTHS } from '../../../_data/erp.js';
import { itemById, sum } from '../../../_data/index.js';
import { Col, ExportButton, Grid, josa, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

const SERIES = ['series-1', 'series-2', 'series-3', 'series-4', 'series-5'] as const;
const pct = (a: number, b: number) => Math.round(((a - b) / b) * 1000) / 10;
/** 축 글자: 억 단위 소수 한 자리(눈금 16.5억이 17억으로 반올림되지 않게) */
const eok = (v: number) => (v ? `${formatAmount(v / 1e8, { digits: 1 })}억` : '0');
const signed = (v: number) => `${formatAmount(v, { digits: 1, sign: 'always' })}%`;

const now = SALES_MONTHS[SALES_MONTHS.length - 1]!;
const ytd = sum(SALES_MONTHS, (m) => m.sales);
const prevYtd = sum(SALES_MONTHS, (m) => m.prevSales);
const gp = sum(SALES_MONTHS, (m) => m.gp);
const prevGp = sum(SALES_MONTHS, (m) => m.prevGp);
const margin = (gp / ytd) * 100;
const prevMargin = (prevGp / prevYtd) * 100;

/** 기간 이름: 데이터 마지막 달(11월) · 올해(2026) · 전년(2025) */
const LAST = SALES_MONTHS[SALES_MONTHS.length - 1]!;
const MONTH = LAST.label;
const YEAR = Number(LAST.month.slice(0, 4));
const RANGE = `${SALES_MONTHS[0]!.label.replace('월', '')}~${MONTH}`;

export default function SalesAnalysis() {
  const [period, setPeriod] = useState('ytd');
  const total = period === 'ytd' ? ytd : now.sales;
  const prevTotal = period === 'ytd' ? prevYtd : now.prevSales;
  const label = period === 'ytd' ? `${RANGE} 누계` : MONTH;
  const customers = mixOf(CUSTOMER_MIX, total, prevTotal);
  const items = mixOf(ITEM_MIX, total, prevTotal)
    .map((m) => {
      const it = itemById(m.itemId);
      return {
        ...m,
        it,
        qty: Math.round(m.amount / it.price),
        share: Math.round((m.amount / total) * 1000) / 10,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .map((m, i) => ({ ...m, rank: i + 1 }));
  const categories = CATEGORIES.map((c, i) => {
    const of = items.filter((it) => it.category === c);
    const value = sum(of, (it) => it.amount);
    const prev = sum(of, (it) => it.prev);
    return { label: c, value, prev, delta: pct(value, prev), color: SERIES[i]! };
  });
  const topShare = Math.max(...items.map((i) => i.share));
  /** 엑셀 다운로드 열: 상위 품목 표(지금 기간), 금액 · 수량 · 비율은 서식 없는 숫자 */
  const csv: CsvColumn<(typeof items)[number]>[] = [
    { label: '순위', value: 'rank' },
    { label: '품목 코드', value: (r) => r.it.code },
    { label: '품목', value: (r) => r.it.name },
    { label: '분류', value: 'category' },
    { label: '수량', value: 'qty' },
    { label: '단위', value: (r) => r.it.unit },
    { label: '매출(원)', value: 'amount' },
    { label: '전년 동기(원)', value: 'prev' },
    { label: '비중(%)', value: 'share' },
    { label: '전년 대비(%)', value: 'delta' },
  ];
  const top = categories.reduce((a, b) => (b.value > a.value ? b : a));
  const best = customers.reduce((a, b) => (b.amount > a.amount ? b : a));

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '영업' }, { label: '매출 분석' }]}
          title="매출 분석"
          description={`${YEAR}년 ${RANGE} · 공급가액 기준 · 전년 동기와 비교`}
          actions={
            <>
              <SegmentedControl
                label="기간"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: 'month', label: MONTH },
                  { value: 'ytd', label: `${RANGE} 누계` },
                ]}
              />
              <ExportButton
                module="sales"
                name={`매출 분석 상위 품목 ${label}`}
                rows={items}
                columns={csv}
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
            label={`${MONTH} 매출`}
            value={now.sales}
            format="amount"
            unit="원"
            delta={{ value: pct(now.sales, now.prevSales), label: '전년 동월 대비' }}
            icon="trending-up"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={`${RANGE} 누계 매출`}
            value={ytd}
            format="amount"
            unit="원"
            delta={{ value: pct(ytd, prevYtd), label: '전년 동기 대비' }}
            icon="chart-bar"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="누계 매출 총이익"
            value={gp}
            format="amount"
            unit="원"
            delta={{ value: pct(gp, prevGp), label: '전년 동기 대비' }}
            icon="coins"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="누계 매출 총이익률"
            value={Math.round(margin * 10) / 10}
            format="percent"
            caption={`전년 동기 ${formatPercent(prevMargin)} · ${formatAmount(margin - prevMargin, { digits: 1, sign: 'always' })}%p`}
            icon="percent"
          />
        </Col>

        <Col span={8}>
          <ChartCard
            title="월별 매출"
            subtitle={`원 · 막대는 ${YEAR}년, 점선은 전년 동월 · 아래는 매출 총이익률(%)`}
            legend={[
              { label: `${YEAR}년 매출`, color: 'series-1' },
              { label: `${YEAR - 1}년 매출`, color: 'compare', shape: 'dashed' },
              { label: '매출 총이익률', color: 'series-3', shape: 'line' },
            ]}
            height={300}
            table={{
              columns: ['월', `${YEAR}년(원)`, `${YEAR - 1}년(원)`, '증감(%)', '이익률(%)'],
              rows: SALES_MONTHS.map((m) => [
                m.label,
                m.sales,
                m.prevSales,
                pct(m.sales, m.prevSales),
                m.margin,
              ]),
            }}
          >
            <ComboChart
              data={SALES_MONTHS}
              x="label"
              bars={[{ key: 'sales', label: `${YEAR}년 매출`, color: 'series-1' }]}
              lines={[
                { key: 'prevSales', label: `${YEAR - 1}년 매출`, color: 'compare', dashed: true },
              ]}
              unit="원"
              yFormat={eok}
              height={210}
              lower={{
                series: [
                  { key: 'margin', label: '매출 총이익률', type: 'line', color: 'series-3' },
                ],
                unit: '%',
                height: 72,
                yFormat: (v) => formatPercent(v, 0),
              }}
              ariaLabel={`${YEAR}년 ${RANGE} 월별 매출. ${SALES_MONTHS[0]!.label} ${formatCompactWon(SALES_MONTHS[0]!.sales)}원에서 ${MONTH} ${formatCompactWon(now.sales)}원`}
            />
          </ChartCard>
        </Col>
        <Col span={4}>
          <ChartCard
            title="거래처별 매출"
            subtitle={`원 · ${label} · ${best.label} ${formatPercent((best.amount / total) * 100)}`}
            height={300}
            table={{
              columns: ['거래처', '매출(원)', '전년 동기(원)', '증감(%)'],
              rows: customers.map((c) => [c.label, c.amount, c.prev, c.delta]),
            }}
          >
            <BarList
              data={customers.map((c) => ({ label: c.label, value: c.amount }))}
              layout="horizontal"
              showValues
              format={formatCompactWon}
              unit="원"
              height={280}
              ariaLabel={`${label} 거래처별 매출. ${best.label}이 ${formatCompactWon(best.amount)}원으로 가장 많다`}
            />
          </ChartCard>
        </Col>

        <Col span={8}>
          <Card
            title="상위 품목"
            subtitle={`${label} · 매출 순 · 전년 동기 대비 증감`}
            padding="none"
          >
            <DataGrid
              caption="상위 품목"
              className="tl-block-sa-flat"
              rows={items}
              rowKey="itemId"
              summary
              columns={[
                { key: 'rank', header: '순위', width: 'xs', align: 'center' },
                {
                  key: 'itemId',
                  header: '품목',
                  render: (r) => (
                    <DataGridLines
                      primary={r.it.name}
                      secondary={
                        <>
                          {r.it.code} · {r.category}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'qty',
                  header: '수량',
                  width: 'sm',
                  format: 'number',
                  sortable: true,
                  render: (r) => formatQuantity(r.qty, r.it.unit),
                },
                {
                  key: 'amount',
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
                  render: (r) => (
                    <DataBar
                      value={r.share}
                      max={topShare}
                      width={48}
                      format={(v) => formatPercent(v)}
                      label={`${r.it.name} 비중`}
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
              ]}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card title="분류별 구성" subtitle={`원 · ${label} · 전년 동기 대비`}>
            <div className="tl-block-sa-mix">
              <Donut
                data={categories.map((c) => ({ label: c.label, value: c.value, color: c.color }))}
                unit="원"
                height={200}
                legend={false}
                format={formatCompactWon}
                centerLabel={label}
                centerValue={`${formatCompactWon(total)}원`}
                ariaLabel={`${label} 분류별 매출. ${josa(top.label, '이/가')} ${formatPercent((top.value / total) * 100)}로 가장 크다`}
              />
              <ul className="tl-block-sa-legend" aria-label="분류별 매출">
                {categories.map((c) => (
                  <li key={c.label} className="tl-block-sa-legend__row">
                    <span className="tl-block-sa-legend__swatch" data-color={c.color} />
                    <span className="tl-block-sa-legend__label">{c.label}</span>
                    <span className="tl-block-sa-legend__num">{formatCompactWon(c.value)}원</span>
                    <span className="tl-block-sa-legend__num">
                      {formatPercent((c.value / total) * 100)}
                    </span>
                    <span
                      className="tl-block-sa-legend__num"
                      data-dir={c.delta > 0 ? 'up' : c.delta < 0 ? 'down' : undefined}
                    >
                      {signed(c.delta)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Col>
      </Grid>
    </Page>
  );
}
