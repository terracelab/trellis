// 검토 · 확인 묶음(PR-30): Delta · KpiCard(오류 · 가림 · sm) · AmountBreakdown · ChangeDiff · IssueList
import {
  AmountBreakdownContract,
  ChangeDiffContract,
  DeltaContract,
  IssueListContract,
  MaskedValueContract,
  ReasonDialogContract,
  type AmountBreakdownProps,
  type ChangeDiffProps,
  type DeltaProps,
  type IssueListProps,
  type KpiCardProps,
  type MaskedValueProps,
  type ReasonDialogProps,
} from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AmountBreakdown,
  breakdownTotal,
  ChangeDiff,
  Delta,
  IssueList,
  KpiCard,
  MaskedValue,
  ReasonDialog,
  sortIssues,
} from '../src/core/index.js';

afterEach(() => vi.restoreAllMocks());

describe('contract parity', () => {
  const PAIRS: [{ displayName?: string }, { name: string; props: object }][] = [
    [Delta, DeltaContract],
    [AmountBreakdown, AmountBreakdownContract],
    [ChangeDiff, ChangeDiffContract],
    [IssueList, IssueListContract],
    [ReasonDialog, ReasonDialogContract],
    [MaskedValue, MaskedValueContract],
  ];

  it('displayName === contract.name, props에 id · testID', () => {
    for (const [component, contract] of PAIRS) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<DeltaProps>().toMatchTypeOf<ComponentProps<typeof Delta>>();
    expectTypeOf<AmountBreakdownProps>().toMatchTypeOf<ComponentProps<typeof AmountBreakdown>>();
    expectTypeOf<ChangeDiffProps>().toMatchTypeOf<ComponentProps<typeof ChangeDiff>>();
    expectTypeOf<IssueListProps>().toMatchTypeOf<ComponentProps<typeof IssueList>>();
    expectTypeOf<MaskedValueProps>().toMatchTypeOf<ComponentProps<typeof MaskedValue>>();
    expectTypeOf<Omit<ReasonDialogProps, 'trigger'>>().toMatchTypeOf<
      ComponentProps<typeof ReasonDialog>
    >();
    expectTypeOf<KpiCardProps>().toMatchTypeOf<ComponentProps<typeof KpiCard>>();
  });

  it('values가 있는 prop은 값마다 data-<prop>', () => {
    for (const format of DeltaContract.props.format.values!) {
      const { unmount } = render(
        <Delta value={1} format={format as DeltaProps['format']} testID="d" />,
      );
      expect(screen.getByTestId('d')).toHaveAttribute('data-format', format);
      unmount();
    }
    for (const polarity of DeltaContract.props.polarity.values!) {
      const { unmount } = render(
        <Delta value={1} polarity={polarity as DeltaProps['polarity']} testID="d" />,
      );
      expect(screen.getByTestId('d')).toHaveAttribute('data-polarity', polarity);
      unmount();
    }
    for (const layout of ChangeDiffContract.props.layout.values!) {
      const { unmount } = render(
        <ChangeDiff
          layout={layout as ChangeDiffProps['layout']}
          rows={[{ field: '단가', before: '1', after: '2' }]}
          testID="c"
        />,
      );
      expect(screen.getByTestId('c')).toHaveAttribute('data-layout', layout);
      unmount();
    }
  });
});

