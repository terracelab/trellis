import { formatAmount, formatBizNo, paginateMoneyRows } from '@terracelab/trellis-contracts';
import { useState, type CSSProperties } from 'react';
import { Button } from '../Button/Button.js';
import {
  Paper,
  PaperFields,
  PaperMoneyTable,
  PaperSeal,
  PaperSignature,
  PaperSignPair,
  PaperText,
  PaperTitle,
} from './Paper.js';
import { PaperPreview } from './PaperPreview.js';
import { usePrintPapers } from './print.js';

// 예시용 직인 이미지(회사가 올린 도장 이미지 자리, SVG를 base64로 넣었다). 색은 이미지 내용이라 토큰이 아니다
const SEAL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNDODMxMkIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIG9wYWNpdHk9IjAuODgiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2Utd2lkdGg9IjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOC41IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zMSAzMWgxNXYxNUgzMXpNNTQgMzFoMTV2MTVINTR6TTMxIDU0aDE1djE1SDMxek01NCA1NGgxNXYxNUg1NHoiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0zOC41IDMxdjE1TTMxIDM4LjVoMTVNNTQgMzguNWgxNU02MS41IDMxdjE1TTMxIDYxLjVoMTVNMzguNSA1NHYxNU01NCA2MS41aDE1TTYxLjUgNTR2MTUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=';

const COMPANY = {
  name: '주식회사 테라트레이딩',
  bizNo: formatBizNo('2148736125'),
  ceo: '박은서',
  address: '서울특별시 성동구 성수이로 118, 7층',
};

/** 재직증명서 — 인적 사항 · 회사 · 재직 사항 칸 표, 확인 문장, 날짜 · 회사 · 직인. 위 줄은 발급 번호, 아래 줄은 진위 확인 번호입니다. */
export function EmploymentCertificate() {
  return (
    <PaperPreview label="재직증명서 미리보기">
      <Paper
        label="재직증명서"
        header={
          <>
            <span>발급 번호 HR-2026-0412</span>
            <span>{COMPANY.name}</span>
          </>
        }
        footer={
          <>
            <span>진위 확인 번호 7F3K-92QD</span>
            <span>인사팀 02-6953-1180에서 확인할 수 있습니다</span>
          </>
        }
      >
        <PaperTitle>재직증명서</PaperTitle>
        <PaperFields
          title="인적 사항"
          rows={[
            { label: '성명', value: '이도윤' },
            { label: '생년월일', value: '1992년 4월 18일' },
            { label: '주소', value: '서울특별시 마포구 월드컵북로 21, 2층', full: true },
          ]}
        />
        <PaperFields
          title="회사"
          rows={[
            { label: '회사명', value: COMPANY.name },
            { label: '사업자등록번호', value: COMPANY.bizNo },
            { label: '대표자', value: COMPANY.ceo },
            { label: '소재지', value: COMPANY.address },
          ]}
        />
        <PaperFields
          title="재직 사항"
          rows={[
            { label: '소속', value: '영업팀' },
            { label: '직위', value: '대리' },
            { label: '재직 기간', value: '2022년 3월 2일~현재', full: true },
            { label: '용도', value: '금융기관 제출' },
            { label: '제출처', value: '' },
          ]}
        />
        <PaperText variant="statement">위 사람은 현재 당사에 재직하고 있음을 증명합니다.</PaperText>
        <PaperSignature
          date="2026-11-09"
          company={COMPANY.name}
          representative={COMPANY.ceo}
          seal={SEAL}
        />
        <PaperText variant="note">
          근로기준법 제39조(사용증명서)에 따라 근로자가 요구한 사항만 사실대로 적었습니다.
        </PaperText>
      </Paper>
    </PaperPreview>
  );
}

const EARNINGS = [
  ['기본급', 3200000, '월 정액'],
  ['직책 수당', 200000, '대리 직책'],
  ['식대(비과세)', 200000, '월 20만 원 한도'],
];

const DEDUCTIONS = [
  ['국민연금', 153000, '기준소득월액 × 4.5%'],
  ['건강보험', 120530, '보수월액 × 3.545%'],
  ['장기요양보험', 15600, '건강보험료 × 12.95%'],
  ['고용보험', 30600, '보수월액 × 0.9%'],
  ['소득세', 84850, '간이세액표'],
  ['지방소득세', 8480, '소득세 × 10%'],
];

