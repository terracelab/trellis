import {
  AvatarContract,
  BannerContract,
  DescriptionListContract,
  DueBadgeContract,
  EmptyStateContract,
  KpiCardContract,
  ModuleIconContract,
  NotificationCardContract,
  ProgressContract,
  SkeletonContract,
  StatusDotContract,
  TimelineContract,
  type AvatarProps,
  type KpiCardProps,
  type NotificationCardProps,
  type ProgressProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Avatar,
  Banner,
  DescriptionList,
  DueBadge,
  EmptyState,
  KpiCard,
  ModuleIcon,
  NotificationCard,
  Progress,
  Skeleton,
  StatusDot,
  Timeline,
  avatarInitials,
  dueState,
  kpiDeltaText,
  kpiValue,
  progressText,
} from '../src/core/display.js';

const PAIRS: [{ displayName?: string }, { name: string; props: object }][] = [
  [Avatar, AvatarContract],
  [ModuleIcon, ModuleIconContract],
  [StatusDot, StatusDotContract],
  [DueBadge, DueBadgeContract],
  [KpiCard, KpiCardContract],
  [NotificationCard, NotificationCardContract],
  [EmptyState, EmptyStateContract],
  [Skeleton, SkeletonContract],
  [Banner, BannerContract],
  [Progress, ProgressContract],
  [Timeline, TimelineContract],
  [DescriptionList, DescriptionListContract],
];

describe('contract parity', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    for (const [component, contract] of PAIRS) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<AvatarProps>().toMatchTypeOf<ComponentProps<typeof Avatar>>();
    expectTypeOf<KpiCardProps>().toMatchTypeOf<ComponentProps<typeof KpiCard>>();
    expectTypeOf<NotificationCardProps>().toMatchTypeOf<ComponentProps<typeof NotificationCard>>();
    expectTypeOf<ProgressProps>().toMatchTypeOf<ComponentProps<typeof Progress>>();
  });

  it('id → id, testID → data-testid', () => {
    render(
      <StatusDot id="s1" testID="dot">
        대기
      </StatusDot>,
    );
    const el = screen.getByTestId('dot');
    expect(el).toHaveAttribute('id', 's1');
    expect(el).toHaveClass('tl-status-dot');
  });
});

