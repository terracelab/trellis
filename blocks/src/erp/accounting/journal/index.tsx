// 전표 입력(LedgerEntry): 머리(일자 · 번호 · 적요) → 차변 · 대변 줄(LineItemsEditor) → 대차가 맞아야 저장. 칸 이동은 Enter
import { formatAmount, formatBizNo, formatDate } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  Badge,
  Banner,
  Button,
  Card,
  CodeSearch,
  DataGrid,
  DataGridLines,
  DateField,
  Field,
  FormSection,
  Input,
  LineItemsEditor,
  PageHeader,
  SegmentedControl,
  Select,
  useToast,
} from '@terracelab/trellis-react';
import { useRef, useState } from 'react';
import {
  ACCOUNTS,
  accountByCode,
  NEXT_VOUCHER_NO,
  VOUCHERS,
  voucherTotal,
  type Voucher,
} from '../../../_data/erp.js';
import {
  INVOICES,
  invoiceSupply,
  invoiceTax,
  PARTIES,
  partyById,
  TODAY,
} from '../../../_data/index.js';
import { useCan, useOpenLink, usePlatform } from '../../../_platform/index.js';
import { monthEnd, monthLabel, monthStart, Page, Stack } from '../../../_ui/index.js';
import './style.css';

interface Line {
  key: number;
  account: string | null;
  party: string | null;
  debit: number | null;
  credit: number | null;
  memo: string;
}

interface Head {
  date: string | null;
  kind: Voucher['kind'];
  evidence: Voucher['evidence'];
  memo: string;
  docNo: string;
}

/** 채권 · 채무 계정은 거래처가 있어야 거래처 원장에 쌓인다 */
/** 엑셀 업로드 화면(블록 id). 반영 권한은 그 화면이 본다 */
const IMPORT_LINK = 'platform/import/excel';
const NEEDS_PARTY = new Set(['1080', '1200', '1310', '2510', '2530']);
const ACCOUNT_OPTIONS = ACCOUNTS.map((a) => ({ value: a.code, label: a.name, meta: a.group }));
const PARTY_OPTIONS = PARTIES.map((p) => ({
  value: p.code,
  label: p.name,
  meta: p.bizNo ? formatBizNo(p.bizNo) : p.country,
}));
const partyIdOf = (code: string | null) => PARTIES.find((p) => p.code === code)?.id;
const seqOf = (no: string) => Number(no.slice(-4));

let lineKey = 100;
const blank = (): Line => ({
  key: (lineKey += 1),
  account: null,
  party: null,
  debit: null,
  credit: null,
  memo: '',
});

/**
 * 처음 화면: 발행 대기 첫 매출 세금계산서의 분개를 쓰는 중(데이터에서 만든다).
 * 부가세 금액이 비어 대차가 맞지 않는다
 */
const DRAFT_INVOICE = INVOICES.find((i) => i.kind === 'sales' && i.state === 'ready');
const DRAFT_PARTY = DRAFT_INVOICE ? partyById(DRAFT_INVOICE.partyId) : undefined;
const DRAFT_SUPPLY = DRAFT_INVOICE ? invoiceSupply(DRAFT_INVOICE) : 0;
const DRAFT_FIRST = DRAFT_INVOICE?.lines[0]?.name ?? '';
const DRAFT_HEAD: Head = {
  date: TODAY,
  kind: '대체',
  evidence: '세금계산서',
  memo: DRAFT_INVOICE
    ? `${DRAFT_PARTY?.name ?? ''} ${DRAFT_INVOICE.lines.map((l) => l.name).join(' · ')}`
    : '',
  docNo: DRAFT_INVOICE?.id ?? '',
};
const draftLines = (): Line[] =>
  DRAFT_INVOICE
    ? [
        {
          key: 1,
          account: '1080',
          party: DRAFT_PARTY?.code ?? null,
          debit: DRAFT_SUPPLY + invoiceTax(DRAFT_INVOICE),
          credit: null,
          memo: `${DRAFT_PARTY?.name ?? ''} 외상 매출`,
        },
        {
          key: 2,
          account: '4010',
          party: null,
          debit: null,
          credit: DRAFT_SUPPLY,
          memo: `${DRAFT_FIRST}${DRAFT_INVOICE.lines.length > 1 ? ' 외' : ''}`,
        },
        { key: 3, account: '2550', party: null, debit: null, credit: null, memo: '매출 부가세' },
      ]
    : [blank(), blank()];

