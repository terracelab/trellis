import { DialogContract, type DialogProps } from '@terracelab/trellis-contracts';
import type { ReactElement, ReactNode } from 'react';
import { Dialog as D } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { trapTab } from '../_internal/focus-trap.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

export type DialogWebProps = Omit<DialogProps, 'trigger' | 'footer' | 'children'> & {
  trigger?: ReactElement;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  size = 'md',
  trigger,
  footer,
  tone = 'default',
  closable = true,
  children,
  id,
  testID,
  className,
}: DialogWebProps) {
  const t = useMessages();
  return (
    <D.Root
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      onOpenChange={(next) => onOpenChange?.(next)}
      disablePointerDismissal={tone === 'danger'}
    >
      {trigger && <D.Trigger render={trigger} />}
      <D.Portal>
        <D.Backdrop className="tl-dialog__backdrop" />
        <D.Popup
          className={cx('tl-dialog', className)}
          id={id}
          data-testid={testID}
          data-size={size}
          data-tone={tone}
          onKeyDown={trapTab}
          aria-modal="true"
        >
          <div className="tl-dialog__head">
            {tone === 'danger' && (
              <Icon name="triangle-alert" size={20} className="tl-dialog__icon" />
            )}
            <div className="tl-dialog__titles">
              <D.Title className="tl-dialog__title">{title}</D.Title>
              {description && (
                <D.Description className="tl-dialog__description">{description}</D.Description>
              )}
            </div>
            {closable && (
              <D.Close render={<IconButton icon="x" label={t('common.close')} size="sm" />} />
            )}
          </div>
          {children != null && <div className="tl-dialog__body">{children}</div>}
          {footer != null && <div className="tl-dialog__footer">{footer}</div>}
        </D.Popup>
      </D.Portal>
    </D.Root>
  );
}
Dialog.displayName = DialogContract.name;

/** 대화상자 안의 닫기 동작(취소 버튼 등)에 쓴다: <DialogClose render={<Button>취소</Button>} /> */
export const DialogClose = D.Close;
