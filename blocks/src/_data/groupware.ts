// 그룹웨어 샘플 데이터(테라트레이딩(주) 임직원 24명). 결재 · 메일 · 근태 · 일정 · 게시판 · 메신저 블록이 같이 쓴다.
// 날짜는 trade.ts의 TODAY(2026-11-06 금) 기준으로 고정(결정적). 사람은 _platform/mock.ts USERS와 같은 id를 쓴다.
import {
  formatAmount,
  formatQuantity,
  type ApprovalLineRole,
  type ApprovalLineState,
  type ApprovalState,
  type AttachmentFile,
  type AvatarStatus,
  type MessageThreadReactionOption,
  type StatusTone,
} from '@terracelab/trellis-contracts';
import { useSyncExternalStore } from 'react';
import { PHOTO_DAMAGED_BOX, PHOTO_WET_BOX } from './media.js';
import { NOW, PROFILE } from './profile.js';
import { TODAY } from './trade.js';

/** 데모 현재 시각. 블록 전체가 쓰는 profile.ts의 NOW와 같다(예전 이름) */
export const GW_NOW = NOW;

/* ── 임직원 ─────────────────────────────────────────────── */

/** 부서 이름. 회사마다 다르다 */
export const TEAMS: readonly string[] = ['경영', '경영지원팀', '구매팀', '물류팀', '영업팀'];
export type Team = string;

export interface Employee {
  id: string;
  /** 사번(CodeSearch 값) */
  empNo: string;
  name: string;
  title: string;
  team: Team;
  /** 담당 업무 */
  duty: string;
  ext: string;
  email: string;
  presence: AvatarStatus;
}

const emp = (
  id: string,
  empNo: string,
  name: string,
  title: string,
  team: Team,
  duty: string,
  ext: string,
  mail: string,
  presence: AvatarStatus,
): Employee => ({
  id,
  empNo,
  name,
  title,
  team,
  duty,
  ext,
  email: `${mail}@terra-trading.example`,
  presence,
});

export const EMPLOYEES: readonly Employee[] = [
  emp('u01', 'T0801', '윤지호', '대표', '경영', '경영 총괄', '1001', 'ceo', 'online'),
  emp(
    'e02',
    'T1102',
    '조현석',
    '이사',
    '경영',
    '경영지원 · 구매 · 물류 총괄',
    '1002',
    'hyunseok.cho',
    'online',
  ),
  emp(
    'u02',
    'T1403',
    '김테라',
    '팀장',
    '경영지원팀',
    '회계 · 자금 · 인사',
    '1101',
    'terra.kim',
    'online',
  ),
  emp(
    'u03',
    'T1907',
    '박서연',
    '대리',
    '경영지원팀',
    '회계 · 세무',
    '1102',
    'seoyeon.park',
    'online',
  ),
  emp(
    'e05',
    'T2002',
    '안지수',
    '대리',
    '경영지원팀',
    '자금 · 법인카드',
    '1103',
    'jisu.ahn',
    'away',
  ),
  emp('e06', 'T2104', '송다인', '주임', '경영지원팀', '인사 · 총무', '1104', 'dain.song', 'online'),
  emp('e07', 'T2401', '문서윤', '사원', '경영지원팀', '회계 전표', '1105', 'seoyun.moon', 'online'),
  emp('e08', 'T1305', '강도현', '팀장', '구매팀', '구매 총괄', '1201', 'dohyun.kang', 'busy'),
  emp('u04', 'T1609', '이하은', '과장', '구매팀', '수입 구매(수산)', '1202', 'haeun.lee', 'away'),
  emp(
    'e10',
    'T1911',
    '신지아',
    '대리',
    '구매팀',
    '수입 구매(농산 · 유지)',
    '1203',
    'jia.shin',
    'online',
  ),
  emp(
    'e11',
    'T2103',
    '황민석',
    '주임',
    '구매팀',
    '수입 통관 · 보험',
    '1204',
    'minseok.hwang',
    'online',
  ),
  emp(
    'e12',
    'T2502',
    '배준혁',
    '사원',
    '구매팀',
    '국내 구매(포장재)',
    '1205',
    'junhyuk.bae',
    'offline',
  ),
  emp('e13', 'T1204', '장석진', '팀장', '물류팀', '물류 총괄', '1301', 'seokjin.jang', 'online'),
  emp(
    'u08',
    'T1508',
    '오태식',
    '과장',
    '물류팀',
    '이천 1센터 운영',
    '1302',
    'taesik.oh',
    'offline',
  ),
  emp(
    'u05',
    'T2006',
    '정우진',
    '주임',
    '물류팀',
    '평택 냉동센터 입고',
    '1303',
    'woojin.jung',
    'busy',
  ),
  emp(
    'e16',
    'T2108',
    '권태민',
    '주임',
    '물류팀',
    '이천 1센터 출고',
    '1304',
    'taemin.kwon',
    'online',
  ),
  emp(
    'e17',
    'T2307',
    '류현우',
    '사원',
    '물류팀',
    '평택 냉동센터 재고',
    '1305',
    'hyunwoo.ryu',
    'online',
  ),
  emp('e18', 'T2409', '김나래', '사원', '물류팀', '배차 · 배송', '1306', 'narae.kim', 'away'),
  emp('e19', 'T1306', '서정훈', '팀장', '영업팀', '영업 총괄', '1401', 'junghoon.seo', 'busy'),
  emp(
    'e20',
    'T1702',
    '홍예린',
    '과장',
    '영업팀',
    '외식 · 급식 거래처',
    '1402',
    'yerin.hong',
    'online',
  ),
  emp('e21', 'T1910', '고은비', '대리', '영업팀', '유통 거래처', '1403', 'eunbi.go', 'online'),
  emp('e22', 'T2005', '변승호', '대리', '영업팀', '신규 거래처', '1404', 'seungho.byun', 'offline'),
  emp(
    'u06',
    'T2406',
    '최민준',
    '사원',
    '영업팀',
    '수주 · 출고 요청',
    '1405',
    'minjun.choi',
    'online',
  ),
  emp('e24', 'T2610', '윤하람', '사원', '영업팀', '수주 관리', '1406', 'haram.yoon', 'online'),
];

export const empById = (id: string) => EMPLOYEES.find((e) => e.id === id) ?? EMPLOYEES[2]!;
export const empByNo = (no: string) => EMPLOYEES.find((e) => e.empNo === no);
/** 김테라 팀장 */
export const empLabel = (id: string) => `${empById(id).name} ${empById(id).title}`;
/** 팀장(팀장이 없거나 본인이면 조현석 이사) */
export const leaderOf = (e: Employee): Employee =>
  e.team === '경영' || e.title === '팀장'
    ? empById('e02')
    : (EMPLOYEES.find((x) => x.team === e.team && x.title === '팀장') ?? empById('e02'));
/** 세션 사용자 → 임직원(목록에 없으면 김테라 팀장) */
export const meOf = (userId: string) => empById(userId);

