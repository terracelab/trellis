// 블록이 직접 그린 것 올리기(PG-43): PermissionMatrix · Toolbar · ApprovalLine compact(R-T24) · ApprovalLineEditor(R-T25)
import {
  ApprovalLineContract,
  ApprovalLineEditorContract,
  PermissionMatrixContract,
  ToolbarContract,
  type ApprovalLineEditorProps,
  type ApprovalLineProps,
  type ApprovalLineStep,
  type ApprovalPerson,
  type PermissionAction,
  type PermissionMatrixProps,
  type PermissionResource,
  type ToolbarProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  ApprovalLine,
  ApprovalLineEditor,
  PermissionMatrix,
  Select,
  Toolbar,
} from '../src/core/index.js';

const ACTIONS: PermissionAction[] = [
  { id: 'read', label: '조회' },
  { id: 'create', label: '등록', requires: ['read'] },
  { id: 'update', label: '수정', requires: ['read'] },
];
const RESOURCES: PermissionResource[] = [
  { id: 'purchasing', module: 'purchasing', label: '구매' },
  { id: 'sales', module: 'sales', label: '영업' },
  { id: 'payroll', icon: 'wallet', label: '급여', disabled: true },
];

describe('contract parity', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    for (const [component, contract] of [
      [PermissionMatrix, PermissionMatrixContract],
      [Toolbar, ToolbarContract],
      [ApprovalLine, ApprovalLineContract],
      [ApprovalLineEditor, ApprovalLineEditorContract],
    ] as const) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<PermissionMatrixProps>().toMatchTypeOf<ComponentProps<typeof PermissionMatrix>>();
    // 웹은 content · end를 ReactNode로 좁힌다: 웹 props가 contract props에 맞는다(components.md §4)
    expectTypeOf<ComponentProps<typeof Toolbar>>().toMatchTypeOf<ToolbarProps>();
    expectTypeOf<ApprovalLineProps>().toMatchTypeOf<ComponentProps<typeof ApprovalLine>>();
    expectTypeOf<ApprovalLineEditorProps>().toMatchTypeOf<
      ComponentProps<typeof ApprovalLineEditor>
    >();
  });

  it('values가 있는 prop은 값마다 data-<prop>', () => {
    for (const size of ToolbarContract.props.size.values!)
      for (const orientation of ToolbarContract.props.orientation.values!) {
        const { unmount } = render(
          <Toolbar
            label="서식"
            testID="t"
            size={size as ToolbarProps['size']}
            orientation={orientation as ToolbarProps['orientation']}
            groups={[{ id: 'g', items: [{ id: 'list', label: '목록', icon: 'list' }] }]}
          />,
        );
        expect(screen.getByTestId('t')).toHaveAttribute('data-size', size);
        expect(screen.getByTestId('t')).toHaveAttribute('data-orientation', orientation);
        unmount();
      }
    for (const variant of ApprovalLineContract.props.variant.values!) {
      const { unmount } = render(
        <ApprovalLine
          testID="a"
          variant={variant as ApprovalLineProps['variant']}
          approvers={[{ id: 'u1', name: '김하늘', title: '대리', state: 'draft' }]}
        />,
      );
      expect(screen.getByTestId('a')).toHaveAttribute('data-variant', variant);
      unmount();
    }
  });
});

