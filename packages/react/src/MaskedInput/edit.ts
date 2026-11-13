// 화면 글자 편집 → 숫자 값 편집. 가린 칸(●)이 있으면 화면 글자에서 숫자를 다시 읽을 수 없으므로
// 편집 전 · 뒤 화면 글자를 비교해 바뀐 구간을 찾고, 그 구간을 숫자 값에 똑같이 적용한다.
import { RRN_MASK_CHAR } from '@terracelab/trellis-contracts';

/** 숫자 한 자리를 차지하는 글자(숫자 또는 가림 글자). 나머지는 구분 글자 */
const isSlot = (ch: string | undefined) =>
  ch !== undefined && (/\d/.test(ch) || ch === RRN_MASK_CHAR);

/** 글자 안의 숫자 칸 수 */
export function countSlots(text: string): number {
  let n = 0;
  for (const ch of text) if (isSlot(ch)) n += 1;
  return n;
}

/** 숫자 칸 count개 뒤의 자리(서식 글자 안) */
export function caretAfterSlots(text: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (isSlot(text[i])) seen += 1;
    if (seen === count) return i + 1;
  }
  return text.length;
}

/** 숫자 칸 index 이후(hideFrom부터)를 가림 글자로. peek 자리는 그대로 둔다(방금 친 숫자) */
export function hideDigits(
  formatted: string,
  hideFrom: number,
  peek: number | null = null,
): string {
  let i = -1;
  let out = '';
  for (const ch of formatted) {
    if (/\d/.test(ch)) {
      i += 1;
      out += i >= hideFrom && i !== peek ? RRN_MASK_CHAR : ch;
    } else out += ch;
  }
  return out;
}

export interface EditInput {
  /** 편집 전 화면 글자 */
  before: string;
  /** 편집 전 숫자 값 */
  raw: string;
  /** 편집 뒤 화면 글자(브라우저가 바꾼 input.value) */
  after: string;
  /** 편집 뒤 커서 자리(input.selectionStart) */
  caret: number;
  /** InputEvent.inputType. 구분 글자만 지웠을 때 Backspace · Delete를 가른다 */
  inputType?: string;
}

export interface EditResult {
  /** 새 숫자 값(자리 수는 아직 자르지 않는다) */
  raw: string;
  /** 편집이 시작된 숫자 칸 */
  at: number;
  /** 새로 들어간 숫자 수 */
  inserted: number;
  /** 커서 앞의 숫자 칸 수 */
  caretSlots: number;
}

/**
 * 커서 뒤 글자는 편집 전과 같다고 보고(브라우저는 넣은 글자 끝에 커서를 둔다) 그만큼을 끝에서 고정한 뒤,
 * 앞에서 같은 글자를 걷어 바뀐 구간을 찾는다. 같은 ●가 이어져 있어도 커서로 자리를 정하므로 지운 칸이 맞다.
 */
export function applyEdit({ before, raw, after, caret, inputType }: EditInput): EditResult {
  let suffix = Math.min(Math.max(0, after.length - caret), before.length);
  while (suffix > 0 && before.slice(before.length - suffix) !== after.slice(after.length - suffix))
    suffix -= 1;
  const limit = Math.min(before.length - suffix, after.length - suffix);
  let prefix = 0;
  while (prefix < limit && before[prefix] === after[prefix]) prefix += 1;
  const removed = before.slice(prefix, before.length - suffix);
  const digits = after.slice(prefix, after.length - suffix).replace(/\D/g, '');
  let at = countSlots(before.slice(0, prefix));
  let removedSlots = countSlots(removed);
  // 구분 글자만 지웠으면 Backspace는 그 앞 숫자, Delete는 그 뒤 숫자를 지운다(지운 '-'가 다시 생기지 않게)
  if (removedSlots === 0 && digits.length === 0 && removed.length > 0) {
    if (inputType === 'deleteContentForward') removedSlots = at < raw.length ? 1 : 0;
    else if (at > 0) {
      at -= 1;
      removedSlots = 1;
    }
  }
  return {
    raw: raw.slice(0, at) + digits + raw.slice(at + removedSlots),
    at,
    inserted: digits.length,
    caretSlots: at + digits.length,
  };
}
