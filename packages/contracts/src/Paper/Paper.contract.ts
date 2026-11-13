import { defineContract, type ContractBase } from '../_base.js';
import type { ColumnWidth } from '../DataGrid/DataGrid.contract.js';
import type { Locale } from '../_shared/messages.js';

/** 종이 크기(ISO 216). 치수는 토큰 paper.size.* */
export type PaperSize = 'a4' | 'a5';
export type PaperOrientation = 'portrait' | 'landscape';
/** 종이 안쪽 여백. 토큰 paper.margin.* */
export type PaperMargin = 'sm' | 'md';
/** compact = 표 행 · 칸 안쪽 · 서명 자리를 줄여 칸이 많은 서식(원천징수영수증)을 한 장에 넣는다 */
export type PaperDensity = 'regular' | 'compact';

/** 종이 한 장. 앱 테마 · 밀도와 관계없이 흰 바탕 · 검은 글자(paper.* 토큰) */
export interface PaperProps extends ContractBase {
  size?: PaperSize;
  orientation?: PaperOrientation;
  margin?: PaperMargin;
  density?: PaperDensity;
  /** 쪽의 접근성 이름(재직증명서 · 근로계약서 2쪽) */
  label: string;
  /** 위 줄(발급 번호 · 발급처). 작은 보조 글자, 양 끝 정렬 */
  header?: unknown;
  /** 아래 줄(진위 확인 · 근거). 쪽 맨 아래에 붙는다 */
  footer?: unknown;
  /** 한 쪽의 내용. 여러 쪽이면 Paper를 여러 개 둔다 */
  children?: unknown;
  /**
   * 내용이 종이 한 장 높이를 넘거나 다시 들어올 때(true = 넘침). 처음 잰 값이 넘침이면 그때 한 번 부른다.
   * 넘친 종이는 data-overflow 속성도 단다. 잴 수 없는 환경(서버 렌더 · jsdom)에서는 부르지 않는다
   */
  onOverflowChange?: (overflow: boolean) => void;
}

/* ── 서식 조각(같은 폴더 · 같은 entry). contract 메타는 Paper 하나, 조각 props는 spec 해부 표 ── */

/** 칸 표의 한 줄. full이면 값이 한 줄을 다 쓴다(주소 · 기간) */
export interface PaperFieldRow {
  /** 명사, 콜론 없음 */
  label: string;
  value: unknown;
  full?: boolean;
  /** 인쇄한 뒤 손으로 적는 칸(수령일 · 서명). 값이 비어도 –를 넣지 않고 빈 칸으로 둔다 */
  blank?: boolean;
}

/** 이름 | 값 | 이름 | 값 칸 표(인적 사항 · 회사 · 재직 사항) */
export interface PaperFieldsProps {
  /** 묶음 제목(h2). 있으면 표 이름이 된다 */
  title?: string;
  /** 표 위 작은 설명(단위 · 기준). 표의 설명으로 연결된다 */
  note?: unknown;
  rows: readonly PaperFieldRow[];
  /** 4 = 이름 | 값 | 이름 | 값(두 줄씩 짝), 2 = 이름 | 값 */
  columns?: 2 | 4;
}

export interface PaperMoneyColumn {
  header: string;
  /** colgroup 폭. auto는 남는 폭 */
  width?: ColumnWidth;
  /** 기본: 숫자 칸 오른쪽, 그 밖 왼쪽 */
  align?: 'left' | 'center' | 'right';
}

/** 금액 표. 숫자 칸은 천 단위 · 오른쪽 정렬 · tabular */
export interface PaperMoneyTableProps {
  title?: string;
  note?: unknown;
  columns: readonly PaperMoneyColumn[];
  /** 줄마다 columns와 같은 순서의 칸. number는 formatAmount */
  rows: readonly (readonly unknown[])[];
  /** 합계 줄. 첫 칸은 이름(행 머리) */
  total?: readonly unknown[];
  /**
   * 앞 쪽에서 넘어온 합계 줄(여러 쪽으로 나눈 표의 둘째 쪽부터). 본문 맨 위에 굵게 그린다.
   * 첫 칸이 null이면 사전 paper.carryIn("앞 쪽 이월"). paginateMoneyRows가 만든다
   */
  carryIn?: readonly unknown[];
  /**
   * 다음 쪽으로 넘기는 합계 줄(마지막 쪽 앞까지). 합계 줄 자리(tfoot)에 그린다.
   * 첫 칸이 null이면 사전 paper.carryOut("다음 쪽 이월")
   */
  carryOut?: readonly unknown[];
}

