// ECM(문서함 · 전사 규정 · 부서 문서 · 문서 작성) · CRM(고객 · 영업기회 · 견적 · 상담) 샘플 데이터.
// 거래처 · 품목 · 세금계산서 · 미수금 숫자는 trade.ts를 그대로 쓴다. 날짜는 TODAY 기준으로 고정(결정적).
import {
  formatAmount,
  formatQuantity,
  type ApprovalState,
  type ProgressState,
  type StatusTone,
} from '@terracelab/trellis-contracts';
import {
  INVOICES,
  invoiceSupply,
  itemById,
  partyById,
  RECEIVABLES,
  TODAY,
  type Party,
} from './trade.js';

/* ── 사람(_platform/mock.ts USERS + 영업 · 고객지원 · 구매 인원) ── */

export interface Staff {
  name: string;
  title: string;
  dept: string;
}

export const STAFF: readonly Staff[] = [
  { name: '윤지호', title: '대표', dept: '경영' },
  { name: '김테라', title: '팀장', dept: '경영지원팀' },
  { name: '박서연', title: '대리', dept: '경영지원팀' },
  { name: '이하은', title: '과장', dept: '구매팀' },
  { name: '서민재', title: '주임', dept: '구매팀' },
  { name: '오태식', title: '과장', dept: '물류팀' },
  { name: '정우진', title: '주임', dept: '물류팀' },
  { name: '강도현', title: '팀장', dept: '영업팀' },
  { name: '송유나', title: '대리', dept: '영업팀' },
  { name: '최민준', title: '사원', dept: '영업팀' },
  { name: '문채원', title: '주임', dept: '영업팀' },
];

/** 이름 → "김테라 팀장" */
export const staffLabel = (name: string) => {
  const s = STAFF.find((x) => x.name === name);
  return s ? `${s.name} ${s.title}` : name;
};

/** 영업 담당(필터 · 담당 지정) */
export const SALES_REPS = ['강도현', '송유나', '최민준'] as const;

/** ISO 날짜에 일수를 더한다(시간대 영향 없이) */
export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const t = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + days));
  return t.toISOString().slice(0, 10);
}

/* ══ ECM ═══════════════════════════════════════════════════ */

export type ShareScope = 'private' | 'dept' | 'people' | 'link';
export const SHARE_SCOPES: Record<
  ShareScope,
  { label: string; tone: StatusTone; description: string }
> = {
  private: { label: '비공개', tone: 'neutral', description: '나만 봅니다' },
  dept: { label: '부서 공유', tone: 'info', description: '경영지원팀 구성원이 봅니다' },
  people: { label: '지정 공유', tone: 'info', description: '고른 사람만 봅니다' },
  link: {
    label: '외부 링크',
    tone: 'warning',
    description: '링크를 받은 외부 사람이 만료일까지 봅니다',
  },
};

/** 확장자 → 파일 종류 이름(표 · 상세) */
export const FILE_KINDS: Record<string, string> = {
  xlsx: '엑셀 문서',
  pdf: 'PDF 문서',
  docx: '워드 문서',
  zip: '압축 파일',
  jpg: '이미지',
};
export const extOf = (name: string) => name.slice(name.lastIndexOf('.') + 1).toLowerCase();

export interface DocFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export const MY_FOLDERS: readonly DocFolder[] = [
  { id: 'root', name: '내 문서', parentId: null },
  { id: 'close', name: '2026 결산', parentId: 'root' },
  { id: 'close-10', name: '10월 마감', parentId: 'close' },
  { id: 'close-11', name: '11월 마감', parentId: 'close' },
  { id: 'tax', name: '세무 신고', parentId: 'root' },
  { id: 'vat', name: '부가세 2기 예정', parentId: 'tax' },
  { id: 'contract', name: '거래처 계약서', parentId: 'root' },
  { id: 'meeting', name: '회의록', parentId: 'root' },
  { id: 'shared', name: '공유받은 문서', parentId: null },
  { id: 'trash', name: '휴지통', parentId: null },
];

export interface DocVersion {
  version: number;
  at: string;
  by: string;
  note: string;
}

export interface DocFile {
  id: string;
  name: string;
  folderId: string;
  /** 바이트 */
  size: number;
  modifiedBy: string;
  modifiedAt: string;
  version: number;
  /** 보존 기한(ISO)과 근거 */
  retainUntil: string;
  retention: string;
  share: ShareScope;
  sharedWith: readonly string[];
  attachments?: readonly { name: string; size: number }[];
  versions?: readonly DocVersion[];
}

export const MY_FILES: readonly DocFile[] = [
  {
    id: 'd01',
    name: '11월 1주차 자금 일보.xlsx',
    folderId: 'close-11',
    size: 186_400,
    modifiedBy: '박서연',
    modifiedAt: '2026-11-06 09:40',
    version: 4,
    retainUntil: '2031-12-31',
    retention: '회계 증빙 5년',
    share: 'dept',
    sharedWith: ['경영지원팀'],
  },
  {
    id: 'd02',
    name: '11월 매출 세금계산서 발행 내역.xlsx',
    folderId: 'close-11',
    size: 421_900,
    modifiedBy: '박서연',
    modifiedAt: '2026-11-06 08:55',
    version: 2,
    retainUntil: '2031-12-31',
    retention: '세무 증빙 5년',
    share: 'dept',
    sharedWith: ['경영지원팀'],
  },
  {
    id: 'd03',
    name: '11월 마감 일정표.pdf',
    folderId: 'close-11',
    size: 98_300,
    modifiedBy: '김테라',
    modifiedAt: '2026-11-02 10:10',
    version: 1,
    retainUntil: '2029-12-31',
    retention: '내부 문서 3년',
    share: 'people',
    sharedWith: ['윤지호 대표', '박서연 대리'],
  },
  {
    id: 'd04',
    name: '2026년 10월 결산 보고서.pdf',
    folderId: 'close-10',
    size: 2_516_600,
    modifiedBy: '김테라',
    modifiedAt: '2026-11-05 17:20',
    version: 3,
    retainUntil: '2036-12-31',
    retention: '결산 서류 10년',
    share: 'people',
    sharedWith: ['윤지호 대표', '한소희 회계사(외부 감사)'],
    attachments: [
      { name: '10월 손익계산서.xlsx', size: 312_400 },
      { name: '10월 재무상태표.xlsx', size: 268_900 },
      { name: '거래처별 미수금 명세.xlsx', size: 154_200 },
    ],
    versions: [
      { version: 3, at: '2026-11-05 17:20', by: '김테라', note: '대표 검토 의견 반영 · 확정' },
      { version: 2, at: '2026-11-04 19:05', by: '박서연', note: '미수금 명세 · 재고 평가 추가' },
      { version: 1, at: '2026-11-03 16:30', by: '박서연', note: '초안 등록' },
    ],
  },
  {
    id: 'd05',
    name: '10월 거래처 원장 대사표.xlsx',
    folderId: 'close-10',
    size: 1_153_400,
    modifiedBy: '박서연',
    modifiedAt: '2026-11-04 15:02',
    version: 5,
    retainUntil: '2031-12-31',
    retention: '회계 증빙 5년',
    share: 'dept',
    sharedWith: ['경영지원팀'],
  },
  {
    id: 'd06',
    name: '10월 법인카드 사용 내역.xlsx',
    folderId: 'close-10',
    size: 331_800,
    modifiedBy: '박서연',
    modifiedAt: '2026-11-03 11:30',
    version: 2,
    retainUntil: '2031-12-31',
    retention: '회계 증빙 5년',
    share: 'private',
    sharedWith: [],
  },
  {
    id: 'd07',
    name: '10월 마감 체크리스트.pdf',
    folderId: 'close-10',
    size: 143_400,
    modifiedBy: '김테라',
    modifiedAt: '2026-11-01 09:15',
    version: 1,
    retainUntil: '2029-12-31',
    retention: '내부 문서 3년',
    share: 'dept',
    sharedWith: ['경영지원팀'],
  },
  {
    id: 'd08',
    name: '부가세 2기 예정신고 부속서류.zip',
    folderId: 'vat',
    size: 9_018_000,
    modifiedBy: '박서연',
    modifiedAt: '2026-11-05 14:20',
    version: 1,
    retainUntil: '2031-12-31',
    retention: '세무 증빙 5년',
    share: 'link',
    sharedWith: ['세무법인 한울(2026-11-30까지)'],
  },
  {
    id: 'd09',
    name: '매출처별 세금계산서 합계표.pdf',
    folderId: 'vat',
    size: 225_300,
    modifiedBy: '박서연',
    modifiedAt: '2026-11-05 14:05',
    version: 2,
    retainUntil: '2031-12-31',
    retention: '세무 증빙 5년',
    share: 'dept',
    sharedWith: ['경영지원팀'],
  },
  {
    id: 'd10',
    name: '대양상사 공급 계약서 2026.pdf',
    folderId: 'contract',
    size: 1_887_400,
    modifiedBy: '강도현',
    modifiedAt: '2026-10-28 16:40',
    version: 2,
    retainUntil: '2036-12-31',
    retention: '계약서 10년',
    share: 'people',
    sharedWith: ['영업팀', '윤지호 대표'],
  },
  {
    id: 'd11',
    name: '한결물산 단가 합의서.pdf',
    folderId: 'contract',
    size: 655_400,
    modifiedBy: '송유나',
    modifiedAt: '2026-10-21 10:00',
    version: 1,
    retainUntil: '2036-12-31',
    retention: '계약서 10년',
    share: 'people',
    sharedWith: ['영업팀'],
  },
  {
    id: 'd12',
    name: '서해통상 휴업 확인 요청 공문.pdf',
    folderId: 'contract',
    size: 215_000,
    modifiedBy: '김테라',
    modifiedAt: '2026-11-04 13:30',
    version: 1,
    retainUntil: '2031-12-31',
    retention: '공문 5년',
    share: 'private',
    sharedWith: [],
  },
  {
    id: 'd13',
    name: '경영 회의록 2026-11-03.docx',
    folderId: 'meeting',
    size: 90_100,
    modifiedBy: '김테라',
    modifiedAt: '2026-11-03 18:10',
    version: 2,
    retainUntil: '2029-12-31',
    retention: '내부 문서 3년',
    share: 'people',
    sharedWith: ['윤지호 대표', '이하은 과장', '강도현 팀장'],
  },
  {
    id: 'd14',
    name: '물류 협의 회의록 2026-10-30.docx',
    folderId: 'meeting',
    size: 65_500,
    modifiedBy: '정우진',
    modifiedAt: '2026-10-30 17:45',
    version: 1,
    retainUntil: '2029-12-31',
    retention: '내부 문서 3년',
    share: 'dept',
    sharedWith: ['경영지원팀', '물류팀'],
  },
  {
    id: 'd15',
    name: '수입 통관 서류 체크리스트.xlsx',
    folderId: 'shared',
    size: 122_900,
    modifiedBy: '이하은',
    modifiedAt: '2026-11-04 09:20',
    version: 3,
    retainUntil: '2031-12-31',
    retention: '무역 서류 5년',
    share: 'people',
    sharedWith: ['구매팀', '김테라 팀장'],
  },
  {
    id: 'd16',
    name: '평택 냉동센터 검수 사진.zip',
    folderId: 'shared',
    size: 25_165_800,
    modifiedBy: '정우진',
    modifiedAt: '2026-11-06 10:10',
    version: 1,
    retainUntil: '2027-12-31',
    retention: '검수 기록 1년',
    share: 'people',
    sharedWith: ['물류팀', '구매팀', '김테라 팀장'],
  },
];

