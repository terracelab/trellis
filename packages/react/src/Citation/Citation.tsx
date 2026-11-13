import {
  citationIndex,
  CitationContract,
  type CitationProps,
  type CitationSource,
} from '@terracelab/trellis-contracts';
import { useId, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { Tooltip } from '../Tooltip/Tooltip.js';

export type CitationWebProps = CitationProps & { className?: string };

/** 문서 이름 · 쪽 */
const sourceText = (s: CitationSource) => (s.location ? `${s.title} · ${s.location}` : s.title);

/** 출처 하나를 여는 요소: href면 링크(새 창, onOpen이 있으면 앱이 연다), onOpen만 있으면 단추, 둘 다 없으면 글자 */
function Opener({
  source,
  onOpen,
  className,
  label,
  children,
}: {
  source: CitationSource;
  onOpen: CitationProps['onOpen'];
  className: string;
  label?: string;
  children: ReactNode;
}) {
  if (source.href)
    return (
      <a
        className={cx(className, 'tl-focusable')}
        href={source.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={(e: MouseEvent) => {
          if (!onOpen) return;
          e.preventDefault();
          onOpen(source);
        }}
      >
        {children}
      </a>
    );
  if (onOpen)
    return (
      <button
        type="button"
        className={cx(className, 'tl-focusable')}
        aria-label={label}
        onClick={() => onOpen(source)}
      >
        {children}
      </button>
    );
  return (
    <span className={className} data-static="">
      {children}
      {label && <span className="tl-sr-only">{label}</span>}
    </span>
  );
}

function Marker({
  source,
  index,
  onOpen,
  t,
}: {
  source: CitationSource;
  index: number;
  onOpen: CitationProps['onOpen'];
  t: Translate;
}) {
  const name = t('citation.marker', { index, title: sourceText(source) });
  const interactive = Boolean(source.href || onOpen);
  const marker = (
    <Opener source={source} onOpen={onOpen} className="tl-citation__marker" label={name}>
      <span aria-hidden>{index}</span>
    </Opener>
  );
  return interactive ? <Tooltip content={sourceText(source)}>{marker}</Tooltip> : marker;
}

export function Citation({
  sources,
  layout = 'list',
  onOpen,
  label,
  id,
  testID,
  className,
}: CitationWebProps) {
  const t = useMessages();
  const labelId = useId();
  if (layout === 'inline')
    return (
      <span
        className={cx('tl-citation', className)}
        id={id}
        data-testid={testID}
        data-layout="inline"
      >
        {sources.map((s, i) => (
          <Marker
            key={`${citationIndex(s, i)}-${s.title}`}
            source={s}
            index={citationIndex(s, i)}
            onOpen={onOpen}
            t={t}
          />
        ))}
      </span>
    );

  if (sources.length === 0) return null;
  return (
    <div className={cx('tl-citation', className)} id={id} data-testid={testID} data-layout="list">
      <p className="tl-citation__label" id={labelId}>
        {label ?? t('citation.label')}
      </p>
      <ol className="tl-citation__list" aria-labelledby={labelId}>
        {sources.map((s, i) => (
          <li key={`${citationIndex(s, i)}-${s.title}`} className="tl-citation__item">
            <Opener source={s} onOpen={onOpen} className="tl-citation__chip">
              <span className="tl-citation__index">{citationIndex(s, i)}</span>
              <span className="tl-citation__title">{s.title}</span>
              {s.location && <span className="tl-citation__location">{s.location}</span>}
              {s.href && !onOpen && <Icon name="external-link" className="tl-citation__external" />}
            </Opener>
          </li>
        ))}
      </ol>
    </div>
  );
}
Citation.displayName = CitationContract.name;
