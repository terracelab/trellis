import {
  ToastContract,
  type StatusTone,
  type ToastOptions,
  type ToastProps,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import { useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { Toast as T } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import {
  resolveToastDuration,
  TOAST_DURATION,
  ToastPreferenceContext,
  type ToastPreference,
} from '../_internal/toastPreference.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

/** neutral은 아이콘 없이 띠만 회색 */
const TONE_ICON: Record<StatusTone, IconName | null> = {
  neutral: null,
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

interface ToastData {
  tone: StatusTone;
  /** 같은 제목 · 같은 tone이 몇 번 왔는지(1이면 표시 없음) */
  count: number;
}

/** 앱 하나에 큐 하나. ToastProvider가 그리고 useToast가 넣는다(Provider 밖에서 불러도 같은 큐) */
const manager = T.createToastManager();

/**
 * 닫히지 않은 토스트(새것이 앞). Base UI 큐와 같은 순서라 앞에서 limit개가 화면에 보이는 것이다.
 * 같은 제목 · 같은 tone을 찾아 ×N으로 세는 데 쓴다.
 */
interface Live {
  id: string;
  key: string;
  count: number;
  /** 합쳐진 호출마다 받은 onClose. 닫힐 때 모두 부른다 */
  closers: (() => void)[];
}
let live: Live[] = [];
/** 그려진 ToastProvider 수. 없으면 큐가 토스트를 받지 않으므로 세지도 않는다 */
let providers = 0;
let limit = 3;
let preference: ToastPreference = 'default';

const keyOf = (tone: StatusTone, title: string) => `${tone}\u0000${title}`;

function forget(id: string) {
  const entry = live.find((l) => l.id === id);
  live = live.filter((l) => l.id !== id);
  entry?.closers.forEach((close) => close());
}

/** ×N이 늘 때 정중하게 읽힐 문장(ToastProvider의 숨은 상태 영역이 그린다) */
interface Repeat {
  title: string;
  count: number;
}
let repeat: Repeat | null = null;
const repeatListeners = new Set<() => void>();
function announceRepeat(next: Repeat) {
  repeat = next;
  repeatListeners.forEach((l) => l());
}
function subscribeRepeat(l: () => void) {
  repeatListeners.add(l);
  return () => {
    repeatListeners.delete(l);
  };
}

export interface ToastApi {
  /**
   * 토스트를 띄우고 id를 돌려준다. 같은 id로 다시 부르면 내용만 바꾼다.
   * 같은 제목 · 같은 tone이 보이는 중이면 새로 쌓지 않고 그 토스트의 ×N을 올린다(같은 id를 돌려준다)
   */
  show(options: ToastOptions): string;
  close(id: string): void;
}

function show({
  id,
  title,
  description,
  tone = 'neutral',
  action,
  duration,
  onClose,
}: ToastOptions): string {
  const key = keyOf(tone, title);
  const tracked = providers > 0;
  let targetId = id;
  let count = 1;
  let closers: (() => void)[] = [];
  // id를 준 호출은 내용 바꾸기라 세지 않는다
  if (tracked && !id) {
    const index = live.findIndex((l) => l.key === key);
    const prev = live[index];
    if (prev) {
      count = prev.count + 1;
      if (index < limit) {
        // 보이는 토스트: 그 자리에서 세고 시간을 다시 잰다
        targetId = prev.id;
        closers = prev.closers;
      } else {
        // 한도 밖에 숨은 토스트: 닫고 맨 앞에 새로(센 수와 onClose는 잇는다)
        closers = prev.closers;
        prev.closers = [];
        manager.close(prev.id);
      }
    }
  }
  if (onClose) closers = [...closers, onClose];
  let toastId = targetId ?? '';
  toastId = manager.add<ToastData>({
    ...(targetId ? { id: targetId } : {}),
    title,
    description,
    type: tone,
    timeout: resolveToastDuration({ tone, hasAction: action != null, duration }, preference),
    // 위험은 바로 읽힌다(assertive). 나머지는 읽던 것을 끊지 않는다
    priority: tone === 'danger' ? 'high' : 'low',
    data: { tone, count },
    onClose: () => forget(toastId),
    actionProps: action
      ? {
          children: action.label,
          onClick: () => {
            action.onPress();
            manager.close(toastId);
          },
        }
      : undefined,
  });
  if (tracked) {
    const entry = live.find((l) => l.id === toastId);
    if (entry) Object.assign(entry, { key, count, closers });
    else live = [{ id: toastId, key, count, closers }, ...live];
    if (count > 1) announceRepeat({ title, count });
  }
  return toastId;
}

const api: ToastApi = { show, close: (id) => manager.close(id) };

/** 토스트 띄우기 · 닫기. 그리는 것은 앱 루트의 ToastProvider 하나 */
export function useToast(): ToastApi {
  return api;
}

function ToneIcon({ tone }: { tone: StatusTone }) {
  const name = TONE_ICON[tone];
  return name ? (
    <span className="tl-toast__icon">
      <Icon name={name} />
    </span>
  ) : null;
}

function ToastList() {
  const tr = useMessages();
  const { toasts } = T.useToastManager();
  return toasts.map((t) => {
    const data = t.data as ToastData | undefined;
    const tone = data?.tone ?? 'neutral';
    const count = data?.count ?? 1;
    return (
      <T.Root key={t.id} toast={t} className="tl-toast" data-tone={tone}>
        <T.Content className="tl-toast__content">
          <ToneIcon tone={tone} />
          <div className="tl-toast__text">
            <T.Title className="tl-toast__title">
              {t.title}
              {count > 1 && (
                // 보이는 ×N은 숨기고, 늘어난 사실은 ToastProvider의 상태 영역이 한 번 읽는다
                <span className="tl-toast__count" aria-hidden="true">
                  {tr('toast.count', { count })}
                </span>
              )}
            </T.Title>
            {t.description != null && <T.Description className="tl-toast__description" />}
          </div>
          {t.actionProps && <T.Action className="tl-toast__action tl-focusable" />}
          <T.Close className="tl-toast__close tl-focusable" aria-label={tr('common.close')}>
            <Icon name="x" />
          </T.Close>
        </T.Content>
      </T.Root>
    );
  });
}

/** ×N이 늘면 "같은 알림 N번째. 제목"을 정중하게 한 번 읽는다(보이는 ×N은 aria-hidden) */
function RepeatAnnouncer() {
  const t = useMessages();
  const last = useSyncExternalStore(
    subscribeRepeat,
    () => repeat,
    () => null,
  );
  return (
    <div className="tl-sr-only" role="status" aria-live="polite" aria-atomic="true">
      {last ? t('toast.repeated', { count: last.count, title: last.title }) : ''}
    </div>
  );
}

/**
 * 앱 루트를 감싼다. 토스트는 우하단에 쌓여 그려진다(최대 limit개, 마우스를 올리면 펼침).
 * 표시 시간 앱 설정(ToastPreferenceContext · TrellisProvider)을 읽어 그 뒤로 뜨는 토스트에 쓴다.
 */
export function ToastProvider({
  children,
  limit: max = 3,
}: {
  children?: ReactNode;
  limit?: number;
}) {
  const t = useMessages();
  // show()는 훅 밖에서도 불리므로 지금 설정을 모듈에 둔다. 렌더에서 바로 넣어 자식의 첫 effect도 이 값을 본다
  preference = useContext(ToastPreferenceContext);
  limit = max;
  useEffect(() => {
    providers += 1;
    return () => {
      providers -= 1;
      // 마지막 Provider가 사라지면 큐도 비므로 센 것도 지운다(onClose는 부르지 않는다)
      if (providers === 0) {
        live = [];
        repeat = null;
      }
    };
  }, []);
  return (
    <T.Provider toastManager={manager} limit={max} timeout={TOAST_DURATION.default}>
      {children}
      <RepeatAnnouncer />
      <T.Portal>
        <T.Viewport className="tl-toast__viewport" aria-label={t('common.notifications')}>
          <ToastList />
        </T.Viewport>
      </T.Portal>
    </T.Provider>
  );
}

/** 토스트 한 장의 정적 표현(문서 · 시각 회귀 · 화면 안 고정 안내). 띄우는 것은 useToast().show */
export function Toast({
  title,
  description,
  tone = 'neutral',
  action,
  onClose,
  id,
  testID,
  className,
}: ToastProps & { className?: string }) {
  const t = useMessages();
  return (
    <div
      className={cx('tl-toast', className)}
      id={id}
      data-testid={testID}
      data-tone={tone}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <div className="tl-toast__content">
        <ToneIcon tone={tone} />
        <div className="tl-toast__text">
          <p className="tl-toast__title">{title}</p>
          {description != null && <p className="tl-toast__description">{description}</p>}
        </div>
        {action && (
          <button
            type="button"
            className="tl-toast__action tl-focusable"
            onClick={() => action.onPress()}
          >
            {action.label}
          </button>
        )}
        {onClose && (
          <button
            type="button"
            className="tl-toast__close tl-focusable"
            aria-label={t('common.close')}
            onClick={() => onClose()}
          >
            <Icon name="x" />
          </button>
        )}
      </div>
    </div>
  );
}
Toast.displayName = ToastContract.name;
