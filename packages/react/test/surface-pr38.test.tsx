// 면 · 머리 보강(PR-32 · PR-34 · PR-38): Card 무게 · Badge 점 · Banner 좁은 자리 · SectionHeader ·
// NotificationItem · NotificationList · Avatar / PersonLabel 공석 · PageHeader meta · Drawer 첫 초점
import {
  NotificationItemContract,
  NotificationListContract,
  SectionHeaderContract,
  type NotificationItemProps,
  type NotificationListItem,
  type NotificationListProps,
  type SectionHeaderProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  Drawer,
  DueBadge,
  Input,
  NotificationItem,
  NotificationList,
  PageHeader,
  PersonLabel,
  SectionHeader,
} from '../src/core/index.js';

// 현지 시각(시간대와 관계없이 같은 결과). 2026-11-06은 금요일
const NOW = '2026-11-06T09:00:00';

describe('contract parity', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    for (const [component, contract] of [
      [SectionHeader, SectionHeaderContract],
      [NotificationItem, NotificationItemContract],
      [NotificationList, NotificationListContract],
    ] as const) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props와 맞는다(타입)', () => {
    expectTypeOf<NotificationItemProps>().toMatchTypeOf<ComponentProps<typeof NotificationItem>>();
    expectTypeOf<NotificationListProps>().toMatchTypeOf<ComponentProps<typeof NotificationList>>();
    expectTypeOf<ComponentProps<typeof SectionHeader>>().toMatchTypeOf<SectionHeaderProps>();
  });
});

describe('Card 무게(PR-38)', () => {
  it('emphasis는 data-emphasis로, 기본은 속성 없음', () => {
    const { container } = render(
      <>
        <Card title="지난 기한" emphasis="strong">
          A
        </Card>
        <Card title="이번 주">B</Card>
        <Card title="참고" emphasis="quiet">
          C
        </Card>
      </>,
    );
    const cards = container.querySelectorAll('.tl-card');
    expect(cards[0]).toHaveAttribute('data-emphasis', 'strong');
    expect(cards[1]).not.toHaveAttribute('data-emphasis');
    expect(cards[2]).toHaveAttribute('data-emphasis', 'quiet');
  });

  it('tone은 제목 앞 꾸밈 아이콘만 더하고 제목 이름은 그대로', () => {
    const { container } = render(
      <Card title="지난 기한 2건" emphasis="strong" tone="danger">
        내용
      </Card>,
    );
    const icon = container.querySelector('.tl-card__tone');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName('지난 기한 2건');
  });

  it('본문이 비면 본문 칸을 그리지 않고 footer가 제목 바로 뒤에 온다', () => {
    const { container } = render(<Card title="미결 결재" footer="결재할 문서가 없습니다" />);
    expect(container.querySelector('.tl-card__body')).toBeNull();
    expect(container.querySelector('.tl-card__head + .tl-card__footer')).not.toBeNull();
  });
});

describe('Badge · DueBadge 점(PR-38)', () => {
  it('neutral은 기본 점 없음, 다른 톤 · 결재 상태는 점, dot이 이긴다', () => {
    const { container } = render(
      <>
        <Badge>대표</Badge>
        <Badge tone="success">완료</Badge>
        <Badge approval="draft" />
        <Badge dot>점 있음</Badge>
        <Badge tone="danger" dot={false}>
          점 없음
        </Badge>
      </>,
    );
    const dots = [...container.querySelectorAll('.tl-badge')].map(
      (b) => b.querySelector('.tl-badge__dot') != null,
    );
    expect(dots).toEqual([false, true, true, true, false]);
  });

  it('DueBadge: 급하지 않은 단계 · 완료는 글자만, 3일 안은 점', () => {
    const { container } = render(
      <>
        <DueBadge due="2026-11-20" today="2026-11-06" />
        <DueBadge due="2026-11-08" today="2026-11-06" />
        <DueBadge due="2026-11-08" today="2026-11-06" done />
      </>,
    );
    const dots = [...container.querySelectorAll('.tl-badge')].map(
      (b) => b.querySelector('.tl-badge__dot') != null,
    );
    expect(dots).toEqual([false, true, false]);
  });
});

