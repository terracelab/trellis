import {
  formatCount,
  SegmentedControlContract,
  type SegmentedControlProps,
} from '@terracelab/trellis-contracts';
import { Radio, RadioGroup as RG } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth = false,
  disabled,
  name,
  label,
  id,
  testID,
  className,
}: SegmentedControlProps & { className?: string }) {
  const t = useMessages();
  const field = useFieldControl({ id, disabled });
  return (
    <RG
      className={cx('tl-segmented-control', className)}
      id={field.id}
      data-testid={testID}
      data-size={size}
      data-full={fullWidth || undefined}
      data-state={field.disabled ? 'disabled' : undefined}
      {...(value !== undefined
        ? { value }
        : { defaultValue: defaultValue ?? options[0]?.value ?? null })}
      onValueChange={(v) => onChange?.(v as string)}
      disabled={field.disabled}
      name={name}
      aria-labelledby={field.labelId}
      aria-label={field.labelId ? undefined : label}
      aria-describedby={field.describedBy}
      aria-orientation="horizontal"
    >
      {options.map((o) => (
        <Radio.Root
          key={o.value}
          value={o.value}
          className="tl-segmented-control__segment tl-focusable"
        >
          {o.icon && <Icon name={o.icon} size={16} />}
          <span className="tl-segmented-control__label">{o.label}</span>
          {o.count != null && (
            <>
              {/* 칸 이름을 "진행 12건"으로 읽게 띄어 쓴다(flex 안의 공백은 화면에 안 보인다) */}{' '}
              <span className="tl-segmented-control__count">
                {formatCount(o.count)}
                <span className="tl-sr-only">{t('common.itemsSuffix')}</span>
              </span>
            </>
          )}
        </Radio.Root>
      ))}
    </RG>
  );
}
SegmentedControl.displayName = SegmentedControlContract.name;
