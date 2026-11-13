import { ScanFieldContract, type ScanFieldProps } from '@terracelab/trellis-contracts';
import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '../_internal/cx.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

export function ScanField({
  label,
  placeholder: placeholderProp,
  onScan,
  keepFocus = true,
  recent,
  disabled = false,
  size = 'lg',
  id,
  testID,
  className,
}: ScanFieldProps & { className?: string }) {
  const t = useMessages();
  const placeholder = placeholderProp ?? t('scanField.placeholder');
  const auto = useId();
  const inputId = id ?? `${auto}-scan`;
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [last, setLast] = useState<string | null>(null);
  useEffect(() => {
    if (!keepFocus || disabled) return;
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onBlur = () => {
      timer = setTimeout(() => {
        const active = document.activeElement;
        // 사용자가 다른 입력 칸을 쓰는 중이면 빼앗지 않는다
        if (!active || active === document.body) el.focus({ preventScroll: true });
      }, 2000);
    };
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('blur', onBlur);
      if (timer) clearTimeout(timer);
    };
  }, [keepFocus, disabled]);
  return (
    <div className={cx('tl-scan-field', className)} data-testid={testID} data-size={size}>
      <label className="tl-scan-field__label" htmlFor={inputId}>
        {label}
      </label>
      <span className="tl-scan-field__box" data-state={disabled ? 'disabled' : undefined}>
        <Icon name="scan-barcode" size={20} className="tl-scan-field__icon" />
        <input
          ref={ref}
          id={inputId}
          className="tl-scan-field__control"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          inputMode="text"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setValue('');
            if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
            e.preventDefault();
            const code = value.trim();
            if (!code) return;
            onScan?.(code);
            setLast(code);
            setValue('');
          }}
        />
        <span className="tl-scan-field__status" aria-hidden>
          <span className="tl-scan-field__dot" />
          {t('scanField.waiting')}
        </span>
      </span>
      <span className="tl-sr-only" aria-live="polite">
        {last ? t('scanField.scanned', { code: last }) : ''}
      </span>
      {recent && recent.length > 0 && (
        <ul className="tl-scan-field__recent" aria-label={t('scanField.recent')}>
          {recent.slice(0, 5).map((c, i) => (
            <li key={`${c}-${i}`}>{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
ScanField.displayName = ScanFieldContract.name;
