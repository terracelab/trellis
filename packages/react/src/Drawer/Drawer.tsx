import { DrawerContract, type DrawerProps } from '@terracelab/trellis-contracts';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { BaseDrawer as B, Dialog as D } from '../_headless/index.js';
import { useBottomInset } from '../_internal/bottom-inset.js';
import { cx, warnDev } from '../_internal/cx.js';
import { tabbables, trapTab } from '../_internal/focus-trap.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

const InsideDrawer = createContext(false);

export type DrawerWebProps = Omit<DrawerProps, 'trigger' | 'actions' | 'footer' | 'children'> & {
  trigger?: ReactElement;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** 방향키를 스스로 쓰는 위젯(탭 · 메뉴 · 목록 · 표 · 슬라이더 · 라디오) */
const ARROW_WIDGETS =
  '[role="tablist"], [role="menu"], [role="menubar"], [role="listbox"], [role="radiogroup"], [role="slider"], [role="spinbutton"], [role="grid"], [role="tree"], [role="combobox"], [role="textbox"]';

/** ← → 키를 이전 · 다음 건으로 넘기지 않는 자리: 글자를 고치는 칸과 방향키를 쓰는 위젯 안 */
function ownsArrows(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement)
    return !['button', 'checkbox', 'submit', 'reset'].includes(target.type);
  return target.closest(ARROW_WIDGETS) != null;
}

/**
 * 본문이 넘쳐 스크롤되는데 안에 초점 받을 것이 없으면 본문 자체를 Tab 순서에 넣는다(WCAG 2.1.1).
 * 글만 있는 긴 서랍(계산 근거 · 안내)을 키보드로 내려 읽을 수 있다. 넘치지 않거나 안에 단추 · 입력이 있으면 넣지 않는다.
 * 글자 크기를 키우거나 화면이 낮으면 같은 서랍도 넘칠 수 있어 크기 · 내용이 바뀔 때마다 다시 본다
 */
function useScrollFocus() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [needed, setNeeded] = useState(false);
  useEffect(() => {
    if (!el) return;
    const check = () =>
      setNeeded(el.scrollHeight > el.clientHeight + 1 && tabbables(el).length === 0);
    check();
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(check);
    resize?.observe(el);
    const mutation = new MutationObserver(check);
    mutation.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      resize?.disconnect();
      mutation.disconnect();
    };
  }, [el]);
  return { ref: setEl, tabIndex: needed ? 0 : undefined };
}

