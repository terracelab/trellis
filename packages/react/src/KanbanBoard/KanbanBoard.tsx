import {
  formatAmount,
  formatCount,
  KanbanBoardContract,
  type KanbanBoardProps,
  type KanbanCardItem,
  type KanbanColumn,
} from '@terracelab/trellis-contracts';
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { useNarrowScreen } from '../_internal/sheet.js';
import { Avatar } from '../Avatar/Avatar.js';
import { Badge } from '../Badge/Badge.js';
import { DueBadge } from '../DueBadge/DueBadge.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Menu } from '../Menu/Menu.js';
import { StatusDot } from '../StatusDot/StatusDot.js';
import { Tabs } from '../Tabs/Tabs.js';

export type KanbanBoardWebProps = Omit<KanbanBoardProps, 'renderCard'> & {
  /** 카드 안 내용. 틀 · 옮기기 메뉴 · 끌기는 보드가 그린다. 기본은 KanbanCard */
  renderCard?: (card: KanbanCardItem) => ReactNode;
  className?: string;
};

export interface KanbanCardWebProps {
  card: KanbanCardItem;
  /** 기한 계산 기준일(ISO) */
  today?: string;
  /** 기한 주의 일수 */
  warnDays?: number;
}

/**
 * 기본 카드 내용: 제목 · 보조 줄 · 금액과 오른쪽 작은 글자 · 담당 · 기한(또는 상태). 단추 안에 들어가도록 span만 쓴다.
 * 제목 줄 오른쪽은 옮기기 단추 자리라 작은 글자(확률)는 금액 줄 오른쪽에 둔다.
 */
export function KanbanCard({ card, today, warnDays = 3 }: KanbanCardWebProps) {
  const t = useMessages();
  const foot = card.owner || card.meta || card.status || card.due;
  return (
    <>
      <span className="tl-kanban-card__top">
        <span className="tl-kanban-card__title">{card.title}</span>
      </span>
      {card.description && <span className="tl-kanban-card__description">{card.description}</span>}
      {(card.amount != null || card.trailing) && (
        <span className="tl-kanban-card__figure">
          {card.amount != null && (
            <span className="tl-kanban-card__amount">
              {formatAmount(card.amount)}
              <span className="tl-kanban-card__unit">{t('common.unitWon')}</span>
            </span>
          )}
          {card.trailing && <span className="tl-kanban-card__trailing">{card.trailing}</span>}
        </span>
      )}
      {foot && (
        <span className="tl-kanban-card__foot">
          <span className="tl-kanban-card__who">
            {card.owner && (
              <>
                <Avatar name={card.owner} size={24} decorative />
                <span>{card.owner}</span>
              </>
            )}
            {card.meta && <span className="tl-kanban-card__meta">{card.meta}</span>}
          </span>
          {card.status ? (
            <Badge size="sm" tone={card.status.tone}>
              {card.status.label}
            </Badge>
          ) : card.due ? (
            <DueBadge
              size="sm"
              due={card.due}
              today={today}
              warnDays={warnDays}
              done={card.done}
              doneLabel={card.doneLabel}
            />
          ) : null}
        </span>
      )}
    </>
  );
}

