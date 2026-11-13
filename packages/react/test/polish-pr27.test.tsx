// PR-27: 브랜드 짙은 사이드바 틀 · 제목 줄 탭 · 필터 칩 · 스켈레톤 묶음 · 아바타 색
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AppShell,
  Avatar,
  FilterBar,
  PageHeader,
  Select,
  SideNav,
  Skeleton,
} from '../src/core/index.js';

describe('AppShell 사이드바 틀', () => {
  it('사이드바가 있으면 brand는 사이드바 맨 위에, 바에는 숨은 brand만 남는다', () => {
    const { container } = render(
      <AppShell brand="테라스원" sidebar={<SideNav sections={[]} />}>
        본문
      </AppShell>,
    );
    const aside = container.querySelector('aside.tl-app-shell__sidebar')!;
    expect(aside.firstElementChild).toHaveClass('tl-app-shell__nav-brand');
    expect(aside.firstElementChild).toHaveTextContent('테라스원');
    expect(aside.querySelector('.tl-app-shell__nav-body .tl-side-nav')).not.toBeNull();
    // 좁은 화면용 바 brand는 CSS가 넓은 화면에서 숨긴다
    expect(container.querySelector('.tl-app-shell__bar .tl-app-shell__brand')).not.toBeNull();
  });

  it('사이드바가 없으면 바에 brand가 보이고 사이드바 열이 없다', () => {
    const { container } = render(<AppShell brand="테라스원">본문</AppShell>);
    expect(container.querySelector('aside')).toBeNull();
    expect(container.querySelector('.tl-app-shell__bar .tl-app-shell__brand')).toHaveTextContent(
      '테라스원',
    );
  });
});

describe('PageHeader 제목 줄 탭', () => {
  const siblings = [
    { label: '근무 관리', href: '/work' },
    { label: '휴가 관리', href: '/leave', current: true },
  ];

  it('지금 화면은 h1(aria-current), 나머지는 링크', () => {
    render(<PageHeader title="휴가 관리" siblings={siblings} />);
    const nav = screen.getByRole('navigation', { name: '같은 묶음 화면' });
    expect(screen.getByRole('heading', { level: 1, name: '휴가 관리' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(nav.querySelector('a')).toHaveAttribute('href', '/work');
  });

  it('onSiblingPress가 있으면 기본 이동을 막고 href를 넘긴다', () => {
    const onSiblingPress = vi.fn();
    render(<PageHeader title="휴가 관리" siblings={siblings} onSiblingPress={onSiblingPress} />);
    fireEvent.click(screen.getByRole('link', { name: '근무 관리' }));
    expect(onSiblingPress).toHaveBeenCalledWith('/work');
  });

  it('형제가 하나뿐이면 보통 제목', () => {
    render(<PageHeader title="휴가 관리" siblings={[siblings[1]!]} />);
    expect(screen.queryByRole('navigation', { name: '같은 묶음 화면' })).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveAttribute('aria-current');
  });
});

describe('FilterBar 칩', () => {
  it('label이 있는 Select는 "이름 값" 칩으로 묶이고 이름은 화면 낭독기에서 숨는다', () => {
    const { container } = render(
      <FilterBar>
        <Select
          label="조직"
          value="all"
          options={[
            { value: 'all', label: '전체 조직' },
            { value: 'dev', label: '개발팀' },
          ]}
          onChange={() => undefined}
        />
      </FilterBar>,
    );
    const chip = container.querySelector('.tl-filter-bar__chip')!;
    expect(chip).not.toBeNull();
    const label = chip.querySelector('.tl-filter-bar__chip-label')!;
    expect(label).toHaveTextContent('조직');
    expect(label).toHaveAttribute('aria-hidden', 'true');
    expect(chip.querySelector('.tl-select')).not.toBeNull();
    // 첫 옵션("전체")이면 기본값이라 칠하지 않는다
    expect(chip).not.toHaveAttribute('data-active');
  });

  it('기본값이 아닌 값을 고른 칩만 data-active, 검색 칸은 칩과 같은 줄 첫 자리', () => {
    const options = [
      { value: 'all', label: '전체 유형' },
      { value: 'contract', label: '계약서' },
    ];
    const { container } = render(
      <FilterBar search={<input aria-label="검색" />}>
        <Select label="유형" value="contract" options={options} onChange={() => undefined} />
        <Select label="법인" value="all" options={options} onChange={() => undefined} />
      </FilterBar>,
    );
    const chips = container.querySelectorAll('.tl-filter-bar__chip');
    expect(chips[0]).toHaveAttribute('data-active');
    expect(chips[1]).not.toHaveAttribute('data-active');
    expect(container.querySelector('.tl-filter-bar')!.firstElementChild).toHaveClass(
      'tl-filter-bar__search',
    );
  });
});

describe('Skeleton 묶음 모양', () => {
  it('table은 머리 + lines행 × columns열', () => {
    const { container } = render(<Skeleton shape="table" lines={3} columns={4} />);
    expect(container.querySelectorAll('.tl-skeleton__table-head .tl-skeleton__bone')).toHaveLength(
      4,
    );
    expect(container.querySelectorAll('.tl-skeleton__table-row')).toHaveLength(3);
  });

  it('list 기본 5행, 숨김(aria-hidden), immediate면 지연 없음 표시', () => {
    const { container } = render(<Skeleton shape="list" immediate />);
    const root = container.querySelector('.tl-skeleton')!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveAttribute('data-immediate');
    expect(container.querySelectorAll('.tl-skeleton__row')).toHaveLength(5);
  });

  it('kpi · card는 카드 모양 한 덩어리', () => {
    const { container } = render(
      <>
        <Skeleton shape="kpi" />
        <Skeleton shape="card" lines={2} />
      </>,
    );
    expect(container.querySelectorAll('[data-shape="kpi"] .tl-skeleton__bone')).toHaveLength(3);
    expect(container.querySelectorAll('[data-shape="card"] .tl-skeleton__bone')).toHaveLength(3);
  });
});

describe('Avatar 색', () => {
  it('같은 이름은 같은 색, tone을 주면 그 색', () => {
    const { container } = render(
      <>
        <Avatar name="이민호" testID="a" />
        <Avatar name="이민호" testID="b" />
        <Avatar name="이민호" tone={6} shape="circle" testID="c" />
      </>,
    );
    const [a, b, c] = ['a', 'b', 'c'].map((id) => screen.getByTestId(id));
    expect(a!.getAttribute('data-tone')).toBe(b!.getAttribute('data-tone'));
    expect(c).toHaveAttribute('data-tone', '6');
    expect(c).toHaveAttribute('data-shape', 'circle');
    expect(container).toBeTruthy();
  });
});