describe('Delta', () => {
  it('finance: 증가는 수입 색(빨강) · 감소는 지출 색(파랑), 부호와 화살표가 늘 있다', () => {
    render(
      <>
        <Delta value={12.4} label="전월 대비" testID="up" />
        <Delta value={-3.1} label="전월 대비" testID="down" />
      </>,
    );
    const up = screen.getByTestId('up');
    expect(up).toHaveClass('tl-delta');
    expect(up).toHaveTextContent('전월 대비+12.4%');
    expect(up).toHaveAttribute('data-direction', 'up');
    expect(up.getAttribute('style')).toContain('var(--tl-color-finance-income)');
    expect(up.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const down = screen.getByTestId('down');
    expect(down).toHaveTextContent('−3.1%');
    expect(down.getAttribute('style')).toContain('var(--tl-color-finance-expense)');
    // finance는 방향만 말한다: 개선 · 악화 숨은 글자가 없다
    expect(up).not.toHaveTextContent('개선');
    expect(down).not.toHaveTextContent('악화');
  });

  it('보이는 자릿수에서 0이면 flat(부호 없음, minus 아이콘)', () => {
    render(<Delta value={0.04} testID="d" />);
    const d = screen.getByTestId('d');
    expect(d).toHaveAttribute('data-direction', 'flat');
    expect(d).toHaveTextContent('0.0%');
    expect(d).not.toHaveTextContent('+');
    expect(d.getAttribute('style')).toContain('var(--tl-color-finance-neutral)');
  });

  it('up-good · up-bad: 아이콘만 상태 색, 글자는 중립, 숨은 글자로 개선 · 악화', () => {
    render(
      <>
        <Delta value={4} format="number" unit="건" polarity="up-bad" testID="bad" />
        <Delta value={-1.2} polarity="up-good" testID="worse" />
        <Delta value={1.2} polarity="up-good" testID="better" />
      </>,
    );
    const bad = screen.getByTestId('bad');
    expect(bad).toHaveTextContent('+4건');
    expect(bad).toHaveTextContent('악화');
    expect(bad.getAttribute('style')).toContain('var(--tl-color-status-danger-default)');
    expect(bad.getAttribute('style')).not.toContain('--tl-delta-text');
    expect(screen.getByTestId('worse')).toHaveTextContent('악화');
    expect(screen.getByTestId('better')).toHaveTextContent('개선');
    expect(screen.getByTestId('better').getAttribute('style')).toContain(
      'var(--tl-color-status-success-default)',
    );
  });

  it('amount는 원(U+2212), point는 %p, size', () => {
    render(
      <>
        <Delta value={-12400000} format="amount" testID="a" />
        <Delta value={0.3} format="point" size="sm" testID="p" />
      </>,
    );
    expect(screen.getByTestId('a')).toHaveTextContent('−12,400,000원');
    expect(screen.getByTestId('p')).toHaveTextContent('+0.3%p');
    expect(screen.getByTestId('p')).toHaveAttribute('data-size', 'sm');
  });
});

describe('KpiCard (PR-30)', () => {
  it('증감 줄은 Delta(sm)', () => {
    render(<KpiCard label="당월 매출" value={1200} delta={{ value: 12.4, label: '전월 대비' }} />);
    const delta = screen.getByRole('group', { name: '당월 매출' }).querySelector('.tl-delta')!;
    expect(delta).toHaveClass('tl-kpi-card__delta');
    expect(delta).toHaveAttribute('data-size', 'sm');
  });

  it('error: 값 자리에 불러오지 못함 + 다시 시도, onPress가 있어도 카드는 버튼이 아니다', () => {
    const onRetry = vi.fn();
    const onPress = vi.fn();
    render(
      <KpiCard
        label="당월 매출"
        value={1284000000}
        format="compactWon"
        delta={{ value: 12.4, label: '전월 대비' }}
        error
        onRetry={onRetry}
        onPress={onPress}
        testID="k"
      />,
    );
    const card = screen.getByTestId('k');
    expect(card.tagName).toBe('DIV');
    expect(card).toHaveAttribute('data-state', 'error');
    expect(card).toHaveTextContent('불러오지 못함');
    expect(card).not.toHaveTextContent('12.8억');
    expect(card.querySelector('.tl-delta')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '당월 매출 다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('error 글자는 그 문구, onRetry가 없으면 단추가 없다', () => {
    render(<KpiCard label="미수금" value={0} error="서버 점검 중" />);
    expect(screen.getByRole('group', { name: '미수금' })).toHaveTextContent('서버 점검 중');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('masked: 값 · 단위 · 증감 대신 가림 글자(숨은 글자 가린 값)와 이유 한 줄', () => {
    render(
      <>
        <KpiCard
          label="당월 급여 총액"
          value={184000000}
          format="amount"
          delta={{ value: 2.1, label: '전월 대비' }}
          masked
          testID="m"
        />
        <KpiCard label="평균 연봉" value={52000000} masked="인사팀만 봅니다" testID="r" />
      </>,
    );
    const m = screen.getByTestId('m');
    expect(m).toHaveAttribute('data-masked', 'true');
    expect(m).not.toHaveTextContent('184,000,000');
    expect(m).toHaveTextContent('가린 값');
    expect(m).toHaveTextContent('볼 권한이 없습니다');
    expect(m.querySelector('.tl-delta')).toBeNull();
    expect(m.querySelector('[data-masked]')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('r')).toHaveTextContent('인사팀만 봅니다');
  });

  it('size sm', () => {
    render(<KpiCard size="sm" label="미수금" value={18420000} format="amount" testID="s" />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('s')).toHaveTextContent('18,420,000원');
  });
});

describe('AmountBreakdown', () => {
  const ROWS = [
    { key: 'base', label: '기본급', value: 3200000 },
    { key: 'meal', label: '식대', value: 200000, op: '+' as const, hint: '비과세' },
    { key: 'deduction', label: '공제 합계', value: 412380, op: '−' as const },
    { key: 'net', label: '실지급액', value: 2987620, op: '=' as const },
  ];

  it('줄은 dl, 기호는 숨은 글자로 읽고 금액은 천 단위, 단위는 머리에 한 번', () => {
    render(<AmountBreakdown title="11월 실지급액" unit="원" rows={ROWS} activeKey="meal" />);
    const root = screen.getByRole('group', { name: '11월 실지급액' });
    expect(root.querySelector('dl')).not.toBeNull();
    expect(root).toHaveTextContent('단위 원');
    expect(root.textContent!.match(/원/g)).toHaveLength(1);
    const rows = root.querySelectorAll('.tl-amount-breakdown__row');
    expect(rows).toHaveLength(4);
    expect(rows[0]!.querySelector('.tl-sr-only')).toBeNull();
    expect(rows[1]).toHaveTextContent('더하기 식대 비과세');
    expect(rows[1]).toHaveAttribute('data-active', 'true');
    expect(rows[2]).toHaveTextContent('빼기 공제 합계');
    expect(rows[3]).toHaveTextContent('계산 결과 실지급액');
    expect(rows[3]).toHaveAttribute('data-total', 'true');
    expect(within(rows[3] as HTMLElement).getByText('2,987,620')).toBeInTheDocument();
    for (const op of root.querySelectorAll('.tl-amount-breakdown__op'))
      expect(op).toHaveAttribute('aria-hidden', 'true');
  });

  it('음수는 U+2212, 제목이 없으면 이름 금액 계산', () => {
    render(<AmountBreakdown rows={[{ key: 'a', label: '조정', value: -1200 }]} />);
    const root = screen.getByRole('group', { name: '금액 계산' });
    expect(root).toHaveTextContent('−1,200');
    expect(root.querySelector('.tl-amount-breakdown__head')).toBeNull();
  });

  it('loading: 금액 자리 Skeleton, 라벨은 그대로', () => {
    const { container } = render(<AmountBreakdown rows={ROWS} loading />);
    const root = screen.getByRole('group');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('data-state', 'loading');
    expect(root).toHaveTextContent('기본급');
    expect(root).not.toHaveTextContent('3,200,000');
    expect(container.querySelectorAll('.tl-amount-breakdown__amount .tl-skeleton')).toHaveLength(4);
  });

  it('status: 계산 중 · 기준 시각 · 오류 + 다시 계산', () => {
    const onRecalculate = vi.fn();
    const { rerender } = render(<AmountBreakdown rows={ROWS} status="calculating" />);
    const live = () => screen.getByRole('group').querySelector('[aria-live="polite"]')!;
    expect(live()).toHaveTextContent('계산 중');
    rerender(<AmountBreakdown rows={ROWS} status="updated" updatedAt="14:32" />);
    expect(live()).toHaveTextContent('14:32 기준');
    rerender(<AmountBreakdown rows={ROWS} status="error" onRecalculate={onRecalculate} />);
    expect(live()).toHaveTextContent('계산하지 못했습니다');
    expect(screen.getByRole('group')).toHaveAttribute('data-state', 'error');
    fireEvent.click(screen.getByRole('button', { name: '다시 계산' }));
    expect(onRecalculate).toHaveBeenCalledTimes(1);
  });

  it('합계 줄이 앞 줄 계산과 다르면 개발 경고', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(breakdownTotal(ROWS)).toBe(2987620);
    render(<AmountBreakdown rows={ROWS} />);
    expect(warn).not.toHaveBeenCalled();
    render(
      <AmountBreakdown
        rows={[...ROWS.slice(0, 3), { key: 'net', label: '실지급액', value: 1, op: '=' }]}
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('AmountBreakdown'));
  });
});

describe('ChangeDiff', () => {
  const ROWS = [
    { target: 'PO-0042', field: '단가', before: '1,200', after: '1,350' },
    { target: 'PO-0042', field: '메모', before: null, after: '분할 입고' },
    { target: 'PO-0043', field: '납기', before: '2026-11-14', after: '2026-11-18' },
  ];

  it('table: 숨은 caption · 열 머리, 이전 del · 이후 ins, 화살표 대신 숨은 글자', () => {
    render(<ChangeDiff rows={ROWS} caption="발주서 변경 내용" />);
    const table = screen.getByRole('table', { name: '발주서 변경 내용' });
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((h) => h.textContent);
    expect(headers).toEqual(['대상', '항목', '변경 내용']);
    const first = within(table).getAllByRole('row')[1]!;
    expect(first.querySelector('del')).toHaveTextContent('1,200');
    expect(first.querySelector('ins')).toHaveTextContent('1,350');
    expect(first).toHaveTextContent('1,200 에서 1,350');
    expect(first.querySelector('.tl-change-diff__arrow')).toHaveAttribute('aria-hidden', 'true');
    // 빈 값은 – + 숨은 글자 없음
    const second = within(table).getAllByRole('row')[2]!;
    expect(second.querySelector('del')).toHaveTextContent('–없음');
  });

  it('대상이 없으면 대상 열을 그리지 않는다', () => {
    render(<ChangeDiff rows={[{ field: '결재선', before: 'A', after: 'B' }]} />);
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      '항목',
      '변경 내용',
    ]);
    expect(screen.getByRole('table', { name: '변경 내용' })).toBeInTheDocument();
  });

  it('list: 이름 있는 목록, maxRows를 넘으면 외 N건 단추로 펼치고 접는다', () => {
    render(<ChangeDiff rows={ROWS} layout="list" maxRows={1} caption="변경 이력" />);
    const list = screen.getByRole('list', { name: '변경 이력' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByRole('listitem')).toHaveTextContent('PO-0042 · 단가');
    const more = screen.getByRole('button', { name: /외 2건/ });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    const less = screen.getByRole('button', { name: /접기/ });
    expect(less).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(less);
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  });

  it('줄이 없으면 empty 문구(기본 · 지정)', () => {
    const { rerender } = render(<ChangeDiff rows={[]} testID="c" />);
    expect(screen.getByTestId('c')).toHaveTextContent('바뀐 내용이 없습니다');
    expect(screen.queryByRole('table')).toBeNull();
    rerender(<ChangeDiff rows={[]} empty="이력이 없습니다" testID="c" />);
    expect(screen.getByTestId('c')).toHaveTextContent('이력이 없습니다');
  });
});

describe('IssueList', () => {
  const ITEMS = [
    { id: 'w1', level: 'warning' as const, tag: '5행', title: '단가가 18% 높습니다' },
    {
      id: 'e1',
      level: 'error' as const,
      tag: '3행',
      title: '단가가 0원입니다',
      message: '단가를 넣으세요',
    },
    { id: 'w2', level: 'warning' as const, title: '유통기한이 30일 남았습니다' },
    { id: 'e2', level: 'error' as const, title: '거래처가 없습니다' },
  ];

  it('오류가 먼저, 같은 단계 안에서는 받은 순서', () => {
    expect(sortIssues(ITEMS).map((i) => i.id)).toEqual(['e1', 'e2', 'w1', 'w2']);
  });

  it('단계는 아이콘 모양 + 숨은 글자, 건수는 live 영역, 누르면 onSelect(id)', () => {
    const onSelect = vi.fn();
    render(<IssueList title="저장 전 확인" items={ITEMS} onSelect={onSelect} />);
    const root = screen.getByRole('group', { name: '저장 전 확인' });
    expect(root.querySelector('[aria-live="polite"]')).toHaveTextContent('오류 2 · 경고 2');
    const items = within(root).getAllByRole('listitem');
    expect(items.map((i) => i.getAttribute('data-level'))).toEqual([
      'error',
      'error',
      'warning',
      'warning',
    ]);
    const buttons = within(root).getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName('오류 3행 단가가 0원입니다 단가를 넣으세요');
    expect(buttons[2]).toHaveAccessibleName(/^경고 5행/);
    expect(buttons[0]).toHaveClass('tl-focusable');
    fireEvent.click(buttons[0]!);
    expect(onSelect).toHaveBeenCalledWith('e1');
  });

  it('자세히 단추 이름은 제목 + 자세히, onSelect가 없으면 항목은 글자', () => {
    const onDetail = vi.fn();
    render(<IssueList items={ITEMS} onDetail={onDetail} />);
    expect(screen.getByRole('group', { name: '확인할 항목' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: '거래처가 없습니다 자세히' }));
    expect(onDetail).toHaveBeenCalledWith('e2');
  });

  it('loading은 Skeleton, 항목이 없으면 empty, maxHeight면 목록만 스크롤', () => {
    const { rerender, container } = render(<IssueList items={ITEMS} loading />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('list')).toBeNull();
    expect(container.querySelector('.tl-skeleton')).not.toBeNull();
    rerender(<IssueList items={[]} />);
    expect(screen.getByRole('group')).toHaveTextContent('확인할 항목이 없습니다');
    rerender(<IssueList items={ITEMS} maxHeight="calc(var(--tl-space-64) * 2)" />);
    const list = screen.getByRole('list');
    expect(list.getAttribute('style')).toContain('max-height');
    expect(list).toHaveAttribute('tabindex', '0');
  });
});
