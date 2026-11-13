// 견적서 작성(FormRegister): 고객 · 유효 기간 · 품목(수량 · 단가 · 할인율) · 부가세 합계 · 거래 조건 → 미리 보기 · 메일 발송 · 수주로 전환
import {
  formatAmount,
  formatBizNo,
  formatDate,
  formatDueDays,
  formatKoreanAmount,
  formatPercent,
  type StatusTone,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  Attachment,
  Badge,
  Banner,
  Button,
  Card,
  CodeSearch,
  DataGrid,
  DateField,
  DescriptionList,
  Dialog,
  DialogClose,
  DueBadge,
  Field,
  FormSection,
  Input,
  LineItemsEditor,
  PageHeader,
  QuantityInput,
  Select,
  Textarea,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  CUSTOMERS,
  customerByCode,
  GRADES,
  lineSupply,
  OPPORTUNITIES,
  QUOTE,
  QUOTE_HISTORY,
  STAFF,
  staffLabel,
  type QuoteLine,
} from '../../../_data/ecm-crm.js';
import { SALES_ORDERS } from '../../../_data/erp.js';
import { ITEMS, itemById, taxOf, TODAY } from '../../../_data/index.js';
import { COMPANY, useCan } from '../../../_platform/index.js';
import { Col, Figure, Grid, Lines, Page, yymm } from '../../../_ui/index.js';
import './style.css';

type QuoteState = 'draft' | 'sent' | 'won';
/** 영업 담당 · 소속(데이터) */
const OWNER = STAFF.find((s) => s.name === QUOTE.owner);
/** 수주로 바꾸면 매길 출고 요청 번호: 이번 달 수주 다음 순번 */
const SO_PREFIX = `SO-${yymm(TODAY)}`;
const NEXT_SO = `${SO_PREFIX}-${String(
  Math.max(
    0,
    ...SALES_ORDERS.filter((o) => o.id.startsWith(SO_PREFIX)).map((o) => Number(o.id.slice(-4))),
  ) + 1,
).padStart(4, '0')}`;

const QUOTE_STATES: Record<QuoteState, { label: string; tone: StatusTone }> = {
  draft: { label: '작성 중', tone: 'neutral' },
  sent: { label: '발송', tone: 'info' },
  won: { label: '수주 전환', tone: 'success' },
};

