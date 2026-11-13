import { MaskedValueContract, type MaskedValueProps } from '@terracelab/trellis-contracts';
import { useEffect, useRef, useState } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { ReasonDialog } from '../ReasonDialog/ReasonDialog.js';

export type MaskedValueWebProps = MaskedValueProps & { className?: string };

export function MaskedValue({
  value,
  label,
  onReveal,
  revealSeconds = 60,
  copyable = false,
  canReveal = true,
  lockedReason,
  id,
  testID,
  className,
}: MaskedValueWebProps) {
  const t = useMessages();
  const seconds = Math.max(1, Math.round(revealSeconds));
  // 원문은 보이는 동안만 메모리에 둔다. 다시 가리면 지운다
  const [original, setOriginal] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [asking, setAsking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const revealed = original !== null;
  const locked = !canReveal;

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const conceal = (announce = true) => {
    setOriginal(null);
    setRemaining(0);
    if (announce) setAnnouncement(t('maskedValue.concealed'));
  };

  // 1초마다 남은 시간을 줄이고 0이면 다시 가린다
  useEffect(() => {
    if (!revealed) return;
    const timer = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [revealed]);
  // conceal은 렌더마다 새로 만들어지지만 하는 일이 같아 의존 목록에 넣지 않는다
  useEffect(() => {
    if (revealed && remaining <= 0) conceal();
  }, [revealed, remaining]);

  // 다른 값(다른 사람 · 다른 칸)으로 바뀌면 보이던 원문을 바로 가린다
  const shownFor = useRef(value);
  useEffect(() => {
    if (shownFor.current === value) return;
    shownFor.current = value;
    conceal(false);
  }, [value]);

  const reveal = async (reason: string) => {
    if (!onReveal) return;
    setFailed(false);
    let text: string;
    try {
      text = await onReveal(reason);
    } catch (e) {
      if (alive.current) setFailed(true);
      throw e; // ReasonDialog가 열린 채 오류를 보이게
    }
    if (!alive.current) return;
    setOriginal(text);
    setRemaining(seconds);
    setAnnouncement(t('maskedValue.revealed', { seconds }));
  };

  const copy = async () => {
    if (original === null) return;
    try {
      await navigator.clipboard.writeText(original);
    } catch {
      return; // 권한이 없으면 알리지 않는다
    }
    if (alive.current) setAnnouncement(t('common.copied'));
  };

  return (
    <span
      className={cx('tl-masked-value', className)}
      id={id}
      data-testid={testID}
      data-revealed={revealed || undefined}
      data-state={locked ? 'disabled' : undefined}
    >
      <span className="tl-masked-value__text">{revealed ? original : value}</span>
      {locked ? (
        <span className="tl-masked-value__lock">
          <Icon name="lock" className="tl-masked-value__lock-icon" />
          {lockedReason ?? t('maskedValue.locked')}
        </span>
      ) : onReveal ? (
        <>
          {revealed && (
            <span className="tl-masked-value__timer">
              <Icon name="timer" className="tl-masked-value__timer-icon" />
              {t('maskedValue.remaining', { seconds: remaining })}
            </span>
          )}
          {revealed && copyable && (
            <IconButton
              icon="copy"
              size="sm"
              label={t('common.copy', { label })}
              onPress={() => void copy()}
            />
          )}
          {/* 보기 · 다시 가리기는 같은 단추라 포커스가 그 자리에 남는다 */}
          <IconButton
            className="tl-masked-value__toggle"
            icon={revealed ? 'eye-off' : 'eye'}
            size="sm"
            label={
              revealed ? t('maskedValue.conceal', { label }) : t('maskedValue.reveal', { label })
            }
            onPress={() => (revealed ? conceal() : setAsking(true))}
          />
          <ReasonDialog
            open={asking}
            onOpenChange={(next) => {
              setAsking(next);
              if (!next) setFailed(false);
            }}
            title={t('maskedValue.reveal', { label })}
            description={t('maskedValue.description', { seconds })}
            confirmLabel={t('maskedValue.confirm')}
            onConfirm={reveal}
            {...(failed ? { error: t('maskedValue.failed') } : {})}
          />
        </>
      ) : null}
      <span className="tl-sr-only" aria-live="polite">
        {announcement}
      </span>
    </span>
  );
}
MaskedValue.displayName = MaskedValueContract.name;
