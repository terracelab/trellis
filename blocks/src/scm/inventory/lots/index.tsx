// 로트 · 유통기한: 남은 날이 짧은 로트부터(선입선출 · 선만료선출)
import { dueDays, formatDate, formatQuantity } from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  DataGrid,
  DataGridLines,
  DueBadge,
  FilterBar,
  PageHeader,
  Select,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import { itemById, STOCK, TODAY, warehouseById, WAREHOUSES } from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { ExportButton, Page, type CsvColumn } from '../../../_ui/index.js';

/** 유통기한 주의 기준(남은 날) */
const WARN = PROFILE.lotWarnDays;

const LOTS = STOCK.flatMap((s) =>
  s.lots.map((l) => ({
    key: `${s.itemId}-${l.lot}`,
    ...l,
    itemId: s.itemId,
    warehouseId: s.warehouseId,
    days: l.expiry ? dueDays(l.expiry, TODAY) : 9999,
  })),
).sort((a, b) => a.days - b.days);
type Lot = (typeof LOTS)[number];

/** 엑셀 다운로드 열(남은 날이 짧은 순서 그대로, 수량은 서식 없는 숫자) */
const CSV: CsvColumn<Lot>[] = [
  { label: '로트', value: 'lot' },
  { label: '품목 코드', value: (l) => itemById(l.itemId).code },
  { label: '품목', value: (l) => itemById(l.itemId).name },
  { label: '규격', value: (l) => itemById(l.itemId).spec },
  { label: '창고', value: (l) => warehouseById(l.warehouseId).name },
  { label: '수량', value: 'qty' },
  { label: '단위', value: (l) => itemById(l.itemId).unit },
  { label: '입고일', value: 'receivedAt' },
  { label: '유통기한', value: (l) => l.expiry ?? '' },
  { label: '남은 날', value: (l) => (l.expiry ? l.days : null) },
];

export default function Lots() {
  const [wh, setWh] = useState<string | null>('all');
  const rows = LOTS.filter((l) => (wh === 'all' || !wh || l.warehouseId === wh) && l.qty > 0);
  const soon = rows.filter((l) => l.days <= WARN);
  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '유통·물류' }, { label: '재고' }, { label: '로트' }]}
          title="로트 · 유통기한"
          description={`남은 날이 짧은 로트부터 출고합니다. ${WARN}일 이내는 주의, 지나면 출고 금지`}
          actions={
            <ExportButton module="inventory" name="로트 · 유통기한" rows={rows} columns={CSV}>
              엑셀 다운로드
            </ExportButton>
          }
        />
      }
    >
      {soon.length > 0 && (
        <Banner tone="warning" title={`유통기한 ${WARN}일 이내 ${soon.length}로트`}>
          {soon
            .map(
              (l) =>
                `${l.lot} ${itemById(l.itemId).name} ${formatQuantity(l.qty, itemById(l.itemId).unit)} · ${formatDate(l.expiry!, 'md')}`,
            )
            .join(' / ')}
          . 할인 판매나 우선 출고를 검토하세요.
        </Banner>
      )}
      <FilterBar resultCount={rows.length}>
        <Select
          size="sm"
          width="auto"
          label="창고"
          value={wh}
          onChange={setWh}
          options={[
            { value: 'all', label: '창고 전체' },
            ...WAREHOUSES.filter((w) => LOTS.some((l) => l.warehouseId === w.id)).map((w) => ({
              value: w.id,
              label: w.name,
            })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="로트"
        height="fill"
        rows={rows}
        rowKey="key"
        rowTone={(l) => (l.days < 0 ? 'danger' : l.days <= WARN ? 'warning' : undefined)}
        columns={[
          {
            key: 'lot',
            header: '로트',
            width: 'md',
            render: (l) => <span className="tl-block-code">{l.lot}</span>,
          },
          {
            key: 'item',
            header: '품목',
            render: (l) => (
              <DataGridLines
                primary={itemById(l.itemId).name}
                secondary={
                  <>
                    {itemById(l.itemId).code} · {itemById(l.itemId).spec}
                  </>
                }
              />
            ),
          },
          {
            key: 'wh',
            header: '창고',
            width: 'lg',
            render: (l) => warehouseById(l.warehouseId).name,
          },
          {
            key: 'qty',
            header: '수량',
            width: 'sm',
            align: 'right',
            render: (l) => formatQuantity(l.qty, itemById(l.itemId).unit),
          },
          { key: 'receivedAt', header: '입고일', width: 'sm', format: 'date' },
          { key: 'expiry', header: '유통기한', width: 'sm', format: 'date' },
          {
            key: 'days',
            header: '남은 날',
            width: 'sm',
            render: (l) =>
              l.expiry ? <DueBadge due={l.expiry} today={TODAY} warnDays={WARN} size="sm" /> : '–',
          },
          {
            key: 'fifo',
            header: '출고 순서',
            width: 'sm',
            render: (l) =>
              rows.filter((x) => x.itemId === l.itemId)[0]?.key === l.key ? (
                <Badge tone="info">먼저</Badge>
              ) : (
                <Badge tone="neutral">다음</Badge>
              ),
          },
        ]}
      />
    </Page>
  );
}
