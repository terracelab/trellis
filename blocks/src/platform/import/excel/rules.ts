// 전표 업로드 검증 규칙(엑셀 업로드 블록). 다른 대상(거래처 · 품목)을 받으려면 COLUMNS와 checkRow · checkGroup을 바꾼다.
// 칸 검증(날짜 · 계정코드 · 금액 · 거래처)과 전표 검증(차변 합계 = 대변 합계)을 나눠 두고, 문구는 content.md §5 오류 규칙을 따른다
import { formatAmount } from '@terracelab/trellis-contracts';
import { accountByCode, ACCOUNTS } from '../../../_data/erp.js';
import { JOURNAL_IMPORT_TEMPLATE_ROWS } from '../../../_data/journal-import.js';
import { PARTIES } from '../../../_data/index.js';
import { josa } from '../../../_ui/index.js';

export type FieldKey =
  'voucher' | 'date' | 'code' | 'account' | 'party' | 'debit' | 'credit' | 'memo';

// slot: columns — 양식 열. name = CSV 머리 글자, required = 없으면 파일을 받지 않는다. 예는 샘플 양식 첫 줄
export const COLUMNS: readonly {
  key: FieldKey;
  name: string;
  required: boolean;
  rule: string;
}[] = [
  { key: 'voucher', name: '전표번호', required: true, rule: '같은 번호의 줄이 전표 하나' },
  { key: 'date', name: '일자', required: true, rule: 'YYYY-MM-DD. 점 · 빗금도 받는다' },
  { key: 'code', name: '계정코드', required: true, rule: '계정과목 표의 코드' },
  { key: 'account', name: '계정과목', required: false, rule: '확인용. 반영은 코드 기준' },
  { key: 'party', name: '거래처', required: false, rule: '등록된 이름. 채권 · 채무 계정은 필요' },
  { key: 'debit', name: '차변', required: true, rule: '원 단위 숫자. 쉼표는 써도 된다' },
  { key: 'credit', name: '대변', required: true, rule: '한 줄에 차변 · 대변 중 하나만' },
  { key: 'memo', name: '적요', required: false, rule: '40자 이내' },
];
// slot: columns end

/** 양식 첫 줄 값(열 순서대로). 열 안내 표의 "예" */
export const EXAMPLE = JOURNAL_IMPORT_TEMPLATE_ROWS[0] ?? [];

// slot: rules — 채권 · 채무 계정은 거래처가 있어야 거래처 원장에 쌓인다(전표 입력 블록과 같은 목록). 적요 최대 글자
const NEEDS_PARTY = new Set(['1080', '1200', '1310', '2510', '2530']);
const MEMO_MAX = 40;
// slot: rules end

export const FIELD_LABEL = Object.fromEntries(COLUMNS.map((c) => [c.key, c.name])) as Record<
  FieldKey,
  string
>;

export interface ImportRow {
  /** 행 key(파일의 줄 번호) */
  key: string;
  /** 파일의 줄 번호(머리 = 1) */
  line: number;
  voucher: string;
  date: string;
  code: string;
  account: string;
  party: string;
  debitText: string;
  creditText: string;
  memo: string;
  debit: number;
  credit: number;
}

export interface RowIssue {
  id: string;
  rowKey: string;
  level: 'error' | 'warning';
  tag: string;
  title: string;
  message: string;
}

export interface CheckedRow extends ImportRow {
  /** 반영할 수 있는 행(자기 줄과 전표에 오류 없음) */
  ok: boolean;
  /** 틀린 칸 */
  invalid: readonly FieldKey[];
  /** 경고 칸 */
  warned: readonly FieldKey[];
}

export interface ImportResult {
  rows: readonly CheckedRow[];
  issues: readonly RowIssue[];
  /** 전표번호 → 통과 여부 */
  vouchers: ReadonlyMap<string, boolean>;
}