describe('Avatar', () => {
  it('이니셜: 한글은 성을 뺀 두 글자, 영문 머리글자, 크기와 관계없이 같다', () => {
    expect(avatarInitials('김테라')).toBe('테라');
    expect(avatarInitials('남궁민수')).toBe('민수');
    expect(avatarInitials('홍길')).toBe('홍길');
    expect(avatarInitials('Kim Tera')).toBe('KT');
    render(<Avatar name="김테라" status="away" testID="a" />);
    const el = screen.getByRole('img', { name: '김테라, 자리 비움' });
    expect(el).toHaveTextContent('테라');
    expect(el).toHaveAttribute('data-status', 'away');
    expect(el).toHaveAttribute('data-shape', 'square');
    expect(el.getAttribute('data-tone')).toMatch(/^[1-6]$/);
  });

  it('decorative면 접근성 트리에서 숨는다', () => {
    render(<Avatar name="한결재" size={24} decorative testID="a" />);
    expect(screen.getByTestId('a')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('a')).toHaveTextContent('결재');
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('ModuleIcon', () => {
  it('타일이 있는 모듈(accounting)은 일러스트 SVG를 넣고 바깥 라벨 하나만 읽힌다', () => {
    const { container } = render(<ModuleIcon module="accounting" testID="m" />);
    const el = screen.getByRole('img', { name: '회계' });
    expect(el).toHaveAttribute('data-kind', 'tile');
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('title')).toBeNull();
    // id 접두가 인스턴스마다 달라 그라데이션이 겹치지 않는다
    expect(svg.innerHTML).not.toContain('url(#tl-tile-accounting-tile)');
  });

  it('모듈 35개 전부 타일로 그린다', () => {
    render(<ModuleIcon module="inventory" size={48} />);
    expect(screen.getByRole('img', { name: '재고' })).toHaveAttribute('data-kind', 'tile');
  });

  it('label · decorative', () => {
    render(
      <>
        <ModuleIcon module="mail" label="메일 열기" />
        <ModuleIcon module="tax" decorative testID="d" />
      </>,
    );
    expect(screen.getByRole('img', { name: '메일 열기' })).toBeInTheDocument();
    expect(screen.getByTestId('d')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('StatusDot', () => {
  it('점은 톤 색, 글자는 라벨', () => {
    render(
      <StatusDot tone="info" pulse testID="s">
        실행 중
      </StatusDot>,
    );
    const el = screen.getByTestId('s');
    expect(el).toHaveTextContent('실행 중');
    expect(el).toHaveAttribute('data-pulse');
    expect(el.getAttribute('style')).toContain('var(--tl-color-status-info-default)');
  });
});

describe('DueBadge', () => {
  const today = '2026-11-08';
  it('지남 · 당일 · 앞으로의 글자와 톤', () => {
    render(
      <>
        <DueBadge due="2026-11-05" today={today} testID="past" />
        <DueBadge due="2026-11-08" today={today} testID="today" />
        <DueBadge due="2026-11-10" today={today} testID="soon" />
        <DueBadge due="2026-11-25" today={today} testID="later" />
      </>,
    );
    expect(screen.getByTestId('past')).toHaveTextContent('3일 경과');
    expect(screen.getByTestId('past')).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByTestId('past')).toHaveAttribute('data-variant', 'solid');
    expect(screen.getByTestId('today')).toHaveTextContent('D-day');
    expect(screen.getByTestId('today')).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByTestId('soon')).toHaveTextContent('D-2');
    expect(screen.getByTestId('soon')).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByTestId('later')).toHaveTextContent('D-17');
    expect(screen.getByTestId('later')).toHaveAttribute('data-tone', 'neutral');
    expect(screen.getByText('D-17').closest('time')).toHaveAttribute('datetime', '2026-11-25');
  });

  it('done이면 중립 완료 라벨', () => {
    render(<DueBadge due="2026-11-05" today={today} done doneLabel="입고 완료" testID="d" />);
    expect(screen.getByTestId('d')).toHaveTextContent('입고 완료');
    expect(screen.getByTestId('d')).toHaveAttribute('data-tone', 'neutral');
    expect(dueState('2026-11-11', today, 3)).toBe('soon');
    expect(dueState('2026-11-12', today, 3)).toBe('later');
  });
});

describe('KpiCard', () => {
  it('금액은 천 단위 + 작은 원, finance 증가는 수입 색(빨강)', () => {
    render(
      <KpiCard
        label="당일 시재"
        value={874479500}
        format="amount"
        delta={{ value: 12.4, label: '전월 대비' }}
        testID="k"
      />,
    );
    const card = screen.getByRole('group', { name: '당일 시재' });
    expect(card).toHaveTextContent('874,479,500원');
    expect(screen.getByText('전월 대비')).toBeInTheDocument();
    const delta = card.querySelector('.tl-kpi-card__delta')!;
    expect(delta).toHaveTextContent('+12.4%');
    expect(delta.getAttribute('style')).toContain('var(--tl-color-finance-income)');
    expect(delta).toHaveAttribute('data-direction', 'up');
  });

  it('finance 감소는 지출 색(파랑), up-bad 증가는 위험 아이콘 + 중립 글자', () => {
    render(
      <>
        <KpiCard
          label="당월 매입"
          value={642300000}
          format="compactWon"
          delta={{ value: -3.1, label: '전월 대비' }}
          testID="down"
        />
        <KpiCard
          label="결재 대기"
          value={12}
          unit="건"
          delta={{ value: 4, label: '전일 대비', format: 'number', polarity: 'up-bad' }}
          testID="bad"
        />
      </>,
    );
    const down = screen.getByTestId('down');
    expect(down).toHaveTextContent('6.4억원');
    const downDelta = down.querySelector('.tl-kpi-card__delta')!;
    expect(downDelta).toHaveTextContent('−3.1%');
    expect(downDelta.getAttribute('style')).toContain('var(--tl-color-finance-expense)');
    const bad = screen.getByTestId('bad').querySelector('.tl-kpi-card__delta')!;
    expect(bad).toHaveTextContent('+4건');
    expect(bad.getAttribute('style')).toContain('var(--tl-color-status-danger-default)');
    expect(bad.getAttribute('style')).not.toContain('--tl-kpi-card-delta-text');
  });

  it('onPress면 카드 전체가 버튼, loading이면 aria-busy이고 누르지 않는다', () => {
    const onPress = vi.fn();
    const { rerender } = render(
      <KpiCard label="미수금" value={18420000} format="amount" onPress={onPress} />,
    );
    const button = screen.getByRole('button', { name: /미수금/ });
    expect(button).toHaveClass('tl-focusable');
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<KpiCard label="미수금" value={18420000} format="amount" onPress={onPress} loading />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('서식 함수', () => {
    expect(kpiValue(97.2, 'percent')).toEqual({ text: '97.2', unit: '%' });
    expect(kpiValue(184250, 'currency', undefined, 'USD')).toEqual({ text: 'USD 184,250.00' });
    expect(kpiDeltaText({ value: 12400000, label: '전일 대비', format: 'amount' })).toBe(
      '+12,400,000원',
    );
  });
});

describe('NotificationCard', () => {
  it('버튼 이름에 모듈 · 제목 · 카운트, danger 배지', () => {
    const onPress = vi.fn();
    render(
      <NotificationCard
        module="approval"
        title="3일 넘은 결재"
        count={4}
        tone="danger"
        time="어제"
        unread
        onPress={onPress}
      />,
    );
    const button = screen.getByRole('button', { name: /전자결재.*3일 넘은 결재.*4건/ });
    expect(button).toHaveTextContent('읽지 않음');
    expect(button.querySelector('.tl-badge')).toHaveAttribute('data-tone', 'danger');
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('카운트 99+, 0이면 배지 없음', () => {
    render(
      <>
        <NotificationCard module="mail" title="읽지 않은 메일" count={240} testID="many" />
        <NotificationCard module="mail" title="읽지 않은 메일" count={0} testID="none" />
      </>,
    );
    expect(screen.getByTestId('many')).toHaveTextContent('99+');
    expect(screen.getByTestId('none').querySelector('.tl-badge')).toBeNull();
  });
});

describe('EmptyState · Skeleton', () => {
  it('EmptyState: 제목 · 설명 · 동작', () => {
    render(
      <EmptyState
        icon="file-text"
        title="이번 달 전표가 없습니다"
        description="전표 입력에서 추가하세요"
        action={<button type="button">전표 입력</button>}
      />,
    );
    expect(screen.getByText('이번 달 전표가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('전표 입력에서 추가하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전표 입력' })).toBeInTheDocument();
  });

  it('Skeleton: aria-hidden, 줄 수, 원은 한 변', () => {
    render(
      <>
        <Skeleton lines={3} testID="t" />
        <Skeleton shape="circle" width="var(--tl-size-avatar-40)" testID="c" />
      </>,
    );
    const text = screen.getByTestId('t');
    expect(text).toHaveAttribute('aria-hidden', 'true');
    expect(text.querySelectorAll('.tl-skeleton__line')).toHaveLength(3);
    expect(text.querySelector('[data-last]')).not.toBeNull();
    const circle = screen.getByTestId('c');
    expect(circle.style.height).toBe('var(--tl-size-avatar-40)');
  });
});

describe('Banner', () => {
  it('status · danger는 alert, 닫기 버튼', () => {
    const onClose = vi.fn();
    render(
      <>
        <Banner tone="warning" title="부가세 예정신고 마감 D-3">
          매입 세금계산서 4건이 수취 확인 전입니다.
        </Banner>
        <Banner tone="danger" onClose={onClose}>
          전송 실패
        </Banner>
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('부가세 예정신고 마감 D-3');
    const alert = screen.getByRole('alert');
    fireEvent.click(within(alert).getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Progress', () => {
  it('progressbar · 값 글자 퍼센트 / 단위', () => {
    render(
      <>
        <Progress label="거래처 엑셀 업로드" value={62} />
        <Progress label="11월 마감 체크리스트" value={18} max={24} unit="건" />
      </>,
    );
    const bar = screen.getByRole('progressbar', { name: '거래처 엑셀 업로드' });
    expect(bar).toHaveAttribute('aria-valuenow', '62');
    expect(bar).toHaveAttribute('aria-valuetext', '62%');
    expect(bar).toHaveTextContent('62%');
    expect(screen.getByRole('progressbar', { name: '11월 마감 체크리스트' })).toHaveTextContent(
      '18 / 24건',
    );
    expect(progressText(150, 100)).toBe('100%');
  });
});

describe('Timeline', () => {
  it('순서 있는 목록 · 항목 · 시각과 처리자', () => {
    render(
      <Timeline
        ariaLabel="결재 이력"
        items={[
          {
            id: 'a2',
            title: '반려',
            time: '11월 6일(금) 16:10',
            actor: '최회계 부장',
            tone: 'danger',
          },
          { id: 'a1', title: '결재 요청', time: '11월 5일(목) 17:45', icon: 'send' },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: '결재 이력' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('반려');
    expect(items[0]).toHaveTextContent('최회계 부장');
    expect(items[0]).toHaveAttribute('data-tone', 'danger');
  });
});

describe('DescriptionList', () => {
  afterEach(() => vi.useRealTimers());

  it('dt · dd 짝, 빈 값은 –, span은 columns로 줄인다', () => {
    const { container } = render(
      <DescriptionList
        columns={1}
        items={[
          { label: '거래처', value: '(주)한빛식자재' },
          { label: '비고', value: null, span: 3 },
        ]}
      />,
    );
    expect(container.querySelector('dl')).toHaveClass('tl-description-list');
    expect(screen.getByText('거래처').tagName).toBe('DT');
    expect(screen.getByText('(주)한빛식자재').closest('dd')).not.toBeNull();
    expect(screen.getByText('–')).toBeInTheDocument();
    expect(container.querySelector('[data-span="3"]')).toBeNull();
  });

  it('복사: 클립보드에 쓰고 2초 동안 check', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(
      <DescriptionList
        items={[{ label: '사업자등록번호', value: '124-81-65307', copyable: true }]}
      />,
    );
    const button = screen.getByRole('button', { name: '사업자등록번호 복사' });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(writeText).toHaveBeenCalledWith('124-81-65307');
    expect(screen.getByRole('status')).toHaveTextContent('복사했습니다');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
