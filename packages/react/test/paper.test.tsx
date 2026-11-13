// Paper(D-77): 종이 · 서식 조각 · 미리보기 맞춤 · 인쇄 도우미 · 넘침 · 이월(R-35)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PaperContract, type PaperProps } from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Paper,
  PaperFields,
  PaperMoneyTable,
  PaperPreview,
  PaperSeal,
  PaperSignature,
  PaperSignPair,
  PaperText,
  PaperTitle,
  printPapers,
  TrellisProvider,
  usePrintPapers,
} from '../src/core/index.js';

describe('Paper contract', () => {
  it('displayName === contract.name, 웹 props는 contract props를 포함한다', () => {
    expect(Paper.displayName).toBe(PaperContract.name);
    expect(Object.keys(PaperContract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    // 슬롯(header · footer · children)은 웹에서 ReactNode로 좁힌다. 이름은 contract와 같다
    expectTypeOf<keyof PaperProps>().toMatchTypeOf<keyof ComponentProps<typeof Paper>>();
  });

  it('enum prop은 data-* 속성, 기본값 a4 · portrait · md · regular, 테마와 무관하게 라이트', () => {
    render(<Paper label="재직증명서" id="p1" testID="paper" />);
    const el = screen.getByTestId('paper');
    expect(el.tagName).toBe('ARTICLE');
    expect(el).toHaveAttribute('id', 'p1');
    expect(el).toHaveClass('tl-paper');
    expect(el).toHaveAttribute('data-size', 'a4');
    expect(el).toHaveAttribute('data-orientation', 'portrait');
    expect(el).toHaveAttribute('data-margin', 'md');
    expect(el).toHaveAttribute('data-density', 'regular');
    expect(el).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('article', { name: '재직증명서' })).toBe(el);

    for (const [prop, values] of Object.entries(PaperContract.props)) {
      if (!values.values) continue;
      for (const value of values.values) {
        const { unmount } = render(
          <Paper label="p" testID="v" {...{ [prop]: value }}>
            내용
          </Paper>,
        );
        expect(screen.getByTestId('v')).toHaveAttribute(`data-${prop}`, value);
        unmount();
      }
    }
  });

  it('header · footer는 article 안 header · footer', () => {
    const { container } = render(
      <Paper label="p" header={<span>발급 번호 1</span>} footer={<span>1 / 2</span>}>
        본문
      </Paper>,
    );
    expect(container.querySelector('header.tl-paper__header')).toHaveTextContent('발급 번호 1');
    expect(container.querySelector('footer.tl-paper__footer')).toHaveTextContent('1 / 2');
    expect(container.querySelector('.tl-paper__body')).toHaveTextContent('본문');
  });
});

describe('서식 조각', () => {
  it('PaperTitle은 h1, PaperText는 variant', () => {
    render(
      <Paper label="p">
        <PaperTitle subtitle="2026년 10월분">급여명세서</PaperTitle>
        <PaperText variant="note">근거</PaperText>
      </Paper>,
    );
    expect(screen.getByRole('heading', { level: 1, name: '급여명세서' })).toBeInTheDocument();
    expect(screen.getByText('2026년 10월분')).toBeInTheDocument();
    expect(screen.getByText('근거')).toHaveAttribute('data-variant', 'note');
  });

  it('PaperFields: 4열은 둘씩 짝, full은 한 줄 전체, 빈 값은 –, 값 칸은 headers로 이름 칸을 가리킨다', () => {
    render(
      <PaperFields
        title="인적 사항"
        note="주민등록 기준"
        rows={[
          { label: '성명', value: '이도윤' },
          { label: '생년월일', value: '1992년 4월 18일' },
          { label: '주소', value: '서울', full: true },
          { label: '제출처', value: '' },
        ]}
      />,
    );
    const table = screen.getByRole('table', { name: '인적 사항' });
    expect(table).toHaveAccessibleDescription('주민등록 기준');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getAllByRole('cell')).toHaveLength(2);
    expect(within(rows[1]!).getByRole('cell')).toHaveAttribute('colspan', '3');
    expect(within(rows[2]!).getByRole('cell')).toHaveTextContent('–');
    const name = within(rows[0]!).getByText('이도윤');
    const head = document.getElementById(name.getAttribute('headers')!);
    expect(head).toHaveTextContent('성명');
  });

  it('PaperFields blank: 손으로 적을 칸은 비어도 –를 넣지 않는다(값이 있으면 그대로)', () => {
    render(
      <PaperFields
        title="수령 확인"
        rows={[
          { label: '수령일', value: '', blank: true },
          { label: '수령인', value: '이도윤 (서명)', blank: true },
          { label: '비고', value: '' },
        ]}
      />,
    );
    const cells = within(screen.getByRole('table', { name: '수령 확인' })).getAllByRole('cell');
    expect(cells[0]).toBeEmptyDOMElement();
    expect(cells[1]).toHaveTextContent('이도윤 (서명)');
    expect(cells[2]).toHaveTextContent('–');
  });

  it('PaperFields columns=2: 한 줄에 하나', () => {
    render(
      <PaperFields
        columns={2}
        rows={[
          { label: '성명', value: '이도윤' },
          { label: '연락처', value: '010' },
        ]}
      />,
    );
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getAllByRole('cell')[0]).not.toHaveAttribute('colspan');
  });

  it('PaperMoneyTable: 숫자는 천 단위 · 오른쪽, 열 폭은 colgroup, 합계 줄 첫 칸은 행 머리', () => {
    const { container } = render(
      <PaperMoneyTable
        title="지급 내역"
        columns={[{ header: '항목' }, { header: '금액', width: 'md' }, { header: '비고' }]}
        rows={[
          ['기본급', 3200000, '월 정액'],
          ['공제', -12000, ''],
        ]}
        total={['합계', 3188000, '']}
      />,
    );
    const table = screen.getByRole('table', { name: '지급 내역' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((c) => c.textContent),
    ).toEqual(['항목', '금액', '비고']);
    expect(within(table).getByText('3,200,000')).toHaveAttribute('data-align', 'right');
    expect(within(table).getByText('−12,000')).toBeInTheDocument();
    expect(within(table).getByText('기본급')).toHaveAttribute('data-align', 'left');
    expect(within(table).getByRole('rowheader', { name: '합계' })).toBeInTheDocument();
    expect(within(table).getByText('3,188,000')).toHaveAttribute('data-align', 'right');
    const cols = [...container.querySelectorAll('col')].map((c) => c.getAttribute('data-width'));
    expect(cols).toEqual(['auto', 'md', 'auto']);
  });

  it('PaperSeal · PaperSignature: 이미지가 있으면 직인 대체 글자, 없으면 "(인)", ISO 날짜는 문장', () => {
    const { rerender } = render(
      <PaperSignature date="2026-11-09" company="테라" representative="박은서" seal="seal.png" />,
    );
    expect(screen.getByText('2026년 11월 9일')).toBeInTheDocument();
    expect(screen.getByText('대표이사 박은서')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '테라 직인' })).toHaveAttribute('src', 'seal.png');
    expect(screen.getByText('(인)')).toHaveAttribute('aria-hidden', 'true');

    rerender(
      <PaperSignature
        date="2026년 11월"
        company="테라"
        role="징수(보고)의무자"
        representative="박은서"
      />,
    );
    expect(screen.getByText('2026년 11월')).toBeInTheDocument();
    expect(screen.getByText('징수(보고)의무자 박은서')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('(인)')).not.toHaveAttribute('aria-hidden');
  });

  it('PaperSignPair: 두 칸 표 + 위 날짜', () => {
    render(
      <PaperSignPair
        date="2022-02-25"
        left={{
          title: '사업주',
          rows: [{ label: '대표자', value: <PaperSeal name="테라" /> }],
        }}
        right={{ title: '근로자', rows: [{ label: '성명', value: '이도윤' }] }}
      />,
    );
    expect(screen.getByText('2022년 2월 25일')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: '사업주' })).toHaveTextContent('(인)');
    expect(screen.getByRole('table', { name: '근로자' })).toHaveTextContent('이도윤');
  });

  it('en locale: 사전 문구(직인 · 대표이사 · 날짜)', () => {
    render(
      <TrellisProvider locale="en">
        <PaperSignature date="2026-11-09" company="Terra" representative="Park" seal="s.png" />
        <PaperPreview>
          <Paper label="p" />
        </PaperPreview>
      </TrellisProvider>,
    );
    expect(screen.getByText('2026-11-09')).toBeInTheDocument();
    expect(screen.getByText('CEO Park')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Terra seal' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Document preview' })).toBeInTheDocument();
  });
});

