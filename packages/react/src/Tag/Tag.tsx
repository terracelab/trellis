import { TagContract, type TagProps } from '@terracelab/trellis-contracts';
import type { ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

export type TagWebProps = Omit<TagProps, 'children'> & {
  children?: ReactNode;
  className?: string;
};

/** 글자 노드 → 문자열(× 단추 이름의 기본값). 글자가 아니면 빈 글자 */
export function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  return '';
}

/**
 * 따로 서는 라벨 칩(분류 · 키워드 · 사람). 중립 색 하나다. 상태 뜻(승인 · 지연)은 Badge · StatusDot이 맡는다.
 * onRemove가 있으면 × 단추가 생긴다. 사람 칩(person)은 원 아바타 24 + 이름
 */
export function Tag({
  children,
  variant = 'subtle',
  size = 'md',
  icon,
  person,
  onRemove,
  label,
  disabled = false,
  id,
  testID,
  className,
}: TagWebProps) {
  const t = useMessages();
  const text = label ?? (nodeText(children) || person?.name || '');
  const content = children ?? person?.name;
  return (
    <span
      className={cx('tl-tag', className)}
      id={id}
      data-testid={testID}
      data-variant={variant}
      data-size={size}
      data-person={person ? '' : undefined}
      data-removable={onRemove && !disabled ? '' : undefined}
      data-state={disabled ? 'disabled' : undefined}
      aria-disabled={disabled || undefined}
    >
      {person ? (
        <Avatar
          name={person.name}
          {...(person.src ? { src: person.src } : {})}
          size={24}
          shape="circle"
          decorative
        />
      ) : (
        icon && <Icon name={icon} className="tl-tag__icon" />
      )}
      <span className="tl-tag__label">{content}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          className="tl-tag__remove tl-focusable"
          aria-label={t('tag.remove', { label: text })}
          onClick={onRemove}
        >
          <Icon name="x" />
        </button>
      )}
    </span>
  );
}
Tag.displayName = TagContract.name;