/** 급여명세서 — 지급 · 공제 표는 항목 · 금액 · 계산 방법이고, 합계 줄이 임금 총액 · 공제 총액입니다. 임금명세서는 서명 칸이 없습니다. */
export function Payslip() {
  return (
    <PaperPreview label="급여명세서 미리보기">
      <Paper
        label="2026년 10월분 급여명세서"
        header={
          <>
            <span>교부일 2026-10-24</span>
            <span>{COMPANY.name}</span>
          </>
        }
      >
        <PaperTitle subtitle="2026년 10월분">급여명세서</PaperTitle>
        <PaperFields
          title="인적 사항"
          rows={[
            { label: '성명', value: '이도윤' },
            { label: '사원번호', value: 'E-1027' },
            { label: '소속 · 직위', value: '영업팀 · 대리' },
            { label: '임금 지급일', value: '2026년 10월 24일' },
            { label: '근로일수', value: '22일' },
            { label: '근로시간 수', value: '연장 4 · 야간 0 · 휴일 0시간' },
            { label: '지급 계좌', value: '기업은행 482-019284-01-013', full: true },
          ]}
        />
        <PaperMoneyTable
          title="지급 내역"
          note="단위: 원"
          columns={[{ header: '항목' }, { header: '금액', width: 'md' }, { header: '계산 방법' }]}
          rows={EARNINGS}
          total={['임금 총액', 3600000, '지급 항목 합계']}
        />
        <PaperMoneyTable
          title="공제 내역"
          note="단위: 원. 보험료 · 세액은 10원 미만을 버립니다."
          columns={[{ header: '항목' }, { header: '금액', width: 'md' }, { header: '계산 방법' }]}
          rows={DEDUCTIONS}
          total={['공제 총액', 413060, '공제 항목 합계']}
        />
        <PaperFields
          columns={2}
          rows={[{ label: '실지급액', value: `${formatAmount(3186940)}원(임금 총액 − 공제 총액)` }]}
        />
        <PaperText variant="note">
          근로기준법 제48조 제2항과 같은 법 시행령 제27조의2에 따른 임금명세서입니다.
        </PaperText>
      </Paper>
    </PaperPreview>
  );
}

/** 2쪽 문서 — 근로계약서. 쪽마다 Paper 하나이고, 인쇄하면 한 장씩 나뉩니다. 2쪽 아래는 사업주 · 근로자 서명입니다. */
export function TwoPages() {
  return (
    <PaperPreview label="근로계약서 미리보기">
      <Paper label="근로계약서 1쪽" footer={<span>1 / 2</span>}>
        <PaperTitle>근로계약서</PaperTitle>
        <PaperText>
          {COMPANY.name}(이하 사업주)과 이도윤(이하 근로자)은 다음과 같이 근로계약을 체결한다.
        </PaperText>
        <PaperFields
          title="근로 조건"
          columns={2}
          rows={[
            { label: '1. 근로개시일', value: '2022년 3월 2일부터' },
            { label: '2. 근무 장소', value: `본사(${COMPANY.address})` },
            { label: '3. 업무 내용', value: '국내 영업 · 거래처 관리' },
            { label: '4. 소정근로시간', value: '09:00~18:00(휴게 12:00~13:00)' },
            { label: '5. 근무일 · 휴일', value: '매주 5일(월~금) 근무, 주휴일 매주 일요일' },
          ]}
        />
        <PaperMoneyTable
          title="6. 임금"
          note="단위: 원. 매월 24일 근로자 명의 계좌로 지급한다."
          columns={[{ header: '구분' }, { header: '월 금액', width: 'md' }, { header: '비고' }]}
          rows={[
            ['기본급', 3200000, ''],
            ['직책 수당', 200000, '대리 직책'],
            ['식대', 200000, '비과세'],
          ]}
          total={['월 합계', 3600000, '']}
        />
      </Paper>
      <Paper label="근로계약서 2쪽" footer={<span>2 / 2</span>}>
        <PaperFields
          title="근로 조건(계속)"
          columns={2}
          rows={[
            { label: '7. 연차유급휴가', value: '근로기준법에서 정하는 바에 따라 부여함' },
            { label: '8. 사회보험 적용', value: '고용보험 · 산재보험 · 국민연금 · 건강보험' },
            {
              label: '9. 근로계약서 교부',
              value: '사업주는 계약을 체결함과 동시에 본 계약서를 사본하여 근로자에게 교부함',
            },
            { label: '10. 기타', value: '이 계약에 정함이 없는 사항은 근로기준법령에 의함' },
          ]}
        />
        <PaperSignPair
          date="2022-02-25"
          left={{
            title: '사업주',
            rows: [
              { label: '사업체명', value: COMPANY.name },
              { label: '주소', value: COMPANY.address },
              {
                label: '대표자',
                value: (
                  <>
                    {COMPANY.ceo} <PaperSeal src={SEAL} name={COMPANY.name} />
                  </>
                ),
              },
            ],
          }}
          right={{
            title: '근로자',
            rows: [
              { label: '성명', value: '이도윤' },
              { label: '주소', value: '서울특별시 마포구 월드컵북로 21, 2층' },
              { label: '연락처', value: '010-4821-7730' },
              { label: '서명', value: '(서명)' },
            ],
          }}
        />
      </Paper>
    </PaperPreview>
  );
}

