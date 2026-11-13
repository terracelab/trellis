import {
  clampPage,
  FileViewerContract,
  fileViewerKind,
  fileViewerPdfSrc,
  formatAttachmentSize,
  inferAttachmentType,
  nextZoom,
  type AttachmentFileType,
  type FileViewerProps,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Button } from '../Button/Button.js';
import { EmptyState } from '../EmptyState/EmptyState.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Skeleton } from '../Skeleton/Skeleton.js';

export type FileViewerWebProps = FileViewerProps & { className?: string };

const TYPE_ICON: Record<AttachmentFileType, IconName> = {
  pdf: 'file-text',
  xlsx: 'file-spreadsheet',
  image: 'image',
  zip: 'archive',
  other: 'file',
};

/** 도구 줄 항목: 단추 하나 · 값 글자(배율 · 쪽) · 묶음 사이 선 */
type Tool =
  | {
      type: 'button';
      key: string;
      icon: IconName;
      label: string;
      onPress: () => void;
      disabled?: boolean;
      pressed?: boolean;
    }
  | { type: 'value'; key: string; text: string }
  | { type: 'separator'; key: string };

/** 브라우저 내장 PDF 보기가 있는지. 모르는 브라우저(속성 없음)는 있다고 보고 object 대체 내용에 맡긴다 */
function pdfViewerAvailable(): boolean {
  if (typeof navigator === 'undefined') return true;
  return (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled !== false;
}

/** 파일을 받는다: src를 파일 이름으로(a[download]) */
function saveFile(src: string, name: string) {
  const a = document.createElement('a');
  a.href = src;
  a.download = name;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
}

/**
 * 파일 미리 보기(PG-44). 그림은 확대 · 축소 · 맞춤 · 회전, PDF는 브라우저 내장 보기에 쪽 · 배율을 넘기고,
 * 다른 형식은 파일 카드와 다운로드. 도구 줄은 탭 정지 하나(roving tabindex)이고 ← → Home End로 옮긴다
 */
export function FileViewer({
  name,
  src,
  size,
  mimeType,
  kind,
  alt,
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  height = 'md',
  loading = false,
  error,
  onRetry,
  onDownload,
  downloadable = true,
  id,
  testID,
  className,
}: FileViewerWebProps) {
  const t = useMessages();
  const uid = useId();
  const stageId = `${uid}-stage`;
  const hintId = `${uid}-hint`;
  const shown = kind ?? fileViewerKind(name, mimeType);
  const dot = name.lastIndexOf('.');
  const ext = dot < 0 ? '' : name.slice(dot + 1).toUpperCase();
  const meta = [ext, size != null ? formatAttachmentSize(size) : ''].filter(Boolean).join(' · ');

  const [innerPage, setInnerPage] = useState(() => clampPage(defaultPage, pageCount));
  const current = clampPage(page ?? innerPage, pageCount);
  const [zoom, setZoom] = useState<number | 'fit'>('fit');
  const [rotation, setRotation] = useState(0);
  // 받은 그림 크기 · 깨진 주소는 그 주소에 묶는다(주소가 바뀌면 저절로 처음 상태). 효과에서 지우면
  // 빨리 받는 그림(data:)의 load가 효과보다 먼저 와서 지워진다
  const [loaded, setLoaded] = useState<{ src: string; w: number; h: number } | null>(null);
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const natural = loaded && loaded.src === src ? loaded : null;
  const broken = brokenSrc != null && brokenSrc === src;
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const toolRefs = useRef(new Map<string, HTMLButtonElement>());
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  // 다른 파일이면 맞춤 · 회전 0, 이름이 바뀌면 처음 쪽(렌더 중에 이전 값과 비교해 바로 맞춘다)
  const fileKey = `${name}\n${src ?? ''}`;
  const [seenKey, setSeenKey] = useState(fileKey);
  const [seenName, setSeenName] = useState(name);
  if (seenKey !== fileKey) {
    setSeenKey(fileKey);
    setZoom('fit');
    setRotation(0);
  }
  if (seenName !== name) {
    setSeenName(name);
    setInnerPage(clampPage(defaultPage, pageCount));
  }

  const failed = Boolean(error) || broken;
  const hasSrc = Boolean(src);
  const isImage = shown === 'image' && hasSrc && !loading && !failed;
  const isPdf = shown === 'pdf' && hasSrc && !loading && !failed;
  const pdfOk = isPdf && pdfViewerAvailable();

  // 그림 영역의 안쪽 크기(맞춤 배율 계산). 크기가 바뀌면 다시 잰다
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!isImage || !stage || !canvas) return;
    const measure = () => {
      const s = getComputedStyle(canvas);
      const padX = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight) || 0;
      const padY = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom) || 0;
      setBox({ w: stage.clientWidth - padX, h: stage.clientHeight - padY });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [isImage]);

  const rotated = rotation % 180 !== 0;
  const boxW = natural ? (rotated ? natural.h : natural.w) : 0;
  const boxH = natural ? (rotated ? natural.w : natural.h) : 0;
  const fitScale =
    natural && box && box.w > 0 && box.h > 0 ? Math.min(1, box.w / boxW, box.h / boxH) : 1;
  const scale = zoom === 'fit' ? fitScale : zoom;
  const percent = Math.round(scale * 100);

  const say = (text: string) => setAnnouncement(text);
  const setZoomTo = (next: number | 'fit') => {
    setZoom(next);
    if (next === 'fit') say(t('fileViewer.fit'));
    else say(t('fileViewer.zoomValue', { value: Math.round(next * 100) }));
  };
  // PDF는 맞춤 배율을 모르므로 맞춤에서 확대 · 축소는 100%를 기준으로 한다
  const zoomBy = (direction: 1 | -1) =>
    setZoomTo(nextZoom(shown === 'pdf' && zoom === 'fit' ? 1 : scale, direction));
  const rotate = () => {
    const next = (rotation + 90) % 360;
    setRotation(next);
    say(t('fileViewer.rotated', { value: next }));
  };
  const goPage = (target: number) => {
    const next = clampPage(target, pageCount);
    if (next === current) return;
    if (page === undefined) setInnerPage(next);
    onPageChange?.(next);
    say(
      pageCount
        ? t('fileViewer.pageOf', { page: next, count: pageCount })
        : t('fileViewer.pageOnly', { page: next }),
    );
  };
  const canDownload = downloadable && (onDownload != null || hasSrc);
  const download = () => {
    if (onDownload) onDownload();
    else if (src) saveFile(src, name);
  };
  const retry = () => {
    if (onRetry) onRetry();
    setBrokenSrc(null);
    setLoaded(null);
    setReload((r) => r + 1);
  };

  // 도구 묶음: 쪽 · 배율 · 파일. 빈 묶음은 빼고 묶음 사이에 선을 둔다
  const nav: Tool[] = [];
  const view: Tool[] = [];
  const file: Tool[] = [];
  if (isPdf && pdfOk) {
    nav.push(
      {
        type: 'button',
        key: 'prev',
        icon: 'chevron-left',
        label: t('fileViewer.prevPage'),
        onPress: () => goPage(current - 1),
        disabled: current <= 1,
      },
      {
        type: 'value',
        key: 'page',
        text: pageCount ? `${current} / ${pageCount}` : t('fileViewer.pageOnly', { page: current }),
      },
      {
        type: 'button',
        key: 'next',
        icon: 'chevron-right',
        label: t('fileViewer.nextPage'),
        onPress: () => goPage(current + 1),
        disabled: pageCount != null && current >= pageCount,
      },
    );
  }
  if (isImage || (isPdf && pdfOk)) {
    view.push(
      {
        type: 'button',
        key: 'zoomOut',
        icon: 'zoom-out',
        label: t('fileViewer.zoomOut'),
        onPress: () => zoomBy(-1),
        disabled: isImage && !natural,
      },
      {
        type: 'value',
        key: 'zoom',
        text: shown === 'pdf' && zoom === 'fit' ? '' : `${percent}%`,
      },
      {
        type: 'button',
        key: 'zoomIn',
        icon: 'zoom-in',
        label: t('fileViewer.zoomIn'),
        onPress: () => zoomBy(1),
        disabled: isImage && !natural,
      },
      {
        type: 'button',
        key: 'fit',
        icon: 'scan',
        label: t('fileViewer.fit'),
        onPress: () => setZoomTo('fit'),
        pressed: zoom === 'fit',
        disabled: isImage && !natural,
      },
    );
  }
  if (isImage)
    view.push({
      type: 'button',
      key: 'rotate',
      icon: 'rotate-cw',
      label: t('fileViewer.rotate'),
      onPress: rotate,
      disabled: !natural,
    });
  if (isPdf && src)
    file.push({
      type: 'button',
      key: 'open',
      icon: 'external-link',
      label: t('fileViewer.openNew'),
      onPress: () => window.open(src, '_blank', 'noopener'),
    });
  if (canDownload)
    file.push({
      type: 'button',
      key: 'download',
      icon: 'download',
      label: t('fileViewer.download'),
      onPress: download,
    });
  const tools = [nav, view, file]
    .filter((g) => g.length > 0)
    .flatMap((g, i): Tool[] => (i === 0 ? g : [{ type: 'separator', key: `s${i}` }, ...g]));
  const enabled = tools
    .filter((x): x is Extract<Tool, { type: 'button' }> => x.type === 'button' && !x.disabled)
    .map((x) => x.key);
  const tabStop = activeTool && enabled.includes(activeTool) ? activeTool : enabled[0];

  const onToolsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = enabled.indexOf(
      (e.target as HTMLElement).closest<HTMLElement>('[data-tool]')?.dataset['tool'] ?? '',
    );
    if (at < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (at + 1) % enabled.length;
    else if (e.key === 'ArrowLeft') next = (at - 1 + enabled.length) % enabled.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = enabled.length - 1;
    if (next < 0) return;
    e.preventDefault();
    toolRefs.current.get(enabled[next]!)?.focus();
  };
  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isPdf || !pdfOk) return;
    if (e.key === 'PageDown') goPage(current + 1);
    else if (e.key === 'PageUp') goPage(current - 1);
    else return;
    e.preventDefault();
  };
  const onStageKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isImage || !natural) return;
    if (e.key === '+' || e.key === '=') zoomBy(1);
    else if (e.key === '-' || e.key === '_') zoomBy(-1);
    else if (e.key === '0') setZoomTo('fit');
    else if (e.key === 'r' || e.key === 'R') rotate();
    else return;
    e.preventDefault();
  };
  // 확대한 그림은 끌어서 옮긴다(영역 스크롤)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!isImage || e.button !== 0 || !stage) return;
    if (stage.scrollWidth <= stage.clientWidth && stage.scrollHeight <= stage.clientHeight) return;
    drag.current = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    stage.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const d = drag.current;
    if (!stage || !d) return;
    stage.scrollLeft = d.left - (e.clientX - d.x);
    stage.scrollTop = d.top - (e.clientY - d.y);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    stageRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const fileCard = (title: string, description: string) => (
    <EmptyState
      icon={TYPE_ICON[inferAttachmentType(name)]}
      title={title}
      description={description}
      action={
        canDownload ? (
          <Button icon="download" onPress={download}>
            {t('fileViewer.download')}
          </Button>
        ) : undefined
      }
    />
  );

  let body;
  if (loading)
    body = (
      <div className="tl-file-viewer__pad">
        <Skeleton shape="rect" width="100%" height="100%" />
      </div>
    );
  else if (failed)
    body = (
      <EmptyState
        kind="error"
        title={error || t('fileViewer.error')}
        description={t('fileViewer.errorHint')}
        action={
          shown === 'image' || onRetry ? (
            <Button icon="refresh-cw" onPress={retry}>
              {t('fileViewer.retry')}
            </Button>
          ) : undefined
        }
      />
    );
  else if (isImage)
    body = (
      <div className="tl-file-viewer__canvas" ref={canvasRef}>
        <div
          className="tl-file-viewer__frame"
          style={
            natural
              ? ({
                  '--tl-file-viewer-frame-w': `${boxW * scale}px`,
                  '--tl-file-viewer-frame-h': `${boxH * scale}px`,
                  '--tl-file-viewer-image-w': `${natural.w * scale}px`,
                  '--tl-file-viewer-image-h': `${natural.h * scale}px`,
                  '--tl-file-viewer-rotate': `${rotation}deg`,
                } as CSSProperties)
              : undefined
          }
          data-ready={natural ? '' : undefined}
        >
          <img
            key={reload}
            className="tl-file-viewer__image"
            src={src}
            alt={alt ?? name}
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              setLoaded({
                src: src ?? '',
                w: img.naturalWidth || img.width || 1,
                h: img.naturalHeight || img.height || 1,
              });
            }}
            onError={() => setBrokenSrc(src ?? '')}
          />
        </div>
        {!natural && (
          <div className="tl-file-viewer__loading">
            <Skeleton shape="rect" width="100%" height="100%" />
          </div>
        )}
      </div>
    );
  else if (isPdf && pdfOk && src)
    body = (
      <object
        key={`${current}-${zoom}`}
        className="tl-file-viewer__pdf"
        data={fileViewerPdfSrc(src, { page: current, zoom: zoom === 'fit' ? undefined : zoom })}
        type="application/pdf"
        title={name}
        aria-label={name}
      >
        {fileCard(t('fileViewer.pdfUnsupported'), t('fileViewer.pdfUnsupportedHint'))}
      </object>
    );
  else if (isPdf)
    body = fileCard(t('fileViewer.pdfUnsupported'), t('fileViewer.pdfUnsupportedHint'));
  else body = fileCard(t('fileViewer.unsupported'), t('fileViewer.unsupportedHint'));

  const busy = loading || (isImage && !natural);
  const pannable = isImage && zoom !== 'fit' && scale > fitScale + 0.001;

  return (
    <div
      className={cx('tl-file-viewer', className)}
      id={id}
      data-testid={testID}
      data-kind={shown}
      data-height={height}
      data-state={loading ? 'loading' : failed ? 'error' : undefined}
      role="group"
      aria-label={t('fileViewer.label', { name })}
      aria-busy={busy || undefined}
      onKeyDown={onRootKey}
    >
      <div className="tl-file-viewer__bar">
        <div className="tl-file-viewer__name">
          <Icon name={TYPE_ICON[inferAttachmentType(name)]} className="tl-file-viewer__file-icon" />
          <span className="tl-file-viewer__title" title={name}>
            {name}
          </span>
          {meta && <span className="tl-file-viewer__meta">{meta}</span>}
        </div>
        {tools.length > 0 && (
          <div
            className="tl-file-viewer__tools"
            role="toolbar"
            aria-label={t('fileViewer.toolbar')}
            aria-controls={stageId}
            onKeyDown={onToolsKey}
          >
            {tools.map((x) =>
              x.type === 'separator' ? (
                <span key={x.key} className="tl-file-viewer__separator" aria-hidden />
              ) : x.type === 'value' ? (
                x.text ? (
                  <span key={x.key} className="tl-file-viewer__value" aria-hidden>
                    {x.text}
                  </span>
                ) : null
              ) : (
                <IconButton
                  key={x.key}
                  ref={(el) => {
                    if (el) toolRefs.current.set(x.key, el);
                    else toolRefs.current.delete(x.key);
                  }}
                  data-tool={x.key}
                  icon={x.icon}
                  label={x.label}
                  size="sm"
                  disabled={x.disabled}
                  pressed={x.pressed}
                  tabIndex={x.key === tabStop ? 0 : -1}
                  onFocus={() => setActiveTool(x.key)}
                  onPress={x.onPress}
                />
              ),
            )}
          </div>
        )}
      </div>
      <div
        className="tl-file-viewer__stage"
        id={stageId}
        ref={stageRef}
        {...(isImage
          ? {
              role: 'group',
              'aria-label': t('fileViewer.stage'),
              'aria-describedby': hintId,
              tabIndex: 0,
              onKeyDown: onStageKey,
              onPointerDown,
              onPointerMove,
              onPointerUp: endDrag,
              onPointerCancel: endDrag,
              onDoubleClick: () => natural && setZoomTo(zoom === 'fit' ? 1 : 'fit'),
              'data-pannable': pannable || undefined,
            }
          : {})}
      >
        {body}
        {isImage && (
          <span id={hintId} hidden>
            {t('fileViewer.stageHint')}
          </span>
        )}
      </div>
      <span className="tl-sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
FileViewer.displayName = FileViewerContract.name;
