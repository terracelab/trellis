// 발주서 작성(FormRegister): 외화 단가 → 원화 환산, 견적서 첨부, 결재선 미리 보기 → 결재 요청
import {
  formatAmount,
  formatCompactWon,
  formatCurrency,
  type CurrencyCode,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  ApprovalLine,
  Badge,
  Button,
  Card,
  CodeSearch,
  DateField,
  Field,
  FileUpload,
  FormSection,
  Input,
  LineItemsEditor,
  PageHeader,
  QuantityInput,
  Select,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  ITEMS,
  itemById,
  PARTIES,
  partyById,
  rateOf,
  TODAY,
  PO_DRAFT,
  WAREHOUSES,
} from '../../../_data/index.js';
import { approvalLine, PROFILE } from '../../../_data/profile.js';
import { useCan, usePlatform, useScreens } from '../../../_platform/index.js';
import { Figure, Page, Stack } from '../../../_ui/index.js';
import '../../tax/invoice-issue/style.css';

interface Line {
  key: number;
  itemId: string | null;
  qty: number | null;
  price: number | null;
}

const suppliers = PARTIES.filter((p) => p.kind.includes('supplier'));
/** 결재선(기안자 다음): 회사 설정 */
const LINE = approvalLine();
const LINE_TEXT = LINE.map((a) => `${a.name} ${a.title} ${a.role}`).join(' 후 ');
const FINAL = LINE[LINE.length - 1];

