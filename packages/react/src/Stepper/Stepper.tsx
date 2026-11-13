import {
  formatAmount,
  StepperContract,
  type StepperProps,
  type MessageKey,
  type StepperStepState,
} from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

/** 색 · 아이콘과 함께 읽히는 상태 글자 */
const STATE_TEXT: Record<StepperStepState, MessageKey> = {
  done: 'stepper.done',
  current: 'stepper.current',
  todo: 'stepper.todo',
  error: 'stepper.error',
};

export function Stepper({
  steps,
  orientation = 'horizontal',
  size = 'md',
  label: labelProp,
  id,
  testID,
  className,
}: StepperProps & { className?: string }) {
  const t = useMessages();
  const label = labelProp ?? t('stepper.label');
  return (
    <ol
      className={cx('tl-stepper', className)}
      id={id}
      data-testid={testID}
      data-orientation={orientation}
      data-size={size}
      aria-label={label}
    >
      {steps.map((step, i) => (
        <li
          key={step.id}
          className="tl-stepper__step"
          data-status={step.state}
          aria-current={step.state === 'current' ? 'step' : undefined}
        >
          <span className="tl-stepper__marker" aria-hidden>
            {step.state === 'done' ? (
              <Icon name="check" />
            ) : step.state === 'error' ? (
              <Icon name="x" />
            ) : (
              formatAmount(i + 1)
            )}
          </span>
          <span className="tl-stepper__text">
            <span className="tl-stepper__label">
              {step.label}
              <span className="tl-sr-only"> {t(STATE_TEXT[step.state])}</span>
            </span>
            {step.description != null && (
              <span className="tl-stepper__description">{step.description}</span>
            )}
          </span>
          {i < steps.length - 1 && <span className="tl-stepper__line" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
Stepper.displayName = StepperContract.name;
