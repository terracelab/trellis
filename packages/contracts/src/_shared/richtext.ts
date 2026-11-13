// 답변 본문(RichText, PG-31)의 마크다운 일부 해석기. 웹 · 네이티브 공용 순수 함수.
// HTML을 만들지 않고 블록 · 글줄 조각 나무만 돌려준다. 그리는 쪽이 React 요소(웹) · Text(네이티브)로 바꾼다.
// 문법: 제목(#) · 문단 · 목록(- * + · 1.) · 표(GFM 파이프) · 코드 블록(```) · 인라인 코드 · 굵게(**) · 링크([글](주소)) ·
// http(s) 주소 자동 링크 · 출처 표시([1]) · 구분선(---). 그 밖의 문법은 글자 그대로 둔다.
// 쓰는 중(스트리밍)에 안전하다: 닫히지 않은 코드 블록은 그 줄부터 끝까지 꾸밈 없는 글자이고,
// 닫히지 않은 ** · ` · [ 는 글자 그대로 보인다. 다음 글자가 와서 닫히면 그때 서식이 된다.

export type RichTextAlign = 'left' | 'center' | 'right';

/** 글줄 조각 */
export type RichInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: RichInline[] }
  | { type: 'code'; text: string }
  | { type: 'link'; href: string; children: RichInline[] }
  /** 출처 표시 [1] · [^1]. 출처 목록이 없으면 그리는 쪽이 "[1]" 글자로 둔다 */
  | { type: 'cite'; index: number }
  /** 문단 안 줄바꿈(대화 답변은 줄바꿈을 그대로 보인다) */
  | { type: 'break' };

export interface RichListItem {
  children: RichInline[];
  /** 들여쓴 안쪽 목록 */
  lists: RichListBlock[];
}

export interface RichListBlock {
  type: 'list';
  ordered: boolean;
  /** 번호 목록의 첫 번호 */
  start: number;
  items: RichListItem[];
}

export interface RichTableBlock {
  type: 'table';
  head: RichInline[][];
  rows: RichInline[][][];
  /** 열마다 정렬. 구분 줄(:--- · :---: · ---:)이 정하고, 정하지 않은 숫자 열은 right(금액 우측 정렬) */
  align: RichTextAlign[];
  /** 열마다 숫자 열인가(빈 칸 · – 를 뺀 본문 칸이 모두 숫자). 숫자 열은 tabular 숫자 */
  numeric: boolean[];
}

export type RichBlock =
  /** depth 1 = 글 안에서 가장 높은 제목(# 개수가 아니라 상대 단계) */
  | { type: 'heading'; depth: number; children: RichInline[] }
  | { type: 'paragraph'; children: RichInline[] }
  | RichListBlock
  | RichTableBlock
  | { type: 'code'; lang?: string; text: string }
  /** 닫히지 않은 코드 블록: 꾸밈 없는 글자(줄바꿈 유지) */
  | { type: 'plain'; text: string }
  | { type: 'rule' };

const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)[^`]*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
/** 목록 표시. 번호는 세 자리까지(“2026. 11월”처럼 연도로 시작하는 문장을 목록으로 읽지 않게) */
const LIST = /^( *)([-*+]|\d{1,3}[.)])(?:[ \t]+(.*)|[ \t]*$)/;
const DELIM_CELL = /^:?-+:?$/;
const ESCAPABLE = '\\`*_[]()#+-.!|~>';
/** 자동 링크. 끝의 문장 부호는 링크에서 뺀다(MessageThread와 같다) */
const URL_AT = /^https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]]/i;
/** 숫자 칸: 부호 · 통화 기호 · 천 단위 쉼표 · 소수 · 짧은 단위(원 · % · %p · 건 · EA · kg) */
const NUMERIC =
  /^[+\-−±]?[₩$]?\d[\d,]*(?:\.\d+)?(?:[ ]?[%a-zA-Z가-힣]{1,3}(?:\/[a-zA-Z가-힣]{1,3})?)?$/;
const EMPTY_CELL = /^(?:|-|–|—)$/;

const isBlank = (line: string) => line.trim() === '';
const indentOf = (line: string) => /^ */.exec(line)![0].length;

/** 열어도 되는 주소만 돌려준다: http(s) · mailto · tel · 앱 안 경로(/ · #). javascript: 등은 null */
export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(h)) return h;
  if (/^\/(?!\/)/.test(h) || h.startsWith('#')) return h;
  return null;
}

function pushText(out: RichInline[], text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last?.type === 'text') last.text += text;
  else out.push({ type: 'text', text });
}

/** i의 '['와 짝인 ']' 위치(없으면 -1). 역슬래시로 막은 글자는 건너뛴다 */
function closingBracket(src: string, i: number): number {
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '\\') {
      j++;
      continue;
    }
    if (c === '[') depth++;
    else if (c === ']' && --depth === 0) return j;
  }
  return -1;
}

/** from부터 정확히 n개짜리 백틱 묶음의 시작(없으면 -1) */
function backtickRun(src: string, n: number, from: number): number {
  for (let j = from; j < src.length; j++) {
    if (src[j] !== '`') continue;
    let k = j;
    while (src[k] === '`') k++;
    if (k - j === n) return j;
    j = k;
  }
  return -1;
}

