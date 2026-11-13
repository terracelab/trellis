// 표 내보내기(PG-39): CSV 글자를 파일로 내려받는다. 글자 만들기는 contracts toCsv(UTF-8 BOM · 서식 없는 숫자).
// 외부 요청 없이 브라우저 안에서 Blob 링크를 만들어 누르고 바로 치운다(설치형 · 오프라인에서도 같다).
import {
  CSV_MIME,
  csvFileName,
  toCsv,
  type CsvColumn,
  type CsvOptions,
} from '@terracelab/trellis-contracts';

/**
 * 파일 하나를 내려받는다. 서버 렌더 · 브라우저 밖에서는 아무것도 하지 않는다.
 *
 * ```ts
 * downloadFile('매출 분석_2026-11-06.csv', toCsv(rows, columns));
 * ```
 */
export function downloadFile(filename: string, content: string | Blob, type = CSV_MIME): void {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.hidden = true;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 누른 뒤 바로 치우면 일부 브라우저가 내려받기를 시작하지 못한다
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * 행 → CSV 파일 내려받기. 파일 이름은 "이름_날짜.csv"(date가 있으면).
 *
 * ```ts
 * downloadCsv({ name: '매출 분석', date: TODAY, rows, columns });
 * ```
 */
export function downloadCsv<T>({
  name,
  date,
  rows,
  columns,
  options,
}: {
  name: string;
  date?: string | Date;
  rows: readonly T[];
  columns: readonly CsvColumn<T>[];
  options?: CsvOptions;
}): void {
  downloadFile(csvFileName(name, date), toCsv(rows, columns, options));
}
