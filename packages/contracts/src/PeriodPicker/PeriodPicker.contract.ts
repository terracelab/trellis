import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';
import { dueDays, formatDate, parseDate } from '../_shared/format.js';

/** 기간 프리셋. vatPeriod1 = 부가세 1기(1/1~6/30), vatPeriod2 = 2기(7/1~12/31). 주는 월요일 시작 */
export type PeriodPreset =
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'vatPeriod1'
  | 'vatPeriod2'
  | 'thisYear';

/** 'YYYY-MM-DD' 두 개. from ≤ to */
export interface PeriodValue {
  from: string;
  to: string;
}

export const PERIOD_PRESETS = [
  'today',
  'thisWeek',
  'thisMonth',
  'lastMonth',
  'thisQuarter',
  'vatPeriod1',
  'vatPeriod2',
  'thisYear',
] as const satisfies readonly PeriodPreset[];

/** 프리셋 라벨(content.md §6 당일 · 당월 · 전월) */
export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  today: '당일',
  thisWeek: '금주',
  thisMonth: '당월',
  lastMonth: '전월',
  thisQuarter: '당분기',
  vatPeriod1: '부가세 1기',
  vatPeriod2: '부가세 2기',
  thisYear: '금년',
};

export const DEFAULT_PERIOD_PRESETS: readonly PeriodPreset[] = [
  'today',
  'thisWeek',
  'thisMonth',
  'lastMonth',
  'thisQuarter',
  'thisYear',
];

const iso = (y: number, m: number, d: number) => formatDate(new Date(y, m, d));

/** 프리셋 → 기간. today를 넘기면 그날 기준(결정적 데모 · 테스트), 아니면 오늘 */
export function resolvePeriodPreset(
  preset: PeriodPreset,
  today: string | Date = new Date(),
): PeriodValue {
  const t = parseDate(today);
  const y = t.getFullYear();
  const m = t.getMonth();
  const d = t.getDate();
  switch (preset) {
    case 'today':
      return { from: iso(y, m, d), to: iso(y, m, d) };
    case 'thisWeek': {
      const offset = (t.getDay() + 6) % 7;
      return { from: iso(y, m, d - offset), to: iso(y, m, d - offset + 6) };
    }
    case 'thisMonth':
      return { from: iso(y, m, 1), to: iso(y, m + 1, 0) };
    case 'lastMonth':
      return { from: iso(y, m - 1, 1), to: iso(y, m, 0) };
    case 'thisQuarter': {
      const q = Math.floor(m / 3) * 3;
      return { from: iso(y, q, 1), to: iso(y, q + 3, 0) };
    }
    case 'vatPeriod1':
      return { from: iso(y, 0, 1), to: iso(y, 5, 30) };
    case 'vatPeriod2':
      return { from: iso(y, 6, 1), to: iso(y, 11, 31) };
    case 'thisYear':
      return { from: iso(y, 0, 1), to: iso(y, 11, 31) };
  }
}

/**
 * 비교 기간 방식(PG-39). previous = 바로 앞 같은 길이(달 단위 기간이면 앞 달 · 분기 · 해),
 * lastYear = 전년 동기(같은 날짜, 달 끝은 달 끝으로), custom = 직접 고른 기간
 */
export type PeriodCompareMode = 'previous' | 'lastYear' | 'custom';

export const PERIOD_COMPARE_MODES = [
  'previous',
  'lastYear',
  'custom',
] as const satisfies readonly PeriodCompareMode[];

/** 비교 기간: 방식 + 계산된(또는 고른) 기간 */
export interface PeriodCompare extends PeriodValue {
  mode: PeriodCompareMode;
}

const monthEnd = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** 기간 → 비교 기간. custom은 계산할 것이 없으므로 previous · lastYear만 받는다 */
export function resolvePeriodCompare(
  value: PeriodValue,
  mode: Exclude<PeriodCompareMode, 'custom'>,
): PeriodValue {
  const a = parseDate(value.from);
  const b = parseDate(value.to);
  const [ay, am, ad] = [a.getFullYear(), a.getMonth(), a.getDate()];
  const [by, bm, bd] = [b.getFullYear(), b.getMonth(), b.getDate()];
  if (mode === 'lastYear') {
    // 2월 29일은 28일로, 달 끝(2025-02-28)은 그 해 달 끝(2024-02-29)으로
    const toEnd = bd === monthEnd(by, bm);
    return {
      from: iso(ay - 1, am, Math.min(ad, monthEnd(ay - 1, am))),
      to: iso(by - 1, bm, toEnd ? monthEnd(by - 1, bm) : Math.min(bd, monthEnd(by - 1, bm))),
    };
  }
  // 1일 ~ 달 끝이면 달 수만큼 앞 달들(11월 → 10월, 1분기 → 전년 4분기)
  if (ad === 1 && bd === monthEnd(by, bm)) {
    const months = (by - ay) * 12 + (bm - am) + 1;
    return { from: iso(ay, am - months, 1), to: iso(ay, am, 0) };
  }
  const days = dueDays(value.to, value.from) + 1;
  return { from: iso(ay, am, ad - days), to: iso(ay, am, ad - 1) };
}

