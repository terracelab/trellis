// 급여 대장(ListDetail): 11월 급여. 지급 · 공제(4대보험 · 소득세 · 지방소득세) · 실지급액 · 확정 → 지급 · 급여명세서
import {
  formatAmount,
  formatDate,
  formatKoreanAmount,
  formatPercent,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  FilterBar,
  Input,
  PageHeader,
  Select,
  Stepper,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  BANK_ACCOUNTS,
  EMPLOYEES,
  PAY_DAY,
  PAYROLL,
  PAYROLL_PREV,
  PAYROLL_STATES,
  PAYROLL_TOTAL,
  type PayrollState,
  type Payslip,
} from '../../../_data/erp.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, usePlatform } from '../../../_platform/index.js';
import {
  ExportButton,
  Figure,
  Page,
  useSiblings,
  type CsvColumn,
  type SiblingScreen,
} from '../../../_ui/index.js';
import './style.css';

/** 귀속 연월(지급일 기준) · 급여 이체 은행(원화 주거래 계좌) */
const PAY_YEAR = PAY_DAY.slice(0, 4);
const PAY_MONTH = `${Number(PAY_DAY.slice(5, 7))}월`;
const PAY_BANK = BANK_ACCOUNTS.find((a) => a.currency === 'KRW')?.bank ?? '';

// slot: siblings — 제목 줄 탭(같은 묶음 화면). 라벨은 그 화면의 PageHeader title과 같게. 앱에 없는 화면은 빠진다
const SIBLINGS: readonly SiblingScreen[] = [
  { id: 'erp/hr-payroll/payroll', label: '급여 대장' },
  { id: 'erp/hr-payroll/payslip', label: '임금명세서' },
];
// slot: siblings end

type Row = Payslip & { id: string; name: string; department: string };
const ROWS: Row[] = PAYROLL.map((p) => ({
  ...p,
  id: p.employee.id,
  name: p.employee.name,
  department: p.employee.department,
}));
const DEPARTMENTS = [...new Set(ROWS.map((r) => r.department))];
const excluded = EMPLOYEES.filter((e) => e.status === 'leave');
const won = (v: number) => `${formatAmount(v)}원`;
/** 엑셀 다운로드 열: 표의 지급 · 공제 열과 같게(payItems · deductions slot을 바꾸면 여기도), 금액은 서식 없는 숫자 */
const CSV: CsvColumn<Row>[] = [
  { label: '사번', value: 'id' },
  { label: '이름', value: 'name' },
  { label: '부서', value: 'department' },
  { label: '기본급(원)', value: 'base' },
  { label: '수당(원)', value: 'allowance' },
  { label: '지급 합계(원)', value: 'gross' },
  { label: '국민연금(원)', value: 'pension' },
  { label: '건강보험(원)', value: 'health' },
  { label: '장기요양(원)', value: 'care' },
  { label: '고용보험(원)', value: 'employment' },
  { label: '소득세(원)', value: 'incomeTax' },
  { label: '지방소득세(원)', value: 'localTax' },
  { label: '공제 합계(원)', value: 'deduction' },
  { label: '실지급액(원)', value: 'net' },
];
const amount = (key: keyof Payslip & string, header: string, width?: 'sm' | 'md') => ({
  key,
  header,
  width,
  format: 'amount' as const,
  total: 'sum' as const,
});