/** 한 줄의 글줄 조각. links = false면 링크 안(링크 안 링크를 만들지 않는다) */
export function parseInline(src: string, links = true): RichInline[] {
  const out: RichInline[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === '\\' && i + 1 < src.length && ESCAPABLE.includes(src[i + 1]!)) {
      pushText(out, src[i + 1]!);
      i += 2;
      continue;
    }
    if (c === '`') {
      let n = 1;
      while (src[i + n] === '`') n++;
      const close = backtickRun(src, n, i + n);
      if (close < 0) {
        pushText(out, src.slice(i, i + n));
        i += n;
        continue;
      }
      const body = src.slice(i + n, close);
      // 앞뒤 공백 한 칸씩은 백틱을 감싸려고 넣은 것이다
      const text = /^ .*[^ ].* $/.test(body) ? body.slice(1, -1) : body;
      out.push({ type: 'code', text });
      i = close + n;
      continue;
    }
    if (c === '*' && src[i + 1] === '*') {
      const close = src.indexOf('**', i + 2);
      if (close > i + 2) {
        out.push({ type: 'strong', children: parseInline(src.slice(i + 2, close), links) });
        i = close + 2;
        continue;
      }
      pushText(out, '**');
      i += 2;
      continue;
    }
    if (c === '[') {
      const end = closingBracket(src, i);
      const label = end > i ? src.slice(i + 1, end) : '';
      if (end > i && src[end + 1] === '(') {
        const close = src.indexOf(')', end + 2);
        if (close > end + 1) {
          const href = safeHref(
            src
              .slice(end + 2, close)
              .trim()
              .split(/\s+/)[0] ?? '',
          );
          if (href && links) out.push({ type: 'link', href, children: parseInline(label, false) });
          // 열면 안 되는 주소 · 링크 안 링크: 글자만 남긴다
          else for (const part of parseInline(label, false)) pushInline(out, part);
          i = close + 1;
          continue;
        }
        // 닫는 ) 가 없다(쓰는 중): 나머지는 아직 다 오지 않은 주소라 글자 그대로
        pushText(out, src.slice(i));
        break;
      } else if (end > i && /^\^?\d{1,3}$/.test(label)) {
        out.push({ type: 'cite', index: Number(label.replace('^', '')) });
        i = end + 1;
        continue;
      }
      pushText(out, c);
      i++;
      continue;
    }
    if (links && (c === 'h' || c === 'H') && (i === 0 || !/[A-Za-z0-9]/.test(src[i - 1]!))) {
      const m = URL_AT.exec(src.slice(i));
      if (m) {
        out.push({ type: 'link', href: m[0], children: [{ type: 'text', text: m[0] }] });
        i += m[0].length;
        continue;
      }
    }
    pushText(out, c);
    i++;
  }
  return out;
}

function pushInline(out: RichInline[], part: RichInline) {
  if (part.type === 'text') pushText(out, part.text);
  else out.push(part);
}

/** 여러 줄 → 조각(줄 사이 break) */
function inlineLines(lines: readonly string[]): RichInline[] {
  const out: RichInline[] = [];
  lines.forEach((line, k) => {
    if (k > 0) out.push({ type: 'break' });
    for (const part of parseInline(line.trim())) pushInline(out, part);
  });
  return out;
}

/** 표의 한 줄 → 칸 글자. 앞뒤 | 는 떼고, \| 는 칸 나눔이 아니다 */
function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = '';
  for (let j = 0; j < s.length; j++) {
    if (s[j] === '\\' && s[j + 1] === '|') {
      cur += '|';
      j++;
    } else if (s[j] === '|') {
      cells.push(cur.trim());
      cur = '';
    } else cur += s[j];
  }
  cells.push(cur.trim());
  return cells;
}

function isTableStart(lines: readonly string[], i: number): boolean {
  const head = lines[i];
  const delim = lines[i + 1];
  if (head === undefined || delim === undefined || !head.includes('|') || !delim.includes('-'))
    return false;
  const cells = splitRow(delim);
  return cells.every((c) => DELIM_CELL.test(c)) && cells.length === splitRow(head).length;
}

function startsBlock(lines: readonly string[], i: number): boolean {
  const line = lines[i]!;
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    LIST.test(line) ||
    isTableStart(lines, i)
  );
}

