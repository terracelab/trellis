import {
  citationIndex,
  parseRichText,
  RichTextContract,
  type CitationSource,
  type RichBlock,
  type RichInline,
  type RichListBlock,
  type RichTextProps,
} from '@terracelab/trellis-contracts';
import { useMemo, type MouseEvent, type ReactNode } from 'react';
import { Citation } from '../Citation/Citation.js';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';

export type RichTextWebProps = RichTextProps & { className?: string };

interface Ctx {
  base: number;
  citations: readonly CitationSource[] | undefined;
  onCitationOpen: RichTextProps['onCitationOpen'];
  onLinkPress: RichTextProps['onLinkPress'];
  t: Translate;
}

/** 새 창으로 여는 주소(http · https). 앱 안 경로(/ · #) · mailto · tel은 같은 창 */
const isExternal = (href: string) => /^https?:\/\//i.test(href);

function Inlines({ parts, ctx }: { parts: readonly RichInline[]; ctx: Ctx }): ReactNode {
  return parts.map((p, i) => {
    switch (p.type) {
      case 'text':
        return p.text;
      case 'break':
        return <br key={i} />;
      case 'strong':
        return (
          <strong key={i} className="tl-rich-text__strong">
            <Inlines parts={p.children} ctx={ctx} />
          </strong>
        );
      case 'code':
        return (
          <code key={i} className="tl-rich-text__code">
            {p.text}
          </code>
        );
      case 'link':
        return (
          <a
            key={i}
            className="tl-rich-text__link tl-focusable"
            href={p.href}
            {...(isExternal(p.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            onClick={(e: MouseEvent) => {
              // 보조 키 · 가운데 단추는 브라우저 몫(새 탭)
              if (!ctx.onLinkPress || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey)
                return;
              e.preventDefault();
              ctx.onLinkPress(p.href);
            }}
          >
            <Inlines parts={p.children} ctx={ctx} />
          </a>
        );
      case 'cite': {
        const source = ctx.citations?.find((s, k) => citationIndex(s, k) === p.index);
        if (!source) return `[${p.index}]`;
        const open = ctx.onCitationOpen;
        return (
          <Citation
            key={i}
            layout="inline"
            sources={[{ ...source, index: p.index }]}
            {...(open ? { onOpen: () => open(source) } : {})}
          />
        );
      }
    }
  });
}

/** 목록. 쓰는 중 커서는 마지막 항목(안쪽 목록이 있으면 그 마지막)에 붙는다 */
function List({ block, ctx, caret }: { block: RichListBlock; ctx: Ctx; caret: ReactNode }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag
      className="tl-rich-text__list"
      {...(block.ordered && block.start !== 1 ? { start: block.start } : {})}
    >
      {block.items.map((item, i) => {
        const last = i === block.items.length - 1;
        return (
          <li key={i} className="tl-rich-text__item">
            <Inlines parts={item.children} ctx={ctx} />
            {last && item.lists.length === 0 && caret}
            {item.lists.map((sub, k) => (
              <List
                key={k}
                block={sub}
                ctx={ctx}
                caret={last && k === item.lists.length - 1 ? caret : null}
              />
            ))}
          </li>
        );
      })}
    </Tag>
  );
}

function Block({ block, ctx, caret }: { block: RichBlock; ctx: Ctx; caret: ReactNode }) {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${Math.min(6, ctx.base + block.depth - 1)}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <Tag className="tl-rich-text__heading" data-depth={Math.min(3, block.depth)}>
          <Inlines parts={block.children} ctx={ctx} />
          {caret}
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p className="tl-rich-text__paragraph">
          <Inlines parts={block.children} ctx={ctx} />
          {caret}
        </p>
      );
    case 'plain':
      return (
        <p className="tl-rich-text__plain">
          {block.text}
          {caret}
        </p>
      );
    case 'list':
      return <List block={block} ctx={ctx} caret={caret} />;
    case 'table':
      return (
        // 넓은 표는 칸 안에서 가로로 스크롤한다. 키보드로도 스크롤하게 포커스를 받는다
        <div
          className="tl-rich-text__table"
          tabIndex={0}
          role="group"
          aria-label={ctx.t('richText.table')}
        >
          <table>
            <thead>
              <tr>
                {block.head.map((cell, k) => (
                  <th
                    key={k}
                    scope="col"
                    data-align={block.align[k]}
                    data-numeric={block.numeric[k] || undefined}
                  >
                    <Inlines parts={cell} ctx={ctx} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, k) => (
                    <td
                      key={k}
                      data-align={block.align[k]}
                      data-numeric={block.numeric[k] || undefined}
                    >
                      <Inlines parts={cell} ctx={ctx} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'code':
      return (
        <pre className="tl-rich-text__pre" tabIndex={0} data-language={block.lang}>
          <code>{block.text}</code>
        </pre>
      );
    case 'rule':
      return <hr className="tl-rich-text__rule" />;
  }
}

/** 커서를 품을 수 있는 블록(글 끝에 커서가 붙는다). 표 · 코드 · 구분선 뒤에는 따로 둔다 */
const HOLDS_CARET = new Set<RichBlock['type']>(['heading', 'paragraph', 'plain', 'list']);

export function RichText({
  text,
  streaming = false,
  citations,
  onCitationOpen,
  onLinkPress,
  headingLevel = 3,
  id,
  testID,
  className,
}: RichTextWebProps) {
  const t = useMessages();
  const blocks = useMemo(() => parseRichText(text), [text]);
  const ctx: Ctx = { base: headingLevel, citations, onCitationOpen, onLinkPress, t };
  const caret = streaming ? <span className="tl-rich-text__caret" aria-hidden /> : null;
  const last = blocks[blocks.length - 1];
  const inside = last !== undefined && HOLDS_CARET.has(last.type);
  return (
    <div
      className={cx('tl-rich-text', className)}
      id={id}
      data-testid={testID}
      data-state={streaming ? 'loading' : undefined}
      aria-busy={streaming || undefined}
    >
      {blocks.map((b, i) => (
        <Block
          key={i}
          block={b}
          ctx={ctx}
          caret={inside && i === blocks.length - 1 ? caret : null}
        />
      ))}
      {streaming && !inside && (
        <p className="tl-rich-text__paragraph">
          {caret}
          {blocks.length === 0 && <span className="tl-sr-only">{t('richText.writing')}</span>}
        </p>
      )}
    </div>
  );
}
RichText.displayName = RichTextContract.name;