/** paginateMoneyRows 옵션. 쪽마다 들어갈 줄 수는 앱이 정한다(서식마다 제목 · 칸 표 높이가 다르다) */
export interface PaginateMoneyRowsOptions {
  /** 첫 쪽에 넣을 줄 수. 제목 · 칸 표가 있어 보통 다음 쪽보다 적다. 1 이상 */
  first: number;
  /** 둘째 쪽부터 쪽마다 넣을 줄 수. 기본 first */
  rest?: number;
  /** 쪽마다 더해 이월할 열 번호(0부터). 금액 · 세액 열만 고른다(단가 · 세율은 더하지 않는다). 0번 열은 이름 칸이라 뺀다 */
  sum: readonly number[];
}

/** 나눈 표의 한 쪽. carryIn · carryOut을 그대로 PaperMoneyTable에 넘긴다 */
export interface PaperMoneyPage<Row extends readonly unknown[] = readonly unknown[]> {
  /** 1부터 */
  page: number;
  pages: number;
  rows: Row[];
  /** 앞 쪽까지의 누계 줄. 첫 쪽은 undefined. 첫 칸 null(사전 문구), 더하지 않는 열은 '' */
  carryIn?: (number | string | null)[];
  /** 이 쪽까지의 누계 줄. 마지막 쪽은 undefined(그 자리에 앱의 total) */
  carryOut?: (number | string | null)[];
}

/** 소수 자릿수(1.25 → 2). 더한 값의 부동소수 오차를 이 자리에서 자른다 */
const decimals = (n: number) => (String(n).split('.')[1] ?? '').length;

/**
 * 긴 금액 표를 쪽마다 나눈다. 둘째 쪽부터 앞 쪽까지의 누계를 carryIn, 마지막 쪽 앞까지는 그 쪽까지의
 * 누계를 carryOut으로 붙인다. 쪽마다 PaperMoneyTable(같은 columns)을 그리면 머리 줄은 쪽마다 다시 나온다.
 * 줄 높이를 재지 않는 결정적 계산이라 인쇄 · 서버 렌더에서도 같다. 넘치면 Paper의 onOverflowChange로 안다.
 */
export function paginateMoneyRows<Row extends readonly unknown[]>(
  rows: readonly Row[],
  options: PaginateMoneyRowsOptions,
): PaperMoneyPage<Row>[] {
  // 1 미만 · NaN은 1. 잘못된 값이 줄을 버리게 두지 않는다(slice(0, NaN)은 빈 배열). Infinity는 한 쪽에 전부
  const count = (n: number) => (Number.isNaN(n) ? 1 : Math.max(1, Math.floor(n)));
  const first = count(options.first);
  const rest = count(options.rest ?? options.first);
  const sumCols = [...new Set(options.sum)].filter((c) => Number.isInteger(c) && c > 0);
  const width = rows.reduce((w, row) => Math.max(w, row.length), 0);

  const chunks: Row[][] = [rows.slice(0, first)];
  for (let i = first; i < rows.length; i += rest) chunks.push(rows.slice(i, i + rest));

  const totals = new Map<number, { value: number; places: number }>(
    sumCols.map((c) => [c, { value: 0, places: 0 }]),
  );
  const carryRow = () =>
    Array.from({ length: width }, (_, c) => {
      if (c === 0) return null;
      const t = totals.get(c);
      return t ? Number(t.value.toFixed(t.places)) : '';
    });

  return chunks.map((chunk, i) => {
    const page: PaperMoneyPage<Row> = { page: i + 1, pages: chunks.length, rows: chunk };
    if (i > 0) page.carryIn = carryRow();
    for (const row of chunk)
      for (const [c, t] of totals) {
        const v = row[c];
        if (typeof v !== 'number' || !Number.isFinite(v)) continue;
        t.places = Math.max(t.places, decimals(v));
        t.value += v;
      }
    if (i < chunks.length - 1) page.carryOut = carryRow();
    return page;
  });
}

/** 문서 제목(h1). 가운데 · 자간 */
export interface PaperTitleProps {
  children?: unknown;
  /** 제목 아래 한 줄(귀속 연월 · 공급자 보관용) */
  subtitle?: unknown;
}

