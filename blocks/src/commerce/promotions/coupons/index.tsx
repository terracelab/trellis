// 쿠폰 · 프로모션(ListDetail): 정액 · 정률 쿠폰 목록(기간 DueBadge · 발급 · 사용 Progress · 상태) →
// 등록 · 수정 Drawer(방식 · 금액 · 기간 · 대상 상품 · 채널)
import {
  formatAmount,
  formatDate,
  formatDueDays,
  formatPercent,
  formatPeriod,
} from '@terracelab/trellis-contracts';
import {
  AmountInput,
  Badge,
  Button,
  CheckboxGroup,
  CodeSearch,
  DataGrid,
  DataGridLines,
  Drawer,
  DueBadge,
  Field,
  FilterBar,
  IconButton,
  Input,
  KpiCard,
  PageHeader,
  PeriodPicker,
  Progress,
  QuantityInput,
  RadioGroup,
  SegmentedControl,
  Select,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  CHANNELS,
  channelById,
  COUPON_STATES,
  COUPONS,
  PRODUCT_CATEGORIES,
  PRODUCTS,
  productById,
  type ChannelId,
  type Coupon,
  type CouponState,
} from '../../../_data/commerce.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan } from '../../../_platform/index.js';
import { addDays, Figure, Lines, monthLabel, Page, weekStart, yymm } from '../../../_ui/index.js';
import './style.css';

const STATES = Object.keys(COUPON_STATES) as CouponState[];
/** 오픈마켓 쿠폰은 각 채널 판매자 센터에서 만든다 */
const COUPON_CHANNELS: ChannelId[] = ['own', 'pay'];
const COUPON_CHANNEL_NAMES = COUPON_CHANNELS.map((id) => channelById(id).name).join(' · ');
/** 이번 달(2026-11) · 이름(11월) · 쿠폰 번호 앞자리(CP-2611) */
const MONTH = TODAY.slice(0, 7);
const MONTH_LABEL = monthLabel(TODAY);
const ID_PREFIX = `CP-${yymm(TODAY)}`;
/** 새 쿠폰 기본 기간: 다음 월요일부터 2주 */
const NEXT_MONDAY = addDays(weekStart(TODAY), 7);

const discountLabel = (c: Pick<Coupon, 'kind' | 'value'>) =>
  c.kind === 'fixed' ? `${formatAmount(c.value)}원` : formatPercent(c.value, 0);
const discountFor = (c: Pick<Coupon, 'kind' | 'value' | 'maxDiscount'>, amount: number) =>
  c.kind === 'fixed'
    ? c.value
    : Math.min(Math.round((amount * c.value) / 100), c.maxDiscount ?? Infinity);

const blank = (): Coupon => ({
  id: '',
  name: '',
  kind: 'fixed',
  value: 3_000,
  minOrder: 30_000,
  from: NEXT_MONDAY,
  to: addDays(NEXT_MONDAY, 13),
  limit: 300,
  issued: 0,
  used: 0,
  state: 'scheduled',
  productIds: [],
  channels: ['own'],
});

