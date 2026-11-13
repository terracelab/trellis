// 세금계산서 발행(FormRegister): 공급받는 자 · 품목 → 자동 계산 → 미리 보기(종이 · 인쇄) → 확인 후 발행
import {
  formatAmount,
  formatBizNo,
  formatKoreanAmount,
  formatQuantity,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  Badge,
  Banner,
  Button,
  Card,
  CodeSearch,
  DateField,
  DescriptionList,
  Dialog,
  DialogClose,
  Field,
  FormSection,
  Input,
  LineItemsEditor,
  MaskedInput,
  PageHeader,
  Paper,
  PaperFields,
  PaperMoneyTable,
  PaperPreview,
  PaperText,
  PaperTitle,
  QuantityInput,
  SegmentedControl,
  Select,
  Textarea,
  usePrintPapers,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  INVOICES,
  ITEMS,
  itemById,
  PARTIES,
  partyById,
  TAX_TYPES,
  taxOf,
  TODAY,
  type TaxType,
} from '../../../_data/index.js';
import { COMPANY, JOBS, useCan, useScreens } from '../../../_platform/index.js';
import { monthLabel, Page, Stack } from '../../../_ui/index.js';
import './style.css';

/** 처음 채워 두는 계산서: 발행 대기 첫 매출 세금계산서 */
const READY = INVOICES.find((i) => i.kind === 'sales' && i.state === 'ready');
const KIND_TAX: Record<string, TaxType> = { normal: 'taxed', zero: 'zero', exempt: 'exempt' };
/** 국세청 전송 시각: 일괄 발행 배치(플랫폼 JOBS)의 다음 실행 */
const SEND_AT = JOBS.find((j) => j.id === 'job-invoice-issue')?.nextRunAt?.slice(11) ?? '18:00';
const MONTH_LABEL = monthLabel(TODAY);

interface Line {
  key: number;
  itemId: string | null;
  qty: number | null;
  price: number | null;
}

const customers = PARTIES.filter((p) => p.kind.includes('customer'));

