// 고르는 컴포넌트: 넓은 화면 팝업 · 좁은 화면 시트(matchMedia로 흉내 낸다)
import { maskDate, completeDate } from '../src/_internal/date-text.js';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Button,
  DateField,
  Field,
  FilterBar,
  MultiSelect,
  PeriodPicker,
  Select,
} from '../src/core/index.js';

const CHANNELS = [
  { value: 'own', label: '자사몰' },
  { value: 'open-a', label: '오픈마켓 A' },
  { value: 'open-b', label: '오픈마켓 B' },
];

/** 폭이 breakpoint.sm보다 좁은 화면 */
function narrow() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => ({
      matches: false,
      media,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('날짜 글자', () => {
  it('숫자만 남기고 하이픈을 넣는다', () => {
    expect(maskDate('2026')).toBe('2026');
    expect(maskDate('20261')).toBe('2026-1');
    expect(maskDate('2026.11.05')).toBe('2026-11-05');
    expect(maskDate('2026-11-05-99')).toBe('2026-11-05');
  });

  it('다 친 날만 ISO로, 없는 날 · 범위 밖은 undefined', () => {
    expect(completeDate('2026-11-05')).toBe('2026-11-05');
    expect(completeDate('2026-02-29')).toBeUndefined();
    expect(completeDate('2028-02-29')).toBe('2028-02-29');
    expect(completeDate('2026-11-0')).toBeUndefined();
    expect(completeDate('2026-10-31', '2026-11-01')).toBeUndefined();
    expect(completeDate('2026-12-01', undefined, '2026-11-30')).toBeUndefined();
  });
});

describe('DateField 달력', () => {
  it('달력 버튼으로 열고 날을 누르면 그 날짜가 된다', async () => {
    const onChange = vi.fn();
    render(
      <Field label="입고일">
        <DateField defaultValue="2026-11-07" today="2026-11-06" onChange={onChange} />
      </Field>,
    );
    fireEvent.click(screen.getByRole('button', { name: '달력 열기' }));
    const grid = await screen.findByRole('grid');
    expect(grid).toHaveAccessibleName('2026년 11월');
    // 보이는 숫자가 이름 앞에 온다(WCAG 2.5.3), 오늘 · 선택은 뒤에
    expect(within(grid).getAllByRole('button', { name: '7일 토요일, 선택됨' })).toHaveLength(1);
    expect(within(grid).getAllByRole('button', { name: '6일 금요일, 오늘' })).toHaveLength(1);
    fireEvent.click(within(grid).getAllByRole('button', { name: /^12일 목요일/ })[0]!);
    expect(onChange).toHaveBeenCalledWith('2026-11-12');
    await waitFor(() => expect(screen.getByLabelText('입고일')).toHaveValue('2026-11-12'));
  });

  it('min · max 밖의 날은 누를 수 없다', async () => {
    render(<DateField label="납기일" defaultValue="2026-11-10" min="2026-11-06" />);
    fireEvent.click(screen.getByRole('button', { name: '달력 열기' }));
    const grid = await screen.findByRole('grid');
    expect(within(grid).getAllByRole('button', { name: /^5일 목요일/ })[0]!).toBeDisabled();
  });

  it('좁은 화면에서는 시트로 연다', async () => {
    narrow();
    render(<DateField label="입고일" defaultValue="2026-11-07" />);
    fireEvent.click(screen.getByRole('button', { name: '달력 열기' }));
    const sheet = await screen.findByRole('dialog', { name: '입고일' });
    expect(within(sheet).getByRole('grid')).toBeInTheDocument();
  });
});

describe('PeriodPicker 달력', () => {
  it('달력에서 시작 · 끝을 누르고 적용한다', async () => {
    const onChange = vi.fn();
    render(
      <Field label="조회 기간">
        <PeriodPicker
          today="2026-11-07"
          defaultValue={{ from: '2026-11-01', to: '2026-11-30' }}
          onChange={onChange}
        />
      </Field>,
    );
    fireEvent.click(screen.getByRole('button', { name: '조회 기간' }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    const grid = within(dialog).getByRole('grid');
    fireEvent.click(within(grid).getAllByRole('button', { name: /^9일 월요일/ })[0]!);
    expect(within(dialog).getByLabelText('시작일')).toHaveValue('2026-11-09');
    expect(within(dialog).getByLabelText('종료일')).toHaveValue('');
    fireEvent.click(within(grid).getAllByRole('button', { name: /^3일 화요일/ })[0]!);
    expect(within(dialog).getByLabelText('시작일')).toHaveValue('2026-11-03');
    expect(within(dialog).getByLabelText('종료일')).toHaveValue('2026-11-09');
    fireEvent.click(within(dialog).getByRole('button', { name: '적용' }));
    expect(onChange).toHaveBeenCalledWith({ from: '2026-11-03', to: '2026-11-09' });
  });

  it('좁은 화면 시트: 적용 버튼에 기간이 보인다', async () => {
    narrow();
    render(
      <PeriodPicker today="2026-11-07" defaultValue={{ from: '2026-11-01', to: '2026-11-06' }} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /2026-11-01~11-06/ }));
    const sheet = await screen.findByRole('dialog', { name: '기간 선택' });
    expect(within(sheet).getByRole('button', { name: '2026-11-01~11-06 적용' })).toBeEnabled();
    expect(within(sheet).getByRole('button', { name: /^전월/ })).toBeInTheDocument();
  });
});

describe('Select 시트', () => {
  it('좁은 화면에서는 시트의 radio 목록에서 고르고 닫는다', async () => {
    narrow();
    const onChange = vi.fn();
    render(
      <Field label="판매 채널">
        <Select options={CHANNELS} defaultValue="own" onChange={onChange} />
      </Field>,
    );
    const trigger = screen.getByRole('button', { name: '판매 채널 자사몰' });
    expect(trigger).toHaveTextContent('자사몰');
    fireEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', { name: '판매 채널' });
    expect(within(sheet).getByRole('radio', { name: '자사몰' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(within(sheet).getByRole('radio', { name: '오픈마켓 B' }));
    expect(onChange).toHaveBeenCalledWith('open-b');
    await waitFor(() => expect(trigger).toHaveTextContent('오픈마켓 B'));
  });
});

describe('MultiSelect', () => {
  it('트리거 글자: 없음 → placeholder, 하나 → 이름, 여럿 → 외 n', () => {
    const { rerender } = render(
      <MultiSelect options={CHANNELS} value={[]} label="판매 채널" placeholder="전체 채널" />,
    );
    expect(screen.getByRole('combobox', { name: '판매 채널' })).toHaveTextContent('전체 채널');
    rerender(<MultiSelect options={CHANNELS} value={['open-b']} label="판매 채널" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('오픈마켓 B');
    rerender(
      <MultiSelect options={CHANNELS} value={['open-b', 'own', 'open-a']} label="판매 채널" />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('자사몰 외 2');
  });

  it('좁은 화면 시트: 체크하고 선택 해제한다(선택지 순서로 돌려준다)', async () => {
    narrow();
    const onChange = vi.fn();
    render(<MultiSelect options={CHANNELS} label="판매 채널" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '판매 채널 전체' }));
    const sheet = await screen.findByRole('dialog', { name: '판매 채널' });
    fireEvent.click(within(sheet).getByRole('checkbox', { name: '오픈마켓 B' }));
    fireEvent.click(within(sheet).getByRole('checkbox', { name: '자사몰' }));
    expect(onChange).toHaveBeenLastCalledWith(['own', 'open-b']);
    expect(within(sheet).getByRole('checkbox', { name: '자사몰' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(within(sheet).getByRole('button', { name: '선택 해제' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('FilterBar 시트', () => {
  it('좁은 화면: 검색 + 필터 버튼, 컨트롤은 시트에', async () => {
    narrow();
    const onReset = vi.fn();
    render(
      <FilterBar
        search={<input aria-label="주문 검색" />}
        onReset={onReset}
        resultCount={837}
        activeCount={2}
        actions={<Button>엑셀 다운로드</Button>}
      >
        <Select options={CHANNELS} label="판매 채널" width="auto" />
      </FilterBar>,
    );
    const bar = screen.getByRole('search', { name: '검색 조건' });
    // PR-30: "필터 N" 단추가 칩 줄 맨 앞이고, label 있는 컨트롤은 칩으로 남아 그 조건의 시트를 바로 연다
    const chips = bar.querySelector<HTMLElement>('.tl-filter-bar__chips')!;
    expect(within(chips).getAllByRole('button')[0]).toHaveAccessibleName('필터 2');
    expect(within(chips).getByRole('button', { name: '판매 채널 선택' })).toBeInTheDocument();
    expect(bar).toHaveTextContent('검색 결과 837건');
    await act(async () => {
      fireEvent.click(within(bar).getByRole('button', { name: '필터 2' }));
    });
    const sheet = await screen.findByRole('dialog', { name: '검색 조건' });
    expect(within(sheet).getByRole('button', { name: '판매 채널 선택' })).toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button', { name: '초기화' }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(within(sheet).getByRole('button', { name: '837건 보기' })).toBeInTheDocument();
  });
});
