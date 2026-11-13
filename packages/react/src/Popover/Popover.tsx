import { PopoverContract, type PopoverProps } from '@terracelab/trellis-contracts';
import {
  cloneElement,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Popover as P } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { IconButton } from '../IconButton/IconButton.js';

export type PopoverWebProps = Omit<PopoverProps, 'trigger' | 'children' | 'footer'> & {
  /** 여는 요소 하나. props와 ref를 그대로 받는 버튼이어야 한다(Button · IconButton) */
  trigger: ReactElement<Record<string, unknown>>;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** 열 때 포커스를 받을 수 있는 요소(내용 안에서 첫 번째) */
const FOCUSABLE = [
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Popover({
  trigger,
  title,
  children,
  footer,
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  closable = true,
  initialFocus = 'first',
  width = 'md',
  disabled = false,
  id,
  testID,
  className,
}: PopoverWebProps) {
  const t = useMessages();
  const sheet = useSheetMode();
  const [inner, setInner] = useState(defaultOpen);
  const current = open ?? inner;
  const popupRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    if (next && disabled) return;
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };

  // 좁은 화면: 같은 트리거가 아래 시트를 연다(D-60). 제목 · 닫기는 시트 머리, footer는 시트 아래
  if (sheet) {
    const tp = trigger.props;
    return (
      <>
        {cloneElement(trigger, {
          disabled: disabled || tp['disabled'] || undefined,
          'aria-haspopup': 'dialog',
          'aria-expanded': current,
          onClick: (e: MouseEvent) => {
            (tp['onClick'] as ((e: MouseEvent) => void) | undefined)?.(e);
            setOpen(true);
          },
        })}
        <Sheet
          open={current}
          onOpenChange={setOpen}
          title={title}
          footer={footer}
          testID={testID}
          className={cx('tl-popover-sheet', className)}
        >
          <div className="tl-popover-sheet__body" id={id}>
            {children}
          </div>
        </Sheet>
      </>
    );
  }

  return (
    <P.Root open={current} onOpenChange={(next) => setOpen(next)}>
      <P.Trigger render={trigger} disabled={disabled} />
      <P.Portal>
        <P.Positioner className="tl-popover__positioner" side={side} align={align} sideOffset={4}>
          <P.Popup
            ref={popupRef}
            className={cx('tl-popover', className)}
            id={id}
            data-testid={testID}
            data-width={width}
            initialFocus={(type) => {
              // 터치로 열면 가상 키보드가 뜨지 않게 패널에 둔다(Base UI 기본과 같다)
              if (initialFocus === 'panel' || type === 'touch') return popupRef.current;
              return bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? popupRef.current;
            }}
          >
            <div className="tl-popover__head">
              <P.Title className="tl-popover__title">{title}</P.Title>
              {closable && (
                <P.Close render={<IconButton icon="x" label={t('common.close')} size="sm" />} />
              )}
            </div>
            {children != null && (
              <div ref={bodyRef} className="tl-popover__body">
                {children}
              </div>
            )}
            {footer != null && <div className="tl-popover__footer">{footer}</div>}
          </P.Popup>
        </P.Positioner>
      </P.Portal>
    </P.Root>
  );
}
Popover.displayName = PopoverContract.name;
