// 컴포넌트 문서의 라이브 예시. 예시 코드는 packages/react/src/<Name>/<Name>.examples.tsx 하나뿐이고
// (타입 검사를 받는 실제 코드), 동봉 문서의 코드 블록도 같은 파일에서 나온다(D-46).
// 영어 페이지(locale="en")는 TrellisProvider locale="en"으로 감싼다. 예시가 소스 모듈을 쓰므로
// Provider도 같은 소스 모듈이어야 문구 사전(LocaleContext)이 하나로 이어진다.
// 예시가 상자보다 넓으면(휴대폰 폭의 표 · 고정 폭 무대) 상자 밖으로 나가 페이지에 가로 스크롤이 생긴다.
// 넘칠 때만 상자를 가로 스크롤 칸으로 바꾸고(data-scroll) 키보드로 갈 수 있는 영역으로 만든다(본문 표와 같은 방법).
import { useEffect, useRef, type ComponentType } from 'react';
import { TrellisProvider } from '../../../../packages/react/src/TrellisProvider/TrellisProvider.js';

const modules = import.meta.glob<Record<string, ComponentType>>(
  '../../../../packages/react/src/*/*.examples.tsx',
  { eager: true },
);

export default function LiveExample({
  component,
  example,
  locale = 'ko',
}: {
  component: string;
  example: string;
  locale?: 'ko' | 'en';
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const sync = () => {
      const wide = el.scrollWidth > el.clientWidth + 1;
      if (wide === el.hasAttribute('data-scroll')) return;
      if (wide) {
        el.setAttribute('data-scroll', '');
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'region');
        el.setAttribute(
          'aria-label',
          locale === 'en' ? `${component} ${example} example` : `${component} ${example} 예시`,
        );
      } else {
        for (const name of ['data-scroll', 'tabindex', 'role', 'aria-label'])
          el.removeAttribute(name);
      }
    };
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    sync();
    void document.fonts?.ready.then(sync);
    return () => observer.disconnect();
  }, [component, example, locale]);

  const found = Object.entries(modules).find(([path]) =>
    path.endsWith(`/${component}/${component}.examples.tsx`),
  );
  const Example = found?.[1][example];
  if (!Example) {
    return (
      <p className="tl-site-example-missing">
        {locale === 'en' ? 'Example not found' : '예시를 찾지 못했습니다'}: {component}.{example}
      </p>
    );
  }
  const body = (
    <div ref={box} className="tl-site-example not-content" data-component={component}>
      <Example />
    </div>
  );
  return locale === 'en' ? <TrellisProvider locale="en">{body}</TrellisProvider> : body;
}
