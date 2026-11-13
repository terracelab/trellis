// 칸 편집. 평소에는 값이 보이는 단추이고, 누르거나 Enter를 치면 입력 칸이 된다.
// Enter 저장 · Esc 취소 · 칸을 떠나면 저장(값이 틀리면 원래대로). 틀린 값은 칸 아래에 이유를 보인다.
import { formatAmount, type DataGridEditor } from '@terracelab/trellis-contracts';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { completeDate, maskDate } from '../_internal/date-text.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import type { DataGridWebColumn } from './DataGrid.js';
import { editorOf } from './model.js';

function toDraft(value: unknown, editor: DataGridEditor): string {
  if (value == null) return '';
  if (editor === 'amount' && Number.isFinite(Number(value))) return formatAmount(Number(value));
  return String(value);
}

type Parsed = { ok: true; value: unknown } | { ok: false; message: string };

function parseDraft(text: string, editor: DataGridEditor, t: Translate): Parsed {
  const s = text.trim();
  switch (editor) {
    case 'number':
    case 'amount': {
      if (s === '') return { ok: true, value: null };
      const n = Number(s.replace(/[,\s원₩]/g, ''));
      return Number.isFinite(n)
        ? { ok: true, value: n }
        : { ok: false, message: t('dataGrid.invalidNumber') };
    }
    case 'date': {
      if (s === '') return { ok: true, value: null };
      const iso = completeDate(maskDate(s));
      return iso ? { ok: true, value: iso } : { ok: false, message: t('dataGrid.invalidDate') };
    }
    default:
      return { ok: true, value: text };
  }
}

export interface EditCellProps<T> {
  row: T;
  column: DataGridWebColumn<T>;
  value: unknown;
  /** 평소 보이는 내용(서식 · render 결과) */
  display: ReactNode;
  /** 단추 이름 끝에 붙이는 숨은 글자(저장 전 칸 "저장 전", PR-30) */
  hint?: string;
  /** grid(키보드 칸 이동)에서는 -1로 그리고 지금 칸만 표가 0으로 올린다(PR-30) */
  tabIndex?: number;
  onCommit: (value: unknown) => void;
}

export function EditCell<T>({
  row,
  column,
  value,
  display,
  hint,
  tabIndex,
  onCommit,
}: EditCellProps<T>) {
  const t = useMessages();
  const editor = editorOf(column);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  // Enter로 저장한 뒤 입력 칸이 사라지며 blur가 한 번 더 오면 두 번 저장된다. 끝난 편집은 무시한다
  const closed = useRef(true);
  const errorId = useId();

  useEffect(() => {
    if (!editing && returnFocus.current) {
      returnFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [editing]);

  const start = () => {
    setDraft(toDraft(value, editor));
    setError(null);
    closed.current = false;
    setEditing(true);
  };
  const finish = (focusBack: boolean) => {
    closed.current = true;
    returnFocus.current = focusBack;
    setEditing(false);
    setError(null);
  };
  const commit = (text: string, focusBack: boolean): boolean => {
    if (closed.current) return true;
    const parsed = parseDraft(text, editor, t);
    if (!parsed.ok) {
      setError(parsed.message);
      return false;
    }
    const message = column.validate?.(parsed.value, row);
    if (message) {
      setError(message);
      return false;
    }
    finish(focusBack);
    if (!Object.is(parsed.value, value) && !(parsed.value == null && value == null))
      onCommit(parsed.value);
    return true;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      commit(e.currentTarget.value, true);
    } else if (e.key === 'Escape') {
      // 표가 Drawer · Dialog 안에 있어도 Esc는 편집만 취소한다
      e.preventDefault();
      e.stopPropagation();
      finish(true);
    }
  };

  if (!editing) {
    return (
      <button
        ref={triggerRef}
        type="button"
        className="tl-data-grid__edit tl-focusable"
        tabIndex={tabIndex}
        onClick={start}
      >
        <span className="tl-data-grid__edit-value">{display}</span>
        <span className="tl-sr-only">
          , {t('dataGrid.edit', { column: column.header })}
          {hint && `, ${hint}`}
        </span>
      </button>
    );
  }

  const common = {
    className: 'tl-data-grid__editor',
    'aria-label': column.header,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    autoFocus: true,
    onKeyDown,
  } as const;

  return (
    <>
      {editor === 'select' ? (
        <select
          {...common}
          value={draft}
          onChange={(e) => commit(e.currentTarget.value, true)}
          onBlur={() => {
            if (!closed.current) finish(false);
          }}
        >
          {draft === '' && <option value="">–</option>}
          {column.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type="text"
          inputMode={editor === 'number' || editor === 'amount' ? 'decimal' : undefined}
          placeholder={editor === 'date' ? 'YYYY-MM-DD' : undefined}
          data-editor={editor}
          value={draft}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            setDraft(editor === 'date' ? maskDate(e.currentTarget.value) : e.currentTarget.value);
            if (error) setError(null);
          }}
          // 칸을 떠나면 저장. 틀린 값이면 원래대로 돌린다
          onBlur={(e) => {
            if (!closed.current && !commit(e.currentTarget.value, false)) finish(false);
          }}
        />
      )}
      {error && (
        <span id={errorId} className="tl-data-grid__edit-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