// 소득세 3%와 지방소득세(소득세의 10%), 10원 미만은 버렸다
const BIZ_ROWS = [
  ['2026-01-25', '2026-01', 2500000, '3%', 75000, 7500],
  ['2026-02-25', '2026-02', 2500000, '3%', 75000, 7500],
  ['2026-03-25', '2026-03', 3200000, '3%', 96000, 9600],
  ['2026-04-24', '2026-04', 2500000, '3%', 75000, 7500],
  ['2026-05-25', '2026-05', 1800000, '3%', 54000, 5400],
  ['2026-06-25', '2026-06', 2500000, '3%', 75000, 7500],
  ['2026-07-24', '2026-07', 2500000, '3%', 75000, 7500],
  ['2026-08-25', '2026-08', 4100000, '3%', 123000, 12300],
  ['2026-09-25', '2026-09', 2500000, '3%', 75000, 7500],
  ['2026-10-23', '2026-10', 2500000, '3%', 75000, 7500],
];

/** 칸이 많은 서식 — density compact · margin sm. 사업소득 원천징수영수증처럼 표가 긴 서식을 한 장에 넣습니다. */
export function CompactForm() {
  return (
    <PaperPreview label="사업소득 원천징수영수증 미리보기">
      <Paper label="거주자의 사업소득 원천징수영수증" density="compact" margin="sm">
        <PaperTitle subtitle="2026년 귀속">사업소득 원천징수영수증</PaperTitle>
        <PaperFields
          title="징수의무자"
          rows={[
            { label: '법인명(상호)', value: COMPANY.name },
            { label: '사업자등록번호', value: COMPANY.bizNo },
            { label: '대표자(성명)', value: COMPANY.ceo },
            { label: '법인등록번호', value: '110111-7654321' },
            { label: '소재지(주소)', value: COMPANY.address, full: true },
          ]}
        />
        <PaperFields
          title="소득자"
          rows={[
            { label: '성명', value: '한지우' },
            { label: '주민등록번호', value: '880512-2******' },
            { label: '주소', value: '경기도 성남시 분당구 정자일로 95, 1203호', full: true },
            { label: '업종(하는 일)', value: '디자인 용역' },
            { label: '귀속 연도', value: '2026년' },
          ]}
        />
        <PaperMoneyTable
          title="지급 내역"
          note="단위: 원. 지급 총액에서 소득세 3%와 지방소득세(소득세의 10%)를 떼고 지급했습니다."
          columns={[
            { header: '지급 연월일', width: 'sm' },
            { header: '귀속 연월', width: 'sm' },
            { header: '지급 총액' },
            { header: '세율', width: 'xs', align: 'right' },
            { header: '소득세' },
            { header: '지방소득세' },
          ]}
          rows={BIZ_ROWS}
          total={['합계', '10건', 26600000, '', 798000, 79800]}
        />
        <PaperText variant="statement">
          위의 원천징수액(사업소득)을 정히 영수(지급)합니다.
        </PaperText>
        <PaperSignature
          date="2026-11-09"
          company={COMPANY.name}
          role="징수(보고)의무자"
          representative={COMPANY.ceo}
          seal={SEAL}
        />
        <PaperText variant="statement">세무서장 귀하</PaperText>
      </Paper>
    </PaperPreview>
  );
}

