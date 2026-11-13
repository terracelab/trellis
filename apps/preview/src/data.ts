// 미리보기 전체가 공유하는 mock 데이터. 같은 숫자가 홈 창·모바일 홈·밀도 비교에 똑같이 나온다.
// 2026-11-06은 금요일이다(2026-11-07은 토요일이라 고쳤다). 데모 블록의 TODAY와 같은 날
export const TODAY = {
  title: '11월 6일 금요일',
  short: '11월 6일',
  week: '11월 1주',
  /** 화면 블록과 같은 표기(formatDate mdw) */
  mdw: '11월 6일(금)',
  iso: '2026-11-06',
  /** 데모 시각. 블록의 NOW와 같다 */
  now: '14:20',
};
export const USER = { name: '김테라', title: '팀장', team: '경영지원팀', initials: '김테' };

/** 자금: 전일 + 수입 − 지출 = 당일 */
export const CASH = {
  previous: 842_150_000,
  income: 128_450_000,
  expense: 96_120_500,
  get today() {
    return this.previous + this.income - this.expense;
  },
  get delta() {
    return this.income - this.expense;
  },
  /** 최근 30일 시재(단위: 원). 마지막 값이 당일 */
  series: [
    781.4, 786.9, 779.2, 790.3, 795.8, 792.1, 801.6, 808.0, 804.3, 812.9, 818.4, 815.2, 822.7,
    827.1, 823.6, 830.9, 836.4, 832.0, 839.5, 845.2, 841.7, 848.3, 844.9, 851.6, 847.2, 850.1,
    846.3, 844.0, 842.15, 874.4795,
  ].map((n) => Math.round(n * 1_000_000)),
};

export const APPROVAL_PENDING = { total: 12, overdue: 3, overdueDays: 3 };
export const UNREAD = { total: 21, mail: 10 };

export type ApprovalKey = 'draft' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
export const APPROVAL_LABEL: Record<ApprovalKey, string> = {
  draft: '기안',
  pending: '진행',
  approved: '승인',
  rejected: '반려',
  withdrawn: '회수',
};

/** 결재 대기 목록(홈 우측 리스트·모바일 홈 공용) */
export const APPROVALS: {
  title: string;
  who: string;
  amount?: number;
  days: number;
  state: ApprovalKey;
}[] = [
  { title: '사무용품 구매 요청', who: '김도윤 대리', amount: 384_000, days: 4, state: 'pending' },
  { title: '부산 출장비 정산', who: '이하은 과장', amount: 1_250_000, days: 3, state: 'pending' },
  { title: '11월 법인카드 정산', who: '박서연 회계팀', amount: 2_384_000, days: 3, state: 'draft' },
  {
    title: '누리식품 식자재 발주',
    who: '정우진 주임',
    amount: 7_920_000,
    days: 1,
    state: 'rejected',
  },
  { title: '거래처 계약서 검토', who: '최민준 변호사', days: 0, state: 'approved' },
];

/** 알림 카드(모듈 id, 제목, 한 줄, 카운트, 지연 여부) */
export const NOTICES: {
  module: string;
  title: string;
  line: string;
  count?: number;
  overdue?: boolean;
}[] = [
  { module: 'mail', title: '메일', line: '읽지 않은 메일', count: UNREAD.mail },
  {
    module: 'approval',
    title: '전자결재',
    line: `${APPROVAL_PENDING.overdueDays}일 넘게 처리하지 않은 결재`,
    count: APPROVAL_PENDING.overdue,
    overdue: true,
  },
  { module: 'purchasing', title: '구매', line: '발주 승인 대기', count: 4 },
  { module: 'sales', title: '영업', line: '이번 주 마감 견적', count: 2 },
  { module: 'accounting', title: '회계', line: '11월 부가세 신고서 검토 완료' },
  { module: 'customers', title: '고객', line: '고객 정보 120건 갱신' },
];

/** 근태: 이번 주 경영지원팀 */
export const ATTENDANCE: { label: string; count: number; tone: 'neutral' | 'danger' }[] = [
  { label: '정상 근무', count: 32, tone: 'neutral' },
  { label: '연장 근무', count: 4, tone: 'neutral' },
  { label: '야간 근무', count: 1, tone: 'neutral' },
  { label: '근태 이상', count: 2, tone: 'danger' },
];