/** 머리 줄에서 열 위치를 찾는다. 필수 열이 없으면 고칠 방법을 한 문장으로 돌려준다 */
export function readTable(
  table: readonly (readonly string[])[],
): { rows: ImportRow[] } | { error: string } {
  const [head, ...body] = table;
  if (!head || body.length === 0)
    return { error: '읽을 행이 없습니다. 머리 줄 아래에 전표 줄을 쓰고 다시 고르세요' };
  const at = new Map(COLUMNS.map((c) => [c.key, head.findIndex((h) => h.trim() === c.name)]));
  const missing = COLUMNS.filter((c) => c.required && at.get(c.key)! < 0).map((c) => c.name);
  if (missing.length)
    return {
      error: `필수 열 ${josa(missing.join(' · '), '이/가')} 없습니다. 양식을 다운로드해 머리 글자를 맞추세요`,
    };
  const get = (r: readonly string[], k: FieldKey) =>
    (at.get(k)! >= 0 ? (r[at.get(k)!] ?? '') : '').trim();
  return {
    rows: body.map((r, i) => {
      const debitText = get(r, 'debit');
      const creditText = get(r, 'credit');
      return {
        key: String(i + 2),
        line: i + 2,
        voucher: get(r, 'voucher'),
        date: get(r, 'date'),
        code: get(r, 'code'),
        account: get(r, 'account'),
        party: get(r, 'party'),
        debitText,
        creditText,
        memo: get(r, 'memo'),
        debit: parseAmount(debitText) ?? 0,
        credit: parseAmount(creditText) ?? 0,
      };
    }),
  };
}