/** 속성 선택자 안에 넣을 값(따옴표 · 역슬래시만 막는다) */
const attr = (value: string) => value.replace(/["\\]/g, (ch) => `\\${ch}`);

const sumOf = (list: readonly KanbanCardItem[]) => list.reduce((a, c) => a + (c.amount ?? 0), 0);

interface Drop {
  column: string;
  /** 지금 보이는 목록(끄는 카드 포함)에서 이 자리 앞에 놓는다 */
  index: number;
}

export function KanbanBoard({
  columns,
  cards,
  label,
  onMove,
  onCardPress,
  activeCardId,
  summary = true,
  draggable = true,
  today,
  warnDays = 3,
  renderCard,
  id,
  testID,
  className,
}: KanbanBoardWebProps) {
  const t = useMessages();
  const narrow = useNarrowScreen();
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(columns[0]?.id ?? '');
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<Drop | null>(null);
  /** 메뉴로 옮긴 카드: 새 칸에 그려지면 포커스를 돌려준다(이전 단추는 사라졌다) */
  const pendingFocus = useRef<{ card: string; to: string } | null>(null);
  const listOf = (column: string) => cards.filter((c) => c.column === column);
  const showSum = summary && cards.some((c) => c.amount != null);
  const canDrag = draggable && !!onMove && !narrow;

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    // 앱이 옮기지 않았으면(확인 대화상자를 먼저 여는 경우) 포커스를 건드리지 않는다
    if (!cards.some((c) => c.id === pending.card && c.column === pending.to)) return;
    const key = attr(pending.card);
    // 메뉴가 닫히며 포커스를 돌려놓는 일보다 뒤에 둔다
    const frame = requestAnimationFrame(() => {
      const el =
        root.current?.querySelector<HTMLElement>(`[data-card-focus="${key}"]`) ??
        root.current?.querySelector<HTMLElement>('[data-card-focus]');
      el?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [cards]);

  const move = (card: KanbanCardItem, to: string, index: number) => {
    if (!onMove) return;
    pendingFocus.current = { card: card.id, to };
    onMove(card.id, to, index);
  };

  // ── 키보드: 화살표로 카드 사이를 옮겨 다닌다(위아래 = 같은 칸, 좌우 = 옆 칸의 같은 줄) ──
  const focusCard = (key: string | undefined) => {
    if (!key) return;
    root.current?.querySelector<HTMLElement>(`[data-card-focus="${attr(key)}"]`)?.focus();
  };
  const onCardKey = (e: KeyboardEvent, card: KanbanCardItem) => {
    const list = listOf(card.column);
    const i = list.findIndex((c) => c.id === card.id);
    let target: string | undefined;
    if (e.key === 'ArrowDown') target = list[i + 1]?.id;
    else if (e.key === 'ArrowUp') target = list[i - 1]?.id;
    else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !narrow) {
      const step = e.key === 'ArrowLeft' ? -1 : 1;
      let c = columns.findIndex((col) => col.id === card.column) + step;
      while (columns[c] && listOf(columns[c]!.id).length === 0) c += step;
      const next = columns[c] ? listOf(columns[c]!.id) : [];
      target = next[Math.min(i, next.length - 1)]?.id;
    } else return;
    e.preventDefault();
    focusCard(target);
  };

  // ── 끌어 옮기기(마우스). 손가락 · 키보드는 옮기기 메뉴 ──
  const dropIndex = (e: DragEvent<HTMLElement>, column: string) => {
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-card-id]')].filter(
      (el) => el.closest('[data-column]')?.getAttribute('data-column') === column,
    );
    const at = items.findIndex((el) => {
      const r = el.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2;
    });
    return at === -1 ? items.length : at;
  };
  const onDragOver = (e: DragEvent<HTMLElement>, col: KanbanColumn) => {
    if (!dragId || col.locked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const index = dropIndex(e, col.id);
    if (drop?.column !== col.id || drop.index !== index) setDrop({ column: col.id, index });
  };
  const onDrop = (e: DragEvent<HTMLElement>, col: KanbanColumn) => {
    e.preventDefault();
    const card = cards.find((c) => c.id === dragId);
    const index = drop?.column === col.id ? drop.index : dropIndex(e, col.id);
    setDrop(null);
    setDragId(null);
    if (!card || col.locked || !onMove) return;
    const list = listOf(col.id);
    const from = list.findIndex((c) => c.id === card.id);
    // 같은 칸 안에서 아래로 옮기면 빠진 자리만큼 하나 줄어든다
    const to = from !== -1 && from < index ? index - 1 : index;
    if (from === to) return;
    onMove(card.id, col.id, to);
  };

  const renderHead = (col: KanbanColumn, list: readonly KanbanCardItem[], withTitle: boolean) => (
    <div className="tl-kanban-board__head">
      {withTitle ? (
        <span className="tl-kanban-board__title-row">
          <StatusDot tone={col.tone ?? 'neutral'}>{col.title}</StatusDot>
          <span className="tl-kanban-board__count" aria-hidden="true">
            {formatCount(list.length, 999)}
          </span>
          {col.trailing && <span className="tl-kanban-board__trailing">{col.trailing}</span>}
        </span>
      ) : null}
      {(showSum || (!withTitle && col.trailing)) && (
        <span className="tl-kanban-board__sum-row">
          {showSum && (
            <span className="tl-kanban-board__sum">
              {formatAmount(sumOf(list))}
              <span className="tl-kanban-board__unit">{t('common.unitWon')}</span>
            </span>
          )}
          {/* 좁은 화면은 단계 이름이 탭에 있어 작은 글자를 합계 줄 오른쪽에 둔다 */}
          {!withTitle && col.trailing && (
            <span className="tl-kanban-board__trailing">{col.trailing}</span>
          )}
        </span>
      )}
      {col.caption && <span className="tl-kanban-board__caption">{col.caption}</span>}
    </div>
  );

  const renderCardShell = (card: KanbanCardItem, index: number, col: KanbanColumn) => {
    const movable = !!onMove && !card.locked;
    const targets = columns.filter((c) => c.id !== card.column);
    const content = renderCard ? (
      renderCard(card)
    ) : (
      <KanbanCard card={card} today={today} warnDays={warnDays} />
    );
    return (
      <li
        key={card.id}
        className="tl-kanban-board__item"
        data-drop={drop?.column === col.id && drop.index === index ? 'before' : undefined}
      >
        <div
          className="tl-kanban-card"
          data-card-id={card.id}
          data-active={card.id === activeCardId || undefined}
          data-movable={movable || undefined}
          data-dragging={card.id === dragId || undefined}
          draggable={canDrag && movable}
          onDragStart={(e) => {
            if (!canDrag || !movable) return;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.id);
            setDragId(card.id);
          }}
          onDragEnd={() => {
            setDragId(null);
            setDrop(null);
          }}
        >
          {onCardPress ? (
            <button
              type="button"
              className="tl-kanban-card__press tl-focusable"
              data-card-focus={card.id}
              aria-current={card.id === activeCardId ? 'true' : undefined}
              onClick={() => onCardPress(card)}
              onKeyDown={(e) => onCardKey(e, card)}
            >
              {content}
            </button>
          ) : (
            <div className="tl-kanban-card__press">{content}</div>
          )}
          {movable && (
            <span className="tl-kanban-card__menu">
              <Menu
                title={t('kanbanBoard.moveTo')}
                items={[
                  { type: 'label', label: t('kanbanBoard.moveTo') },
                  ...targets.map((c) => ({
                    id: c.id,
                    label: c.title,
                    disabled: c.locked,
                    onSelect: () => move(card, c.id, listOf(c.id).length),
                  })),
                ]}
                trigger={
                  <IconButton
                    size="sm"
                    icon="ellipsis"
                    label={t('kanbanBoard.move', { title: card.title })}
                    {...(onCardPress ? {} : { 'data-card-focus': card.id })}
                  />
                }
              />
            </span>
          )}
        </div>
      </li>
    );
  };

  const renderCards = (col: KanbanColumn, list: readonly KanbanCardItem[]) => (
    <ul
      className="tl-kanban-board__cards"
      data-drop-end={drop?.column === col.id && drop.index === list.length ? '' : undefined}
    >
      {list.map((card, i) => renderCardShell(card, i, col))}
      {list.length === 0 && <li className="tl-kanban-board__empty">{t('kanbanBoard.empty')}</li>}
    </ul>
  );

  const dropProps = (col: KanbanColumn) =>
    canDrag
      ? {
          onDragOver: (e: DragEvent<HTMLElement>) => onDragOver(e, col),
          onDrop: (e: DragEvent<HTMLElement>) => onDrop(e, col),
          onDragLeave: (e: DragEvent<HTMLElement>) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              setDrop((d) => (d?.column === col.id ? null : d));
          },
        }
      : {};

  // 좁은 화면: 단계 탭(건수가 한눈에) + 고른 단계의 카드 한 열. 옮기기 메뉴는 아래 시트로 열린다
  if (narrow) {
    return (
      <div
        ref={root}
        role="region"
        aria-label={label}
        className={cx('tl-kanban-board', className)}
        id={id}
        data-testid={testID}
        data-layout="tabs"
      >
        <Tabs
          label={label}
          value={columns.some((c) => c.id === stage) ? stage : columns[0]?.id}
          onChange={setStage}
          items={columns.map((col) => {
            const list = listOf(col.id);
            return {
              value: col.id,
              label: col.title,
              count: list.length,
              content: (
                <div className="tl-kanban-board__column" data-column={col.id}>
                  {renderHead(col, list, false)}
                  {renderCards(col, list)}
                </div>
              ),
            };
          })}
        />
      </div>
    );
  }

  return (
    <div
      ref={root}
      role="region"
      aria-label={label}
      className={cx('tl-kanban-board', className)}
      id={id}
      data-testid={testID}
      data-layout="columns"
    >
      {columns.map((col) => {
        const list = listOf(col.id);
        return (
          <section
            key={col.id}
            role="group"
            aria-label={t('kanbanBoard.column', { title: col.title, count: list.length })}
            className="tl-kanban-board__column"
            data-column={col.id}
            data-drop-target={(drop?.column === col.id && !!dragId) || undefined}
            {...dropProps(col)}
          >
            {renderHead(col, list, true)}
            {renderCards(col, list)}
          </section>
        );
      })}
    </div>
  );
}
KanbanBoard.displayName = KanbanBoardContract.name;
