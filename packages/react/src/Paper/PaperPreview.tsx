// 종이 미리보기: 종이(mm 크기)를 부모 폭에 맞춰 비율대로 줄인다. 휴대폰에서도 한 장이 다 보이고 가로로 넘치지 않는다.
// 줄인 비율은 ResizeObserver로 다시 잰다. 잴 수 없는 환경(jsdom · 첫 그리기 전)에서는 원래 크기로 두고 바깥이 자른다.
// 안의 Paper가 한 장을 넘으면(R-35) 종이 위에 줄이지 않은 글자로 쪽마다 한 줄씩 알린다.
import type { PaperPreviewProps } from '@terracelab/trellis-contracts';
import { useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { PaperPreviewContext, type PaperPreviewContextValue } from './context.js';

export type PaperPreviewWebProps = Omit<PaperPreviewProps, 'children'> & {
  children?: ReactNode;
  className?: string;
};

interface Fit {
  scale: number;
  width: number;
  height: number;
}

interface Overflowing {
  key: string;
  label: string;
}

const sameFit = (a: Fit | null, b: Fit) =>
  a !== null && a.scale === b.scale && a.width === b.width && a.height === b.height;

export function PaperPreview({ label, children, className }: PaperPreviewWebProps) {
  const t = useMessages();
  const noteId = useId();
  const outer = useRef<HTMLDivElement>(null);
  const pages = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit | null>(null);
  const [overflowing, setOverflowing] = useState<readonly Overflowing[]>([]);

  // 넘친 쪽 목록. 알린 순서(= 그리는 순서)대로 둔다
  const context = useMemo<PaperPreviewContextValue>(
    () => ({
      report: (key, pageLabel, overflow) =>
        setOverflowing((prev) => {
          const rest = prev.filter((p) => p.key !== key);
          if (!overflow) return rest.length === prev.length ? prev : rest;
          const at = prev.findIndex((p) => p.key === key);
          if (at < 0) return [...prev, { key, label: pageLabel }];
          if (prev[at]!.label === pageLabel) return prev;
          return prev.map((p) => (p.key === key ? { key, label: pageLabel } : p));
        }),
    }),
    [],
  );

  useLayoutEffect(() => {
    const box = outer.current;
    const inner = pages.current;
    if (!box || !inner) return;
    const measure = () => {
      const style = getComputedStyle(box);
      const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const available = box.clientWidth - padding;
      // offsetWidth · offsetHeight는 transform 전의 크기다(줄여도 그대로)
      const width = inner.offsetWidth;
      const height = inner.offsetHeight;
      if (!width || available <= 0) return;
      const scale = Math.min(1, available / width);
      const next = { scale, width: width * scale, height: height * scale };
      setFit((prev) => (sameFit(prev, next) ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    // 포커스를 받는다: 대화상자 · 서랍 안에서 미리보기가 길면 키보드로 감싼 영역을 스크롤한다
    <div
      ref={outer}
      className={cx('tl-paper-preview', 'tl-focusable', className)}
      role="group"
      tabIndex={0}
      aria-label={label ?? t('paper.preview')}
      aria-describedby={overflowing.length ? noteId : undefined}
    >
      {/* 늘 있는 상태 영역: 넘침이 생기거나 풀리면 읽어 준다. 비면 CSS가 숨긴다 */}
      <div className="tl-paper-preview__note" id={noteId} role="status">
        {overflowing.map((p) => (
          <p key={p.key} className="tl-paper-preview__note-line">
            <Icon name="circle-alert" className="tl-paper-preview__note-icon" />
            {t('paper.overflow', { label: p.label })}
          </p>
        ))}
      </div>
      <div
        className="tl-paper-preview__frame"
        style={fit ? { width: fit.width, height: fit.height } : undefined}
      >
        <div
          ref={pages}
          className="tl-paper-preview__pages"
          style={fit && fit.scale < 1 ? { transform: `scale(${fit.scale})` } : undefined}
        >
          <PaperPreviewContext.Provider value={context}>{children}</PaperPreviewContext.Provider>
        </div>
      </div>
    </div>
  );
}
