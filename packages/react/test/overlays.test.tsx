import {
  ActionBarContract,
  ApprovalLineContract,
  AttachmentContract,
  FilterBarContract,
  MenuContract,
  PaginationContract,
  StepperContract,
  ToastContract,
  TooltipContract,
  formatAttachmentSize,
  inferAttachmentType,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ActionBar,
  ApprovalLine,
  Attachment,
  Button,
  FilterBar,
  IconButton,
  Menu,
  Pagination,
  Stepper,
  Toast,
  ToastProvider,
  Tooltip,
  TooltipProvider,
  useToast,
} from '../src/core/index.js';

const CONTRACTS = [
  TooltipContract,
  MenuContract,
  ToastContract,
  PaginationContract,
  StepperContract,
  ApprovalLineContract,
  ActionBarContract,
  FilterBarContract,
  AttachmentContract,
];

describe('contract parity', () => {
  it('displayName === contract.name', () => {
    const pairs: [{ displayName?: string }, { name: string }][] = [
      [Tooltip, TooltipContract],
      [Menu, MenuContract],
      [Toast, ToastContract],
      [Pagination, PaginationContract],
      [Stepper, StepperContract],
      [ApprovalLine, ApprovalLineContract],
      [ActionBar, ActionBarContract],
      [FilterBar, FilterBarContract],
      [Attachment, AttachmentContract],
    ];
    for (const [c, k] of pairs) expect(c.displayName).toBe(k.name);
  });

  it('모든 contract props에 id · testID가 있다', () => {
    for (const c of CONTRACTS) {
      expect(Object.keys(c.props), c.name).toContain('id');
      expect(Object.keys(c.props), c.name).toContain('testID');
    }
  });

  it('Tooltip만 웹 전용', () => {
    for (const c of CONTRACTS) expect(c.platforms.native, c.name).toBe(c.name !== 'Tooltip');
  });
});

