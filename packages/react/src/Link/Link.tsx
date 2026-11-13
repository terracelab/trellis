import { isExternalHref, LinkContract, type LinkProps } from '@terracelab/trellis-contracts';
import type { ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { useLinkClick } from '../_internal/navigate.js';
import { Icon } from '../Icon/Icon.js';

export type LinkWebProps = Omit<LinkProps, 'children'> & {
  children?: ReactNode;
  className?: string;
};

/**
 * 글자 링크. 앱 안 주소는 TrellisProvider navigate로(새로 고침 없음, R-T34), 바깥 주소는 새 탭 + 바깥 아이콘 +
 * 숨은 글자 "새 창에서 열림". 표 칸(DataGrid render) · 문장 안 · PersonLabel 옆 어디서나 같은 색과 포커스 링이다
 */
export function Link({
  href,
  children,
  external,
  variant = 'default',
  underline = 'hover',
  disabled = false,
  onPress,
  id,
  testID,
  className,
}: LinkWebProps) {
  const t = useMessages();
  const outside = external ?? isExternalHref(href);
  const target = outside ? '_blank' : undefined;
  const onClick = useLinkClick(href, { target, onPress });
  const common = {
    id,
    'data-testid': testID,
    'data-variant': variant,
    'data-underline': underline,
    'data-tl-link': '',
  };
  if (disabled)
    return (
      // 갈 수 없는 링크: 주소를 떼어 초점 · 이동이 없고, 이름은 그대로 읽힌다
      <a
        {...common}
        className={cx('tl-link', className)}
        role="link"
        aria-disabled="true"
        data-state="disabled"
      >
        {children}
      </a>
    );
  return (
    <a
      {...common}
      className={cx('tl-link tl-focusable', className)}
      href={href}
      data-external={outside || undefined}
      {...(outside ? { target, rel: 'noopener noreferrer' } : {})}
      onClick={onClick}
    >
      {children}
      {outside && (
        <>
          <Icon name="external-link" className="tl-link__icon" />
          {/* 이름 끝에 띄어 붙는다(글자 노드 하나라야 이름 계산이 띄어쓰기를 지킨다) */}
          <span className="tl-sr-only">{` ${t('link.newTab')}`}</span>
        </>
      )}
    </a>
  );
}
Link.displayName = LinkContract.name;
