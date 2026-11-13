import {
  formatDate,
  MessageThreadContract,
  type AttachmentFile,
  type CitationSource,
  type MessageThreadAuthor,
  type MessageThreadItem,
  type MessageThreadProps,
} from '@terracelab/trellis-contracts';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Attachment } from '../Attachment/Attachment.js';
import { Avatar } from '../Avatar/Avatar.js';
import { Button } from '../Button/Button.js';
import { Citation } from '../Citation/Citation.js';
import { Dialog } from '../Dialog/Dialog.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Menu } from '../Menu/Menu.js';
import { RichText } from '../RichText/RichText.js';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';

export type MessageThreadWebItem = Omit<MessageThreadItem, 'extra' | 'steps'> & {
  /** 말풍선 아래 내용(업무 카드) */
  extra?: ReactNode;
  /** answer: 본문 위 실행 단계(RunSteps collapsible) */
  steps?: ReactNode;
};

/** "복사했습니다"를 보이는 시간 */
const COPIED_MS = 2000;

export type MessageThreadWebProps = Omit<MessageThreadProps, 'messages'> & {
  messages: readonly MessageThreadWebItem[];
  className?: string;
};

/** 아래에서 이 거리(화면 점) 안이면 "맨 아래를 보는 중"으로 보고 새 메시지에서 따라 내려간다 */
const NEAR_BOTTOM = 64;

const dayOf = (at: string) => at.slice(0, 10);
const timeOf = (at: string) => at.slice(11, 16);
/** 분 단위 시각(묶기 · 같은 분 판단). 형식이 틀리면 NaN */
function minutesOf(at: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(at);
  if (!m) return Number.NaN;
  const [, y, mo, d, h, mi] = m.map(Number) as [number, number, number, number, number, number];
  return Date.UTC(y, mo - 1, d, h, mi) / 60_000;
}

/** http(s) 주소만 링크로 바꾼다. 끝의 문장 부호는 링크에서 뺀다 */
const URL_RE = /(https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]])/g;
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 글 안 "@이름"(mentions에 있는 이름만)을 멘션 표시로 바꾼다 */
function markMentions(text: string, names: readonly string[], key: string): ReactNode[] {
  if (names.length === 0) return [text];
  const re = new RegExp(`(@(?:${names.map(escapeRe).join('|')}))(?=$|[\\s.,!?])`, 'g');
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <span key={`${key}-${i}`} className="tl-message-thread__mention">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function linkify(text: string, mentions: readonly string[] = []): ReactNode[] {
  return text.split(URL_RE).flatMap((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="tl-message-thread__link tl-focusable"
      >
        {part}
      </a>
    ) : (
      markMentions(part, mentions, String(i))
    ),
  );
}

/** 지금 입력 중인 사람 한 줄: 둘까지는 이름을 모두, 셋부터는 첫 이름 외 N명 */
function typingText(names: readonly string[], t: Translate): string {
  if (names.length <= 2) return t('messageThread.typing', { names: names.join(' · ') });
  return t('messageThread.typingMany', { name: names[0]!, count: names.length - 1 });
}

/** 원문으로 갔다는 표시(테두리)를 보이는 시간 */
const FLASH_MS = 1600;

type Row =
  | { kind: 'day'; key: string; day: string }
  | { kind: 'new'; key: string }
  | { kind: 'system'; key: string; message: MessageThreadWebItem }
  | {
      kind: 'run';
      key: string;
      own: boolean;
      author: MessageThreadAuthor | undefined;
      messages: MessageThreadWebItem[];
    };

/** 날짜 구분선 · 새 메시지 구분선 · 알림 줄 · 보낸 사람 묶음(같은 사람이 groupMinutes 안에 이어 보낸 것) */
function toRows(
  messages: readonly MessageThreadWebItem[],
  unreadFrom: string | undefined,
  groupMinutes: number,
): Row[] {
  const rows: Row[] = [];
  let run: Extract<Row, { kind: 'run' }> | null = null;
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const day = dayOf(m.at);
    if (!prev || dayOf(prev.at) !== day) {
      rows.push({ kind: 'day', key: `day-${day}-${m.id}`, day });
      run = null;
    }
    if (m.id === unreadFrom) {
      rows.push({ kind: 'new', key: `new-${m.id}` });
      run = null;
    }
    if (m.kind === 'system') {
      rows.push({ kind: 'system', key: m.id, message: m });
      run = null;
      return;
    }
    const own = Boolean(m.own);
    const last = run?.messages[run.messages.length - 1];
    const joins =
      run != null &&
      last != null &&
      run.own === own &&
      run.author?.id === m.author?.id &&
      minutesOf(m.at) - minutesOf(last.at) < groupMinutes;
    if (joins && run) {
      run.messages.push(m);
      return;
    }
    run = { kind: 'run', key: `run-${m.id}`, own, author: m.author, messages: [m] };
    rows.push(run);
  });
  return rows;
}

