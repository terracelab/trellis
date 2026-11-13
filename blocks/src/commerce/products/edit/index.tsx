// 상품 등록(FormRegister): 기본 정보 · 가격(할인율 실시간) · 옵션 조합 → SKU · 이미지 · 상세 설명 · 배송 · 채널 노출
import { formatAmount, formatPercent, formatQuantity } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  Badge,
  Banner,
  Button,
  Card,
  CheckboxGroup,
  CodeSearch,
  Dialog,
  DialogClose,
  Field,
  FileUpload,
  FormSection,
  Input,
  PageHeader,
  QuantityInput,
  Select,
  SelectableCard,
  Switch,
  Textarea,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  CHANNELS,
  discountRate,
  FREE_SHIPPING_OVER,
  PRODUCT_CATEGORIES,
  PRODUCT_DRAFT,
  SHIPPING_FEE,
  type ChannelId,
  type OptionAxis,
} from '../../../_data/commerce.js';
import { PROFILE } from '../../../_data/profile.js';
import { isGoods, ITEMS, itemById, warehouseById, WAREHOUSES } from '../../../_data/trade.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import { Figure, josa, Page, Stack } from '../../../_ui/index.js';
import './style.css';

// slot: options — 옵션 두 축(중량 · 포장 같은). 값과 SKU 코드는 데이터(PRODUCT_DRAFT)에서 온다
const [AXIS_A, AXIS_B] = PRODUCT_DRAFT.options;
const PRODUCT_ID = PRODUCT_DRAFT.id;
const METHODS = PROFILE.shipping.methods;

interface SkuRow {
  code: string;
  /** 첫째 축 값(중량 등) */
  a: string;
  /** 둘째 축 값(포장 등) */
  b: string;
  extra: number | null;
  stock: number | null;
  selling: boolean;
}

type OptionValue = OptionAxis['values'][number];
const makeRow = (x: OptionValue, y: OptionValue): SkuRow => {
  const stock = PRODUCT_DRAFT.stock[`${x.code}${y.code}`] ?? 0;
  return {
    code: `${PRODUCT_ID}-${x.code}${y.code}`,
    a: x.value,
    b: y.value,
    extra: x.extra + y.extra,
    stock,
    selling: stock > 0,
  };
};

const goodsItems = ITEMS.filter(isGoods);
const CUTOFFS = [...new Set(['12:00', '14:00', '15:00', '16:00', PROFILE.shipping.cutoff])].sort();
const AXES = `${AXIS_A.label}${josa(AXIS_A.label, '과/와').slice(AXIS_A.label.length)} ${josa(AXIS_B.label, '을/를')}`;