export default function Payroll() {
  const toast = useToast();
  // 제목 줄 탭: 급여 대장 · 임금명세서(PR-27)
  const titleTabs = useSiblings('erp/hr-payroll/payroll', SIBLINGS);
  const { session } = usePlatform();
  const canApprove = useCan('hr-payroll', 'approve');
  const [state, setState] = useState<PayrollState>('draft');
  const [confirmedBy, setConfirmedBy] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [dept, setDept] = useState<string | null>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const shown = ROWS.filter(
    (r) =>
      (dept === 'all' || !dept || r.department === dept) && (!q || `${r.name}${r.id}`.includes(q)),
  );
  const open = ROWS.find((r) => r.id === openId) ?? null;
  const T = PAYROLL_TOTAL;
  const delta = (a: number, b: number) =>
    `전월 대비 ${formatAmount(Math.round(((a - b) / b) * 1000) / 10, { digits: 1, sign: 'always' })}%`;

  const stepState = (i: number) => {
    const at = state === 'draft' ? 0 : state === 'confirmed' ? 1 : 3;
    return at > i ? ('done' as const) : at === i ? ('current' as const) : ('todo' as const);
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '인사·급여' }, { label: '급여 대장' }]}
          title="급여 대장"
          {...titleTabs}
          meta={<Badge tone={PAYROLL_STATES[state].tone}>{PAYROLL_STATES[state].label}</Badge>}
          description={`${PAY_YEAR}년 ${PAY_MONTH} 귀속 · 지급일 ${formatDate(PAY_DAY, 'mdw')} · 휴직 ${excluded.length}명 제외`}
          actions={
            <>
              <ExportButton
                module="hr-payroll"
                name={`급여 대장 ${PAY_YEAR}년 ${PAY_MONTH}`}
                rows={shown}
                columns={CSV}
              >
                엑셀 다운로드
              </ExportButton>
              <Button icon="mail" disabled={state === 'draft'}>
                명세서 발송
              </Button>
              {state === 'draft' && (
                <Button
                  variant="primary"
                  icon="circle-check"
                  disabled={!canApprove}
                  onPress={() => setConfirm(true)}
                >
                  급여 확정
                </Button>
              )}
              {state !== 'draft' && (
                <Button
                  variant="primary"
                  icon="banknote"
                  disabled={!canApprove || state === 'paid'}
                  onPress={() => {
                    setState('paid');
                    toast.show({
                      title: `${PAY_MONTH} 급여 ${T.headcount}명을 지급 처리했습니다`,
                      description: `${PAY_BANK} 대량 이체 ${won(T.net)} · 예약일 ${formatDate(PAY_DAY, 'md')}`,
                      tone: 'success',
                    });
                  }}
                >
                  {state === 'paid' ? '지급 완료' : '지급 처리'}
                </Button>
              )}
            </>
          }
        />
      }
    >
      {/* slot: status — 급여 진행 단계(작성 · 확정 · 이체 · 발송)와 합계 숫자 */}
      <Card>
        <div className="tl-block-pay-summary">
          <Stepper
            size="sm"
            label="급여 진행"
            steps={[
              {
                id: 'draft',
                label: '작성',
                state: stepState(0),
                description: `${PAY_MONTH} 근태 마감 반영`,
              },
              {
                id: 'confirmed',
                label: '확정',
                state: stepState(1),
                description: confirmedBy
                  ? `${formatDate(TODAY, 'md')} · ${confirmedBy}`
                  : '지급 3일 전까지',
              },
              {
                id: 'paid',
                label: '지급',
                state: stepState(2),
                description: `${formatDate(PAY_DAY, 'md')} 이체`,
              },
            ]}
          />
          <div className="tl-block-pay-figures">
            <div className="tl-block-pay-figure">
              <Figure label="인원" value={formatAmount(T.headcount)} unit="명" />
              <span className="tl-block-muted">전월 {PAYROLL_PREV.headcount}명 · 퇴직 1명</span>
            </div>
            <div className="tl-block-pay-figure">
              <Figure label="지급 합계" value={formatAmount(T.gross)} unit="원" />
              <span className="tl-block-muted">{delta(T.gross, PAYROLL_PREV.gross)}</span>
            </div>
            <div className="tl-block-pay-figure">
              <Figure label="공제 합계" value={formatAmount(T.deduction)} unit="원" />
              <span className="tl-block-muted">
                지급 대비 {formatPercent((T.deduction / T.gross) * 100)}
              </span>
            </div>
            <div className="tl-block-pay-figure">
              <Figure label="실지급 합계" value={formatAmount(T.net)} unit="원" />
              <span className="tl-block-muted">{delta(T.net, PAYROLL_PREV.net)}</span>
            </div>
          </div>
        </div>
      </Card>
      {/* slot: status end */}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="이름 · 사번"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setDept('all');
        }}
        resultCount={shown.length}
      >
        <Select
          label="부서"
          size="sm"
          width="auto"
          value={dept}
          onChange={setDept}
          options={[
            { value: 'all', label: '부서 전체' },
            ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption={`${PAY_MONTH} 급여 대장`}
        className="tl-block-pay-grid"
        height="fill"
        rows={shown}
        rowKey="id"
        summary
        summaryLabel={`합계 ${shown.length}명`}
        onRowPress={(r) => setOpenId(r.id)}
        activeRowKey={openId}
        empty="이 조건의 사원이 없습니다. 부서나 검색어를 바꿔 보세요"
        columns={[
          {
            key: 'name',
            header: '사원',
            width: 'md',
            sticky: true,
            render: (r) => (
              <DataGridLines primary={`${r.name} ${r.employee.title}`} secondary={r.department} />
            ),
          },
          // slot: payItems — 지급 열(회사 수당 항목)
          amount('base', '기본급'),
          amount('allowance', '수당'),
          amount('gross', '지급 합계'),
          // slot: payItems end
          // slot: deductions — 공제 열(4대보험 · 세금)
          amount('pension', '국민연금'),
          amount('health', '건강보험'),
          amount('care', '장기요양'),
          amount('employment', '고용보험'),
          amount('incomeTax', '소득세'),
          amount('localTax', '지방소득세'),
          amount('deduction', '공제 합계'),
          // slot: deductions end
          {
            ...amount('net', '실지급액'),
            render: (r) => <span className="tl-block-pay-net">{formatAmount(r.net)}</span>,
          },
        ]}
      />

      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`${PAY_MONTH} 급여 ${T.headcount}명을 확정합니다`}
        description={`실지급 합계 ${won(T.net)}. 확정하면 금액을 고칠 수 없고 ${formatDate(PAY_DAY, 'mdw')}에 이체합니다. 급여명세서는 확정하면 메일로 보냅니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  onPress={() => {
                    setState('confirmed');
                    setConfirmedBy(`${session.user.name} ${session.user.title}`);
                    toast.show({
                      title: `${PAY_MONTH} 급여를 확정했습니다`,
                      description: `${T.headcount}명에게 급여명세서를 메일로 보냈습니다`,
                      tone: 'success',
                    });
                  }}
                >
                  급여 확정
                </Button>
              }
            />
          </>
        }
      >
        <DescriptionList
          columns={2}
          items={[
            { label: '지급 합계', value: won(T.gross) },
            { label: '공제 합계', value: won(T.deduction) },
            { label: '4대보험(근로자)', value: won(T.insurance) },
            { label: '소득세 · 지방소득세', value: won(T.withheld) },
          ]}
        />
      </Dialog>

      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open ? `${open.name} ${open.employee.title}` : ''}
        description={
          open ? `${open.department} · 사번 ${open.id} · ${PAY_YEAR}년 ${PAY_MONTH} 급여명세서` : ''
        }
        width="lg"
        actions={<Badge tone={PAYROLL_STATES[state].tone}>{PAYROLL_STATES[state].label}</Badge>}
        footer={
          <>
            <Button icon="printer">인쇄</Button>
            <Button
              variant="primary"
              icon="mail"
              disabled={state === 'draft'}
              onPress={() =>
                open &&
                toast.show({
                  title: `${open.name}님에게 급여명세서를 보냈습니다`,
                  description: open.employee.email,
                })
              }
            >
              명세서 발송
            </Button>
          </>
        }
      >
        {open && <Slip row={open} />}
      </Drawer>
    </Page>
  );
}

// slot: payslip — 서랍 안 명세서(지급 · 공제 항목 이름과 순서, 비과세 안내)
function Slip({ row }: { row: Row }) {
  const p = row.employee.pay!;
  return (
    <div className="tl-block-drawer-stack">
      <DescriptionList
        columns={2}
        items={[
          { label: '입사일', value: formatDate(row.employee.hiredAt) },
          { label: '고용 형태', value: row.employee.employment },
          { label: '공제대상가족', value: `${p.family}명(본인 포함)` },
          { label: '지급일', value: formatDate(PAY_DAY, 'mdw') },
          { label: '급여 계좌', value: row.employee.bank ?? '–', span: 2 },
        ]}
      />
      <div className="tl-block-pay-slip">
        <section className="tl-block-pay-slip__col" aria-label="지급 항목">
          <h3 className="tl-block-pay-slip__title">지급</h3>
          <DescriptionList
            columns={1}
            items={[
              { label: '기본급', value: won(p.base) },
              { label: '직책수당', value: won(p.position) },
              { label: '연장근로수당', value: won(p.overtime) },
              { label: '식대(비과세)', value: won(p.meal) },
              { label: '자가운전(비과세)', value: won(p.car) },
            ]}
          />
          <div className="tl-block-pay-slip__sum">
            <span>지급 합계</span>
            <span>{won(row.gross)}</span>
          </div>
        </section>
        <section className="tl-block-pay-slip__col" aria-label="공제 항목">
          <h3 className="tl-block-pay-slip__title">공제</h3>
          <DescriptionList
            columns={1}
            items={[
              { label: '국민연금', value: won(row.pension) },
              { label: '건강보험', value: won(row.health) },
              { label: '장기요양보험', value: won(row.care) },
              {
                label: '고용보험',
                value: row.employment ? won(row.employment) : '대표이사 적용 제외',
              },
              { label: '소득세', value: won(row.incomeTax) },
              { label: '지방소득세', value: won(row.localTax) },
            ]}
          />
          <div className="tl-block-pay-slip__sum">
            <span>공제 합계</span>
            <span>{won(row.deduction)}</span>
          </div>
        </section>
      </div>
      <div className="tl-block-pay-net-box">
        <Figure label="실지급액" value={formatAmount(row.net)} unit="원" />
        <span className="tl-block-pay-korean">{formatKoreanAmount(row.net)}</span>
        <span className="tl-block-pay-korean">
          과세 대상 {won(row.taxable)} · 비과세 {won(p.meal + p.car)}
        </span>
      </div>
    </div>
  );
}
// slot: payslip end
