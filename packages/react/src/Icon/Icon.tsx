import { IconContract, type IconProps } from '@terracelab/trellis-contracts';
import { uiIcons } from '@terracelab/trellis-icons';
import { createElement, type CSSProperties } from 'react';
import { cx } from '../_internal/cx.js';

export function Icon({
  name,
  size = 16,
  label,
  id,
  testID,
  className,
  style,
}: IconProps & { className?: string; style?: CSSProperties }) {
  const node = uiIcons[name];
  return (
    <svg
      className={cx('tl-icon', className)}
      width={size}
      height={size}
      data-size={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      id={id}
      data-testid={testID}
      style={style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {node.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
Icon.displayName = IconContract.name;