/** 다크 화면 — 감싼 화면이 다크여도 종이는 paper 토큰으로 흰 바탕 · 검은 글자입니다. */
export function DarkScreen() {
  return (
    <div
      data-theme="dark"
      style={{
        padding: 'var(--tl-space-16)',
        borderRadius: 'var(--tl-radius-lg)',
        background: 'var(--tl-color-bg-canvas)',
      }}
    >
      <PaperPreview label="영수증 미리보기">
        <Paper size="a5" label="영수증">
          <PaperTitle subtitle="2026-11-06 · 공급받는 자 보관용">영수증</PaperTitle>
          <PaperFields
            columns={2}
            rows={[
              { label: '공급자', value: COMPANY.name },
              { label: '사업자등록번호', value: COMPANY.bizNo },
              { label: '공급받는 자', value: '대양상사' },
            ]}
          />
          <PaperMoneyTable
            columns={[{ header: '품목' }, { header: '수량', width: 'xs' }, { header: '금액' }]}
            rows={[
              ['복사 용지 A4', 10, 248000],
              ['토너 카트리지', 1, 38000],
            ]}
            total={['합계', 11, 286000]}
          />
          <PaperText variant="statement">위 금액을 정히 영수합니다.</PaperText>
        </Paper>
      </PaperPreview>
    </div>
  );
}

/** 직인 있음 · 없음 — 직인 이미지가 있으면 "(인)" 위에 찍고, 없으면 "(인)"만 남깁니다. */
export function SealImage() {
  return (
    <PaperPreview label="직인 비교 미리보기">
      <Paper size="a5" orientation="landscape" label="확인서, 직인 이미지 있음">
        <PaperTitle>확인서</PaperTitle>
        <PaperText variant="statement">위와 같이 확인합니다.</PaperText>
        <PaperSignature
          date="2026-11-09"
          company={COMPANY.name}
          representative={COMPANY.ceo}
          seal={SEAL}
        />
      </Paper>
      <Paper size="a5" orientation="landscape" label="확인서, 직인 이미지 없음">
        <PaperTitle>확인서</PaperTitle>
        <PaperText variant="statement">위와 같이 확인합니다.</PaperText>
        <PaperSignature date="2026-11-09" company={COMPANY.name} representative={COMPANY.ceo} />
      </Paper>
    </PaperPreview>
  );
}

/** 인쇄 · PDF로 저장 — 단추를 누르면 종이만 인쇄 창으로 보냅니다. 인쇄 창에서 PDF로 저장하면 파일 이름이 fileName입니다. 인쇄 창이 열리면 onOpen, 닫히면 onClose가 불립니다. */
export function PrintButton() {
  const print = usePrintPapers();
  const [status, setStatus] = useState('');
  const page = (
    <Paper label="재직증명서">
      <PaperTitle>재직증명서</PaperTitle>
      <PaperFields
        title="인적 사항"
        rows={[
          { label: '성명', value: '이도윤' },
          { label: '소속 · 직위', value: '영업팀 · 대리' },
        ]}
      />
      <PaperText variant="statement">위 사람은 현재 당사에 재직하고 있음을 증명합니다.</PaperText>
      <PaperSignature
        date="2026-11-09"
        company={COMPANY.name}
        representative={COMPANY.ceo}
        seal={SEAL}
      />
    </Paper>
  );
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-12)' }}>
        <Button
          icon="printer"
          onPress={() =>
            void print(page, {
              fileName: '재직증명서_이도윤',
              // 발급 대장에 남길 자리. 인쇄했는지 취소했는지는 브라우저가 알려 주지 않는다
              onOpen: () => setStatus('인쇄 창을 열었습니다'),
              onClose: () => setStatus('인쇄 창을 닫았습니다'),
            })
          }
        >
          인쇄
        </Button>
        <span role="status">{status}</span>
      </div>
      <PaperPreview label="재직증명서 미리보기">{page}</PaperPreview>
    </div>
  );
}