/** 근무 시간 글자: 4시간 48분 */
export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${formatAmount(r)}분`;
  return r === 0 ? `${formatAmount(h)}시간` : `${formatAmount(h)}시간 ${formatAmount(r)}분`;
}

/** '08:52' → 532 */
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
export const toHhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/* ── 전자결재 ───────────────────────────────────────────── */

export type FormKind = 'expense' | 'purchase' | 'leave' | 'trip';
export const FORM_LABELS: Record<FormKind, string> = {
  expense: '지출결의',
  purchase: '발주 품의',
  leave: '휴가 신청',
  trip: '출장 신청',
};
/** 문서 번호 머리(지출 EX · 품의 PR · 휴가 LV · 출장 BT) */
export const FORM_PREFIX: Record<FormKind, string> = {
  expense: 'EX',
  purchase: 'PR',
  leave: 'LV',
  trip: 'BT',
};

/**
 * 기본 결재선 규칙(기안 작성). 팀장 검토 → 경영지원 합의(돈이 나갈 때) → 대표 승인.
 * 휴가는 팀장 승인, 출장은 임원 승인. 값은 임직원 id
 */
export const APPROVAL_ROUTE = {
  /** 팀장이 없거나 팀장 본인일 때 위 결재자 · 출장 승인 */
  director: 'e02',
  /** 돈이 나가는 문서의 합의 */
  finance: 'u02',
  /** 합의를 건너뛰는 팀(돈을 다루는 팀) */
  financeTeam: '경영지원팀',
  /** 최종 승인 */
  ceo: 'u01',
};

/** 기안 작성 화면이 처음 채워 두는 예시(양식별 제목 · 본문 · 항목 · 첨부) */
export const DRAFT_SAMPLE = {
  forms: {
    expense: {
      title: '11월 1주 냉동 운송비 정산(동방로지스)',
      body: '11월 2일~6일 부산 신항 · 평택 냉동센터 구간 냉동 탑차 운송비를 정산합니다.\n세금계산서와 배차표를 붙입니다. 지급은 11월 10일 법인 계좌 이체로 합니다.',
    },
    purchase: {
      title: '',
      body: '구매 목적:\n거래처 · 품목 · 수량:\n단가 비교:\n납기 · 입고 창고:',
    },
    leave: { title: '연차 11월 27일(1일)', body: '개인 사유로 연차를 신청합니다.' },
    trip: { title: '', body: '출장 목적:\n일정:\n방문처:' },
  } as Record<FormKind, { title: string; body: string }>,
  /** 제목 칸 예시(품의 · 출장) */
  placeholders: {
    purchase: 'Hengtong 크라프트 박스 5호 20,000EA 발주',
    trip: '부산 신항 보세창고 재고 실사(11월 10일~11일)',
    place: '부산 신항 보세창고',
  },
  cc: ['u03'],
  payDate: '2026-11-10',
  amount: 2_860_000,
  /** 예산 항목(지출결의) */
  budgets: [
    { value: 'freight', label: '운반비(11월)' },
    { value: 'import', label: '수입 부대비용(11월)' },
    { value: 'office', label: '사무 · 관리비(11월)' },
  ],
  leave: { from: '2026-11-27', to: '2026-11-27', proxy: 'T1907' },
  /** 결재 기한(요청일 기준 영업일 3일) */
  dueDate: '2026-11-11',
  files: [
    { name: '세금계산서_동방로지스_1102-1106.pdf', size: 98_304 },
    { name: '배차표_1102-1106.xlsx', size: 46_080 },
  ],
};

export interface ApprovalStep {
  empId: string;
  role: ApprovalLineRole;
  state: ApprovalLineState;
  /** 'MM-DD HH:MM' */
  time?: string;
  comment?: string;
}

export interface ExpenseLine {
  account: string;
  memo: string;
  vendor: string;
  evidence: string;
  supply: number;
  tax: number;
}

export interface ApprovalDoc {
  id: string;
  form: FormKind;
  title: string;
  drafterId: string;
  /** 'YYYY-MM-DD HH:MM' */
  draftedAt: string;
  /** 처리 기한(지연 표시) */
  dueDate: string;
  state: ApprovalState;
  line: readonly ApprovalStep[];
  cc: readonly string[];
  /** 원화 금액(휴가는 없음) */
  amount?: number;
  /** 외화 표기(USD 17,000.00) */
  amountLabel?: string;
  related?: string;
  fields: readonly { label: string; value: string }[];
  body: string;
  files: readonly AttachmentFile[];
  expense?: readonly ExpenseLine[];
}

const st = (
  empId: string,
  role: ApprovalLineRole,
  state: ApprovalLineState,
  time?: string,
  comment?: string,
): ApprovalStep => ({
  empId,
  role,
  state,
  ...(time ? { time } : {}),
  ...(comment ? { comment } : {}),
});

const sumExpense = (lines: readonly ExpenseLine[]) =>
  lines.reduce((a, l) => a + l.supply + l.tax, 0);

const EX_0019: ExpenseLine[] = [
  {
    account: '수입 부대비용',
    memo: `관세 · 냉동 가리비 관자 ${formatQuantity(600, 'KG')}`,
    vendor: '부산세관',
    evidence: '수입신고필증',
    supply: 2_418_620,
    tax: 0,
  },
  {
    account: '부가세 대급금',
    memo: '수입 부가세(매입세액 공제)',
    vendor: '부산세관',
    evidence: '수입세금계산서',
    supply: 0,
    tax: 2_660_490,
  },
  {
    account: '지급수수료',
    memo: '수입 통관 대행 수수료',
    vendor: '한빛관세법인',
    evidence: '세금계산서',
    supply: 180_000,
    tax: 18_000,
  },
  {
    account: '운반비',
    memo: '부산 신항 → 평택 냉동센터 냉동 탑차 1대',
    vendor: '동방로지스',
    evidence: '세금계산서',
    supply: 650_000,
    tax: 65_000,
  },
  {
    account: '보관료',
    memo: '부산 신항 보세창고 3일',
    vendor: '동방로지스',
    evidence: '세금계산서',
    supply: 126_000,
    tax: 12_600,
  },
  {
    account: '지급수수료',
    memo: '수입 수산물 정밀검사',
    vendor: '수산물 검사기관',
    evidence: '영수증',
    supply: 95_000,
    tax: 0,
  },
];

const EX_0016: ExpenseLine[] = [
  {
    account: '접대비',
    memo: '대양상사 · 한결물산 연말 물량 협의 식대',
    vendor: '법인카드 4건',
    evidence: '카드 전표',
    supply: 1_268_182,
    tax: 126_818,
  },
  {
    account: '여비교통비',
    memo: '거래처 방문 유류비 · 통행료',
    vendor: '법인카드 11건',
    evidence: '카드 전표',
    supply: 912_273,
    tax: 91_227,
  },
  {
    account: '차량유지비',
    memo: '영업 차량 정기 점검',
    vendor: '법인카드 1건',
    evidence: '카드 전표',
    supply: 714_545,
    tax: 71_455,
  },
];

const EX_0014: ExpenseLine[] = [
  {
    account: '전력비',
    memo: '평택 냉동센터 10월 전기요금',
    vendor: '전력 공급사',
    evidence: '세금계산서',
    supply: 3_712_000,
    tax: 371_200,
  },
  {
    account: '건물관리비',
    memo: '평택 냉동센터 10월 관리비',
    vendor: '평택물류단지 관리단',
    evidence: '세금계산서',
    supply: 676_000,
    tax: 67_600,
  },
];

const EX_0017: ExpenseLine[] = [
  {
    account: '지급임차료',
    memo: '본사 12층 11월 임차료',
    vendor: '세종빌딩 관리',
    evidence: '세금계산서',
    supply: 15_000_000,
    tax: 1_500_000,
  },
  {
    account: '건물관리비',
    memo: '본사 12층 11월 관리비',
    vendor: '세종빌딩 관리',
    evidence: '세금계산서',
    supply: 2_000_000,
    tax: 200_000,
  },
];

const EX_0015: ExpenseLine[] = [
  {
    account: '보험료',
    memo: '11월 수입 화물 적하보험(4건)',
    vendor: '화물 보험사',
    evidence: '보험료 영수증',
    supply: 1_486_000,
    tax: 0,
  },
];

const EX_0013: ExpenseLine[] = [
  {
    account: '접대비',
    memo: '대양상사 구매팀 미팅 식대',
    vendor: '간이영수증',
    evidence: '간이영수증',
    supply: 418_000,
    tax: 0,
  },
];

const EX_0011: ExpenseLine[] = [
  {
    account: '예수금',
    memo: '10월 원천세(근로 · 사업소득)',
    vendor: '중부세무서',
    evidence: '납부서',
    supply: 6_842_330,
    tax: 0,
  },
  {
    account: '복리후생비',
    memo: '10월 4대보험 회사 부담분',
    vendor: '4대보험 징수 기관',
    evidence: '고지서',
    supply: 9_214_880,
    tax: 0,
  },
];

const PDF = (name: string, size: number): AttachmentFile => ({ name, size });

const SEED_DOCS: ApprovalDoc[] = [
  {
    id: 'EX-2611-0019',
    form: 'expense',
    title: 'SH-2611-005 가리비 관자 수입 통관 비용',
    drafterId: 'u04',
    draftedAt: '2026-11-05 16:20',
    dueDate: '2026-11-07',
    state: 'pending',
    line: [
      st('u04', '기안', 'draft', '11-05 16:20', '통관을 마친 건의 비용 정산입니다'),
      st('e08', '검토', 'approved', '11-06 08:55', '수입신고필증 금액과 맞습니다'),
      st('u02', '합의', 'pending'),
      st('u01', '승인', 'waiting'),
    ],
    cc: ['u03', 'e11'],
    amount: sumExpense(EX_0019),
    related: 'PO-2611-0040 · SH-2611-005 · GR-2611-0031',
    fields: [
      { label: '지출 구분', value: '법인 계좌 이체' },
      { label: '지급 예정일', value: '2026-11-10' },
      { label: '예산 항목', value: '수입 부대비용(11월)' },
      { label: '예산 잔액', value: `${formatAmount(18_640_000)}원` },
      { label: '거래처', value: '부산세관 · 한빛관세법인 · 동방로지스' },
      { label: '증빙', value: '수입신고필증 1 · 세금계산서 3 · 영수증 1' },
    ],
    body: 'Hokkai Marine Foods 냉동 가리비 관자(PO-2611-0040)가 11월 5일 부산 신항에 도착해 통관했습니다. 관세 · 수입 부가세와 통관 · 운송 · 보관 비용을 아래와 같이 지출합니다. 수입 부가세는 11월 매입세액으로 공제합니다.',
    files: [
      PDF('수입신고필증_SH-2611-005.pdf', 186_368),
      PDF('세금계산서_동방로지스_2611.pdf', 98_304),
      PDF('통관수수료_한빛관세법인.pdf', 90_112),
      PDF('비용내역_SH-2611-005.xlsx', 24_576),
    ],
    expense: EX_0019,
  },
  {
    id: 'PR-2611-0007',
    form: 'purchase',
    title: `Pacific Seafoods 냉동 연어 필렛 ${formatQuantity(1_000, 'KG')} 발주`,
    drafterId: 'u04',
    draftedAt: '2026-11-05 16:40',
    dueDate: '2026-11-09',
    state: 'pending',
    line: [
      st('u04', '기안', 'draft', '11-05 16:40', '12월 첫 주 평택 입고분입니다'),
      st('u02', '검토', 'pending'),
      st('u01', '승인', 'waiting'),
    ],
    cc: ['e08', 'e13'],
    amount: 23_536_500,
    amountLabel: 'USD 17,000.00',
    related: 'PO-2611-0043',
    fields: [
      { label: '거래처', value: 'Pacific Seafoods Co.(S3001)' },
      { label: '발주 번호', value: 'PO-2611-0043' },
      { label: '품목', value: `냉동 연어 필렛 ${formatQuantity(1_000, 'KG')} · USD 17.00/KG` },
      { label: '인도 조건', value: 'CIF 부산' },
      { label: '납기', value: '2026-12-02' },
      { label: '입고 창고', value: '평택 냉동센터' },
      { label: '결제 조건', value: 'T/T 30일' },
      { label: '적용 환율', value: 'USD 1,384.50원(11월 6일 매매기준율)' },
    ],
    body: '12월 연말 외식 거래처 수요(대양상사 · 한결물산)에 맞춰 냉동 연어 필렛을 발주합니다. 단가는 전월(USD 17.20)보다 USD 0.20 낮습니다. 평택 냉동센터 12월 첫 주 랙 여유를 확인했습니다.',
    files: [PDF('PI_PSF-26-1187_rev1.pdf', 219_136), PDF('단가비교표_연어필렛_2611.xlsx', 31_744)],
  },
  {
    id: 'EX-2611-0016',
    form: 'expense',
    title: '10월 영업팀 법인카드 사용분 정산',
    drafterId: 'e20',
    draftedAt: '2026-11-02 11:05',
    dueDate: '2026-11-05',
    state: 'pending',
    line: [
      st('e20', '기안', 'draft', '11-02 11:05'),
      st('e19', '검토', 'approved', '11-02 15:20', '건별 사용 목적 확인했습니다'),
      st('u02', '합의', 'pending'),
      st('u01', '승인', 'waiting'),
    ],
    cc: ['e05'],
    amount: sumExpense(EX_0016),
    fields: [
      { label: '지출 구분', value: '법인카드' },
      { label: '사용 기간', value: '2026-10-01~10-31' },
      { label: '카드', value: '영업팀 공용 ****-4411' },
      { label: '증빙', value: '카드 전표 16건' },
    ],
    body: '10월 영업팀 공용 법인카드 사용분을 정산합니다. 접대비는 건별로 상대 거래처와 참석자를 적었습니다.',
    files: [PDF('법인카드_사용내역_2610_영업.xlsx', 41_984)],
    expense: EX_0016,
  },
  {
    id: 'LV-2611-0031',
    form: 'leave',
    title: '연차 11월 12일~13일(2일)',
    drafterId: 'u03',
    draftedAt: '2026-11-04 08:58',
    dueDate: '2026-11-10',
    state: 'pending',
    line: [st('u03', '기안', 'draft', '11-04 08:58'), st('u02', '승인', 'pending')],
    cc: ['e06'],
    fields: [
      { label: '휴가 종류', value: '연차' },
      { label: '기간', value: '2026-11-12~11-13' },
      { label: '일수', value: '2일' },
      { label: '잔여 연차', value: '7일 → 5일' },
      { label: '업무 대행', value: '문서윤 사원(전표) · 안지수 대리(세무 문의)' },
      { label: '비상 연락', value: '010-****-2231' },
    ],
    body: '개인 사유로 연차를 신청합니다. 11월 10일 원천세 신고는 휴가 전에 끝냅니다.',
    files: [],
  },
  {
    id: 'BT-2611-0005',
    form: 'trip',
    title: '부산 신항 보세창고 재고 실사(11월 10일~11일)',
    drafterId: 'e11',
    draftedAt: '2026-11-04 14:30',
    dueDate: '2026-11-06',
    state: 'pending',
    line: [
      st('e11', '기안', 'draft', '11-04 14:30'),
      st('e08', '검토', 'approved', '11-04 17:02'),
      st('u02', '합의', 'pending'),
      st('e02', '승인', 'waiting'),
    ],
    cc: ['e13'],
    amount: 412_000,
    fields: [
      { label: '출장지', value: '부산 신항 보세창고' },
      { label: '기간', value: '2026-11-10~11-11(1박 2일)' },
      { label: '동행', value: '류현우 사원(물류팀)' },
      { label: '교통', value: 'KTX 왕복' },
      { label: '예상 경비', value: `${formatAmount(412_000)}원` },
    ],
    body: '올리브오일(SH-2611-006) 통관 대기분과 보세창고 장기 보관 재고를 실사합니다. 결과는 11월 12일까지 보고합니다.',
    files: [PDF('출장계획서_부산신항_1110.pdf', 64_512)],
  },
  {
    id: 'EX-2611-0014',
    form: 'expense',
    title: '평택 냉동센터 10월 전기요금 · 관리비',
    drafterId: 'e17',
    draftedAt: '2026-10-30 10:12',
    dueDate: '2026-11-03',
    state: 'pending',
    line: [
      st('e17', '기안', 'draft', '10-30 10:12'),
      st('e13', '검토', 'approved', '10-30 16:40'),
      st('u02', '합의', 'pending'),
      st('u01', '승인', 'waiting'),
    ],
    cc: [],
    amount: sumExpense(EX_0014),
    fields: [
      { label: '지출 구분', value: '자동 이체' },
      { label: '지급 예정일', value: '2026-11-10' },
      { label: '사용 기간', value: '2026-10-01~10-31' },
      { label: '증빙', value: '세금계산서 2' },
    ],
    body: '평택 냉동센터 10월 전기요금과 관리비입니다. 냉동 설비 증설로 전력 사용량이 전월보다 6.2% 늘었습니다.',
    files: [PDF('전기요금_청구서_2610.pdf', 120_832)],
    expense: EX_0014,
  },
  {
    id: 'EX-2611-0017',
    form: 'expense',
    title: '본사 11월 임차료 · 관리비',
    drafterId: 'u02',
    draftedAt: '2026-11-04 09:30',
    dueDate: '2026-11-09',
    state: 'pending',
    line: [
      st('u02', '기안', 'draft', '11-04 09:30'),
      st('e02', '검토', 'approved', '11-04 11:10'),
      st('u01', '승인', 'pending'),
    ],
    cc: ['u03'],
    amount: sumExpense(EX_0017),
    fields: [
      { label: '지출 구분', value: '법인 계좌 이체' },
      { label: '지급 예정일', value: '2026-11-10' },
      { label: '계약', value: '세종빌딩 12층 임대차(2025-03~2027-02)' },
      { label: '증빙', value: '세금계산서 2' },
    ],
    body: '본사 12층 11월 임차료와 관리비입니다. 계약 금액과 같습니다.',
    files: [PDF('임차료_세금계산서_2611.pdf', 77_824)],
    expense: EX_0017,
  },
  {
    id: 'LV-2611-0024',
    form: 'leave',
    title: '연차 11월 20일(1일)',
    drafterId: 'u02',
    draftedAt: '2026-11-03 17:45',
    dueDate: '2026-11-13',
    state: 'pending',
    line: [st('u02', '기안', 'draft', '11-03 17:45'), st('e02', '승인', 'pending')],
    cc: ['e06'],
    fields: [
      { label: '휴가 종류', value: '연차' },
      { label: '기간', value: '2026-11-20' },
      { label: '일수', value: '1일' },
      { label: '잔여 연차', value: '5.5일 → 4.5일' },
      { label: '업무 대행', value: '박서연 대리' },
    ],
    body: '개인 사유로 연차를 신청합니다.',
    files: [],
  },
  {
    id: 'PR-2611-0004',
    form: 'purchase',
    title: '복합기 토너 · 사무용품 11월 구매',
    drafterId: 'u02',
    draftedAt: '2026-10-28 10:20',
    dueDate: '2026-10-31',
    state: 'approved',
    line: [
      st('u02', '기안', 'draft', '10-28 10:20'),
      st('e02', '검토', 'approved', '10-28 14:02'),
      st('u01', '승인', 'approved', '10-29 09:15'),
    ],
    cc: ['e06'],
    amount: 1_284_000,
    fields: [
      { label: '구매처', value: '사무용품 정기 공급처' },
      { label: '품목', value: '복합기 토너 4색 · A4 용지 20박스 외' },
      { label: '납기', value: '2026-11-03' },
    ],
    body: '11월 사무용품을 구매합니다. 분기 예산 안입니다.',
    files: [PDF('견적서_사무용품_2611.pdf', 58_368)],
  },
  {
    id: 'EX-2611-0011',
    form: 'expense',
    title: '10월 원천세 · 4대보험 납부',
    drafterId: 'u02',
    draftedAt: '2026-11-02 14:10',
    dueDate: '2026-11-05',
    state: 'rejected',
    line: [
      st('u02', '기안', 'draft', '11-02 14:10'),
      st('e02', '검토', 'rejected', '11-03 10:20', '원천세 신고서 사본을 붙여 다시 올려 주세요'),
      st('u01', '승인', 'waiting'),
    ],
    cc: ['u03'],
    amount: sumExpense(EX_0011),
    fields: [
      { label: '지출 구분', value: '법인 계좌 이체' },
      { label: '납부 기한', value: '2026-11-10' },
    ],
    body: '10월 귀속 원천세와 4대보험 회사 부담분을 납부합니다.',
    files: [PDF('4대보험_고지서_2610.pdf', 102_400)],
    expense: EX_0011,
  },
  {
    id: 'BT-2611-0003',
    form: 'trip',
    title: '세무 실무 교육 참석(11월 18일)',
    drafterId: 'u02',
    draftedAt: '2026-11-01 09:40',
    dueDate: '2026-11-04',
    state: 'withdrawn',
    line: [
      st('u02', '기안', 'withdrawn', '11-02 08:50', '일정이 겹쳐 회수합니다'),
      st('e02', '승인', 'waiting'),
    ],
    cc: [],
    amount: 180_000,
    fields: [
      { label: '출장지', value: '서울 · 교육장' },
      { label: '기간', value: '2026-11-18' },
      { label: '예상 경비', value: `${formatAmount(180_000)}원` },
    ],
    body: '연말 세무 실무 교육에 참석합니다.',
    files: [],
  },
  {
    id: 'PR-2611-0006',
    form: 'purchase',
    title: '미래패키징 아이스박스 · 보냉팩 발주',
    drafterId: 'u05',
    draftedAt: '2026-11-03 09:10',
    dueDate: '2026-11-04',
    state: 'approved',
    line: [
      st('u05', '기안', 'draft', '11-03 09:10'),
      st('e13', '검토', 'approved', '11-03 10:05'),
      st('e02', '승인', 'approved', '11-03 13:30'),
    ],
    cc: ['u02', 'u03'],
    amount: 8_920_000,
    related: 'PO-2611-0038',
    fields: [
      { label: '거래처', value: '미래패키징(S2001)' },
      { label: '발주 번호', value: 'PO-2611-0038' },
      {
        label: '품목',
        value: `아이스박스 EPS 20L ${formatQuantity(2_400, 'EA')} · 보냉팩 ${formatQuantity(8_000, 'EA')}`,
      },
      { label: '납기', value: '2026-11-07' },
    ],
    body: '11월 냉동 출고 증가분에 맞춰 포장재를 발주합니다.',
    files: [PDF('견적서_미래패키징_2611.pdf', 71_680)],
  },
  {
    id: 'LV-2611-0029',
    form: 'leave',
    title: '오후 반차 11월 6일',
    drafterId: 'e10',
    draftedAt: '2026-11-05 09:02',
    dueDate: '2026-11-06',
    state: 'approved',
    line: [st('e10', '기안', 'draft', '11-05 09:02'), st('e08', '승인', 'approved', '11-05 10:30')],
    cc: ['u02'],
    fields: [
      { label: '휴가 종류', value: '반차(오후)' },
      { label: '기간', value: '2026-11-06 13:00~18:00' },
      { label: '일수', value: '0.5일' },
    ],
    body: '병원 진료로 오후 반차를 신청합니다.',
    files: [],
  },
  {
    id: 'EX-2611-0015',
    form: 'expense',
    title: '11월 수입 화물 적하보험료',
    drafterId: 'e11',
    draftedAt: '2026-11-03 10:40',
    dueDate: '2026-11-06',
    state: 'approved',
    line: [
      st('e11', '기안', 'draft', '11-03 10:40'),
      st('e08', '검토', 'approved', '11-03 13:15'),
      st('u02', '합의', 'approved', '11-04 09:20', '예산 안입니다'),
      st('u01', '승인', 'approved', '11-05 08:31'),
    ],
    cc: [],
    amount: sumExpense(EX_0015),
    fields: [
      { label: '지출 구분', value: '법인 계좌 이체' },
      { label: '대상 선적', value: 'SH-2611-004 · 005 · 006 · 007' },
    ],
    body: '11월 수입 화물 4건의 적하보험료입니다.',
    files: [PDF('보험료_청구서_2611.pdf', 66_560)],
    expense: EX_0015,
  },
  {
    id: 'EX-2611-0013',
    form: 'expense',
    title: '대양상사 구매팀 미팅 식대',
    drafterId: 'e22',
    draftedAt: '2026-10-29 18:20',
    dueDate: '2026-11-02',
    state: 'rejected',
    line: [
      st('e22', '기안', 'draft', '10-29 18:20'),
      st('e19', '검토', 'approved', '10-30 09:10'),
      st(
        'u02',
        '합의',
        'rejected',
        '10-30 14:05',
        '간이영수증은 받지 않습니다. 법인카드 전표로 다시 올려 주세요',
      ),
      st('u01', '승인', 'waiting'),
    ],
    cc: [],
    amount: sumExpense(EX_0013),
    fields: [{ label: '지출 구분', value: '개인 선지급' }],
    body: '대양상사 구매팀과 12월 물량 협의 식대입니다.',
    files: [PDF('간이영수증_1029.jpg', 845_312)],
    expense: EX_0013,
  },
  {
    id: 'BT-2611-0004',
    form: 'trip',
    title: '대양상사 · 한결물산 정기 방문(11월 3일)',
    drafterId: 'e21',
    draftedAt: '2026-10-30 15:00',
    dueDate: '2026-11-02',
    state: 'approved',
    line: [
      st('e21', '기안', 'draft', '10-30 15:00'),
      st('e19', '검토', 'approved', '10-30 16:20'),
      st('u02', '합의', 'approved', '10-31 09:05'),
    ],
    cc: [],
    amount: 96_000,
    fields: [
      { label: '출장지', value: '서울 강서 · 경기 화성' },
      { label: '기간', value: '2026-11-03' },
      { label: '교통', value: '영업 차량' },
    ],
    body: '정기 방문으로 12월 납품 일정을 협의합니다.',
    files: [],
  },
];

/* 결재 문서 저장소: 결재함 · 문서 보기 · 기안 작성이 같은 목록을 본다(데모 세션 동안만 유지) */
let docs: ApprovalDoc[] = SEED_DOCS.map((d) => ({ ...d, line: d.line.map((s) => ({ ...s })) }));
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const approvalStore = {
  get: (): readonly ApprovalDoc[] => docs,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  update(id: string, fn: (d: ApprovalDoc) => ApprovalDoc) {
    docs = docs.map((d) => (d.id === id ? fn(d) : d));
    emit();
  },
  add(doc: ApprovalDoc) {
    docs = [doc, ...docs];
    emit();
  },
};
export function useApprovalDocs(): readonly ApprovalDoc[] {
  return useSyncExternalStore(approvalStore.subscribe, approvalStore.get, approvalStore.get);
}

const stamp = (time: string) => `${TODAY.slice(5)} ${time}`;

/** 승인: 내 칸 승인 → 다음 대기 칸 진행. 다음이 없으면 문서 승인 */
export function approveDoc(d: ApprovalDoc, empId: string, comment?: string): ApprovalDoc {
  const idx = d.line.findIndex((s) => s.empId === empId && s.state === 'pending');
  if (idx < 0) return d;
  const line = d.line.map((s, i) =>
    i === idx
      ? { ...s, state: 'approved' as const, time: stamp(GW_NOW), ...(comment ? { comment } : {}) }
      : i === idx + 1 && s.state === 'waiting'
        ? { ...s, state: 'pending' as const }
        : s,
  );
  return { ...d, line, state: idx === d.line.length - 1 ? 'approved' : 'pending' };
}

/** 반려: 내 칸 반려 + 사유. 뒤 칸은 대기 그대로 */
export function rejectDoc(d: ApprovalDoc, empId: string, reason: string): ApprovalDoc {
  return {
    ...d,
    state: 'rejected',
    line: d.line.map((s) =>
      s.empId === empId && s.state === 'pending'
        ? { ...s, state: 'rejected' as const, time: stamp(GW_NOW), comment: reason }
        : s,
    ),
  };
}

/** 회수: 기안자가 되돌린다. 진행 칸은 대기로. 사유가 있으면 기안 칸 의견으로 남긴다 */
export function withdrawDoc(d: ApprovalDoc, reason?: string): ApprovalDoc {
  return {
    ...d,
    state: 'withdrawn',
    line: d.line.map((s, i) =>
      i === 0
        ? {
            ...s,
            state: 'withdrawn' as const,
            time: stamp(GW_NOW),
            comment: reason || '기안자가 회수했습니다',
          }
        : s.state === 'pending'
          ? { ...s, state: 'waiting' as const }
          : s,
    ),
  };
}

/** 지금 결재할 칸(진행) */
export const currentStep = (d: ApprovalDoc) => d.line.find((s) => s.state === 'pending');

/* ── 근태 ───────────────────────────────────────────────── */

/** 근태 상태. 회사가 더할 수 있다(야간 · 재택 …). 아래 다섯은 근태 계산(day)이 쓴다 */
export const ATTENDANCE_STATES: Readonly<Record<string, { label: string; tone: StatusTone }>> = {
  normal: { label: '정상', tone: 'success' },
  late: { label: '지각', tone: 'danger' },
  leave: { label: '휴가', tone: 'neutral' },
  field: { label: '외근', tone: 'info' },
  overtime: { label: '연장', tone: 'warning' },
};
export type AttendanceState = string;
/** 상태 이름 · 색. 모르는 상태는 이름 그대로 중립색 */
export const attendanceStateOf = (s: AttendanceState) =>
  ATTENDANCE_STATES[s] ?? { label: s, tone: 'neutral' as StatusTone };

/** 이번 주(월~금). 금요일이 TODAY */
export const WEEK = [
  { date: '2026-11-02', label: '월' },
  { date: '2026-11-03', label: '화' },
  { date: '2026-11-04', label: '수' },
  { date: '2026-11-05', label: '목' },
  { date: '2026-11-06', label: '금' },
] as const;

export interface AttendanceDay {
  date: string;
  state: AttendanceState;
  in?: string;
  out?: string;
  /** 반차 · 외근지 같은 보조 글자 */
  note?: string;
  /** 근무 분(점심 1시간 뺌). 오늘은 지금까지 */
  minutes: number;
}

const LUNCH = 60;
/** 근무 분. 퇴근이 출근보다 이르면 자정을 넘긴 야간 근무로 본다 */
const worked = (from: string, to: string) => {
  const raw = toMin(to) - toMin(from);
  const span = raw < 0 ? raw + 24 * 60 : raw;
  return span > 4 * 60 ? span - LUNCH : span;
};

/** 'in-out' · 'in-'(오늘 근무 중) · 'L' · 'L:사유'(종일 휴가) · 'F|in-out|외근지' · 'H|in-out|반차' */
function day(date: string, spec: string): AttendanceDay {
  if (spec === 'L' || spec.startsWith('L:'))
    return { date, state: 'leave', minutes: 0, note: spec.slice(2) || '연차' };
  const [kind, range, note] = spec.includes('|') ? spec.split('|') : ['', spec, undefined];
  const [from = '', to = ''] = (range ?? '').split('-');
  const minutes = worked(from, to || GW_NOW);
  const times = { in: from, ...(to ? { out: to } : {}), minutes };
  if (kind === 'F') return { date, state: 'field', ...times, note: note ?? '외근' };
  if (kind === 'H') return { date, state: 'leave', ...times, note: note ?? '반차' };
  const overnight = !!to && toMin(to) < toMin(from);
  const state: AttendanceState =
    toMin(from) > toMin(PROFILE.work.start)
      ? 'late'
      : to && (overnight || toMin(to) >= toMin(PROFILE.work.overtimeFrom))
        ? 'overtime'
        : 'normal';
  return { date, state, ...times };
}

export interface AttendanceRow {
  empId: string;
  days: readonly AttendanceDay[];
  /** 오늘 예정 퇴근(52시간 예상 계산) */
  plannedOut: string;
}

// 스펙 문자열: 외근 'F|08:30-17:40|대양상사', 반차 'H|08:50-13:00|오후 반차'
const ATT: Record<string, [string[], string?]> = {
  u01: [['08:40-18:30', '08:35-19:10', '08:42-18:20', '08:38-18:45', '08:30-']],
  e02: [['08:45-18:40', '08:50-18:30', '08:41-19:20', '08:47-18:35', '08:44-']],
  u02: [['08:49-18:31', '08:55-20:40', '08:47-18:20', '08:58-19:52', '08:52-'], '18:30'],
  u03: [['08:51-18:12', '08:57-18:40', '08:54-18:05', '08:50-18:30', '08:55-']],
  e05: [['08:58-18:05', '08:56-18:10', 'H|13:00-18:10|오전 반차', '08:59-18:20', '08:57-']],
  e06: [['08:40-18:00', '08:45-18:05', '08:43-18:10', '08:46-18:00', '08:41-']],
  e07: [['08:52-18:15', '09:07-18:20', '08:55-18:10', '08:53-18:40', '08:58-']],
  e08: [['08:30-19:40', '08:35-18:50', '08:32-19:15', '08:40-18:30', '08:33-'], '19:00'],
  u04: [['08:47-19:30', '08:50-18:40', '08:45-20:10', '08:49-19:05', '08:46-'], '19:00'],
  e10: [['08:55-18:20', '08:52-18:10', '08:58-18:30', '08:54-18:15', 'H|08:50-13:00|오후 반차']],
  e11: [['08:50-18:10', '08:47-18:25', '08:53-18:05', 'F|09:30-17:30|관세사 미팅', '08:52-']],
  e12: [['08:57-18:00', '08:58-18:05', '08:56-18:10', '09:12-18:20', '08:55-']],
  e13: [['08:10-19:20', '08:15-18:40', '08:05-18:40', '08:12-18:50', '08:08-'], '18:00'],
  u08: [['08:20-18:10', '08:25-18:15', '08:22-18:05', '08:30-18:20', '08:24-']],
  u05: [['08:00-20:30', '08:10-21:00', '08:00-19:40', '08:05-20:10', '08:00-'], '19:00'],
  e16: [['08:20-18:20', '08:15-18:30', '08:25-18:10', '08:18-18:40', '08:22-']],
  e17: [['08:30-20:00', '08:40-19:50', '08:30-20:30', '08:35-19:10', '08:30-'], '18:30'],
  e18: [['08:35-18:10', '08:40-18:00', '09:15-18:30', '08:38-18:20', '08:36-']],
  e19: [['08:40-19:10', 'F|10:00-18:30|한결물산', '08:44-18:50', '08:39-19:30', '08:42-']],
  e20: [['08:48-18:20', '08:51-18:30', 'L', '08:50-18:40', '08:47-']],
  e21: [
    [
      '08:46-18:10',
      'F|08:30-17:40|대양상사 · 한결물산',
      '08:52-18:20',
      '08:49-18:15',
      'F|09:00-|누리식품',
    ],
  ],
  e22: [['09:18-18:40', '08:55-18:30', '08:57-18:20', '08:53-18:35', '08:56-']],
  u06: [['08:50-18:05', '08:53-18:10', '08:49-18:00', '08:55-18:20', '08:51-']],
  e24: [['08:44-18:00', '08:46-18:05', '08:43-18:10', '08:45-18:00', '08:44-']],
};

export const ATTENDANCE: readonly AttendanceRow[] = EMPLOYEES.map((e) => {
  const [specs, plannedOut] = ATT[e.id] ?? [['L', 'L', 'L', 'L', 'L']];
  return {
    empId: e.id,
    days: WEEK.map((w, i) => day(w.date, specs[i] ?? 'L')),
    plannedOut: plannedOut ?? PROFILE.work.end,
  };
});

/** 주 근무 분(지금까지) */
export const weekMinutes = (r: AttendanceRow) => r.days.reduce((a, d) => a + d.minutes, 0);
/** 주 연장 분(하루 8시간 넘은 것) */
export const overtimeMinutes = (r: AttendanceRow) =>
  r.days.reduce((a, d) => a + Math.max(0, d.minutes - 8 * 60), 0);
/** 오늘 예정 퇴근까지 근무하면 주 몇 분 */
export function projectedMinutes(r: AttendanceRow): number {
  const today = r.days[r.days.length - 1]!;
  const before = weekMinutes(r) - today.minutes;
  if (!today.in || today.out || today.state === 'leave') return weekMinutes(r);
  return before + worked(today.in, r.plannedOut);
}
/** 52시간을 넘지 않으려면 오늘 몇 시까지(넘을 사람만) */
export function limitTime(r: AttendanceRow): string | null {
  const today = r.days[r.days.length - 1]!;
  if (!today.in || today.out) return null;
  const left = 52 * 60 - (weekMinutes(r) - today.minutes);
  return toHhmm(toMin(today.in) + left + LUNCH);
}
export const RISK = {
  ok: { label: '정상', tone: 'success' },
  watch: { label: '주의', tone: 'warning' },
  over: { label: '초과 위험', tone: 'danger' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export const riskOf = (r: AttendanceRow): keyof typeof RISK => {
  const p = projectedMinutes(r);
  return p > 52 * 60 ? 'over' : p >= 48 * 60 ? 'watch' : 'ok';
};

/** 연차 한 사람분. 신청 중인 휴가가 없으면 pending 0, pendingAt은 비운다 */
export interface LeaveBalance {
  granted: number;
  used: number;
  pending: number;
  /** 신청 중인 휴가 날짜(pending이 0이면 없음) */
  pendingAt?: string;
  expiresAt: string;
}

/** 연차(김테라 팀장 기준) */
export const LEAVE_BALANCE: LeaveBalance = {
  granted: 17,
  used: 11.5,
  pending: 1,
  pendingAt: '2026-11-20',
  expiresAt: '2026-12-31',
};

export interface MyRequest {
  id: string;
  kind: '연장 근무' | '휴일 근무' | '연차' | '반차' | '외근';
  date: string;
  range: string;
  minutes?: number;
  days?: number;
  reason: string;
  state: ApprovalState;
  approver: string;
  comment?: string;
}

export const MY_REQUESTS: readonly MyRequest[] = [
  {
    id: 'OT-2611-0016',
    kind: '연장 근무',
    date: '2026-11-06',
    range: '18:00~20:00',
    minutes: 120,
    reason: '11월 급여 기초 자료 정리',
    state: 'draft',
    approver: 'e02',
  },
  {
    id: 'OT-2611-0015',
    kind: '연장 근무',
    date: '2026-11-05',
    range: '18:00~19:52',
    minutes: 112,
    reason: '11월 자금 계획 작성',
    state: 'pending',
    approver: 'e02',
  },
  {
    id: 'LV-2611-0024',
    kind: '연차',
    date: '2026-11-20',
    range: '종일',
    days: 1,
    reason: '개인 사유',
    state: 'pending',
    approver: 'e02',
  },
  {
    id: 'OT-2611-0012',
    kind: '연장 근무',
    date: '2026-11-03',
    range: '18:00~20:40',
    minutes: 160,
    reason: '10월 결산 마감',
    state: 'approved',
    approver: 'e02',
  },
  {
    id: 'LV-2610-0019',
    kind: '반차',
    date: '2026-10-23',
    range: '13:00~18:00',
    days: 0.5,
    reason: '개인 사유',
    state: 'approved',
    approver: 'e02',
  },
  {
    id: 'OT-2610-0041',
    kind: '휴일 근무',
    date: '2026-10-17',
    range: '10:00~14:00',
    minutes: 240,
    reason: '3분기 결산 자료 준비',
    state: 'rejected',
    approver: 'e02',
    comment: '휴일 근무는 전날까지 신청해 주세요',
  },
];

/* ── 일정 ───────────────────────────────────────────────── */

export const CALENDARS = {
  mine: { label: '내 일정' },
  team: { label: '경영지원팀' },
  company: { label: '회사' },
  leave: { label: '휴가 · 출장' },
  deadline: { label: '마감' },
} as const;
export type CalendarId = keyof typeof CALENDARS;

export interface CalendarEvent {
  id: string;
  date: string;
  /** 여러 날이면 마지막 날 */
  endDate?: string;
  start?: string;
  end?: string;
  title: string;
  calendar: CalendarId;
  place?: string;
  /** 주관 · 대상 */
  owner?: string;
}

const ev = (
  id: string,
  date: string,
  calendar: CalendarId,
  title: string,
  extra: Partial<Omit<CalendarEvent, 'id' | 'date' | 'calendar' | 'title'>> = {},
): CalendarEvent => ({ id, date, calendar, title, ...extra });

const MONDAYS = ['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30'];

export const EVENTS: readonly CalendarEvent[] = [
  ...MONDAYS.map((d, i) =>
    ev(`w${i}`, d, 'company', '주간 팀장 회의', {
      start: '09:30',
      end: '10:30',
      place: '12층 대회의실',
      owner: '윤지호 대표',
    }),
  ),
  ev('c01', '2026-10-30', 'company', '10월 월례 조회', { start: '08:40', end: '09:00' }),
  ev('c02', '2026-11-02', 'mine', '10월 결산 보고', {
    start: '15:00',
    end: '16:00',
    place: '대표실',
  }),
  ev('c03', '2026-11-03', 'mine', '미래패키징 단가 협의', {
    start: '16:00',
    end: '17:00',
    place: '12층 소회의실 B',
  }),
  ev('c04', '2026-11-04', 'team', '연말정산 설명회 준비', {
    start: '10:00',
    end: '11:00',
    place: '12층 소회의실 A',
  }),
  ev('c05', '2026-11-04', 'leave', '홍예린 과장 연차'),
  ev('c06', '2026-11-05', 'mine', 'Pacific Seafoods 결제 조건 화상 회의', {
    start: '09:00',
    end: '09:40',
    place: '화상회의실',
  }),
  ev('c07', '2026-11-06', 'team', '경영지원팀 주간 회의', {
    start: '09:00',
    end: '10:00',
    place: '12층 소회의실 A',
    owner: '김테라 팀장',
  }),
  ev('c08', '2026-11-06', 'mine', '동방로지스 운송 계약 갱신 검토', {
    start: '10:30',
    end: '11:30',
    place: '12층 대회의실',
    owner: '김테라 팀장',
  }),
  ev('c09', '2026-11-06', 'mine', '11월 자금 계획 보고', {
    start: '14:00',
    end: '15:00',
    place: '대표실',
    owner: '윤지호 대표',
  }),
  ev('c10', '2026-11-06', 'leave', '신지아 대리 오후 반차', { start: '13:00', end: '18:00' }),
  ev('c11', '2026-11-06', 'company', '신규 입사자 보안 교육', {
    start: '16:00',
    end: '17:00',
    place: '12층 소회의실 B',
    owner: '송다인 주임',
  }),
  ev('c12', '2026-11-10', 'deadline', '원천세 · 4대보험 신고 납부'),
  ev('c13', '2026-11-10', 'leave', '황민석 주임 부산 출장', { endDate: '2026-11-11' }),
  ev('c14', '2026-11-11', 'mine', '동방로지스 운송 계약 체결', {
    start: '10:00',
    end: '11:00',
    place: '12층 대회의실',
  }),
  ev('c15', '2026-11-12', 'leave', '박서연 대리 연차', { endDate: '2026-11-13' }),
  ev('c16', '2026-11-13', 'mine', '기말 감사 사전 미팅', {
    start: '15:00',
    end: '16:30',
    place: '12층 대회의실',
    owner: '한소희 회계사',
  }),
  ev('c17', '2026-11-17', 'company', '2027년 예산 편성 회의', {
    start: '14:00',
    end: '16:00',
    place: '12층 대회의실',
  }),
  ev('c18', '2026-11-18', 'company', '개인정보 보호 교육', {
    start: '14:00',
    end: '15:00',
    place: '12층 대회의실',
  }),
  ev('c19', '2026-11-19', 'mine', '주거래 은행 여신 미팅', {
    start: '13:00',
    end: '14:00',
    place: '외부',
  }),
  ev('c20', '2026-11-20', 'leave', '김테라 팀장 연차(신청 중)'),
  ev('c21', '2026-11-20', 'deadline', '개인정보 보호 교육 이수'),
  ev('c22', '2026-11-24', 'team', '연말정산 사내 설명회', {
    start: '16:00',
    end: '17:00',
    place: '12층 대회의실',
  }),
  ev('c23', '2026-11-25', 'company', '11월 급여 지급'),
  ev('c24', '2026-11-26', 'team', '11월 법인카드 마감'),
  ev('c25', '2026-11-27', 'company', '4분기 타운홀', {
    start: '17:00',
    end: '18:30',
    place: '12층 대회의실',
  }),
  ev('c26', '2026-11-30', 'deadline', '11월 결산 마감'),
  ev('c27', '2026-12-01', 'team', '12월 자금 계획 작성', { start: '10:00', end: '12:00' }),
  ev('c28', '2026-12-03', 'company', '연말 거래처 감사 선물 발송'),
];

export interface Room {
  id: string;
  name: string;
  seats: number;
  equipment: string;
}
export const ROOMS: readonly Room[] = [
  { id: 'r1', name: '12층 대회의실', seats: 12, equipment: '빔프로젝터 · 화상' },
  { id: 'r2', name: '12층 소회의실 A', seats: 6, equipment: 'TV' },
  { id: 'r3', name: '12층 소회의실 B', seats: 4, equipment: 'TV' },
  { id: 'r4', name: '화상회의실', seats: 4, equipment: '화상 장비' },
];

export interface RoomBooking {
  id: string;
  roomId: string;
  start: string;
  end: string;
  title: string;
  owner: string;
}
export const BOOKINGS: readonly RoomBooking[] = [
  {
    id: 'b1',
    roomId: 'r2',
    start: '09:00',
    end: '10:00',
    title: '경영지원팀 주간 회의',
    owner: 'u02',
  },
  {
    id: 'b2',
    roomId: 'r1',
    start: '10:30',
    end: '11:30',
    title: '동방로지스 운송 계약 검토',
    owner: 'u02',
  },
  { id: 'b3', roomId: 'r3', start: '11:00', end: '12:00', title: '물류팀 채용 면접', owner: 'e06' },
  { id: 'b4', roomId: 'r2', start: '13:00', end: '14:00', title: '수입 일정 점검', owner: 'e08' },
  {
    id: 'b5',
    roomId: 'r4',
    start: '14:00',
    end: '15:00',
    title: 'Olivar del Sur 선적 화상 회의',
    owner: 'u04',
  },
  { id: 'b6', roomId: 'r1', start: '15:00', end: '16:00', title: '영업팀 주간 회의', owner: 'e19' },
  {
    id: 'b7',
    roomId: 'r3',
    start: '16:00',
    end: '17:00',
    title: '신규 입사자 보안 교육',
    owner: 'e06',
  },
];

/* ── 게시판 ─────────────────────────────────────────────── */

export const NOTICE_CATEGORIES = ['공지', '인사', '총무', '보안', '시스템', '행사'] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

export interface Notice {
  id: string;
  category: NoticeCategory;
  title: string;
  authorId: string;
  date: string;
  views: number;
  /** 필독 · 상단 고정 */
  pinned?: boolean;
  /** 읽음 확인한 사람(필독만) */
  readBy?: readonly string[];
  body: readonly string[];
  files?: readonly AttachmentFile[];
  /** 필독 기한 */
  dueDate?: string;
}

/** 데모 사용자가 이미 읽은 공지(목록 굵기). 필독 읽음 확인(readBy)과 별개 */
export const NOTICES_SEEN: readonly string[] = [
  'N-2611-009',
  'N-2611-010',
  'N-2611-007',
  'N-2610-021',
  'N-2610-019',
  'N-2610-017',
  'N-2610-014',
  'N-2610-011',
];

const READ_ALL_BUT = (...ids: string[]) =>
  EMPLOYEES.map((e) => e.id).filter((id) => !ids.includes(id));

export const NOTICES: readonly Notice[] = [
  {
    id: 'N-2611-012',
    category: '인사',
    title: '2026년 귀속 연말정산 일정 안내',
    authorId: 'e06',
    date: '2026-11-05',
    views: 41,
    pinned: true,
    dueDate: '2026-12-15',
    readBy: READ_ALL_BUT('u02', 'e08', 'u05', 'e17', 'e18', 'e19', 'e22'),
    body: [
      '2026년 귀속 연말정산을 아래 일정으로 진행합니다. 올해부터 소득 · 세액공제 신고서를 그룹웨어 전자결재로 받습니다.',
      '11월 24일(화) 16:00 사내 설명회를 12층 대회의실에서 엽니다. 참석이 어려우면 녹화본을 게시판에 올립니다.',
      '공제 증빙은 12월 15일(화)까지 제출해 주세요. 부양가족 변동이 있으면 가족관계증명서를 함께 붙입니다.',
      '문의는 경영지원팀 송다인 주임(내선 1104)에게 하세요.',
    ],
    files: [
      { name: '2026_연말정산_일정표.pdf', size: 248_832 },
      { name: '소득공제신고서_양식.xlsx', size: 61_440 },
    ],
  },
  {
    id: 'N-2611-009',
    category: '보안',
    title: '개인정보 보호 교육 이수 안내(11월 20일까지)',
    authorId: 'u02',
    date: '2026-11-02',
    views: 58,
    pinned: true,
    dueDate: '2026-11-20',
    readBy: READ_ALL_BUT('e12', 'e22', 'e24'),
    body: [
      '연 1회 법정 의무 교육인 개인정보 보호 교육을 11월 20일(금)까지 이수해 주세요.',
      '온라인 과정은 40분이고 사내망에서만 열립니다. 이수하면 수료증이 자동으로 인사 기록에 남습니다.',
      '11월 18일(수) 14:00 대회의실 집합 교육으로도 이수할 수 있습니다.',
    ],
    files: [{ name: '개인정보보호교육_접속방법.pdf', size: 133_120 }],
  },
  {
    id: 'N-2611-010',
    category: '공지',
    title: '11월 경영회의 결과 공유',
    authorId: 'u01',
    date: '2026-11-04',
    views: 36,
    body: [
      '11월 경영회의 결과를 공유합니다.',
      '10월 매출은 전월보다 4.8% 늘었습니다. 연말 외식 수요에 맞춰 냉동 수산물 재고를 12월 첫 주까지 15% 늘립니다.',
      '서해통상 거래는 휴업 기간 동안 신규 출고를 멈추고 미수금 회수를 우선합니다.',
    ],
  },
  {
    id: 'N-2611-008',
    category: '총무',
    title: '평택 냉동센터 출입 절차 변경(11월 9일부터)',
    authorId: 'e13',
    date: '2026-11-04',
    views: 29,
    body: [
      '11월 9일(월)부터 평택 냉동센터 출입은 사원증 태그와 방문 등록을 함께 합니다.',
      '외부 운송 기사는 하역장 입구에서 방문증을 받아 주세요. 냉동실 안 단독 작업은 금지합니다.',
    ],
    files: [{ name: '평택냉동센터_출입절차.pdf', size: 312_320 }],
  },
  {
    id: 'N-2611-007',
    category: '시스템',
    title: '메일 · 메신저 정기 점검(11월 8일 02:00~05:00)',
    authorId: 'e06',
    date: '2026-11-03',
    views: 33,
    body: [
      '11월 8일(일) 02:00~05:00 메일과 메신저 서버를 점검합니다. 점검 중에는 메일 발송이 늦어질 수 있습니다.',
    ],
  },
  {
    id: 'N-2611-006',
    category: '인사',
    title: '신규 입사자 소개 · 영업팀 윤하람 사원',
    authorId: 'e06',
    date: '2026-11-02',
    views: 47,
    body: [
      '10월 26일 영업팀에 윤하람 사원이 입사했습니다. 수주 관리를 맡습니다. 내선은 1406입니다.',
    ],
  },
  {
    id: 'N-2610-021',
    category: '행사',
    title: '4분기 타운홀 일정 안내(11월 27일)',
    authorId: 'e06',
    date: '2026-10-30',
    views: 52,
    body: [
      '4분기 타운홀을 11월 27일(금) 17:00 12층 대회의실에서 엽니다. 질문은 11월 25일까지 받습니다.',
    ],
  },
  {
    id: 'N-2610-019',
    category: '공지',
    title: '법인카드 사용 기준 개정 안내',
    authorId: 'u02',
    date: '2026-10-28',
    views: 61,
    body: [
      '11월 1일부터 법인카드 사용 기준을 바꿉니다. 접대비는 건당 50만 원을 넘으면 사전 품의가 필요합니다.',
      '간이영수증은 증빙으로 받지 않습니다. 법인카드 전표나 세금계산서를 붙여 주세요.',
    ],
    files: [{ name: '법인카드_사용기준_v3.pdf', size: 176_128 }],
  },
  {
    id: 'N-2610-017',
    category: '총무',
    title: '동절기 냉동창고 안전 수칙',
    authorId: 'e13',
    date: '2026-10-27',
    views: 38,
    body: ['동절기에는 하역장 결빙에 주의합니다. 방한 장갑과 미끄럼 방지화를 꼭 착용하세요.'],
  },
  {
    id: 'N-2610-014',
    category: '총무',
    title: '사무실 복합기 교체 안내',
    authorId: 'e06',
    date: '2026-10-21',
    views: 27,
    body: ['10월 23일(금) 본사 12층 복합기 2대를 교체합니다. 드라이버는 자동으로 설치됩니다.'],
  },
  {
    id: 'N-2610-011',
    category: '보안',
    title: '비밀번호 변경 주기 90일 적용',
    authorId: 'u02',
    date: '2026-10-15',
    views: 44,
    body: ['11월 1일부터 그룹웨어 비밀번호는 90일마다 바꿉니다. 만료 7일 전부터 알림을 보냅니다.'],
  },
];

/* ── 메일 ───────────────────────────────────────────────── */

export const MAIL_FOLDERS = [
  { id: 'inbox', label: '받은편지함', icon: 'inbox' },
  { id: 'sent', label: '보낸편지함', icon: 'send' },
  { id: 'drafts', label: '임시 보관함', icon: 'file-pen' },
  { id: 'spam', label: '스팸', icon: 'ban' },
] as const;
export type MailFolder = (typeof MAIL_FOLDERS)[number]['id'];

export interface Mail {
  id: string;
  folder: MailFolder;
  from: { name: string; email: string; org?: string };
  to: readonly string[];
  cc?: readonly string[];
  subject: string;
  body: readonly string[];
  /** 'YYYY-MM-DD HH:MM' */
  at: string;
  unread?: boolean;
  starred?: boolean;
  files?: readonly AttachmentFile[];
  /** 거래처 주소와 비슷한 다른 주소 */
  suspicious?: boolean;
}

const ME_MAIL = { name: '김테라', email: 'terra.kim@terra-trading.example', org: '경영지원팀' };

export const MAILS: readonly Mail[] = [
  {
    id: 'm01',
    folder: 'inbox',
    from: {
      name: 'Emily Carter',
      email: 'export@pacificseafoods.example',
      org: 'Pacific Seafoods Co.',
    },
    to: ['이하은 과장'],
    cc: ['김테라 팀장'],
    subject: 'RE: PO-2611-0043 revised proforma invoice',
    at: '2026-11-06 11:24',
    unread: true,
    body: [
      'Dear Ms. Lee,',
      'Please find attached the revised proforma invoice for PO-2611-0043. Salmon fillet, skin-on, 1,000 kg at USD 17.00/kg, CIF Busan.',
      'We can load on the vessel departing Seattle on November 18, arriving Busan around December 1. Payment terms remain T/T 30 days after B/L date.',
      'Best regards,\nEmily Carter\nExport Manager, Pacific Seafoods Co.',
    ],
    files: [{ name: 'PI_PSF-26-1187_rev1.pdf', size: 219_136 }],
  },
  {
    id: 'm02',
    folder: 'inbox',
    from: { name: '김주원 관세사', email: 'customs@hanbit-cb.example', org: '한빛관세법인' },
    to: ['김테라 팀장', '황민석 주임'],
    subject: '[수리] SH-2611-005 냉동 가리비 관자 수입신고 수리 안내',
    at: '2026-11-06 10:02',
    unread: true,
    body: [
      '안녕하십니까. 한빛관세법인 김주원 관세사입니다.',
      'SH-2611-005(냉동 가리비 관자 600KG) 수입신고가 수리되었습니다. 수입신고필증을 붙입니다.',
      '관세 2,418,620원과 수입 부가세 2,660,490원은 11월 10일까지 납부하시면 됩니다. 통관 수수료 세금계산서는 오늘 발행합니다.',
    ],
    files: [{ name: '수입신고필증_SH-2611-005.pdf', size: 186_368 }],
  },
  {
    id: 'm03',
    folder: 'inbox',
    from: { name: '테라스원 알림', email: 'noreply@terra-trading.example' },
    to: ['김테라 팀장'],
    subject: '[세무] 국세청 전송 실패 1건 · TI-2611-0116 누리식품',
    at: '2026-11-06 09:16',
    unread: true,
    body: [
      '세금계산서 TI-2611-0116(누리식품)의 국세청 전송이 실패했습니다.',
      '사유는 공급받는 자 사업자 상태 확인 필요입니다. 세무 › 세금계산서에서 다시 전송하세요.',
    ],
  },
  {
    id: 'm04',
    folder: 'inbox',
    from: { name: '윤지호', email: 'ceo@terra-trading.example', org: '대표' },
    to: ['김테라 팀장'],
    subject: '11월 자금 계획 보고 일정',
    at: '2026-11-06 08:40',
    unread: true,
    body: [
      '김 팀장, 오늘 14시에 대표실에서 봅시다.',
      '12월 수입 대금 결제 일정(Pacific Seafoods · Olivar del Sur)과 환율 1,400원 시나리오를 같이 보여 주세요.',
    ],
  },
  {
    id: 'm05',
    folder: 'inbox',
    from: { name: '백승현 대리', email: 'cs@dongbang.example', org: '동방로지스' },
    to: ['정우진 주임'],
    cc: ['김테라 팀장'],
    subject: '11월 2주 냉동 운송 배차표 송부',
    at: '2026-11-05 17:48',
    body: [
      '안녕하세요. 동방로지스 백승현입니다.',
      '11월 9일~13일 냉동 탑차 배차표를 보내드립니다. 11월 11일 부산 신항 → 평택 구간은 2대로 늘렸습니다.',
    ],
    files: [{ name: '배차표_1109-1113.xlsx', size: 49_152 }],
  },
  {
    id: 'm06',
    folder: 'inbox',
    from: { name: '조윤서 과장', email: 'sales@mirae-pack.example', org: '미래패키징' },
    to: ['배준혁 사원'],
    cc: ['김테라 팀장', '강도현 팀장'],
    subject: '크라프트 박스 단가 조정 요청(12월 출고분부터)',
    at: '2026-11-05 15:20',
    starred: true,
    body: [
      '안녕하세요. 미래패키징 조윤서입니다.',
      '원지 가격 인상으로 12월 출고분부터 크라프트 박스 5호 단가를 개당 540원에서 575원으로 조정하고자 합니다.',
      '세부 내역은 첨부한 요청서를 봐 주세요. 연간 계약 물량은 기존 단가를 유지합니다.',
    ],
    files: [{ name: '단가조정_요청서_2612.pdf', size: 159_744 }],
  },
  {
    id: 'm07',
    folder: 'inbox',
    from: { name: '송다인 주임', email: 'dain.song@terra-trading.example', org: '경영지원팀' },
    to: ['전 직원'],
    subject: '[인사] 2026년 귀속 연말정산 일정 공유',
    at: '2026-11-05 10:12',
    body: ['연말정산 일정을 게시판에 올렸습니다. 11월 24일 사내 설명회에 참석해 주세요.'],
    files: [{ name: '2026_연말정산_일정표.pdf', size: 248_832 }],
  },
  {
    id: 'm08',
    folder: 'inbox',
    from: {
      name: 'Javier Morales',
      email: 'ventas@olivardelsur.example',
      org: 'Olivar del Sur S.L.',
    },
    to: ['신지아 대리'],
    cc: ['김테라 팀장'],
    subject: 'SH-2611-006 B/L copy and certificate of origin',
    at: '2026-11-04 22:05',
    body: [
      'Dear Ms. Shin,',
      'Attached are the B/L copy and the certificate of origin for SH-2611-006 (extra virgin olive oil, 300 cartons).',
      'Kind regards,\nJavier Morales',
    ],
    files: [
      { name: 'BL_OLV2611006.pdf', size: 204_800 },
      { name: 'CO_ES-2611-0442.pdf', size: 118_784 },
    ],
  },
  {
    id: 'm09',
    folder: 'inbox',
    from: { name: '오세훈 과장', email: 'order@daeyang.example', org: '대양상사' },
    to: ['홍예린 과장'],
    cc: ['김테라 팀장'],
    subject: '12월 연말 물량 사전 발주 문의',
    at: '2026-11-04 14:31',
    body: [
      '안녕하세요. 대양상사 오세훈입니다.',
      '12월 연말 행사용으로 냉동 흰다리새우 300박스, 냉동 연어 필렛 400KG을 미리 잡아 두고 싶습니다. 12월 7일 전 납품이 가능한지 알려 주세요.',
    ],
  },
  {
    id: 'm10',
    folder: 'inbox',
    from: { name: '박서연 대리', email: 'seoyeon.park@terra-trading.example', org: '경영지원팀' },
    to: ['김테라 팀장'],
    subject: '10월 원천세 · 4대보험 납부 내역 정리',
    at: '2026-11-04 09:05',
    body: [
      '팀장님, 10월 원천세와 4대보험 납부 내역을 정리했습니다. 원천세 신고서 사본도 같이 붙입니다.',
    ],
    files: [
      { name: '납부내역_2610.xlsx', size: 37_888 },
      { name: '원천세신고서_2610.pdf', size: 142_336 },
    ],
  },
  {
    id: 'm11',
    folder: 'inbox',
    from: { name: '임도윤 차장', email: 'trade@seohae.example', org: '서해통상' },
    to: ['김테라 팀장'],
    subject: '휴업 기간 거래 관련 문의',
    at: '2026-11-03 16:44',
    body: [
      '안녕하세요. 서해통상 임도윤입니다.',
      '11월 1일부터 휴업 신고를 했습니다. 12월 재개 전까지 미수금 12,400,000원은 11월 20일에 일괄 입금하겠습니다.',
    ],
  },
  {
    id: 'm12',
    folder: 'inbox',
    from: { name: 'Li Wei', email: 'sales@hengtong.example', org: 'Hengtong Packaging Ltd.' },
    to: ['배준혁 사원'],
    cc: ['김테라 팀장'],
    subject: 'Shipping schedule for PO-2611-0039',
    at: '2026-11-03 11:20',
    body: [
      'Dear Mr. Bae,',
      'PO-2611-0039 departed Shanghai on November 3 on COSCO HARMONY 087E. ETA Busan November 10.',
    ],
  },
  {
    id: 's01',
    folder: 'sent',
    from: ME_MAIL,
    to: ['조윤서 과장(미래패키징)'],
    cc: ['강도현 팀장'],
    subject: 'RE: 크라프트 박스 단가 조정 요청(12월 출고분부터)',
    at: '2026-11-06 09:40',
    body: [
      '조 과장님, 요청서 잘 받았습니다.',
      '구매팀과 검토해 11월 13일까지 회신드리겠습니다. 연간 계약 물량 기준은 기존대로 부탁드립니다.',
    ],
  },
  {
    id: 's02',
    folder: 'sent',
    from: ME_MAIL,
    to: ['Emily Carter(Pacific Seafoods)'],
    cc: ['이하은 과장'],
    subject: 'RE: PO-2611-0043 payment terms',
    at: '2026-11-05 18:10',
    body: [
      'Dear Emily,',
      'We confirm T/T 30 days after B/L date for PO-2611-0043. Please send the revised PI.',
      'Best regards,\nTera Kim',
    ],
  },
  {
    id: 's03',
    folder: 'sent',
    from: ME_MAIL,
    to: ['윤지호 대표'],
    subject: '10월 결산 보고서',
    at: '2026-11-02 17:30',
    body: ['대표님, 10월 결산 보고서를 보내드립니다. 15시 보고 때 말씀드린 내용과 같습니다.'],
    files: [{ name: '결산보고_2610.pdf', size: 528_384 }],
  },
  {
    id: 'd01',
    folder: 'drafts',
    from: ME_MAIL,
    to: ['오세훈 과장(대양상사)'],
    subject: 'RE: 12월 연말 물량 사전 발주 문의',
    at: '2026-11-05 09:12',
    body: ['오 과장님, 냉동 흰다리새우 300박스는 12월 4일 납품이 가능합니다. 연어 필렛은'],
  },
  {
    id: 'sp1',
    folder: 'spam',
    from: { name: 'Pacific Seafoods Billing', email: 'billing@pacificseafood-pay.example' },
    to: ['김테라 팀장'],
    subject: '결제 계좌 변경 안내(긴급)',
    at: '2026-11-04 03:12',
    suspicious: true,
    body: ['당사 결제 계좌가 변경되었습니다. 11월 송금분부터 아래 새 계좌로 보내 주십시오.'],
  },
  {
    id: 'sp2',
    folder: 'spam',
    from: { name: '물류설비 상담센터', email: 'promo@logi-ad.example' },
    to: ['김테라 팀장'],
    subject: '[광고] 창고 자동화 설비 도입 상담',
    at: '2026-11-03 07:30',
    body: ['창고 자동화 설비 도입 상담을 받아 보세요.'],
  },
];

/* ── 메신저 ─────────────────────────────────────────────── */

export interface Channel {
  id: string;
  kind: 'channel' | 'dm';
  name: string;
  /** dm 상대 */
  empId?: string;
  members: readonly string[];
  unread: number;
  /** 알림 끔 */
  muted?: boolean;
  /** 대화 위에 고정한 공지 메시지 id(PG-36) */
  pinned?: string;
}

/** 메시지에 붙은 반응: 종류 키 + 누른 사람 id */
export interface ChatReaction {
  key: string;
  by: readonly string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  /** 'YYYY-MM-DD HH:MM' */
  at: string;
  text: string;
  files?: readonly AttachmentFile[];
  /** 업무 카드(발주서 등) */
  card?: { kind: 'po'; id: string };
  /** 답글이면 원문 메시지 id(PG-36) */
  replyTo?: string;
  /** 반응(PG-36) */
  reactions?: readonly ChatReaction[];
  /** 글 안 "@이름"으로 부른 사람 id(PG-36) */
  mentions?: readonly string[];
}

/** 메신저 반응 종류(아이콘). 회사가 바꾸는 자리 */
export const CHAT_REACTIONS: readonly MessageThreadReactionOption[] = [
  { key: 'check', label: '확인', icon: 'check' },
  { key: 'thumbs-up', label: '좋아요', icon: 'thumbs-up' },
  { key: 'heart', label: '감사', icon: 'heart' },
  { key: 'party-popper', label: '축하', icon: 'party-popper' },
];

/** 지금 입력 중인 사람(방 id → 사람 id). 데모 시계 기준 고정 */
export const CHAT_TYPING: Readonly<Record<string, readonly string[]>> = {
  'ch-scm': ['e17'],
};

const TEAM = (t: Team) => EMPLOYEES.filter((e) => e.team === t).map((e) => e.id);

export const CHANNELS: readonly Channel[] = [
  {
    id: 'ch-notice',
    kind: 'channel',
    name: '전체 공지',
    members: EMPLOYEES.map((e) => e.id),
    unread: 0,
    pinned: 'n1',
  },
  {
    id: 'ch-scm',
    kind: 'channel',
    name: '구매-물류',
    members: [...TEAM('구매팀'), ...TEAM('물류팀'), 'u02', 'e02'],
    unread: 3,
    pinned: 'c6',
  },
  { id: 'ch-fin', kind: 'channel', name: '경영지원팀', members: TEAM('경영지원팀'), unread: 0 },
  {
    id: 'ch-sales',
    kind: 'channel',
    name: '영업-수주',
    members: [...TEAM('영업팀'), 'u02', 'e13'],
    unread: 12,
    muted: true,
  },
  {
    id: 'ch-ptk',
    kind: 'channel',
    name: '평택 냉동센터',
    members: ['e13', 'u05', 'e17', 'e18', 'u04', 'u02'],
    unread: 1,
  },
  {
    id: 'dm-u01',
    kind: 'dm',
    name: '윤지호 대표',
    empId: 'u01',
    members: ['u01', 'u02'],
    unread: 0,
  },
  {
    id: 'dm-u03',
    kind: 'dm',
    name: '박서연 대리',
    empId: 'u03',
    members: ['u03', 'u02'],
    unread: 2,
  },
  {
    id: 'dm-u04',
    kind: 'dm',
    name: '이하은 과장',
    empId: 'u04',
    members: ['u04', 'u02'],
    unread: 0,
  },
  {
    id: 'dm-e05',
    kind: 'dm',
    name: '안지수 대리',
    empId: 'e05',
    members: ['e05', 'u02'],
    unread: 0,
  },
  {
    id: 'dm-e19',
    kind: 'dm',
    name: '서정훈 팀장',
    empId: 'e19',
    members: ['e19', 'u02'],
    unread: 0,
  },
];

const msg = (
  id: string,
  channelId: string,
  authorId: string,
  at: string,
  text: string,
  extra: Partial<Pick<ChatMessage, 'files' | 'card' | 'replyTo' | 'reactions' | 'mentions'>> = {},
): ChatMessage => ({ id, channelId, authorId, at, text, ...extra });

export const MESSAGES: readonly ChatMessage[] = [
  msg(
    'c1',
    'ch-scm',
    'u04',
    '2026-11-05 16:42',
    'PO-2611-0043 견적 받았습니다. 단가 USD 17.00으로 전월보다 0.20 내려왔어요.',
  ),
  msg(
    'c2',
    'ch-scm',
    'e13',
    '2026-11-05 17:05',
    '12월 첫 주 평택 냉동센터 랙 여유 확인했습니다. 1,000KG 들어갑니다.',
  ),
  msg(
    'c3',
    'ch-scm',
    'u05',
    '2026-11-06 09:42',
    '평택 냉동센터에 Hokkai 가리비 관자 도착했습니다. 검수 시작합니다.',
  ),
  msg(
    'c4',
    'ch-scm',
    'u05',
    '2026-11-06 10:05',
    '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다.',
    {
      files: [
        {
          name: '파손-박스-01.jpg',
          size: 1_929_216,
          thumb: PHOTO_DAMAGED_BOX,
          href: PHOTO_DAMAGED_BOX,
        },
        { name: '파손-박스-02.jpg', size: 1_744_896, thumb: PHOTO_WET_BOX, href: PHOTO_WET_BOX },
        { name: '거래명세서-HK1101.pdf', size: 182_272 },
      ],
      reactions: [{ key: 'check', by: ['u04', 'e13'] }],
    },
  ),
  msg(
    'c5',
    'ch-scm',
    'u04',
    '2026-11-06 10:12',
    '확인했습니다. Hokkai 쪽에 클레임 메일 보내겠습니다. 수량 차이는 입고 확정 때 반영해 주세요.',
    { replyTo: 'c4', reactions: [{ key: 'thumbs-up', by: ['u05'] }] },
  ),
  msg(
    'c6',
    'ch-scm',
    'u04',
    '2026-11-06 10:48',
    '연어 필렛 추가 발주 결재 올렸습니다. 12월 2일 평택 입고 예정입니다.',
    {
      card: { kind: 'po', id: 'PO-2611-0043' },
      reactions: [{ key: 'check', by: ['e08', 'e13', 'u05'] }],
    },
  ),
  msg(
    'c7',
    'ch-scm',
    'e08',
    '2026-11-06 11:02',
    '@이하은 단가 잘 받았네요. 환율은 오늘 매매기준율로 잡았죠?',
    { mentions: ['u04'] },
  ),
  msg('c8', 'ch-scm', 'u04', '2026-11-06 11:05', '네, USD 1,384.50원 기준입니다.', {
    replyTo: 'c7',
  }),
  msg(
    'c9',
    'ch-scm',
    'e17',
    '2026-11-06 13:22',
    '가리비 관자 588KG 로트 HK261101로 임시 적치했습니다. 판정은 보류로 두었습니다.',
  ),

  msg(
    'f1',
    'ch-fin',
    'u03',
    '2026-11-06 09:10',
    'TI-2611-0116 누리식품 국세청 전송 실패 건은 사업자 상태 확인 중입니다.',
  ),
  msg('f2', 'ch-fin', 'u02', '2026-11-06 09:14', '확인되면 오늘 안에 다시 전송해 주세요.'),
  msg(
    'f3',
    'ch-fin',
    'e06',
    '2026-11-06 10:30',
    '연말정산 일정 게시판에 올렸습니다. 필독으로 걸어 두었어요.',
  ),
  msg('f4', 'ch-fin', 'e05', '2026-11-06 11:40', '12월 수입 대금 결제 일정표 공유합니다.', {
    files: [{ name: '12월_수입대금_결제일정.xlsx', size: 28_672 }],
  }),

  msg(
    's1',
    'ch-sales',
    'e20',
    '2026-11-06 10:20',
    '대양상사 12월 사전 발주 문의 들어왔습니다. 흰다리새우 300박스 · 연어 400KG입니다.',
  ),
  msg('s2', 'ch-sales', 'e19', '2026-11-06 10:35', '재고 확인하고 오후에 회신합시다.'),
  msg('s3', 'ch-sales', 'u06', '2026-11-06 13:05', '한결물산 내일 출고분 출고 요청 올렸습니다.'),

  msg(
    'n1',
    'ch-notice',
    'e06',
    '2026-11-05 10:15',
    '2026년 귀속 연말정산 일정을 게시판에 올렸습니다. 꼭 읽어 주세요.',
  ),
  msg(
    'n2',
    'ch-notice',
    'e06',
    '2026-11-03 14:00',
    '11월 8일 02:00~05:00 메일 · 메신저 정기 점검이 있습니다.',
  ),

  msg(
    'p1',
    'ch-ptk',
    'e13',
    '2026-11-06 08:10',
    '오늘 입고 2건입니다. 가리비 관자 09:40 · 미래패키징 14:00.',
  ),
  msg('p2', 'ch-ptk', 'e18', '2026-11-06 12:50', '오후 출고 배차 2대 확정했습니다.'),

  msg('d1', 'dm-u03', 'u03', '2026-11-06 11:50', '팀장님, 다음 주 목 · 금 연차 결재 부탁드립니다.'),
  msg('d2', 'dm-u03', 'u03', '2026-11-06 11:51', '원천세 신고는 화요일에 끝내 두겠습니다.'),
  msg('d3', 'dm-u01', 'u01', '2026-11-06 08:41', '14시 자금 계획 보고 메일 봤어요?'),
  msg(
    'd4',
    'dm-u01',
    'u02',
    '2026-11-06 08:45',
    '네, 결제 일정과 환율 시나리오 준비해서 가겠습니다.',
  ),
  msg('d5', 'dm-u04', 'u04', '2026-11-06 10:50', '연어 발주 품의 올렸습니다. 검토 부탁드립니다.'),
  msg('d6', 'dm-e05', 'e05', '2026-11-05 17:20', '법인카드 한도 상향 신청서 내일 올리겠습니다.'),
  msg('d7', 'dm-e19', 'e19', '2026-11-05 15:02', '10월 법인카드 정산 결재 확인 부탁드려요.'),
];
