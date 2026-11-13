// 좁은 화면(breakpoint.sm 미만)에서 고르는 창(Select · MultiSelect · DateField · PeriodPicker · FilterBar)을
// 화면 아래 시트로 연다. 넓은 화면은 지금처럼 트리거 옆 팝업이다. props는 같고 모양만 바뀐다.
import { primitives } from '@terracelab/trellis-tokens';
import { useSyncExternalStore, type ReactNode } from 'react';
import { BaseDrawer as B } from '../_headless/index.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useBottomInset } from './bottom-inset.js';
import { trapTab } from './focus-trap.js';
import { cx } from './cx.js';
import { useMessages } from './locale.js';

const WIDE = `(min-width: ${primitives.breakpoint.sm})`;

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(WIDE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const isNarrow = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia(WIDE).matches;

/** 좁은 화면(breakpoint.sm 미만)이면 true. 서버 렌더와 matchMedia가 없는 환경(jsdom)은 넓은 화면으로 본다 */
export function useNarrowScreen() {
  return useSyncExternalStore(subscribe, isNarrow, () => false);
}

/** 고르는 팝업이 시트로 열리는 조건 = 좁은 화면 */
export const useSheetMode = useNarrowScreen;

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** 아래 고정 동작(완료 · 적용) */
  footer?: ReactNode;
  /** 머리 오른쪽 동작(닫기 앞). AppShell 옆 칸이 시트가 될 때 머리 동작을 그대로 둔다 */
  actions?: ReactNode;
  className?: string;
  testID?: string;
}

/** 화면 아래 시트. 아래로 쓸어 닫는다. 시트 안에서 또 시트를 열 수 있다(필터 시트 → 채널 고르기) */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  actions,
  className,
  testID,
}: SheetProps) {
  const t = useMessages();
  // 시트 footer(완료 · 적용) 위로 토스트를 올린다(PR-19)
  const footerRef = useBottomInset<HTMLDivElement>(true);
  return (
    <B.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <B.Portal>
        <B.Backdrop className="tl-sheet__backdrop" forceRender />
        <B.Viewport className="tl-sheet__viewport">
          <B.Popup
            className={cx('tl-sheet', className)}
            data-testid={testID}
            onKeyDown={trapTab}
            aria-modal="true"
          >
            <div className="tl-sheet__handle" aria-hidden="true" />
            <div className="tl-sheet__head">
              <B.Title className="tl-sheet__title">{title}</B.Title>
              {actions != null && <div className="tl-sheet__actions">{actions}</div>}
              <B.Close render={<IconButton icon="x" label={t('common.close')} size="sm" />} />
            </div>
            <B.Content className="tl-sheet__body">{children}</B.Content>
            {footer != null && (
              <div className="tl-sheet__footer" ref={footerRef}>
                {footer}
              </div>
            )}
          </B.Popup>
        </B.Viewport>
      </B.Portal>
    </B.Root>
  );
}
