import {
  ErrorSummaryContract,
  type ErrorSummaryItem,
  type ErrorSummaryProps,
} from '@terracelab/trellis-contracts';
import { useEffect, useId, useRef } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

/** 칸으로 포커스를 옮기고 가운데로 보인다. 입력을 감싼 Field가 있으면 Field째로 보인다 */
export function focusField(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus({ preventScroll: true });
  (el.closest('.tl-field') ?? el).scrollIntoView?.({ block: 'center' });
}

export function ErrorSummary({
  errors,
  title,
  focusKey,
  onSelect,
  id,
  testID,
  className,
}: ErrorSummaryProps & { className?: string }) {
  const t = useMessages();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const has = errors.length > 0;
  // 제출할 때마다(focusKey가 바뀔 때) 오류가 있으면 요약으로 온다.
  // 의존 목록에 errors를 넣지 않는다: 칸을 고칠 때마다 포커스를 뺏으면 안 된다
  const hasRef = useRef(has);
  hasRef.current = has;
  useEffect(() => {
    if (focusKey === undefined || !hasRef.current) return;
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView?.({ block: 'start' });
  }, [focusKey]);
  if (!has) return null;
  const select = (item: ErrorSummaryItem) => (onSelect ? onSelect(item) : focusField(item.id));
  return (
    <div
      ref={ref}
      className={cx('tl-error-summary', 'tl-focusable', className)}
      id={id}
      data-testid={testID}
      role="alert"
      tabIndex={-1}
      aria-labelledby={titleId}
    >
      <div className="tl-error-summary__head">
        <Icon name="circle-alert" className="tl-error-summary__icon" />
        <h2 className="tl-error-summary__title" id={titleId}>
          {title ?? t('errorSummary.title', { count: errors.length })}
        </h2>
      </div>
      <ul className="tl-error-summary__list">
        {errors.map((e) => (
          <li key={e.id}>
            <a
              className="tl-error-summary__link tl-focusable"
              href={`#${e.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                select(e);
              }}
            >
              <span className="tl-error-summary__label">{e.label}</span> · {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
ErrorSummary.displayName = ErrorSummaryContract.name;
