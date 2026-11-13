// 상품 목록(ListDetail): 판매 상태 탭 · 채널 필터 · 판매 스위치 · 선택 일괄 가격 수정 · 상세 Drawer
import { formatAmount, formatPercent, formatQuantity } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  Field,
  FilterBar,
  Input,
  PageHeader,
  QuantityInput,
  SegmentedControl,
  Select,
  StatusDot,
  Switch,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useEffect, useMemo, useState } from 'react';
import {
  CHANNELS,
  channelById,
  discountRate,
  PRODUCT_CATEGORIES,
  PRODUCTS,
  productStock,
  SALE_STATES,
  saleStateOf,
  SYNC_STATES,
  type Product,
} from '../../../_data/commerce.js';
import { availableOf, itemById, RECEIPTS, warehouseById } from '../../../_data/trade.js';
import { useCan, useScreenParams, useScreens } from '../../../_platform/index.js';
import { ExportButton, josa, Lines, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

type Mode = 'rate' | 'up' | 'down';

/** 엑셀 다운로드 열(표와 같은 순서, 금액 · 수량은 서식 없는 숫자) */
const CSV: CsvColumn<Product>[] = [
  { label: '상품 코드', value: 'id' },
  { label: '상품', value: 'name' },
  { label: '분류', value: 'category' },
  { label: '옵션 수', value: (r) => r.skus.length },
  { label: '정가(원)', value: 'listPrice' },
  { label: '할인가(원)', value: 'salePrice' },
  { label: '할인율(%)', value: (r) => discountRate(r.listPrice, r.salePrice) },
  { label: '재고(개)', value: (r) => productStock(r) },
  { label: '판매 채널', value: (r) => r.channels.map((c) => channelById(c).name).join(' · ') },
  { label: '판매 상태', value: (r) => SALE_STATES[saleStateOf(r)].label },
];
const round100 = (v: number) => Math.round(v / 100) * 100;

function Thumb({ p }: { p: Product }) {
  return (
    <span className="tl-block-cm-thumb" data-tone={p.thumbTone} aria-hidden>
      {p.thumb}
    </span>
  );
}

export default function ProductList() {
  const toast = useToast();
  const canEdit = useCan('products', 'update');
  const canCreate = useCan('products', 'create');
  const screens = useScreens();
  const [rows, setRows] = useState<Product[]>(() => PRODUCTS.map((p) => ({ ...p })));
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState<string | null>('all');
  const [category, setCategory] = useState<string | null>('all');
  const [selected, setSelected] = useState<string[]>([]);
  // 주소 ?id=<상품 코드>면 그 상품 서랍을 연다(알림 · 다른 화면에서 열 때)
  const { id: paramId } = useScreenParams();
  const [openId, setOpenId] = useState<string | null>(paramId ?? null);
  useEffect(() => {
    if (paramId) setOpenId(paramId);
  }, [paramId]);
  const [priceOpen, setPriceOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('rate');
  const [rate, setRate] = useState<number | null>(15);
  const [amount, setAmount] = useState<number | null>(1_000);

  const count = (s: string) => rows.filter((r) => saleStateOf(r) === s).length;
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (tab === 'all' || saleStateOf(r) === tab) &&
          (channel === 'all' || r.channels.includes(channel as Product['channels'][number])) &&
          (category === 'all' || r.category === category) &&
          (!q || `${r.id}${r.name}`.includes(q)),
      ),
    [rows, tab, channel, category, q],
  );
  const picked = rows.filter((r) => selected.includes(r.id));
  const open = rows.find((r) => r.id === openId) ?? null;
  const soldout = rows.filter((r) => saleStateOf(r) === 'soldout');
  // 품절 상품의 원 품목이 들어오는 입고(검수 · 도착 · 예정)
  const refill = soldout[0]
    ? RECEIPTS.find(
        (g) =>
          g.state !== 'received' &&
          g.state !== 'rejected' &&
          g.lines.some((l) => l.itemId === soldout[0]!.itemId),
      )
    : undefined;
  const skuCount = rows.reduce((a, r) => a + r.skus.length, 0);

  const nextPrice = (r: Product) => {
    if (mode === 'rate') return round100(r.listPrice * (1 - (rate ?? 0) / 100));
    const d = amount ?? 0;
    return Math.min(r.listPrice, Math.max(0, r.salePrice + (mode === 'up' ? d : -d)));
  };
  const applyPrice = () => {
    const ids = picked.map((r) => r.id);
    setRows((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, salePrice: nextPrice(r) } : r)),
    );
    setSelected([]);
    toast.show({
      title: `상품 ${ids.length}개의 할인가를 수정했습니다`,
      description: '연결된 판매 채널에 바뀐 가격을 보냈습니다',
      tone: 'success',
    });
  };
  const setSelling = (ids: string[], selling: boolean) => {
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, selling } : r)));
    toast.show({
      title: selling
        ? `상품 ${ids.length}개의 판매를 시작했습니다`
        : `상품 ${ids.length}개를 판매 중지했습니다`,
      description: '판매 채널에 상태를 보냈습니다',
      tone: selling ? 'success' : 'neutral',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '이커머스' }, { label: '상품' }]}
          title="상품"
          description={`판매 중 ${count('selling')}개 · 품절 ${count('soldout')}개 · 판매 중지 ${count('stopped')}개 · SKU ${skuCount}개`}
          actions={
            <>
              <ExportButton module="products" name="상품" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              {screens.has('commerce/products/edit') && (
                <Button
                  variant="primary"
                  icon="plus"
                  disabled={!canCreate}
                  onPress={() => screens.go('commerce/products/edit')}
                >
                  상품 등록
                </Button>
              )}
            </>
          }
          tabs={
            <Tabs
              label="판매 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: rows.length },
                { value: 'selling', label: '판매 중', count: count('selling') },
                { value: 'soldout', label: '품절', count: count('soldout') },
                { value: 'stopped', label: '판매 중지', count: count('stopped') },
              ]}
            />
          }
        />
      }
    >
      {soldout.length > 0 && (
        <Banner
          tone="warning"
          title={`품절 상품 ${soldout.length}개`}
          action={
            screens.has('scm/inventory/stock') && (
              <Button size="sm" onPress={() => screens.go('scm/inventory/stock')}>
                재고 보기
              </Button>
            )
          }
        >
          {soldout[0]!.name}: 창고 가용{' '}
          {formatQuantity(availableOf(soldout[0]!.itemId), itemById(soldout[0]!.itemId).unit)}.
          {refill &&
            ` ${warehouseById(refill.warehouseId).name} 입고 검수 ${josa(refill.id, '이/가')} 끝나면 상품 재고를 채웁니다.`}
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="상품명 · 상품 코드"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
            label="상품 검색"
          />
        }
        onReset={() => {
          setQ('');
          setTab('all');
          setChannel('all');
          setCategory('all');
        }}
        resultCount={shown.length}
      >
        <Select
          size="sm"
          width="auto"
          label="판매 채널"
          value={channel}
          onChange={setChannel}
          options={[
            { value: 'all', label: '전체 채널' },
            ...CHANNELS.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          size="sm"
          width="auto"
          label="분류"
          value={category}
          onChange={setCategory}
          options={[
            { value: 'all', label: '전체 분류' },
            ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="상품"
        height="fill"
        rows={shown}
        rowKey="id"
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        onRowPress={(r) => setOpenId(r.id)}
        activeRowKey={openId}
        rowTone={(r) => (saleStateOf(r) === 'soldout' ? 'danger' : undefined)}
        empty="이 조건의 상품이 없습니다. 필터를 바꾸거나 상품 등록에서 추가하세요"
        columns={[
          {
            key: 'name',
            header: '상품',
            width: 'xl',
            sticky: true,
            sortable: true,
            render: (r) => (
              <span className="tl-block-cm-product">
                <Thumb p={r} />
                <DataGridLines
                  primary={r.name}
                  secondary={
                    <>
                      {r.id} · 옵션 {r.skus.length}개 · {r.category}
                    </>
                  }
                />
              </span>
            ),
          },
          {
            key: 'listPrice',
            header: '정가',
            width: 'sm',
            format: 'amount',
            unit: '원',
            sortable: true,
          },
          {
            key: 'salePrice',
            header: '할인가',
            width: 'sm',
            format: 'amount',
            unit: '원',
            sortable: true,
          },
          {
            key: 'rate',
            header: '할인율',
            width: 'xs',
            format: 'percent',
            value: (r) => discountRate(r.listPrice, r.salePrice),
            render: (r) => {
              const d = discountRate(r.listPrice, r.salePrice);
              return d > 0 ? formatPercent(d) : '–';
            },
          },
          {
            key: 'stock',
            header: '재고',
            width: 'md',
            align: 'right',
            value: (r) => productStock(r),
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={
                  productStock(r) === 0 ? (
                    <Badge size="sm" tone="danger">
                      품절
                    </Badge>
                  ) : (
                    formatQuantity(productStock(r), '개')
                  )
                }
                secondary={
                  screens.has('scm/inventory/stock') ? (
                    <a
                      className="tl-block-cm-link tl-focusable"
                      href={screens.href('scm/inventory/stock')}
                    >
                      {r.set
                        ? '구성품 재고'
                        : `창고 가용 ${formatQuantity(availableOf(r.itemId), itemById(r.itemId).unit)}`}
                    </a>
                  ) : (
                    <span>
                      {r.set
                        ? '구성품 재고'
                        : `창고 가용 ${formatQuantity(availableOf(r.itemId), itemById(r.itemId).unit)}`}
                    </span>
                  )
                }
              />
            ),
          },
          {
            key: 'channels',
            header: '판매 채널',
            width: 'xl',
            render: (r) => (
              <span className="tl-block-cm-chips">
                {r.channels.map((c) => (
                  <Badge key={c} size="sm" variant="outline" dot={false}>
                    {channelById(c).name}
                  </Badge>
                ))}
              </span>
            ),
          },
          {
            key: 'selling',
            header: '판매',
            width: 'xs',
            align: 'center',
            render: (r) => (
              <Switch
                size="sm"
                checked={r.selling}
                disabled={!canEdit}
                aria-label={`${r.name} 판매`}
                onChange={(v) => setSelling([r.id], v)}
              />
            ),
          },
        ]}
      />
      {selected.length > 0 && (
        <ActionBar
          summary={`${selected.length}개 선택 · SKU ${picked.reduce((a, r) => a + r.skus.length, 0)}개`}
        >
          <Button onPress={() => setSelected([])}>선택 해제</Button>
          <Button
            icon="circle-pause"
            disabled={!canEdit}
            onPress={() => {
              setSelling(selected, false);
              setSelected([]);
            }}
          >
            판매 중지
          </Button>
          <Button
            variant="primary"
            icon="tag"
            disabled={!canEdit}
            onPress={() => setPriceOpen(true)}
          >
            가격 수정
          </Button>
        </ActionBar>
      )}
      <Dialog
        open={priceOpen}
        onOpenChange={setPriceOpen}
        size="lg"
        title={`상품 ${picked.length}개의 할인가를 수정합니다`}
        description="정가는 그대로 두고 할인가만 바꿉니다. 저장하면 연결된 판매 채널에 바로 보냅니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" onPress={applyPrice}>
                  가격 수정
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <div className="tl-block-cm-price-form">
            <Field label="수정 방식">
              <SegmentedControl
                value={mode}
                onChange={(v) => setMode(v as Mode)}
                options={[
                  { value: 'rate', label: '할인율 적용' },
                  { value: 'up', label: '금액 인상' },
                  { value: 'down', label: '금액 인하' },
                ]}
              />
            </Field>
            {mode === 'rate' ? (
              <Field label="정가 대비 할인율" help="100원 단위로 반올림합니다">
                <QuantityInput value={rate} onChange={setRate} unit="%" min={0} max={90} />
              </Field>
            ) : (
              <Field label={mode === 'up' ? '올릴 금액' : '내릴 금액'} help="정가를 넘지 않습니다">
                <AmountInput value={amount} onChange={setAmount} />
              </Field>
            )}
          </div>
          <DataGrid
            caption="바뀌는 할인가"
            rows={picked.map((r) => ({
              id: r.id,
              name: r.name,
              list: r.listPrice,
              before: r.salePrice,
              after: nextPrice(r),
              rate: discountRate(r.listPrice, nextPrice(r)),
            }))}
            rowKey="id"
            columns={[
              { key: 'name', header: '상품', width: 'lg' },
              { key: 'list', header: '정가', width: 'sm', format: 'amount', unit: '원' },
              { key: 'before', header: '현재 할인가', width: 'md', format: 'amount', unit: '원' },
              { key: 'after', header: '바뀔 할인가', width: 'md', format: 'amount', unit: '원' },
              { key: 'rate', header: '할인율', width: 'sm', format: 'percent' },
            ]}
          />
        </div>
      </Dialog>
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.name ?? ''}
        description={open ? `${open.id} · ${open.category} · 수정 ${open.updatedAt}` : ''}
        width="lg"
        actions={
          open && (
            <Badge tone={SALE_STATES[saleStateOf(open)].tone}>
              {SALE_STATES[saleStateOf(open)].label}
            </Badge>
          )
        }
        footer={
          open && (
            <>
              <Button icon="external-link">{channelById('own').name}에서 보기</Button>
              {screens.has('commerce/products/edit') && (
                <Button
                  variant="primary"
                  icon="pencil"
                  disabled={!canEdit}
                  onPress={() => screens.go('commerce/products/edit')}
                >
                  상품 수정
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.stopNote && <Banner tone="neutral">{open.stopNote}</Banner>}
            <DescriptionList
              columns={2}
              items={[
                { label: '정가', value: `${formatAmount(open.listPrice)}원` },
                {
                  label: '할인가',
                  value: `${formatAmount(open.salePrice)}원 · ${formatPercent(discountRate(open.listPrice, open.salePrice))}`,
                },
                {
                  label: '연결 품목',
                  value: `${itemById(open.itemId).code} ${itemById(open.itemId).name}`,
                },
                {
                  label: '배송',
                  value: `${open.shipping} 배송 · ${warehouseById(open.warehouseId).name}`,
                },
              ]}
            />
            <DataGrid
              caption="옵션 · SKU"
              rows={open.skus.map((s) => ({ ...s, price: open.salePrice + s.extra }))}
              rowKey="code"
              summary
              columns={[
                {
                  key: 'code',
                  header: 'SKU',
                  width: 'md',
                  render: (s) => <span className="tl-block-code">{s.code}</span>,
                },
                { key: 'option', header: '옵션', width: 'md' },
                { key: 'price', header: '판매가', width: 'sm', format: 'amount', unit: '원' },
                {
                  key: 'stock',
                  header: '재고',
                  width: 'sm',
                  format: 'quantity',
                  unit: '개',
                  total: 'sum',
                },
              ]}
            />
            <ul className="tl-block-cm-channel-list" aria-label="판매 채널 연동">
              {CHANNELS.map((c) => {
                const on = open.channels.includes(c.id);
                return (
                  <li key={c.id}>
                    <Lines
                      primary={c.name}
                      secondary={
                        <>
                          수수료 {formatPercent(c.feeRate)} · 동기화 {c.sync.lastSyncAt.slice(11)}
                        </>
                      }
                    />
                    {on ? (
                      <StatusDot tone={SYNC_STATES[c.sync.state].tone}>
                        {SYNC_STATES[c.sync.state].label}
                      </StatusDot>
                    ) : (
                      <StatusDot tone="neutral">판매 안 함</StatusDot>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Drawer>
    </Page>
  );
}