describe('Banner 동작 자리(PR-38)', () => {
  it('동작과 닫기는 따로 놓여 좁은 자리에서 동작만 아래 줄로 내려갈 수 있다', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Banner
        tone="warning"
        title="담당자 없음"
        action={<Button size="sm">담당자 지정</Button>}
        onClose={onClose}
      >
        본문
      </Banner>,
    );
    const banner = container.querySelector('.tl-banner')!;
    const kids = [...banner.children].map((c) => c.className);
    expect(kids.at(-2)).toBe('tl-banner__action');
    expect(kids.at(-1)).toBe('tl-banner__close');
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('SectionHeader(PR-38)', () => {
  it('제목(h2) 안에 건수 글자, 감싼 카드 제목은 h3', () => {
    render(
      <SectionHeader
        title="이번 달 기한"
        count={1200}
        action={<Button size="sm">전체 보기</Button>}
      >
        <Card title="Numbers">원천세</Card>
      </SectionHeader>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName('이번 달 기한 1,200건');
    expect(screen.getByRole('heading', { level: 3, name: 'Numbers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 보기' })).toBeInTheDocument();
  });

  it('countLabel이 count보다 이기고, headingLevel로 단계를 바꾼다', () => {
    render(<SectionHeader title="구성원" count={8} countLabel="8명" headingLevel={3} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveAccessibleName('구성원 8명');
  });
});

describe('NotificationItem(PR-32)', () => {
  it('상대 시각 · 전체 시각 · 읽지 않음 숨은 글자 · 확인 필요 배지', () => {
    render(
      <NotificationItem
        unread
        tone="danger"
        title="원천세 신고 기한이 지났습니다"
        body="10월 귀속"
        time="2026-11-06T06:10:00"
        now={NOW}
        onPress={() => {}}
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(
      '읽지 않음 원천세 신고 기한이 지났습니다 확인 필요 2시간 전 10월 귀속',
    );
    const time = button.querySelector('time')!;
    expect(time).toHaveAttribute('datetime', '2026-11-06T06:10:00');
    expect(time).toHaveAttribute('title', '2026-11-06 06:10');
  });

  it('neutral은 배지 없음, href면 링크이고 누르면 onPress도 부른다', () => {
    const onPress = vi.fn();
    render(
      <NotificationItem
        title="급여 대장을 확정했습니다"
        time="2026-11-05T09:00:00"
        now={NOW}
        href="#payroll"
        onPress={onPress}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#payroll');
    expect(link).toHaveAccessibleName('급여 대장을 확정했습니다 1일 전');
    fireEvent.click(link);
    expect(onPress).toHaveBeenCalledOnce();
  });
});

const ITEMS: NotificationListItem[] = [
  { id: 'a', title: '결재 요청', time: '2026-11-06T08:00:00' },
  { id: 'b', title: '기한 지남', time: '2026-11-06T06:00:00', unread: true, tone: 'danger' },
  { id: 'c', title: '입사 서류', time: '2026-11-05T17:00:00', unread: true },
  { id: 'd', title: '갱신 서류', time: '2026-11-03T10:00:00' },
  { id: 'e', title: '부가세 자료', time: '2026-10-28T10:00:00' },
];

describe('NotificationList(PR-32)', () => {
  it('날짜 묶음 순서 · 묶음 제목으로 이름 붙은 목록 · 묶음 안 읽지 않은 것 먼저', () => {
    render(<NotificationList items={ITEMS} now={NOW} />);
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['오늘', '어제', '이번 주', '이전']);
    const today = screen.getByRole('list', { name: '오늘' });
    const titles = within(today)
      .getAllByRole('listitem')
      .map((li) => li.querySelector('.tl-notification-item__title')!.textContent);
    expect(titles).toEqual(['읽지 않음 기한 지남', '결재 요청']);
  });

  it('"모두 읽음"은 읽지 않은 것이 있을 때만, 누르면 onMarkAllRead · 줄은 onItemPress(id)', () => {
    const onMarkAllRead = vi.fn();
    const onItemPress = vi.fn();
    const { rerender } = render(
      <NotificationList
        items={ITEMS}
        now={NOW}
        onMarkAllRead={onMarkAllRead}
        onItemPress={onItemPress}
      />,
    );
    expect(screen.getByText('읽지 않음 2건')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
    expect(onMarkAllRead).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: /입사 서류/ }));
    expect(onItemPress).toHaveBeenCalledWith('c');
    rerender(
      <NotificationList
        items={ITEMS.map((i) => ({ ...i, unread: false }))}
        now={NOW}
        onMarkAllRead={onMarkAllRead}
      />,
    );
    expect(screen.queryByRole('button', { name: '모두 읽음' })).toBeNull();
  });

  it('빈 목록은 status 한 줄, groupBy none은 label 이름의 목록 하나', () => {
    const { unmount } = render(<NotificationList items={[]} now={NOW} />);
    expect(screen.getByRole('status')).toHaveTextContent('새 알림이 없습니다');
    unmount();
    render(<NotificationList items={ITEMS} now={NOW} groupBy="none" />);
    expect(screen.queryAllByRole('heading')).toEqual([]);
    expect(
      within(screen.getByRole('list', { name: '알림' })).getAllByRole('listitem'),
    ).toHaveLength(5);
  });

  it('키보드: 줄은 Tab으로 닿는 단추', () => {
    render(<NotificationList items={ITEMS.slice(0, 2)} now={NOW} onItemPress={() => {}} />);
    const buttons = screen.getAllByRole('button');
    buttons[0]!.focus();
    expect(document.activeElement).toBe(buttons[0]);
    expect(buttons[0]!.tagName).toBe('BUTTON');
  });
});

describe('Avatar · PersonLabel 공석(PR-34)', () => {
  it('Avatar vacant는 이름 없이 "담당자 없음" 그림', () => {
    const { container } = render(<Avatar vacant />);
    expect(screen.getByRole('img', { name: '담당자 없음' })).toBeInTheDocument();
    expect(container.querySelector('.tl-avatar')).toHaveAttribute('data-vacant');
  });

  it('PersonLabel vacant는 글자 "담당자 없음" + action, 누르는 줄이 아니다', () => {
    const onPress = vi.fn();
    render(
      <PersonLabel
        vacant
        meta="Employees 담당"
        onPress={onPress}
        action={<Button size="sm">담당자 지정</Button>}
      />,
    );
    expect(screen.getByText('담당자 없음')).toBeInTheDocument();
    expect(screen.getByText('Employees 담당')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button')).toHaveAccessibleName('담당자 지정');
  });

  it('vacantLabel로 글자를 바꾼다', () => {
    render(<PersonLabel vacant vacantLabel="미지정" size="sm" />);
    expect(screen.getByText('미지정')).toBeInTheDocument();
  });
});

describe('PageHeader 형제 · meta(PR-38)', () => {
  const siblings = [
    { label: '직원 · 외주', href: '#people' },
    { label: '연차 · 근태', href: '#leave', current: true },
  ];

  it('형제가 있으면 meta는 제목 줄이 아니라 설명 줄', () => {
    const { container } = render(
      <PageHeader
        title="연차 · 근태"
        siblings={siblings}
        description="11월 6일(금) 기준"
        meta={<Badge tone="warning">승인 대기 2건</Badge>}
      />,
    );
    expect(container.querySelector('.tl-page-header__title-line .tl-page-header__meta')).toBeNull();
    const sub = container.querySelector('.tl-page-header__subline')!;
    expect(sub).toHaveTextContent('11월 6일(금) 기준');
    expect(sub).toHaveTextContent('승인 대기 2건');
  });

  it('형제가 없으면 meta는 제목 옆 그대로', () => {
    const { container } = render(<PageHeader title="급여" meta={<Badge>확정</Badge>} />);
    expect(
      container.querySelector('.tl-page-header__title-line .tl-page-header__meta'),
    ).not.toBeNull();
  });
});

describe('Drawer 첫 초점(R-37 10)', () => {
  it('열리면 첫 초점은 제목(tabindex -1), 닫기 단추가 아니다', async () => {
    render(
      <Drawer open title="직원 정보" footer={<Button variant="primary">수정</Button>}>
        <Button>첫 동작</Button>
      </Drawer>,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const title = screen.getByRole('heading', { name: '직원 정보' });
    expect(title).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(title);
  });

  it('data-autofocus 칸이 있으면 그 칸', async () => {
    render(
      <Drawer open title="거래처 등록">
        <Input label="상호" data-autofocus="" />
      </Drawer>,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '상호' }));
  });
});