export default function InvoiceIssue() {
  const toast = useToast();
  const canIssue = useCan('tax', 'approve');
  const screens = useScreens();
  const [kind, setKind] = useState<string | null>('normal');
  const [date, setDate] = useState<string | null>(TODAY);
  const [billing, setBilling] = useState('claim');
  const [buyerId, setBuyerId] = useState<string | null>(READY?.partyId ?? null);
  const [lines, setLines] = useState<Line[]>(() =>
    (READY?.lines ?? []).map((l, i) => ({
      key: i + 1,
      itemId: ITEMS.find((it) => it.name === l.name)?.id ?? null,
      qty: l.qty,
      price: l.unitPrice,
    })),
  );
  const [memo, setMemo] = useState('');
  const [tried, setTried] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState(false);
  const print = usePrintPapers();
  const buyer = buyerId ? partyById(buyerId) : null;
  const taxType: TaxType = KIND_TAX[kind ?? ''] ?? 'taxed';
  const doc = TAX_TYPES[taxType].doc;
  const supply = lines.reduce((a, l) => a + (l.qty ?? 0) * (l.price ?? 0), 0);
  const tax = taxOf(supply, taxType);
  const valid = !!buyer && lines.some((l) => l.itemId && l.qty && l.price);
  const billingLabel = billing === 'receipt' ? '영수' : '청구';
  const docTitle = taxType === 'zero' ? `영세율 ${doc}` : doc;

  // 미리 보기 · 인쇄가 같은 종이를 그린다. 승인번호는 발행 뒤 국세청 전송 때 붙는다
  const paper = (
    <Paper
      label={docTitle}
      header={
        <>
          <span>미리 보기 · 승인번호는 발행할 때 붙습니다</span>
          <span>{COMPANY.name}</span>
        </>
      }
    >
      <PaperTitle subtitle={`작성일 ${date ?? '–'} · ${billingLabel}`}>{docTitle}</PaperTitle>
      <PaperFields
        title="공급자"
        rows={[
          { label: '등록번호', value: formatBizNo(COMPANY.bizNo) },
          { label: '상호', value: COMPANY.name },
          { label: '대표자', value: COMPANY.ceo },
          { label: '주소', value: COMPANY.address, full: true },
        ]}
      />
      <PaperFields
        title="공급받는 자"
        rows={[
          { label: '등록번호', value: buyer?.bizNo ? formatBizNo(buyer.bizNo) : '' },
          { label: '상호', value: buyer?.name ?? '' },
          { label: '담당자', value: buyer?.manager ?? '' },
          { label: '받는 메일', value: buyer?.email ?? '' },
        ]}
      />
      <PaperMoneyTable
        title="품목"
        note="단위: 원"
        columns={[
          { header: '품목' },
          { header: '수량', width: 'sm', align: 'right' },
          { header: '단가', width: 'sm' },
          { header: '공급가액', width: 'md' },
          { header: '세액', width: 'sm' },
        ]}
        rows={lines
          .filter((l) => l.itemId)
          .map((l) => {
            const it = itemById(l.itemId!);
            const amount = (l.qty ?? 0) * (l.price ?? 0);
            return [
              `${it.name} · ${it.spec}`,
              formatQuantity(l.qty ?? 0, it.unit),
              l.price ?? 0,
              amount,
              taxOf(amount, taxType),
            ];
          })}
        total={['합계', '', '', supply, tax]}
      />
      <PaperFields
        columns={2}
        rows={[
          {
            label: '합계 금액',
            value: `${formatAmount(supply + tax)}원(${formatKoreanAmount(supply + tax)})`,
          },
          { label: '비고', value: memo },
        ]}
      />
      <PaperText variant="statement">{`이 금액을 ${billingLabel}함`}</PaperText>
    </Paper>
  );

  return (
    <Page
      width="form"
      header={
        <PageHeader
          breadcrumbs={[
            { label: '세무' },
            {
              label: '세금계산서',
              ...(screens.has('erp/tax/invoice-list')
                ? { href: screens.href('erp/tax/invoice-list') }
                : {}),
            },
            { label: '발행' },
          ]}
          title="세금계산서 발행"
          meta={<Badge tone="neutral">작성 중</Badge>}
          description={`공급가액과 세액은 품목에서 계산됩니다. 발행하면 오늘 ${SEND_AT}에 국세청으로 전송합니다`}
        />
      }
    >
      <Card>
        <Stack gap="lg">
          <FormSection title="기본" columns={3}>
            <Field label="종류" required>
              <Select
                value={kind}
                onChange={setKind}
                options={[
                  { value: 'normal', label: '일반(과세)' },
                  { value: 'zero', label: '영세율(수출 · 내국신용장)' },
                  { value: 'exempt', label: '면세(계산서)' },
                  { value: 'amend', label: '수정 발행' },
                ]}
              />
            </Field>
            <Field label="작성일" required>
              <DateField today={TODAY} value={date} onChange={setDate} max={TODAY} />
            </Field>
            <Field label="영수 · 청구">
              <SegmentedControl
                value={billing}
                onChange={setBilling}
                options={[
                  { value: 'claim', label: '청구' },
                  { value: 'receipt', label: '영수' },
                ]}
              />
            </Field>
          </FormSection>

          <FormSection title="공급자" columns={1}>
            <DescriptionList
              columns={2}
              items={[
                { label: '상호', value: COMPANY.name },
                { label: '사업자등록번호', value: formatBizNo(COMPANY.bizNo) },
                { label: '대표자', value: COMPANY.ceo },
                { label: '주소', value: COMPANY.address },
              ]}
            />
          </FormSection>

          <FormSection
            title="공급받는 자"
            description="거래처를 고르면 사업자등록번호와 담당자가 채워집니다"
          >
            <Field label="거래처" required error={tried && !buyer ? '거래처를 고르세요' : null}>
              <CodeSearch
                value={buyer?.code ?? null}
                onChange={(code) => setBuyerId(customers.find((p) => p.code === code)?.id ?? null)}
                options={customers.map((p) => ({
                  value: p.code,
                  label: p.name,
                  meta: formatBizNo(p.bizNo ?? ''),
                }))}
              />
            </Field>
            <Field label="사업자등록번호" required>
              <MaskedInput
                mask="bizNo"
                value={buyer?.bizNo ?? ''}
                onChange={() => undefined}
                readOnly
              />
            </Field>
            <Field label="담당자">
              <Input value={buyer?.manager ?? ''} readOnly />
            </Field>
            <Field label="받는 메일" help="발행하면 이 주소로 세금계산서를 보냅니다">
              <Input type="email" value={buyer?.email ?? ''} onChange={() => undefined} />
            </Field>
            {buyer?.bizStatus === 'suspended' && (
              <div className="tl-block-span-all">
                <Banner tone="warning" title="휴업 중인 사업자입니다">
                  국세청 사업자 상태 조회(매일 07:00)에서 휴업으로 나왔습니다. 발행 전에 거래처에
                  확인하세요.
                </Banner>
              </div>
            )}
          </FormSection>

          <FormSection title="품목" columns={1}>
            <LineItemsEditor
              caption="품목"
              value={lines}
              onChange={setLines}
              lineKey="key"
              newLine={() => ({ key: Date.now(), itemId: null, qty: null, price: null })}
              numbered
              addLabel="품목 추가"
              totals={[
                { label: '공급가액', value: `${formatAmount(supply)}원` },
                {
                  label: taxType === 'taxed' ? '세액' : `세액(${TAX_TYPES[taxType].label})`,
                  value: `${formatAmount(tax)}원`,
                },
                { label: '합계', value: `${formatAmount(supply + tax)}원` },
              ]}
              footnote={formatKoreanAmount(supply + tax)}
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
                      onChange={(code) => {
                        const it = ITEMS.find((i) => i.code === code);
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
                    />
                  ),
                },
                {
                  key: 'supply',
                  header: '공급가액',
                  width: 'md',
                  format: 'amount',
                  value: (l) => (l.qty ?? 0) * (l.price ?? 0),
                },
                {
                  key: 'tax',
                  header: '세액',
                  width: 'sm',
                  format: 'amount',
                  value: (l) => taxOf((l.qty ?? 0) * (l.price ?? 0), taxType),
                },
              ]}
            />
          </FormSection>

          <FormSection title="비고" columns={1}>
            <Field label="비고" help="세금계산서 비고란에 찍힙니다">
              <Textarea
                value={memo}
                onChange={setMemo}
                maxLength={150}
                rows={2}
                placeholder={`${MONTH_LABEL} 1차 납품분`}
              />
            </Field>
          </FormSection>
        </Stack>
      </Card>
      <ActionBar
        sticky
        summary={`합계 ${formatAmount(supply + tax)}원 · 품목 ${lines.filter((l) => l.itemId).length}건`}
      >
        <Button onPress={() => toast.show({ title: '임시 저장했습니다', tone: 'neutral' })}>
          임시 저장
        </Button>
        <Button icon="eye" onPress={() => setPreview(true)}>
          미리 보기
        </Button>
        <Button
          variant="primary"
          icon="send"
          disabled={!canIssue}
          onPress={() => {
            setTried(true);
            if (valid) setConfirm(true);
          }}
        >
          발행
        </Button>
      </ActionBar>
      <Dialog
        open={preview}
        onOpenChange={setPreview}
        size="lg"
        title={`${docTitle} 미리 보기`}
        description="인쇄 창에서 PDF로 저장할 수 있습니다. 발행 전이라 승인번호는 비어 있습니다."
        footer={
          <>
            <DialogClose render={<Button>닫기</Button>} />
            <Button
              variant="primary"
              icon="printer"
              onPress={() =>
                void print(paper, {
                  fileName: `${docTitle}_${buyer?.name ?? ''}_${date ?? TODAY}`,
                })
              }
            >
              인쇄
            </Button>
          </>
        }
      >
        <PaperPreview label={`${docTitle} 미리 보기`}>{paper}</PaperPreview>
      </Dialog>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`${buyer?.name ?? ''}에 ${doc}를 발행합니다`}
        description={`합계 ${formatAmount(supply + tax)}원(${formatKoreanAmount(supply + tax)}). 오늘 ${SEND_AT} 일괄 전송 때 국세청으로 보냅니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  onPress={() => {
                    toast.show({
                      title: `${doc}를 발행했습니다`,
                      description: `${buyer?.name} · ${formatAmount(supply + tax)}원`,
                      tone: 'success',
                    });
                    screens.go('erp/tax/invoice-list');
                  }}
                >
                  발행
                </Button>
              }
            />
          </>
        }
      />
    </Page>
  );
}
