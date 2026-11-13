// PR-30 컨트롤 보강: 크기 xs · xl, Input mono, disabledReason, IconButton 툴팁, Switch lg,
// QuantityInput 손가락 · 낭독, Select 빈 목록, PeriodPicker max · maxDays
import {
  AmountInputContract,
  ButtonContract,
  CodeSearchContract,
  DateFieldContract,
  IconButtonContract,
  InputContract,
  MaskedInputContract,
  MultiSelectContract,
  PeriodPickerContract,
  QuantityInputContract,
  RadialMeterContract,
  ScanFieldContract,
  SelectContract,
  SIZES,
  SwitchContract,
  TabsContract,
  type MenuActionItem,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RadialMeter } from '../src/charts/index.js';
import {
  AmountInput,
  Button,
  CodeSearch,
  DateField,
  Field,
  IconButton,
  Input,
  MaskedInput,
  Menu,
  MultiSelect,
  PeriodPicker,
  QuantityInput,
  ScanField,
  Select,
  Switch,
  Tabs,
  Tooltip,
  TrellisProvider,
} from '../src/core/index.js';

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
afterEach(() => vi.unstubAllGlobals());

describe('컨트롤 크기 xs · xl(#1)', () => {
  const CONTRACTS = [
    ButtonContract,
    IconButtonContract,
    InputContract,
    AmountInputContract,
    QuantityInputContract,
    MaskedInputContract,
    CodeSearchContract,
    DateFieldContract,
    PeriodPickerContract,
    SelectContract,
    MultiSelectContract,
    ScanFieldContract,
    TabsContract,
  ];

  it('Size는 xs~xl 다섯이고 13개 contract의 size values가 그것이다', () => {
    expect(SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    for (const c of CONTRACTS) {
      expect(c.props.size.values, c.name).toEqual(SIZES);
      expect(c.props.size.type, c.name).toBe("'xs' | 'sm' | 'md' | 'lg' | 'xl'");
    }
  });

  it('RadialMeter는 지름 크기라 sm · md · lg 그대로', () => {
    expect(RadialMeterContract.props.size.values).toEqual(['sm', 'md', 'lg']);
    const { container } = render(<RadialMeter value={40} label="달성률" size="lg" />);
    expect(container.querySelector('[data-size="lg"]')).not.toBeNull();
  });

  const OPTIONS = [{ value: 'a', label: '가' }];
  const cases: [string, (size: 'xs' | 'xl') => ReactElement][] = [
    ['Button', (size) => <Button size={size}>저장</Button>],
    ['IconButton', (size) => <IconButton size={size} icon="bell" label="알림" />],
    ['Input', (size) => <Input size={size} label="이름" />],
    ['AmountInput', (size) => <AmountInput size={size} label="금액" />],
    ['QuantityInput', (size) => <QuantityInput size={size} label="수량" />],
    ['MaskedInput', (size) => <MaskedInput size={size} mask="bizNo" label="사업자" />],
    ['CodeSearch', (size) => <CodeSearch size={size} label="거래처" options={OPTIONS} />],
    ['DateField', (size) => <DateField size={size} label="일자" />],
    ['PeriodPicker', (size) => <PeriodPicker size={size} label="기간" />],
    ['Select', (size) => <Select size={size} label="상태" options={OPTIONS} />],
    ['MultiSelect', (size) => <MultiSelect size={size} label="상태" options={OPTIONS} />],
    ['ScanField', (size) => <ScanField size={size} label="바코드" />],
    ['Tabs', (size) => <Tabs size={size} label="보기" items={[{ value: 'a', label: '전체' }]} />],
  ];
  for (const [name, make] of cases)
    it(`${name}: data-size="xs" · "xl"을 그린다`, () => {
      for (const size of ['xs', 'xl'] as const) {
        const { container, unmount } = render(make(size));
        expect(container.querySelector(`[data-size="${size}"]`), `${name} ${size}`).not.toBeNull();
        unmount();
      }
    });

  it('IconButton 아이콘: xs · sm · md 16, lg 20, xl 24', () => {
    const { rerender, container } = render(<IconButton icon="bell" label="알림" size="xs" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '16');
    rerender(<IconButton icon="bell" label="알림" size="xl" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '24');
  });
});

describe('Input mono(#8)', () => {
  it('contract prop이 있고 켜면 data-mono', () => {
    expect(InputContract.props.mono).toMatchObject({ type: 'boolean', default: false });
    const { container, rerender } = render(<Input label="품목 코드" mono defaultValue="A-001" />);
    expect(container.querySelector('.tl-input')).toHaveAttribute('data-mono');
    rerender(<Input label="품목 코드" defaultValue="A-001" />);
    expect(container.querySelector('.tl-input')).not.toHaveAttribute('data-mono');
  });
});

describe('Button disabledReason(#13)', () => {
  it('포커스가 닿는 aria-disabled, 이유는 설명과 툴팁으로', async () => {
    const onPress = vi.fn();
    render(
      <Button disabled disabledReason="결재 권한이 없습니다" onPress={onPress}>
        승인
      </Button>,
    );
    const button = screen.getByRole('button', { name: '승인' });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-state', 'disabled');
    expect(button).toHaveAccessibleDescription('결재 권한이 없습니다');
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
    act(() => button.focus());
    expect(button).toHaveFocus();
    await waitFor(() =>
      expect(document.querySelector('.tl-tooltip')).toHaveTextContent('결재 권한이 없습니다'),
    );
  });

  it('submit 단추면 폼을 보내지 않는다', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" disabled disabledReason="필수 항목을 채우세요">
          저장
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('이유가 없으면 예전처럼 native disabled', () => {
    render(<Button disabled>승인</Button>);
    const button = screen.getByRole('button', { name: '승인' });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-describedby');
  });

  it('contract에 disabledReason이 있다', () => {
    expect(ButtonContract.props.disabledReason.type).toBe('string');
  });
});

describe('Menu disabledReason(#13)', () => {
  const items: MenuActionItem[] = [
    { id: 'edit', label: '수정' },
    {
      id: 'delete',
      label: '삭제',
      disabled: true,
      disabledReason: '결재 중인 문서는 지울 수 없습니다',
    },
  ];

  it('비활성 항목에 포커스가 닿고 이유를 설명 · 툴팁으로 알린다', async () => {
    const onDelete = vi.fn();
    render(
      <Menu
        trigger={<IconButton icon="ellipsis" label="문서 동작" />}
        items={items.map((i) => (i.id === 'delete' ? { ...i, onSelect: onDelete } : i))}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '문서 동작' }));
    const menu = await screen.findByRole('menu');
    const del = within(menu).getByRole('menuitem', { name: '삭제' });
    expect(del).toHaveAttribute('aria-disabled', 'true');
    expect(del).toHaveAccessibleDescription('결재 중인 문서는 지울 수 없습니다');
    fireEvent.click(del);
    expect(onDelete).not.toHaveBeenCalled();
    act(() => del.focus());
    await waitFor(() =>
      expect(
        [...document.querySelectorAll('.tl-tooltip')].some(
          (t) => t.textContent === '결재 중인 문서는 지울 수 없습니다',
        ),
      ).toBe(true),
    );
  });

  it('좁은 화면 시트: 이유를 행 끝 글자로 보이고 누를 수 없다', async () => {
    narrow();
    const onDelete = vi.fn();
    render(
      <Menu
        trigger={<IconButton icon="ellipsis" label="문서 동작" />}
        items={items.map((i) => (i.id === 'delete' ? { ...i, onSelect: onDelete } : i))}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '문서 동작' }));
    const dialog = await screen.findByRole('dialog', { name: '문서 동작' });
    const del = within(dialog).getByRole('button', { name: '삭제' });
    expect(del).not.toBeDisabled();
    expect(del).toHaveAttribute('aria-disabled', 'true');
    expect(del).toHaveAccessibleDescription('결재 중인 문서는 지울 수 없습니다');
    expect(within(dialog).getByText('결재 중인 문서는 지울 수 없습니다')).toBeVisible();
    fireEvent.click(del);
    expect(onDelete).not.toHaveBeenCalled();
  });
});

