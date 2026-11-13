// 표 내보내기(PG-39): 행 → CSV 글자. 웹 · 네이티브 · 서버가 같은 규칙으로 쓰는 순수 함수다.
// 스프레드시트 앱이 한글을 깨뜨리지 않게 UTF-8 BOM을 붙이고, 금액 · 수량은 서식 없는 숫자로 쓴다
// (천 단위 쉼표 · U+2212를 넣으면 숫자가 아니라 글자로 읽힌다). 파일로 내려받는 일은 웹 downloadCsv가 한다.
import { formatDate } from './format.js';

/** 칸 값. 숫자는 그대로, 날짜는 YYYY-MM-DD, 없음은 빈 칸 */
export type CsvValue = string | number | boolean | Date | null | undefined;

export interface CsvColumn<T> {
  /** 머리글(표 머리와 같은 이름). 단위는 머리에 한 번: "공급가액(원)" */
  label: string;
  /** 행 필드 이름 또는 값 꺼내기. 금액은 서식을 입히지 않은 숫자를 돌려준다 */
  value: (keyof T & string) | ((row: T) => CsvValue);
}

export interface CsvOptions {
  /** 맨 앞 UTF-8 BOM. 기본 true(스프레드시트 앱이 한글을 UTF-8로 읽는다) */
  bom?: boolean;
  /** 줄 끝. 기본 CRLF(RFC 4180) */
  eol?: '\r\n' | '\n';
  /**
   * `= + - @`로 시작하는 글자 칸 앞에 `'`를 붙여 수식으로 실행되지 않게 한다(CSV 수식 주입). 기본 true.
   * 숫자 칸은 건드리지 않는다. 음수 금액은 숫자로 넘긴다
   */
  escapeFormulas?: boolean;
}

export const CSV_BOM = '﻿';
export const CSV_MIME = 'text/csv;charset=utf-8';

const FORMULA = /^[=+\-@\t\r]/;

/** 값 하나 → 칸 글자(따옴표 처리 전) */
export function csvCell(value: CsvValue, escapeFormulas = true): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : formatDate(value);
  // 글자 '-' 하나(빈 값 표시)는 수식이 아니다. 두 글자 이상만 막는다
  return escapeFormulas && value.length > 1 && FORMULA.test(value) ? `'${value}` : value;
}

/** 쉼표 · 큰따옴표 · 줄바꿈 · 앞뒤 공백이 있으면 큰따옴표로 감싸고 안의 따옴표는 두 번 쓴다 */
function quote(text: string): string {
  return /[",\r\n]|^\s|\s$/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * 행 배열 → CSV 글자. 머리글 한 줄 + 행마다 한 줄.
 *
 * ```ts
 * const csv = toCsv(rows, [
 *   { label: '전표번호', value: 'no' },
 *   { label: '공급가액(원)', value: 'supply' },
 *   { label: '거래처', value: (r) => r.vendor.name },
 * ]);
 * ```
 */
export function toCsv<T>(
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
  { bom = true, eol = '\r\n', escapeFormulas = true }: CsvOptions = {},
): string {
  const head = columns.map((c) => quote(csvCell(c.label, escapeFormulas))).join(',');
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const v =
          typeof c.value === 'function'
            ? c.value(row)
            : ((row as Record<string, unknown>)[c.value] as CsvValue);
        return quote(csvCell(v, escapeFormulas));
      })
      .join(','),
  );
  return `${bom ? CSV_BOM : ''}${[head, ...body].join(eol)}${eol}`;
}

/** 내려받을 파일 이름: 화면 이름_날짜.csv. 파일 이름에 못 쓰는 글자(\ / : * ? " < > |)는 뺀다 */
export function csvFileName(name: string, date?: string | Date): string {
  const base = name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'export';
  return `${base}${date ? `_${formatDate(date)}` : ''}.csv`;
}