export interface PeriodPickerProps extends ContractBase {
  value?: PeriodValue | null;
  defaultValue?: PeriodValue | null;
  onChange?: (value: PeriodValue) => void;
  /** 왼쪽 목록에 보일 프리셋(순서대로) */
  presets?: readonly PeriodPreset[];
  /** 프리셋 기준일 'YYYY-MM-DD'. 없으면 오늘 */
  today?: string;
  /** 고를 수 있는 마지막 날 'YYYY-MM-DD'. 뒤 날짜는 달력에서 막히고 프리셋 끝도 이 날로 줄어든다 */
  max?: string;
  /** 권장 최대 일수(시작일 · 종료일 포함). 넘으면 경고 문구를 보이고 적용은 막지 않는다 */
  maxDays?: number;
  /** 값이 없을 때 트리거 글자 */
  placeholder?: string;
  /** Field 밖(필터 바)에서 쓸 때의 이름. 좁은 화면 필터 시트에서는 컨트롤 위 글자가 된다 */
  label?: string;
  size?: Size;
  disabled?: boolean;
  /**
   * 비교 기간(제어). 주면(null 포함) 팝업 아래에 "비교" 줄이 생기고 트리거에 비교 기간이 붙는다.
   * null = 비교 안 함. 없으면 지금과 같다
   */
  compare?: PeriodCompare | null;
  /** 처음 비교 기간(비제어). 주면(null 포함) 비교 줄이 생긴다 */
  defaultCompare?: PeriodCompare | null;
  /** 비교 기간을 바꿀 때. 기간을 바꾸면 previous · lastYear 비교도 다시 계산해 함께 알린다 */
  onCompareChange?: (compare: PeriodCompare | null) => void;
  /** 고를 수 있는 비교 방식(순서대로). 기본 previous · lastYear · custom */
  compareModes?: readonly PeriodCompareMode[];
}

export const PeriodPickerContract = defineContract<PeriodPickerProps>({
  name: 'PeriodPicker',
  props: {
    id: { type: 'string', description: '트리거 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: '{ from: string; to: string } | null', description: '기간(제어)' },
    defaultValue: { type: '{ from: string; to: string } | null', description: '처음 기간' },
    onChange: {
      type: '(value: { from: string; to: string }) => void',
      description: '프리셋을 고르거나 적용을 누를 때',
    },
    presets: {
      type: 'PeriodPreset[]',
      default: [...DEFAULT_PERIOD_PRESETS],
      description: '프리셋 목록(순서대로)',
    },
    today: { type: 'string', description: '프리셋 기준일(없으면 오늘)' },
    max: { type: 'string', description: '고를 수 있는 마지막 날(YYYY-MM-DD)' },
    maxDays: { type: 'number', description: '권장 최대 일수. 넘으면 경고(적용은 됨)' },
    placeholder: { type: 'string', default: '기간 선택', description: '값이 없을 때' },
    label: { type: 'string', description: 'Field 밖 이름(필터 시트 글자)' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    compare: {
      type: "{ mode: 'previous' | 'lastYear' | 'custom'; from: string; to: string } | null",
      description: '비교 기간(제어). 주면 비교 줄이 생긴다. null = 비교 안 함',
    },
    defaultCompare: {
      type: "{ mode: 'previous' | 'lastYear' | 'custom'; from: string; to: string } | null",
      description: '처음 비교 기간(비제어)',
    },
    onCompareChange: {
      type: '(compare: PeriodCompare | null) => void',
      description: '비교 기간을 바꿀 때. 기간이 바뀌면 직전 · 전년 동기도 다시 계산해 알린다',
    },
    compareModes: {
      type: 'PeriodCompareMode[]',
      default: [...PERIOD_COMPARE_MODES],
      description: '비교 방식 목록: 직전 기간 · 전년 동기 · 직접 선택',
    },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'button',
    keyboard: [
      'Enter',
      'Space',
      'Tab',
      'Escape',
      '숫자 입력',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'PageUp',
      'PageDown',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
