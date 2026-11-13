// Toast 표시 시간 규칙 · 앱 설정 · 같은 토스트 ×N(PR-30, component-parity §5 34번)
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resolveToastDuration,
  ToastPreferenceContext,
  type ToastPreference,
} from '../src/_internal/toastPreference.js';
import { ToastProvider, useToast } from '../src/core/index.js';

type Api = ReturnType<typeof useToast>;

function setup(preference: ToastPreference = 'default', limit?: number) {
  let api: Api | null = null;
  function Grab() {
    api = useToast();
    return null;
  }
  const utils = render(
    <ToastPreferenceContext.Provider value={preference}>
      <ToastProvider {...(limit ? { limit } : {})}>
        <Grab />
      </ToastProvider>
    </ToastPreferenceContext.Provider>,
  );
  return { ...utils, api: api! as Api };
}

const later = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('resolveToastDuration', () => {
  it('준 값 → danger 0 → action 10초 → 4초', () => {
    expect(resolveToastDuration({})).toBe(4000);
    expect(resolveToastDuration({ tone: 'success' })).toBe(4000);
    expect(resolveToastDuration({ tone: 'danger' })).toBe(0);
    expect(resolveToastDuration({ hasAction: true })).toBe(10000);
    expect(resolveToastDuration({ tone: 'danger', hasAction: true })).toBe(0);
    expect(resolveToastDuration({ tone: 'danger', duration: 6000 })).toBe(6000);
    expect(resolveToastDuration({ hasAction: true, duration: 3000 })).toBe(3000);
    expect(resolveToastDuration({ duration: 0 })).toBe(0);
  });

  it('길게는 0이 아닌 시간을 두 배로, 직접 닫기는 모두 0', () => {
    expect(resolveToastDuration({}, 'long')).toBe(8000);
    expect(resolveToastDuration({ hasAction: true }, 'long')).toBe(20000);
    expect(resolveToastDuration({ tone: 'danger' }, 'long')).toBe(0);
    expect(resolveToastDuration({}, 'manual')).toBe(0);
    expect(resolveToastDuration({ duration: 3000 }, 'manual')).toBe(0);
  });
});

