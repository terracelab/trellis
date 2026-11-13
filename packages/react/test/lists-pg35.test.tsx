// 메신저 보강 1(PG-35): SelectableList(R-T22) · AvatarGroup · PersonLabel status(R-T59) · 사람 상태 어휘(R-T26)
import {
  AvatarGroupContract,
  PersonLabelContract,
  SelectableListContract,
  type AvatarGroupProps,
  type SelectableListItem,
  type SelectableListProps,
} from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { AvatarGroup, PersonLabel, SelectableList, TrellisProvider } from '../src/core/index.js';

const ROOMS: SelectableListItem[] = [
  {
    id: 'ch-notice',
    group: '채널',
    title: '전사 공지',
    icon: 'megaphone',
    secondary: '11월 마감 일정',
    meta: '09:12',
    muted: true,
    count: 3,
  },
  { id: 'ch-sales', group: '채널', title: '영업팀', icon: 'users', count: 120 },
  {
    id: 'dm-han',
    group: '대화',
    title: '한서연 매니저',
    avatar: { name: '한서연', status: 'online' },
    secondary: '연차 신청서 결재 올렸습니다',
  },
  { id: 'dm-off', group: '대화', title: '퇴사자', disabled: true },
  { id: 'dm-lee', group: '대화', title: '이도윤 주임', avatar: { name: '이도윤' } },
];

function Controlled(props: Partial<SelectableListProps>) {
  const [id, setId] = useState<string | null>('ch-sales');
  return (
    <>
      <SelectableList label="대화방" items={ROOMS} selected={id} onSelect={setId} {...props} />
      <output data-testid="picked">{id}</output>
    </>
  );
}

const rowButton = (name: RegExp) => screen.getByRole('button', { name });

