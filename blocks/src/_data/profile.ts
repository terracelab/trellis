// 회사 운영 정보(PR-11). 블록 화면에서 회사 · 업종마다 달라지는 말과 기준을 한곳에 둔다.
// 블록은 창고 · 출고 마감 · 포장 · 온도 기준 · 담당자 · 시각을 코드에 쓰지 않고 여기서 읽는다.
// 다른 회사는 이 파일을 바꿔 끼우면(데모 저장소: companies/<id>/data/profile.ts) 블록을 고치지 않아도 문구가 바뀐다.
// 이름은 다른 샘플 파일(창고 · 사용자)에서 id로 가져오므로, 그 파일을 바꿔 끼우면 이름도 따라 바뀐다.
import type { ApprovalLineRole } from '@terracelab/trellis-contracts';
import { USERS } from '../_platform/mock.js';
import { TODAY, warehouseById } from './trade.js';

/** 데모 시각(HH:MM). TODAY와 함께 모든 블록이 이 시계 하나를 쓴다(그룹웨어 · 현장 보드 · 채널 동기화) */
export const NOW = '14:20';
/** TODAY + NOW(2026-11-06 14:20). 지금 한 일의 기록 시각 */
export const NOW_AT = `${TODAY} ${NOW}`;

/** 온도 기준(°C). min · max 중 없는 쪽은 제한 없음 */
export interface TempRule {
  /** 화물 · 차량 구분 이름(냉동 · 냉장) */
  label: string;
  /** 보관 장소 이름(냉동창고) */
  storage: string;
  min?: number;
  max?: number;
}

/** 배송 방법(상품 등록). warehouseId가 있으면 그 창고에서만 출고한다 */
export interface ShipMethod {
  value: string;
  label: string;
  /** 짧은 이름(냉동 상품은 …에서 출고합니다) */
  short: string;
  /** 보관 방법 문구(상품 정보) */
  storage: string;
  warehouseId?: string;
}

export interface CompanyProfile {
  /** 화면 문구에서 부르는 회사 이름(짧게) */
  name: string;
  /** 근무 시각(근태). 출근이 start보다 늦으면 지각, 퇴근이 overtimeFrom 이후면 연장. place · area는 근무지(본사 12층 · 서울 중구) */
  work: { start: string; end: string; overtimeFrom: string; place: string; area: string };
  /** 유통기한 주의 기준(남은 날, 로트 · 재고) */
  lotWarnDays: number;
  /** 거래처 반품을 받는 창고(WAREHOUSES id) */
  returnsWarehouseId: string;
  /** 온도 관리 화물(배차 · 기사 앱 · 현장 보드 · 설비). 온도 관리가 없는 회사는 null */
  cold: TempRule | null;
  shipping: {
    /** 당일 출고 마감 HH:MM */
    cutoff: string;
    /** 마감 이름(냉동 출고 마감) */
    cutoffLabel: string;
    /** 출고 포장 한 줄(주문 상세) */
    packing: string;
    /** 상품 등록의 배송 방법 */
    methods: readonly ShipMethod[];
  };
  /** 반품 · 교환 거부 사유(이커머스 클레임). 업종 사유를 회사가 더한다 */
  claimRejectReasons: readonly { value: string; label: string; note: string }[];
  /** 상품 과세 구분(상품 등록) */
  taxTypes: readonly { value: string; label: string }[];
  /** 발주 · 지출 결재선(기안자 다음 차례). 사용자 id(USERS)와 역할 */
  approval: {
    line: readonly { userId: string; role: ApprovalLineRole }[];
    /** 이 금액(원) 이상이면 마지막 승인자까지 올라간다 */
    finalLimit: number;
  };
  /** 업무별 담당자 이름(이름 직함). 지난 처리 기록의 처리자로 쓴다 */
  people: {
    /** 대표(최종 결재) */
    ceo: string;
    /** 경영지원 팀장(결재 검토 · 문서 작성) */
    admin: string;
    /** 회계 · 세무 */
    finance: string;
    /** 구매 · 발주 */
    purchase: string;
    /** 물류 · 출고 · 입고 검수 */
    logistics: string;
    /** 영업 · 고객 응대 */
    sales: string;
  };
}