/** 문단. statement = 가운데 확인 문장(위 사실을 증명합니다), note = 작은 주석(근거 법령) */
export interface PaperTextProps {
  variant?: 'body' | 'statement' | 'note';
  children?: unknown;
}

/** 직인 자리: 이미지가 있으면 "(인)" 위에 찍고, 없으면 "(인)"만 */
export interface PaperSealProps {
  /** 직인 이미지 주소 */
  src?: string | null;
  /** 직인 주인(대체 글자 "<name> 직인") */
  name: string;
}

/** 아래 서명: 날짜 · 회사 · 대표 · 직인 */
export interface PaperSignatureProps {
  /** 'YYYY-MM-DD'면 "2026년 11월 9일", 그 밖의 글자는 그대로 */
  date?: string;
  company: string;
  /** 기본 "대표이사"(사전 paper.ceo) */
  role?: string;
  /** 대표자 이름 */
  representative: string;
  /** 직인 이미지 주소. 없으면 "(인)" */
  seal?: string | null;
}

export interface PaperSignParty {
  /** 사업주 · 근로자 */
  title: string;
  rows: readonly PaperFieldRow[];
}

/** 두 사람 서명(근로계약서 사업주 · 근로자). 날짜는 위 가운데 */
export interface PaperSignPairProps {
  date?: string;
  left: PaperSignParty;
  right: PaperSignParty;
}

/** 화면 미리보기: 종이를 부모 폭에 맞춰 비율대로 줄인다(가로 넘침 없음) */
export interface PaperPreviewProps {
  /** 미리보기 묶음 이름. 기본 "서식 미리보기" */
  label?: string;
  children?: unknown;
}

export interface PrintPapersOptions {
  /** 인쇄 창 "PDF로 저장"의 파일 이름(document.title을 잠시 바꾼다). .pdf는 떼어 낸다 */
  fileName?: string;
  /** 인쇄용 트리의 문구 언어. usePrintPapers는 지금 Provider의 locale을 넘긴다 */
  locale?: Locale;
  /**
   * 인쇄 창이 열릴 때 한 번(beforeprint). beforeprint를 보내지 않는 브라우저는 print()를 부른 직후.
   * 발급 대장 기록 · "인쇄 준비 중" 표시 끄기에 쓴다. 글꼴 · 직인을 기다리다 새 인쇄에 밀려나면 부르지 않는다
   */
  onOpen?: () => void;
  /**
   * 인쇄 창이 닫히고 정리(제목 되돌리기 · 인쇄 뿌리 떼기)가 끝난 뒤 한 번. onOpen을 부른 인쇄만 부른다.
   * afterprint가 오지 않는 브라우저는 60초 뒤. 인쇄했는지 취소했는지는 브라우저가 알려 주지 않는다
   */
  onClose?: () => void;
}

export const PaperContract = defineContract<PaperProps>({
  name: 'Paper',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    size: {
      type: "'a4' | 'a5'",
      default: 'a4',
      values: ['a4', 'a5'],
      description: '종이 크기(paper.size.*)',
    },
    orientation: {
      type: "'portrait' | 'landscape'",
      default: 'portrait',
      values: ['portrait', 'landscape'],
      description: '세로 · 가로',
    },
    margin: {
      type: "'sm' | 'md'",
      default: 'md',
      values: ['sm', 'md'],
      description: '안쪽 여백(paper.margin.*)',
    },
    density: {
      type: "'regular' | 'compact'",
      default: 'regular',
      values: ['regular', 'compact'],
      description: 'compact = 표 행 · 칸 안쪽 · 서명 자리를 줄인다(칸 많은 서식)',
    },
    label: { type: 'string', required: true, description: '쪽의 접근성 이름' },
    header: { type: 'ReactNode', description: '위 줄(발급 번호 · 발급처)' },
    footer: { type: 'ReactNode', description: '아래 줄(진위 확인 · 근거), 쪽 맨 아래' },
    children: { type: 'ReactNode', description: '한 쪽의 내용' },
    onOverflowChange: {
      type: '(overflow: boolean) => void',
      description: '내용이 종이 한 장 높이를 넘거나 다시 들어올 때(넘친 종이는 data-overflow)',
    },
  },
  states: ['default'],
  a11y: { role: 'article', keyboard: [], labelling: 'label-prop' },
  slots: ['header', 'footer'],
  platforms: { web: true, native: false },
});