describe('IconButton 툴팁(#14)', () => {
  it('title 대신 Trellis 툴팁, 키보드 포커스에 뜬다', async () => {
    render(<IconButton icon="settings" label="설정" />);
    const button = screen.getByRole('button', { name: '설정' });
    expect(button).not.toHaveAttribute('title');
    act(() => button.focus());
    await waitFor(() => {
      const tip = document.querySelector('.tl-tooltip');
      expect(tip).toHaveTextContent('설정');
    });
  });

  it('바깥 Tooltip이 감싸면 말풍선은 하나', async () => {
    render(
      <Tooltip content="열 설정 열기" delay={0}>
        <IconButton icon="columns-3" label="열 설정" />
      </Tooltip>,
    );
    act(() => screen.getByRole('button', { name: '열 설정' }).focus());
    await waitFor(() => expect(document.querySelectorAll('.tl-tooltip')).toHaveLength(1));
    expect(document.querySelector('.tl-tooltip')).toHaveTextContent('열 설정 열기');
  });

  it('Menu 트리거로 써도 메뉴가 열린다', async () => {
    render(
      <Menu
        trigger={<IconButton icon="ellipsis" label="행 동작" />}
        items={[{ id: 'a', label: '복사' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '행 동작' }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });
});

describe('Switch lg(#15)', () => {
  it('values에 lg가 있고 size를 주지 않으면 touch용 자동 표시', () => {
    expect(SwitchContract.props.size.values).toEqual(['sm', 'md', 'lg']);
    const { container, rerender } = render(<Switch>자동 발행</Switch>);
    const root = container.querySelector('.tl-switch');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-size-auto');
    rerender(<Switch size="md">자동 발행</Switch>);
    expect(container.querySelector('.tl-switch')).not.toHaveAttribute('data-size-auto');
    rerender(<Switch size="lg">자동 발행</Switch>);
    expect(container.querySelector('.tl-switch')).toHaveAttribute('data-size', 'lg');
  });
});

describe('QuantityInput 낭독(#16)', () => {
  it('− / + 로 바뀐 값을 aria-live="polite"로 알린다', () => {
    const { container } = render(
      <Field label="입고 수량">
        <QuantityInput defaultValue={9} unit="BOX" />
      </Field>,
    );
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('');
    fireEvent.click(screen.getByRole('button', { name: '수량 늘리기' }));
    expect(live).toHaveTextContent('10BOX');
    fireEvent.click(screen.getByRole('button', { name: '수량 줄이기' }));
    expect(live).toHaveTextContent('9BOX');
    // 직접 친 값은 읽지 않는다(화면 낭독기가 입력을 이미 읽는다)
    fireEvent.change(screen.getByRole('textbox', { name: '입고 수량' }), {
      target: { value: '20' },
    });
    expect(live).toHaveTextContent('9BOX');
  });
});

describe('Select · MultiSelect 빈 목록(#17)', () => {
  it('선택지가 0개면 "선택할 항목이 없습니다"', async () => {
    render(<Select label="창고" options={[]} />);
    fireEvent.click(screen.getByRole('combobox', { name: '창고' }));
    expect(await screen.findByText('선택할 항목이 없습니다')).toBeInTheDocument();
  });

  it('MultiSelect · 영어', async () => {
    render(
      <TrellisProvider locale="en">
        <MultiSelect label="Warehouse" options={[]} />
      </TrellisProvider>,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'Warehouse' }));
    expect(await screen.findByText('No options')).toBeInTheDocument();
  });

  it('좁은 화면 시트에도 같은 안내', async () => {
    narrow();
    render(<Select label="창고" options={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /창고/ }));
    const dialog = await screen.findByRole('dialog', { name: '창고' });
    expect(within(dialog).getByRole('status')).toHaveTextContent('선택할 항목이 없습니다');
    expect(within(dialog).queryByRole('radiogroup')).toBeNull();
  });
});

