import { TimelineContract, type TimelineProps } from '@terracelab/trellis-contracts';
import type { CSSProperties } from 'react';
import { cx } from '../_internal/cx.js';
import { toneVars } from '../_internal/tone.js';
import { Icon } from '../Icon/Icon.js';

export function Timeline({
  items,
  dense = false,
  ariaLabel,
  id,
  testID,
  className,
}: TimelineProps & { className?: string }) {
  return (
    <ol
      className={cx('tl-timeline', className)}
      id={id}
      data-testid={testID}
      data-dense={dense || undefined}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const vars = toneVars(item.tone ?? 'neutral');
        return (
          <li
            key={item.id}
            className="tl-timeline__item"
            data-tone={item.tone ?? 'neutral'}
            style={
              {
                '--tl-timeline-accent': vars.solid,
                '--tl-timeline-accent-bg': vars.subtle,
              } as CSSProperties
            }
          >
            <span className="tl-timeline__rail" aria-hidden>
              {item.icon ? (
                <span className="tl-timeline__marker" data-kind="icon">
                  <Icon name={item.icon} />
                </span>
              ) : (
                <span className="tl-timeline__marker" data-kind="dot" />
              )}
              <span className="tl-timeline__line" />
            </span>
            <div className="tl-timeline__content">
              <p className="tl-timeline__title">{item.title}</p>
              <p className="tl-timeline__meta">
                <span className="tl-timeline__time">{item.time}</span>
                {item.actor && <span className="tl-timeline__actor">{item.actor}</span>}
              </p>
              {item.description && <p className="tl-timeline__description">{item.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
Timeline.displayName = TimelineContract.name;
