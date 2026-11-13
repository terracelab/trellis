import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

export interface TimeFieldProps extends ContractBase {
  /** Field 밖(표 칸 · 필터)에서 쓸 때의 접근성 이름 */
  label?: string;
  /** 'HH:MM'(24시간). 비었으면 null */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** 목록 · 화살표가 움직이는 간격(분). 기본 30. 글자로는 간격 밖 시각(09:10)도 넣는다 */
  step?: number;
  /** 고를 수 있는 첫 시각 'HH:MM'(기본 00:00) */
  min?: string;
  /** 고를 수 있는 마지막 시각 'HH:MM'(기본 23:59) */
  max?: string;
  /** 목록 행 끝에 이 시각부터 걸리는 시간(30분 · 1시간 30분)을 보인다. 종료 시각 칸에 시작 시각을 준다 */
  durationFrom?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: Size;
  name?: string;
}

/** 'HH:MM' → 자정부터의 분. 형식이 틀리면 NaN */
export function timeToMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return Number.NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h > 23 || min > 59 ? Number.NaN : h * 60 + min;
}

/** 분 → 'HH:MM'(하루 안으로 자른다) */
export function minutesToTime(minutes: number): string {
  const v = Math.min(23 * 60 + 59, Math.max(0, Math.round(minutes)));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
}

/**
 * 친 글자를 시각으로 읽는다. 9 → 09:00 · 930 → 09:30 · 0930 → 09:30 · 18:5 → 18:05 · 9시 30분 → 09:30.
 * 읽을 수 없거나 24시 · 60분을 넘으면 null
 */
export function parseTimeText(text: string): string | null {
  const s = text.trim();
  if (!s) return null;
  const sep = /^(\d{1,2})\s*(?::|시|\.|\s)\s*(\d{1,2})?\s*(?:분)?$/.exec(s);
  let h: number;
  let m: number;
  if (sep) {
    h = Number(sep[1]);
    m = sep[2] ? Number(sep[2]) : 0;
  } else if (/^\d{1,4}$/.test(s)) {
    if (s.length <= 2) {
      h = Number(s);
      m = 0;
    } else {
      h = Number(s.slice(0, s.length - 2));
      m = Number(s.slice(-2));
    }
  } else return null;
  if (h > 23 || m > 59) return null;
  return minutesToTime(h * 60 + m);
}

/** 목록에 놓는 시각: min부터 step 간격으로 max까지 */
export function timeOptions(step = 30, min = '00:00', max = '23:59'): string[] {
  const from = timeToMinutes(min);
  const to = timeToMinutes(max);
  const gap = Math.max(1, Math.round(step));
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return [];
  const out: string[] = [];
  for (let v = Math.ceil(from / gap) * gap; v <= to; v += gap) out.push(minutesToTime(v));
  return out;
}

export const TimeFieldContract = defineContract<TimeFieldProps>({
  name: 'TimeField',
  props: {
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
    id: { type: 'string', description: 'DOM id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'string | null', description: "값 'HH:MM'(제어)" },
    defaultValue: { type: 'string | null', description: '처음 값(비제어)' },
    onChange: { type: '(value: string | null) => void', description: '시각이 바뀔 때' },
    step: { type: 'number', default: 30, description: '목록 · 화살표 간격(분)' },
    min: { type: 'string', default: '00:00', description: '첫 시각' },
    max: { type: 'string', default: '23:59', description: '마지막 시각' },
    durationFrom: {
      type: 'string',
      description: '목록 행 끝에 이 시각부터 걸리는 시간(종료 칸에 시작 시각)',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    name: { type: 'string', description: '폼 이름' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'combobox',
    keyboard: ['숫자 입력', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape', 'Tab'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
