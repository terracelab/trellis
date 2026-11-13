import { DividerContract, type DividerProps } from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';

export type DividerWebProps = DividerProps & { className?: string };

/**
 * 구분선. 가로줄은 묶음 사이, 세로줄은 도구 줄 · 메타 글자 사이. 색은 border.divider(subtle) · border.strong(strong).
 * 가운데 글자(label)는 가로줄에서만 그리고 separator의 이름이 된다
 */
export function Divider({
  orientation = 'horizontal',
  variant = 'subtle',
  spacing = 'none',
  label,
  decorative = false,
  id,
  testID,
  className,
}: DividerWebProps) {
  const labelled = orientation === 'horizontal' && label ? label : undefined;
  return (
    <div
      className={cx('tl-divider', className)}
      id={id}
      data-testid={testID}
      data-orientation={orientation}
      data-variant={variant}
      data-spacing={spacing}
      data-labelled={labelled ? '' : undefined}
      {...(decorative
        ? { 'aria-hidden': true }
        : {
            role: 'separator',
            'aria-orientation': orientation,
            ...(labelled ? { 'aria-label': labelled } : {}),
          })}
    >
      {labelled && (
        // separator의 자식은 읽히지 않는다(이름은 aria-label). 보이는 글자만
        <span className="tl-divider__label" aria-hidden="true">
          {labelled}
        </span>
      )}
    </div>
  );
}
Divider.displayName = DividerContract.name;
