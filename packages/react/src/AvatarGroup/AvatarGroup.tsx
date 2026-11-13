import {
  AvatarGroupContract,
  avatarGroupSlots,
  type AvatarGroupProps,
} from '@terracelab/trellis-contracts';
import { Avatar } from '../Avatar/Avatar.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export type AvatarGroupWebProps = AvatarGroupProps & { className?: string };

/** 이름 몇 개를 locale 쉼표로 잇는다(ko "김테라, 박서준" · en "Kim, Park") */
const LIST_SEPARATOR = ', ';

/**
 * 겹친 아바타 + 넘친 수 "+N"(참석자 · 참조자 · 방 멤버). 한 덩어리 그림(role="img")이고
 * 이름은 label, 없으면 "앞 이름들 외 N명". 넘친 사람 이름은 +N의 title로 보인다
 */
export function AvatarGroup({
  people,
  max = 4,
  size = 24,
  shape = 'square',
  label,
  id,
  testID,
  className,
}: AvatarGroupWebProps) {
  const t = useMessages();
  const { shown, rest } = avatarGroupSlots(people, max);
  const shownNames = shown.map((p) => p.name).join(LIST_SEPARATOR);
  const hiddenNames = people
    .slice(shown.length)
    .map((p) => p.name)
    .join(LIST_SEPARATOR);
  const name =
    label ?? (rest > 0 ? t('avatarGroup.others', { names: shownNames, count: rest }) : shownNames);
  return (
    <span
      className={cx('tl-avatar-group', className)}
      id={id}
      data-testid={testID}
      data-size={size}
      data-shape={shape}
      role="img"
      aria-label={name}
    >
      {shown.map((p, i) => (
        <span key={`${p.name}-${i}`} className="tl-avatar-group__item">
          <Avatar
            name={p.name}
            {...(p.src ? { src: p.src } : {})}
            size={size}
            shape={shape}
            decorative
          />
        </span>
      ))}
      {rest > 0 && (
        <span className="tl-avatar-group__item tl-avatar-group__more" title={hiddenNames}>
          +{rest}
        </span>
      )}
    </span>
  );
}
AvatarGroup.displayName = AvatarGroupContract.name;
