// 종이를 브라우저 인쇄 창으로 보낸다. 사용자가 인쇄 창에서 "PDF로 저장"을 고르면 PDF가 된다.
//   - body 끝에 .tl-print-root를 붙여 종이만 그리고, 인쇄 CSS(Paper.css)가 나머지를 숨긴다(iframe을 쓰지 않는다)
//   - 첫 종이의 크기 · 방향으로 @page를 넣는다(이름 붙은 @page를 못 읽는 브라우저용). 쪽 여백은 0
//   - 글꼴 · 이미지(직인)가 다 그려진 뒤 window.print()
//   - document.title을 파일 이름으로 잠시 바꾼다(브라우저가 PDF 이름으로 쓴다). afterprint에서 되돌리고 뿌리를 뗀다
//   - 인쇄 창이 열리면(beforeprint) onOpen, 닫히고 정리가 끝나면 onClose(R-35)
// 이벤트 처리기(단추 누름)에서 부른다. 렌더 · effect 안에서 부르면 flushSync 경고가 난다.
import type { PrintPapersOptions } from '@terracelab/trellis-contracts';
import { useCallback, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { LocaleContext, useLocale } from '../_internal/locale.js';

const ROOT_CLASS = 'tl-print-root';
/** 화면 미리보기에만 있는 표시. DOM에서 복사할 때 뺀다 */
const SCREEN_ONLY = '.tl-paper__overflow';
/** 이미지 · 글꼴을 이보다 오래 기다리지 않는다 */
const ASSET_TIMEOUT_MS = 10_000;
/** afterprint가 오지 않는 브라우저 대비. 인쇄 창 미리보기는 print() 때 이미 만들어져 있다 */
const FALLBACK_MS = 60_000;

/**
 * 지금 진행 중인 인쇄의 정리 함수. 시작하자마자 등록해서, 글꼴 · 직인을 기다리는 동안 새 인쇄가 오면
 * 앞의 것을 먼저 정리한다(인쇄 뿌리가 둘 붙어 두 벌이 찍히지 않게)
 */
let finishActive: (() => void) | null = null;

function isElement(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element;
}

/** 첫 종이 기준 쪽 크기. A4 · A5 키워드라 CSS 변수가 필요 없다 */
function pageRule(paper: Element | null): string {
  const size = paper?.getAttribute('data-size') === 'a5' ? 'A5' : 'A4';
  const orientation =
    paper?.getAttribute('data-orientation') === 'landscape' ? 'landscape' : 'portrait';
  return `@page { size: ${size} ${orientation}; margin: 0; }`;
}

function imageLoaded(img: HTMLImageElement): Promise<void> | null {
  if (img.complete) return null;
  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

async function assetsReady(host: HTMLElement): Promise<void> {
  const waits: Promise<unknown>[] = [];
  for (const img of host.querySelectorAll('img')) {
    const wait = imageLoaded(img);
    if (wait) waits.push(wait);
  }
  if (typeof document.fonts !== 'undefined') waits.push(document.fonts.ready);
  if (waits.length === 0) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.all(waits),
    new Promise((resolve) => {
      timer = setTimeout(resolve, ASSET_TIMEOUT_MS);
    }),
  ]);
  clearTimeout(timer);
}

/** 파일 이름: 앞뒤 공백과 끝의 .pdf를 뗀다(브라우저가 .pdf를 붙인다) */
const fileTitle = (name: string) => name.trim().replace(/\.pdf$/i, '');

/**
 * 종이를 인쇄한다. content는 Paper 요소(여러 장이면 Fragment) 또는 이미 화면에 있는 DOM 요소
 * (PaperPreview 등. 그 안의 .tl-paper만 복사한다). 인쇄 창이 닫히면(afterprint) 끝난다.
 * 돌려주는 Promise는 정리가 끝나면 풀린다. 새 인쇄에 밀려나 인쇄 창을 열지 못한 경우에도 바로 풀린다.
 * 종이를 그리다 오류가 나면 뿌리를 떼고 그 오류로 거부된다.
 */