describe('PeriodPicker max · maxDays(#22)', () => {
  it('max 뒤 날은 고를 수 없고 프리셋 끝이 max로 줄어든다', async () => {
    const onChange = vi.fn();
    render(
      <PeriodPicker label="조회 기간" today="2026-11-10" max="2026-11-10" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /조회 기간/ }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    // 11월 11일(과 옆 달의 11일)은 max 뒤라 막힌다
    for (const day of within(dialog).getAllByRole('button', { name: /^11일/ }))
      expect(day).toBeDisabled();
    expect(within(dialog).getAllByRole('button', { name: /^10일/ })[0]).not.toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: /^당월/ }));
    expect(onChange).toHaveBeenCalledWith({ from: '2026-11-01', to: '2026-11-10' });
  });

  it('max 뒤 날짜를 치면 안내하고 값에 넣지 않는다', async () => {
    render(<PeriodPicker label="조회 기간" today="2026-11-10" max="2026-11-10" />);
    fireEvent.click(screen.getByRole('button', { name: /조회 기간/ }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    fireEvent.change(within(dialog).getByRole('textbox', { name: '종료일' }), {
      target: { value: '20261120' },
    });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('2026-11-10까지 넣을 수 있습니다');
  });

  it('N일을 보이고 maxDays를 넘으면 경고만, 적용은 된다', async () => {
    const onChange = vi.fn();
    render(
      <PeriodPicker
        label="조회 기간"
        today="2026-11-10"
        maxDays={31}
        defaultValue={{ from: '2026-11-01', to: '2026-11-30' }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /조회 기간/ }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    expect(within(dialog).getByText('30일')).toBeInTheDocument();
    expect(dialog.querySelector('.tl-period-picker__warning')).toBeNull();
    fireEvent.change(within(dialog).getByRole('textbox', { name: '시작일' }), {
      target: { value: '20260901' },
    });
    expect(within(dialog).getByText('91일')).toBeInTheDocument();
    expect(dialog.querySelector('.tl-period-picker__warning')).toHaveTextContent(
      '31일이 넘는 기간입니다',
    );
    const apply = within(dialog).getByRole('button', { name: '적용' });
    expect(apply).not.toBeDisabled();
    fireEvent.click(apply);
    expect(onChange).toHaveBeenCalledWith({ from: '2026-09-01', to: '2026-11-30' });
  });

  it('좁은 화면 시트 아래 줄에 N일', async () => {
    narrow();
    render(
      <PeriodPicker
        label="조회 기간"
        today="2026-11-10"
        defaultValue={{ from: '2026-11-01', to: '2026-11-07' }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /조회 기간/ }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    const days = within(dialog).getByText('7일');
    expect(days.closest('.tl-sheet__footer')).not.toBeNull();
  });

  it('contract에 max · maxDays', () => {
    expect(PeriodPickerContract.props.max.type).toBe('string');
    expect(PeriodPickerContract.props.maxDays.type).toBe('number');
  });
});
