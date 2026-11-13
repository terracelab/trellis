import {
  ComposerContract,
  formatQuantity,
  type ComposerCommand,
  type ComposerMention,
  type ComposerProps,
  type ComposerSendMeta,
} from '@terracelab/trellis-contracts';
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Attachment } from '../Attachment/Attachment.js';
import { Avatar } from '../Avatar/Avatar.js';
import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';
import { SuggestionChips } from '../SuggestionChips/SuggestionChips.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';

export type ComposerWebProps = Omit<ComposerProps, 'onSend'> & {
  onSend: (text: string, files: File[], meta?: ComposerSendMeta) => void;
  className?: string;
};

/** 글자 수는 제한의 이 비율부터 보인다(평소에는 숫자가 없다) */
const COUNT_FROM = 0.8;
/** 멘션 · 명령 목록에 보이는 최대 개수 */
const MAX_OPTIONS = 8;

/** 커서 앞 글자에서 찾은 "@이름" · "/명령" 조각 */
interface Trigger {
  kind: 'mention' | 'command';
  /** "@" · "/"의 위치 */
  start: number;
  /** 커서 위치(바꿀 끝) */
  end: number;
  query: string;
}

/** 명령은 글 맨 앞의 "/"만, 멘션은 글 처음이나 띄어쓰기 뒤의 "@"만 부른다(메일 주소의 @는 부르지 않는다) */
function findTrigger(
  text: string,
  caret: number,
  mentions: boolean,
  commands: boolean,
): Trigger | null {
  const before = text.slice(0, caret);
  if (commands) {
    const m = /^\/([^\s/]*)$/.exec(before);
    if (m) return { kind: 'command', start: 0, end: caret, query: m[1] ?? '' };
  }
  if (mentions) {
    const m = /(?:^|\s)@([^\s@]*)$/.exec(before);
    if (m) {
      const query = m[1] ?? '';
      return { kind: 'mention', start: caret - query.length - 1, end: caret, query };
    }
  }
  return null;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

type Option =
  { kind: 'mention'; item: ComposerMention } | { kind: 'command'; item: ComposerCommand };

function optionsOf(
  trigger: Trigger | null,
  mentions: readonly ComposerMention[],
  commands: readonly ComposerCommand[],
): Option[] {
  if (!trigger) return [];
  const q = norm(trigger.query);
  /** 이름이 글자로 시작 0 · 이름에 들어 있음 1 · 보조 글자에만 2 · 없음 -1. 이름이 맞는 것을 먼저 보인다 */
  const rank = (name: string, meta = '') => {
    if (!q) return 0;
    const n = norm(name);
    if (n.startsWith(q)) return 0;
    if (n.includes(q)) return 1;
    return norm(meta).includes(q) ? 2 : -1;
  };
  const pick = <T extends { name: string }>(list: readonly T[], metaOf: (x: T) => string) =>
    list
      .map((item, i) => ({ item, i, r: rank(item.name, metaOf(item)) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .slice(0, MAX_OPTIONS)
      .map((x) => x.item);
  if (trigger.kind === 'command')
    return pick(commands, (c) => c.description ?? '').map((item) => ({ kind: 'command', item }));
  return pick(mentions, (p) => p.meta ?? '').map((item) => ({ kind: 'mention', item }));
}

/** 글에 "@이름"이 남아 있는 사람 id(글에 나온 순서, 중복 없음) */
function mentionedIds(text: string, mentions: readonly ComposerMention[]): string[] {
  const hits: { id: string; at: number }[] = [];
  for (const p of mentions) {
    const re = new RegExp(
      `(?:^|\\s)@${p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[\\s.,!?])`,
    );
    const m = re.exec(text);
    if (m) hits.push({ id: p.id, at: m.index });
  }
  return [...new Set(hits.sort((a, b) => a.at - b.at).map((h) => h.id))];
}

export function Composer({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onSend,
  attachable = true,
  accept,
  maxLength,
  maxRows = 6,
  enterToSend = true,
  loading = false,
  disabled,
  sendLabel,
  sticky = false,
  suggestions,
  mentions,
  commands,
  onCommand,
  id,
  testID,
  className,
}: ComposerWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, disabled });
  const countId = useId();
  const listId = useId();
  const [inner, setInner] = useState(defaultValue ?? '');
  const text = value ?? inner;
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const canSend = !field.disabled && !loading && (text.trim() !== '' || files.length > 0);
  const counted = maxLength != null && text.length >= maxLength * COUNT_FROM;

  // 멘션 · 명령 목록(PG-33): 커서 앞 "@" · "/" 조각으로 연다
  const hasMentions = !!mentions && mentions.length > 0;
  const hasCommands = !!commands && commands.length > 0;
  const assisted = hasMentions || hasCommands;
  const [caret, setCaret] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [active, setActive] = useState({ key: '', index: 0 });
  const [announce, setAnnounce] = useState('');
  const pendingCaret = useRef<number | null>(null);
  const trigger =
    assisted && focused && caret != null
      ? findTrigger(text, caret, hasMentions, hasCommands)
      : null;
  const triggerKey = trigger ? `${trigger.kind}:${trigger.start}:${trigger.query}` : '';
  const options = optionsOf(trigger, mentions ?? [], commands ?? []);
  const listOpen =
    trigger != null &&
    options.length > 0 &&
    !field.disabled &&
    dismissed !== `${trigger.kind}:${trigger.start}`;
  const activeIndex =
    active.key === triggerKey ? Math.min(active.index, Math.max(0, options.length - 1)) : 0;

  const setText = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const syncCaret = () => {
    const el = inputRef.current;
    if (el) setCaret(el.selectionStart === el.selectionEnd ? el.selectionStart : null);
  };

  const send = () => {
    if (!canSend) return;
    const trimmed = text.trim();
    const command = commands?.find(
      (c) => trimmed === `/${c.name}` || trimmed.startsWith(`/${c.name} `),
    );
    // meta는 멘션 · 명령을 쓸 때만 넘긴다(없으면 지금처럼 글 · 파일 둘)
    if (assisted)
      onSend(trimmed, files, {
        mentions: mentionedIds(trimmed, mentions ?? []),
        ...(command ? { command: command.id } : {}),
      });
    else onSend(trimmed, files);
    setText('');
    setFiles([]);
    setDismissed(null);
    inputRef.current?.focus();
  };

  const choose = (option: Option) => {
    if (!trigger) return;
    const insert = `${option.kind === 'mention' ? '@' : '/'}${option.item.name} `;
    const next = text.slice(0, trigger.start) + insert + text.slice(trigger.end);
    setText(maxLength != null ? next.slice(0, maxLength) : next);
    const at = Math.min(trigger.start + insert.length, maxLength ?? Number.MAX_SAFE_INTEGER);
    pendingCaret.current = at;
    setCaret(at);
    setAnnounce(t('composer.inserted', { name: insert.trim() }));
    if (option.kind === 'command') onCommand?.(option.item.id);
  };

  // 줄 수: 1줄에서 maxRows줄까지 글자에 맞춰 늘어나고, 넘으면 칸 안에서 스크롤한다
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    // 목록에서 고른 뒤 커서를 넣은 글자 뒤로
    if (pendingCaret.current != null) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
    el.rows = 1;
    // 빈 칸은 한 줄(긴 placeholder가 줄을 늘리지 않게)
    if (!text) return;
    const style = getComputedStyle(el);
    const line = Number.parseFloat(style.lineHeight);
    if (!line) return;
    const pad = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    el.rows = Math.min(maxRows, Math.max(1, Math.round((el.scrollHeight - pad) / line)));
  }, [text, maxRows]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 조합 중 키는 글자 확정이다. Safari는 확정 뒤 keyCode 229인 Enter를 한 번 더 보낸다
    if (e.nativeEvent.isComposing || composing.current || e.nativeEvent.keyCode === 229) return;
    if (listOpen && trigger) {
      const n = options.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setActive({ key: triggerKey, index: (activeIndex + step + n) % n });
        return;
      }
      if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        const option = options[activeIndex];
        if (option) choose(option);
        return;
      }
      if (e.key === 'Escape') {
        // 옆 칸 · 시트가 같은 Escape로 닫히지 않게 처리했다고 알린다
        e.preventDefault();
        e.stopPropagation();
        setDismissed(`${trigger.kind}:${trigger.start}`);
        return;
      }
    }
    if (e.key !== 'Enter') return;
    const withModifier = e.ctrlKey || e.metaKey;
    const sends = enterToSend ? !e.shiftKey && !e.altKey : withModifier;
    if (!sends) return;
    e.preventDefault();
    send();
  };

  const describedBy = [field.describedBy, counted ? countId : undefined].filter(Boolean).join(' ');
  const optionId = (i: number) => `${listId}-${i}`;

  const input = (
    <textarea
      ref={inputRef}
      className="tl-composer__input tl-focusable"
      id={field.id}
      rows={1}
      value={text}
      placeholder={placeholder ?? t('composer.placeholder')}
      aria-label={field.labelId ? undefined : (label ?? t('composer.label'))}
      aria-describedby={describedBy || undefined}
      {...(assisted
        ? {
            'aria-autocomplete': 'list' as const,
            'aria-controls': listOpen ? listId : undefined,
            'aria-activedescendant': listOpen ? optionId(activeIndex) : undefined,
          }
        : {})}
      disabled={field.disabled}
      maxLength={maxLength}
      enterKeyHint={enterToSend ? 'send' : 'enter'}
      onChange={(e) => {
        setText(e.target.value);
        if (assisted) {
          const el = e.target;
          setCaret(el.selectionStart === el.selectionEnd ? el.selectionStart : null);
          setDismissed(null);
        }
      }}
      onKeyDown={onKeyDown}
      {...(assisted
        ? {
            onSelect: syncCaret,
            onFocus: () => {
              setFocused(true);
              syncCaret();
            },
            onBlur: () => setFocused(false),
          }
        : {})}
      onCompositionStart={() => {
        composing.current = true;
      }}
      onCompositionEnd={() => {
        composing.current = false;
      }}
    />
  );

  return (
    <div
      className={cx('tl-composer', className)}
      data-testid={testID}
      data-state={field.disabled ? 'disabled' : loading ? 'loading' : undefined}
      data-sticky={sticky || undefined}
      aria-busy={loading || undefined}
    >
      {suggestions && suggestions.length > 0 && (
        // 추천 질문은 입력 칸에 넣기만 한다(고쳐서 보낼 수 있게). 보내기는 사용자가 한다
        <SuggestionChips
          className="tl-composer__suggestions"
          items={suggestions}
          disabled={field.disabled}
          onSelect={(s) => {
            setText(s);
            inputRef.current?.focus();
          }}
        />
      )}
      {files.length > 0 && (
        <Attachment
          className="tl-composer__files"
          layout="chips"
          files={files.map((f) => ({ name: f.name, size: f.size }))}
          onRemove={(name) =>
            setFiles((fs) => {
              const i = fs.findIndex((f) => f.name === name);
              return fs.filter((_, j) => j !== i);
            })
          }
        />
      )}
      <div className="tl-composer__row">
        {attachable && (
          <>
            <IconButton
              className="tl-composer__attach"
              icon="paperclip"
              label={t('composer.attach')}
              disabled={field.disabled}
              onPress={() => fileRef.current?.click()}
            />
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              tabIndex={-1}
              aria-hidden="true"
              accept={accept}
              onChange={(e) => {
                const picked = Array.from(e.currentTarget.files ?? []);
                if (picked.length) setFiles((fs) => [...fs, ...picked]);
                e.currentTarget.value = '';
              }}
            />
          </>
        )}
        {assisted ? (
          <div className="tl-composer__field">
            {listOpen && trigger && (
              // 목록은 입력 칸 위에 뜬다. 포커스는 입력 칸에 두고 aria-activedescendant로 고른 줄을 알린다
              <ul
                className="tl-composer__menu"
                id={listId}
                role="listbox"
                aria-label={t(
                  trigger.kind === 'mention' ? 'composer.mentionList' : 'composer.commandList',
                )}
                data-kind={trigger.kind}
              >
                {options.map((o, i) => (
                  <li
                    key={o.item.id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === activeIndex}
                    className="tl-composer__option"
                    data-active={i === activeIndex || undefined}
                    // 누르는 동안 입력 칸이 포커스를 잃지 않게
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseMove={() =>
                      i !== activeIndex && setActive({ key: triggerKey, index: i })
                    }
                    onClick={() => choose(o)}
                  >
                    {o.kind === 'mention' ? (
                      <>
                        <Avatar
                          name={o.item.name}
                          size={24}
                          decorative
                          {...(o.item.avatarSrc ? { src: o.item.avatarSrc } : {})}
                        />
                        <span className="tl-composer__option-name">{o.item.name}</span>
                        {o.item.meta && (
                          <span className="tl-composer__option-meta">{o.item.meta}</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="tl-composer__option-name">/{o.item.name}</span>
                        {o.item.description && (
                          <span className="tl-composer__option-meta">{o.item.description}</span>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {input}
          </div>
        ) : (
          input
        )}
        {counted && maxLength != null && (
          <span
            className="tl-composer__count"
            id={countId}
            data-full={text.length >= maxLength || undefined}
          >
            {formatQuantity(text.length)} / {formatQuantity(maxLength)}
          </span>
        )}
        <Button
          className="tl-composer__send"
          variant="primary"
          icon="send"
          loading={loading}
          disabled={!canSend && !loading}
          onPress={send}
        >
          {sendLabel ?? t('composer.send')}
        </Button>
      </div>
      {assisted && (
        // 라이브 영역은 처음부터 있어야 바뀐 글자가 읽힌다
        <span className="tl-sr-only" role="status">
          {listOpen && trigger
            ? t(
                trigger.kind === 'mention' ? 'composer.mentionResults' : 'composer.commandResults',
                {
                  count: options.length,
                },
              )
            : announce}
        </span>
      )}
    </div>
  );
}
Composer.displayName = ComposerContract.name;