describe('Tooltip', () => {
  it('트리거를 그대로 그리고 포커스하면 말풍선을 연다', async () => {
    render(
      <TooltipProvider>
        <Tooltip content="엑셀 다운로드" delay={0} testID="tip">
          <IconButton icon="download" label="엑셀 다운로드" />
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = screen.getByRole('button', { name: '엑셀 다운로드' });
    expect(trigger).toHaveClass('tl-icon-button');
    act(() => {
      trigger.focus();
    });
    await waitFor(() => expect(screen.getByTestId('tip')).toHaveTextContent('엑셀 다운로드'));
    expect(screen.getByTestId('tip')).toHaveClass('tl-tooltip');
  });
});

describe('Menu', () => {
  it('트리거를 누르면 열리고 항목을 고르면 onSelect를 부른다', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <Menu
        testID="menu"
        trigger={<IconButton icon="ellipsis" label="발주 동작" />}
        items={[
          { type: 'label', label: '문서' },
          { id: 'edit', label: '수정', icon: 'pencil', onSelect: onEdit },
          { type: 'separator' },
          { id: 'delete', label: '삭제', icon: 'trash-2', danger: true, onSelect: onDelete },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: '발주 동작' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass('tl-menu');
    expect(menu).toHaveAttribute('data-testid', 'menu');
    expect(within(menu).getByRole('group')).toHaveTextContent('문서');
    const del = within(menu).getByRole('menuitem', { name: '삭제' });
    expect(del).toHaveAttribute('data-danger');
    fireEvent.click(within(menu).getByRole('menuitem', { name: '수정' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });
});

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('useToast().show가 ToastProvider 안에 제목을 그린다', async () => {
    const onUndo = vi.fn();
    function SaveButton() {
      const toast = useToast();
      return (
        <Button
          onPress={() =>
            toast.show({
              title: '발주서를 저장했습니다',
              tone: 'success',
              action: { label: '되돌리기', onPress: onUndo },
            })
          }
        >
          저장
        </Button>
      );
    }
    render(
      <ToastProvider>
        <SaveButton />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    const title = await screen.findByText('발주서를 저장했습니다');
    const toast = title.closest('.tl-toast');
    expect(toast).toHaveAttribute('data-tone', 'success');
    fireEvent.click(screen.getByRole('button', { name: '되돌리기' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('close(id)로 닫는다', async () => {
    let api: ReturnType<typeof useToast> | null = null;
    function Grab() {
      api = useToast();
      return null;
    }
    render(
      <ToastProvider>
        <Grab />
      </ToastProvider>,
    );
    let id = '';
    act(() => {
      id = api!.show({ title: '반려했습니다', duration: 0 });
    });
    expect(await screen.findByText('반려했습니다')).toBeInTheDocument();
    act(() => api!.close(id));
    await waitFor(() => expect(screen.queryByText('반려했습니다')).not.toBeInTheDocument());
  });

  it('정적 Toast: 톤 · 역할 · 닫기 버튼', () => {
    const onClose = vi.fn();
    render(<Toast title="전송에 실패했습니다" tone="danger" onClose={onClose} testID="t" />);
    const el = screen.getByTestId('t');
    expect(el).toHaveClass('tl-toast');
    expect(el).toHaveAttribute('role', 'alert');
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Pagination', () => {
  it('총 건수 · 생략 · aria-current · onPageChange', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={5} total={1240} onPageChange={onPageChange} testID="pg" />);
    const nav = screen.getByRole('navigation', { name: '페이지' });
    expect(nav).toHaveTextContent('총 1,240건');
    // 62페이지 · 번호 7칸(1 … 4 5 6 … 62). 생략 칸은 읽히지 않는다
    expect(nav.querySelectorAll('.tl-pagination__list > li')).toHaveLength(7);
    expect(within(nav).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '62' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '6' }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    fireEvent.click(screen.getByRole('button', { name: '이전 페이지' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    fireEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
    expect(onPageChange).toHaveBeenLastCalledWith(62);
    // 현재 페이지를 다시 누르면 부르지 않는다
    onPageChange.mockClear();
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('첫 페이지에서 이전은 비활성, 페이지 크기 선택에 이름이 있다', () => {
    render(
      <Pagination
        page={1}
        pageCount={3}
        pageSizeOptions={[20, 50, 100]}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeEnabled();
    expect(screen.getByRole('combobox', { name: '페이지 크기' })).toHaveTextContent('20건씩');
  });

  it('disabled면 번호도 누를 수 없다', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={4} disabled onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-state', 'disabled');
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled();
  });
});

describe('Stepper', () => {
  it('ol + aria-current="step" + 상태 글자', () => {
    render(
      <Stepper
        testID="st"
        label="주문 단계"
        steps={[
          { id: 'a', label: '주문 접수', state: 'done' },
          { id: 'b', label: '결제 확인', state: 'current' },
          { id: 'c', label: '출고', state: 'todo' },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: '주문 단계' });
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).toHaveTextContent('완료');
    expect(items[2]).toHaveTextContent('3');
  });
});

describe('ApprovalLine', () => {
  it('역할 기본값 · 결재 배지 · 대기 · 의견 title', () => {
    render(
      <ApprovalLine
        approvers={[
          { id: '1', name: '김지훈', title: '대리', state: 'draft', time: '11-03 09:12' },
          { id: '2', name: '이수민', title: '과장', state: 'pending', comment: '단가 확인 중' },
          { id: '3', name: '정우성', title: '이사', state: 'waiting' },
        ]}
      />,
    );
    const items = within(screen.getByRole('list', { name: '결재선' })).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('기안');
    expect(items[1]).toHaveTextContent('검토');
    expect(items[1]).toHaveTextContent('진행');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[2]).toHaveTextContent('승인');
    expect(items[2]).toHaveTextContent('대기');
    expect(screen.getByTitle('단가 확인 중')).toBeInTheDocument();
  });
});

describe('ActionBar', () => {
  it('summary가 있으면 between, primary가 끝이 아니면 경고', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <ActionBar summary="3건 선택" testID="ab">
        <Button variant="ghost">취소</Button>
        <Button variant="primary">저장</Button>
      </ActionBar>,
    );
    expect(screen.getByTestId('ab')).toHaveAttribute('data-align', 'between');
    expect(warn).not.toHaveBeenCalled();
    rerender(
      <ActionBar testID="ab">
        <Button variant="primary">저장</Button>
        <Button variant="ghost">취소</Button>
      </ActionBar>,
    );
    expect(screen.getByTestId('ab')).toHaveAttribute('data-align', 'end');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('FilterBar', () => {
  it('search 영역 · 초기화 · 결과 건수', () => {
    const onReset = vi.fn();
    render(
      <FilterBar
        search={<input aria-label="입고 검색" />}
        onReset={onReset}
        resultCount={1280}
        actions={<Button>엑셀 다운로드</Button>}
      >
        <span>필터</span>
      </FilterBar>,
    );
    const bar = screen.getByRole('search', { name: '검색 조건' });
    expect(bar).toHaveTextContent('검색 결과 1,280건');
    fireEvent.click(within(bar).getByRole('button', { name: '초기화' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('label: 한 화면에 둘이면 검색 영역 이름을 따로 준다', () => {
    render(
      <>
        <FilterBar label="서식 검색 조건">
          <span>종류</span>
        </FilterBar>
        <FilterBar label="발급 기록 검색 조건" layout="grid" onSearch={() => {}}>
          <span>서식</span>
        </FilterBar>
      </>,
    );
    expect(screen.getByRole('search', { name: '서식 검색 조건' })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: '발급 기록 검색 조건' })).toBeInTheDocument();
    expect(screen.queryByRole('search', { name: '검색 조건' })).toBeNull();
  });
});

describe('Attachment', () => {
  it('크기 · 종류 추론 · 다운로드 · 삭제', () => {
    const onRemove = vi.fn();
    render(
      <Attachment
        files={[
          { name: '견적서.pdf', size: 186_368, href: '/q.pdf' },
          { name: '단가표.xlsx', size: 2_516_582 },
        ]}
        onRemove={onRemove}
      />,
    );
    const list = screen.getByRole('list', { name: '첨부 파일' });
    const [pdf, xlsx] = within(list).getAllByRole('listitem');
    expect(pdf).toHaveTextContent('182KB');
    expect(pdf).toHaveAttribute('data-type', 'pdf');
    expect(xlsx).toHaveTextContent('2.4MB');
    expect(within(pdf!).getByRole('button', { name: '견적서.pdf 다운로드' })).toBeInTheDocument();
    expect(within(xlsx!).queryByRole('button', { name: /다운로드/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '단가표.xlsx 삭제' }));
    expect(onRemove).toHaveBeenCalledWith('단가표.xlsx');
  });

  it('downloadable=false면 이름이 링크', () => {
    render(
      <Attachment files={[{ name: '사진.png', size: 900, href: '/a.png' }]} downloadable={false} />,
    );
    expect(screen.getByRole('link', { name: '사진.png' })).toHaveAttribute('href', '/a.png');
  });

  it('formatAttachmentSize · inferAttachmentType', () => {
    expect(formatAttachmentSize(812)).toBe('812B');
    expect(formatAttachmentSize(186_368)).toBe('182KB');
    expect(formatAttachmentSize(2_516_582)).toBe('2.4MB');
    expect(formatAttachmentSize(1_288_490_189)).toBe('1.2GB');
    expect(inferAttachmentType('수입신고필증.ZIP')).toBe('zip');
    expect(inferAttachmentType('명세.csv')).toBe('xlsx');
    expect(inferAttachmentType('README')).toBe('other');
  });
});
