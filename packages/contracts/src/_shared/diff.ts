// 변경 비교(ChangeDiff, PR-30): 두 레코드에서 바뀐 필드만 "이전 → 이후" 줄로 만든다. 웹 · 네이티브 공용 순수 함수.
import { formatAmount, formatDate } from './format.js';

/** ChangeDiff 한 줄. 값은 화면에 보일 글자(서식은 만드는 쪽이 끝낸다). 비었으면 null */
export interface ChangeDiffRow {
  /** 바뀐 대상(품목 · 사람 · 문서 번호). 한 대상만 비교하면 생략 */
  target?: string;
  /** 필드 이름(단가 · 결재선 · 주소) */
  field: string;
  before?: string | null;
  after?: string | null;
}

/** 비교할 필드. key만 주면 key가 이름이 된다. format은 그 key의 값 타입을 받는다 */
export type DiffField<T> = {
  [K in keyof T & string]: {
    key: K;
    /** 화면 이름(단가). 없으면 key */
    label?: string;
    /** 값 → 글자. 빈 값(undefined · null · '')에는 부르지 않는다. 없으면 기본 서식(숫자 천 단위 · 날짜 ISO · 그 밖은 문자열) */
    format?: (value: NonNullable<T[K]>) => string;
  };
}[keyof T & string];

/** 비었다고 보는 값: undefined · null · 빈 글자 */
const isEmpty = (v: unknown) => v === undefined || v === null || v === '';

/** 같은 값인가. 빈 값끼리 같고, 날짜는 시각, 배열 · 객체는 JSON으로 견준다 */
function same(a: unknown, b: unknown): boolean {
  if (isEmpty(a) && isEmpty(b)) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null)
    return JSON.stringify(a) === JSON.stringify(b);
  return Object.is(a, b);
}

/** 기본 서식. 숫자는 소수 자리를 그대로 두고 천 단위 구분(U+2212) */
function text(v: unknown): string | null {
  if (isEmpty(v)) return null;
  if (typeof v === 'number') {
    const digits = (String(v).split('.')[1] ?? '').length;
    return formatAmount(v, { digits });
  }
  if (v instanceof Date) return formatDate(v);
  if (typeof v === 'string') return v;
  if (typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
}

/**
 * before · after에서 fields 순서대로 바뀐 필드만 ChangeDiffRow로 돌려준다.
 *   diffFields(old, next, [{ key: 'price', label: '단가' }, 'memo'], { target: 'PO-0042' })
 * 바뀐 것이 없으면 빈 배열(ChangeDiff는 empty 문구를 보인다).
 */
export function diffFields<T extends object>(
  before: Partial<T> | null | undefined,
  after: Partial<T> | null | undefined,
  fields: readonly (DiffField<T> | (keyof T & string))[],
  options: { target?: string } = {},
): ChangeDiffRow[] {
  const rows: ChangeDiffRow[] = [];
  for (const f of fields) {
    const field = (typeof f === 'string' ? { key: f } : f) as {
      key: keyof T & string;
      label?: string;
      format?: (value: unknown) => string;
    };
    const a = before?.[field.key];
    const b = after?.[field.key];
    if (same(a, b)) continue;
    const show = (v: unknown) => (isEmpty(v) ? null : field.format ? field.format(v) : text(v));
    rows.push({
      ...(options.target !== undefined ? { target: options.target } : {}),
      field: field.label ?? field.key,
      before: show(a),
      after: show(b),
    });
  }
  return rows;
}
