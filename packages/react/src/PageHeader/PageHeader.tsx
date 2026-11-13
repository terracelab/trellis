import { PageHeaderContract, type PageHeaderProps } from '@terracelab/trellis-contracts';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  meta,
  onBack,
  tabs,
  siblings,
  onSiblingPress,
  id,
  testID,
  className,
}: Omit<PageHeaderProps, 'actions' | 'meta' | 'tabs'> & {
  actions?: ReactNode;
  meta?: ReactNode;
  tabs?: ReactNode;
  className?: string;
}) {
  const t = useMessages();
  const hasSiblings = siblings != null && siblings.length > 1;
  const siblingsRef = useRef<HTMLElement>(null);
  const currentHref = siblings?.find((s) => s.current)?.href;
  // 휴대폰에서 형제 줄은 가로로 넘친다(PR-38): 지금 화면이 보이게 그 줄만 가로로 옮긴다(페이지는 움직이지 않는다)
  useLayoutEffect(() => {
    const nav = siblingsRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !current || nav.scrollWidth <= nav.clientWidth) return;
    const box = nav.getBoundingClientRect();
    const rect = current.getBoundingClientRect();
    const start = rect.left - box.left + nav.scrollLeft;
    const end = start + rect.width;
    if (start < nav.scrollLeft || end > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = start;
  }, [currentHref]);
  return (
    <header className={cx('tl-page-header', className)} id={id} data-testid={testID}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label={t('pageHeader.breadcrumbs')} className="tl-page-header__crumbs">
          <ol>
            {breadcrumbs.map((c, i) => (
              <li key={`${c.label}-${i}`}>
                {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="tl-page-header__row">
        {onBack && (
          <IconButton
            icon="chevron-left"
            label={t('common.back')}
            onPress={onBack}
            className="tl-page-header__back"
          />
        )}
        <div className="tl-page-header__titles">
          <div className="tl-page-header__title-line">
            {hasSiblings ? (
              // 제목 줄 탭: 지금 화면은 h1, 나머지는 흐린 큰 글자 링크(PR-27)
              <nav
                ref={siblingsRef}
                className="tl-page-header__siblings"
                aria-label={t('pageHeader.siblings')}
              >
                {(siblings ?? []).map((s) =>
                  s.current ? (
                    <h1 key={s.href} className="tl-page-header__title" aria-current="page">
                      {title}
                    </h1>
                  ) : (
                    <a
                      key={s.href}
                      href={s.href}
                      className="tl-page-header__sibling tl-focusable"
                      onClick={(e) => {
                        if (!onSiblingPress || e.metaKey || e.ctrlKey || e.shiftKey) return;
                        e.preventDefault();
                        onSiblingPress(s.href);
                      }}
                    >
                      {s.label}
                    </a>
                  ),
                )}
              </nav>
            ) : (
              <h1 className="tl-page-header__title">{title}</h1>
            )}
            {meta != null && !hasSiblings && <div className="tl-page-header__meta">{meta}</div>}
          </div>
          {hasSiblings && meta != null ? (
            // 형제가 있으면 제목 줄은 형제만. meta는 설명 줄로 내린다(PR-38)
            <div className="tl-page-header__subline">
              {description && <p className="tl-page-header__description">{description}</p>}
              <div className="tl-page-header__meta">{meta}</div>
            </div>
          ) : (
            description && <p className="tl-page-header__description">{description}</p>
          )}
        </div>
        {actions != null && <div className="tl-page-header__actions">{actions}</div>}
      </div>
      {tabs != null && <div className="tl-page-header__tabs">{tabs}</div>}
    </header>
  );
}
PageHeader.displayName = PageHeaderContract.name;