describe('PermissionMatrix', () => {
  function Controlled(props: Partial<PermissionMatrixProps>) {
    const [value, setValue] = useState<Record<string, string[]>>({ purchasing: ['read'] });
    return (
      <>
        <PermissionMatrix
          label="구매 담당 모듈 권한"
          resources={RESOURCES}
          actions={ACTIONS}
          value={value}
          onChange={setValue}
          {...props}
        />
        <output data-testid="value">{JSON.stringify(value)}</output>
      </>
    );
  }

  it('격자 · 머리 · 칸 이름, 켠 칸이 없는 줄은 "권한 없음"', () => {
    render(<Controlled resourceHeader="모듈" />);
    const grid = screen.getByRole('grid', { name: '구매 담당 모듈 권한' });
    expect(
      within(grid)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['모듈', '조회', '등록', '수정']);
    expect(within(grid).getAllByRole('rowheader')).toHaveLength(3);
    expect(screen.getByRole('checkbox', { name: '구매 조회' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getAllByText('권한 없음')).toHaveLength(2);
  });

  it('누르면 requires를 따른다: 수정을 켜면 조회도, 조회를 끄면 나머지도', () => {
    const onChange = vi.fn();
    render(
      <PermissionMatrix
        label="권한"
        resources={RESOURCES}
        actions={ACTIONS}
        defaultValue={{}}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: '영업 수정' }));
    expect(onChange).toHaveBeenLastCalledWith(
      { sales: ['read', 'update'] },
      { resource: 'sales', action: 'update', granted: true },
    );
    expect(screen.getByRole('checkbox', { name: '영업 조회' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(screen.getByRole('checkbox', { name: '영업 조회' }));
    expect(onChange).toHaveBeenLastCalledWith(
      { sales: [] },
      { resource: 'sales', action: 'read', granted: false },
    );
  });

  it('키보드: 탭 정류장 하나, 화살표 · Home · End · Ctrl+End로 옮기고 Space로 바꾼다', () => {
    render(<Controlled />);
    const first = screen.getByRole('checkbox', { name: '구매 조회' });
    expect(first).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('checkbox', { name: '구매 등록' })).toHaveAttribute('tabindex', '-1');
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: '구매 등록' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: '영업 등록' }));
    fireEvent.keyDown(document.activeElement!, { key: ' ' });
    expect(screen.getByTestId('value').textContent).toBe(
      JSON.stringify({ purchasing: ['read'], sales: ['read', 'create'] }),
    );
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: '영업 수정' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Home', ctrlKey: true });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: 'End', ctrlKey: true });
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: '급여 수정' }));
  });

  it('잠긴 줄 · 전부 잠금은 초점은 받고 바뀌지 않는다', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PermissionMatrix label="권한" resources={RESOURCES} actions={ACTIONS} onChange={onChange} />,
    );
    const locked = screen.getByRole('checkbox', { name: '급여 조회' });
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(locked);
    expect(onChange).not.toHaveBeenCalled();
    rerender(
      <PermissionMatrix
        label="권한"
        resources={RESOURCES}
        actions={ACTIONS}
        onChange={onChange}
        disabled
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: '구매 조회' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('읽기 전용: aria-readonly, 칸이 초점을 받고 허용 · 없음을 읽는다. 범위는 글자', () => {
    render(
      <PermissionMatrix
        label="권한"
        resources={RESOURCES}
        actions={ACTIONS}
        readOnly
        defaultValue={{ purchasing: ['read'] }}
        scopes={[
          { value: 'company', label: '전사' },
          { value: 'department', label: '부서' },
        ]}
        scope="department"
      />,
    );
    const grid = screen.getByRole('grid', { name: '권한' });
    expect(grid).toHaveAttribute('aria-readonly', 'true');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    const cells = within(grid).getAllByRole('gridcell');
    expect(cells[0]).toHaveTextContent('허용');
    expect(cells[1]).toHaveTextContent('없음');
    expect(cells[0]).toHaveAttribute('tabindex', '0');
    act(() => cells[0]!.focus());
    fireEvent.keyDown(cells[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cells[1]);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByText('부서')).toBeInTheDocument();
  });

  it('범위 고르기: RadioGroup, onScopeChange', () => {
    const onScopeChange = vi.fn();
    render(
      <PermissionMatrix
        label="권한"
        resources={RESOURCES}
        actions={ACTIONS}
        scopes={[
          { value: 'company', label: '전사' },
          { value: 'self', label: '본인' },
        ]}
        defaultScope="company"
        onScopeChange={onScopeChange}
      />,
    );
    const group = screen.getByRole('radiogroup', { name: '데이터 범위' });
    fireEvent.click(within(group).getByRole('radio', { name: '본인' }));
    expect(onScopeChange).toHaveBeenCalledWith('self');
  });
});

