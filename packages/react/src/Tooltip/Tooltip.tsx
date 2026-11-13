import { TooltipContract, type TooltipProps } from '@terracelab/trellis-contracts';
import { createContext, type ReactElement, type ReactNode } from 'react';
import { Tooltip as T } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';

export type TooltipWebProps = Omit<TooltipProps, 'children'> & {
  /** 포커스를 받을 수 있는 요소 하나. props와 ref를 그대로 받는 컴포넌트여야 한다(Button · IconButton) */
  children: ReactElement<Record<string, unknown>>;
  className?: string;
};

const DEFAULT_DELAY = 400;

/**
 * Tooltip이 감싼 트리거 안이면 true. IconButton · Button(disabledReason)은 스스로 툴팁을 띄우는데,
 * 바깥 Tooltip이 감쌌으면 자기 것을 띄우지 않는다(한 요소에 말풍선 둘이 겹치지 않게). 패키지 밖으로 내보내지 않는다
 */
export const TooltipTriggerContext = createContext(false);

export function Tooltip({
  content,
  children,
  side = 'top',
  delay = DEFAULT_DELAY,
  id,
  testID,
  className,
}: TooltipWebProps) {
  return (
    <T.Root>
      <TooltipTriggerContext.Provider value>
        <T.Trigger render={children} delay={delay} />
      </TooltipTriggerContext.Provider>
      <T.Portal>
        <T.Positioner className="tl-tooltip__positioner" side={side} sideOffset={4}>
          <T.Popup className={cx('tl-tooltip', className)} id={id} data-testid={testID}>
            {content}
          </T.Popup>
        </T.Positioner>
      </T.Portal>
    </T.Root>
  );
}
Tooltip.displayName = TooltipContract.name;

/** 붙어 있는 툴팁 묶음. 하나가 열린 뒤 옆 툴팁은 지연 없이 열린다 */
export function TooltipProvider({
  delay = DEFAULT_DELAY,
  children,
}: {
  delay?: number;
  children?: ReactNode;
}) {
  return <T.Provider delay={delay}>{children}</T.Provider>;
}
