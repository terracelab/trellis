import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Recharts ResponsiveContainer는 ResizeObserver를 쓴다. jsdom에는 없다.
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in globalThis)) {
  Object.assign(globalThis, { ResizeObserver: RO });
}

afterEach(() => cleanup());

// jsdom은 레이아웃이 없어 getBoundingClientRect가 0이다. Recharts ResponsiveContainer가 마운트 때 재므로 고정 크기를 돌려준다.
const rect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 240,
  right: 480,
  width: 480,
  height: 240,
  toJSON: () => ({}),
};
if (typeof HTMLElement !== 'undefined') {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ ...rect }),
  });
}