export default function ProductEdit() {
  const toast = useToast();
  const canCreate = useCan('products', 'create');
  const screens = useScreens();
  const [name, setName] = useState(PRODUCT_DRAFT.name);
  const [category, setCategory] = useState<string | null>(PRODUCT_DRAFT.category);
  const [itemId, setItemId] = useState<string | null>(PRODUCT_DRAFT.itemId);
  const [tax, setTax] = useState<string | null>(PRODUCT_DRAFT.tax);
  const [listPrice, setListPrice] = useState<number | null>(PRODUCT_DRAFT.listPrice);
  const [salePrice, setSalePrice] = useState<number | null>(PRODUCT_DRAFT.salePrice);
  const [weights, setWeights] = useState<string[]>(() => AXIS_A.values.map((v) => v.value));
  const [packs, setPacks] = useState<string[]>(() => AXIS_B.values.map((v) => v.value));
  const [skus, setSkus] = useState<SkuRow[]>(() =>
    AXIS_A.values.flatMap((x) => AXIS_B.values.map((y) => makeRow(x, y))),
  );
  const [files, setFiles] = useState(() =>
    PRODUCT_DRAFT.files.map((f) => ({ ...f, status: 'done' as const })),
  );
  const [description, setDescription] = useState(PRODUCT_DRAFT.description);
  const [shipMethod, setShipMethod] = useState<string | null>(PRODUCT_DRAFT.shipMethod);
  const [warehouseId, setWarehouseId] = useState<string | null>(PRODUCT_DRAFT.warehouseId);
  const [cutoff, setCutoff] = useState<string | null>(PROFILE.shipping.cutoff);
  const [fee, setFee] = useState<number | null>(SHIPPING_FEE);
  const [freeOver, setFreeOver] = useState<number | null>(FREE_SHIPPING_OVER);
  const [remoteFee, setRemoteFee] = useState<number | null>(PRODUCT_DRAFT.remoteFee);
  const [channels, setChannels] = useState<ChannelId[]>(() => [...PRODUCT_DRAFT.channels]);
  const [tried, setTried] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const item = itemId ? itemById(itemId) : null;
  const method = METHODS.find((m) => m.value === shipMethod);
  // 배송 방법이 정한 출고지와 다른 창고를 고르면 알린다(냉동은 냉동 창고에서 등)
  const methodWarehouse = method?.warehouseId ? warehouseById(method.warehouseId) : null;
  const picked = warehouseId ? warehouseById(warehouseId) : null;
  const list = listPrice ?? 0;
  const sale = salePrice ?? 0;
  const discount = Math.max(0, list - sale);
  const avgFee = channels.length
    ? CHANNELS.filter((c) => channels.includes(c.id)).reduce((a, c) => a + c.feeRate, 0) /
      channels.length
    : 0;
  const priceError = sale > list ? '판매가는 정가보다 클 수 없습니다' : null;
  const rows = skus.filter((s) => weights.includes(s.a) && packs.includes(s.b));
  const selling = rows.filter((s) => s.selling);
  const stockSum = rows.reduce((a, s) => a + (s.stock ?? 0), 0);
  const errors = {
    name: !name.trim() ? '상품명을 입력하세요' : null,
    item: !item ? '연결 품목을 고르세요' : null,
    sku: selling.length === 0 ? '판매할 SKU를 하나 이상 켜세요' : null,
    channel: channels.length === 0 ? '판매 채널을 하나 이상 고르세요' : null,
  };
  const valid = !priceError && Object.values(errors).every((e) => e === null);
  const setSku = (code: string, patch: Partial<SkuRow>) =>
    setSkus((all) => all.map((s) => (s.code === code ? { ...s, ...patch } : s)));

  return (
    <Page
      width="form"
      header={
        <PageHeader
          breadcrumbs={[
            { label: '이커머스' },
            {
              label: '상품',
              ...(screens.has('commerce/products/list')
                ? { href: screens.href('commerce/products/list') }
                : {}),
            },
            { label: '등록' },
          ]}
          title="상품 등록"
          meta={<Badge tone="neutral">작성 중</Badge>}
          description="옵션을 고르면 조합마다 SKU가 만들어집니다. 등록하면 고른 판매 채널에 상품을 보냅니다"
        />
      }
    >
      <Card>
        <Stack gap="lg">
          <FormSection title="기본 정보" columns={3}>
            <Field label="상품명" required span={2} error={tried ? errors.name : null}>
              <Input value={name} onChange={setName} maxLength={50} />
            </Field>
            <Field label="상품 코드" help="등록할 때 매깁니다">
              <Input value={PRODUCT_ID} readOnly />
            </Field>
            <Field label="분류" required>
              <Select
                value={category}
                onChange={setCategory}
                options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field
              label="연결 품목"
              required
              help="재고와 원가를 이 품목에서 가져옵니다"
              error={tried ? errors.item : null}
            >
              <CodeSearch
                value={item?.code ?? null}
                onChange={(code) => setItemId(goodsItems.find((i) => i.code === code)?.id ?? null)}
                options={goodsItems.map((i) => ({ value: i.code, label: i.name, meta: i.spec }))}
              />
            </Field>
            <Field label="과세 구분" required>
              <Select
                value={tax}
                onChange={setTax}
                options={PROFILE.taxTypes.map((t) => ({ value: t.value, label: t.label }))}
              />
            </Field>
            <Field label="원산지">
              <Input value={item?.origin ?? ''} readOnly />
            </Field>
            <Field label="유통기한">
              <Input
                value={item?.shelfLifeDays ? `제조일로부터 ${item.shelfLifeDays}일` : ''}
                readOnly
              />
            </Field>
            <Field label="보관 방법">
              <Input value={method?.storage ?? ''} readOnly />
            </Field>
          </FormSection>

          <FormSection
            title="가격"
            columns={3}
            description="할인 금액을 바꾸면 판매가가, 판매가를 바꾸면 할인 금액이 따라 바뀝니다"
          >
            <Field label="정가" required>
              <AmountInput value={listPrice} onChange={setListPrice} />
            </Field>
            <Field label="할인 금액">
              <AmountInput
                value={discount}
                onChange={(v) => setSalePrice(Math.max(0, list - (v ?? 0)))}
                max={list}
              />
            </Field>
            <Field label="판매가" required error={priceError}>
              <AmountInput value={salePrice} onChange={setSalePrice} />
            </Field>
          </FormSection>
          <div className="tl-block-cm-figures">
            <Figure label="판매가" value={formatAmount(sale)} unit="원" />
            <Figure label="할인 금액" value={formatAmount(discount)} unit="원" />
            <Figure label="할인율" value={formatPercent(discountRate(list, sale))} />
            <Figure
              label="정산 예상"
              value={formatAmount(Math.round(sale * (1 - avgFee / 100)))}
              unit="원"
            />
            <p className="tl-block-cm-figures__note">
              정산 예상은 고른 판매 채널 {channels.length}곳의 평균 수수료 {formatPercent(avgFee)}를
              뺀 금액입니다.
            </p>
          </div>

          <FormSection
            title="옵션"
            columns={1}
            description={`${AXES} 고르면 조합마다 SKU가 만들어집니다. 추가 금액은 판매가에 더합니다`}
          >
            <div className="tl-block-cm-option-groups">
              <Field label={AXIS_A.label} layout="horizontal">
                <CheckboxGroup
                  orientation="horizontal"
                  value={weights}
                  onChange={setWeights}
                  options={AXIS_A.values.map((w) => ({ value: w.value, label: w.value }))}
                />
              </Field>
              <Field label={AXIS_B.label} layout="horizontal">
                <CheckboxGroup
                  orientation="horizontal"
                  value={packs}
                  onChange={setPacks}
                  options={AXIS_B.values.map((p) => ({ value: p.value, label: p.value }))}
                />
              </Field>
            </div>
            {tried && errors.sku && <Banner tone="danger">{errors.sku}</Banner>}
            <div className="tl-block-cm-skus" role="table" aria-label="SKU">
              <div className="tl-block-cm-skus__head" role="row">
                <span role="columnheader">SKU</span>
                <span role="columnheader">옵션</span>
                <span role="columnheader">추가 금액</span>
                <span role="columnheader">판매가</span>
                <span role="columnheader">재고</span>
                <span role="columnheader">판매</span>
              </div>
              {rows.map((s) => (
                <div
                  key={s.code}
                  className="tl-block-cm-skus__row"
                  role="row"
                  data-off={!s.selling || undefined}
                >
                  <span role="cell" className="tl-block-code">
                    {s.code}
                  </span>
                  <span role="cell">
                    {s.a} · {s.b}
                  </span>
                  <span role="cell">
                    <AmountInput
                      size="sm"
                      label={`${s.a} ${s.b} 추가 금액`}
                      value={s.extra}
                      onChange={(v) => setSku(s.code, { extra: v })}
                      allowNegative
                    />
                  </span>
                  <span role="cell" className="tl-block-cm-skus__num">
                    {formatAmount(sale + (s.extra ?? 0), { unit: '원' })}
                  </span>
                  <span role="cell">
                    <QuantityInput
                      size="sm"
                      label={`${s.a} ${s.b} 재고`}
                      value={s.stock}
                      onChange={(v) => setSku(s.code, { stock: v })}
                      unit="개"
                      showStepper={false}
                    />
                  </span>
                  <span role="cell" className="tl-block-cm-skus__switch">
                    <Switch
                      size="sm"
                      checked={s.selling}
                      onChange={(v) => setSku(s.code, { selling: v })}
                      aria-label={`${s.a} ${s.b} 판매`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="이미지 · 상세 설명" columns={2}>
            <Field label="상품 이미지" help="첫 장이 대표 이미지입니다">
              <FileUpload
                accept="image/*"
                multiple
                maxSize={10_485_760}
                hint="JPG · PNG, 한 장에 10MB 이하 · 1000×1000 권장"
                files={files}
                onFilesChange={(added) =>
                  setFiles((fs) => [
                    ...fs,
                    ...added.map((f) => ({ name: f.name, size: f.size, status: 'done' as const })),
                  ])
                }
                onRemove={(n) => setFiles((fs) => fs.filter((f) => f.name !== n))}
              />
            </Field>
            <Field label="상세 설명" help="판매 채널 상세 페이지 맨 위에 들어갑니다">
              <Textarea value={description} onChange={setDescription} rows={9} maxLength={2000} />
            </Field>
          </FormSection>

          <FormSection title="배송" columns={3}>
            <Field label="배송 방법" required>
              <Select
                value={shipMethod}
                onChange={setShipMethod}
                options={METHODS.map((m) => ({ value: m.value, label: m.label }))}
              />
            </Field>
            <Field label="출고지" required>
              <Select
                value={warehouseId}
                onChange={setWarehouseId}
                options={WAREHOUSES.filter((w) => !w.bonded).map((w) => ({
                  value: w.id,
                  label: `${w.name}(${w.kind})`,
                }))}
              />
            </Field>
            <Field label="당일 출고 마감" help="마감 뒤 주문은 다음 영업일에 보냅니다">
              <Select
                value={cutoff}
                onChange={setCutoff}
                options={CUTOFFS.map((t) => ({ value: t, label: t }))}
              />
            </Field>
            <Field label="배송비" required>
              <AmountInput value={fee} onChange={setFee} />
            </Field>
            <Field label="무료 배송 기준" help="상품 금액이 이 금액 이상이면 배송비가 없습니다">
              <AmountInput value={freeOver} onChange={setFreeOver} />
            </Field>
            <Field label="제주 · 도서산간 추가 배송비">
              <AmountInput value={remoteFee} onChange={setRemoteFee} />
            </Field>
            {method && methodWarehouse && picked && picked.id !== methodWarehouse.id && (
              <div className="tl-block-cm-span-all">
                <Banner
                  tone="warning"
                  title={`${method.short} 상품은 ${methodWarehouse.name}에서 출고합니다`}
                >
                  {josa(picked.name, '은/는')} {picked.kind} 창고입니다. 출고지를{' '}
                  {josa(methodWarehouse.name, '으로/로')} 바꾸세요.
                </Banner>
              </div>
            )}
          </FormSection>

          <FormSection
            title="판매 채널"
            columns={1}
            description="고른 채널에 상품 · 가격 · 재고를 보냅니다. 채널마다 검수에 1~2시간 걸립니다"
          >
            <SelectableCard
              mode="multiple"
              label="판매 채널"
              columns={2}
              value={channels}
              onChange={(v) => setChannels(v as ChannelId[])}
              invalid={tried && !!errors.channel}
              options={CHANNELS.map((c) => ({
                value: c.id,
                title: c.name,
                description: `수수료 ${formatPercent(c.feeRate)} · ${c.settleRule}`,
              }))}
            />
            {tried && errors.channel && (
              <div className="tl-block-cm-span-all">
                <Banner tone="danger">{errors.channel}</Banner>
              </div>
            )}
          </FormSection>
        </Stack>
      </Card>
      <ActionBar
        sticky
        summary={`SKU ${selling.length}개 판매 · 재고 ${formatQuantity(stockSum, '개')} · 채널 ${channels.length}곳`}
      >
        <Button onPress={() => toast.show({ title: '임시 저장했습니다', tone: 'neutral' })}>
          임시 저장
        </Button>
        <Button icon="eye">미리 보기</Button>
        <Button
          variant="primary"
          icon="check"
          disabled={!canCreate}
          onPress={() => {
            setTried(true);
            if (valid) setConfirm(true);
          }}
        >
          등록
        </Button>
      </ActionBar>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`${name}을 등록합니다`}
        description={`SKU ${selling.length}개를 판매 채널 ${channels.length}곳에 보냅니다. 채널 검수가 끝나면 판매가 시작됩니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  onPress={() => {
                    toast.show({
                      title: '상품을 등록했습니다',
                      description: `${PRODUCT_ID} ${name} · 판매가 ${formatAmount(sale)}원`,
                      tone: 'success',
                    });
                    screens.go('commerce/products/list');
                  }}
                >
                  등록
                </Button>
              }
            />
          </>
        }
      />
    </Page>
  );
}