/** 읽음 · 보내는 중 · 실패 글자(내 메시지) */
function statusText(m: MessageThreadWebItem, t: Translate): string | null {
  if (m.status === 'sending') return t('messageThread.sending');
  if (m.status === 'failed') return t('messageThread.failed');
  if (!m.own || m.unread == null) return null;
  return m.unread > 0 ? t('messageThread.unread', { count: m.unread }) : t('messageThread.read');
}

export function MessageThread({
  messages,
  label,
  unreadFrom,
  hasOlder = false,
  onLoadOlder,
  loading = false,
  onRetry,
  today,
  groupMinutes = 5,
  height = 'auto',
  empty,
  onCopy,
  onRegenerate,
  onFeedback,
  onCitationOpen,
  onReact,
  reactionOptions,
  onReply,
  typing,
  id,
  testID,
  className,
}: MessageThreadWebProps) {
  const t = useMessages();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [preview, setPreview] = useState<AttachmentFile | null>(null);
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );
  const known = new Set(messages.map((m) => m.id));
  const typingNames = typing ?? [];
  const picker = onReact && reactionOptions && reactionOptions.length > 0;
  const hasAnswer = messages.some((m) => m.kind === 'answer');
  const seen = useRef<{ first?: string; last?: string; height: number; nearBottom: boolean }>({
    height: 0,
    nearBottom: true,
  });
  const todayIso = today ?? formatDate(new Date());
  const rows = toRows(messages, unreadFrom, groupMinutes);
  const fill = height === 'fill';
  const firstId = messages[0]?.id;
  const lastMessage = messages[messages.length - 1];

  // 스크롤: 처음에는 새 메시지 구분선(없으면 맨 아래), 위에 이전 메시지가 붙으면 보던 자리 유지,
  // 아래에 새 메시지가 오면 맨 아래를 보던 중이거나 내가 보낸 것일 때만 따라 내려간다
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !fill) return;
    const prev = seen.current;
    if (prev.first === undefined && prev.last === undefined) {
      const divider = el.querySelector<HTMLElement>('[data-new-divider]');
      // 루트가 position: relative라 구분선의 offsetTop은 스크롤 상자 기준이다
      el.scrollTop = divider ? divider.offsetTop : el.scrollHeight;
    } else if (firstId !== prev.first && lastMessage?.id === prev.last) {
      el.scrollTop += el.scrollHeight - prev.height;
    } else if (lastMessage?.id !== prev.last && (prev.nearBottom || lastMessage?.own)) {
      el.scrollTop = el.scrollHeight;
    }
    seen.current = {
      first: firstId,
      last: lastMessage?.id,
      height: el.scrollHeight,
      nearBottom: el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM,
    };
  }, [fill, firstId, lastMessage?.id, lastMessage?.own]);

  // 입력 중 줄이 생기면 맨 아래를 보던 중일 때만 따라 내려간다
  const typingShown = typingNames.length > 0;
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !fill || !typingShown || !seen.current.nearBottom) return;
    el.scrollTop = el.scrollHeight;
  }, [fill, typingShown]);

  /** 답글 인용을 누르면 원문으로 스크롤하고 잠깐 테두리로 보인다. 포커스도 옮겨 화면 읽기가 원문을 읽는다 */
  const jumpTo = (target: string) => {
    const nodes = scrollRef.current?.querySelectorAll<HTMLElement>('[data-message-id]') ?? [];
    const el = [...nodes].find((x) => x.dataset['messageId'] === target);
    if (!el) return;
    el.scrollIntoView?.({ block: 'center' });
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
    setFlash(target);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS);
  };

  const copy = async (m: MessageThreadWebItem) => {
    try {
      await navigator.clipboard.writeText(m.text ?? '');
    } catch {
      return; // 권한이 없으면 표시를 바꾸지 않는다
    }
    setCopied(m.id);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(null), COPIED_MS);
    onCopy?.(m.id);
  };

  /** 에이전트 답변: 말풍선 없이 폭을 쓴다. 실행 단계 → 본문(RichText) → 파일 · 결과 카드 → 출처 → 동작 줄 */
  const renderAnswer = (m: MessageThreadWebItem, named: boolean, showTime: boolean) => {
    const streaming = Boolean(m.streaming);
    const failed = m.status === 'failed';
    const open = onCitationOpen ? { onOpen: (s: CitationSource) => onCitationOpen(m.id, s) } : {};
    const citations = m.citations ?? [];
    return (
      <div
        key={m.id}
        className="tl-message-thread__message"
        data-message-id={m.id}
        data-kind="answer"
        data-status={m.status}
      >
        {!named && <span className="tl-sr-only">{m.author?.name ?? ''}</span>}
        <div className="tl-message-thread__answer">
          {m.steps != null && <div className="tl-message-thread__steps">{m.steps}</div>}
          {(m.text || streaming) && (
            <RichText
              text={m.text ?? ''}
              streaming={streaming}
              {...(citations.length ? { citations } : {})}
              {...(onCitationOpen
                ? { onCitationOpen: (s: CitationSource) => onCitationOpen(m.id, s) }
                : {})}
            />
          )}
          {m.files && m.files.length > 0 && (
            <Attachment files={m.files} layout="chips" className="tl-message-thread__files" />
          )}
          {m.extra != null && <div className="tl-message-thread__extra">{m.extra}</div>}
          {!streaming && citations.length > 0 && (
            <Citation sources={citations} className="tl-message-thread__citations" {...open} />
          )}
          {failed && (
            <p className="tl-message-thread__answer-error">{t('messageThread.answerFailed')}</p>
          )}
          {(!streaming || showTime) && (
            <div className="tl-message-thread__answer-foot">
              {!streaming && (
                <div
                  className="tl-message-thread__actions"
                  role="group"
                  aria-label={t('messageThread.answerActions')}
                >
                  {m.text && !failed && (
                    <IconButton
                      size="sm"
                      icon={copied === m.id ? 'check' : 'copy'}
                      label={t('messageThread.copy')}
                      onPress={() => void copy(m)}
                    />
                  )}
                  {onRegenerate && (
                    <IconButton
                      size="sm"
                      icon="refresh-cw"
                      label={t('messageThread.regenerate')}
                      onPress={() => onRegenerate(m.id)}
                    />
                  )}
                  {onFeedback && !failed && (
                    <>
                      <IconButton
                        size="sm"
                        icon="thumbs-up"
                        label={t('messageThread.good')}
                        pressed={m.feedback === 'good'}
                        onPress={() => onFeedback(m.id, m.feedback === 'good' ? null : 'good')}
                      />
                      <IconButton
                        size="sm"
                        icon="thumbs-down"
                        label={t('messageThread.bad')}
                        pressed={m.feedback === 'bad'}
                        onPress={() => onFeedback(m.id, m.feedback === 'bad' ? null : 'bad')}
                      />
                    </>
                  )}
                </div>
              )}
              {showTime && (
                <time className="tl-message-thread__time" dateTime={m.at.replace(' ', 'T')}>
                  {timeOf(m.at)}
                </time>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessage = (
    m: MessageThreadWebItem,
    j: number,
    run: Extract<Row, { kind: 'run' }>,
  ) => {
    const next = run.messages[j + 1];
    // 시각은 같은 분에 이어 보낸 것 중 마지막에만
    const showTime = !next || timeOf(next.at) !== timeOf(m.at);
    const status = statusText(m, t);
    const named = !run.own && j === 0;
    if (m.kind === 'answer') return renderAnswer(m, named, showTime);
    const images = (m.files ?? []).filter((f) => f.thumb);
    const others = (m.files ?? []).filter((f) => !f.thumb);
    const reactions = (m.reactions ?? []).filter((r) => r.count > 0);
    const reply = m.replyTo;
    const canJump = reply?.id != null && known.has(reply.id);
    const tools = picker || onReply;
    return (
      <div
        key={m.id}
        className="tl-message-thread__message"
        data-message-id={m.id}
        data-status={m.status}
        data-flash={flash === m.id || undefined}
      >
        {!named && (
          <span className="tl-sr-only">
            {run.own ? t('messageThread.own') : (run.author?.name ?? '')}
          </span>
        )}
        <div className="tl-message-thread__line">
          <div className="tl-message-thread__content">
            {reply &&
              (() => {
                // 답글 인용: 왼쪽 띠가 아니라 둘레 1px 상자(D-57). 원문이 대화에 있으면 눌러서 간다
                const inner = (
                  <>
                    <span className="tl-sr-only">
                      {t('messageThread.replyTo', { author: reply.author })}
                    </span>
                    <Icon name="reply" size={16} className="tl-message-thread__quote-icon" />
                    <span className="tl-message-thread__quote-author" aria-hidden="true">
                      {reply.author}
                    </span>
                    <span className="tl-message-thread__quote-text">{reply.text}</span>
                    {canJump && (
                      <span className="tl-sr-only">{t('messageThread.openOriginal')}</span>
                    )}
                  </>
                );
                return canJump ? (
                  <button
                    type="button"
                    className="tl-message-thread__quote tl-focusable"
                    onClick={() => jumpTo(reply.id!)}
                  >
                    {inner}
                  </button>
                ) : (
                  <span className="tl-message-thread__quote">{inner}</span>
                );
              })()}
            {m.text ? (
              <p className="tl-message-thread__bubble">{linkify(m.text, m.mentions)}</p>
            ) : null}
            {images.length > 0 && (
              <div className="tl-message-thread__images" data-count={Math.min(images.length, 2)}>
                {images.map((f, k) => (
                  <button
                    key={`${f.name}-${k}`}
                    type="button"
                    className="tl-message-thread__image tl-focusable"
                    aria-label={t('messageThread.imageOpen', { name: f.name })}
                    onClick={() => setPreview(f)}
                  >
                    <img src={f.thumb} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
            {others.length > 0 && (
              <Attachment files={others} layout="chips" className="tl-message-thread__files" />
            )}
            {m.extra != null && <div className="tl-message-thread__extra">{m.extra}</div>}
            {reactions.length > 0 && (
              <div
                className="tl-message-thread__reactions"
                role="group"
                aria-label={t('messageThread.reactions')}
              >
                {reactions.map((r) => {
                  // 이름은 숨은 글자 "확인 2명"이 준다(aria-label을 쓰면 보이는 수와 이름이 어긋난다, 2.5.3)
                  const face = (
                    <>
                      <Icon name={r.icon} size={16} className="tl-message-thread__reaction-icon" />
                      <span aria-hidden="true">{r.count}</span>
                      <span className="tl-sr-only">
                        {t('messageThread.reactionCount', { label: r.label, count: r.count })}
                      </span>
                    </>
                  );
                  return onReact ? (
                    <button
                      key={r.key}
                      type="button"
                      className="tl-message-thread__reaction tl-focusable"
                      data-mine={r.mine || undefined}
                      aria-pressed={Boolean(r.mine)}
                      title={r.label}
                      onClick={() => onReact(m.id, r.key)}
                    >
                      {face}
                    </button>
                  ) : (
                    <span
                      key={r.key}
                      className="tl-message-thread__reaction"
                      data-mine={r.mine || undefined}
                      title={r.label}
                    >
                      {face}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {(showTime || status) && (
            <span className="tl-message-thread__aside">
              {status && (
                <span className="tl-message-thread__status" data-status={m.status}>
                  {status}
                </span>
              )}
              {m.status === 'failed' && onRetry && (
                <button
                  type="button"
                  className="tl-message-thread__retry tl-focusable"
                  onClick={() => onRetry(m.id)}
                >
                  {t('messageThread.retry')}
                </button>
              )}
              {showTime && (
                <time className="tl-message-thread__time" dateTime={m.at.replace(' ', 'T')}>
                  {timeOf(m.at)}
                </time>
              )}
            </span>
          )}
          {tools && m.status !== 'sending' && m.status !== 'failed' && (
            // 가리키거나 안에 포커스가 오면 보이는 동작(반응 추가 · 답글). 키보드로도 닿는다
            <span
              className="tl-message-thread__tools"
              role="group"
              aria-label={t('messageThread.messageActions')}
            >
              {picker && (
                <Menu
                  align={run.own ? 'end' : 'start'}
                  title={t('messageThread.addReaction')}
                  trigger={
                    <IconButton
                      size="xs"
                      icon="smile-plus"
                      label={t('messageThread.addReaction')}
                    />
                  }
                  items={reactionOptions!.map((o) => ({
                    id: o.key,
                    label: o.label,
                    icon: o.icon,
                    onSelect: () => onReact!(m.id, o.key),
                  }))}
                />
              )}
              {onReply && (
                <IconButton
                  size="xs"
                  icon="reply"
                  label={t('messageThread.reply')}
                  onPress={() => onReply(m.id)}
                />
              )}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-label={label}
      aria-busy={loading || undefined}
      tabIndex={fill ? 0 : undefined}
      id={id}
      data-testid={testID}
      data-height={height}
      data-state={loading ? 'loading' : undefined}
      className={cx('tl-message-thread', fill && 'tl-focusable', className)}
      onScroll={(e) => {
        const el = e.currentTarget;
        seen.current.nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
      }}
    >
      {hasOlder && (
        <div className="tl-message-thread__older">
          <Button size="sm" variant="ghost" icon="history" loading={loading} onPress={onLoadOlder}>
            {t('messageThread.older')}
          </Button>
        </div>
      )}
      {messages.length === 0 && (
        <p className="tl-message-thread__empty">{empty ?? t('messageThread.empty')}</p>
      )}
      {rows.map((row) => {
        if (row.kind === 'day')
          return (
            <div key={row.key} className="tl-message-thread__divider">
              <span>
                {formatDate(row.day, 'mdw')}
                {row.day === todayIso ? ` · ${t('messageThread.today')}` : ''}
              </span>
            </div>
          );
        if (row.kind === 'new')
          return (
            <div key={row.key} className="tl-message-thread__divider" data-new-divider>
              <span>{t('messageThread.newMessages')}</span>
            </div>
          );
        if (row.kind === 'system')
          return (
            <p key={row.key} className="tl-message-thread__system" data-message-id={row.message.id}>
              {row.message.text}{' '}
              <time className="tl-message-thread__time" dateTime={row.message.at.replace(' ', 'T')}>
                {timeOf(row.message.at)}
              </time>
            </p>
          );
        return (
          <div key={row.key} className="tl-message-thread__run" data-own={row.own || undefined}>
            {!row.own && (
              <span className="tl-message-thread__avatar">
                {row.author && (
                  <Avatar
                    name={row.author.name}
                    size={32}
                    decorative
                    {...(row.author.avatarSrc ? { src: row.author.avatarSrc } : {})}
                  />
                )}
              </span>
            )}
            <div className="tl-message-thread__stack">
              {!row.own && row.author && (
                <div className="tl-message-thread__author">
                  <span className="tl-message-thread__name">{row.author.name}</span>
                  {row.author.meta && (
                    <span className="tl-message-thread__meta">{row.author.meta}</span>
                  )}
                </div>
              )}
              {row.messages.map((m, j) => renderMessage(m, j, row))}
            </div>
          </div>
        );
      })}
      {typingShown && (
        // 입력 중 표시는 바뀔 때마다 읽으면 시끄러워 라이브로 읽지 않는다(목록을 훑으면 읽힌다)
        <p className="tl-message-thread__typing" aria-live="off">
          <span className="tl-message-thread__typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {typingText(typingNames, t)}
        </p>
      )}
      {hasAnswer && (
        // 라이브 영역은 처음부터 있어야 바뀐 글자가 읽힌다
        <span className="tl-sr-only" role="status">
          {copied ? t('common.copied') : ''}
        </span>
      )}
      {preview && (
        <Dialog
          open
          onOpenChange={(open) => !open && setPreview(null)}
          title={preview.name}
          size="lg"
          footer={
            preview.href ? (
              <a
                className="tl-message-thread__link tl-focusable"
                href={preview.href}
                download={preview.name}
              >
                {t('messageThread.imageDownload')}
              </a>
            ) : undefined
          }
        >
          <img
            className="tl-message-thread__preview"
            src={preview.href ?? preview.thumb}
            alt={preview.name}
          />
        </Dialog>
      )}
    </div>
  );
}
MessageThread.displayName = MessageThreadContract.name;
