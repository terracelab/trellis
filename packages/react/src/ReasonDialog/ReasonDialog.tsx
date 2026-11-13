import { ReasonDialogContract, type ReasonDialogProps } from '@terracelab/trellis-contracts';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Button } from '../Button/Button.js';
import { Dialog } from '../Dialog/Dialog.js';
import { Field } from '../Field/Field.js';
import { Textarea } from '../Textarea/Textarea.js';

export type ReasonDialogWebProps = Omit<ReasonDialogProps, 'trigger'> & {
  trigger?: ReactElement;
  className?: string;
};

/** 사유 글자 수: 앞뒤 공백을 빼고 글자(코드 포인트) 단위로 센다 */
export function reasonLength(reason: string): number {
  return Array.from(reason.trim()).length;
}

const isPromise = (v: unknown): v is Promise<unknown> =>
  typeof v === 'object' && v !== null && typeof (v as Promise<unknown>).then === 'function';

export function ReasonDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  label,
  placeholder,
  confirmLabel,
  minLength = 1,
  maxLength,
  tone = 'default',
  note,
  onConfirm,
  loading = false,
  error,
  id,
  testID,
  className,
}: ReasonDialogWebProps) {
  const t = useMessages();
  const [inner, setInner] = useState(defaultOpen);
  const current = open ?? inner;
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const busy = loading || pending;
  const enough = reasonLength(reason) >= Math.max(1, minLength);

  // 비동기 확인이 끝나기 전에 사라지면 상태를 바꾸지 않는다
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const setOpen = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };

  // 닫히면(안에서든 밖에서든) 쓰던 사유와 오류를 비운다
  useEffect(() => {
    if (current) return;
    setReason('');
    setFailed(false);
    setPending(false);
  }, [current]);

  // Esc는 사유 칸이 비었을 때만 닫는다. Dialog의 Esc · 바깥 누름 닫기는 아래 onOpenChange에서 받지 않는다
  const latest = useRef({ reason, busy, setOpen });
  latest.current = { reason, busy, setOpen };
  useEffect(() => {
    if (!current) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || e.isComposing) return;
      const { reason: text, busy: working, setOpen: close } = latest.current;
      if (!working && text.trim() === '') close(false);
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [current]);

  const confirm = async () => {
    if (!enough || busy) return;
    setFailed(false);
    try {
      const result = onConfirm?.(reason.trim());
      if (isPromise(result)) {
        setPending(true);
        await result;
      }
    } catch {
      if (!alive.current) return;
      setPending(false);
      setFailed(true);
      return;
    }
    if (!alive.current) return;
    setPending(false);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void confirm();
    }
  };

  const message = error ?? (failed ? t('reasonDialog.failed') : undefined);
  const help = minLength > 1 ? t('reasonDialog.minLength', { count: minLength }) : undefined;

  return (
    <Dialog
      open={current}
      // 여는 것만 받는다. 닫기는 취소 단추와 빈 칸 Esc(위)뿐: 바깥을 눌러 쓰던 사유를 잃지 않게
      onOpenChange={(next) => {
        if (next) setOpen(true);
      }}
      {...(trigger ? { trigger } : {})}
      title={title}
      {...(description ? { description } : {})}
      size="sm"
      tone={tone}
      closable={false}
      className={cx('tl-reason-dialog', className)}
      {...(id ? { id } : {})}
      {...(testID ? { testID } : {})}
      footer={
        <>
          <Button disabled={busy} onPress={() => setOpen(false)}>
            {t('reasonDialog.cancel')}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            disabled={!enough}
            loading={busy}
            onPress={() => void confirm()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div
        className="tl-reason-dialog__body"
        data-state={busy ? 'loading' : message ? 'error' : !enough ? 'disabled' : undefined}
      >
        <Field
          label={label ?? t('reasonDialog.label')}
          required
          {...(help ? { help } : {})}
          {...(message ? { error: message } : {})}
        >
          <Textarea
            rows={4}
            value={reason}
            onChange={setReason}
            readOnly={busy}
            onKeyDown={onKeyDown}
            {...(placeholder ? { placeholder } : {})}
            {...(maxLength !== undefined ? { maxLength } : {})}
          />
        </Field>
        {note && <p className="tl-reason-dialog__note">{note}</p>}
      </div>
    </Dialog>
  );
}
ReasonDialog.displayName = ReasonDialogContract.name;