export default function Coupons() {
  const toast = useToast();
  const canEdit = useCan('promotions', 'update');
  const canCreate = useCan('promotions', 'create');
  const [rows, setRows] = useState<Coupon[]>(() => COUPONS.map((c) => ({ ...c })));
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState<string | null>('all');
  const [draft, setDraft] = useState<Coupon | null>(null);
  const [tried, setTried] = useState(false);

  const count = (s: CouponState) => rows.filter((r) => r.state === s).length;
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (tab === 'all' || r.state === tab) &&
          (channel === 'all' || r.channels.includes(channel as ChannelId)) &&
          (!q || `${r.id}${r.name}`.includes(q)),
      ),
    [rows, tab, channel, q],
  );
  const novUsed = rows.filter((r) => r.from.startsWith(MONTH)).reduce((a, r) => a + r.used, 0);
  const nov = rows.filter((r) => r.from.startsWith(MONTH));
  const novIssued = nov.reduce((a, r) => a + r.issued, 0);
  const novDiscount = nov.reduce(
    (a, r) => a + r.used * (r.kind === 'fixed' ? r.value : (r.maxDiscount ?? 0)),
    0,
  );
  const ending = rows
    .filter((r) => r.state === 'active')
    .sort((a, b) => a.to.localeCompare(b.to))[0];
  const editing = draft !== null && draft.id !== '';
  const set = (patch: Partial<Coupon>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = () => {
    setTried(true);
    if (!draft || !draft.name.trim()) return;
    if (editing) {
      setRows((rs) => rs.map((r) => (r.id === draft.id ? draft : r)));
      toast.show({ title: '쿠폰을 수정했습니다', description: draft.name, tone: 'success' });
    } else {
      const id = `${ID_PREFIX}-${String(rows.filter((r) => r.id.startsWith(ID_PREFIX)).length + 3).padStart(2, '0')}`;
      const created: Coupon = { ...draft, id, state: draft.from > TODAY ? 'scheduled' : 'active' };
      setRows((rs) => [created, ...rs]);
      toast.show({
        title: '쿠폰을 등록했습니다',
        description: `${id} ${created.name} · ${formatPeriod(created.from, created.to)}`,
        tone: 'success',
      });
    }
    setDraft(null);
    setTried(false);
  };
  const togglePause = (c: Coupon) => {
    const state: CouponState = c.state === 'paused' ? 'active' : 'paused';
    setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, state } : r)));
    setDraft(null);
    toast.show({
      title: state === 'paused' ? '쿠폰 발급을 중지했습니다' : '쿠폰 발급을 다시 시작했습니다',
      description: `${c.name} · 이미 받은 쿠폰은 기간 안에 쓸 수 있습니다`,
      tone: state === 'paused' ? 'neutral' : 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '이커머스' }, { label: '쿠폰 · 프로모션' }]}
          title="쿠폰 · 프로모션"
          description={`진행 중 ${count('active')}개 · ${MONTH_LABEL} 쿠폰 사용 ${novUsed}건 · ${COUPON_CHANNEL_NAMES} 쿠폰`}
          actions={
            <Button
              variant="primary"
              icon="plus"
              disabled={!canCreate}
              onPress={() => {
                setTried(false);
                setDraft(blank());
              }}
            >
              쿠폰 등록
            </Button>
          }
          tabs={
            <Tabs
              label="쿠폰 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: rows.length },
                ...STATES.map((s) => ({
                  value: s,
                  label: COUPON_STATES[s].label,
                  count: count(s),
                })),
              ]}
            />
          }
        />
      }
    >
      <div className="tl-block-cm-kpis">
        <KpiCard
          label="진행 중 쿠폰"
          value={count('active')}
          unit="개"
          caption={`중지 ${count('paused')}개 · 예정 ${count('scheduled')}개`}
          icon="ticket-percent"
        />
        <KpiCard
          label={`${MONTH_LABEL} 쿠폰 사용`}
          value={novUsed}
          unit="건"
          caption={`발급 ${formatAmount(novIssued)}장 · 사용률 ${formatPercent(novIssued ? (novUsed / novIssued) * 100 : 0)}`}
          icon="receipt"
        />
        <KpiCard
          label={`${MONTH_LABEL} 쿠폰 할인`}
          value={novDiscount}
          format="amount"
          unit="원"
          caption="정률 쿠폰은 최대 할인으로 셉니다"
          icon="tag"
        />
        <KpiCard
          label="곧 끝나는 쿠폰"
          value={ending ? formatDate(ending.to, 'mdw') : '없음'}
          caption={
            ending ? `${ending.name} · ${formatDueDays(ending.to, TODAY)}` : '진행 중 쿠폰 없음'
          }
          icon="calendar"
          onPress={ending ? () => setDraft({ ...ending }) : undefined}
        />
      </div>
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="쿠폰 이름 · 쿠폰 번호"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
            label="쿠폰 검색"
          />
        }
        onReset={() => {
          setQ('');
          setTab('all');
          setChannel('all');
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
            ...COUPON_CHANNELS.map((c) => ({ value: c, label: channelById(c).name })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="쿠폰"
        height="fill"
        rows={shown}
        rowKey="id"
        onRowPress={(r) => {
          setTried(false);
          setDraft({ ...r });
        }}
        activeRowKey={editing ? draft.id : null}
        rowTone={(r) => (r.state === 'paused' ? 'warning' : undefined)}
        empty="이 조건의 쿠폰이 없습니다. 쿠폰 등록에서 추가하세요"
        columns={[
          {
            key: 'name',
            header: '쿠폰',
            width: 'lg',
            sticky: true,
            render: (r) => (
              <DataGridLines
                primary={r.name}
                secondary={
                  <>
                    {r.id} · {r.productIds.length ? `상품 ${r.productIds.length}개` : '전체 상품'}
                  </>
                }
              />
            ),
          },
          {
            key: 'value',
            header: '할인',
            width: 'sm',
            align: 'right',
            render: (r) => (
              <DataGridLines
                primary={discountLabel(r)}
                secondary={
                  r.kind === 'rate' ? `최대 ${formatAmount(r.maxDiscount ?? 0)}원` : '정액'
                }
              />
            ),
          },
          {
            key: 'minOrder',
            header: '최소 주문 금액',
            width: 'md',
            format: 'amount',
            unit: '원',
          },
          {
            key: 'to',
            header: '기간',
            width: 'lg',
            render: (r) => (
              <span className="tl-block-cm-period">
                <span className="tl-block-code">{formatPeriod(r.from, r.to)}</span>
                {r.state === 'scheduled' ? (
                  <Badge size="sm" tone="info">
                    {formatDate(r.from, 'md')} 시작
                  </Badge>
                ) : (
                  <DueBadge
                    due={r.to}
                    today={TODAY}
                    size="sm"
                    done={r.state === 'ended'}
                    doneLabel="종료"
                  />
                )}
              </span>
            ),
          },
          {
            key: 'issued',
            header: '발급',
            width: 'lg',
            render: (r) => (
              <Progress
                size="sm"
                label="발급"
                value={r.issued}
                max={r.limit}
                unit="장"
                tone={r.issued >= r.limit ? 'warning' : undefined}
              />
            ),
          },
          {
            key: 'used',
            header: '사용',
            width: 'lg',
            render: (r) =>
              r.issued === 0 ? (
                <span className="tl-block-muted">발급 전</span>
              ) : (
                <Progress
                  size="sm"
                  label={
                    r.issued ? `사용률 ${formatPercent((r.used / r.issued) * 100, 0)}` : '사용'
                  }
                  value={r.used}
                  max={Math.max(r.issued, 1)}
                  unit="장"
                  tone="success"
                />
              ),
          },
          {
            key: 'state',
            header: '상태',
            width: 'sm',
            render: (r) => (
              <Badge tone={COUPON_STATES[r.state].tone}>{COUPON_STATES[r.state].label}</Badge>
            ),
          },
        ]}
      />
      <Drawer
        open={draft !== null}
        onOpenChange={(o) => !o && setDraft(null)}
        title={editing ? (draft?.name ?? '') : '쿠폰 등록'}
        description={
          editing && draft
            ? `${draft.id} · 발급 ${formatAmount(draft.issued)}장 · 사용 ${formatAmount(draft.used)}장`
            : `${COUPON_CHANNEL_NAMES}에서 쓰는 쿠폰을 만듭니다`
        }
        width="lg"
        actions={
          editing &&
          draft && (
            <Badge tone={COUPON_STATES[draft.state].tone}>{COUPON_STATES[draft.state].label}</Badge>
          )
        }
        footer={
          draft && (
            <>
              {editing && (draft.state === 'active' || draft.state === 'paused') && (
                <Button
                  icon={draft.state === 'paused' ? 'play' : 'circle-pause'}
                  disabled={!canEdit}
                  onPress={() => togglePause(draft)}
                >
                  {draft.state === 'paused' ? '발급 재개' : '발급 중지'}
                </Button>
              )}
              <Button onPress={() => setDraft(null)}>취소</Button>
              <Button
                variant="primary"
                disabled={editing ? !canEdit || draft.state === 'ended' : !canCreate}
                onPress={save}
              >
                {editing ? '저장' : '등록'}
              </Button>
            </>
          )
        }
      >
        {draft && (
          <div className="tl-block-drawer-stack">
            <Field
              label="쿠폰 이름"
              required
              help="구매자에게 보이는 이름입니다"
              error={tried && !draft.name.trim() ? '쿠폰 이름을 입력하세요' : null}
            >
              <Input
                value={draft.name}
                onChange={(v) => set({ name: v })}
                placeholder={`${MONTH_LABEL} 둘째 주 ${PRODUCT_CATEGORIES[0] ?? ''} 3,000원`}
                maxLength={30}
              />
            </Field>
            <Field label="할인 방식" required>
              <RadioGroup
                orientation="horizontal"
                value={draft.kind}
                onChange={(v) =>
                  set(
                    v === 'rate'
                      ? { kind: 'rate', value: 10, maxDiscount: 5_000 }
                      : { kind: 'fixed', value: 3_000, maxDiscount: undefined },
                  )
                }
                options={[
                  { value: 'fixed', label: '정액 할인', description: '주문 금액에서 정해진 금액' },
                  { value: 'rate', label: '정률 할인', description: '대상 상품 금액의 비율' },
                ]}
              />
            </Field>
            <div className="tl-block-cm-two">
              {draft.kind === 'fixed' ? (
                <Field label="할인 금액" required>
                  <AmountInput value={draft.value} onChange={(v) => set({ value: v ?? 0 })} />
                </Field>
              ) : (
                <>
                  <Field label="할인율" required>
                    <QuantityInput
                      value={draft.value}
                      onChange={(v) => set({ value: v ?? 0 })}
                      unit="%"
                      min={1}
                      max={50}
                    />
                  </Field>
                  <Field label="최대 할인" required>
                    <AmountInput
                      value={draft.maxDiscount ?? null}
                      onChange={(v) => set({ maxDiscount: v ?? 0 })}
                    />
                  </Field>
                </>
              )}
              <Field label="최소 주문 금액" help="상품 금액 기준이며 배송비는 빼고 셉니다">
                <AmountInput value={draft.minOrder} onChange={(v) => set({ minOrder: v ?? 0 })} />
              </Field>
              <Field label="발급 수량" help="다 나가면 발급을 멈춥니다">
                <QuantityInput
                  value={draft.limit}
                  onChange={(v) => set({ limit: v ?? 0 })}
                  unit="장"
                  step={50}
                  min={draft.issued}
                />
              </Field>
            </div>
            <Field label="사용 기간" required>
              <PeriodPicker
                value={{ from: draft.from, to: draft.to }}
                onChange={(p) => set({ from: p.from, to: p.to })}
                today={TODAY}
                presets={['thisWeek', 'thisMonth']}
              />
            </Field>
            <Field label="대상 상품" help="고르지 않으면 전체 상품에 씁니다">
              <div className="tl-block-cm-targets">
                <SegmentedControl
                  label="대상 범위"
                  value={draft.productIds.length ? 'some' : 'all'}
                  onChange={(v) => set({ productIds: v === 'all' ? [] : [PRODUCTS[0]!.id] })}
                  options={[
                    { value: 'all', label: '전체 상품' },
                    { value: 'some', label: '상품 고르기' },
                  ]}
                />
                {draft.productIds.length > 0 && (
                  <>
                    <CodeSearch
                      label="대상 상품 추가"
                      value={null}
                      placeholder="상품 코드 또는 상품명"
                      onChange={(code) =>
                        code &&
                        !draft.productIds.includes(code) &&
                        set({ productIds: [...draft.productIds, code] })
                      }
                      options={PRODUCTS.filter((p) => !draft.productIds.includes(p.id)).map(
                        (p) => ({
                          value: p.id,
                          label: p.name,
                          meta: `${formatAmount(p.salePrice)}원`,
                        }),
                      )}
                    />
                    <ul className="tl-block-cm-target-list" aria-label="고른 대상 상품">
                      {draft.productIds.map((id) => (
                        <li key={id}>
                          <Lines
                            primary={productById(id).name}
                            secondary={
                              <span className="tl-block-code">
                                {id} · {formatAmount(productById(id).salePrice)}원
                              </span>
                            }
                          />
                          <IconButton
                            icon="x"
                            size="sm"
                            label={`${productById(id).name} 빼기`}
                            onPress={() =>
                              set({ productIds: draft.productIds.filter((x) => x !== id) })
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Field>
            <Field label="판매 채널" help="오픈마켓 쿠폰은 채널 판매자 센터에서 만듭니다">
              <CheckboxGroup
                value={draft.channels}
                onChange={(v) => set({ channels: v as ChannelId[] })}
                options={CHANNELS.map((c) => ({
                  value: c.id,
                  label: c.name,
                  disabled: !COUPON_CHANNELS.includes(c.id),
                }))}
              />
            </Field>
            <div className="tl-block-cm-preview">
              <Figure
                label={`${formatAmount(Math.max(draft.minOrder, 50_000))}원 주문 때 할인`}
                value={formatAmount(discountFor(draft, Math.max(draft.minOrder, 50_000)))}
                unit="원"
              />
              <Figure
                label="모두 쓰면 할인 합계"
                value={formatAmount(
                  discountFor(draft, Math.max(draft.minOrder, 50_000)) * draft.limit,
                )}
                unit="원"
              />
            </div>
          </div>
        )}
      </Drawer>
    </Page>
  );
}
