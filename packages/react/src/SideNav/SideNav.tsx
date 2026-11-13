import {
  formatCount,
  SideNavContract,
  type SideNavItem,
  type SideNavProps,
  type SideNavSection,
} from '@terracelab/trellis-contracts';
import { useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { ShellSidebarCollapsedContext } from '../_internal/shell-context.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

function contains(item: SideNavItem, id?: string): boolean {
  return !!id && (item.id === id || !!item.children?.some((c) => contains(c, id)));
}

/** 지금 화면(activeId)이 바뀌어 이 묶음 · 하위 메뉴 안으로 들어오면 부른다(첫 그리기 포함, R-42) */
function useOnActiveEnter(activeId: string | undefined, inside: boolean, run: () => void) {
  const seen = useRef<string | undefined | null>(null);
  useEffect(() => {
    if (seen.current === activeId) return;
    seen.current = activeId;
    if (inside) run();
    // run은 그리기마다 새로 만들어진다. activeId가 바뀔 때만 본다
  }, [activeId, inside]);
}

function Item({
  item,
  activeId,
  onNavigate,
  collapsed,
  revealActive,
  depth,
}: {
  item: SideNavItem;
  activeId?: string;
  onNavigate?: (id: string) => void;
  collapsed: boolean;
  revealActive: boolean;
  depth: number;
}) {
  const [open, setOpen] = useState(() => contains(item, activeId));
  const active = item.id === activeId;
  const hasChildren = !!item.children?.length;
  const listId = useId();
  const shown = hasChildren && open && !collapsed;
  // 지금 화면이 접힌 하위 메뉴 안으로 바뀌면 연다
  useOnActiveEnter(
    activeId,
    revealActive && hasChildren && !active && contains(item, activeId),
    () => setOpen(true),
  );
  const body = (
    <>
      {item.icon ? (
        <Icon name={item.icon} size={depth === 0 ? 20 : 16} className="tl-side-nav__icon" />
      ) : (
        depth === 0 && <span className="tl-side-nav__icon-gap" />
      )}
      <span className="tl-side-nav__label">{item.label}</span>
      {item.count != null && item.count > 0 && (
        <span className="tl-side-nav__count" data-tone={item.countTone ?? 'neutral'}>
          {formatCount(item.count)}
        </span>
      )}
      {hasChildren && (
        <Icon name={open ? 'chevron-up' : 'chevron-down'} className="tl-side-nav__chevron" />
      )}
    </>
  );
  const common = {
    className: 'tl-side-nav__item tl-focusable',
    'data-active': active || undefined,
    'data-depth': depth,
    title: collapsed ? item.label : undefined,
    'aria-current': active ? ('page' as const) : undefined,
  };
  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          {...common}
          aria-expanded={open}
          aria-controls={shown ? listId : undefined}
          onClick={() => setOpen(!open)}
        >
          {body}
        </button>
      ) : item.href ? (
        <a {...common} href={item.href} onClick={() => onNavigate?.(item.id)}>
          {body}
        </a>
      ) : (
        <button type="button" {...common} onClick={() => onNavigate?.(item.id)}>
          {body}
        </button>
      )}
      {shown && (
        <ul className="tl-side-nav__list" id={listId}>
          {item.children!.map((c) => (
            <Item
              key={c.id}
              item={c}
              activeId={activeId}
              onNavigate={onNavigate}
              collapsed={collapsed}
              revealActive={revealActive}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function Section({
  section,
  activeId,
  onNavigate,
  onOpenChange,
  collapsed,
  revealActive,
}: {
  section: SideNavSection;
  activeId?: string;
  onNavigate?: (id: string) => void;
  onOpenChange?: (id: string, open: boolean) => void;
  collapsed: boolean;
  revealActive: boolean;
}) {
  const hasActive = section.items.some((i) => contains(i, activeId));
  // 처음 열림: defaultOpen(없으면 접는 묶음은 닫힘)이고, 지금 화면이 든 묶음은 revealActive면 연다(R-42)
  const [inner, setInner] = useState(
    () => (section.defaultOpen ?? !section.collapsible) || (revealActive && hasActive),
  );
  const controlled = section.open !== undefined;
  const open = !section.collapsible || (controlled ? !!section.open : inner);
  const setOpen = (next: boolean) => {
    if (!controlled) setInner(next);
    onOpenChange?.(section.id, next);
  };
  // 지금 화면이 접힌 묶음 안으로 바뀌면 연다. 제어 모드는 onSectionOpenChange(id, true)로 알린다
  useOnActiveEnter(activeId, revealActive && !!section.collapsible && hasActive, () => {
    if (!open) setOpen(true);
  });
  const listId = useId();
  const dot = section.group && (
    <span
      className="tl-side-nav__dot"
      style={{ background: `var(--tl-color-module-${section.group}-default)` }}
      aria-hidden
    />
  );
  const total = section.items.reduce((a, i) => a + (i.count ?? 0), 0);
  // 접힌 묶음 안에 지금 화면이 있으면 머리를 지금 화면 색 · 굵기로 보이고, 화면 낭독기에는 글로 알린다
  const activeInside = !open && hasActive;
  const t = useMessages();
  return (
    <div className="tl-side-nav__section" data-section-id={section.id}>
      {section.label &&
        !collapsed &&
        (section.collapsible ? (
          <button
            type="button"
            className="tl-side-nav__section-head tl-focusable"
            data-section-id={section.id}
            data-has-active={activeInside || undefined}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            onClick={() => setOpen(!open)}
          >
            {dot}
            <span className="tl-side-nav__section-label">
              {section.label}
              {activeInside && <span className="tl-sr-only"> · {t('sideNav.hasActive')}</span>}
            </span>
            {!open && total > 0 && (
              <span className="tl-side-nav__section-meta">{formatCount(total)}</span>
            )}
            <Icon name={open ? 'chevron-up' : 'chevron-down'} className="tl-side-nav__chevron" />
          </button>
        ) : (
          <div className="tl-side-nav__section-head" data-section-id={section.id}>
            {dot}
            <span className="tl-side-nav__section-label">{section.label}</span>
          </div>
        ))}
      {(open || collapsed) && (
        <ul className="tl-side-nav__list" id={listId}>
          {section.items.map((item) => (
            <Item
              key={item.id}
              item={item}
              activeId={activeId}
              onNavigate={onNavigate}
              collapsed={collapsed}
              revealActive={revealActive}
              depth={0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export function SideNav({
  sections,
  activeId,
  onNavigate,
  onSectionOpenChange,
  revealActive = true,
  collapsed: collapsedProp,
  header,
  footer,
  label: labelProp,
  id,
  testID,
  className,
}: Omit<SideNavProps, 'header' | 'footer'> & {
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const t = useMessages();
  const label = labelProp ?? t('sideNav.label');
  // collapsed를 주지 않으면 AppShell 사이드바 접힘을 따른다(R-41)
  const shell = useContext(ShellSidebarCollapsedContext);
  const collapsed = collapsedProp ?? shell ?? false;
  return (
    <nav
      className={cx('tl-side-nav', className)}
      id={id}
      data-testid={testID}
      data-collapsed={collapsed || undefined}
      aria-label={label}
    >
      {header != null && <div className="tl-side-nav__header">{header}</div>}
      <div className="tl-side-nav__scroll">
        {sections.map((s) => (
          <Section
            key={s.id}
            section={s}
            activeId={activeId}
            onNavigate={onNavigate}
            onOpenChange={onSectionOpenChange}
            collapsed={collapsed}
            revealActive={revealActive}
          />
        ))}
      </div>
      {footer != null && <div className="tl-side-nav__footer">{footer}</div>}
    </nav>
  );
}
SideNav.displayName = SideNavContract.name;