export function printPapers(
  content: ReactNode | Element,
  options: PrintPapersOptions = {},
): Promise<void> {
  const { fileName, locale = 'ko', onOpen, onClose } = options;
  finishActive?.();

  const host = document.createElement('div');
  host.className = ROOT_CLASS;
  host.setAttribute('data-theme', 'light');
  const style = document.createElement('style');
  const mount = document.createElement('div');
  host.append(style, mount);
  document.body.appendChild(host);

  let root: Root | null = null;
  let done = false;
  let opened = false;
  let before: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let settle!: { resolve: () => void; reject: (error: unknown) => void };
  const finished = new Promise<void>((resolve, reject) => {
    settle = { resolve, reject };
  });

  const open = () => {
    if (opened || done) return;
    opened = true;
    onOpen?.();
  };
  /** 정리하고 Promise를 끝낸다. 오류가 있으면 거부, 없으면 풀기. 두 번째부터는 아무것도 하지 않는다 */
  const finish = (failure?: { error: unknown }) => {
    if (done) return;
    done = true;
    if (finishActive === finish) finishActive = null;
    window.removeEventListener('beforeprint', open);
    window.removeEventListener('afterprint', afterPrint);
    clearTimeout(timer);
    if (before !== null) document.title = before;
    root?.unmount();
    host.remove();
    if (opened) onClose?.();
    if (failure) settle.reject(failure.error);
    else settle.resolve();
  };
  // afterprint가 왔으면 인쇄 창은 열렸던 것이다(beforeprint를 건너뛴 브라우저도 onOpen → onClose 순서를 지킨다)
  function afterPrint() {
    open();
    finish();
  }
  finishActive = finish;

  const run = async () => {
    if (isElement(content)) {
      const papers = content.matches('.tl-paper')
        ? [content]
        : Array.from(content.querySelectorAll('.tl-paper'));
      for (const paper of papers) {
        const copy = paper.cloneNode(true) as Element;
        for (const mark of copy.querySelectorAll(SCREEN_ONLY)) mark.remove();
        mount.appendChild(copy);
      }
    } else {
      // React 19는 그리기 오류를 던지지 않고 루트에 알린다. 받아 두었다가 이 Promise의 거부로 돌려준다
      // as: 콜백 안에서만 바뀌는 값이라 TS가 null로 좁히지 않게 한다
      let failure = null as { error: unknown } | null;
      const r = createRoot(mount, {
        onUncaughtError: (error) => {
          failure ??= { error };
        },
      });
      root = r;
      flushSync(() => {
        r.render(<LocaleContext.Provider value={locale}>{content}</LocaleContext.Provider>);
      });
      if (failure) return finish(failure);
    }
    style.textContent = pageRule(mount.querySelector('.tl-paper'));

    await assetsReady(host);
    // 기다리는 동안 새 인쇄가 시작돼 이 인쇄는 이미 정리됐다
    if (done) return;

    before = document.title;
    if (fileName) document.title = fileTitle(fileName);

    window.addEventListener('beforeprint', open);
    window.addEventListener('afterprint', afterPrint);
    timer = setTimeout(finish, FALLBACK_MS);
    window.print();
    // beforeprint를 보내지 않는 브라우저: print()를 부른 것으로 열렸다고 본다.
    // print()가 창이 닫힐 때까지 멈추는 브라우저는 이미 afterprint로 끝나 있어 아무것도 하지 않는다
    open();
  };
  run().catch((error: unknown) => finish({ error }));
  return finished;
}

/** printPapers에 지금 TrellisProvider의 locale을 넘기는 훅 */
export function usePrintPapers(): (
  content: ReactNode | Element,
  options?: PrintPapersOptions,
) => Promise<void> {
  const locale = useLocale();
  return useCallback((content, options) => printPapers(content, { locale, ...options }), [locale]);
}
