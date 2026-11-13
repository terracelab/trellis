// 해시 라우터(#/erp/tax/invoice-list). 정적 호스팅에서 새로 고쳐도 같은 화면이 열린다.
import { useEffect, useState } from 'react';

const read = () =>
  decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).split('?')[0] ?? '';

export function useRoute(): string {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (path: string) => {
  window.location.hash = `/${path}`;
};

export const href = (path: string) => `#/${path}`;
