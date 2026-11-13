// 파일 · 오류(PG-44): FileViewer(그림 확대 · 회전, PDF 쪽 넘기기, 파일 카드, 도구 줄 키보드) · EmptyState notFound · expired · headingLevel
import {
  EmptyStateContract,
  FileViewerContract,
  type FileViewerProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { EmptyState, FileViewer } from '../src/core/index.js';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';

/** jsdom은 그림을 받지 않는다. 크기를 붙이고 load를 일으킨다 */
function loadImage(w = 800, h = 600) {
  const img = screen.getByRole('img');
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: w });
  Object.defineProperty(img, 'naturalHeight', { configurable: true, value: h });
  fireEvent.load(img);
  return img;
}

const status = () => screen.getByRole('status');
const toolbar = () => screen.getByRole('toolbar', { name: '보기 도구' });
const tool = (name: string) => within(toolbar()).getByRole('button', { name });

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'pdfViewerEnabled');
});

describe('contract parity', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    expect(FileViewer.displayName).toBe(FileViewerContract.name);
    expect(Object.keys(FileViewerContract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    expectTypeOf<FileViewerProps>().toMatchTypeOf<ComponentProps<typeof FileViewer>>();
  });

  it('values가 있는 prop은 값마다 data-<prop>, loading · error는 data-state', () => {
    for (const kind of FileViewerContract.props.kind.values!) {
      const { unmount } = render(
        <FileViewer name="a.bin" kind={kind as FileViewerProps['kind']} testID="v" />,
      );
      expect(screen.getByTestId('v')).toHaveAttribute('data-kind', kind);
      unmount();
    }
    for (const height of FileViewerContract.props.height.values!) {
      const { unmount } = render(
        <FileViewer name="a.png" height={height as FileViewerProps['height']} testID="v" />,
      );
      expect(screen.getByTestId('v')).toHaveAttribute('data-height', height);
      unmount();
    }
    const { rerender } = render(<FileViewer name="a.png" src={PNG} loading testID="v" />);
    expect(screen.getByTestId('v')).toHaveAttribute('data-state', 'loading');
    expect(screen.getByTestId('v')).toHaveAttribute('aria-busy', 'true');
    rerender(<FileViewer name="a.png" src={PNG} error="사진을 불러오지 못했습니다" testID="v" />);
    expect(screen.getByTestId('v')).toHaveAttribute('data-state', 'error');
  });

  it('보는 방법은 MIME · 확장자로 정한다', () => {
    const { rerender } = render(<FileViewer name="scan.JPG" testID="v" />);
    expect(screen.getByTestId('v')).toHaveAttribute('data-kind', 'image');
    rerender(<FileViewer name="결산.pdf" testID="v" />);
    expect(screen.getByTestId('v')).toHaveAttribute('data-kind', 'pdf');
    rerender(<FileViewer name="download" mimeType="application/pdf" testID="v" />);
    expect(screen.getByTestId('v')).toHaveAttribute('data-kind', 'pdf');
    rerender(<FileViewer name="자금 일보.xlsx" testID="v" />);
    expect(screen.getByTestId('v')).toHaveAttribute('data-kind', 'other');
  });
});