/** 버전 이력: 있으면 그대로, 없으면 버전 수만큼 이틀 간격으로 */
export function versionsOf(f: DocFile): readonly DocVersion[] {
  if (f.versions) return f.versions;
  return Array.from({ length: f.version }, (_, i) => {
    const v = f.version - i;
    return {
      version: v,
      at: i === 0 ? f.modifiedAt : `${shiftDate(f.modifiedAt, -i * 2)} ${f.modifiedAt.slice(11)}`,
      by: f.modifiedBy,
      note: v === 1 ? '최초 등록' : '내용 수정',
    };
  });
}

/* ── 전사 규정 · 양식 ── */

export type RegCategory = 'hr' | 'acct' | 'purchase' | 'security';
export const REG_CATEGORIES: Record<RegCategory, string> = {
  hr: '인사',
  acct: '회계',
  purchase: '구매',
  security: '보안',
};
export type RegKind = '규정' | '지침' | '양식';
export const REG_STATES = {
  active: { label: '시행', tone: 'success' },
  upcoming: { label: '개정 예고', tone: 'warning' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type RegState = keyof typeof REG_STATES;

export interface RegRevision {
  /** 0 = 제정 */
  revision: number;
  date: string;
  summary: string;
  approvedBy: string;
}

export interface Regulation {
  id: string;
  no: string;
  title: string;
  category: RegCategory;
  kind: RegKind;
  /** 지금 시행 중인 차수(개정 예고면 예고된 차수) */
  revision: number;
  effectiveAt: string;
  dept: string;
  owner: string;
  size: number;
  ext: 'pdf' | 'xlsx' | 'docx';
  state: RegState;
  history: readonly RegRevision[];
}

const H = (revision: number, date: string, summary: string, approvedBy = '윤지호 대표') => ({
  revision,
  date,
  summary,
  approvedBy,
});

export const REGULATIONS: readonly Regulation[] = [
  {
    id: 'r01',
    no: 'HR-R-001',
    title: '취업규칙',
    category: 'hr',
    kind: '규정',
    revision: 7,
    effectiveAt: '2026-01-01',
    dept: '경영지원팀',
    owner: '김테라',
    size: 842_000,
    ext: 'pdf',
    state: 'active',
    history: [
      H(7, '2026-01-01', '육아기 근로시간 단축 대상 확대 · 배우자 출산휴가 20일 반영'),
      H(6, '2025-01-01', '연차 사용 촉진 절차 신설'),
      H(5, '2024-03-01', '선택적 근로시간제 도입'),
      H(0, '2019-05-01', '제정'),
    ],
  },
  {
    id: 'r02',
    no: 'HR-R-002',
    title: '급여 규정',
    category: 'hr',
    kind: '규정',
    revision: 5,
    effectiveAt: '2026-03-01',
    dept: '경영지원팀',
    owner: '김테라',
    size: 516_000,
    ext: 'pdf',
    state: 'active',
    history: [
      H(5, '2026-03-01', '2026년 최저임금 반영 · 식대 비과세 한도 조정'),
      H(4, '2025-03-01', '연장근로 수당 산정 기준 명확화'),
      H(0, '2019-05-01', '제정'),
    ],
  },
  {
    id: 'r03',
    no: 'HR-R-003',
    title: '여비 규정',
    category: 'hr',
    kind: '규정',
    revision: 5,
    effectiveAt: '2026-12-01',
    dept: '경영지원팀',
    owner: '박서연',
    size: 388_000,
    ext: 'pdf',
    state: 'upcoming',
    history: [
      H(5, '2026-12-01', '해외 출장 일비 통화별 정액 · 숙박비 상한 조정(예고)'),
      H(4, '2025-07-01', '국내 출장 교통비 실비 정산으로 변경'),
      H(3, '2023-01-01', '법인카드 우선 사용 원칙 추가'),
      H(0, '2019-05-01', '제정'),
    ],
  },
  {
    id: 'r04',
    no: 'HR-F-011',
    title: '휴가 신청서',
    category: 'hr',
    kind: '양식',
    revision: 2,
    effectiveAt: '2025-07-01',
    dept: '경영지원팀',
    owner: '박서연',
    size: 46_000,
    ext: 'docx',
    state: 'active',
    history: [
      H(2, '2025-07-01', '반차 · 반반차 구분 칸 추가', '김테라 팀장'),
      H(0, '2020-01-02', '제정', '김테라 팀장'),
    ],
  },
  {
    id: 'r05',
    no: 'HR-F-012',
    title: '재직증명서 발급 신청서',
    category: 'hr',
    kind: '양식',
    revision: 1,
    effectiveAt: '2024-03-01',
    dept: '경영지원팀',
    owner: '박서연',
    size: 38_000,
    ext: 'docx',
    state: 'active',
    history: [
      H(1, '2024-03-01', '영문 발급 선택 칸 추가', '김테라 팀장'),
      H(0, '2020-01-02', '제정', '김테라 팀장'),
    ],
  },
  {
    id: 'r06',
    no: 'AC-R-001',
    title: '회계 처리 규정',
    category: 'acct',
    kind: '규정',
    revision: 6,
    effectiveAt: '2026-01-01',
    dept: '경영지원팀',
    owner: '김테라',
    size: 1_204_000,
    ext: 'pdf',
    state: 'active',
    history: [
      H(6, '2026-01-01', '외화 환산 기준을 매매기준율로 통일'),
      H(5, '2025-01-01', '재고자산 평가 방법 총평균법 명시'),
      H(4, '2023-07-01', '전자세금계산서 수취 절차 반영'),
      H(0, '2019-05-01', '제정'),
    ],
  },
  {
    id: 'r07',
    no: 'AC-R-002',
    title: '법인카드 사용 지침',
    category: 'acct',
    kind: '지침',
    revision: 3,
    effectiveAt: '2026-05-01',
    dept: '경영지원팀',
    owner: '박서연',
    size: 286_000,
    ext: 'pdf',
    state: 'active',
    history: [
      H(3, '2026-05-01', '접대비 1회 한도 · 증빙 첨부 기한 5일로 변경', '김테라 팀장'),
      H(2, '2024-09-01', '주말 사용 사전 승인 추가', '김테라 팀장'),
      H(0, '2021-03-02', '제정', '김테라 팀장'),
    ],
  },
  {
    id: 'r08',
    no: 'AC-F-021',
    title: '지출결의서',
    category: 'acct',
    kind: '양식',
    revision: 4,
    effectiveAt: '2026-01-01',
    dept: '경영지원팀',
    owner: '박서연',
    size: 52_000,
    ext: 'xlsx',
    state: 'active',
    history: [
      H(4, '2026-01-01', '계정과목 선택 목록 갱신', '김테라 팀장'),
      H(3, '2024-01-02', '결재선 4단계로 확장', '김테라 팀장'),
      H(0, '2019-05-01', '제정', '김테라 팀장'),
    ],
  },
  {
    id: 'r09',
    no: 'AC-F-022',
    title: '가지급금 정산서',
    category: 'acct',
    kind: '양식',
    revision: 2,
    effectiveAt: '2025-04-01',
    dept: '경영지원팀',
    owner: '박서연',
    size: 41_000,
    ext: 'xlsx',
    state: 'active',
    history: [
      H(2, '2025-04-01', '외화 정산 환율 칸 추가', '김테라 팀장'),
      H(0, '2021-03-02', '제정', '김테라 팀장'),
    ],
  },
  {
    id: 'r10',
    no: 'PU-R-001',
    title: '구매 관리 규정',
    category: 'purchase',
    kind: '규정',
    revision: 4,
    effectiveAt: '2026-02-01',
    dept: '구매팀',
    owner: '이하은',
    size: 674_000,
    ext: 'pdf',
    state: 'active',
    history: [
      H(4, '2026-02-01', '발주 금액별 결재 기준 상향(5천만 원)'),
      H(3, '2024-08-01', '복수 견적 의무 대상 확대'),
      H(0, '2019-05-01', '제정'),
    ],
  },
  {
    id: 'r11',
    no: 'PU-R-002',
    title: '수입 통관 업무 지침',
    category: 'purchase',
    kind: '지침',
    revision: 3,
    effectiveAt: '2026-08-01',
    dept: '구매팀',
    owner: '이하은',
    size: 455_000,
    ext: 'pdf',
    state: 'active',
    history: [
      H(3, '2026-08-01', '냉동 수산물 검역 서류 목록 갱신', '김테라 팀장'),
      H(2, '2025-02-03', '관세사 위임 범위 명시', '김테라 팀장'),
      H(0, '2022-06-01', '제정', '김테라 팀장'),
    ],
  },
  {
    id: 'r12',
    no: 'PU-F-031',
    title: '구매 요청서',
    category: 'purchase',
    kind: '양식',
    revision: 3,
    effectiveAt: '2026-02-01',
    dept: '구매팀',
    owner: '서민재',
    size: 48_000,
    ext: 'xlsx',
    state: 'active',
    history: [
      H(3, '2026-02-01', '납기 · 입고 창고 칸 추가', '이하은 과장'),
      H(0, '2020-04-01', '제정', '이하은 과장'),
    ],
  },
  {
    id: 'r13',
    no: 'PU-F-032',
    title: '거래처 등록 신청서',
    category: 'purchase',
    kind: '양식',
    revision: 2,
    effectiveAt: '2025-09-01',
    dept: '구매팀',
    owner: '서민재',
    size: 44_000,
    ext: 'docx',
    state: 'active',
    history: [
      H(2, '2025-09-01', '사업자 상태 조회 결과 첨부 항목 추가', '이하은 과장'),
      H(0, '2020-04-01', '제정', '이하은 과장'),
    ],
  },
  {
    id: 'r14',
    no: 'SE-R-001',
    title: '정보보안 규정',
    category: 'security',
    kind: '규정',
    revision: 4,
    effectiveAt: '2026-12-01',
    dept: '경영지원팀',
    owner: '김테라',
    size: 598_000,
    ext: 'pdf',
    state: 'upcoming',
    history: [
      H(4, '2026-12-01', '2단계 인증 전 직원 의무화 · 외부 공유 링크 만료 30일 이내(예고)'),
      H(3, '2025-06-02', '개인 기기 업무 사용 기준 신설'),
      H(0, '2020-09-01', '제정'),
    ],
  },
  {
    id: 'r15',
    no: 'SE-R-002',
    title: '개인정보 처리 방침',
    category: 'security',
    kind: '규정',
    revision: 5,
    effectiveAt: '2026-04-15',
    dept: '경영지원팀',
    owner: '김테라',
    size: 412_000,
    ext: 'pdf',
    state: 'active',
    history: [
      H(5, '2026-04-15', '고객 연락처 보유 기간 3년으로 단축'),
      H(4, '2025-04-01', '처리 위탁 업체 목록 갱신'),
      H(0, '2020-09-01', '제정'),
    ],
  },
  {
    id: 'r16',
    no: 'SE-F-041',
    title: '보안 서약서',
    category: 'security',
    kind: '양식',
    revision: 2,
    effectiveAt: '2025-01-02',
    dept: '경영지원팀',
    owner: '박서연',
    size: 36_000,
    ext: 'docx',
    state: 'active',
    history: [
      H(2, '2025-01-02', '퇴사 시 자료 반납 조항 추가', '김테라 팀장'),
      H(0, '2020-09-01', '제정', '김테라 팀장'),
    ],
  },
];

/** 제7차 · 제정 */
export const revisionLabel = (n: number) => (n === 0 ? '제정' : `제${n}차`);

/* ── 부서 공유 문서 ── */

/** 부서 문서함. 회사마다 다르다 */
export const DEPTS: readonly string[] = ['경영지원팀', '구매팀', '물류팀', '영업팀'];
export type Dept = string;

export type DocPermission = 'view' | 'edit' | 'manage';
export const PERMISSION_LABELS: Record<DocPermission, string> = {
  view: '보기',
  edit: '편집',
  manage: '관리',
};

export interface DeptFile {
  id: string;
  dept: Dept;
  name: string;
  size: number;
  modifiedBy: string;
  modifiedAt: string;
}

const df = (
  id: string,
  dept: Dept,
  name: string,
  size: number,
  modifiedBy: string,
  modifiedAt: string,
): DeptFile => ({ id, dept, name, size, modifiedBy, modifiedAt });

export const DEPT_FILES: readonly DeptFile[] = [
  df('m01', '경영지원팀', '2026 사업계획 수정본.xlsx', 1_482_000, '김테라', '2026-11-05 18:20'),
  df('m02', '경영지원팀', '11월 자금 계획.xlsx', 264_000, '박서연', '2026-11-04 16:10'),
  df(
    'm03',
    '경영지원팀',
    '부가세 2기 예정신고 부속서류.zip',
    9_018_000,
    '박서연',
    '2026-11-05 14:20',
  ),
  df('m04', '경영지원팀', '법인카드 사용 지침 안내.pdf', 286_000, '박서연', '2026-10-30 09:40'),
  df('m05', '경영지원팀', '2026년 10월 결산 보고서.pdf', 2_516_600, '김테라', '2026-11-05 17:20'),
  df('m06', '경영지원팀', '연말정산 준비 자료.pdf', 1_046_000, '박서연', '2026-10-27 11:05'),
  df('m11', '구매팀', '2026 하반기 수입 계획.xlsx', 742_000, '이하은', '2026-11-03 14:30'),
  df('m12', '구매팀', 'Pacific Seafoods 단가표 2026Q4.xlsx', 188_000, '서민재', '2026-10-29 10:15'),
  df('m13', '구매팀', '수입 통관 서류 체크리스트.xlsx', 122_900, '이하은', '2026-11-04 09:20'),
  df('m14', '구매팀', '미래패키징 포장재 규격서.pdf', 1_310_000, '서민재', '2026-10-22 15:50'),
  df('m15', '구매팀', '발주 승인 기준표.pdf', 204_000, '이하은', '2026-10-15 09:00'),
  df('m21', '물류팀', '창고별 로케이션 배치도.pdf', 3_420_000, '오태식', '2026-10-31 17:00'),
  df('m22', '물류팀', '평택 냉동센터 검수 사진.zip', 25_165_800, '정우진', '2026-11-06 10:10'),
  df('m23', '물류팀', '11월 배차 일정.xlsx', 156_000, '정우진', '2026-11-05 08:30'),
  df('m24', '물류팀', '입고 검수 기준서.pdf', 512_000, '오태식', '2026-10-20 13:40'),
  df('m25', '물류팀', '냉동 컨테이너 온도 기록.xlsx', 408_000, '정우진', '2026-11-06 07:50'),
  df('m31', '영업팀', '2026 거래처별 매출 목표.xlsx', 228_000, '강도현', '2026-11-02 09:30'),
  df('m32', '영업팀', '대양상사 공급 계약서 2026.pdf', 1_887_400, '강도현', '2026-10-28 16:40'),
  df('m33', '영업팀', '11월 판촉 단가표.xlsx', 96_000, '송유나', '2026-11-01 10:20'),
  df('m34', '영업팀', '견적서 양식 2026.xlsx', 58_000, '송유나', '2026-10-12 14:00'),
  df('m35', '영업팀', '누리식품 클레임 대응 보고서.pdf', 642_000, '최민준', '2026-11-06 11:40'),
];

export interface DeptMember {
  dept: Dept;
  name: string;
  title: string;
  /** 소속(외부 감사처럼 부서 밖이면 그 이름) */
  org: string;
  permission: DocPermission;
  download: boolean;
}

const mb = (
  dept: Dept,
  name: string,
  title: string,
  org: string,
  permission: DocPermission,
  download = true,
): DeptMember => ({ dept, name, title, org, permission, download });

export const DEPT_MEMBERS: readonly DeptMember[] = [
  mb('경영지원팀', '김테라', '팀장', '경영지원팀', 'manage'),
  mb('경영지원팀', '박서연', '대리', '경영지원팀', 'edit'),
  mb('경영지원팀', '윤지호', '대표', '경영', 'view'),
  mb('경영지원팀', '한소희', '회계사', '외부 감사', 'view', false),
  mb('구매팀', '이하은', '과장', '구매팀', 'manage'),
  mb('구매팀', '서민재', '주임', '구매팀', 'edit'),
  mb('구매팀', '김테라', '팀장', '경영지원팀', 'view'),
  mb('물류팀', '오태식', '과장', '물류팀', 'manage'),
  mb('물류팀', '정우진', '주임', '물류팀', 'edit'),
  mb('물류팀', '이하은', '과장', '구매팀', 'view'),
  mb('영업팀', '강도현', '팀장', '영업팀', 'manage'),
  mb('영업팀', '송유나', '대리', '영업팀', 'edit'),
  mb('영업팀', '최민준', '사원', '영업팀', 'edit'),
  mb('영업팀', '문채원', '주임', '영업팀', 'view'),
];

export interface ShareLink {
  id: string;
  dept: Dept;
  fileName: string;
  recipient: string;
  org: string;
  expiresAt: string;
  enabled: boolean;
  downloads: number;
}

export const SHARE_LINKS: readonly ShareLink[] = [
  {
    id: 'k01',
    dept: '경영지원팀',
    fileName: '부가세 2기 예정신고 부속서류.zip',
    recipient: '이정민 세무사',
    org: '세무법인 한울',
    expiresAt: '2026-11-30',
    enabled: true,
    downloads: 3,
  },
  {
    id: 'k02',
    dept: '경영지원팀',
    fileName: '2026년 10월 결산 보고서.pdf',
    recipient: '한소희 회계사',
    org: '외부 감사',
    expiresAt: '2026-11-08',
    enabled: true,
    downloads: 1,
  },
  {
    id: 'k03',
    dept: '경영지원팀',
    fileName: '연말정산 준비 자료.pdf',
    recipient: '이정민 세무사',
    org: '세무법인 한울',
    expiresAt: '2026-10-31',
    enabled: false,
    downloads: 2,
  },
  {
    id: 'k11',
    dept: '구매팀',
    fileName: 'Pacific Seafoods 단가표 2026Q4.xlsx',
    recipient: 'Emily Carter',
    org: 'Pacific Seafoods Co.',
    expiresAt: '2026-11-01',
    enabled: false,
    downloads: 4,
  },
  {
    id: 'k12',
    dept: '구매팀',
    fileName: '미래패키징 포장재 규격서.pdf',
    recipient: '조윤서 과장',
    org: '미래패키징',
    expiresAt: '2026-11-20',
    enabled: true,
    downloads: 2,
  },
  {
    id: 'k21',
    dept: '물류팀',
    fileName: '평택 냉동센터 검수 사진.zip',
    recipient: '백승현 대리',
    org: '동방로지스',
    expiresAt: '2026-11-13',
    enabled: true,
    downloads: 0,
  },
  {
    id: 'k31',
    dept: '영업팀',
    fileName: '11월 판촉 단가표.xlsx',
    recipient: '오세훈 과장',
    org: '대양상사',
    expiresAt: '2026-11-20',
    enabled: true,
    downloads: 5,
  },
  {
    id: 'k32',
    dept: '영업팀',
    fileName: '누리식품 클레임 대응 보고서.pdf',
    recipient: '한지민 팀장',
    org: '누리식품',
    expiresAt: '2026-11-10',
    enabled: true,
    downloads: 1,
  },
];

/* ── 문서 작성 ── */

const seohae = partyById('p04');
const seohaeAr = RECEIVABLES.find((r) => r.partyId === 'p04')!;

export const DRAFT_DOC = {
  no: 'DOC-2611-0023',
  form: '품의서',
  /** 기안자 · 결재선(기안자 다음 차례) · 참조 */
  drafter: { name: '김테라', title: '팀장', team: '경영지원팀' },
  approvers: [
    { name: '강도현', title: '팀장', role: '합의' as const },
    { name: '윤지호', title: '대표', role: '승인' as const },
  ],
  cc: ['박서연 대리'],
  /** 편집 도구가 넣는 예시(표 · 이미지 · 첨부) */
  samples: {
    table: `[표 1] ${seohae.name} 미수금 현황 · 3열 4행`,
    image: { name: `${seohae.name} 사업장 사진.jpg`, size: 1_640_000 },
    file: { name: `${seohae.name} 미수금 회수 계획.xlsx`, size: 72_300 },
  },
  title: '서해통상 거래 조건 변경 품의',
  body: [
    '1. 목적',
    `${seohae.name}(${seohae.code})이 11월 4일 국세청 사업자 상태 조회에서 휴업으로 확인되어 거래 조건 변경을 품의합니다.`,
    '',
    '2. 현황',
    `- 미수금 ${formatAmount(seohaeAr.balance, { unit: '원' })}(기한 ${seohaeAr.dueDate})`,
    `- 여신 한도 ${formatAmount(seohae.creditLimit ?? 0, { unit: '원' })}`,
    `- 결제 조건 ${seohae.terms}`,
    '',
    '3. 조치안',
    '- 신규 출고는 선입금 조건으로 바꿉니다.',
    '- 미수금은 11월 20일까지 회수 계획을 받습니다.',
    `- 여신 한도를 ${formatAmount(30_000_000, { unit: '원' })}으로 낮춥니다.`,
    '',
    '4. 붙임',
    '- 서해통상 휴업 확인 요청 공문 1부',
    '- 거래처 원장(10월) 1부',
  ].join('\n'),
  versions: [
    { id: 'v4', title: '자동 저장', time: `${TODAY} 14:20`, actor: '김테라 팀장' },
    { id: 'v3', title: '조치안 수정', time: `${TODAY} 13:05`, actor: '박서연 대리' },
    { id: 'v2', title: '현황 숫자 갱신', time: `${TODAY} 11:40`, actor: '김테라 팀장' },
    { id: 'v1', title: '작성', time: '2026-11-05 17:50', actor: '김테라 팀장' },
  ],
  collaborators: [
    { name: '김테라', title: '팀장', role: '작성자', status: 'online' as const },
    { name: '박서연', title: '대리', role: '편집', status: 'online' as const },
    { name: '최민준', title: '사원', role: '보기', status: 'away' as const },
  ],
  attachments: [
    { name: '서해통상 휴업 확인 요청 공문.pdf', size: 215_000 },
    { name: '거래처 원장 서해통상 2026-10.xlsx', size: 88_400 },
  ],
};

/* ══ CRM ═══════════════════════════════════════════════════ */

export type Grade = 'VIP' | 'A' | 'B' | 'prospect';
export const GRADES: Record<Grade, { label: string; tone: StatusTone }> = {
  VIP: { label: 'VIP', tone: 'info' },
  A: { label: 'A', tone: 'success' },
  B: { label: 'B', tone: 'neutral' },
  prospect: { label: '미정', tone: 'neutral' },
};

export type CustomerState = 'active' | 'caution' | 'prospect';
export const CUSTOMER_STATES: Record<CustomerState, { label: string; tone: StatusTone }> = {
  active: { label: '거래 중', tone: 'success' },
  caution: { label: '거래 주의', tone: 'warning' },
  prospect: { label: '잠재', tone: 'neutral' },
};

export interface Contact {
  name: string;
  title: string;
  role: string;
  phone: string;
  email: string;
  primary?: boolean;
}

export type ActivityKind =
  '방문' | '통화' | '메일' | '견적' | '수주' | '세금계산서' | '클레임' | '입금';
export const ACTIVITY_META: Record<
  ActivityKind,
  {
    icon:
      | 'map-pin'
      | 'phone'
      | 'mail'
      | 'receipt'
      | 'circle-check'
      | 'file-text'
      | 'circle-alert'
      | 'banknote';
    tone: StatusTone;
  }
> = {
  방문: { icon: 'map-pin', tone: 'neutral' },
  통화: { icon: 'phone', tone: 'neutral' },
  메일: { icon: 'mail', tone: 'neutral' },
  견적: { icon: 'receipt', tone: 'info' },
  수주: { icon: 'circle-check', tone: 'success' },
  세금계산서: { icon: 'file-text', tone: 'info' },
  클레임: { icon: 'circle-alert', tone: 'danger' },
  입금: { icon: 'banknote', tone: 'success' },
};

export interface Activity {
  id: string;
  at: string;
  kind: ActivityKind;
  title: string;
  by: string;
  description?: string;
}

export interface Customer {
  id: string;
  partyId?: string;
  code: string;
  name: string;
  bizNo: string;
  grade: Grade;
  state: CustomerState;
  owner: string;
  industry: string;
  region: string;
  terms: string;
  creditLimit: number;
  lastDealAt?: string;
  /** 2025-12 ~ 2026-11 월 매출(공급가액, 원). 11월은 발행한 세금계산서 합 */
  monthly: readonly number[];
  receivable: number;
  receivableDue?: string;
  contacts: readonly Contact[];
  activities: readonly Activity[];
  note?: string;
}

export const MONTH_LABELS = [
  '12월',
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
];

/** 11월 매출 = 그 거래처에 발행 · 전송한 매출 세금계산서 공급가액 합(작성 중 · 취소 제외) */
const novSales = (partyId: string) =>
  INVOICES.filter(
    (i) =>
      i.kind === 'sales' && i.partyId === partyId && i.state !== 'draft' && i.state !== 'cancelled',
  ).reduce((a, i) => a + invoiceSupply(i), 0);

const series = (partyId: string, manwon: readonly number[]) => [
  ...manwon.map((v) => v * 10_000),
  novSales(partyId),
];

const fromParty = (p: Party): Contact => {
  const [name = p.manager, title = ''] = p.manager.split(' ');
  return { name, title, role: '구매 담당', phone: p.phone, email: p.email, primary: true };
};

const ar = (partyId: string) => RECEIVABLES.find((r) => r.partyId === partyId);

const tradeCustomer = (
  partyId: string,
  rest: Omit<
    Customer,
    | 'id'
    | 'partyId'
    | 'code'
    | 'name'
    | 'bizNo'
    | 'terms'
    | 'creditLimit'
    | 'receivable'
    | 'receivableDue'
    | 'contacts'
    | 'monthly'
  > & { monthly: readonly number[]; contacts: readonly Contact[] },
): Customer => {
  const p = partyById(partyId);
  return {
    ...rest,
    id: p.id,
    partyId: p.id,
    code: p.code,
    name: p.name,
    bizNo: p.bizNo ?? '',
    terms: p.terms,
    creditLimit: p.creditLimit ?? 0,
    receivable: ar(partyId)?.balance ?? 0,
    ...(ar(partyId) ? { receivableDue: ar(partyId)!.dueDate } : {}),
    monthly: series(partyId, rest.monthly),
    contacts: [fromParty(p), ...rest.contacts],
  };
};

export const CUSTOMERS: readonly Customer[] = [
  tradeCustomer('p01', {
    grade: 'VIP',
    state: 'active',
    owner: '강도현',
    industry: '식자재 도매',
    region: '서울 송파구',
    lastDealAt: '2026-11-06',
    monthly: [8420, 7960, 8810, 9240, 9870, 9530, 10120, 10860, 10240, 11050, 11480],
    contacts: [
      {
        name: '노은비',
        title: '대리',
        role: '정산 담당',
        phone: '02-3456-1215',
        email: 'account@daeyang.example',
      },
    ],
    activities: [
      {
        id: 'a1',
        at: '2026-11-06 10:12',
        kind: '세금계산서',
        title: 'TI-2611-0118 발행 대기',
        by: '박서연 대리',
      },
      {
        id: 'a2',
        at: '2026-11-05 15:10',
        kind: '견적',
        title: '12월 추가 물량 견적 Q-2611-0007 작성',
        by: '강도현 팀장',
      },
      {
        id: 'a3',
        at: '2026-11-03 10:30',
        kind: '방문',
        title: '2027 연간 공급 계약 갱신 협의',
        by: '강도현 팀장',
        description: '물량 8% 증량 · 단가 동결 요청',
      },
      {
        id: 'a4',
        at: '2026-10-31 11:20',
        kind: '입금',
        title: '9월분 대금 입금',
        by: '박서연 대리',
      },
    ],
  }),
  tradeCustomer('p02', {
    grade: 'A',
    state: 'active',
    owner: '송유나',
    industry: '외식 체인 납품',
    region: '경기 용인시',
    lastDealAt: '2026-11-06',
    monthly: [5120, 4880, 5340, 5610, 5290, 5870, 6020, 6340, 5980, 6410, 6650],
    contacts: [
      {
        name: '권태오',
        title: '과장',
        role: '품질 담당',
        phone: '031-778-4432',
        email: 'qa@hangyeol.example',
      },
    ],
    activities: [
      {
        id: 'b1',
        at: '2026-11-06 10:05',
        kind: '클레임',
        title: '발사믹 식초 병 파손 3병 반품 요청',
        by: '문채원 주임',
      },
      {
        id: 'b2',
        at: '2026-11-04 14:00',
        kind: '수주',
        title: '11월 올리브오일 · 발사믹 수주',
        by: '송유나 대리',
      },
      {
        id: 'b3',
        at: '2026-10-29 09:40',
        kind: '통화',
        title: '2027 상반기 올리브오일 단가 문의',
        by: '송유나 대리',
      },
    ],
  }),
  tradeCustomer('p03', {
    grade: 'A',
    state: 'active',
    owner: '최민준',
    industry: '수산 가공 · 급식',
    region: '부산 사하구',
    lastDealAt: '2026-11-05',
    monthly: [3640, 3410, 3880, 4020, 3760, 4150, 4380, 4210, 4560, 4490, 4720],
    contacts: [
      {
        name: '배수현',
        title: '주임',
        role: '입고 담당',
        phone: '051-602-3318',
        email: 'wh@nuri.example',
      },
    ],
    activities: [
      {
        id: 'c1',
        at: '2026-11-06 09:10',
        kind: '클레임',
        title: '가리비 관자 해동 흔적 · 2박스 반품 요청',
        by: '문채원 주임',
      },
      {
        id: 'c2',
        at: '2026-11-05 18:04',
        kind: '세금계산서',
        title: 'TI-2611-0116 국세청 전송 실패',
        by: '박서연 대리',
        description: '공급받는 자 사업자 상태 확인 필요',
      },
      {
        id: 'c3',
        at: '2026-11-02 13:30',
        kind: '메일',
        title: '포장재 연간 단가 제안서 발송',
        by: '최민준 사원',
      },
    ],
  }),
  tradeCustomer('p04', {
    grade: 'B',
    state: 'caution',
    owner: '최민준',
    industry: '수입 식품 유통',
    region: '인천 중구',
    lastDealAt: '2026-11-04',
    monthly: [1980, 1840, 1760, 1690, 1620, 1580, 1470, 1390, 1310, 1220, 1080],
    contacts: [],
    note: '11월 4일 사업자 상태 조회에서 휴업으로 확인되었습니다. 신규 출고는 선입금 조건입니다',
    activities: [
      {
        id: 'e1',
        at: '2026-11-05 11:00',
        kind: '통화',
        title: '미수금 회수 일정 요청',
        by: '최민준 사원',
        description: '11월 20일까지 회수 계획 회신 약속',
      },
      {
        id: 'e2',
        at: '2026-11-04 18:03',
        kind: '세금계산서',
        title: 'TI-2611-0114 국세청 전송',
        by: '박서연 대리',
      },
      {
        id: 'e3',
        at: '2026-10-30 16:20',
        kind: '클레임',
        title: '포장재 일괄 공급 건 실주',
        by: '최민준 사원',
        description: '거래처 휴업 준비로 보류',
      },
    ],
  }),
  {
    id: 'q01',
    code: 'P-0012',
    name: '바른푸드시스템',
    bizNo: '1298731450',
    grade: 'prospect',
    state: 'prospect',
    owner: '강도현',
    industry: '단체급식',
    region: '경기 성남시',
    terms: '협의 중',
    creditLimit: 0,
    monthly: Array.from({ length: 12 }, () => 0),
    receivable: 0,
    contacts: [
      {
        name: '유상철',
        title: '부장',
        role: '구매 총괄',
        phone: '031-8017-2200',
        email: 'purchase@barunfood.example',
        primary: true,
      },
    ],
    activities: [
      {
        id: 'f1',
        at: '2026-11-04 14:00',
        kind: '방문',
        title: '급식 센터 냉동 창고 실사',
        by: '강도현 팀장',
      },
      {
        id: 'f2',
        at: '2026-10-29 10:00',
        kind: '메일',
        title: '냉동 수산물 연간 공급 제안서 발송',
        by: '강도현 팀장',
      },
    ],
  },
  {
    id: 'q02',
    code: 'P-0013',
    name: '오름케이터링',
    bizNo: '2068814527',
    grade: 'prospect',
    state: 'prospect',
    owner: '송유나',
    industry: '케이터링',
    region: '서울 성동구',
    terms: '협의 중',
    creditLimit: 0,
    monthly: Array.from({ length: 12 }, () => 0),
    receivable: 0,
    contacts: [
      {
        name: '지예린',
        title: '실장',
        role: '메뉴 기획',
        phone: '02-462-7781',
        email: 'chef@oreum.example',
        primary: true,
      },
    ],
    activities: [
      {
        id: 'g1',
        at: '2026-11-05 16:30',
        kind: '통화',
        title: '연말 케이터링 수산물 패키지 문의',
        by: '송유나 대리',
      },
      {
        id: 'g2',
        at: '2026-10-25 09:00',
        kind: '클레임',
        title: '10월 행사 수산물 실주',
        by: '송유나 대리',
        description: '단가 차이',
      },
    ],
  },
  {
    id: 'q03',
    code: 'P-0014',
    name: '청담다이닝그룹',
    bizNo: '2118690342',
    grade: 'prospect',
    state: 'prospect',
    owner: '최민준',
    industry: '외식 프랜차이즈',
    region: '서울 강남구',
    terms: '협의 중',
    creditLimit: 0,
    monthly: Array.from({ length: 12 }, () => 0),
    receivable: 0,
    contacts: [
      {
        name: '남궁현',
        title: '팀장',
        role: '식자재 구매',
        phone: '02-541-0900',
        email: 'sourcing@cheongdam.example',
        primary: true,
      },
    ],
    activities: [
      {
        id: 'h1',
        at: '2026-11-02 11:00',
        kind: '메일',
        title: '가리비 관자 샘플 발송 안내',
        by: '최민준 사원',
      },
    ],
  },
  {
    id: 'q04',
    code: 'P-0015',
    name: '해밀호텔앤리조트',
    bizNo: '2268105573',
    grade: 'prospect',
    state: 'prospect',
    owner: '송유나',
    industry: '호텔 · 연회',
    region: '강원 강릉시',
    terms: '협의 중',
    creditLimit: 0,
    monthly: Array.from({ length: 12 }, () => 0),
    receivable: 0,
    contacts: [
      {
        name: '함지우',
        title: '과장',
        role: '연회 구매',
        phone: '033-640-1188',
        email: 'banquet@haemil.example',
        primary: true,
      },
    ],
    activities: [
      {
        id: 'j1',
        at: '2026-11-03 15:00',
        kind: '통화',
        title: '연회용 올리브오일 · 발사믹 견적 요청',
        by: '송유나 대리',
      },
    ],
  },
];

export const customerByCode = (code: string) => CUSTOMERS.find((c) => c.code === code);
/** 2026년 누적 매출(1~11월) */
export const ytdOf = (c: Customer) => c.monthly.slice(1).reduce((a, v) => a + v, 0);

/* ── 견적 ── */

export interface QuoteLine {
  key: number;
  itemId: string | null;
  qty: number | null;
  price: number | null;
  /** 할인율(%) */
  discount: number | null;
}

export const lineSupply = (l: QuoteLine) =>
  Math.round((l.qty ?? 0) * (l.price ?? 0) * (1 - (l.discount ?? 0) / 100));

const QL = (key: number, itemId: string, qty: number, discount: number): QuoteLine => ({
  key,
  itemId,
  qty,
  price: itemById(itemId).price,
  discount,
});

export const QUOTE = {
  no: 'Q-2611-0007',
  /** 영업 담당(STAFF 이름) */
  owner: '강도현',
  customerCode: 'C1001',
  opportunityId: 'OP-2611-018',
  date: '2026-11-05',
  validUntil: '2026-11-19',
  lines: [QL(1, 'i01', 600, 3), QL(2, 'i04', 800, 3), QL(3, 'i07', 300, 0), QL(4, 'i09', 4_000, 0)],
  terms: [
    '납품: 평택 냉동센터 출고 후 2일 안에 지정 창고 도착',
    '운송: 냉동 탑차 · 운임 포함',
    '결제: 월말 정산 30일',
    '유효 기간이 지나면 환율 변동분을 반영해 다시 견적합니다',
  ].join('\n'),
};

export const QUOTE_SUPPLY = QUOTE.lines.reduce((a, l) => a + lineSupply(l), 0);

export const QUOTE_HISTORY = [
  { no: 'Q-2610-0031', date: '2026-10-14', supply: 48_215_000, state: '수주' },
  { no: 'Q-2609-0022', date: '2026-09-09', supply: 41_870_000, state: '수주' },
  { no: 'Q-2608-0017', date: '2026-08-12', supply: 12_640_000, state: '실주' },
] as const;

/* ── 영업기회 ── */

export const OPP_STAGES = {
  discover: { label: '발굴', tone: 'neutral' },
  propose: { label: '제안', tone: 'info' },
  quote: { label: '견적', tone: 'info' },
  negotiate: { label: '협상', tone: 'warning' },
  won: { label: '수주', tone: 'success' },
  lost: { label: '실주', tone: 'danger' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type OppStage = keyof typeof OPP_STAGES;
export const OPP_STAGE_ORDER: readonly OppStage[] = [
  'discover',
  'propose',
  'quote',
  'negotiate',
  'won',
  'lost',
];
/** 단계별 기본 확률(%) */
export const STAGE_PROBABILITY: Record<OppStage, number> = {
  discover: 10,
  propose: 30,
  quote: 50,
  negotiate: 70,
  won: 100,
  lost: 0,
};

export interface Opportunity {
  id: string;
  customer: string;
  customerCode: string;
  title: string;
  amount: number;
  closeDate: string;
  owner: string;
  probability: number;
  stage: OppStage;
  /** 관련 문서(견적 · 세금계산서) */
  doc?: string;
  lostReason?: string;
  /** 실주한 건이 마지막으로 있던 단계(단계 전환 깔때기에서 어디까지 갔는지) */
  lostAt?: OppStage;
  next?: string;
}

const won = (id: string, invoiceId: string, closeDate: string, owner: string, title: string) => {
  const inv = INVOICES.find((i) => i.id === invoiceId)!;
  const p = partyById(inv.partyId);
  return {
    id,
    customer: p.name,
    customerCode: p.code,
    title,
    amount: invoiceSupply(inv),
    closeDate,
    owner,
    probability: 100,
    stage: 'won' as const,
    doc: invoiceId,
  };
};

export const OPPORTUNITIES: readonly Opportunity[] = [
  {
    id: 'OP-2611-025',
    customer: '바른푸드시스템',
    customerCode: 'P-0012',
    title: '단체급식 냉동 수산물 연간 공급',
    amount: 180_000_000,
    closeDate: '2026-12-22',
    owner: '강도현',
    probability: 10,
    stage: 'discover',
    next: '11월 12일 품목별 소요량 자료 받기',
  },
  {
    id: 'OP-2611-026',
    customer: '해밀호텔앤리조트',
    customerCode: 'P-0015',
    title: '연회용 올리브오일 · 발사믹 정기 납품',
    amount: 24_000_000,
    closeDate: '2026-12-10',
    owner: '송유나',
    probability: 10,
    stage: 'discover',
    next: '견적 요청 품목 확정',
  },
  {
    id: 'OP-2611-027',
    customer: '청담다이닝그룹',
    customerCode: 'P-0014',
    title: '가리비 관자 정기 납품',
    amount: 36_000_000,
    closeDate: '2027-01-15',
    owner: '최민준',
    probability: 10,
    stage: 'discover',
    next: '샘플 시식 결과 회신 대기',
  },
  {
    id: 'OP-2611-021',
    customer: '오름케이터링',
    customerCode: 'P-0013',
    title: '연말 케이터링 수산물 패키지',
    amount: 42_000_000,
    closeDate: '2026-11-27',
    owner: '송유나',
    probability: 30,
    stage: 'propose',
    next: '11월 10일 제안 발표',
  },
  {
    id: 'OP-2611-022',
    customer: '누리식품',
    customerCode: 'C1003',
    title: '포장재 연간 단가 계약',
    amount: 28_500_000,
    closeDate: '2026-12-04',
    owner: '최민준',
    probability: 30,
    stage: 'propose',
    next: '아이스박스 · 보냉팩 물량 확인',
  },
  {
    id: 'OP-2611-018',
    customer: '대양상사',
    customerCode: 'C1001',
    title: '12월 냉동 새우 · 연어 추가 물량',
    amount: QUOTE_SUPPLY,
    closeDate: '2026-11-19',
    owner: '강도현',
    probability: 50,
    stage: 'quote',
    doc: QUOTE.no,
    next: '견적서 발송 뒤 회신 받기',
  },
  {
    id: 'OP-2611-019',
    customer: '한결물산',
    customerCode: 'C1002',
    title: '2027 상반기 올리브오일 단가',
    amount: 51_800_000,
    closeDate: '2026-11-25',
    owner: '송유나',
    probability: 50,
    stage: 'quote',
    doc: 'Q-2611-0005',
    next: 'EUR 환율 기준일 합의',
  },
  {
    id: 'OP-2611-020',
    customer: '바른푸드시스템',
    customerCode: 'P-0012',
    title: '시범 납품 냉동 연어 필렛',
    amount: 9_300_000,
    closeDate: '2026-11-13',
    owner: '강도현',
    probability: 40,
    stage: 'quote',
    doc: 'Q-2611-0006',
    next: '시범 납품 일정 확정',
  },
  {
    id: 'OP-2610-015',
    customer: '대양상사',
    customerCode: 'C1001',
    title: '2027 연간 공급 계약 갱신',
    amount: 420_000_000,
    closeDate: '2026-12-15',
    owner: '강도현',
    probability: 70,
    stage: 'negotiate',
    next: '물량 8% 증량 · 단가 동결 조건 회신',
  },
  {
    id: 'OP-2610-016',
    customer: '누리식품',
    customerCode: 'C1003',
    title: '가리비 관자 단가 재협상',
    amount: 31_200_000,
    closeDate: '2026-11-10',
    owner: '최민준',
    probability: 60,
    stage: 'negotiate',
    next: '클레임 처리 뒤 단가 확정',
  },
  won('OP-2610-013', 'TI-2611-0118', '2026-11-03', '강도현', '11월 냉동 새우 · 연어'),
  won('OP-2610-012', 'TI-2611-0117', '2026-11-04', '송유나', '11월 올리브오일 · 발사믹'),
  won('OP-2610-014', 'TI-2611-0116', '2026-11-02', '최민준', '11월 관자 · 아이스박스'),
  {
    id: 'OP-2610-010',
    customer: '서해통상',
    customerCode: 'C1004',
    title: '포장재 일괄 공급',
    amount: 15_600_000,
    closeDate: '2026-10-30',
    owner: '최민준',
    probability: 0,
    stage: 'lost',
    lostReason: '거래처 휴업',
    lostAt: 'propose',
  },
  {
    id: 'OP-2610-011',
    customer: '오름케이터링',
    customerCode: 'P-0013',
    title: '10월 행사 수산물',
    amount: 8_900_000,
    closeDate: '2026-10-25',
    owner: '송유나',
    probability: 0,
    stage: 'lost',
    lostReason: '단가 차이',
    lostAt: 'quote',
  },
];

/**
 * 단계 전환: 각 단계에 한 번이라도 도달한 영업기회 수 · 금액(발굴 → 수주).
 * 수주는 모든 단계를 지난 것으로, 실주는 lostAt 단계까지 간 것으로 센다
 */
export function oppFunnel(opps: readonly Opportunity[]) {
  const flow: readonly OppStage[] = ['discover', 'propose', 'quote', 'negotiate', 'won'];
  const reach = (o: Opportunity) =>
    o.stage === 'lost' ? flow.indexOf(o.lostAt ?? 'discover') : flow.indexOf(o.stage);
  return flow.map((stage, i) => {
    const reached = opps.filter((o) => reach(o) >= i);
    return {
      stage,
      label: OPP_STAGES[stage].label,
      count: reached.length,
      amount: reached.reduce((a, o) => a + o.amount, 0),
    };
  });
}

/** 10월 1~6일 수주 합(전월 동기 비교) */
export const OCT_WON = 21_300_000;

/* ── 상담 ── */

export type TicketType = 'claim' | 'inquiry' | 'return';
export const TICKET_TYPES: Record<TicketType, string> = {
  claim: '품질 불만',
  inquiry: '문의',
  return: '반품',
};
/** 상담 접수 경로 */
export const TICKET_CHANNELS: readonly string[] = ['전화', '메일', '방문', '채팅'];
export type TicketPriority = 'high' | 'normal' | 'low';
export const TICKET_PRIORITIES: Record<TicketPriority, { label: string; tone: StatusTone }> = {
  high: { label: '높음', tone: 'danger' },
  normal: { label: '보통', tone: 'neutral' },
  low: { label: '낮음', tone: 'neutral' },
};

export interface TicketMessage {
  id: string;
  from: 'customer' | 'agent';
  name: string;
  time: string;
  body: string;
}

export interface Ticket {
  id: string;
  customer: string;
  contact: string;
  phone: string;
  type: TicketType;
  priority: TicketPriority;
  title: string;
  /** 접수 경로(TICKET_CHANNELS) */
  channel: string;
  createdAt: string;
  slaDue: string;
  assignee: string;
  state: ProgressState;
  doc?: string;
  messages: readonly TicketMessage[];
  memos: readonly { id: string; by: string; time: string; body: string }[];
  attachments?: readonly { name: string; size: number }[];
  /** 연결한 반품 입고 */
  returnId?: string;
}

const scallop = itemById('i03');

export const TICKETS: readonly Ticket[] = [
  {
    id: 'CS-2611-0042',
    customer: '누리식품',
    contact: '한지민 팀장',
    phone: '051-602-3300',
    type: 'claim',
    priority: 'high',
    title: `${scallop.name} 해동 흔적 · 2박스 반품 요청`,
    channel: '전화',
    createdAt: '2026-11-05 16:20',
    slaDue: '2026-11-07',
    assignee: '문채원',
    state: 'doing',
    doc: 'TI-2611-0116',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '한지민 팀장',
        time: '11-05 16:20',
        body: `11월 5일 납품된 ${scallop.name} ${formatQuantity(90, 'kg')} 가운데 2박스에서 해동 흔적이 보입니다. 사진을 보냅니다.`,
      },
      {
        id: 'm2',
        from: 'agent',
        name: '문채원 주임',
        time: '11-05 17:02',
        body: '사진을 확인했습니다. 물류팀과 출고 온도 기록을 확인하고 내일 오전까지 회신드리겠습니다.',
      },
      {
        id: 'm3',
        from: 'customer',
        name: '한지민 팀장',
        time: '11-06 09:10',
        body: `해당 2박스(${formatQuantity(20, 'kg')})는 반품 처리 부탁드립니다. 대체 물량은 다음 납품 때 함께 받겠습니다.`,
      },
    ],
    memos: [
      {
        id: 'n1',
        by: '정우진 주임',
        time: '11-06 10:05',
        body: '평택 냉동센터 출고 기록은 정상 온도입니다. 운송 구간 온도 기록을 동방로지스에 요청했습니다.',
      },
    ],
    attachments: [
      { name: '관자-해동-01.jpg', size: 1_920_000 },
      { name: '관자-해동-02.jpg', size: 2_040_000 },
    ],
  },
  {
    id: 'CS-2611-0041',
    customer: '대양상사',
    contact: '오세훈 과장',
    phone: '02-3456-1200',
    type: 'inquiry',
    priority: 'normal',
    title: '12월 냉동 새우 추가 물량 납기 문의',
    channel: '메일',
    createdAt: '2026-11-06 08:40',
    slaDue: '2026-11-07',
    assignee: '송유나',
    state: 'doing',
    doc: QUOTE.no,
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '오세훈 과장',
        time: '11-06 08:40',
        body: `12월 둘째 주까지 냉동 흰다리새우 ${formatQuantity(600, 'BOX')} 추가 납품이 가능한지 알려 주세요.`,
      },
      {
        id: 'm2',
        from: 'agent',
        name: '송유나 대리',
        time: '11-06 09:30',
        body: '11월 10일 입항 물량으로 가능합니다. 견적서는 강도현 팀장이 오늘 보내드립니다.',
      },
    ],
    memos: [],
  },
  {
    id: 'CS-2611-0040',
    customer: '서해통상',
    contact: '임도윤 차장',
    phone: '032-881-7020',
    type: 'inquiry',
    priority: 'high',
    title: '세금계산서 발행 보류 사유 문의',
    channel: '전화',
    createdAt: '2026-11-05 11:20',
    slaDue: '2026-11-06',
    assignee: '박서연',
    state: 'todo',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '임도윤 차장',
        time: '11-05 11:20',
        body: '11월 납품분 세금계산서가 아직 오지 않았습니다. 보류된 이유를 알려 주세요.',
      },
    ],
    memos: [
      {
        id: 'n1',
        by: '최민준 사원',
        time: '11-05 11:40',
        body: '휴업 조회 건입니다. 거래 조건 변경 품의(DOC-2611-0023)가 결재 중입니다.',
      },
    ],
  },
  {
    id: 'CS-2611-0039',
    customer: '한결물산',
    contact: '권태오 과장',
    phone: '031-778-4432',
    type: 'return',
    priority: 'normal',
    title: '발사믹 식초 병 파손 3병 반품',
    channel: '메일',
    createdAt: '2026-11-06 10:05',
    slaDue: '2026-11-08',
    assignee: '문채원',
    state: 'doing',
    doc: 'TI-2611-0117',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '권태오 과장',
        time: '11-06 10:05',
        body: '발사믹 식초 1박스에서 병 3개가 깨진 채로 도착했습니다. 반품과 재출고를 요청합니다.',
      },
    ],
    memos: [],
    attachments: [{ name: '발사믹-파손.jpg', size: 1_480_000 }],
  },
  {
    id: 'CS-2611-0038',
    customer: '누리식품',
    contact: '배수현 주임',
    phone: '051-602-3318',
    type: 'inquiry',
    priority: 'low',
    title: '아이스박스 EPS 20L 대량 단가 문의',
    channel: '메일',
    createdAt: '2026-11-06 13:15',
    slaDue: '2026-11-10',
    assignee: '최민준',
    state: 'todo',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '배수현 주임',
        time: '11-06 13:15',
        body: `아이스박스 EPS 20L를 월 ${formatQuantity(2_000, '개')} 이상 받으면 단가가 얼마인지 알려 주세요.`,
      },
    ],
    memos: [],
  },
  {
    id: 'CS-2611-0037',
    customer: '대양상사',
    contact: '노은비 대리',
    phone: '02-3456-1215',
    type: 'claim',
    priority: 'normal',
    title: '10월 납품 냉동 연어 필렛 중량 미달',
    channel: '전화',
    createdAt: '2026-11-02 15:30',
    slaDue: '2026-11-04',
    assignee: '문채원',
    state: 'hold',
    doc: 'TI-2611-0111',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '노은비 대리',
        time: '11-02 15:30',
        body: '10월 30일 납품된 냉동 연어 필렛 몇 박스가 표시 중량보다 가볍습니다.',
      },
      {
        id: 'm2',
        from: 'agent',
        name: '문채원 주임',
        time: '11-03 10:10',
        body: '박스별 실측 중량을 보내 주시면 바로 정산에 반영하겠습니다.',
      },
    ],
    memos: [
      {
        id: 'n1',
        by: '문채원 주임',
        time: '11-04 17:00',
        body: '거래처 실측표 회신 대기로 보류합니다.',
      },
    ],
  },
  {
    id: 'CS-2611-0036',
    customer: '오름케이터링',
    contact: '지예린 실장',
    phone: '02-462-7781',
    type: 'inquiry',
    priority: 'low',
    title: '연말 케이터링 수산물 견적 요청',
    channel: '전화',
    createdAt: '2026-11-05 16:30',
    slaDue: '2026-11-09',
    assignee: '송유나',
    state: 'todo',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '지예린 실장',
        time: '11-05 16:30',
        body: '12월 행사 6건 기준으로 새우 · 연어 · 관자 패키지 견적을 받고 싶습니다.',
      },
    ],
    memos: [],
  },
  {
    id: 'CS-2611-0035',
    customer: '한결물산',
    contact: '장미래 대리',
    phone: '031-778-4410',
    type: 'inquiry',
    priority: 'normal',
    title: '올리브오일 유통기한 확인서 요청',
    channel: '메일',
    createdAt: '2026-11-03 09:00',
    slaDue: '2026-11-05',
    assignee: '문채원',
    state: 'done',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '장미래 대리',
        time: '11-03 09:00',
        body: '로트 OS2610A의 유통기한 확인서를 보내 주세요.',
      },
      {
        id: 'm2',
        from: 'agent',
        name: '문채원 주임',
        time: '11-03 14:20',
        body: '확인서를 첨부해 보냈습니다.',
      },
    ],
    memos: [],
  },
  {
    id: 'CS-2611-0034',
    customer: '대양상사',
    contact: '오세훈 과장',
    phone: '02-3456-1200',
    type: 'return',
    priority: 'low',
    title: '크라프트 박스 5호 규격 오배송 교환',
    channel: '전화',
    createdAt: '2026-11-01 10:40',
    slaDue: '2026-11-03',
    assignee: '정우진',
    state: 'done',
    returnId: 'RT-2611-0003',
    messages: [
      {
        id: 'm1',
        from: 'customer',
        name: '오세훈 과장',
        time: '11-01 10:40',
        body: '5호 대신 4호 박스가 왔습니다. 교환 부탁드립니다.',
      },
    ],
    memos: [],
  },
];

/** 결재 상태(문서 작성 화면 배지) */
export type DraftApproval = Extract<ApprovalState, 'draft' | 'pending'>;
