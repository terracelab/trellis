import { AvatarContract, avatarTone, type AvatarProps } from '@terracelab/trellis-contracts';
import { Avatar as A } from '../_headless/display-extra.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

/**
 * 이니셜: 한글 이름은 성을 뺀 이름 두 글자(김테라 → 테라, 남궁민수 → 민수), 영문은 단어 머리글자 둘(Kim Tera → KT).
 * 크기와 관계없이 같은 글자다(R-T46). 작은 아바타는 글자 크기만 줄인다. 사람을 그리는 컴포넌트는 모두 이 규칙(Avatar)을 쓴다
 */
export function avatarInitials(name: string, max = 2): string {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (/^[A-Za-z]/.test(trimmed) && words.length > 1)
    return words
      .slice(0, max)
      .map((w) => w[0]!.toUpperCase())
      .join('');
  const chars = Array.from(words[0] ?? trimmed);
  if (/^[가-힣]+$/.test(words[0] ?? '') && chars.length >= 3)
    return chars.slice(-2).slice(0, max).join('');
  return chars.slice(0, max).join('').toUpperCase();
}

export function Avatar({
  name = '',
  src,
  size = 32,
  status,
  decorative = false,
  shape = 'square',
  tone,
  vacant = false,
  id,
  testID,
  className,
}: AvatarProps & { className?: string }) {
  const t = useMessages();
  if (vacant) {
    // 공석(PR-34): 점선 테두리 + 사람 아이콘. 점선만으로 말하지 않고 이름 "담당자 없음"으로 읽는다
    return (
      <span
        className={cx('tl-avatar', className)}
        id={id}
        data-testid={testID}
        data-size={size}
        data-shape={shape}
        data-vacant=""
        {...(decorative
          ? { 'aria-hidden': true }
          : { role: 'img', 'aria-label': t('avatar.vacant') })}
      >
        <span className="tl-avatar__frame">
          <Icon name="user" size={size >= 40 ? 20 : 16} className="tl-avatar__vacant-icon" />
        </span>
      </span>
    );
  }
  const statusLabel = status ? t(`avatar.${status}`) : undefined;
  const label = statusLabel ? `${name}, ${statusLabel}` : name;
  return (
    <span
      className={cx('tl-avatar', className)}
      id={id}
      data-testid={testID}
      data-size={size}
      data-shape={shape}
      data-tone={tone ?? avatarTone(name)}
      data-status={status}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      <A.Root className="tl-avatar__frame">
        {src && <A.Image className="tl-avatar__image" src={src} alt="" />}
        <A.Fallback className="tl-avatar__initials">{avatarInitials(name)}</A.Fallback>
      </A.Root>
      {status && <span className="tl-avatar__status" title={statusLabel} />}
    </span>
  );
}
Avatar.displayName = AvatarContract.name;
