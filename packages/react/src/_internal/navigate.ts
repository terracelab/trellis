// 앱 라우터 이동(R-T34). TrellisProvider navigate가 내려 주고 Link · PersonLabel href가 쓴다.
// 라우터가 있는 앱은 a 태그 기본 이동(전체 다시 불러오기) 대신 이 함수로 옮긴다. 없으면 브라우저 이동 그대로.
import { isAppHref } from '@terracelab/trellis-contracts';
import { createContext, useContext, type MouseEvent } from 'react';

export type Navigate = (href: string) => void;

export const NavigateContext = createContext<Navigate | undefined>(undefined);

/** TrellisProvider navigate(없으면 undefined) */
export function useNavigate(): Navigate | undefined {
  return useContext(NavigateContext);
}

/**
 * a 태그 onClick: onPress를 부르고, 앱 안 주소이고 새 탭으로 여는 누름이 아니면 navigate로 넘긴다.
 * 새 탭(Ctrl · Cmd · Shift · Alt · 가운데 단추) · target이 있는 링크 · 바깥 주소 · #id는 브라우저에 맡긴다
 */
export function useLinkClick(
  href: string | undefined,
  options: { target?: string; onPress?: () => void } = {},
): (event: MouseEvent<HTMLAnchorElement>) => void {
  const navigate = useNavigate();
  const { target, onPress } = options;
  return (event) => {
    onPress?.();
    if (
      !navigate ||
      !href ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target !== undefined && target !== '_self') ||
      !isAppHref(href)
    )
      return;
    event.preventDefault();
    navigate(href);
  };
}