describe('contract parity', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    for (const [component, contract] of [
      [SelectableList, SelectableListContract],
      [AvatarGroup, AvatarGroupContract],
    ] as const) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<SelectableListProps>().toMatchTypeOf<ComponentProps<typeof SelectableList>>();
    expectTypeOf<AvatarGroupProps>().toMatchTypeOf<ComponentProps<typeof AvatarGroup>>();
  });

  it('values가 있는 prop은 값마다 data-<prop>', () => {
    for (const variant of SelectableListContract.props.variant.values!)
      for (const size of SelectableListContract.props.size.values!) {
        const { unmount } = render(
          <SelectableList
            label="목록"
            items={ROOMS}
            variant={variant as SelectableListProps['variant']}
            size={size as SelectableListProps['size']}
            testID="s"
          />,
        );
        expect(screen.getByTestId('s')).toHaveAttribute('data-variant', variant);
        expect(screen.getByTestId('s')).toHaveAttribute('data-size', size);
        unmount();
      }
    for (const size of AvatarGroupContract.props.size.values!)
      for (const shape of AvatarGroupContract.props.shape.values!) {
        const { unmount } = render(
          <AvatarGroup
            people={[{ name: '한서연' }]}
            size={Number(size) as AvatarGroupProps['size']}
            shape={shape as AvatarGroupProps['shape']}
            testID="g"
          />,
        );
        expect(screen.getByTestId('g')).toHaveAttribute('data-size', size);
        expect(screen.getByTestId('g')).toHaveAttribute('data-shape', shape);
        unmount();
      }
  });

  it('loading state는 prop으로 켜고 data-state · aria-busy', () => {
    render(<SelectableList label="목록" items={ROOMS} loading testID="s" />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-state', 'loading');
    expect(screen.getByTestId('s')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('SelectableList', () => {
  it('이름 있는 묶음, 묶음 머리로 이름 붙은 목록, 고른 행은 aria-current', () => {
    render(<Controlled />);
    const root = screen.getByRole('group', { name: '대화방' });
    expect(within(root).getByRole('list', { name: '채널' })).toBeInTheDocument();
    expect(within(root).getByRole('list', { name: '대화' })).toBeInTheDocument();
    expect(rowButton(/영업팀/)).toHaveAttribute('aria-current', 'true');
    expect(rowButton(/전사 공지/)).not.toHaveAttribute('aria-current');
  });

  it('행 이름: 제목 · 알림 끔 · 보조 · 시각 · 안 읽음 수(caption 숫자, 99+)', () => {
    render(<Controlled />);
    const notice = rowButton(/전사 공지/);
    expect(notice).toHaveAccessibleName(/전사 공지\s?알림 끔/);
    expect(notice).toHaveTextContent('11월 마감 일정');
    expect(notice).toHaveTextContent('09:12');
    expect(notice).toHaveAccessibleName(/읽지 않음 3/);
    const count = notice.querySelector('.tl-selectable-list__count')!;
    expect(count).toHaveAttribute('data-muted');
    expect(rowButton(/영업팀/).querySelector('.tl-selectable-list__count')).toHaveTextContent(
      '99+',
    );
  });

  it('아바타는 꾸밈이고 접속 상태는 숨은 글자', () => {
    render(<Controlled />);
    const han = rowButton(/한서연 매니저/);
    expect(han.querySelector('.tl-avatar')).toHaveAttribute('aria-hidden', 'true');
    expect(han.querySelector('.tl-avatar')).toHaveAttribute('data-status', 'online');
    expect(han).toHaveAccessibleName(/온라인/);
  });

  it('탭 정류장 하나(roving): 고른 행만 tabIndex 0', () => {
    render(<Controlled />);
    const tabbable = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('tabindex') === '0');
    expect(tabbable).toEqual([rowButton(/영업팀/)]);
  });

  it('↓ · ↑ · Home · End는 초점만 옮기고(비활성 건너뜀) Enter · 누름이 고른다', () => {
    render(<Controlled />);
    const sales = rowButton(/영업팀/);
    sales.focus();
    fireEvent.keyDown(sales, { key: 'ArrowDown' });
    expect(rowButton(/한서연 매니저/)).toHaveFocus();
    expect(screen.getByTestId('picked')).toHaveTextContent('ch-sales');
    fireEvent.keyDown(rowButton(/한서연 매니저/), { key: 'ArrowDown' });
    // 비활성 행(퇴사자)을 건너뛴다
    expect(rowButton(/이도윤 주임/)).toHaveFocus();
    fireEvent.keyDown(rowButton(/이도윤 주임/), { key: 'Home' });
    expect(rowButton(/전사 공지/)).toHaveFocus();
    expect(rowButton(/전사 공지/)).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(rowButton(/전사 공지/), { key: 'End' });
    expect(rowButton(/이도윤 주임/)).toHaveFocus();
    fireEvent.keyDown(rowButton(/이도윤 주임/), { key: 'ArrowUp' });
    expect(rowButton(/한서연 매니저/)).toHaveFocus();
    fireEvent.click(rowButton(/한서연 매니저/));
    expect(screen.getByTestId('picked')).toHaveTextContent('dm-han');
    expect(rowButton(/한서연 매니저/)).toHaveAttribute('aria-current', 'true');
  });

  it('비활성 행은 disabled 단추라 고르지 않는다', () => {
    const onSelect = vi.fn();
    render(<SelectableList label="대화방" items={ROOMS} onSelect={onSelect} />);
    const off = rowButton(/퇴사자/);
    expect(off).toBeDisabled();
    fireEvent.click(off);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('언컨트롤드: defaultSelected에서 시작해 누르면 바뀐다', () => {
    render(<SelectableList label="대화방" items={ROOMS} defaultSelected="ch-notice" />);
    expect(rowButton(/전사 공지/)).toHaveAttribute('aria-current', 'true');
    fireEvent.click(rowButton(/이도윤 주임/));
    expect(rowButton(/이도윤 주임/)).toHaveAttribute('aria-current', 'true');
    expect(rowButton(/전사 공지/)).not.toHaveAttribute('aria-current');
  });

  it('근무 상태: md는 점 + 글자, sm은 점만(숨은 글자)', () => {
    const people: SelectableListItem[] = [
      {
        id: 'E-0012',
        title: '한서연',
        avatar: { name: '한서연' },
        secondary: '인사팀',
        presence: 'remote',
      },
    ];
    const { rerender } = render(<SelectableList label="사원" items={people} />);
    expect(rowButton(/한서연/)).toHaveTextContent('재택');
    rerender(<SelectableList label="사원" items={people} size="sm" />);
    const presence = rowButton(/한서연/).querySelector('.tl-selectable-list__presence')!;
    expect(presence).toHaveAttribute('title', '재택');
    expect(presence.querySelector('.tl-sr-only')).toHaveTextContent('재택');
  });

  it('빈 목록 글자 · 오른쪽 값', () => {
    const { rerender } = render(<SelectableList label="지급 달" items={[]} />);
    expect(screen.getByText('항목이 없습니다')).toBeInTheDocument();
    rerender(
      <SelectableList
        label="지급 달"
        items={[
          { id: '2026-10', title: '2026년 10월', secondary: '지급 10-23', value: '3,412,870원' },
        ]}
      />,
    );
    expect(rowButton(/2026년 10월/).querySelector('.tl-selectable-list__value')).toHaveTextContent(
      '3,412,870원',
    );
  });

  it('countLabel로 수를 읽는 이름을 바꾼다 · en 사전', () => {
    render(
      <TrellisProvider locale="en">
        <SelectableList label="Rooms" items={[{ id: 'a', title: 'Sales', count: 2 }]} />
        <SelectableList
          label="Queue"
          items={[{ id: 'b', title: 'Docs', count: 5 }]}
          countLabel="Waiting"
        />
      </TrellisProvider>,
    );
    expect(rowButton(/Sales/)).toHaveAccessibleName(/Unread: 2/);
    expect(rowButton(/Docs/)).toHaveAccessibleName(/Waiting: 5/);
  });
});

describe('AvatarGroup', () => {
  const SIX = ['한서연', '정민호', '박서연', '이도윤', '최하늘', '오세린'].map((name) => ({
    name,
  }));

  it('넘치면 max − 1명 + "+N", 이름은 "앞 이름들 외 N명"', () => {
    const { container } = render(<AvatarGroup people={SIX} max={4} />);
    const img = screen.getByRole('img', { name: '한서연, 정민호, 박서연 외 3명' });
    expect(img.querySelectorAll('.tl-avatar')).toHaveLength(3);
    const more = container.querySelector('.tl-avatar-group__more')!;
    expect(more).toHaveTextContent('+3');
    expect(more).toHaveAttribute('title', '이도윤, 최하늘, 오세린');
    for (const a of img.querySelectorAll('.tl-avatar'))
      expect(a).toHaveAttribute('aria-hidden', 'true');
  });

  it('넘치지 않으면 전부, label이 이름을 이긴다', () => {
    const { container, rerender } = render(<AvatarGroup people={SIX.slice(0, 3)} />);
    expect(screen.getByRole('img', { name: '한서연, 정민호, 박서연' })).toBeInTheDocument();
    expect(container.querySelector('.tl-avatar-group__more')).toBeNull();
    rerender(<AvatarGroup people={SIX} label="참석자 6명" />);
    expect(screen.getByRole('img', { name: '참석자 6명' })).toBeInTheDocument();
  });

  it('en 사전', () => {
    render(
      <TrellisProvider locale="en">
        <AvatarGroup people={SIX} max={2} />
      </TrellisProvider>,
    );
    expect(screen.getByRole('img', { name: '한서연 and 5 more' })).toBeInTheDocument();
  });
});

describe('PersonLabel status(R-T59)', () => {
  it('Avatar status를 넘기고 접속 상태를 숨은 글자로 읽는다', () => {
    const { container } = render(
      <PersonLabel
        name="정민호"
        meta="영업팀"
        status="busy"
        presence="fieldwork"
        onPress={() => undefined}
      />,
    );
    expect(container.querySelector('.tl-avatar')).toHaveAttribute('data-status', 'busy');
    const btn = screen.getByRole('button');
    expect(btn).toHaveAccessibleName(/정민호\s?다른 용무 중/);
    expect(btn).toHaveTextContent('외근');
  });

  it('status는 contract에 있고 values = AvatarStatus', () => {
    expect(PersonLabelContract.props.status.values).toEqual(['online', 'away', 'busy', 'offline']);
  });
});
