// 날짜 칸을 글자로 받는다(DateField · PeriodPicker). 표시와 값은 늘 'YYYY-MM-DD'(content.md §4).
// 브라우저 날짜 입력은 기기 언어 형식(11/05/2026 · 2026. 11. 05.)으로 보여서 쓰지 않는다.
import { useState, type ChangeEvent } from 'react';

/** 숫자만 남기고 '2026-11-05' 모양으로 하이픈을 넣는다 */
export function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

/** 다 친 있는 날이면 ISO, 덜 쳤거나 없는 날(2026-02-30)이면 undefined. 범위는 보지 않는다 */
export function readDate(text: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d)
    return undefined;
  return text;
}

/** ISO 날짜가 min 앞이면 'min', max 뒤면 'max', 안이면 null */
export function outOfRange(iso: string, min?: string, max?: string): 'min' | 'max' | null {
  if (min && iso < min) return 'min';
  if (max && iso > max) return 'max';
  return null;
}

/** 다 친 날짜면 ISO, 아직 덜 쳤거나 없는 날 · 범위 밖이면 undefined */
export function completeDate(text: string, min?: string, max?: string): string | undefined {
  const iso = readDate(text);
  if (!iso || outOfRange(iso, min, max)) return undefined;
  return iso;
}

/**
 * 글자 칸과 값을 잇는다. 다 치면 commit(ISO), 지우면 commit(null).
 * 덜 친 채로 칸을 떠나면 마지막 값으로 돌아간다.
 * min · max 밖의 날을 다 치면 값은 그대로 두고(commit 없음) outOfRange에 어느 쪽인지 남긴다.
 * 그 글자는 칸을 떠나도 남고, 안내는 범위 안 날짜를 치거나 · 칸을 비우거나 · 값이 바뀌면 걷힌다.
 */
export function useDateText(opts: {
  current: string | null;
  commit: (next: string | null) => void;
  min?: string;
  max?: string;
}) {
  const { current, commit, min, max } = opts;
  const [text, setText] = useState(current ?? '');
  const [shown, setShown] = useState(current);
  // 범위 밖 날을 다 쳤을 때 넘은 쪽과 친 날짜. 고치는 도중(덜 친 글자)에는 마지막 것을 둔다
  const [range, setRange] = useState<{ side: 'min' | 'max'; iso: string } | null>(null);
  if (current !== shown) {
    setShown(current);
    setText(current ?? '');
    setRange(null);
  }
  return {
    value: text,
    /** 범위 밖 날을 다 쳐서 값에 넣지 않은 쪽 */
    outOfRange: range?.side ?? null,
    /** 그때 친 날짜 'YYYY-MM-DD'(값에 들어가지 않았다) */
    outOfRangeDate: range?.iso ?? null,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const next = maskDate(e.target.value);
      setText(next);
      if (next === '') {
        setRange(null);
        if (current !== null) commit(null);
        return;
      }
      const iso = readDate(next);
      // 덜 친 글자: 안내는 고칠 때까지 그대로 둔다
      if (!iso) return;
      const side = outOfRange(iso, min, max);
      setRange(side ? { side, iso } : null);
      if (!side && iso !== current) commit(iso);
    },
    onBlur: () => {
      const iso = readDate(text);
      // 범위 밖 날은 조용히 되돌리지 않는다(안내와 함께 남긴다)
      if (iso && outOfRange(iso, min, max)) return;
      setRange(null);
      if (text !== (current ?? '')) setText(current ?? '');
    },
    /** 달력에서 고른 날처럼 글자 칸 밖에서 정한 값으로 글자를 맞춘다(값이 같아도 안내를 걷는다) */
    set: (iso: string | null) => {
      setText(iso ?? '');
      setRange(null);
    },
  };
}

/** 'YYYY-MM-DD' → 그날 0시(현지) */
export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}