describe('PaperPreview', () => {
  type Callback = () => void;
  const observers: Callback[] = [];
  let width = 432;
  const OriginalRO = globalThis.ResizeObserver;

  beforeEach(() => {
    observers.length = 0;
    width = 432;
    globalThis.ResizeObserver = class {
      constructor(cb: Callback) {
        observers.push(cb);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('tl-paper-preview') ? width : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('tl-paper-preview__pages') ? 864 : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('tl-paper-preview__pages') ? 1200 : 0;
    });
  });

  afterEach(() => {
    globalThis.ResizeObserver = OriginalRO;
    vi.restoreAllMocks();
  });

  it('부모 폭에 맞춰 비율대로 줄이고, 줄인 크기만큼 자리를 차지한다(가로 넘침 없음)', () => {
    const { container } = render(
      <PaperPreview label="재직증명서 미리보기">
        <Paper label="재직증명서" />
      </PaperPreview>,
    );
    // 감싼 대화상자가 길면 키보드로 스크롤할 수 있게 포커스를 받는다
    expect(screen.getByRole('group', { name: '재직증명서 미리보기' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    const frame = container.querySelector<HTMLElement>('.tl-paper-preview__frame')!;
    const pages = container.querySelector<HTMLElement>('.tl-paper-preview__pages')!;
    expect(pages.style.transform).toBe('scale(0.5)');
    expect(frame.style.width).toBe('432px');
    expect(frame.style.height).toBe('600px');

    // 부모가 좁아지면 ResizeObserver가 다시 잰다
    width = 216;
    act(() => observers.forEach((cb) => cb()));
    expect(pages.style.transform).toBe('scale(0.25)');
    expect(frame.style.height).toBe('300px');

    // 넓으면 1배를 넘지 않는다
    width = 2000;
    act(() => observers.forEach((cb) => cb()));
    expect(pages.style.transform).toBe('');
    expect(frame.style.width).toBe('864px');
  });

  it('잴 수 없으면(폭 0 · ResizeObserver 없음) 원래 크기로 둔다', () => {
    width = 0;
    // @ts-expect-error jsdom처럼 ResizeObserver가 없는 환경
    globalThis.ResizeObserver = undefined;
    const { container } = render(
      <PaperPreview>
        <Paper label="p" />
      </PaperPreview>,
    );
    expect(screen.getByRole('group', { name: '서식 미리보기' })).toBeInTheDocument();
    expect(container.querySelector<HTMLElement>('.tl-paper-preview__pages')!.style.transform).toBe(
      '',
    );
  });
});

describe('printPapers', () => {
  const before = 'Trellis 데모';
  beforeEach(() => {
    document.title = before;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('인쇄 뿌리를 붙이고 제목을 파일 이름으로 바꿨다가, afterprint에서 둘 다 되돌린다', async () => {
    const seen: { root: Element | null; title: string; papers: number; page: string }[] = [];
    vi.spyOn(window, 'print').mockImplementation(() => {
      const root = document.querySelector('body > .tl-print-root');
      seen.push({
        root,
        title: document.title,
        papers: root?.querySelectorAll('.tl-paper').length ?? 0,
        page: root?.querySelector('style')?.textContent ?? '',
      });
      window.dispatchEvent(new Event('afterprint'));
    });
    await printPapers(
      <>
        <Paper label="1쪽" size="a5" orientation="landscape" />
        <Paper label="2쪽" size="a5" orientation="landscape" />
      </>,
      { fileName: '재직증명서_이도윤.pdf' },
    );
    expect(window.print).toHaveBeenCalledTimes(1);
    expect(seen[0]!.root).not.toBeNull();
    expect(seen[0]!.root).toHaveAttribute('data-theme', 'light');
    expect(seen[0]!.title).toBe('재직증명서_이도윤');
    expect(seen[0]!.papers).toBe(2);
    expect(seen[0]!.page).toBe('@page { size: A5 landscape; margin: 0; }');
    expect(document.querySelector('.tl-print-root')).toBeNull();
    expect(document.title).toBe(before);
  });

  it('DOM 요소를 넘기면 안의 .tl-paper만 복사한다(미리보기 틀은 빼고)', async () => {
    const { container } = render(
      <PaperPreview>
        <Paper label="1쪽">
          <PaperTitle>재직증명서</PaperTitle>
        </Paper>
      </PaperPreview>,
    );
    let copied = '';
    vi.spyOn(window, 'print').mockImplementation(() => {
      const root = document.querySelector('.tl-print-root')!;
      copied = [...root.querySelectorAll('[class]')].map((e) => e.className).join(' ');
      window.dispatchEvent(new Event('afterprint'));
    });
    await printPapers(container.querySelector('.tl-paper-preview')!);
    expect(copied).toContain('tl-paper ');
    expect(copied).toContain('tl-paper-title');
    expect(copied).not.toContain('tl-paper-preview');
    expect(document.querySelector('.tl-print-root')).toBeNull();
    expect(document.title).toBe(before);
  });

  it('afterprint가 오지 않으면 시간이 지난 뒤 정리한다', async () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'print').mockImplementation(() => {});
    const done = printPapers(<Paper label="p" />, { fileName: '견적서' });
    await vi.waitFor(() => expect(window.print).toHaveBeenCalled());
    expect(document.title).toBe('견적서');
    expect(document.querySelector('.tl-print-root')).not.toBeNull();
    await vi.advanceTimersByTimeAsync(60_000);
    await done;
    expect(document.querySelector('.tl-print-root')).toBeNull();
    expect(document.title).toBe(before);
  });

  it('직인 이미지가 다 불러와진 뒤 print를 부른다', async () => {
    let complete = false;
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(() => complete);
    const print = vi.spyOn(window, 'print').mockImplementation(() => {
      window.dispatchEvent(new Event('afterprint'));
    });
    const done = printPapers(
      <Paper label="p">
        <PaperSeal name="테라" src="seal.png" />
      </Paper>,
    );
    await Promise.resolve();
    expect(print).not.toHaveBeenCalled();
    complete = true;
    document.querySelector('.tl-print-root img')!.dispatchEvent(new Event('load'));
    await done;
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('usePrintPapers는 Provider locale로 인쇄 트리를 그린다', async () => {
    let text = '';
    vi.spyOn(window, 'print').mockImplementation(() => {
      text = document.querySelector('.tl-print-root')!.textContent ?? '';
      window.dispatchEvent(new Event('afterprint'));
    });
    function PrintButton() {
      const print = usePrintPapers();
      return (
        <button
          type="button"
          onClick={() => void print(<PaperSignature company="Terra" representative="Park" />)}
        >
          print
        </button>
      );
    }
    render(
      <TrellisProvider locale="en">
        <PrintButton />
      </TrellisProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'print' }));
    await vi.waitFor(() => expect(window.print).toHaveBeenCalled());
    expect(text).toContain('CEO Park');
    expect(text).toContain('(seal)');
  });
});

/* ── R-35: 종이 글자 토큰 · 넘침 · 이월 · 인쇄 창 콜백 ───────────────────────── */

describe('종이 글자는 paper.type 토큰(앱 글자 크기 모드가 닿지 않는다)', () => {
  it('Paper.css의 종이 규칙은 --tl-type-*를 쓰지 않는다(미리보기 틀 · 안내만 앱 글자)', () => {
    const css = readFileSync(join(process.cwd(), 'src/Paper/Paper.css'), 'utf8').replace(
      /\/\*[\s\S]*?\*\//g,
      '',
    );
    const offenders = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(
        ([, selector, body]) => !selector!.includes('tl-paper-preview') && /--tl-type-/.test(body!),
      )
      .map(([, selector]) => selector!.trim());
    expect(offenders).toEqual([]);
    expect(css).toContain('var(--tl-paper-type-body-font-size)');
  });
});

describe('넘침(onOverflowChange · data-overflow · 미리보기 안내)', () => {
  type Callback = () => void;
  const observers: Callback[] = [];
  /** .tl-paper의 높이(px). 한 장(A4)은 1122.52px */
  let height = 1000;
  const PAGE = '1122.52px';
  const OriginalRO = globalThis.ResizeObserver;
  const resize = () => act(() => observers.forEach((cb) => cb()));

  beforeEach(() => {
    observers.length = 0;
    height = 1000;
    globalThis.ResizeObserver = class {
      constructor(cb: Callback) {
        observers.push(cb);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('tl-paper') ? height : 0;
    });
    // jsdom은 var()를 풀지 않는다. 종이의 최소 높이(= 한 장)만 계산된 값으로 돌려준다
    const original = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
      const style = original(el, pseudo);
      if (!pseudo && el instanceof HTMLElement && el.classList.contains('tl-paper'))
        Object.defineProperty(style, 'minHeight', { value: PAGE });
      return style;
    });
  });

  afterEach(() => {
    globalThis.ResizeObserver = OriginalRO;
    vi.restoreAllMocks();
  });

  it('한 장 높이를 넘으면 data-overflow · onOverflowChange(true), 다시 들어오면 false', () => {
    const onOverflowChange = vi.fn();
    height = 1300;
    render(<Paper label="재직증명서" testID="p" onOverflowChange={onOverflowChange} />);
    const paper = screen.getByTestId('p');
    expect(paper).toHaveAttribute('data-overflow');
    expect(onOverflowChange).toHaveBeenCalledTimes(1);
    expect(onOverflowChange).toHaveBeenLastCalledWith(true);
    // 미리보기 밖에서는 선을 그리지 않는다(앱이 data-overflow · 콜백으로 안다)
    expect(paper.querySelector('.tl-paper__overflow')).toBeNull();

    // 반올림된 높이(1123)는 한 장으로 본다
    height = 1123;
    resize();
    expect(paper).not.toHaveAttribute('data-overflow');
    expect(onOverflowChange).toHaveBeenCalledTimes(2);
    expect(onOverflowChange).toHaveBeenLastCalledWith(false);
  });

  it('처음부터 한 장에 들어가면 부르지 않는다. 잴 수 없으면(높이 0) 그대로 둔다', () => {
    const onOverflowChange = vi.fn();
    render(<Paper label="p" testID="p" onOverflowChange={onOverflowChange} />);
    expect(screen.getByTestId('p')).not.toHaveAttribute('data-overflow');
    height = 0;
    resize();
    expect(onOverflowChange).not.toHaveBeenCalled();
  });

  it('미리보기: 1장 끝 선(aria-hidden) + 줄이지 않은 안내가 묶음 설명이 된다', () => {
    height = 1300;
    const { container } = render(
      <PaperPreview label="근로계약서 미리보기">
        <Paper label="근로계약서 1쪽" />
        <Paper label="근로계약서 2쪽" />
      </PaperPreview>,
    );
    const marks = container.querySelectorAll('.tl-paper__overflow');
    expect(marks).toHaveLength(2);
    expect(marks[0]).toHaveAttribute('aria-hidden', 'true');
    expect(marks[0]).toHaveTextContent('1장 끝');
    const group = screen.getByRole('group', { name: '근로계약서 미리보기' });
    const note = screen.getByRole('status');
    expect(note.querySelectorAll('p')).toHaveLength(2);
    expect(note).toHaveTextContent(
      '근로계약서 1쪽의 내용이 종이 한 장을 넘습니다. 인쇄하면 다음 장으로 이어집니다.',
    );
    expect(group).toHaveAccessibleDescription(expect.stringContaining('근로계약서 2쪽의 내용이'));

    height = 1000;
    resize();
    expect(container.querySelector('.tl-paper__overflow')).toBeNull();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(group).not.toHaveAttribute('aria-describedby');
  });

  it('en locale 안내 · 선 글자', () => {
    height = 1300;
    const { container } = render(
      <TrellisProvider locale="en">
        <PaperPreview>
          <Paper label="Payslip" />
        </PaperPreview>
      </TrellisProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'The content of Payslip is taller than one sheet. Printing continues on the next sheet.',
    );
    expect(container.querySelector('.tl-paper__overflow')).toHaveTextContent('End of sheet 1');
  });

  it('넘친 종이를 빼면 안내도 빠진다', () => {
    height = 1300;
    const { rerender } = render(
      <PaperPreview>
        <Paper label="1쪽" />
      </PaperPreview>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1쪽의 내용이');
    rerender(<PaperPreview>{null}</PaperPreview>);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('PaperMoneyTable 이월 줄', () => {
  const columns = [
    { header: '품목' },
    { header: '수량', width: 'xs' },
    { header: '금액' },
  ] as const;

  it('carryIn은 본문 첫 줄, carryOut은 합계 줄 자리. 첫 칸이 null이면 사전 문구', () => {
    render(
      <PaperMoneyTable
        title="거래 내역(계속)"
        columns={columns}
        carryIn={[null, '', 120000]}
        rows={[['양파', 2, 64000]]}
        carryOut={[null, '', 184000]}
      />,
    );
    const table = screen.getByRole('table', { name: '거래 내역(계속)' });
    const [, first, second, last] = within(table).getAllByRole('row');
    expect(first).toHaveAttribute('data-carry', 'in');
    expect(within(first!).getByRole('rowheader')).toHaveTextContent('앞 쪽 이월');
    expect(within(first!).getByText('120,000')).toHaveAttribute('data-align', 'right');
    expect(second).toHaveTextContent('양파');
    expect(last!.parentElement!.tagName).toBe('TFOOT');
    expect(last).toHaveAttribute('data-carry', 'out');
    expect(within(last!).getByRole('rowheader')).toHaveTextContent('다음 쪽 이월');
    expect(within(last!).getByText('184,000')).toBeInTheDocument();
  });

  it('carryOut과 total을 같이 주면 이월 줄 다음 합계 줄. 첫 칸 글자는 그대로 쓴다', () => {
    render(
      <TrellisProvider locale="en">
        <PaperMoneyTable
          columns={columns}
          carryIn={[null, '', 1]}
          rows={[]}
          carryOut={['소계', '', 2]}
          total={['합계', '', 3]}
        />
      </TrellisProvider>,
    );
    expect(screen.getAllByRole('rowheader').map((c) => c.textContent)).toEqual([
      'Brought forward',
      '소계',
      '합계',
    ]);
  });
});

describe('printPapers 인쇄 창 콜백(onOpen · onClose)', () => {
  const before = 'Trellis 데모';
  beforeEach(() => {
    document.title = before;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('beforeprint에서 onOpen, afterprint 뒤 정리를 마치고 onClose(제목 · 뿌리는 이미 되돌림)', async () => {
    const log: string[] = [];
    vi.spyOn(window, 'print').mockImplementation(() => {
      window.dispatchEvent(new Event('beforeprint'));
      log.push(`print:${document.querySelectorAll('.tl-print-root').length}`);
      window.dispatchEvent(new Event('afterprint'));
    });
    await printPapers(<Paper label="p" />, {
      fileName: '재직증명서',
      onOpen: () => log.push(`open:${document.title}`),
      onClose: () =>
        log.push(`close:${document.title}:${document.querySelectorAll('.tl-print-root').length}`),
    });
    expect(log).toEqual(['open:재직증명서', 'print:1', `close:${before}:0`]);
  });

  it('beforeprint를 보내지 않는 브라우저도 onOpen → onClose 순서', async () => {
    const log: string[] = [];
    vi.spyOn(window, 'print').mockImplementation(() => {
      window.dispatchEvent(new Event('afterprint'));
    });
    await printPapers(<Paper label="p" />, {
      onOpen: () => log.push('open'),
      onClose: () => log.push('close'),
    });
    expect(log).toEqual(['open', 'close']);
  });

  it('print()가 멈추지 않고 이벤트도 없으면 print() 직후 onOpen, 60초 뒤 onClose', async () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    vi.spyOn(window, 'print').mockImplementation(() => {});
    const done = printPapers(<Paper label="p" />, { onOpen, onClose });
    await vi.waitFor(() => expect(window.print).toHaveBeenCalled());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(60_000);
    await done;
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('직인을 기다리는 동안 새 인쇄가 오면 앞의 것은 인쇄 창 없이 정리된다(뿌리 한 벌)', async () => {
    let complete = false;
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(() => complete);
    const roots: number[] = [];
    vi.spyOn(window, 'print').mockImplementation(() => {
      roots.push(document.querySelectorAll('.tl-print-root').length);
      window.dispatchEvent(new Event('beforeprint'));
      window.dispatchEvent(new Event('afterprint'));
    });
    const firstOpen = vi.fn();
    const firstClose = vi.fn();
    const first = printPapers(
      <Paper label="1">
        <PaperSeal name="테라" src="seal.png" />
      </Paper>,
      { onOpen: firstOpen, onClose: firstClose },
    );
    await Promise.resolve();
    complete = true;
    const secondOpen = vi.fn();
    const second = printPapers(<Paper label="2" />, { onOpen: secondOpen });
    await Promise.all([first, second]);
    expect(window.print).toHaveBeenCalledTimes(1);
    expect(roots).toEqual([1]);
    expect(firstOpen).not.toHaveBeenCalled();
    expect(firstClose).not.toHaveBeenCalled();
    expect(secondOpen).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.tl-print-root')).toBeNull();
  });

  it('그리다 오류가 나면 뿌리를 떼고 오류를 그대로 던진다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'print').mockImplementation(() => {});
    function Broken(): never {
      throw new Error('서식 오류');
    }
    await expect(printPapers(<Broken />)).rejects.toThrow('서식 오류');
    expect(window.print).not.toHaveBeenCalled();
    expect(document.querySelector('.tl-print-root')).toBeNull();
  });

  it('화면의 DOM을 넘기면 넘침 선(미리보기 표시)은 복사하지 않는다', async () => {
    const { container } = render(
      <PaperPreview>
        <Paper label="1쪽" />
      </PaperPreview>,
    );
    // 넘친 종이처럼 선을 붙여 둔다(레이아웃 없는 jsdom)
    const mark = document.createElement('div');
    mark.className = 'tl-paper__overflow';
    container.querySelector('.tl-paper')!.appendChild(mark);
    let copied = -1;
    vi.spyOn(window, 'print').mockImplementation(() => {
      copied = document.querySelectorAll('.tl-print-root .tl-paper__overflow').length;
      window.dispatchEvent(new Event('afterprint'));
    });
    await printPapers(container.querySelector('.tl-paper-preview')!);
    expect(copied).toBe(0);
    expect(container.querySelector('.tl-paper__overflow')).not.toBeNull();
  });

  it('usePrintPapers도 onOpen · onClose를 넘긴다', async () => {
    const onOpen = vi.fn();
    vi.spyOn(window, 'print').mockImplementation(() => {
      window.dispatchEvent(new Event('beforeprint'));
      window.dispatchEvent(new Event('afterprint'));
    });
    function PrintButton() {
      const print = usePrintPapers();
      return (
        <button type="button" onClick={() => void print(<Paper label="p" />, { onOpen })}>
          print
        </button>
      );
    }
    render(<PrintButton />);
    fireEvent.click(screen.getByRole('button', { name: 'print' }));
    await vi.waitFor(() => expect(onOpen).toHaveBeenCalledTimes(1));
  });
});