/** 칸 글자에서 꾸밈 표시를 뺀 것(숫자 칸 판단용) */
const bare = (cell: string) => cell.replace(/[*`\\]/g, '').trim();

function parseTable(
  lines: readonly string[],
  start: number,
): { block: RichTableBlock; next: number } {
  const headCells = splitRow(lines[start]!);
  const width = headCells.length;
  const delim = splitRow(lines[start + 1]!);
  const rowsRaw: string[][] = [];
  let i = start + 2;
  while (i < lines.length && !isBlank(lines[i]!) && lines[i]!.includes('|')) {
    const cells = splitRow(lines[i]!);
    rowsRaw.push(Array.from({ length: width }, (_, k) => cells[k] ?? ''));
    i++;
  }
  const numeric = headCells.map((_, k) => {
    const filled = rowsRaw.map((r) => bare(r[k]!)).filter((v) => !EMPTY_CELL.test(v));
    return filled.length > 0 && filled.every((v) => NUMERIC.test(v));
  });
  const align = delim.map((d, k): RichTextAlign => {
    const left = d.startsWith(':');
    const right = d.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return numeric[k] ? 'right' : 'left';
  });
  return {
    block: {
      type: 'table',
      head: headCells.map((c) => parseInline(c)),
      rows: rowsRaw.map((r) => r.map((c) => parseInline(c))),
      align,
      numeric,
    },
    next: i,
  };
}

function parseList(
  lines: readonly string[],
  start: number,
): { block: RichListBlock; next: number } {
  const first = LIST.exec(lines[start]!)!;
  const indent = first[1]!.length;
  const ordered = /\d/.test(first[2]!);
  const items: { lines: string[]; lists: RichListBlock[] }[] = [];
  let cur: (typeof items)[number] | null = null;
  let blank = false;
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (isBlank(line)) {
      blank = true;
      i++;
      continue;
    }
    const m = LIST.exec(line);
    if (m && m[1]!.length === indent) {
      if (/\d/.test(m[2]!) !== ordered) break; // 다른 종류 목록은 새 목록
      cur = { lines: [m[3] ?? ''], lists: [] };
      items.push(cur);
      blank = false;
      i++;
      continue;
    }
    if (m && m[1]!.length > indent && cur) {
      const sub = parseList(lines, i);
      cur.lists.push(sub.block);
      i = sub.next;
      blank = false;
      continue;
    }
    if (m || !cur) break; // 바깥 단계 목록
    if (indentOf(line) > indent || (!blank && !startsBlock(lines, i))) {
      // 들여쓴 줄 · 빈 줄 없이 이어진 줄은 그 항목의 글이다
      cur.lines.push(line);
      blank = false;
      i++;
      continue;
    }
    break;
  }
  return {
    block: {
      type: 'list',
      ordered,
      start: ordered ? Number.parseInt(first[2]!, 10) : 1,
      items: items.map((it) => ({ children: inlineLines(it.lines), lists: it.lists })),
    },
    next: i,
  };
}

/**
 * 마크다운 일부 → 블록 목록. 같은 글에는 늘 같은 결과(쓰는 중에 글자가 붙어도 앞 블록은 그대로다).
 *   parseRichText('## 결과\n- 미지급금 **3건**')
 */
export function parseRichText(text: string): RichBlock[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const blocks: RichBlock[] = [];
  const headings: { block: Extract<RichBlock, { type: 'heading' }>; level: number }[] = [];
  let para: string[] = [];
  const endPara = () => {
    if (para.length) blocks.push({ type: 'paragraph', children: inlineLines(para) });
    para = [];
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (isBlank(line)) {
      endPara();
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      endPara();
      const mark = fence[1]!;
      let close = -1;
      for (let j = i + 1; j < lines.length; j++) {
        const t = lines[j]!.trim();
        if (
          indentOf(lines[j]!) <= 3 &&
          t.length >= mark.length &&
          t === mark[0]!.repeat(t.length)
        ) {
          close = j;
          break;
        }
      }
      if (close < 0) {
        // 닫히지 않은 코드 블록(쓰는 중): 그 줄부터 끝까지 꾸밈 없는 글자
        blocks.push({ type: 'plain', text: lines.slice(i).join('\n').trimEnd() });
        break;
      }
      const lang = fence[2] || undefined;
      blocks.push({
        type: 'code',
        ...(lang ? { lang } : {}),
        text: lines.slice(i + 1, close).join('\n'),
      });
      i = close + 1;
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      endPara();
      const block = { type: 'heading' as const, depth: 1, children: parseInline(heading[2] ?? '') };
      headings.push({ block, level: heading[1]!.length });
      blocks.push(block);
      i++;
      continue;
    }
    if (RULE.test(line)) {
      endPara();
      blocks.push({ type: 'rule' });
      i++;
      continue;
    }
    if (LIST.test(line)) {
      endPara();
      const { block, next } = parseList(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }
    if (isTableStart(lines, i)) {
      endPara();
      const { block, next } = parseTable(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }
    para.push(line);
    i++;
  }
  endPara();
  // 제목 단계는 글 안에서 가장 높은 것을 1로 맞춘다(### 만 쓴 답변도 첫 단계 제목이 된다)
  const top = Math.min(...headings.map((h) => h.level));
  for (const h of headings) h.block.depth = h.level - top + 1;
  return blocks;
}

/** 조각 → 꾸밈 없는 글자(복사 · 접근성 이름). 출처 표시는 [1] */
export function richInlineText(parts: readonly RichInline[]): string {
  return parts
    .map((p) => {
      switch (p.type) {
        case 'text':
        case 'code':
          return p.text;
        case 'strong':
        case 'link':
          return richInlineText(p.children);
        case 'cite':
          return `[${p.index}]`;
        case 'break':
          return '\n';
      }
    })
    .join('');
}