export default function Journal() {
  const toast = useToast();
  const { session } = usePlatform();
  const canCreate = useCan('accounting', 'create');
  // 엑셀 업로드 화면(링크 규칙 '블록 id?k=v'). 앱에 그 화면이 없으면 단추를 그리지 않는다
  const openImport = useOpenLink()(IMPORT_LINK);
  const [vouchers, setVouchers] = useState<Voucher[]>(() => [...VOUCHERS]);
  const [seq, setSeq] = useState(seqOf(NEXT_VOUCHER_NO));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [head, setHead] = useState<Head>(DRAFT_HEAD);
  const [lines, setLines] = useState<Line[]>(draftLines);
  const editorRef = useRef<HTMLDivElement>(null);

  const number = editingId ?? `JV-2611-${String(seq).padStart(4, '0')}`;
  const debit = lines.reduce((a, l) => a + (l.debit ?? 0), 0);
  const credit = lines.reduce((a, l) => a + (l.credit ?? 0), 0);
  const diff = debit - credit;
  const balanced = diff === 0 && debit > 0;
  const lineError = (l: Line): string | null => {
    const amount = (l.debit ?? 0) + (l.credit ?? 0);
    if (l.debit && l.credit) return '차변과 대변 중 하나만 입력합니다';
    if (amount && !l.account) return '계정과목을 고르세요';
    if (amount && l.account && NEEDS_PARTY.has(l.account) && !l.party)
      return `${accountByCode(l.account)?.name}은 거래처가 필요합니다`;
    return null;
  };
  const firstError = lines.map((l, i) => [i + 1, lineError(l)] as const).find(([, e]) => e);
  /** 저장을 막는 이유(대차 → 줄 오류 → 머리 순서로 하나만) */
  const blocker =
    debit === 0 && credit === 0
      ? '금액 미입력'
      : !balanced
        ? `대차 불일치 ${formatAmount(Math.abs(diff))}원`
        : firstError
          ? `${firstError[0]}행 확인`
          : !head.memo
            ? '적요 미입력'
            : !head.date
              ? '일자 미입력'
              : null;
  const canSave = !blocker && canCreate;

  const set = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  /** 차액을 비어 있는 쪽 칸(없으면 새 줄)에 채운다 */
  const fillDiff = () => {
    const side: 'debit' | 'credit' = diff > 0 ? 'credit' : 'debit';
    const amount = Math.abs(diff);
    const patch = side === 'debit' ? { debit: amount } : { credit: amount };
    const empty = lines.find((l) => l.account && !l.debit && !l.credit);
    if (empty) set(empty.key, patch);
    else setLines((ls) => [...ls, { ...blank(), ...patch }]);
  };

  const reset = (nextSeq = seq) => {
    setEditingId(null);
    setSeq(nextSeq);
    setHead({ date: TODAY, kind: '대체', evidence: '없음', memo: '', docNo: '' });
    setLines([blank(), blank()]);
  };

  const load = (v: Voucher) => {
    setEditingId(v.id);
    setHead({
      date: v.date,
      kind: v.kind,
      evidence: v.evidence,
      memo: v.memo,
      docNo: v.docNo ?? '',
    });
    setLines(
      v.lines.map((l) => ({
        key: (lineKey += 1),
        account: l.account,
        party: l.partyId ? partyById(l.partyId).code : null,
        debit: l.debit || null,
        credit: l.credit || null,
        memo: l.memo ?? '',
      })),
    );
    // 불러온 전표가 보이게 입력 영역으로 올린다(움직임 줄이기 설정이면 바로)
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    editorRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  };

  const save = () => {
    if (!canSave) return;
    const v: Voucher = {
      id: number,
      date: head.date ?? TODAY,
      kind: head.kind,
      evidence: head.evidence,
      memo: head.memo,
      writer: `${session.user.name} ${session.user.title}`,
      docNo: head.docNo || undefined,
      lines: lines
        .filter((l) => l.account && (l.debit || l.credit))
        .map((l) => ({
          account: l.account!,
          partyId: partyIdOf(l.party),
          debit: l.debit ?? 0,
          credit: l.credit ?? 0,
          memo: l.memo || undefined,
        })),
    };
    setVouchers((vs) => (editingId ? vs.map((x) => (x.id === editingId ? v : x)) : [...vs, v]));
    toast.show({
      title: editingId ? `${v.id}을 수정했습니다` : `${v.id}을 저장했습니다`,
      description: `차변 · 대변 ${formatAmount(debit)}원 · ${v.lines.length}줄`,
      tone: 'success',
    });
    reset(editingId ? seq : seq + 1);
  };

  const listed = [...vouchers].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  );
  const status = balanced ? (
    <Badge tone="success">대차 일치</Badge>
  ) : (
    <Badge tone="danger">{blocker}</Badge>
  );

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '회계' }, { label: '전표 입력' }]}
          title="전표 입력"
          meta={editingId ? <Badge tone="info">수정</Badge> : <Badge tone="neutral">작성 중</Badge>}
          description="차변 합계와 대변 합계가 같아야 저장됩니다. Enter로 다음 칸으로 갑니다"
          actions={
            <>
              {openImport && (
                <Button icon="upload" onPress={openImport}>
                  엑셀 업로드
                </Button>
              )}
              <Button icon="file-plus" onPress={() => reset()}>
                새 전표
              </Button>
            </>
          }
        />
      }
    >
      <div ref={editorRef} className="tl-block-je-editor">
        <Card>
          <Stack gap="lg">
            <FormSection title="전표" columns={3}>
              <Field label="일자" required>
                <DateField
                  today={TODAY}
                  value={head.date}
                  onChange={(v) => setHead((h) => ({ ...h, date: v }))}
                  min={monthStart(TODAY)}
                  max={monthEnd(TODAY)}
                />
              </Field>
              <Field
                label="전표 번호"
                help={editingId ? '저장된 전표' : '저장할 때 확정되는 자동 번호'}
              >
                <Input value={number} readOnly />
              </Field>
              <Field label="구분">
                <SegmentedControl
                  value={head.kind}
                  onChange={(v) => setHead((h) => ({ ...h, kind: v as Head['kind'] }))}
                  options={[
                    { value: '대체', label: '대체' },
                    { value: '입금', label: '입금' },
                    { value: '출금', label: '출금' },
                  ]}
                />
              </Field>
              <Field
                label="적요"
                required
                error={balanced && !head.memo ? '적요를 입력하세요' : null}
              >
                <Input
                  value={head.memo}
                  onChange={(v) => setHead((h) => ({ ...h, memo: v }))}
                  placeholder={`${PARTIES[0]?.name ?? ''} ${Number(TODAY.slice(5, 7))}월 납품분`}
                  maxLength={60}
                />
              </Field>
              <Field label="증빙">
                <Select
                  value={head.evidence}
                  onChange={(v) =>
                    setHead((h) => ({ ...h, evidence: (v ?? '없음') as Head['evidence'] }))
                  }
                  options={[
                    { value: '세금계산서', label: '세금계산서' },
                    { value: '계산서', label: '계산서(면세)' },
                    { value: '카드', label: '법인카드' },
                    { value: '현금영수증', label: '현금영수증' },
                    { value: '없음', label: '증빙 없음' },
                  ]}
                />
              </Field>
              <Field label="연결 문서" help="세금계산서 · 입출금 번호">
                <Input
                  value={head.docNo}
                  onChange={(v) => setHead((h) => ({ ...h, docNo: v }))}
                  placeholder={INVOICES[0]?.id ?? ''}
                />
              </Field>
            </FormSection>

            <FormSection
              title="분개"
              description="채권 · 채무 계정은 거래처를 함께 고릅니다"
              columns={1}
            >
              <LineItemsEditor
                caption="분개"
                value={lines}
                onChange={setLines}
                lineKey="key"
                newLine={blank}
                minLines={2}
                numbered
                summary
                lineError={lineError}
                footer={status}
                columns={[
                  {
                    key: 'account',
                    header: '계정과목',
                    required: true,
                    mobile: 'title',
                    render: (l, { label, update }) => (
                      <CodeSearch
                        size="sm"
                        label={label}
                        value={l.account}
                        onChange={(v) => update({ account: v })}
                        options={ACCOUNT_OPTIONS}
                        placeholder="코드 · 계정"
                        invalid={!!lineError(l) && !l.account}
                      />
                    ),
                  },
                  {
                    key: 'party',
                    header: '거래처',
                    render: (l, { label, update }) => (
                      <CodeSearch
                        size="sm"
                        label={label}
                        value={l.party}
                        onChange={(v) => update({ party: v })}
                        options={PARTY_OPTIONS}
                        placeholder="거래처"
                        invalid={
                          !!lineError(l) && !!l.account && NEEDS_PARTY.has(l.account) && !l.party
                        }
                      />
                    ),
                  },
                  {
                    key: 'debit',
                    header: '차변',
                    width: 'md',
                    format: 'amount',
                    total: 'sum',
                    render: (l, { label, update }) => (
                      <AmountInput
                        size="sm"
                        label={label}
                        value={l.debit}
                        onChange={(v) => update({ debit: v })}
                        invalid={!!(l.debit && l.credit)}
                      />
                    ),
                  },
                  {
                    key: 'credit',
                    header: '대변',
                    width: 'md',
                    format: 'amount',
                    total: 'sum',
                    render: (l, { label, update }) => (
                      <AmountInput
                        size="sm"
                        label={label}
                        value={l.credit}
                        onChange={(v) => update({ credit: v })}
                        invalid={!!(l.debit && l.credit)}
                      />
                    ),
                  },
                  {
                    key: 'memo',
                    header: '적요',
                    width: 'lg',
                    render: (l, { label, update }) => (
                      <Input
                        size="sm"
                        label={label}
                        value={l.memo}
                        onChange={(v) => update({ memo: v })}
                        placeholder="적요"
                      />
                    ),
                  },
                ]}
              />
              {!balanced && (debit > 0 || credit > 0) && (
                <Banner
                  tone="danger"
                  title={`대차 불일치 ${formatAmount(Math.abs(diff))}원`}
                  action={
                    <Button size="sm" onPress={fillDiff}>
                      {diff > 0 ? '대변에 차액 넣기' : '차변에 차액 넣기'}
                    </Button>
                  }
                >
                  {diff > 0
                    ? `차변이 ${formatAmount(diff)}원 많습니다. 대변 금액을 채우거나 차변을 줄이세요.`
                    : `대변이 ${formatAmount(-diff)}원 많습니다. 차변 금액을 채우거나 대변을 줄이세요.`}
                </Banner>
              )}
            </FormSection>
          </Stack>
        </Card>
      </div>

      <Card
        title={`${monthLabel(TODAY)} 전표`}
        subtitle={`${listed.length}건 · 차변 합계 ${formatAmount(listed.reduce((a, v) => a + voucherTotal(v), 0))}원 · 누르면 불러옵니다`}
        padding="none"
      >
        <DataGrid
          caption={`${monthLabel(TODAY)} 전표`}
          className="tl-block-je-list"
          rows={listed}
          rowKey="id"
          activeRowKey={editingId}
          onRowPress={load}
          columns={[
            { key: 'date', header: '일자', width: 'sm', format: 'date' },
            {
              key: 'id',
              header: '전표 번호',
              width: 'md',
              render: (v) => <span className="tl-block-code">{v.id}</span>,
            },
            { key: 'kind', header: '구분', width: 'xs' },
            {
              key: 'memo',
              header: '적요',
              render: (v) => (
                <DataGridLines
                  primary={v.memo}
                  secondary={
                    <>
                      {v.lines
                        .filter((l) => l.debit)
                        .map((l) => accountByCode(l.account)?.name)
                        .join(' · ')}{' '}
                      /{' '}
                      {v.lines
                        .filter((l) => l.credit)
                        .map((l) => accountByCode(l.account)?.name)
                        .join(' · ')}
                    </>
                  }
                />
              ),
            },
            { key: 'evidence', header: '증빙', width: 'sm' },
            {
              key: 'total',
              header: '금액',
              width: 'md',
              format: 'amount',
              value: (v) => voucherTotal(v),
              render: (v) => formatAmount(voucherTotal(v)),
            },
            { key: 'writer', header: '작성자', width: 'md' },
          ]}
        />
      </Card>

      <ActionBar
        sticky
        summary={
          <span className="tl-block-je-summary">
            <span>
              {formatDate(head.date ?? TODAY)} · {number} · 차변 {formatAmount(debit)}원 · 대변{' '}
              {formatAmount(credit)}원
            </span>
            {balanced && blocker ? <Badge tone="warning">{blocker}</Badge> : status}
          </span>
        }
      >
        <Button onPress={() => toast.show({ title: '임시 저장했습니다', tone: 'neutral' })}>
          임시 저장
        </Button>
        <Button variant="primary" icon="save" disabled={!canSave} onPress={save}>
          {editingId ? '수정 저장' : '저장'}
        </Button>
      </ActionBar>
    </Page>
  );
}