const RECEIPT_ITEMS = [
  ['복사 용지 A4', 10, 24800],
  ['토너 카트리지', 1, 38000],
  ['스테이플러', 2, 6500],
  ['클립 소', 5, 1200],
  ['포스트잇', 6, 2300],
  ['네임펜 흑색', 12, 900],
  ['서류 봉투', 50, 150],
  ['L자 파일', 20, 400],
  ['수정 테이프', 4, 1800],
  ['박스 테이프', 3, 2100],
  ['볼펜 흑색', 24, 500],
  ['형광펜', 6, 1100],
  ['인주', 1, 3500],
] as const;

/** 한 장을 넘는 종이 — 내용이 종이 높이를 넘으면 미리보기가 1장이 끝나는 자리에 점선을 긋고 위에 안내를 띄웁니다. 앱은 onOverflowChange로 같은 사실을 받습니다. 여기서는 compact로 줄이는 단추를 보여 줍니다. */
export function Overflow() {
  const [overflow, setOverflow] = useState(false);
  const [compact, setCompact] = useState(false);
  const total = RECEIPT_ITEMS.reduce((sum, [, qty, price]) => sum + qty * price, 0);
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
        {overflow && !compact && (
          <Button variant="secondary" onPress={() => setCompact(true)}>
            한 장에 맞추기
          </Button>
        )}
        {compact && (
          <Button variant="ghost" onPress={() => setCompact(false)}>
            원래 크기
          </Button>
        )}
      </div>
      <PaperPreview label="거래명세서 미리보기">
        <Paper
          size="a5"
          label="거래명세서"
          density={compact ? 'compact' : 'regular'}
          margin={compact ? 'sm' : 'md'}
          onOverflowChange={setOverflow}
        >
          <PaperTitle subtitle="2026-11-06 · 공급받는 자 보관용">거래명세서</PaperTitle>
          <PaperFields
            columns={2}
            rows={[
              { label: '공급자', value: COMPANY.name },
              { label: '등록번호', value: COMPANY.bizNo },
              { label: '공급받는 자', value: '대양상사' },
            ]}
          />
          <PaperMoneyTable
            columns={[
              { header: '품목' },
              { header: '수량', width: 'xs' },
              { header: '단가', width: 'sm' },
              { header: '금액', width: 'md' },
            ]}
            rows={RECEIPT_ITEMS.map(([name, qty, price]) => [name, qty, price, qty * price])}
            total={['합계', '', '', total]}
          />
          <PaperText variant="statement">위 금액을 정히 영수합니다.</PaperText>
        </Paper>
      </PaperPreview>
    </div>
  );
}

const LEDGER_ITEMS = [
  ['양파 15kg', 32000],
  ['대파 1단', 3800],
  ['깐마늘 1kg', 9500],
  ['감자 20kg', 41000],
  ['당근 10kg', 18500],
  ['애호박', 1600],
  ['청양고추 4kg', 27000],
  ['양배추', 3200],
] as const;

// 거래 44건(하루 2건, 10월 1일~22일): 날짜 · 품목 · 수량 · 단가 · 공급가액 · 세액(공급가액의 10%, 원 미만 버림)
const LEDGER_ROWS = Array.from({ length: 44 }, (_, i) => {
  const [name, price] = LEDGER_ITEMS[i % LEDGER_ITEMS.length]!;
  const qty = (i % 5) + 1;
  const supply = qty * price;
  const day = String(Math.floor(i / 2) + 1).padStart(2, '0');
  return [`2026-10-${day}`, name, qty, price, supply, Math.floor(supply / 10)] as const;
});
const LEDGER_TOTAL = LEDGER_ROWS.reduce<[number, number]>(
  (t, row) => [t[0] + row[4], t[1] + row[5]],
  [0, 0],
);