export default function PoForm() {
  const toast = useToast();
  const { session } = usePlatform();
  const canCreate = useCan('purchasing', 'create');
  const screens = useScreens();
  const [partyId, setPartyId] = useState<string | null>(PO_DRAFT.partyId);
  const party = partyId ? partyById(partyId) : null;
  const [currency, setCurrency] = useState<string | null>(PO_DRAFT.currency);
  const [incoterms, setIncoterms] = useState<string | null>(PO_DRAFT.incoterms);
  const [due, setDue] = useState<string | null>(PO_DRAFT.dueDate);
  const [wh, setWh] = useState<string | null>(PO_DRAFT.warehouseId);
  const [lines, setLines] = useState<Line[]>(() =>
    PO_DRAFT.lines.map((l, i) => ({
      key: i + 1,
      itemId: l.itemId,
      qty: l.qty,
      price: l.unitPrice,
    })),
  );
  const [files, setFiles] = useState(() =>
    PO_DRAFT.files.map((f) => ({ ...f, status: 'done' as const })),
  );
  const cur = (currency ?? 'KRW') as CurrencyCode;
  const rate = rateOf(cur);
  const total = lines.reduce((a, l) => a + (l.qty ?? 0) * (l.price ?? 0), 0);
  return (
    <Page
      width="form"
      header={
        <PageHeader
          breadcrumbs={[
            { label: '구매' },
            {
              label: '발주',
              ...(screens.has('erp/purchasing/po-list')
                ? { href: screens.href('erp/purchasing/po-list') }
                : {}),
            },
            { label: '작성' },
          ]}
          title="발주서 작성"
          meta={<Badge tone="neutral">작성 중</Badge>}
          description={`외화 금액은 오늘 매매기준율(${cur} ${formatAmount(rate, { digits: 2 })}원)로 환산합니다`}
        />
      }
    >
      <Card>
        <Stack gap="lg">
          <FormSection title="거래 조건" columns={3}>
            <Field label="거래처" required span={2}>
              <CodeSearch
                value={party?.code ?? null}
                onChange={(code) => {
                  const p = suppliers.find((x) => x.code === code);
                  setPartyId(p?.id ?? null);
                  if (p) setCurrency(p.currency);
                }}
                options={suppliers.map((p) => ({ value: p.code, label: p.name, meta: p.country }))}
              />
            </Field>
            <Field label="통화" required>
              <Select
                value={currency}
                onChange={setCurrency}
                options={['KRW', 'USD', 'EUR', 'JPY', 'CNY'].map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label="인코텀즈" help="운임 · 보험 부담 기준">
              <Select
                value={incoterms}
                onChange={setIncoterms}
                disabled={cur === 'KRW'}
                options={['EXW', 'FOB', 'CIF', 'DAP'].map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label="납기" required>
              <DateField today={TODAY} value={due} onChange={setDue} min={TODAY} />
            </Field>
            <Field label="입고 창고" required>
              <Select
                value={wh}
                onChange={setWh}
                options={WAREHOUSES.map((w) => ({ value: w.id, label: `${w.name} · ${w.kind}` }))}
              />
            </Field>
            <Field label="결제 조건" span={2}>
              <Input value={party?.terms ?? ''} readOnly />
            </Field>
            <Field label="구매 담당">
              <Input value={`${session.user.name} ${session.user.title}`} readOnly />
            </Field>
          </FormSection>

          <FormSection title="품목" columns={1}>
            <LineItemsEditor
              caption="발주 품목"
              value={lines}
              onChange={setLines}
              lineKey="key"
              newLine={() => ({ key: Date.now(), itemId: null, qty: null, price: null })}
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
                      onChange={(code) =>
                        update({ itemId: ITEMS.find((i) => i.code === code)?.id ?? null })
                      }
                      options={ITEMS.map((i) => ({ value: i.code, label: i.name, meta: i.origin }))}
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
                  header: `단가(${cur})`,
                  format: 'currency',
                  currency: cur,
                  width: 'md',
                  render: (l, { label, update }) => (
                    <AmountInput
                      size="sm"
                      label={label}
                      currency={cur}
                      value={l.price}
                      onChange={(v) => update({ price: v })}
                    />
                  ),
                },
                {
                  key: 'amount',
                  header: '금액',
                  width: 'md',
                  format: 'currency',
                  currency: cur,
                  value: (l) => (l.qty ?? 0) * (l.price ?? 0),
                },
                {
                  key: 'krw',
                  header: '원화 환산',
                  width: 'md',
                  format: 'amount',
                  value: (l) => Math.round((l.qty ?? 0) * (l.price ?? 0) * rate),
                },
              ]}
            />
          </FormSection>

          <div className="tl-block-totals">
            <Figure label={`발주 합계(${cur})`} value={formatCurrency(total, cur)} />
            <Figure label="원화 환산" value={formatAmount(Math.round(total * rate))} unit="원" />
            <Figure
              label="수입 부가세 예상(10%)"
              value={cur === 'KRW' ? '–' : formatAmount(Math.round(total * rate * 0.1))}
              unit={cur === 'KRW' ? undefined : '원'}
            />
          </div>

          <FormSection
            title="첨부"
            columns={1}
            description="견적서(Proforma Invoice) · 사양서를 붙이면 결재자가 함께 봅니다"
          >
            <FileUpload
              accept=".pdf,.xlsx,.jpg,.png"
              multiple
              maxSize={10_000_000}
              hint="PDF · XLSX · 이미지, 10MB 이하"
              files={files}
              onFilesChange={(fs) =>
                setFiles((prev) => [
                  ...prev,
                  ...fs.map((f) => ({ name: f.name, size: f.size, status: 'done' as const })),
                ])
              }
              onRemove={(name) => setFiles((prev) => prev.filter((f) => f.name !== name))}
            />
          </FormSection>

          <FormSection
            title="결재선"
            columns={1}
            description={
              FINAL
                ? `발주 금액 ${formatCompactWon(PROFILE.approval.finalLimit)} 원 이상은 ${FINAL.title} ${FINAL.role}까지 올라갑니다`
                : undefined
            }
          >
            <ApprovalLine
              approvers={[
                {
                  id: 'a1',
                  name: session.user.name,
                  title: session.user.title,
                  role: '기안',
                  state: 'draft',
                },
                ...LINE.map((a, i) => ({
                  id: `a${i + 2}`,
                  name: a.name,
                  title: a.title,
                  role: a.role,
                  state: 'waiting' as const,
                })),
              ]}
            />
          </FormSection>
        </Stack>
      </Card>
      <ActionBar
        sticky
        summary={`${formatCurrency(total, cur)} · 원화 ${formatAmount(Math.round(total * rate))}원`}
      >
        <Button onPress={() => toast.show({ title: '임시 저장했습니다' })}>임시 저장</Button>
        <Button
          variant="primary"
          icon="send"
          disabled={!canCreate || !party || total === 0}
          onPress={() => {
            toast.show({
              title: '결재를 요청했습니다',
              description: LINE_TEXT,
              tone: 'success',
            });
            screens.go('erp/purchasing/po-list');
          }}
        >
          결재 요청
        </Button>
      </ActionBar>
    </Page>
  );
}
