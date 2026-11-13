// 회사 테마 런타임(D-98): TrellisProvider theme={{ brand }}가 새로 고침 없이 회사 색 토큰을 덮는다. 범위 지정은 그 안에만
import { createTheme, themeCss } from '@terracelab/trellis-tokens/theme';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, ToastProvider, TrellisProvider, useToast } from '../src/core/index.js';

const styles = () => [...document.head.querySelectorAll('style[data-tl-theme-style]')];

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

describe('TrellisProvider 회사 테마', () => {
  it('문서 전체: gen-theme(Node)과 같은 CSS를 넣고, 색을 바꾸면 바로 바뀌고, 내려가면 지운다', () => {
    const { rerender, unmount } = render(
      <TrellisProvider theme={{ brand: '#6D28D9' }}>
        <Button>저장</Button>
      </TrellisProvider>,
    );
    expect(styles()).toHaveLength(1);
    expect(styles()[0]!.textContent).toBe(themeCss(createTheme({ brand: '#6D28D9' })));
    expect(styles()[0]!.textContent).toContain('--tl-color-brand-default: #6D28D9;');
    rerender(
      <TrellisProvider theme={{ brand: '#0B7A5C', neutral: 'warm' }}>
        <Button>저장</Button>
      </TrellisProvider>,
    );
    expect(styles()).toHaveLength(1);
    expect(styles()[0]!.textContent).toContain('--tl-color-brand-default: #0B7A5C;');
    unmount();
    expect(styles()).toHaveLength(0);
  });

  it('기본 테마(#FE5C2B)와 같으면 덮지 않고, 틀린 형식(입력 중)이면 지금 테마를 둔다', () => {
    const { rerender } = render(
      <TrellisProvider theme={{ brand: '#fe5c2b' }}>내용</TrellisProvider>,
    );
    expect(styles()).toHaveLength(0);
    rerender(<TrellisProvider theme={{ brand: '#12' }}>내용</TrellisProvider>);
    expect(styles()).toHaveLength(0);
  });

  it('모드 문자열은 예전처럼 html data-theme만 바꾼다', () => {
    render(<TrellisProvider theme="dark">내용</TrellisProvider>);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(styles()).toHaveLength(0);
  });

  it('범위 지정: 감싼 요소 안에만, html은 그대로', () => {
    render(
      <TrellisProvider scope theme={{ brand: '#0B7A5C', mode: 'dark' }} density="comfortable">
        <Button>미리보기</Button>
      </TrellisProvider>,
    );
    const wrap = screen.getByRole('button').closest('[data-tl-theme]')!;
    expect(wrap.getAttribute('data-theme')).toBe('dark');
    expect(wrap.getAttribute('data-density')).toBe('comfortable');
    expect(wrap.className).toBe('tl-theme-scope');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    const css = styles()[0]!.textContent!;
    const sel = `[data-tl-theme="${wrap.getAttribute('data-tl-theme')}"]`;
    expect(css).toContain(`${sel}[data-theme="dark"]`);
    expect(css).not.toMatch(/^:root/m);
  });

  it('안쪽 Provider는 저절로 범위 지정이다(바깥 테마 + 미리보기 테마가 같이 있다)', () => {
    render(
      <TrellisProvider theme={{ brand: '#6D28D9' }}>
        <TrellisProvider theme={{ brand: '#E11D2A' }}>
          <Button>안</Button>
        </TrellisProvider>
      </TrellisProvider>,
    );
    const kinds = styles().map((s) => s.getAttribute('data-tl-theme-style'));
    expect(kinds).toHaveLength(2);
    expect(kinds).toContain('root');
    expect(kinds.some((k) => k!.startsWith('[data-tl-theme='))).toBe(true);
  });
});

describe('TrellisProvider 접근성 모드(D-97)', () => {
  const ATTRS = [
    'data-font-scale',
    'data-contrast',
    'data-focus',
    'data-links',
    'data-chart',
    'data-motion',
    'data-content-width',
  ];
  afterEach(() => {
    for (const a of ATTRS) document.documentElement.removeAttribute(a);
  });

  it('html에 data-*를 걸고, 기본값이면 걸지 않고, 내려가면 지운다', () => {
    const { unmount, rerender } = render(
      <TrellisProvider
        fontScale="125"
        contrast="high"
        focusRing="strong"
        linkUnderline
        chartPalette="cvd"
        motion="reduce"
        contentWidth="1440"
      >
        내용
      </TrellisProvider>,
    );
    const root = document.documentElement;
    expect(root.getAttribute('data-font-scale')).toBe('125');
    expect(root.getAttribute('data-contrast')).toBe('high');
    expect(root.getAttribute('data-focus')).toBe('strong');
    expect(root.getAttribute('data-links')).toBe('underline');
    expect(root.getAttribute('data-chart')).toBe('cvd');
    expect(root.getAttribute('data-motion')).toBe('reduce');
    expect(root.getAttribute('data-content-width')).toBe('1440');
    rerender(
      <TrellisProvider fontScale="100" contrast="normal">
        내용
      </TrellisProvider>,
    );
    expect(root.hasAttribute('data-font-scale')).toBe(false);
    expect(root.hasAttribute('data-contrast')).toBe(false);
    unmount();
    for (const a of ATTRS) expect(root.hasAttribute(a)).toBe(false);
  });

  it('범위 지정이면 감싼 요소에만 건다', () => {
    render(
      <TrellisProvider scope contrast="high" fontScale="112">
        <Button>안</Button>
      </TrellisProvider>,
    );
    const wrap = screen.getByRole('button').closest('.tl-theme-scope')!;
    expect(wrap.getAttribute('data-contrast')).toBe('high');
    expect(wrap.getAttribute('data-font-scale')).toBe('112');
    expect(document.documentElement.hasAttribute('data-contrast')).toBe(false);
  });
});

describe('TrellisProvider toastDuration', () => {
  it('manual이면 기본 토스트도 직접 닫을 때까지 남는다', async () => {
    vi.useFakeTimers();
    let show: ReturnType<typeof useToast>['show'] | null = null;
    function Grab() {
      show = useToast().show;
      return null;
    }
    render(
      <TrellisProvider toastDuration="manual">
        <ToastProvider>
          <Grab />
        </ToastProvider>
      </TrellisProvider>,
    );
    act(() => {
      show!({ title: '저장했습니다', tone: 'success' });
    });
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByText('저장했습니다')).toBeTruthy();
    vi.useRealTimers();
  });
});
