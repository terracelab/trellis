// 토스트가 아래 시트 footer · 고정 ActionBar · 탭바를 가리지 않게(PR-19 · R-29)
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ActionBar, Button, Drawer } from '../src/core/index.js';

const VAR = '--tl-toast-offset-bottom';
const offset = () => document.documentElement.style.getPropertyValue(VAR);

// jsdom은 레이아웃이 없다. 클래스마다 화면 속 자리를 정해 준다(innerHeight 768)
const RECTS: Record<string, { top: number; height: number }> = {
  'tl-upper': { top: 100, height: 60 },
  'tl-action-bar': { top: 700, height: 60 },
  'tl-drawer__footer': { top: 680, height: 72 },
};
const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getBoundingClientRect')!;
const base = original.value as () => DOMRect;
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: function (this: HTMLElement) {
      const hit = Object.entries(RECTS).find(([cls]) => this.classList.contains(cls));
      if (!hit) return base.call(this);
      const { top, height } = hit[1];
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        right: 390,
        width: 390,
        height,
        bottom: top + height,
        toJSON: () => ({}),
      } as DOMRect;
    },
  });
});
afterEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', original);
});

describe('토스트 아래 여백', () => {
  it('고정 ActionBar가 화면 아래에 있으면 그 높이만큼 올리고, 사라지면 되돌린다', () => {
    const { unmount } = render(
      <ActionBar sticky>
        <Button variant="primary">발행</Button>
      </ActionBar>,
    );
    expect(offset()).toBe('68px');
    unmount();
    expect(offset()).toBe('');
  });

  it('고정이 아닌 ActionBar · 화면 위쪽 요소는 세지 않는다', () => {
    render(
      <>
        <ActionBar>
          <Button>저장</Button>
        </ActionBar>
        <ActionBar sticky className="tl-upper">
          <Button>저장</Button>
        </ActionBar>
      </>,
    );
    // 고정 ActionBar지만 화면 위쪽(tl-upper)이면 세지 않는다
    expect(offset()).toBe('');
  });

  it('아래 서랍이 열리면 footer 위로, 닫히면 되돌린다', async () => {
    const { rerender } = render(
      <Drawer open side="bottom" title="직원 정보" footer={<Button variant="primary">수정</Button>}>
        내용
      </Drawer>,
    );
    await act(async () => {});
    expect(offset()).toBe('88px');
    rerender(
      <Drawer
        open={false}
        side="bottom"
        title="직원 정보"
        footer={<Button variant="primary">수정</Button>}
      >
        내용
      </Drawer>,
    );
    await act(async () => {});
    expect(offset()).toBe('');
  });

  it('넓은 화면의 오른쪽 서랍도 footer 위로(서랍을 연 채 누르는 단추를 가리지 않게)', async () => {
    const { rerender } = render(
      <Drawer open title="상세" footer={<Button>다시 내려받기</Button>}>
        내용
      </Drawer>,
    );
    await act(async () => {});
    expect(offset()).toBe('88px');
    rerender(
      <Drawer open={false} title="상세" footer={<Button>다시 내려받기</Button>}>
        내용
      </Drawer>,
    );
    await act(async () => {});
    expect(offset()).toBe('');
  });

  it('footer가 없는 오른쪽 서랍은 세지 않는다', async () => {
    render(
      <Drawer open title="상세">
        내용
      </Drawer>,
    );
    await act(async () => {});
    expect(offset()).toBe('');
  });
});