export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  side = 'right',
  width = 'lg',
  height = 'auto',
  trigger,
  actions,
  footer,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  children,
  id,
  testID,
  className,
}: DrawerWebProps) {
  const t = useMessages();
  const nested = useContext(InsideDrawer);
  const bottom = side === 'bottom';
  // 서랍 footer 위로 토스트를 올린다(PR-19 · D-76). 넓은 화면의 오른쪽 서랍도 같다: 토스트가 오른쪽 아래에 떠서
  // 서랍을 연 채 하는 동작(다시 내려받기 · 정정)의 단추를 몇 초씩 가렸다
  const footerRef = useBottomInset<HTMLDivElement>(true);
  if (nested)
    warnDev(
      'Drawer 안에서 Drawer를 열지 않는다(components.md §10). 상세는 같은 패널 안에서 바꾼다.',
    );

  // 첫 초점은 제목(tabindex -1, R-37 10): 닫기 단추에 초점 링 · 툴팁이 뜬 채 열리지 않고, 화면 읽기는 제목부터 읽는다.
  // 안에 data-autofocus 요소(등록 시트의 첫 칸)가 있으면 그것
  const popupRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const initialFocus = () =>
    popupRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? titleRef.current ?? true;

  const scroll = useScrollFocus();
  const paging = onPrev != null || onNext != null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    trapTab(e);
    if (!paging || e.defaultPrevented || e.nativeEvent.isComposing) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const go = e.key === 'ArrowLeft' ? onPrev : e.key === 'ArrowRight' ? onNext : undefined;
    if (!go || ownsArrows(e.target)) return;
    // 포털로 뜬 안쪽 창(확인 Dialog · Popover)의 키도 React 트리로 올라온다. 서랍 DOM 안에서 누른 키만 받는다
    if (!(e.target instanceof Node) || !e.currentTarget.contains(e.target)) return;
    e.preventDefault();
    go();
  };

  // 아래 시트는 Base UI Drawer(쓸어 닫기), 오른쪽 패널은 Dialog. 머리 · 내용 · footer 부품은 같다
  // 아래 시트의 머리 단추(이전 · 다음 · 닫기)는 손가락 크기(size.touch.min)로 CSS가 키운다
  const P = bottom ? B : D;
  const head = (
    <div className="tl-drawer__head">
      <div className="tl-drawer__titles">
        <P.Title className="tl-drawer__title" ref={titleRef} tabIndex={-1}>
          {title}
        </P.Title>
        {description && (
          <P.Description className="tl-drawer__description">{description}</P.Description>
        )}
      </div>
      {actions != null && <div className="tl-drawer__actions">{actions}</div>}
      {paging && (
        // 한쪽 끝(첫 건 · 마지막 건)이면 그 단추만 꺼서 자리가 흔들리지 않게 둘 다 둔다
        <div className="tl-drawer__nav">
          <IconButton
            icon="chevron-left"
            label={prevLabel ?? t('drawer.prev')}
            size="sm"
            disabled={onPrev == null}
            onPress={onPrev}
            aria-keyshortcuts="ArrowLeft"
          />
          <IconButton
            icon="chevron-right"
            label={nextLabel ?? t('drawer.next')}
            size="sm"
            disabled={onNext == null}
            onPress={onNext}
            aria-keyshortcuts="ArrowRight"
          />
        </div>
      )}
      <P.Close
        render={
          <IconButton icon="x" label={t('common.close')} size="sm" className="tl-drawer__close" />
        }
      />
    </div>
  );
  const body = <InsideDrawer.Provider value>{children}</InsideDrawer.Provider>;
  const foot = footer != null && (
    <div className="tl-drawer__footer" ref={footerRef}>
      {footer}
    </div>
  );
  const popupProps = {
    className: cx('tl-drawer', className),
    id,
    'data-testid': testID,
    'data-side': side,
    'data-width': width,
    onKeyDown,
    'aria-modal': true,
    ref: popupRef,
    initialFocus,
  } as const;
  const rootProps = {
    ...(open !== undefined ? { open } : {}),
    ...(defaultOpen !== undefined ? { defaultOpen } : {}),
    onOpenChange: (next: boolean) => onOpenChange?.(next),
  };

  if (bottom)
    return (
      <B.Root {...rootProps}>
        {trigger && <B.Trigger render={trigger} />}
        <B.Portal>
          <B.Backdrop className="tl-drawer__backdrop" data-side="bottom" forceRender />
          <B.Viewport className="tl-drawer__viewport">
            <B.Popup {...popupProps} data-height={height}>
              <div className="tl-drawer__handle" aria-hidden="true" />
              {head}
              <B.Content
                className={cx('tl-drawer__body', scroll.tabIndex === 0 && 'tl-focusable')}
                ref={scroll.ref}
                tabIndex={scroll.tabIndex}
              >
                {body}
              </B.Content>
              {foot}
            </B.Popup>
          </B.Viewport>
        </B.Portal>
      </B.Root>
    );

  return (
    <D.Root {...rootProps}>
      {trigger && <D.Trigger render={trigger} />}
      <D.Portal>
        <D.Backdrop className="tl-drawer__backdrop" />
        <D.Popup {...popupProps}>
          {head}
          <div
            className={cx('tl-drawer__body', scroll.tabIndex === 0 && 'tl-focusable')}
            ref={scroll.ref}
            tabIndex={scroll.tabIndex}
          >
            {body}
          </div>
          {foot}
        </D.Popup>
      </D.Portal>
    </D.Root>
  );
}
Drawer.displayName = DrawerContract.name;
