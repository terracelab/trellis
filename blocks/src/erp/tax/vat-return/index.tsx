// 부가세 신고(TaxFiling): 신고서 칸 번호 그대로, 계산 칸은 읽기 전용, 기한 D-day는 위에 고정
import { FILING_STATES, formatAmount, formatDate } from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  Card,
  CheckboxGroup,
  DataGrid,
  DueBadge,
  KpiCard,
  PageHeader,
  Stepper,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import { VAT_RETURN } from '../../../_data/erp.js';
import { SHIPMENTS, TODAY } from '../../../_data/index.js';
import { useCan } from '../../../_platform/index.js';
import { Col, Grid, Page, Stack } from '../../../_ui/index.js';

const V = VAT_RETURN;
const SALES = V.sales;
const PURCHASE = V.purchase;
const salesTax = SALES.reduce((a, r) => a + r.tax, 0);
const purchaseTax = PURCHASE.reduce((a, r) => a + r.tax, 0);
const noRange = (rows: readonly { no: string }[]) => `칸 ${rows[0]?.no} ~ ${rows.at(-1)?.no} 합계`;
/** 통관 중인 수입 화물(끝나야 수입 세금계산서가 나온다) */
const CUSTOMS = SHIPMENTS.find((s) => s.state === 'customs');

const CHECKS = [
  { value: 'card', label: '카드 매입 대사', description: V.checks.card },
  { value: 'import', label: '수입 세금계산서 확인', description: V.checks.import },
  { value: 'deduct', label: '불공제 매입 분류', description: V.checks.deduct },
];

export default function VatReturn() {
  const canFile = useCan('tax', 'approve');
  const [checks, setChecks] = useState<string[]>(['card']);
  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '세무' }, { label: '부가세 신고' }]}
          title={`${V.year}년 ${V.term}기 ${V.kind} 신고`}
          meta={
            <>
              <Badge tone={FILING_STATES.review.tone}>{FILING_STATES.review.label}</Badge>
              <DueBadge due={V.due} today={TODAY} warnDays={14} />
            </>
          }
          description={`과세 기간 ${V.period.from}~${V.period.to.slice(5)} · 신고 기한 ${V.due.slice(0, 4)}년 ${formatDate(V.due, 'md')} · 지금은 ${V.throughMonth}월까지 자료로 미리 계산합니다`}
          actions={
            <>
              <Button icon="download">전자신고 파일</Button>
              <Button
                variant="primary"
                icon="circle-check"
                disabled={!canFile || checks.length < CHECKS.length}
              >
                신고 완료 처리
              </Button>
            </>
          }
        />
      }
    >
      <Card>
        <Stepper
          steps={[
            {
              id: 'collect',
              label: '자료 수집',
              description: '세금계산서 · 카드 · 수입',
              state: 'done',
            },
            { id: 'review', label: '검토', description: '불공제 · 누락', state: 'current' },
            { id: 'draft', label: '신고서 작성', state: 'todo' },
            { id: 'file', label: '전자 신고', state: 'todo' },
            { id: 'pay', label: '납부', state: 'todo' },
          ]}
        />
      </Card>
      <Grid>
        <Col span={4}>
          <KpiCard
            label="매출세액"
            value={salesTax}
            format="amount"
            unit="원"
            caption={noRange(SALES)}
          />
        </Col>
        <Col span={4}>
          <KpiCard
            label="매입세액(공제)"
            value={purchaseTax}
            format="amount"
            unit="원"
            caption={noRange(PURCHASE)}
          />
        </Col>
        <Col span={4}>
          <KpiCard
            label="납부할 세액"
            value={salesTax - purchaseTax}
            format="amount"
            unit="원"
            caption="예정고지 세액 차감 전"
          />
        </Col>
        <Col span={8}>
          <Stack>
            <Card
              title="매출세액"
              subtitle="신고서 칸 번호 그대로 · 계산 칸은 수정할 수 없습니다"
              padding="none"
            >
              <DataGrid
                caption="매출세액"
                className="tl-block-flat-grid"
                rows={SALES}
                rowKey="no"
                summary
                columns={[
                  { key: 'no', header: '칸', width: 'xs', align: 'center' },
                  { key: 'name', header: '구분' },
                  {
                    key: 'supply',
                    header: '공급가액',
                    width: 'lg',
                    format: 'amount',
                    total: 'sum',
                  },
                  { key: 'tax', header: '세액', width: 'lg', format: 'amount', total: 'sum' },
                ]}
              />
            </Card>
            <Card title="매입세액" padding="none">
              <DataGrid
                caption="매입세액"
                className="tl-block-flat-grid"
                rows={PURCHASE}
                rowKey="no"
                summary
                columns={[
                  { key: 'no', header: '칸', width: 'xs', align: 'center' },
                  { key: 'name', header: '구분' },
                  {
                    key: 'supply',
                    header: '공급가액',
                    width: 'lg',
                    format: 'amount',
                    total: 'sum',
                  },
                  { key: 'tax', header: '세액', width: 'lg', format: 'amount', total: 'sum' },
                ]}
              />
            </Card>
          </Stack>
        </Col>
        <Col span={4}>
          <Card title="신고 전 확인" subtitle="모두 확인해야 신고 완료 처리할 수 있습니다">
            <Stack>
              <CheckboxGroup
                label="신고 전 확인"
                value={checks}
                onChange={setChecks}
                options={CHECKS}
              />
              {!checks.includes('import') && (
                <Banner tone="info">
                  수입 세금계산서는 통관 완료 뒤 세관에서 발행됩니다.{' '}
                  {CUSTOMS
                    ? `${CUSTOMS.id} 통관이 끝나면 다시 확인하세요.`
                    : '통관이 끝나면 다시 확인하세요.'}
                </Banner>
              )}
              <p className="tl-block-muted">
                예상 납부 세액 {formatAmount(salesTax - purchaseTax)}원
              </p>
            </Stack>
          </Card>
        </Col>
      </Grid>
    </Page>
  );
}
