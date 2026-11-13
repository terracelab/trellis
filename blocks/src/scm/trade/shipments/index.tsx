// 선적 · 통관: 화물마다 단계(선적 예약 → 출항 → 입항 → 통관 → 통관 완료)와 서류
import {
  formatCurrency,
  formatDate,
  SHIPMENT_STATES,
  type ShipmentState,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  Card,
  DescriptionList,
  DueBadge,
  PageHeader,
  Stepper,
  Tabs,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  itemById,
  partyById,
  poAmount,
  PURCHASE_ORDERS,
  SHIPMENTS,
  TODAY,
} from '../../../_data/index.js';
import { Col, Grid, Page } from '../../../_ui/index.js';

/** 연동한 포워더(선적 데이터에서) */
const FORWARDERS = [...new Set(SHIPMENTS.map((s) => s.forwarder))].join(' · ');
const CUSTOMS = SHIPMENTS.filter((s) => s.state === 'customs');
/** 선적 화물 이름: 발주 첫 품목(여럿이면 외) */
const cargoOf = (poId: string) => {
  const po = PURCHASE_ORDERS.find((p) => p.id === poId);
  const first = po?.lines[0];
  if (!po || !first) return '';
  return `${itemById(first.itemId).name}${po.lines.length > 1 ? ' 외' : ''}`;
};

const FLOW: ShipmentState[] = ['booked', 'departed', 'arrived', 'customs', 'cleared'];

export default function Shipments() {
  const [tab, setTab] = useState('open');
  const rows = SHIPMENTS.filter((s) =>
    tab === 'open' ? s.state !== 'cleared' : s.state === 'cleared',
  );
  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '유통·물류' }, { label: '수출입' }]}
          title="선적 · 통관"
          description={`수입 화물 · 포워더 ${FORWARDERS} 연동(하루 3번 갱신)`}
          actions={
            <Button variant="primary" icon="ship">
              선적 등록
            </Button>
          }
          tabs={
            <Tabs
              label="선적 상태"
              value={tab}
              onChange={setTab}
              items={[
                {
                  value: 'open',
                  label: '진행 중',
                  count: SHIPMENTS.filter((s) => s.state !== 'cleared').length,
                },
                {
                  value: 'cleared',
                  label: '통관 완료',
                  count: SHIPMENTS.filter((s) => s.state === 'cleared').length,
                },
              ]}
            />
          }
        />
      }
    >
      {CUSTOMS[0] && (
        <Banner tone="info" title={`통관 진행 중 ${CUSTOMS.length}건`}>
          {CUSTOMS[0].id} {cargoOf(CUSTOMS[0].poId)}
          {CUSTOMS[0].customsNo ? ` · 수입신고 ${CUSTOMS[0].customsNo}` : ''}. 검사 대상이 아니면
          오늘 반출 예정입니다.
        </Banner>
      )}
      <Grid>
        {rows.map((s) => {
          const po = PURCHASE_ORDERS.find((p) => p.id === s.poId)!;
          const at = FLOW.indexOf(s.state);
          return (
            <Col key={s.id} span={6}>
              <Card
                title={`${partyById(po.partyId).name}`}
                subtitle={`${s.id} · ${s.poId} · ${formatCurrency(poAmount(po), po.currency)}`}
                action={
                  <>
                    <Badge tone={SHIPMENT_STATES[s.state].tone}>
                      {SHIPMENT_STATES[s.state].label}
                    </Badge>
                    <DueBadge due={s.eta} today={TODAY} done={at >= 2} doneLabel="입항" size="sm" />
                  </>
                }
              >
                <div className="tl-block-drawer-stack">
                  <Stepper
                    size="sm"
                    steps={FLOW.map((f, i) => ({
                      id: f,
                      label: SHIPMENT_STATES[f].label,
                      state:
                        i < at || s.state === 'cleared' ? 'done' : i === at ? 'current' : 'todo',
                    }))}
                  />
                  <DescriptionList
                    columns={2}
                    items={[
                      { label: 'B/L', value: s.blNo, copyable: true },
                      { label: '선박 · 항차', value: s.vessel },
                      { label: '구간', value: `${s.pol} → ${s.pod}` },
                      { label: '컨테이너', value: s.containers },
                      { label: '출항(ETD)', value: formatDate(s.etd) },
                      { label: '도착 예정(ETA)', value: formatDate(s.eta) },
                      {
                        label: '수입신고 번호',
                        value: s.customsNo ?? '–',
                        copyable: !!s.customsNo,
                      },
                      { label: '포워더', value: s.forwarder },
                    ]}
                  />
                </div>
              </Card>
            </Col>
          );
        })}
      </Grid>
    </Page>
  );
}
