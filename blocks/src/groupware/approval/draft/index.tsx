// 기안 작성(FormRegister): 양식 → 제목 → 결재선(ApprovalLineEditor: 추가 · 순서 · 역할 · 참조) → 양식별 항목 · 본문 → 첨부 → 결재 요청
import {
  formatAmount,
  formatKoreanAmount,
  type ApprovalLineStep,
  type UploadFile,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  ApprovalLine,
  ApprovalLineEditor,
  Badge,
  Button,
  Card,
  CodeSearch,
  DateField,
  Dialog,
  DialogClose,
  Field,
  FileUpload,
  FormSection,
  Input,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  APPROVAL_ROUTE,
  approvalStore,
  DRAFT_SAMPLE,
  EMPLOYEES,
  empById,
  empByNo,
  empLabel,
  FORM_LABELS,
  FORM_PREFIX,
  GW_NOW,
  leaderOf,
  meOf,
  type ApprovalDoc,
  type Employee,
  type FormKind,
} from '../../../_data/groupware.js';
import { PARTIES, PURCHASE_ORDERS, TODAY } from '../../../_data/index.js';
import { useCan, usePlatform, useScreens } from '../../../_platform/index.js';
import { Page, Stack, yymm } from '../../../_ui/index.js';
import './style.css';

// slot: templates — 고를 수 있는 양식(회사가 쓰는 결재 양식)
const TEMPLATES: { value: FormKind; label: string }[] = [
  { value: 'expense', label: '지출결의' },
  { value: 'purchase', label: '품의' },
  { value: 'leave', label: '휴가' },
  { value: 'trip', label: '출장' },
];
// slot: templates end

// slot: defaultLine — 양식별 기본 결재선. 회사 전결 규정에 맞춘다
/** 양식별 기본 결재선(규칙은 데이터 APPROVAL_ROUTE). 휴가는 팀장 승인, 출장은 임원 승인 */
function defaultLine(me: Employee, form: FormKind): ApprovalLineStep[] {
  const R = APPROVAL_ROUTE;
  const lead = leaderOf(me);
  if (form === 'leave') return [{ person: lead.id, role: '승인' }];
  if (form === 'trip')
    return [
      ...(lead.id !== R.director ? [{ person: lead.id, role: '검토' as const }] : []),
      { person: R.director, role: '승인' },
    ];
  const line: ApprovalLineStep[] = [];
  // 팀장이 곧 대표(작은 회사)면 검토 칸 없이 대표 승인 하나로 간다
  if (lead.id !== me.id && lead.id !== R.ceo) line.push({ person: lead.id, role: '검토' });
  if (me.team !== R.financeTeam && me.id !== R.finance && R.finance !== R.ceo)
    line.push({ person: R.finance, role: '합의' });
  line.push({ person: R.ceo, role: '승인' });
  // 같은 사람이 두 번 들어가면 뒤의 칸(승인)을 남긴다
  return line.filter((l, i, a) => a.findLastIndex((x) => x.person === l.person) === i);
}
// slot: defaultLine end

const BODY = DRAFT_SAMPLE.forms;
const YYMM = yymm(TODAY);
const SUPPLIER_CODE = PARTIES.find((p) => p.kind.includes('supplier'))?.code ?? '';

const option = (e: Employee) => ({
  value: e.empNo,
  label: `${e.name} ${e.title}`,
  meta: e.team,
});