/** 2026-11-02 · 2026.11.2 · 2026/11/02 → 2026-11-02. 없는 날짜(11월 31일)는 null */
export function parseDate(text: string): string | null {
  const m = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/.exec(text.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d)
    return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 금액 칸: 비면 0, 쉼표 · 공백 · "원"은 떼고 0 이상 정수만. 숫자가 아니면 null */
export function parseAmount(text: string): number | null {
  const t = text.replace(/[\s,원]/g, '');
  if (t === '') return 0;
  return /^\d+$/.test(t) ? Number(t) : null;
}

/** 전표 업로드 검증: 칸마다 확인하고, 전표번호로 묶어 차변 합계 = 대변 합계를 본다 */
export function checkRows(rows: readonly ImportRow[]): ImportResult {
  const issues: RowIssue[] = [];
  const invalid = new Map<string, Set<FieldKey>>(rows.map((r) => [r.key, new Set()]));
  const warned = new Map<string, Set<FieldKey>>(rows.map((r) => [r.key, new Set()]));
  const add = (
    r: ImportRow,
    field: FieldKey,
    level: RowIssue['level'],
    title: string,
    message: string,
  ) => {
    (level === 'error' ? invalid : warned).get(r.key)!.add(field);
    issues.push({
      id: `${r.key}-${field}`,
      rowKey: r.key,
      level,
      tag: `${r.line}행 · ${FIELD_LABEL[field]}`,
      title,
      message,
    });
  };
  const partyNames = new Set(PARTIES.map((p) => p.name));
  for (const r of rows) {
    if (!r.voucher)
      add(r, 'voucher', 'error', '전표번호가 비어 있습니다', '같은 전표의 줄에 같은 번호를 쓰세요');
    if (!r.date) add(r, 'date', 'error', '일자가 비어 있습니다', '일자를 YYYY-MM-DD로 쓰세요');
    else if (!parseDate(r.date))
      add(
        r,
        'date',
        'error',
        `${josa(r.date, '은/는')} 없는 날짜입니다`,
        '일자를 YYYY-MM-DD로 고쳐 다시 업로드하세요',
      );
    const account = accountByCode(r.code);
    if (!r.code) add(r, 'code', 'error', '계정코드가 비어 있습니다', '계정과목 표의 코드를 쓰세요');
    else if (!account)
      add(
        r,
        'code',
        'error',
        `계정코드 ${josa(r.code, '은/는')} 없는 코드입니다`,
        `계정과목 표의 코드로 고치세요. 쓸 수 있는 코드는 ${ACCOUNTS.length}개입니다`,
      );
    const debit = parseAmount(r.debitText);
    const credit = parseAmount(r.creditText);
    if (debit === null)
      add(
        r,
        'debit',
        'error',
        '차변 금액이 숫자가 아닙니다',
        '원 단위 숫자로 쓰세요. 쉼표는 써도 됩니다',
      );
    if (credit === null)
      add(
        r,
        'credit',
        'error',
        '대변 금액이 숫자가 아닙니다',
        '원 단위 숫자로 쓰세요. 쉼표는 써도 됩니다',
      );
    if (debit !== null && credit !== null) {
      if (debit > 0 && credit > 0) {
        add(
          r,
          'debit',
          'error',
          '한 줄에 차변과 대변이 함께 있습니다',
          '줄을 둘로 나눠 한쪽에만 금액을 쓰세요',
        );
        invalid.get(r.key)!.add('credit');
      } else if (debit === 0 && credit === 0)
        add(r, 'debit', 'error', '차변 · 대변이 모두 비어 있습니다', '한쪽에 금액을 쓰세요');
    }
    if (r.party && !partyNames.has(r.party))
      add(
        r,
        'party',
        'error',
        `거래처 ${josa(r.party, '을/를')} 찾을 수 없습니다`,
        '거래처 관리에서 등록한 뒤 다시 업로드하세요',
      );
    else if (!r.party && account && NEEDS_PARTY.has(account.code))
      add(
        r,
        'party',
        'warning',
        `${account.name} 줄에 거래처가 없습니다`,
        '거래처가 없으면 거래처 원장에 쌓이지 않습니다. 이대로 반영할 수 있습니다',
      );
    if (r.memo.length > MEMO_MAX)
      add(r, 'memo', 'warning', `적요가 ${MEMO_MAX}자를 넘습니다`, `앞 ${MEMO_MAX}자만 반영합니다`);
  }
  // 전표 검증: 같은 전표번호의 줄을 묶어 차변 합계 = 대변 합계
  const groups = new Map<string, ImportRow[]>();
  for (const r of rows) if (r.voucher) groups.set(r.voucher, [...(groups.get(r.voucher) ?? []), r]);
  for (const [no, lines] of groups) {
    const debit = lines.reduce((a, r) => a + r.debit, 0);
    const credit = lines.reduce((a, r) => a + r.credit, 0);
    if (debit === credit) continue;
    // 금액이 있는 칸만 표시한다(빈 반대쪽 칸은 틀린 칸이 아니다)
    for (const r of lines) {
      if (r.debit) invalid.get(r.key)!.add('debit');
      if (r.credit) invalid.get(r.key)!.add('credit');
    }
    const first = lines[0]!;
    const last = lines[lines.length - 1]!;
    issues.push({
      id: `voucher-${no}`,
      rowKey: first.key,
      level: 'error',
      tag: `전표 ${no} · ${first.line === last.line ? first.line : `${first.line}~${last.line}`}행`,
      title: `전표 ${no}의 차변 · 대변이 맞지 않습니다`,
      message: `차변 ${formatAmount(debit, { unit: '원' })} · 대변 ${formatAmount(credit, { unit: '원' })}. ${formatAmount(Math.abs(debit - credit), { unit: '원' })} 차이를 고쳐 다시 업로드하세요`,
    });
  }
  const vouchers = new Map<string, boolean>();
  for (const r of rows) {
    const bad = invalid.get(r.key)!.size > 0 || !r.voucher;
    const id = r.voucher || `#${r.key}`;
    vouchers.set(id, (vouchers.get(id) ?? true) && !bad);
  }
  return {
    issues,
    vouchers,
    rows: rows.map((r) => ({
      ...r,
      ok: vouchers.get(r.voucher || `#${r.key}`) ?? false,
      invalid: [...invalid.get(r.key)!],
      warned: [...warned.get(r.key)!],
    })),
  };
}
