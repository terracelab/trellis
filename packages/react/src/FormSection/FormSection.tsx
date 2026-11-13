import { FormSectionContract, type FormSectionProps } from '@terracelab/trellis-contracts';
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

/** 칸 안 입력 중 값이 들어간 수(글자 · 고른 값 · 체크) */
function countFilled(root: HTMLElement): number {
  let n = 0;
  root.querySelectorAll<HTMLElement>('.tl-field').forEach((field) => {
    const controls = field.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('input:not([type="hidden"]), textarea, select');
    const hidden = field.querySelector<HTMLInputElement>('input[type="hidden"]');
    const filled =
      [...controls].some((c) =>
        c instanceof HTMLInputElement && (c.type === 'checkbox' || c.type === 'radio')
          ? c.checked
          : c.value.trim() !== '',
      ) ||
      (hidden ? hidden.value !== '' : false) ||
      // 단추 모양 입력(좁은 화면 CodeSearch 등)은 값이 있으면 data-filled를 단다
      !!field.querySelector('[data-filled]');
    if (filled) n += 1;
  });
  return n;
}

const hasErrorIn = (root: HTMLElement) =>
  !!root.querySelector('.tl-field[data-state="error"], [aria-invalid="true"]');

export function FormSection({
  title,
  description,
  columns = 2,
  action,
  collapsible = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  id,
  testID,
  className,
}: Omit<FormSectionProps, 'action' | 'children'> & {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const t = useMessages();
  const contentId = useId();
  const titleId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = !collapsible || (openProp ?? innerOpen);
  const [filled, setFilled] = useState(0);
  const hadError = useRef(false);
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  // 접힌 묶음 안에 오류가 새로 생기면(검증 뒤) 저절로 펼친다. 숨은 오류를 남기지 않는다
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!collapsible || !el) return;
    const error = hasErrorIn(el);
    if (error && !hadError.current && !open) setOpen(true);
    hadError.current = error;
    setFilled(countFilled(el));
  });

  const grid = (
    <div className="tl-form-section__grid" data-columns={columns}>
      {children}
    </div>
  );

  return (
    <fieldset
      className={cx('tl-form-section', className)}
      id={id}
      data-testid={testID}
      // legend가 머리 줄(div) 안에 있어 fieldset 이름이 되지 않는다. 제목을 이름으로 잇는다
      aria-labelledby={title ? titleId : undefined}
      data-collapsible={collapsible || undefined}
      data-open={collapsible ? open : undefined}
    >
      {(title || action != null) && (
        <div className="tl-form-section__head">
          {title &&
            (collapsible ? (
              <legend className="tl-form-section__title">
                <button
                  type="button"
                  className="tl-form-section__toggle tl-focusable"
                  aria-expanded={open}
                  aria-controls={contentId}
                  onClick={() => setOpen(!open)}
                >
                  <Icon name="chevron-right" className="tl-form-section__chevron" />
                  <span id={titleId}>{title}</span>
                  {!open && filled > 0 && (
                    <span className="tl-form-section__filled">
                      {t('formSection.filled', { count: filled })}
                    </span>
                  )}
                </button>
              </legend>
            ) : (
              <legend className="tl-form-section__title" id={titleId}>
                {title}
              </legend>
            ))}
          {action != null && <div className="tl-form-section__action">{action}</div>}
        </div>
      )}
      {collapsible ? (
        // 접어도 입력은 그대로 두고(값이 남는다) inert로 포커스 · 낭독에서 뺀다
        <div
          ref={contentRef}
          id={contentId}
          className="tl-form-section__collapse"
          inert={!open}
          onInput={() => contentRef.current && setFilled(countFilled(contentRef.current))}
        >
          <div className="tl-form-section__collapse-inner">
            {description && <p className="tl-form-section__description">{description}</p>}
            {grid}
          </div>
        </div>
      ) : (
        <>
          {description && <p className="tl-form-section__description">{description}</p>}
          {grid}
        </>
      )}
    </fieldset>
  );
}
FormSection.displayName = FormSectionContract.name;