describe('FileViewer 그림', () => {
  it('이름 · 형식 · 크기 줄, 그림 alt, 받기 전에는 배율 단추가 꺼지고 aria-busy', () => {
    render(<FileViewer name="거래명세서 스캔.png" size={184320} src={PNG} testID="v" />);
    const root = screen.getByRole('group', { name: '거래명세서 스캔.png 미리 보기' });
    expect(within(root).getByText('PNG · 180KB')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', '거래명세서 스캔.png');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(tool('확대')).toBeDisabled();
    loadImage();
    expect(root).not.toHaveAttribute('aria-busy');
    expect(tool('확대')).toBeEnabled();
    expect(tool('화면에 맞춤')).toHaveAttribute('aria-pressed', 'true');
  });

  it('확대 · 축소 · 맞춤 · 회전: 배율 글자와 숨은 알림이 바뀐다', () => {
    render(<FileViewer name="scan.png" src={PNG} />);
    loadImage();
    // jsdom은 영역 크기가 0이라 맞춤 배율이 100%다
    expect(within(toolbar()).getByText('100%')).toBeInTheDocument();
    fireEvent.click(tool('확대'));
    expect(within(toolbar()).getByText('125%')).toBeInTheDocument();
    expect(status()).toHaveTextContent('배율 125%');
    expect(tool('화면에 맞춤')).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(tool('축소'));
    fireEvent.click(tool('축소'));
    expect(status()).toHaveTextContent('배율 75%');
    fireEvent.click(tool('화면에 맞춤'));
    expect(status()).toHaveTextContent('화면에 맞춤');
    fireEvent.click(tool('오른쪽으로 회전'));
    expect(status()).toHaveTextContent('90도 회전');
  });

  it('그림 영역 키: + · − · 0 · R', () => {
    render(<FileViewer name="scan.png" src={PNG} />);
    loadImage();
    const stage = screen.getByRole('group', { name: '그림 보기 영역' });
    expect(stage).toHaveAttribute('tabindex', '0');
    expect(stage).toHaveAccessibleDescription(/확대/);
    fireEvent.keyDown(stage, { key: '+' });
    expect(status()).toHaveTextContent('배율 125%');
    fireEvent.keyDown(stage, { key: '-' });
    fireEvent.keyDown(stage, { key: '-' });
    expect(status()).toHaveTextContent('배율 75%');
    fireEvent.keyDown(stage, { key: '0' });
    expect(status()).toHaveTextContent('화면에 맞춤');
    fireEvent.keyDown(stage, { key: 'r' });
    expect(status()).toHaveTextContent('90도 회전');
  });

  it('도구 줄: 탭 정지 하나, ← → Home End로 옮기고 꺼진 단추는 건너뛴다', () => {
    render(<FileViewer name="scan.png" src={PNG} onDownload={() => {}} />);
    loadImage();
    const buttons = within(toolbar()).getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      '축소',
      '확대',
      '화면에 맞춤',
      '오른쪽으로 회전',
      '다운로드',
    ]);
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);
    act(() => buttons[0]!.focus());
    fireEvent.keyDown(buttons[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(buttons[1]!, { key: 'End' });
    expect(document.activeElement).toBe(buttons[4]);
    fireEvent.keyDown(buttons[4]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(buttons[0]!, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[4]);
    expect(buttons[4]).toHaveAttribute('tabindex', '0');
    expect(buttons[0]).toHaveAttribute('tabindex', '-1');
  });

  it('깨진 그림: 오류 블록(role alert) · 다시 시도로 다시 받는다', () => {
    const onRetry = vi.fn();
    render(<FileViewer name="scan.png" src={PNG} onRetry={onRetry} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('alert')).toHaveTextContent('파일을 불러오지 못했습니다');
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('다른 파일이 오면 맞춤 · 회전 0으로', () => {
    const { rerender } = render(<FileViewer name="a.png" src={PNG} />);
    loadImage();
    fireEvent.click(tool('확대'));
    expect(tool('화면에 맞춤')).toHaveAttribute('aria-pressed', 'false');
    rerender(<FileViewer name="b.png" src={`${PNG}#b`} />);
    loadImage();
    expect(tool('화면에 맞춤')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('FileViewer PDF', () => {
  it('내장 보기에 쪽 · 배율을 넘기고 이전 · 다음 쪽 · PageDown으로 넘긴다', () => {
    const onPageChange = vi.fn();
    render(
      <FileViewer
        name="결산 보고서.pdf"
        src="blob:report"
        pageCount={3}
        onPageChange={onPageChange}
        testID="v"
      />,
    );
    const pdf = () => document.querySelector('object')!;
    expect(pdf()).toHaveAttribute('title', '결산 보고서.pdf');
    expect(pdf()).toHaveAttribute('aria-label', '결산 보고서.pdf');
    expect(pdf()).toHaveAttribute('type', 'application/pdf');
    expect(pdf()).toHaveAttribute('data', 'blob:report#page=1&view=FitH&toolbar=0&navpanes=0');
    expect(within(toolbar()).getByText('1 / 3')).toBeInTheDocument();
    expect(tool('이전 쪽')).toBeDisabled();
    fireEvent.click(tool('다음 쪽'));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    expect(status()).toHaveTextContent('3쪽 중 2쪽');
    expect(pdf().getAttribute('data')).toContain('#page=2&');
    fireEvent.keyDown(screen.getByTestId('v'), { key: 'PageDown' });
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(tool('다음 쪽')).toBeDisabled();
    fireEvent.click(tool('확대'));
    expect(pdf().getAttribute('data')).toContain('&zoom=125&');
    expect(screen.getByRole('button', { name: '새 창에서 열기' })).toBeInTheDocument();
  });

  it('제어 쪽: page가 바뀌어야 넘어간다', () => {
    function Controlled() {
      const [page, setPage] = useState(2);
      return (
        <FileViewer name="a.pdf" src="blob:a" pageCount={5} page={page} onPageChange={setPage} />
      );
    }
    render(<Controlled />);
    expect(within(toolbar()).getByText('2 / 5')).toBeInTheDocument();
    fireEvent.click(tool('이전 쪽'));
    expect(within(toolbar()).getByText('1 / 5')).toBeInTheDocument();
  });

  it('내장 PDF 보기가 없는 브라우저: 안내 카드 · 다운로드, 쪽 도구 없음', () => {
    Object.defineProperty(navigator, 'pdfViewerEnabled', { configurable: true, value: false });
    const onDownload = vi.fn();
    render(<FileViewer name="a.pdf" src="blob:a" pageCount={3} onDownload={onDownload} />);
    expect(document.querySelector('object')).toBeNull();
    expect(screen.getByText('이 브라우저는 PDF를 바로 보여 주지 않습니다')).toBeInTheDocument();
    expect(within(toolbar()).queryByRole('button', { name: '다음 쪽' })).toBeNull();
    expect(tool('새 창에서 열기')).toBeInTheDocument();
    const card = screen.getByText('새 창에서 열거나 다운로드하세요').closest('.tl-empty-state')!;
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: '다운로드' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });
});

describe('FileViewer 다른 형식 · 다운로드', () => {
  it('파일 카드: 안내와 다운로드(onDownload)', () => {
    const onDownload = vi.fn();
    render(<FileViewer name="자금 일보.xlsx" size={186400} onDownload={onDownload} />);
    expect(screen.getByText('미리 볼 수 없는 형식입니다')).toBeInTheDocument();
    expect(screen.getByText('XLSX · 182KB')).toBeInTheDocument();
    fireEvent.click(tool('다운로드'));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('onDownload가 없으면 src를 파일 이름으로 받는다, downloadable=false면 단추 없음', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.getAttribute('download')).toBe('명세.xlsx');
      expect(this.getAttribute('href')).toBe('blob:sheet');
    });
    const { rerender } = render(<FileViewer name="명세.xlsx" src="blob:sheet" />);
    fireEvent.click(tool('다운로드'));
    expect(click).toHaveBeenCalledTimes(1);
    rerender(<FileViewer name="명세.xlsx" src="blob:sheet" downloadable={false} />);
    expect(screen.queryByRole('button', { name: '다운로드' })).toBeNull();
  });
});

describe('EmptyState notFound · expired · headingLevel(PG-44)', () => {
  it('새 종류의 기본 제목 · 설명, 원래 종류는 그대로', () => {
    render(
      <>
        <EmptyState kind="notFound" testID="a" />
        <EmptyState kind="expired" testID="b" />
        <EmptyState kind="forbidden" testID="c" />
      </>,
    );
    expect(screen.getByTestId('a')).toHaveTextContent('주소에 해당하는 화면이 없습니다');
    expect(screen.getByTestId('a')).toHaveAttribute('data-kind', 'notFound');
    expect(screen.getByTestId('b')).toHaveTextContent('로그인이 만료되었습니다');
    expect(screen.getByTestId('b')).toHaveTextContent('다시 로그인한 뒤 이어서 작업하세요');
    expect(screen.getByTestId('c')).toHaveTextContent('볼 수 있는 권한이 없습니다');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(EmptyStateContract.props.kind.values).toContain('notFound');
  });

  it('headingLevel: 제목이 그 단계의 제목, 1 · 2는 화면 크기(data-heading)', () => {
    const { rerender } = render(
      <EmptyState kind="notFound" headingLevel={1} requestId="req-1" testID="e" />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '주소에 해당하는 화면이 없습니다',
    );
    expect(screen.getByTestId('e')).toHaveAttribute('data-heading', 'page');
    expect(screen.getByText('요청 ID req-1')).toBeInTheDocument();
    rerender(<EmptyState kind="empty" headingLevel={3} testID="e" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByTestId('e')).not.toHaveAttribute('data-heading');
    rerender(<EmptyState kind="empty" testID="e" />);
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