export default function ApprovalDraft() {
  const toast = useToast();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const canCreate = useCan('approval', 'create');
  const screens = useScreens();
  const [form, setForm] = useState<FormKind>('expense');
  const [title, setTitle] = useState(BODY.expense.title);
  const [body, setBody] = useState(BODY.expense.body);
  const [line, setLine] = useState<ApprovalLineStep[]>(() => defaultLine(me, 'expense'));
  const [cc, setCc] = useState<string[]>(() => [...DRAFT_SAMPLE.cc]);
  const [payKind, setPayKind] = useState<string | null>('transfer');
  const [payDate, setPayDate] = useState<string | null>(DRAFT_SAMPLE.payDate);
  const [amount, setAmount] = useState<number | null>(DRAFT_SAMPLE.amount);
  const [budget, setBudget] = useState<string | null>(DRAFT_SAMPLE.budgets[0]?.value ?? null);
  const [party, setParty] = useState<string | null>(null);
  const [from, setFrom] = useState<string | null>(DRAFT_SAMPLE.leave.from);
  const [to, setTo] = useState<string | null>(DRAFT_SAMPLE.leave.to);
  const [leaveKind, setLeaveKind] = useState<string | null>('annual');
  const [proxy, setProxy] = useState<string | null>(DRAFT_SAMPLE.leave.proxy);
  const [place, setPlace] = useState('');
  const [files, setFiles] = useState<UploadFile[]>(() =>
    DRAFT_SAMPLE.files.map((f) => ({ ...f, status: 'done' as const })),
  );
  const [tried, setTried] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // 결재선 · 참조에서 고르는 사람(기안자 빼고). 찾기는 이름 · 부서 · 사번
  const people = EMPLOYEES.filter((e) => e.id !== me.id).map((e) => ({
    id: e.id,
    name: e.name,
    title: e.title,
    meta: `${e.team} · ${e.duty}`,
    code: e.empNo,
  }));
  const titleError = tried && !title.trim() ? '제목을 쓰세요' : null;
  const lineError = tried && line.length === 0 ? '결재자를 한 명 이상 고르세요' : null;

  const changeForm = (v: string | null) => {
    const f = (v ?? 'expense') as FormKind;
    setForm(f);
    setTitle(BODY[f].title);
    setBody(BODY[f].body);
    setLine(defaultLine(me, f));
    setTried(false);
  };
  const submit = () => {
    setTried(true);
    if (!title.trim() || line.length === 0) return;
    setConfirm(true);
  };
  const send = () => {
    const seq = String(20 + approvalStore.get().filter((d) => d.form === form).length).padStart(
      4,
      '0',
    );
    const id = `${FORM_PREFIX[form]}-${YYMM}-${seq}`;
    const stamp = `${TODAY.slice(5)} ${GW_NOW}`;
    const doc: ApprovalDoc = {
      id,
      form,
      title: title.trim(),
      drafterId: me.id,
      draftedAt: `${TODAY} ${GW_NOW}`,
      dueDate: DRAFT_SAMPLE.dueDate,
      state: 'pending',
      line: [
        { empId: me.id, role: '기안', state: 'draft', time: stamp },
        ...line.map((l, i) => ({
          empId: l.person,
          role: l.role,
          state: i === 0 ? ('pending' as const) : ('waiting' as const),
        })),
      ],
      cc,
      ...(form === 'expense' || form === 'purchase' || form === 'trip'
        ? amount
          ? { amount }
          : {}
        : {}),
      fields:
        form === 'leave'
          ? [
              { label: '기간', value: from === to ? (from ?? '') : `${from}~${to?.slice(5)}` },
              { label: '업무 대행', value: proxy ? empLabel(empByNo(proxy)?.id ?? '') : '–' },
            ]
          : form === 'trip'
            ? [{ label: '출장지', value: place || '–' }]
            : [{ label: '지급 예정일', value: payDate ?? '–' }],
      body: body.trim(),
      files: files.map((f) => ({ name: f.name, size: f.size })),
    };
    approvalStore.add(doc);
    toast.show({
      title: '결재를 요청했습니다',
      description: `${id} · ${empLabel(line[0]!.person)}에게 알림을 보냈습니다`,
      tone: 'success',
    });
    screens.go('groupware/approval/inbox', { tab: 'drafted' });
  };

  return (
    <Page
      width="form"
      header={
        <PageHeader
          breadcrumbs={[
            { label: '전자결재' },
            {
              label: '결재함',
              ...(screens.has('groupware/approval/inbox')
                ? { href: screens.href('groupware/approval/inbox') }
                : {}),
            },
            { label: '기안 작성' },
          ]}
          title="기안 작성"
          meta={<Badge approval="draft" />}
          description="결재 요청하면 첫 결재자에게 알림이 갑니다. 결재선은 양식마다 기본값이 채워집니다"
        />
      }
    >
      <Card>
        <Stack gap="lg">
          <FormSection title="기본" columns={3}>
            <Field label="양식" required>
              <Select value={form} onChange={changeForm} options={TEMPLATES} />
            </Field>
            <Field label="기안자">
              <Input value={`${me.name} ${me.title} · ${me.team}`} readOnly />
            </Field>
            <Field label="기안일">
              <Input value={TODAY} readOnly />
            </Field>
            <Field label="제목" required span={3} error={titleError}>
              <Input
                value={title}
                onChange={setTitle}
                maxLength={60}
                invalid={!!titleError}
                placeholder={
                  form === 'purchase'
                    ? DRAFT_SAMPLE.placeholders.purchase
                    : DRAFT_SAMPLE.placeholders.trip
                }
              />
            </Field>
          </FormSection>

          <FormSection
            title="결재선 · 참조"
            columns={1}
            description="위에서 아래 순서로 결재합니다. 참조자는 결재가 끝나면 알림을 받습니다"
          >
            <ApprovalLineEditor
              people={people}
              drafter={{ id: me.id, name: me.name, title: me.title, meta: me.team }}
              value={line}
              onChange={setLine}
              cc={cc}
              onCcChange={setCc}
              {...(lineError ? { error: lineError } : {})}
            />
            <div className="tl-block-draft-preview">
              <ApprovalLine
                approvers={[
                  { id: me.id, name: me.name, title: me.title, role: '기안', state: 'draft' },
                  ...line.map((l) => ({
                    id: l.person,
                    name: empById(l.person).name,
                    title: empById(l.person).title,
                    role: l.role,
                    state: 'waiting' as const,
                  })),
                ]}
              />
            </div>
          </FormSection>

          {/* slot: formFields — 양식마다 입력 칸(지출 · 품의 · 휴가 · 출장) */}
          <FormSection title={`${FORM_LABELS[form]} 항목`} columns={form === 'leave' ? 2 : 3}>
            {form === 'expense' && (
              <>
                <Field label="지출 구분" required>
                  <Select
                    value={payKind}
                    onChange={setPayKind}
                    options={[
                      { value: 'transfer', label: '법인 계좌 이체' },
                      { value: 'card', label: '법인카드' },
                      { value: 'personal', label: '개인 선지급' },
                    ]}
                  />
                </Field>
                <Field label="지급 예정일" required>
                  <DateField today={TODAY} value={payDate} onChange={setPayDate} min={TODAY} />
                </Field>
                <Field label="예산 항목">
                  <Select value={budget} onChange={setBudget} options={DRAFT_SAMPLE.budgets} />
                </Field>
                <Field label="금액" required span={3} help="세액 포함 금액입니다">
                  <AmountInput value={amount} onChange={setAmount} showKorean />
                </Field>
              </>
            )}
            {form === 'purchase' && (
              <>
                <Field label="거래처" required>
                  <CodeSearch
                    value={party}
                    onChange={setParty}
                    options={PARTIES.filter((p) => p.kind.includes('supplier')).map((p) => ({
                      value: p.code,
                      label: p.name,
                      meta: p.currency,
                    }))}
                    placeholder={SUPPLIER_CODE}
                  />
                </Field>
                <Field label="납기">
                  <DateField today={TODAY} value={payDate} onChange={setPayDate} min={TODAY} />
                </Field>
                <Field label="관련 발주">
                  <Input placeholder={PURCHASE_ORDERS[0]?.id ?? ''} />
                </Field>
                <Field label="금액" required span={3}>
                  <AmountInput value={amount} onChange={setAmount} showKorean />
                </Field>
              </>
            )}
            {form === 'leave' && (
              <>
                <Field label="휴가 종류" required>
                  <Select
                    value={leaveKind}
                    onChange={setLeaveKind}
                    options={[
                      { value: 'annual', label: '연차' },
                      { value: 'am', label: '반차(오전)' },
                      { value: 'pm', label: '반차(오후)' },
                      { value: 'family', label: '경조 휴가' },
                    ]}
                  />
                </Field>
                <Field label="업무 대행" help="휴가 동안 결재 · 문의를 넘겨받습니다">
                  <CodeSearch
                    value={proxy}
                    onChange={setProxy}
                    options={EMPLOYEES.filter((e) => e.id !== me.id).map(option)}
                  />
                </Field>
                <Field label="시작일" required>
                  <DateField today={TODAY} value={from} onChange={setFrom} min={TODAY} />
                </Field>
                <Field label="종료일" required>
                  <DateField today={TODAY} value={to} onChange={setTo} min={from ?? TODAY} />
                </Field>
              </>
            )}
            {form === 'trip' && (
              <>
                <Field label="출장지" required>
                  <Input
                    value={place}
                    onChange={setPlace}
                    placeholder={DRAFT_SAMPLE.placeholders.place}
                  />
                </Field>
                <Field label="시작일" required>
                  <DateField today={TODAY} value={from} onChange={setFrom} min={TODAY} />
                </Field>
                <Field label="종료일" required>
                  <DateField today={TODAY} value={to} onChange={setTo} min={from ?? TODAY} />
                </Field>
                <Field label="예상 경비" span={3} help="교통 · 숙박 · 식비 합계입니다">
                  <AmountInput value={amount} onChange={setAmount} />
                </Field>
              </>
            )}
          </FormSection>
          {/* slot: formFields end */}

          <FormSection title="본문" columns={1}>
            <Field label="내용" required>
              <Textarea rows={6} maxLength={2000} value={body} onChange={setBody} />
            </Field>
          </FormSection>

          {/* slot: attachments — 첨부 형식 · 크기 */}
          <FormSection title="첨부" columns={1} description="증빙을 붙이면 결재자가 함께 봅니다">
            <FileUpload
              accept=".pdf,.xlsx,.jpg,.png"
              multiple
              maxSize={20_000_000}
              hint="PDF · XLSX · 이미지, 20MB 이하"
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
          {/* slot: attachments end */}
        </Stack>
      </Card>
      <ActionBar
        sticky
        summary={`${FORM_LABELS[form]} · 결재선 ${line.length}명 · 참조 ${cc.length}명${
          (form === 'expense' || form === 'purchase') && amount
            ? ` · ${formatAmount(amount, { unit: '원' })}`
            : ''
        }`}
      >
        <Button
          onPress={() =>
            toast.show({
              title: '임시 저장했습니다',
              description: '결재함 › 기안한 문서에서 이어 씁니다',
            })
          }
        >
          임시 저장
        </Button>
        <Button variant="primary" icon="send" disabled={!canCreate} onPress={submit}>
          결재 요청
        </Button>
      </ActionBar>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title="결재를 요청합니다"
        description={`${line.map((l) => `${l.role} ${empLabel(l.person)}`).join(' → ')} 순서로 결재합니다.${
          (form === 'expense' || form === 'purchase') && amount
            ? ` 금액 ${formatKoreanAmount(amount)}.`
            : ''
        }`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" icon="send" onPress={send}>
                  결재 요청
                </Button>
              }
            />
          </>
        }
      />
    </Page>
  );
}