describe('Toast 표시 시간', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('기본 4초 · action이 있으면 10초 · danger는 직접 닫을 때까지', () => {
    const { api } = setup();
    const plain = vi.fn();
    const undo = vi.fn();
    const danger = vi.fn();
    act(() => {
      api.show({ title: '저장했습니다', onClose: plain });
      api.show({
        title: '거래처 3곳을 삭제했습니다',
        action: { label: '되돌리기', onPress: () => {} },
        onClose: undo,
      });
      api.show({ title: '전송에 실패했습니다', tone: 'danger', onClose: danger });
    });
    later(3999);
    expect(plain).not.toHaveBeenCalled();
    later(1);
    expect(plain).toHaveBeenCalledTimes(1);
    expect(undo).not.toHaveBeenCalled();
    later(6000);
    expect(undo).toHaveBeenCalledTimes(1);
    later(60_000);
    expect(danger).not.toHaveBeenCalled();
    // danger는 숨은 alert 영역에도 제목이 한 번 더 있다. 토스트 자체를 본다
    expect(document.querySelector('.tl-toast[data-tone="danger"]')).toHaveTextContent(
      '전송에 실패했습니다',
    );
  });

  it('duration을 주면 danger도 그 시간에 닫힌다', () => {
    const { api } = setup();
    const onClose = vi.fn();
    act(() => {
      api.show({ title: '연결이 끊겼습니다', tone: 'danger', duration: 5000, onClose });
    });
    later(4999);
    expect(onClose).not.toHaveBeenCalled();
    later(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('앱 설정 길게: 4초 토스트가 8초 뒤에 닫힌다', () => {
    const { api } = setup('long');
    const onClose = vi.fn();
    act(() => {
      api.show({ title: '저장했습니다', onClose });
    });
    later(4000);
    expect(onClose).not.toHaveBeenCalled();
    later(4000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('앱 설정 직접 닫기: duration을 줘도 닫히지 않는다', () => {
    const { api } = setup('manual');
    const onClose = vi.fn();
    act(() => {
      api.show({ title: '저장했습니다', duration: 2000, onClose });
    });
    later(60_000);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('저장했습니다')).toBeInTheDocument();
  });
});

describe('같은 토스트 ×N', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('같은 제목 · 같은 tone은 쌓지 않고 ×N으로 세고 정중하게 한 번 읽힌다', () => {
    const { api, container } = setup();
    let first = '';
    let second = '';
    act(() => {
      first = api.show({ title: '저장했습니다', tone: 'success' });
    });
    act(() => {
      second = api.show({ title: '저장했습니다', tone: 'success' });
    });
    expect(second).toBe(first);
    expect(document.querySelectorAll('.tl-toast')).toHaveLength(1);
    const count = screen.getByText('×2');
    expect(count).toHaveClass('tl-toast__count');
    expect(count).toHaveAttribute('aria-hidden', 'true');
    const live = container.querySelector('.tl-sr-only[role="status"]');
    expect(live).toHaveAttribute('aria-live', 'polite');
    expect(live).toHaveTextContent('같은 알림 2번째. 저장했습니다');
    act(() => {
      api.show({ title: '저장했습니다', tone: 'success' });
    });
    expect(screen.getByText('×3')).toBeInTheDocument();
    expect(live).toHaveTextContent('같은 알림 3번째. 저장했습니다');
  });

  it('tone이 다르면 따로 쌓인다', () => {
    const { api } = setup();
    act(() => {
      api.show({ title: '처리했습니다', tone: 'success' });
      api.show({ title: '처리했습니다', tone: 'warning' });
    });
    expect(document.querySelectorAll('.tl-toast')).toHaveLength(2);
    expect(screen.queryByText('×2')).toBeNull();
  });

  it('다시 오면 닫힘 시간을 처음부터 다시 재고, 닫힐 때 합쳐진 onClose를 모두 부른다', () => {
    const { api } = setup();
    const a = vi.fn();
    const b = vi.fn();
    act(() => {
      api.show({ title: '저장했습니다', onClose: a });
    });
    later(3000);
    act(() => {
      api.show({ title: '저장했습니다', onClose: b });
    });
    later(3000);
    expect(a).not.toHaveBeenCalled();
    later(1000);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('닫힌 뒤 같은 토스트가 오면 1부터 다시 센다', () => {
    const { api } = setup();
    let id = '';
    act(() => {
      id = api.show({ title: '저장했습니다', duration: 0 });
    });
    act(() => api.close(id));
    let next = '';
    act(() => {
      next = api.show({ title: '저장했습니다', duration: 0 });
    });
    expect(next).not.toBe(id);
    expect(screen.queryByText('×2')).toBeNull();
  });

  it('id를 준 호출은 내용 바꾸기라 세지 않는다', () => {
    const { api } = setup();
    act(() => {
      api.show({ id: 'save', title: '저장 중', duration: 0 });
      api.show({ id: 'save', title: '저장 중', duration: 0 });
    });
    expect(document.querySelectorAll('.tl-toast')).toHaveLength(1);
    expect(screen.queryByText('×2')).toBeNull();
  });

  it('쌓임 한도 밖에 숨은 같은 토스트는 닫고 맨 앞에 새로 띄우며 센 수를 잇는다', () => {
    const { api } = setup('default', 2);
    const old = vi.fn();
    let first = '';
    act(() => {
      first = api.show({ title: '가', duration: 0, onClose: old });
      api.show({ title: '나', duration: 0 });
      api.show({ title: '다', duration: 0 });
    });
    let again = '';
    act(() => {
      again = api.show({ title: '가', duration: 0 });
    });
    expect(again).not.toBe(first);
    expect(screen.getByText('×2')).toBeInTheDocument();
    // 먼저 받은 onClose는 새 토스트가 닫힐 때 부른다
    expect(old).not.toHaveBeenCalled();
    act(() => api.close(again));
    expect(old).toHaveBeenCalledTimes(1);
  });
});