describe('Toolbar', () => {
  const groups = [
    {
      id: 'marks',
      label: '글자 서식',
      items: [
        {
          id: 'bold',
          label: '굵게',
          text: '가',
          textStyle: 'bold' as const,
          pressed: true,
          shortcut: 'Ctrl+B',
        },
        {
          id: 'italic',
          label: '기울임',
          text: '가',
          textStyle: 'italic' as const,
          pressed: false,
          disabled: true,
        },
      ],
    },
    {
      id: 'insert',
      label: '넣기',
      items: [
        { id: 'list', label: '목록', icon: 'list' as const },
        { id: 'table', label: '표', icon: 'table' as const },
      ],
    },
  ];

  it('toolbar · 묶음 · 구분선 · 켜고 끄는 단추 · 단축키', () => {
    render(<Toolbar label="서식" groups={groups} end="글자 수" />);
    const bar = screen.getByRole('toolbar', { name: '서식' });
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(
      within(bar)
        .getAllByRole('group')
        .map((g) => g.getAttribute('aria-label')),
    ).toEqual(['글자 서식', '넣기']);
    expect(within(bar).getAllByRole('separator')).toHaveLength(1);
    const bold = screen.getByRole('button', { name: '굵게' });
    expect(bold).toHaveAttribute('aria-pressed', 'true');
    expect(bold).toHaveAttribute('aria-keyshortcuts', 'Ctrl+B');
    expect(screen.getByRole('button', { name: '목록' })).not.toHaveAttribute('aria-pressed');
    expect(screen.getByText('글자 수')).toBeInTheDocument();
  });

  it('roving: 탭 정류장 하나, 화살표 · Home · End, 끝에서 처음으로 돈다. 잠긴 단추도 남는다', () => {
    render(<Toolbar label="서식" groups={groups} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    act(() => buttons[0]!.focus());
    fireEvent.keyDown(buttons[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-disabled', 'true');
    fireEvent.keyDown(buttons[1]!, { key: 'End' });
    expect(document.activeElement).toBe(buttons[3]);
    fireEvent.keyDown(buttons[3]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(buttons[0]!, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[3]);
    expect(buttons[3]).toHaveAttribute('tabindex', '0');
    expect(buttons[0]).toHaveAttribute('tabindex', '-1');
  });

  it('onPress(id), 잠긴 단추 · 전부 잠금은 부르지 않는다', () => {
    const onPress = vi.fn();
    const { rerender } = render(<Toolbar label="서식" groups={groups} onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: '표' }));
    fireEvent.click(screen.getByRole('button', { name: '기울임' }));
    expect(onPress.mock.calls).toEqual([['table']]);
    rerender(<Toolbar label="서식" groups={groups} onPress={onPress} disabled />);
    fireEvent.click(screen.getByRole('button', { name: '표' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-disabled', 'true');
  });

  it('content(Select)의 첫 초점 요소가 화살표 이동에 들어간다', () => {
    render(
      <Toolbar
        label="서식"
        groups={[
          {
            id: 'para',
            content: (
              <Select
                size="sm"
                label="문단 서식"
                defaultValue="body"
                options={[
                  { value: 'body', label: '본문' },
                  { value: 'h1', label: '제목 1' },
                ]}
              />
            ),
          },
          ...groups,
        ]}
      />,
    );
    const select = screen.getByRole('combobox', { name: '문단 서식' });
    expect(select).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: '굵게' })).toHaveAttribute('tabindex', '-1');
    act(() => select.focus());
    fireEvent.keyDown(select, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '굵게' }));
    expect(select).toHaveAttribute('tabindex', '-1');
  });

  it('세로: ↓ · ↑로 옮긴다', () => {
    render(<Toolbar label="서식" groups={groups} orientation="vertical" />);
    const buttons = screen.getAllByRole('button');
    act(() => buttons[0]!.focus());
    fireEvent.keyDown(buttons[0]!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(buttons[1]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
  });
});

describe('ApprovalLine compact(R-T24)', () => {
  it('점 · "3/4 검토" · 숨은 상태와 칸마다 글자', () => {
    const { container } = render(
      <ApprovalLine
        variant="compact"
        approvers={[
          { id: 'u1', name: '김하늘', title: '대리', state: 'draft' },
          { id: 'u2', name: '이수민', title: '과장', state: 'approved' },
          { id: 'u3', name: '박서연', title: '팀장', state: 'pending' },
          { id: 'u4', name: '정우성', title: '이사', state: 'waiting' },
        ]}
      />,
    );
    const root = container.querySelector('.tl-approval-line')!;
    expect(root).toHaveAttribute('data-status', 'pending');
    expect(
      [...container.querySelectorAll('.tl-approval-line__dot')].map((d) =>
        d.getAttribute('data-status'),
      ),
    ).toEqual(['draft', 'approved', 'pending', 'waiting']);
    expect(root.querySelector('.tl-approval-line__dots')).toHaveAttribute('aria-hidden', 'true');
    expect(root.textContent).toContain('3/4 검토');
    expect(root.textContent).toContain('진행');
    expect(root.textContent).toContain('승인 정우성 대기');
    expect(root).toHaveAttribute('title', expect.stringContaining('검토 이수민 승인'));
    // compact는 목록(ol)이 아니다
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('ApprovalLineEditor(R-T25)', () => {
  const PEOPLE: ApprovalPerson[] = [
    { id: 'e1', name: '정민호', title: '팀장', meta: '영업팀', code: 'E-0031' },
    { id: 'e2', name: '박서연', title: '선임', meta: '재무팀', code: 'E-0044' },
    { id: 'e3', name: '한결', title: '대표', meta: '경영지원', code: 'E-0001' },
    { id: 'e4', name: '이도윤', title: '주임', meta: '구매팀', code: 'E-0052' },
  ];
  const DRAFTER: ApprovalPerson = { id: 'e9', name: '김하늘', title: '대리', meta: '영업팀' };

  function Controlled(props: Partial<ApprovalLineEditorProps>) {
    const [line, setLine] = useState<ApprovalLineStep[]>([
      { person: 'e1', role: '검토' },
      { person: 'e2', role: '합의' },
      { person: 'e3', role: '승인' },
    ]);
    const [cc, setCc] = useState<string[]>([]);
    return (
      <>
        <ApprovalLineEditor
          people={PEOPLE}
          drafter={DRAFTER}
          value={line}
          onChange={setLine}
          cc={cc}
          onCcChange={setCc}
          {...props}
        />
        <output data-testid="line">{line.map((s) => `${s.person}:${s.role}`).join(',')}</output>
        <output data-testid="cc">{cc.join(',')}</output>
      </>
    );
  }

  it('결재선 목록: 기안자 0번 · 결재자 줄 · 역할 · 단추 이름', () => {
    render(<Controlled />);
    const list = screen.getByRole('list', { name: '결재선' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(within(list).getByText('김하늘 대리')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '박서연 역할' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '정민호 위로' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '한결 아래로' })).toBeDisabled();
    expect(list).toHaveAccessibleDescription('Alt와 위 · 아래 화살표로 순서를 바꿉니다');
  });

  it('단추 · Alt+화살표로 순서를 바꾸고 알림 줄이 읽는다. 초점은 같은 단추에', () => {
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: '정민호 아래로' }));
    expect(screen.getByTestId('line').textContent).toBe('e2:합의,e1:검토,e3:승인');
    expect(screen.getByText('정민호 2번째로 옮겼습니다')).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '정민호 아래로' }));
    fireEvent.keyDown(screen.getByRole('button', { name: '정민호 아래로' }), {
      key: 'ArrowDown',
      altKey: true,
    });
    expect(screen.getByTestId('line').textContent).toBe('e2:합의,e3:승인,e1:검토');
    // 끝에 닿으면 아래로가 잠겨 위로 단추로 초점
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '정민호 위로' }));
    expect(screen.getByText('마지막 결재자의 역할이 승인이 아닙니다')).toHaveAttribute(
      'role',
      'status',
    );
  });

  it('빼기: 줄을 빼고 초점은 이웃 줄 빼기 단추로', () => {
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: '박서연 빼기' }));
    expect(screen.getByTestId('line').textContent).toBe('e1:검토,e3:승인');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '한결 빼기' }));
    expect(screen.getByText('박서연 결재선에서 뺐습니다')).toBeInTheDocument();
  });

  it('역할 바꾸기는 줄의 role만', () => {
    const onChange = vi.fn();
    render(
      <ApprovalLineEditor
        people={PEOPLE}
        defaultValue={[{ person: 'e1', role: '검토' }]}
        onChange={onChange}
        showCc={false}
      />,
    );
    expect(screen.queryByText('참조')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '정민호 역할' })).toBeInTheDocument();
  });

  it('빈 결재선 · 오류 · 최대 수', () => {
    const { unmount } = render(
      <ApprovalLineEditor people={PEOPLE} defaultValue={[]} error="결재자를 한 명 이상 고르세요" />,
    );
    expect(screen.getByText('결재자가 없습니다. 아래에서 결재자를 추가하세요')).toBeInTheDocument();
    expect(screen.getByText('결재자를 한 명 이상 고르세요')).toBeInTheDocument();
    unmount();
    render(
      <ApprovalLineEditor
        people={PEOPLE}
        defaultValue={[{ person: 'e1', role: '승인' }]}
        max={1}
      />,
    );
    expect(screen.getByText('결재자는 1명까지입니다')).toBeInTheDocument();
  });

  it('참조: TagInput 사람 모드, 결재선 사람은 추천에서 빠진다', () => {
    render(<Controlled />);
    const cc = screen.getByRole('combobox', { name: '참조' });
    fireEvent.focus(cc);
    fireEvent.change(cc, { target: { value: '도윤' } });
    fireEvent.keyDown(cc, { key: 'Enter' });
    expect(screen.getByTestId('cc').textContent).toBe('e4');
    fireEvent.change(cc, { target: { value: '정민호' } });
    expect(screen.queryByRole('option', { name: /정민호/ })).not.toBeInTheDocument();
  });
});