export const EVENTS: [string, string, string][] = [
  ['15:00', '주간 회의', '3층 대회의실'],
  ['16:30', '고객사 방문', '누리식품 · 견적 설명'],
];

/** 모바일 홈 타일: 모듈 id → 카운트(없으면 상태 문구) */
export const PHONE_TILES: [string, number | string][] = [
  ['mail', UNREAD.mail],
  ['approval', APPROVAL_PENDING.total],
  ['messenger', 3],
  ['calendar', EVENTS.length],
  ['attendance', '정상'],
  ['board', 8],
];

export const won = (n: number) => n.toLocaleString('ko-KR');
export const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${won(Math.abs(n))}`;

/** 근태 주간(요일별 × 4구분). 합계는 ATTENDANCE와 같다: 정상 32 · 연장 4 · 야간 1 · 이상 2 */
export const ATTENDANCE_WEEK: {
  date: string;
  normal: number;
  overtime: number;
  night: number;
  abnormal: number;
}[] = [
  { date: '11.02', normal: 7, overtime: 1, night: 0, abnormal: 0 },
  { date: '11.03', normal: 7, overtime: 1, night: 0, abnormal: 0 },
  { date: '11.04', normal: 6, overtime: 1, night: 0, abnormal: 1 },
  { date: '11.05', normal: 6, overtime: 1, night: 1, abnormal: 0 },
  { date: '11.06', normal: 6, overtime: 0, night: 0, abnormal: 1 },
];
export const ATTENDANCE_KINDS: {
  key: keyof Omit<(typeof ATTENDANCE_WEEK)[number], 'date'>;
  label: string;
  tone: string;
}[] = [
  { key: 'normal', label: '정상 근무', tone: 'erp' },
  { key: 'overtime', label: '연장 근무', tone: 'crm' },
  { key: 'night', label: '야간 근무', tone: 'warning' },
  { key: 'abnormal', label: '근태 이상', tone: 'danger' },
];

/** 메신저 알림 카드 */
export const MESSAGE = {
  from: '이수민 대리',
  team: '회계팀',
  time: '오전 9:47',
  text: '주간 회의록 공유드립니다',
  count: 2,
  initials: '이수',
};

/** 런처(모바일 전체 메뉴) 타일 12 */
export const LAUNCHER = [
  'mail',
  'approval',
  'attendance',
  'calendar',
  'accounting',
  'treasury',
  'purchasing',
  'sales',
  'production',
  'hr-payroll',
  'customers',
  'doc-editor',
];

/** 문서함 최근 문서 */
export const DOCS: [string, string, string][] = [
  ['2026년 11월 자금 운용 계획.xlsx', '김테라', '오늘 09:12'],
  ['누리식품 공급 계약서_v3.hwp', '최민준', '어제'],
  ['경영지원팀 주간 보고_11월 1주.docx', '이수민', '11.05'],
  ['법인카드 사용 내역_10월.pdf', '박서연', '11.03'],
];

/** 11월 달력(월요일 시작). 11/1 토 → 앞에 빈칸 5 */
export const CALENDAR = {
  title: '2026년 11월',
  lead: 5,
  days: 30,
  today: 7,
  events: { 4: 'erp', 7: 'groupware', 12: 'crm', 18: 'ecm', 25: 'groupware' } as Record<
    number,
    string
  >,
};

/* ── 차트 섹션 데이터(결정적). 합계는 다른 화면의 숫자와 맞춘다 ───── */

/** 월별 매출(완료된 12개월, 단위 원) · 전년 같은 달 · 마진율(%) */
export const SALES_MONTHLY: { month: string; sales: number; prev: number; margin: number }[] = [
  ['24.11', 1_284, 1_152, 12.4],
  ['24.12', 1_412, 1_236, 13.1],
  ['25.01', 1_098, 1_010, 11.2],
  ['25.02', 1_056, 988, 10.9],
  ['25.03', 1_322, 1_190, 12.8],
  ['25.04', 1_378, 1_244, 13.0],
  ['25.05', 1_450, 1_301, 13.6],
  ['25.06', 1_396, 1_288, 12.9],
  ['25.07', 1_468, 1_320, 13.3],
  ['25.08', 1_392, 1_298, 12.5],
  ['25.09', 1_524, 1_362, 14.1],
  ['25.10', 1_588, 1_410, 14.4],
].map(([month, sales, prev, margin]) => ({
  month: String(month),
  sales: Number(sales) * 1_000_000,
  prev: Number(prev) * 1_000_000,
  margin: Number(margin),
}));
export const SALES_12M = SALES_MONTHLY.reduce((s, m) => s + m.sales, 0);
export const SALES_PREV_12M = SALES_MONTHLY.reduce((s, m) => s + m.prev, 0);

/** 채널 구성(10월). 색은 채널에 고정 */
export const SALES_CHANNELS: {
  label: string;
  value: number;
  color: 'series-1' | 'series-2' | 'series-3' | 'series-4';
}[] = [
  { label: '직판', value: 742_000_000, color: 'series-1' },
  { label: '대리점', value: 486_000_000, color: 'series-2' },
  { label: '온라인', value: 238_000_000, color: 'series-3' },
  { label: '수출', value: 122_000_000, color: 'series-4' },
];

/** 지사별 매출(10월, 원) */
export const BRANCH_SALES: { label: string; value: number }[] = [
  { label: '서울 본사', value: 612_000_000 },
  { label: '경기 남부', value: 318_000_000 },
  { label: '부산·경남', value: 246_000_000 },
  { label: '대구·경북', value: 164_000_000 },
  { label: '광주·전라', value: 128_000_000 },
  { label: '대전·충청', value: 92_000_000 },
  { label: '강원', value: 28_000_000 },
];

/** 11월 예산 집행(원) — 시작 → 증감 → 잔액 */
export const BUDGET_STEPS: {
  label: string;
  value: number;
  kind: 'start' | 'delta' | 'total';
  caption?: string;
}[] = [
  { label: '예산', value: 420_000_000, kind: 'start' },
  { label: '인건비', value: -186_000_000, kind: 'delta', caption: '44%' },
  { label: '재료비', value: -124_500_000, kind: 'delta', caption: '30%' },
  { label: '경비', value: -38_200_000, kind: 'delta', caption: '9%' },
  { label: '추가', value: 25_000_000, kind: 'delta', caption: '편성' },
  { label: '잔액', value: 96_300_000, kind: 'total' },
];

/** 발주 소진율(%) */
export const ORDER_FILL: { label: string; value: number; target: number; caption: string }[] = [
  { label: '누리식품 식자재', value: 92, target: 100, caption: '11/14 마감' },
  { label: '한결물산 포장재', value: 100, target: 100, caption: '11/07 완료' },
  { label: '대호상사 소모품', value: 61, target: 100, caption: '11/21 마감' },
  { label: '법인카드 한도', value: 104, target: 100, caption: '경영지원팀' },
];

/** 10월 일별 판매 건수 */
export const DAILY_SALES: { date: string; value: number }[] = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const dow = (new Date(Date.UTC(2026, 9, day)).getUTCDay() + 6) % 7; // 월=0
  const weekend = dow >= 5;
  const base = weekend ? 6 : 28;
  const wave = Math.round(10 * Math.sin((day / 31) * Math.PI * 2 + 1.2));
  return {
    date: `2026-10-${String(day).padStart(2, '0')}`,
    value: Math.max(0, base + wave + ((day * 7) % 9)),
  };
});

/** 거래처 미수 현황(원). 에이징 4구간의 합 = 잔액 */
export const RECEIVABLES: {
  name: string;
  balance: number;
  aging: [number, number, number, number];
  rate: number;
  state: 'normal' | 'warn' | 'over';
}[] = [
  {
    name: '누리식품',
    balance: 48_200_000,
    aging: [31_000_000, 12_400_000, 4_800_000, 0],
    rate: 96,
    state: 'normal',
  },
  {
    name: '한결물산',
    balance: 36_900_000,
    aging: [9_500_000, 11_200_000, 10_600_000, 5_600_000],
    rate: 71,
    state: 'warn',
  },
  {
    name: '대호상사',
    balance: 21_300_000,
    aging: [21_300_000, 0, 0, 0],
    rate: 99,
    state: 'normal',
  },
  {
    name: '서진유통',
    balance: 18_750_000,
    aging: [2_100_000, 3_400_000, 4_250_000, 9_000_000],
    rate: 42,
    state: 'over',
  },
  {
    name: '미래푸드',
    balance: 12_400_000,
    aging: [8_000_000, 4_400_000, 0, 0],
    rate: 88,
    state: 'normal',
  },
  {
    name: '청담F&B',
    balance: 9_800_000,
    aging: [0, 2_800_000, 7_000_000, 0],
    rate: 63,
    state: 'warn',
  },
];

/** KPI 타일(추이는 최근 8주) */
export const KPIS: {
  label: string;
  value: number;
  unit: string;
  delta: number;
  deltaLabel: string;
  spark: number[];
  polarity: 'up-good' | 'up-bad';
}[] = [
  {
    label: '10월 매출',
    value: 1_588_000_000,
    unit: '원',
    delta: 12.6,
    deltaLabel: '전년 동월',
    spark: [1284, 1412, 1098, 1056, 1322, 1378, 1450, 1588],
    polarity: 'up-good',
  },
  {
    label: '영업이익률',
    value: 14.4,
    unit: '%',
    delta: 0.9,
    deltaLabel: '전월',
    spark: [12.4, 13.1, 11.2, 10.9, 12.8, 13.0, 13.6, 14.4],
    polarity: 'up-good',
  },
  {
    label: '미수 잔액',
    value: 147_350_000,
    unit: '원',
    delta: -4.2,
    deltaLabel: '전월',
    spark: [162, 158, 171, 166, 159, 154, 151, 147],
    polarity: 'up-bad',
  },
  {
    label: '결재 평균 처리',
    value: 1.8,
    unit: '일',
    delta: -0.4,
    deltaLabel: '전월',
    spark: [2.6, 2.4, 2.5, 2.2, 2.1, 2.0, 2.2, 1.8],
    polarity: 'up-bad',
  },
];

/* ── 쇼케이스 화면(PG-04). 이름 · 날짜 · 금액은 화면 블록 샘플(blocks/src/_data)의 테라트레이딩과 같다 ── */
export const COMPANY = { name: '테라트레이딩', legal: '테라트레이딩(주)' };

export type PeopleStatus = 'active' | 'leave' | 'retired';
export type Presence = 'working' | 'remote' | 'fieldwork' | 'leave' | 'off';
export interface Person {
  id: string;
  name: string;
  title: string;
  department: string;
  hiredAt: string;
  status: PeopleStatus;
  employment: '정규직' | '계약직';
  presence?: Presence;
}
const person = (
  id: string,
  name: string,
  title: string,
  department: string,
  hiredAt: string,
  status: PeopleStatus,
  employment: Person['employment'],
  presence?: Presence,
): Person => ({
  id,
  name,
  title,
  department,
  hiredAt,
  status,
  employment,
  ...(presence ? { presence } : {}),
});
/** 인사 기록 14명. 사번 순 */
export const PEOPLE: Person[] = [
  person('2015001', '윤지호', '대표', '경영', '2015-03-02', 'active', '정규직', 'working'),
  person('2016004', '오태식', '과장', '물류팀', '2016-08-01', 'leave', '정규직'),
  person('2017002', '김테라', '팀장', '경영지원팀', '2017-01-09', 'active', '정규직', 'working'),
  person('2018003', '이하은', '과장', '구매팀', '2018-04-02', 'active', '정규직', 'working'),
  person('2019005', '강도현', '팀장', '영업팀', '2019-10-01', 'active', '정규직', 'fieldwork'),
  person('2020002', '김도윤', '반장', '생산팀', '2020-06-01', 'active', '정규직', 'working'),
  person('2020007', '한예린', '대리', '경영지원팀', '2020-02-03', 'retired', '정규직'),
  person('2021004', '박서연', '대리', '경영지원팀', '2021-07-05', 'active', '정규직', 'remote'),
  person('2022001', '정우진', '주임', '물류팀', '2022-02-14', 'active', '정규직', 'working'),
  person('2022006', '서지민', '대리', '영업팀', '2022-05-02', 'active', '정규직', 'leave'),
  person('2023003', '장하늘', '주임', '영업팀', '2023-03-06', 'leave', '정규직'),
  person('2024002', '최민준', '사원', '영업팀', '2024-09-02', 'active', '정규직', 'working'),
  person('2025001', '문가영', '사원', '구매팀', '2025-03-04', 'active', '정규직', 'working'),
  person('2026002', '이수빈', '사원', '생산팀', '2026-04-01', 'active', '계약직', 'off'),
];

/** 근속(TODAY 기준) 'N년 M개월' */
export function tenure(hiredAt: string, today = TODAY.iso): string {
  const [y1, m1, d1] = hiredAt.split('-').map(Number) as [number, number, number];
  const [y2, m2, d2] = today.split('-').map(Number) as [number, number, number];
  const months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y ? `${y}년 ${m}개월` : `${m}개월`;
}

/** 역할별 홈(인사 담당): 처리할 일 · 계약 만료 · 입사 준비 */
export const HR_TASKS: { title: string; detail: string; due: string; icon: string }[] = [
  {
    title: '입사 서류 확인',
    detail: '정다온 사원 · 물류팀 · 11월 16일 입사',
    due: '2026-11-12',
    icon: 'file-check',
  },
  {
    title: '연차 사용 계획 확인',
    detail: '남은 연차 5일 이상 재직자 · 12월 31일 소멸',
    due: '2026-11-13',
    icon: 'calendar-days',
  },
  {
    title: '퇴직금 정산',
    detail: '한예린 대리 · 10월 31일 퇴사',
    due: '2026-11-14',
    icon: 'wallet',
  },
  {
    title: '11월 근태 마감',
    detail: '연장 · 휴가 결재를 급여에 반영',
    due: '2026-11-20',
    icon: 'clock',
  },
  { title: '11월 급여 대장 확정', detail: '지급일 11월 25일', due: '2026-11-23', icon: 'receipt' },
  {
    title: '4대보험 취득 신고',
    detail: '정다온 사원 · 입사일부터 14일 안',
    due: '2026-11-30',
    icon: 'shield-check',
  },
];
export const TERM_ENDS: { name: string; meta: string; label: string; end: string; next: string }[] =
  [
    {
      name: '오태식',
      meta: '물류팀 · 과장',
      label: '병가 휴직 종료',
      end: '2027-01-21',
      next: '복직 면담 1월 14일',
    },
    {
      name: '이수빈',
      meta: '생산팀 · 사원',
      label: '계약직 근로계약 만료',
      end: '2027-03-31',
      next: '갱신 여부 2월 28일까지 통보',
    },
    {
      name: '장하늘',
      meta: '영업팀 · 주임',
      label: '육아휴직 종료',
      end: '2027-05-31',
      next: '복직 의사 4월 30일까지 확인',
    },
  ];
export const ONBOARDING: {
  name: string;
  meta: string;
  start: string;
  employment: string;
  mentor: string;
  done: number;
  steps: number;
}[] = [
  {
    name: '정다온',
    meta: '물류팀 · 사원',
    start: '2026-11-16',
    employment: '정규직',
    mentor: '정우진 주임',
    done: 2,
    steps: 5,
  },
  {
    name: '백승우',
    meta: '영업팀 · 대리',
    start: '2026-12-01',
    employment: '정규직',
    mentor: '서지민 대리',
    done: 1,
    steps: 5,
  },
];
export const LEAVE_PENDING = 2;

/** 휴대폰 홈: 오늘 근무(TimeClock) · 바로 가기 · 오늘 할 일 */
export const MY_DAY = {
  clockIn: '08:52',
  schedule: { start: '09:00', end: '18:00', breakMinutes: 60 },
  workType: '고정 근무 · 본사 12층',
};
export const QUICK: { module: string; label: string }[] = [
  { module: 'attendance', label: '휴가 신청' },
  { module: 'approval', label: '결재함' },
  { module: 'hr-payroll', label: '임금명세서' },
  { module: 'calendar', label: '일정' },
];
export const MY_TASKS: {
  title: string;
  meta: string;
  due?: string;
  time?: string;
  icon: string;
}[] = [
  {
    title: '평택 냉동센터 10월 전기요금 · 관리비',
    meta: '결재 차례 · 기안 정우진 주임',
    due: '2026-11-03',
    icon: 'stamp',
  },
  {
    title: '10월 영업팀 법인카드 사용분 정산',
    meta: '결재 차례 · 기안 서지민 대리',
    due: '2026-11-05',
    icon: 'stamp',
  },
  { title: '주간 회의', meta: '15:00~16:00 · 3층 대회의실', time: '15:00', icon: 'calendar' },
  {
    title: '고객사 방문',
    meta: '16:30~17:30 · 누리식품 · 견적 설명',
    time: '16:30',
    icon: 'calendar',
  },
];

/** 결재선: 누리식품 11월 2차 발주(구매 품의) */
export const PURCHASE_DOC = {
  title: '누리식품 11월 2차 식자재 발주',
  no: 'AP-2611-014',
  amount: 7_920_000,
  line: [
    { id: 'p1', name: '이하은', title: '과장', role: '기안', state: 'draft', time: '11-05 10:12' },
    {
      id: 'p2',
      name: '김테라',
      title: '팀장',
      role: '검토',
      state: 'approved',
      time: '11-05 14:40',
      comment: '단가 비교표 확인했습니다',
    },
    { id: 'p3', name: '윤지호', title: '대표', role: '승인', state: 'pending' },
  ] as const,
};

/** 임금명세서(2026년 10월분, 김테라 팀장). 공제는 10원 단위 버림 */
const floor10 = (n: number) => Math.floor(n / 10) * 10;
const PAY_BASE = 4_200_000;
const PAY_POSITION = 300_000;
const PAY_HOURLY = Math.round((PAY_BASE + PAY_POSITION) / 209);
const PAY_OT = Math.round(6 * PAY_HOURLY * 1.5);
const PAY_TAXABLE = PAY_BASE + PAY_POSITION + PAY_OT;
const PAY_HEALTH = floor10(PAY_TAXABLE * 0.03595);
const PAY_INCOME_TAX = 312_480;
export const PAYSLIP = {
  period: '2026-10',
  payDate: '2026-10-23',
  employee: { name: '김테라', employeeNo: '2017002', department: '경영지원팀', position: '팀장' },
  work: { days: 21, hours: 215, overtimeHours: 6 },
  earnings: [
    { code: 'basePay', amount: PAY_BASE, basis: '월 소정근로 209시간' },
    { label: '직책수당', amount: PAY_POSITION },
    { code: 'overtimePay', amount: PAY_OT, basis: `6시간 × 통상시급 ${won(PAY_HOURLY)}원 × 1.5` },
    { code: 'mealAllowance', amount: 200_000, taxFree: true },
    { code: 'carAllowance', amount: 200_000, taxFree: true },
  ],
  deductions: [
    {
      code: 'nationalPension',
      amount: floor10(PAY_TAXABLE * 0.0475),
      basis: '기준소득월액 × 4.75%',
    },
    { code: 'healthInsurance', amount: PAY_HEALTH, basis: '보수월액 × 3.595%' },
    { code: 'longTermCare', amount: floor10(PAY_HEALTH * 0.1314), basis: '건강보험료 × 13.14%' },
    { code: 'employmentInsurance', amount: floor10(PAY_TAXABLE * 0.009), basis: '보수 × 0.9%' },
    { code: 'incomeTax', amount: PAY_INCOME_TAX, basis: '간이세액표 · 공제대상가족 3명' },
    { code: 'localIncomeTax', amount: floor10(PAY_INCOME_TAX * 0.1), basis: '소득세 × 10%' },
  ],
} as const;

/** 11월 일정(달력). 색은 캘린더 슬롯 */
export const MONTH_EVENTS: {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  start?: string;
  end?: string;
  color: 'series-1' | 'series-2' | 'series-3' | 'series-4' | 'series-5' | 'warning' | 'danger';
  meta?: string;
}[] = [
  { id: 'e1', date: '2026-11-03', title: '누리식품 미팅', start: '10:00', color: 'series-1' },
  {
    id: 'e2',
    date: '2026-11-06',
    title: '주간 회의',
    start: '15:00',
    end: '16:00',
    color: 'series-2',
    meta: '3층 대회의실',
  },
  {
    id: 'e3',
    date: '2026-11-06',
    title: '고객사 방문',
    start: '16:30',
    end: '17:30',
    color: 'series-1',
    meta: '누리식품',
  },
  { id: 'e4', date: '2026-11-10', endDate: '2026-11-12', title: '박서연 연차', color: 'series-3' },
  { id: 'e5', date: '2026-11-12', title: '입사 서류 마감', color: 'warning' },
  { id: 'e6', date: '2026-11-16', title: '정다온 입사', color: 'series-4' },
  { id: 'e7', date: '2026-11-20', title: '11월 근태 마감', color: 'warning' },
  { id: 'e8', date: '2026-11-25', title: '급여 지급', color: 'series-5' },
  { id: 'e9', date: '2026-11-25', title: '부가세 예정신고 마감', color: 'danger' },
];

/** 메신저: 구매팀 대화 */
export const CHAT_CHANNELS: { name: string; last: string; time: string; unread?: number }[] = [
  { name: '구매팀', last: '평택 냉동센터 입고는 11월 10일입니다', time: '10:31', unread: 3 },
  { name: '경영지원팀', last: '11월 급여 대장 초안 올렸습니다', time: '09:58' },
  { name: '이하은 과장', last: '발주서 확인 부탁드립니다', time: '어제' },
  { name: '영업팀', last: '누리식품 견적 수정본입니다', time: '어제', unread: 1 },
  { name: '물류팀', last: '부산 신항 통관 끝났습니다', time: '11.04' },
];
export const CHAT: {
  id: string;
  at: string;
  author?: { id: string; name: string; meta?: string };
  own?: boolean;
  kind?: 'system';
  text?: string;
  file?: { name: string; size: number };
  unread?: number;
}[] = [
  {
    id: 'm1',
    at: '2026-11-06 10:12',
    author: { id: '2018003', name: '이하은 과장', meta: '구매팀' },
    text: '누리식품 11월 2차 발주서 올렸습니다. 냉동 새우 단가가 지난달보다 4% 올랐습니다',
  },
  {
    id: 'm2',
    at: '2026-11-06 10:13',
    author: { id: '2018003', name: '이하은 과장', meta: '구매팀' },
    file: { name: '누리식품_11월_2차_발주서.xlsx', size: 48_640 },
  },
  {
    id: 'm3',
    at: '2026-11-06 10:20',
    own: true,
    text: '확인했습니다. 결재선에 대표님까지 넣어서 올려 주세요',
    unread: 0,
  },
  { id: 'm4', at: '2026-11-06 10:24', kind: 'system', text: '문가영 사원이 들어왔습니다' },
  {
    id: 'm5',
    at: '2026-11-06 10:31',
    author: { id: '2022001', name: '정우진 주임', meta: '물류팀' },
    text: '평택 냉동센터 입고는 11월 10일입니다. 냉동 칸 자리는 잡아 두었습니다',
  },
];

/** 재고 현황: 품목 × 창고(EA). 안전재고 미만은 주의 */
export const WAREHOUSES = ['이천 1센터', '평택 냉동센터', '부산 신항 보세창고'] as const;
export const STOCK: {
  code: string;
  name: string;
  qty: [number, number, number];
  safety: number;
}[] = [
  { code: 'FZ-1102', name: '냉동 새우 2kg', qty: [0, 412, 160], safety: 300 },
  { code: 'FZ-1108', name: '냉동 오징어 1kg', qty: [0, 186, 0], safety: 240 },
  { code: 'FZ-1214', name: '연어 필렛 1kg', qty: [0, 94, 220], safety: 120 },
  { code: 'AM-2031', name: '올리브유 1L', qty: [640, 0, 480], safety: 400 },
  { code: 'AM-2040', name: '파스타면 500g', qty: [1_280, 0, 0], safety: 600 },
  { code: 'PK-3002', name: '아이스박스 대', qty: [96, 310, 0], safety: 500 },
  { code: 'PK-3010', name: '보냉팩 500g', qty: [2_400, 1_800, 0], safety: 2_000 },
];

/** 전표 한 장(외상 매입). 차변 합계 = 대변 합계 */
export const JOURNAL = {
  no: '2026-1106-003',
  date: '2026-11-06',
  memo: '누리식품 11월 1차 식자재 매입',
  lines: [
    { account: '상품', partner: '누리식품', debit: 7_200_000, credit: 0 },
    { account: '부가세대급금', partner: '누리식품', debit: 720_000, credit: 0 },
    { account: '외상매입금', partner: '누리식품', debit: 0, credit: 7_920_000 },
  ],
};
/** 이달 전표(최근 순). 금액은 차변 합계 */
export const JOURNAL_RECENT: { no: string; date: string; memo: string; amount: number }[] = [
  {
    no: '2026-1106-002',
    date: '2026-11-06',
    memo: '평택 냉동센터 10월 전기요금 · 관리비',
    amount: 1_284_000,
  },
  { no: '2026-1106-001', date: '2026-11-06', memo: '한결물산 매출 입금', amount: 12_600_000 },
  {
    no: '2026-1105-004',
    date: '2026-11-05',
    memo: '10월 영업팀 법인카드 사용분',
    amount: 2_384_000,
  },
  { no: '2026-1105-003', date: '2026-11-05', memo: '부산 신항 통관 비용', amount: 846_000 },
  { no: '2026-1104-002', date: '2026-11-04', memo: '대호상사 소모품 매입', amount: 418_000 },
];

/**
 * 에이전트 대화(업무 영역 판): 업무 도우미에게 평택 냉동센터 재고를 묻는다. 네트워크 · 모델 호출 없는 고정 답이고
 * 숫자는 위 STOCK에서 만든다. 데이터를 바꾸는 일은 제안 카드(ProposalCard)로만 보이고 사람이 승인해야 바뀐다
 */
const SQUID = STOCK.find((s) => s.code === 'FZ-1108')!;
const SQUID_QTY = SQUID.qty[1];
const SQUID_LOTS = [
  { lot: 'L-2609-14', qty: 120, expiry: '2027-03-18' },
  { lot: 'L-2610-03', qty: SQUID_QTY - 120, expiry: '2027-04-02' },
];
const SQUID_GAP = SQUID.safety - SQUID_QTY;
const SQUID_PRICE = 9_000;
const PO_QTY = { before: 120, after: 180 };
export const AGENT = {
  name: '업무 도우미',
  conversations: [
    {
      id: 'a1',
      title: `평택 냉동센터 ${SQUID.name} 재고`,
      secondary: '확인 대기 · 변경 제안 1건',
      meta: '10:40',
      group: '오늘',
    },
    {
      id: 'a2',
      title: '세금계산서 전송 실패',
      secondary: '11월 전송 실패 2건과 관련 전표',
      meta: '09:12',
      group: '오늘',
    },
    {
      id: 'a3',
      title: '3분기 결산 보고서 확정본',
      secondary: '확정본은 3판입니다',
      meta: '17:05',
      group: '11월 5일',
    },
  ],
  question: `평택 냉동센터 ${SQUID.name} 재고 얼마나 남았어?`,
  askedAt: '2026-11-06 10:40',
  steps: [
    { id: 'item', name: '품목 찾기', description: SQUID.name, durationMs: 540 },
    { id: 'stock', name: '재고 조회', description: '평택 냉동센터', durationMs: 1_320 },
    {
      id: 'lots',
      name: '로트 · 유통기한 확인',
      description: `로트 ${SQUID_LOTS.length}개`,
      durationMs: 870,
    },
    { id: 'propose', name: '변경 제안 작성', durationMs: 1_150 },
  ],
  answer: [
    `평택 냉동센터의 ${SQUID.name} 재고는 ${won(SQUID_QTY)}EA입니다[1]. 안전재고 ${won(SQUID.safety)}EA보다 ${won(SQUID_GAP)}EA 적습니다.`,
    '',
    '| 로트 | 수량(EA) | 유통기한 |',
    '|---|---:|---|',
    ...SQUID_LOTS.map((l) => `| ${l.lot} | ${won(l.qty)} | ${l.expiry} |`),
    '',
    `누리식품 11월 3차 발주서는 아직 기안 상태입니다[2]. ${SQUID.name} 발주 수량을 ${won(PO_QTY.after - PO_QTY.before)}EA 늘리는 제안을 만들었습니다. 승인해야 바뀝니다.`,
  ].join('\n'),
  sources: [
    { index: 1, title: `재고 현황 · ${SQUID.name}`, location: '평택 냉동센터' },
    { index: 2, title: '발주서 PO-2611-021', location: '누리식품 · 기안' },
  ],
  suggestions: ['유통기한 30일 안 로트 알려 줘', '이번 주 입고 예정 보여 줘'],
  proposal: {
    title: '누리식품 11월 3차 발주 수량 변경',
    summary: `평택 냉동센터 재고가 안전재고보다 ${won(SQUID_GAP)}EA 적어 ${SQUID.name}을 ${won(PO_QTY.after - PO_QTY.before)}EA 더 발주합니다. 발주서는 기안 상태라 결재선은 바뀌지 않습니다.`,
    changes: [
      {
        target: SQUID.name,
        field: '발주 수량',
        before: `${won(PO_QTY.before)}EA`,
        after: `${won(PO_QTY.after)}EA`,
      },
      {
        target: 'PO-2611-021',
        field: '공급가액',
        before: `${won(PO_QTY.before * SQUID_PRICE)}원`,
        after: `${won(PO_QTY.after * SQUID_PRICE)}원`,
      },
    ],
    approveLabel: '변경 적용',
  },
};