export default function QuoteEditor() {
  const toast = useToast();
  const canSend = useCan('quotes', 'create');
  const [state, setState] = useState<QuoteState>('draft');
  const [code, setCode] = useState<string | null>(QUOTE.customerCode);
  const [date, setDate] = useState<string | null>(QUOTE.date);
  const [valid, setValid] = useState<string | null>(QUOTE.validUntil);
  const [oppId, setOppId] = useState<string | null>(QUOTE.opportunityId);
  const [lines, setLines] = useState<QuoteLine[]>(() => QUOTE.lines.map((l) => ({ ...l })));
  const [terms, setTerms] = useState(QUOTE.terms);
  const [preview, setPreview] = useState(false);
  const [mail, setMail] = useState(false);
  const [convert, setConvert] = useState(false);
  const [tried, setTried] = useState(false);
  const customer = code ? (customerByCode(code) ?? null) : null;
  const contact = customer?.contacts.find((c) => c.primary) ?? customer?.contacts[0];
  const [to, setTo] = useState(contact?.email ?? '');
  const gross = lines.reduce((a, l) => a + (l.qty ?? 0) * (l.price ?? 0), 0);
  const supply = lines.reduce((a, l) => a + lineSupply(l), 0);
  // 부가세: 품목 과세 구분대로(면세 품목은 0)
  const vat = lines.reduce(
    (a, l) => a + taxOf(lineSupply(l), l.itemId ? itemById(l.itemId).taxType : 'taxed'),
    0,
  );
  const allTaxed = lines.every(
    (l) => !l.itemId || (itemById(l.itemId).taxType ?? 'taxed') === 'taxed',
  );
  const total = supply + vat;
  const filled = lines.filter((l) => l.itemId && l.qty && l.price);
  const ready = !!customer && filled.length > 0 && !!valid;
  const opps = OPPORTUNITIES.filter(
    (o) => o.customerCode === code && o.stage !== 'won' && o.stage !== 'lost',
  );
  const locked = state === 'won';
  const opp = OPPORTUNITIES.find((o) => o.id === oppId);
  const subject = `[${COMPANY.name}] 견적서 ${QUOTE.no}${opp ? ` · ${opp.title}` : ''}`;

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: 'CRM' }, { label: '견적' }, { label: QUOTE.no }]}
          title="견적서 작성"
          meta={<Badge tone={QUOTE_STATES[state].tone}>{QUOTE_STATES[state].label}</Badge>}
          description={`${QUOTE.no} · ${staffLabel(QUOTE.owner)} · ${allTaxed ? '부가세는 공급가액의 10%로 계산됩니다' : '면세 품목은 부가세가 없습니다'}`}
          actions={
            <Button icon="copy" disabled={locked}>
              이전 견적 불러오기
            </Button>
          }
        />
      }
    >
      <Grid>
        <Col span={8}>
          <Card>
            <div className="tl-block-drawer-stack">
              <FormSection title="기본" columns={3}>
                <Field label="견적 번호">
                  <Input value={QUOTE.no} readOnly />
                </Field>
                <Field label="견적일" required>
                  <DateField
                    today={TODAY}
                    value={date}
                    onChange={setDate}
                    max={TODAY}
                    disabled={locked}
                  />
                </Field>
                <Field
                  label="유효 기간"
                  required
                  help={
                    valid
                      ? `${formatDueDays(valid, TODAY)} · 지나면 환율을 다시 반영합니다`
                      : undefined
                  }
                  error={tried && !valid ? '유효 기간을 고르세요' : null}
                >
                  <DateField
                    today={TODAY}
                    value={valid}
                    onChange={setValid}
                    min={TODAY}
                    disabled={locked}
                  />
                </Field>
              </FormSection>
              <FormSection
                title="고객"
                description="고객을 고르면 담당자 · 받는 메일 · 결제 조건이 채워집니다"
              >
                <Field label="고객" required error={tried && !customer ? '고객을 고르세요' : null}>
                  <CodeSearch
                    value={code}
                    onChange={(v) => {
                      setCode(v);
                      const c = v ? customerByCode(v) : undefined;
                      setTo(c?.contacts[0]?.email ?? '');
                      setOppId(
                        OPPORTUNITIES.find(
                          (o) => o.customerCode === v && o.stage !== 'won' && o.stage !== 'lost',
                        )?.id ?? null,
                      );
                    }}
                    disabled={locked}
                    options={CUSTOMERS.map((c) => ({
                      value: c.code,
                      label: c.name,
                      description: c.industry,
                      meta: `${GRADES[c.grade].label} · ${c.owner}`,
                    }))}
                  />
                </Field>
                <Field label="영업기회">
                  <Select
                    value={oppId}
                    onChange={setOppId}
                    disabled={locked || opps.length === 0}
                    placeholder="연결할 영업기회 없음"
                    options={opps.map((o) => ({ value: o.id, label: `${o.id} · ${o.title}` }))}
                  />
                </Field>
                <Field label="담당자">
                  <Input
                    value={contact ? `${contact.name} ${contact.title} · ${contact.phone}` : ''}
                    readOnly
                  />
                </Field>
                <Field label="받는 메일" help="메일 발송 때 이 주소로 보냅니다">
                  <Input type="email" value={to} onChange={setTo} disabled={locked} />
                </Field>
                <Field label="결제 조건">
                  <Input value={customer?.terms ?? ''} readOnly />
                </Field>
                <Field label="사업자등록번호">
                  <Input value={customer ? formatBizNo(customer.bizNo) : ''} readOnly />
                </Field>
                {customer?.state === 'caution' && (
                  <div className="tl-block-quote-span">
                    <Banner tone="warning" title="거래 주의 고객입니다">
                      {customer.note}
                    </Banner>
                  </div>
                )}
                {customer?.state === 'prospect' && (
                  <div className="tl-block-quote-span">
                    <Banner tone="info" title="잠재 고객입니다">
                      수주로 전환하면 거래처 등록 요청이 구매팀으로 갑니다.
                    </Banner>
                  </div>
                )}
              </FormSection>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card
            title={customer?.name ?? '고객 요약'}
            subtitle={
              customer
                ? `${customer.code} · ${staffLabel(customer.owner)} 담당`
                : '고객을 고르면 거래 현황이 보입니다'
            }
            action={
              customer && (
                <Badge tone={GRADES[customer.grade].tone} variant="outline" dot={false}>
                  {GRADES[customer.grade].label}
                </Badge>
              )
            }
          >
            {customer && (
              <div className="tl-block-drawer-stack">
                <DescriptionList
                  columns={1}
                  items={[
                    {
                      label: '미수금',
                      value: customer.receivable
                        ? `${formatAmount(customer.receivable)}원`
                        : '없음',
                    },
                    {
                      label: '여신 한도',
                      value: customer.creditLimit ? `${formatAmount(customer.creditLimit)}원` : '–',
                    },
                    {
                      label: '한도 여유',
                      value: customer.creditLimit
                        ? `${formatAmount(customer.creditLimit - customer.receivable - total)}원(이 견적 반영)`
                        : '–',
                    },
                    {
                      label: '최근 거래일',
                      value: customer.lastDealAt ? formatDate(customer.lastDealAt) : '–',
                    },
                  ]}
                />
                {customer.code === QUOTE.customerCode && (
                  <section className="tl-block-quote-history" aria-label="이전 견적">
                    <h3 className="tl-block-quote-history__title">이전 견적</h3>
                    <ul className="tl-block-quote-history__list">
                      {QUOTE_HISTORY.map((h) => (
                        <li key={h.no} className="tl-block-quote-history__row">
                          <Lines
                            primary={<span className="tl-block-code">{h.no}</span>}
                            secondary={formatDate(h.date)}
                          />
                          <span className="tl-block-quote-history__amount">
                            {formatAmount(h.supply)}원
                          </span>
                          <Badge size="sm" tone={h.state === '수주' ? 'success' : 'neutral'}>
                            {h.state}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="품목" subtitle={`${filled.length}건 · 단가는 판매 단가에서 시작합니다`}>
            <div className="tl-block-drawer-stack">
              <LineItemsEditor
                caption="견적 품목"
                value={lines}
                onChange={setLines}
                lineKey="key"
                newLine={() => ({
                  key: Date.now(),
                  itemId: null,
                  qty: null,
                  price: null,
                  discount: 0,
                })}
                disabled={locked}
                numbered
                addLabel="품목 추가"
                columns={[
                  {
                    key: 'item',
                    header: '품목',
                    required: true,
                    mobile: 'title',
                    render: (l, { label, update }) => (
                      <CodeSearch
                        size="sm"
                        label={label}
                        value={l.itemId ? itemById(l.itemId).code : null}
                        disabled={locked}
                        onChange={(c) => {
                          const it = ITEMS.find((i) => i.code === c);
                          update({ itemId: it?.id ?? null, price: it?.price ?? null });
                        }}
                        options={ITEMS.map((i) => ({ value: i.code, label: i.name, meta: i.spec }))}
                      />
                    ),
                  },
                  {
                    key: 'qty',
                    header: '수량',
                    format: 'quantity',
                    width: 'md',
                    render: (l, { label, update }) => (
                      <QuantityInput
                        size="sm"
                        label={label}
                        value={l.qty}
                        onChange={(v) => update({ qty: v })}
                        unit={l.itemId ? itemById(l.itemId).unit : 'EA'}
                        showStepper={false}
                        disabled={locked}
                      />
                    ),
                  },
                  {
                    key: 'price',
                    header: '단가',
                    format: 'amount',
                    width: 'md',
                    render: (l, { label, update }) => (
                      <AmountInput
                        size="sm"
                        label={label}
                        value={l.price}
                        onChange={(v) => update({ price: v })}
                        disabled={locked}
                      />
                    ),
                  },
                  {
                    key: 'discount',
                    header: '할인율',
                    format: 'percent',
                    width: 'sm',
                    render: (l, { label, update }) => (
                      <QuantityInput
                        size="sm"
                        label={label}
                        value={l.discount}
                        onChange={(v) => update({ discount: v })}
                        unit="%"
                        min={0}
                        max={30}
                        digits={1}
                        showStepper={false}
                        disabled={locked}
                      />
                    ),
                  },
                  {
                    key: 'supply',
                    header: '공급가액',
                    width: 'md',
                    format: 'amount',
                    value: lineSupply,
                  },
                ]}
              />
              <div className="tl-block-quote-totals">
                <Figure label="공급가액(할인 전)" value={formatAmount(gross)} unit="원" />
                <Figure
                  label={`할인 ${gross ? formatPercent(((gross - supply) / gross) * 100) : ''}`}
                  value={formatAmount(supply - gross)}
                  unit="원"
                />
                <Figure label="공급가액" value={formatAmount(supply)} unit="원" />
                <Figure label="부가세" value={formatAmount(vat)} unit="원" />
                <Figure label="합계" value={formatAmount(total)} unit="원" />
                <p className="tl-block-quote-totals__korean">{formatKoreanAmount(total)}</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="거래 조건" subtitle="견적서 아래에 그대로 찍힙니다">
            <Field label="조건" help="납품 · 운송 · 결제 · 유효 기간 순으로 한 줄씩 씁니다">
              <Textarea
                value={terms}
                onChange={setTerms}
                rows={4}
                maxLength={500}
                readOnly={locked}
              />
            </Field>
          </Card>
        </Col>
      </Grid>

      <ActionBar
        className="tl-block-quote-bar"
        sticky
        summary={`합계 ${formatAmount(total)}원 · 품목 ${filled.length}건 · 유효 기간 ${valid ?? '–'}`}
      >
        <Button
          disabled={locked}
          onPress={() => toast.show({ title: '임시 저장했습니다', description: QUOTE.no })}
        >
          임시 저장
        </Button>
        <Button icon="eye" onPress={() => setPreview(true)}>
          미리 보기
        </Button>
        <Button
          variant={state === 'draft' ? 'primary' : 'secondary'}
          icon="mail"
          disabled={!canSend || locked}
          onPress={() => {
            setTried(true);
            if (ready) setMail(true);
          }}
        >
          메일 발송
        </Button>
        <Button
          variant={state === 'sent' ? 'primary' : 'secondary'}
          icon="circle-check"
          disabled={!canSend || locked || !ready}
          onPress={() => setConvert(true)}
        >
          수주로 전환
        </Button>
      </ActionBar>

      <Dialog
        open={preview}
        onOpenChange={setPreview}
        size="lg"
        title={`견적서 ${QUOTE.no}`}
        description={`${customer?.name ?? ''} 귀중 · 유효 기간 ${valid ?? '–'}`}
        footer={
          <>
            <DialogClose render={<Button>닫기</Button>} />
            <Button
              icon="download"
              onPress={() =>
                toast.show({
                  title: '다운로드를 시작했습니다',
                  description: `견적서_${QUOTE.no}.pdf`,
                })
              }
            >
              PDF 다운로드
            </Button>
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <DescriptionList
            columns={2}
            items={[
              { label: '공급자', value: `${COMPANY.name} · ${formatBizNo(COMPANY.bizNo)}` },
              {
                label: '고객',
                value: customer ? `${customer.name} · ${formatBizNo(customer.bizNo)}` : '–',
              },
              { label: '견적일', value: date ?? '–' },
              { label: '유효 기간', value: valid ?? '–' },
            ]}
          />
          <DataGrid
            caption="견적 품목"
            rows={filled.map((l, i) => ({
              no: i + 1,
              name: `${itemById(l.itemId!).name} · ${itemById(l.itemId!).spec}`,
              qty: l.qty ?? 0,
              unit: itemById(l.itemId!).unit,
              price: l.price ?? 0,
              discount: l.discount ?? 0,
              supply: lineSupply(l),
            }))}
            rowKey="no"
            summary
            columns={[
              { key: 'name', header: '품목' },
              {
                key: 'qty',
                header: '수량',
                width: 'sm',
                align: 'right',
                render: (r) => `${formatAmount(r.qty)}${r.unit}`,
              },
              { key: 'price', header: '단가', width: 'sm', format: 'amount' },
              {
                key: 'discount',
                header: '할인율',
                width: 'xs',
                align: 'right',
                render: (r) => formatPercent(r.discount),
              },
              { key: 'supply', header: '공급가액', width: 'md', format: 'amount', total: 'sum' },
            ]}
          />
          <div className="tl-block-quote-totals" data-compact>
            <Figure label="공급가액" value={formatAmount(supply)} unit="원" />
            <Figure label="부가세" value={formatAmount(vat)} unit="원" />
            <Figure label="합계" value={formatAmount(total)} unit="원" />
            <p className="tl-block-quote-totals__korean">{formatKoreanAmount(total)}</p>
          </div>
          <pre className="tl-block-quote-terms">{terms}</pre>
        </div>
      </Dialog>

      <Dialog
        open={mail}
        onOpenChange={setMail}
        size="lg"
        title="견적서 메일 발송"
        description={`${customer?.name ?? ''} ${contact ? `${contact.name} ${contact.title}` : ''}에게 PDF를 붙여 보냅니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  icon="send"
                  disabled={!to}
                  onPress={() => {
                    setState('sent');
                    toast.show({
                      title: '견적서를 메일로 보냈습니다',
                      description: `${to} · ${QUOTE.no}`,
                      tone: 'success',
                    });
                  }}
                >
                  발송
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <Field label="받는 사람" required>
            <Input type="email" value={to} onChange={setTo} />
          </Field>
          <Field label="참조">
            <Input type="email" defaultValue="dohyun.kang@terra-trading.example" />
          </Field>
          <Field label="제목" required>
            <Input defaultValue={subject} />
          </Field>
          <Field label="본문">
            <Textarea
              rows={5}
              defaultValue={[
                `${contact ? `${contact.name} ${contact.title}님` : '담당자님'}, ${COMPANY.name} ${OWNER?.dept ?? ''} ${QUOTE.owner}입니다.`,
                `요청하신 견적서를 보내드립니다. 합계 ${formatAmount(total)}원(부가세 포함)이며 ${valid ?? ''}까지 유효합니다.`,
                '확인 후 회신 부탁드립니다.',
              ].join('\n')}
            />
          </Field>
          <Attachment layout="chips" files={[{ name: `견적서_${QUOTE.no}.pdf`, size: 248_600 }]} />
        </div>
      </Dialog>

      <Dialog
        open={convert}
        onOpenChange={setConvert}
        title={`${QUOTE.no}을 수주로 전환합니다`}
        description={`${customer?.name ?? ''} · 합계 ${formatAmount(total)}원. 영업기회 ${oppId ?? ''}을 수주 단계로 옮기고 물류팀에 출고 요청을 등록합니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  icon="circle-check"
                  onPress={() => {
                    setState('won');
                    toast.show({
                      title: '수주로 전환했습니다',
                      description: `출고 요청 ${NEXT_SO} · ${customer?.name ?? ''}`,
                      tone: 'success',
                    });
                  }}
                >
                  수주로 전환
                </Button>
              }
            />
          </>
        }
      >
        {valid && (
          <div className="tl-block-quote-due">
            <span>유효 기간</span>
            <DueBadge due={valid} today={TODAY} warnDays={3} />
          </div>
        )}
      </Dialog>
    </Page>
  );
}