/** 여러 쪽으로 나눈 표 — paginateMoneyRows로 줄을 쪽마다 나눕니다. 둘째 쪽부터 앞 쪽 이월 줄, 마지막 쪽 앞까지 다음 쪽 이월 줄이 붙고 머리 줄은 쪽마다 다시 나옵니다. */
export function LongTable() {
  const pages = paginateMoneyRows(LEDGER_ROWS, { first: 16, rest: 22, sum: [4, 5] });
  const columns = [
    { header: '일자', width: 'md' },
    { header: '품목' },
    { header: '수량', width: 'xs' },
    { header: '단가', width: 'sm' },
    { header: '공급가액', width: 'md' },
    { header: '세액', width: 'sm' },
  ] as const;
  return (
    <PaperPreview label="거래내역서 미리보기">
      {pages.map(({ page, pages: count, rows, carryIn, carryOut }) => (
        <Paper
          key={page}
          label={`거래내역서 ${page}쪽`}
          footer={
            <>
              <span>{COMPANY.name}</span>
              <span>
                {page} / {count}
              </span>
            </>
          }
        >
          {page === 1 && (
            <>
              <PaperTitle subtitle="2026년 10월분">거래내역서</PaperTitle>
              <PaperFields
                rows={[
                  { label: '공급자', value: COMPANY.name },
                  { label: '사업자등록번호', value: COMPANY.bizNo },
                  { label: '공급받는 자', value: '한빛푸드' },
                  { label: '거래 기간', value: '2026-10-01~10-22' },
                ]}
              />
            </>
          )}
          <PaperMoneyTable
            title={page === 1 ? '거래 내역' : '거래 내역(계속)'}
            note={page === 1 ? '단위: 원' : undefined}
            columns={columns}
            rows={rows}
            carryIn={carryIn}
            carryOut={carryOut}
            total={page === count ? ['합계', '', '', '', ...LEDGER_TOTAL] : undefined}
          />
          {page === count && (
            <PaperSignature
              date="2026-10-31"
              company={COMPANY.name}
              representative={COMPANY.ceo}
              seal={SEAL}
            />
          )}
        </Paper>
      ))}
    </PaperPreview>
  );
}

const TYPE_STYLES = ['display', 'h1', 'h2', 'h3', 'body', 'label', 'caption'] as const;
// 앱의 글자 크기 모드 xl(1.3배)을 흉내 낸다. 같은 요소에서 자기 값을 곱하면 순환이 되므로
// 바깥 요소가 지금 값을 받아 두고 안쪽 요소에서 곱한다
const CAPTURE_TYPE = Object.fromEntries(
  TYPE_STYLES.flatMap((s) => [
    [`--example-${s}-size`, `var(--tl-type-${s}-font-size)`],
    [`--example-${s}-leading`, `var(--tl-type-${s}-line-height)`],
  ]),
) as CSSProperties;
const SCALE_TYPE = Object.fromEntries(
  TYPE_STYLES.flatMap((s) => [
    [`--tl-type-${s}-font-size`, `calc(var(--example-${s}-size) * 1.3)`],
    [`--tl-type-${s}-line-height`, `calc(var(--example-${s}-leading) * 1.3)`],
  ]),
) as CSSProperties;

/** 앱 글자 크기 1.3배 — 앱이 글자 크기 모드로 type 토큰을 키워도 종이 글자는 paper.type 토큰이라 그대로입니다. 위 문단은 앱 글자라 커지고, 인쇄물 쪽수는 바뀌지 않습니다. */
export function AppTextSize() {
  return (
    <div style={CAPTURE_TYPE}>
      <div style={{ ...SCALE_TYPE, display: 'grid', gap: 'var(--tl-space-12)' }}>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--tl-type-body-font-size)',
            lineHeight: 'var(--tl-type-body-line-height)',
          }}
        >
          이 문단은 앱 글자라 1.3배로 커졌습니다.
        </p>
        <PaperPreview label="확인서 미리보기">
          <Paper size="a5" orientation="landscape" label="확인서">
            <PaperTitle>확인서</PaperTitle>
            <PaperFields
              columns={2}
              rows={[
                { label: '성명', value: '이도윤' },
                { label: '소속 · 직위', value: '영업팀 · 대리' },
              ]}
            />
            <PaperText variant="statement">위와 같이 확인합니다.</PaperText>
            <PaperSignature date="2026-11-09" company={COMPANY.name} representative={COMPANY.ceo} />
          </Paper>
        </PaperPreview>
      </div>
    </div>
  );
}
