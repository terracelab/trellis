// 임금명세서(ListDetail): 왼쪽 지급 달 목록(실지급액) → 오른쪽 명세서(근로기준법 제48조 기재 사항) · 인쇄.
// 기본은 로그인한 사람 것. 인사 권한(hr-payroll update)이면 사원을 바꿔 볼 수 있다.
import { formatAmount, formatDate } from '@terracelab/trellis-contracts';
import { Button, PageHeader, Payslip, Select, SelectableList } from '@terracelab/trellis-react';
import { useState } from 'react';
import { employeeByName } from '../../../_data/erp.js';
import { PAYEES, PAYSLIP_MONTHS, payslipFor } from '../../../_data/hr.js';
import { PROFILE } from '../../../_data/profile.js';
import { useCan, usePlatform } from '../../../_platform/index.js';
import { Page, useSiblings, type SiblingScreen } from '../../../_ui/index.js';
import './style.css';

const ID = 'erp/hr-payroll/payslip';
const monthText = (period: string) => `${period.slice(0, 4)}년 ${Number(period.slice(5))}월`;

// slot: siblings — 제목 줄 탭(같은 묶음 화면). 라벨은 그 화면의 PageHeader title과 같게. 앱에 없는 화면은 빠진다
const SIBLINGS: readonly SiblingScreen[] = [
  { id: 'erp/hr-payroll/payroll', label: '급여 대장' },
  { id: 'erp/hr-payroll/payslip', label: '임금명세서' },
];
// slot: siblings end

export default function PayslipScreen() {
  const { session } = usePlatform();
  const titleTabs = useSiblings(ID, SIBLINGS);
  // slot: payee — 누구 명세서를 보는지. 기본은 로그인한 사람, 인사 권한이면 사원을 바꿔 본다
  const canOthers = useCan('hr-payroll', 'update');
  const me = PAYEES.find((e) => e.id === employeeByName(session.user.name)?.id) ?? PAYEES[0]!;
  // slot: payee end
  const [payeeId, setPayeeId] = useState(me.id);
  const [period, setPeriod] = useState<string>(PAYSLIP_MONTHS[0].period);
  const payee = (canOthers && PAYEES.find((e) => e.id === payeeId)) || me;
  const slip = payslipFor(payee, period);

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '인사·급여' }, { label: '임금명세서' }]}
          title="임금명세서"
          {...titleTabs}
          description={`${payee.name} ${payee.title} · ${payee.department} · 매월 25일 지급(휴일이면 앞 영업일)`}
          actions={
            <>
              <Button icon="download">PDF 다운로드</Button>
              <Button variant="primary" icon="printer" onPress={() => window.print()}>
                인쇄
              </Button>
            </>
          }
        />
      }
    >
      <div className="tl-block-slip">
        <div className="tl-block-slip__side">
          {canOthers && (
            <Select
              label="사원"
              value={payee.id}
              onChange={(v) => v && setPayeeId(v)}
              options={PAYEES.map((e) => ({
                value: e.id,
                label: `${e.name} · ${e.title} · ${e.department}`,
              }))}
            />
          )}
          {/* slot: months — 지급 달 목록(달 · 지급일 · 실지급액) */}
          <SelectableList
            label="지급 달"
            items={PAYSLIP_MONTHS.map((m) => ({
              id: m.period,
              title: monthText(m.period),
              secondary: `지급 ${formatDate(m.payDate, 'md')}`,
              value: `${formatAmount(payslipFor(payee, m.period).net)}원`,
            }))}
            selected={period}
            onSelect={setPeriod}
          />
          {/* slot: months end */}
        </div>
        <Payslip
          period={slip.period}
          payDate={slip.payDate}
          company={PROFILE.name}
          employee={{
            name: payee.name,
            employeeNo: payee.id,
            department: payee.department,
            position: payee.title,
          }}
          work={slip.work}
          earnings={slip.earnings}
          deductions={slip.deductions}
          // slot: note — 명세서 아래 안내(문의처 · 비과세 설명)
          note={`급여 문의는 경영지원팀으로 연락해 주세요. 비과세 항목(식대 · 자가운전보조금)은 소득세를 매기지 않습니다.`}
          // slot: note end
        />
      </div>
    </Page>
  );
}
