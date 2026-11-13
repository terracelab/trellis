import { SpinnerContract, type SpinnerProps } from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export function Spinner({
  size = 16,
  label: labelProp,
  id,
  testID,
  className,
}: SpinnerProps & { className?: string }) {
  const t = useMessages();
  const label = labelProp ?? t('common.loading');
  return (
    <span
      className={cx('tl-spinner', className)}
      role="status"
      id={id}
      data-testid={testID}
      data-size={size}
    >
      <span className="tl-spinner__ring" aria-hidden />
      <span className="tl-sr-only">{label}</span>
    </span>
  );
}
Spinner.displayName = SpinnerContract.name;