/** 사용자 id → 이름 · 직함. 없는 id면 빈 값 */
export const userOf = (userId: string) => {
  const u = USERS.find((x) => x.id === userId);
  return { id: userId, name: u?.name ?? '', title: u?.title ?? '' };
};
/** 사용자 id → '이름 직함' */
export const personLabel = (userId: string) => {
  const u = userOf(userId);
  return u.name ? `${u.name} ${u.title}` : '';
};

export const PROFILE: CompanyProfile = {
  name: '테라트레이딩',
  work: {
    start: '09:00',
    end: '18:00',
    overtimeFrom: '19:00',
    place: '본사 12층',
    area: '서울 중구',
  },
  lotWarnDays: 30,
  returnsWarehouseId: 'w2',
  cold: { label: '냉동', storage: '냉동창고', max: -18 },
  shipping: {
    cutoff: '14:00',
    cutoffLabel: '냉동 출고 마감',
    packing: '냉동 아이스박스 포장',
    methods: [
      {
        value: 'frozen',
        label: '냉동 택배(아이스박스 · 보냉팩)',
        short: '냉동',
        storage: '−18℃ 이하 냉동 보관',
        warehouseId: 'w2',
      },
      {
        value: 'chilled',
        label: '냉장 택배',
        short: '냉장',
        storage: '0~10℃ 냉장 보관',
        warehouseId: 'w2',
      },
      { value: 'ambient', label: '상온 택배', short: '상온', storage: '실온 보관' },
    ],
  },
  claimRejectReasons: [
    { value: 'used', label: '상품 사용 · 개봉 흔적', note: '상품 사용 흔적' },
    { value: 'expired', label: '반품 기한 경과', note: '반품 기한이 지났습니다' },
    { value: 'shipped', label: '이미 발송한 주문', note: '이미 발송한 주문입니다' },
    {
      value: 'frozen',
      label: '냉동 상품 단순 변심 반품 불가',
      note: '냉동 상품은 받은 뒤 단순 변심으로 반품할 수 없습니다. 상세 페이지 반품 안내를 확인해 주세요',
    },
  ],
  taxTypes: [
    { value: 'free', label: '면세(미가공 농수산물)' },
    { value: 'taxed', label: '과세' },
  ],
  approval: {
    line: [
      { userId: 'u02', role: '검토' },
      { userId: 'u01', role: '승인' },
    ],
    finalLimit: 50_000_000,
  },
  people: {
    ceo: personLabel('u01'),
    admin: personLabel('u02'),
    finance: personLabel('u03'),
    purchase: personLabel('u04'),
    logistics: personLabel('u05'),
    sales: personLabel('u06'),
  },
};

/** 결재선 사람(이름 · 직함 · 역할). 기안자는 빼고 다음 차례부터 */
export const approvalLine = () =>
  PROFILE.approval.line.map((s) => ({ ...userOf(s.userId), role: s.role }));

/** 온도가 기준 안인지(기준이 없으면 늘 안) */
export const withinCold = (value: number, rule: TempRule | null = PROFILE.cold) =>
  !rule ||
  ((rule.min === undefined || value >= rule.min) && (rule.max === undefined || value <= rule.max));

/** 기준 문구: −18°C 이하 · 2~6°C · 0°C 이상(음수는 U+2212) */
export function coldRuleLabel(rule: TempRule | null = PROFILE.cold): string {
  if (!rule) return '';
  const n = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v));
  if (rule.min !== undefined && rule.max !== undefined) return `${n(rule.min)}~${n(rule.max)}°C`;
  if (rule.max !== undefined) return `${n(rule.max)}°C 이하`;
  return rule.min !== undefined ? `${n(rule.min)}°C 이상` : '';
}

/** 창고 이름(id). 바꿔 낀 창고 목록에 없으면 id 그대로 */
export const warehouseName = (id: string) => warehouseById(id)?.name ?? id;
