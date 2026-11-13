// 범용 기본 부품(PG-41): Link(TrellisProvider navigate, R-T34) · Tag · TagInput(사람 칩, R-T25) · Divider
import {
  DividerContract,
  LinkContract,
  TagContract,
  TagInputContract,
  type DividerProps,
  type LinkProps,
  type TagInputProps,
  type TagProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Divider,
  Field,
  Link,
  PersonLabel,
  Tag,
  TagInput,
  TrellisProvider,
} from '../src/core/index.js';

const PEOPLE = [
  { value: 'E-0012', label: '한서연', meta: '인사팀 · 매니저' },
  { value: 'E-0031', label: '정민호', meta: '영업팀 · 책임' },
  { value: 'E-0044', label: '박서연', meta: '재무팀 · 선임' },
];
/**
 * 누름이 브라우저 기본 이동으로 가는지(컴포넌트가 막지 않았는지). React 처리 뒤 document에서 보고,
 * jsdom이 이동을 시도하지 않게 그 자리에서 막는다
 */
function browserDefault(el: Element, init: MouseEventInit = {}): boolean {
  let allowed = false;
  const spy = (e: Event) => {
    allowed = !e.defaultPrevented;
    e.preventDefault();
  };
  document.addEventListener('click', spy);
  act(() => {
    el.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
    );
  });
  document.removeEventListener('click', spy);
  return allowed;
}

const KEYWORDS = [
  { value: '냉장', label: '냉장' },
  { value: '냉동', label: '냉동' },
  { value: '행사 상품', label: '행사 상품' },
];

describe('contract parity', () => {
  const PAIRS: [{ displayName?: string }, { name: string; props: object }][] = [
    [Link, LinkContract],
    [Tag, TagContract],
    [TagInput, TagInputContract],
    [Divider, DividerContract],
  ];

  it('displayName === contract.name, props에 id · testID', () => {
    for (const [component, contract] of PAIRS) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<Omit<LinkProps, 'children'>>().toMatchTypeOf<ComponentProps<typeof Link>>();
    expectTypeOf<Omit<TagProps, 'children'>>().toMatchTypeOf<ComponentProps<typeof Tag>>();
    expectTypeOf<TagInputProps>().toMatchTypeOf<ComponentProps<typeof TagInput>>();
    expectTypeOf<DividerProps>().toMatchTypeOf<ComponentProps<typeof Divider>>();
  });

  it('values가 있는 prop은 값마다 data-<prop>', () => {
    for (const variant of LinkContract.props.variant.values!) {
      const { unmount } = render(
        <Link href="#a" variant={variant as LinkProps['variant']} testID="l">
          링크
        </Link>,
      );
      expect(screen.getByTestId('l')).toHaveAttribute('data-variant', variant);
      unmount();
    }
    for (const underline of LinkContract.props.underline.values!) {
      const { unmount } = render(
        <Link href="#a" underline={underline as LinkProps['underline']} testID="l">
          링크
        </Link>,
      );
      expect(screen.getByTestId('l')).toHaveAttribute('data-underline', underline);
      unmount();
    }
    for (const variant of TagContract.props.variant.values!)
      for (const size of TagContract.props.size.values!) {
        const { unmount } = render(
          <Tag variant={variant as TagProps['variant']} size={size as TagProps['size']} testID="t">
            태그
          </Tag>,
        );
        const el = screen.getByTestId('t');
        expect(el).toHaveAttribute('data-variant', variant);
        expect(el).toHaveAttribute('data-size', size);
        unmount();
      }
    for (const orientation of DividerContract.props.orientation.values!)
      for (const spacing of DividerContract.props.spacing.values!) {
        const { unmount } = render(
          <Divider
            orientation={orientation as DividerProps['orientation']}
            spacing={spacing as DividerProps['spacing']}
            testID="d"
          />,
        );
        const el = screen.getByTestId('d');
        expect(el).toHaveAttribute('data-orientation', orientation);
        expect(el).toHaveAttribute('data-spacing', spacing);
        unmount();
      }
  });
});

describe('Link', () => {
  it('앱 안 주소: 링크 색 a, 새 탭 표시 없음', () => {
    render(<Link href="/erp/sales/orders">수주 목록</Link>);
    const a = screen.getByRole('link', { name: '수주 목록' });
    expect(a).toHaveAttribute('href', '/erp/sales/orders');
    expect(a).toHaveClass('tl-link', 'tl-focusable');
    expect(a).not.toHaveAttribute('target');
  });

  it('바깥 주소: 새 탭 · rel · 숨은 글자 "새 창에서 열림"', () => {
    render(<Link href="https://www.law.go.kr">국가법령정보센터</Link>);
    const a = screen.getByRole('link', { name: /국가법령정보센터/ });
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    // jsdom 이름 계산은 자식 글자의 앞 공백을 잘라 붙인다(브라우저는 띄어 읽는다)
    expect(a).toHaveAccessibleName(/^국가법령정보센터 ?새 창에서 열림$/);
    expect(a.querySelector('.tl-link__icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('external prop이 자동 판단을 이긴다', () => {
    render(
      <Link href="/files/manual.pdf" external testID="l">
        안내서
      </Link>,
    );
    expect(screen.getByTestId('l')).toHaveAttribute('target', '_blank');
  });

  it('disabled: 주소 없음 · aria-disabled · data-state', () => {
    const onPress = vi.fn();
    render(
      <Link href="/payroll" disabled onPress={onPress} testID="l">
        급여 대장
      </Link>,
    );
    const a = screen.getByTestId('l');
    expect(a).not.toHaveAttribute('href');
    expect(a).toHaveAttribute('aria-disabled', 'true');
    expect(a).toHaveAttribute('data-state', 'disabled');
    expect(screen.getByRole('link', { name: '급여 대장' })).toBe(a);
    fireEvent.click(a);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('TrellisProvider navigate: 왼쪽 누름은 navigate(href), onPress가 먼저', () => {
    const calls: string[] = [];
    const navigate = vi.fn((href: string) => calls.push(`nav:${href}`));
    render(
      <TrellisProvider navigate={navigate}>
        <Link href="/erp/sales/orders" onPress={() => calls.push('press')}>
          수주 목록
        </Link>
      </TrellisProvider>,
    );
    const a = screen.getByRole('link', { name: '수주 목록' });
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    act(() => {
      a.dispatchEvent(ev);
    });
    expect(ev.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/erp/sales/orders');
    expect(calls).toEqual(['press', 'nav:/erp/sales/orders']);
  });

  it('새 탭 누름(Ctrl · Cmd · 가운데) · 바깥 주소 · #id는 브라우저에 맡긴다', () => {
    const navigate = vi.fn();
    render(
      <TrellisProvider navigate={navigate}>
        <Link href="/a">안</Link>
        <Link href="https://www.law.go.kr">바깥</Link>
        <Link href="#top">위로</Link>
      </TrellisProvider>,
    );
    const inner = screen.getByRole('link', { name: '안' });
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }])
      expect(browserDefault(inner, init)).toBe(true);
    expect(browserDefault(screen.getByRole('link', { name: /바깥/ }))).toBe(true);
    expect(browserDefault(screen.getByRole('link', { name: '위로' }))).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('안쪽 Provider는 바깥 navigate를 물려받는다 · PersonLabel href도 navigate로', () => {
    const navigate = vi.fn();
    render(
      <TrellisProvider navigate={navigate}>
        <TrellisProvider locale="en">
          <PersonLabel name="한서연" href="/erp/hr-payroll/hr-master?id=E-0012" />
        </TrellisProvider>
      </TrellisProvider>,
    );
    fireEvent.click(screen.getByRole('link', { name: /한서연/ }));
    expect(navigate).toHaveBeenCalledWith('/erp/hr-payroll/hr-master?id=E-0012');
  });

  it('navigate가 없으면 a 태그 기본 이동(막지 않는다)', () => {
    render(<Link href="/a">안</Link>);
    expect(browserDefault(screen.getByRole('link', { name: '안' }))).toBe(true);
  });
});

describe('Tag', () => {
  it('라벨 칩, × 단추 이름은 "<라벨> 삭제"', () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>냉장</Tag>);
    fireEvent.click(screen.getByRole('button', { name: '냉장 삭제' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('× 단추는 초점을 받는 type=button(Enter · Space는 단추 기본 동작)', () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>냉동</Tag>);
    const btn = screen.getByRole('button', { name: '냉동 삭제' });
    btn.focus();
    expect(btn).toHaveFocus();
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('사람 칩: 원 아바타(꾸밈) + 이름, × 이름은 사람 이름', () => {
    const { container } = render(
      <Tag person={{ name: '한서연' }} onRemove={() => undefined} testID="t" />,
    );
    expect(screen.getByTestId('t')).toHaveAttribute('data-person', '');
    expect(screen.getByTestId('t')).toHaveTextContent('한서연');
    expect(container.querySelector('.tl-avatar')).toHaveAttribute('data-shape', 'circle');
    expect(container.querySelector('.tl-avatar')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: '한서연 삭제' })).toBeInTheDocument();
  });

  it('disabled: × 단추 없음, aria-disabled', () => {
    render(
      <Tag disabled onRemove={() => undefined} testID="t">
        본사 창고
      </Tag>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('t')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('t')).toHaveAttribute('data-state', 'disabled');
  });

  it('상태 색 prop이 없다(상태는 Badge)', () => {
    expect(Object.keys(TagContract.props)).not.toContain('tone');
  });
});

function Controlled(props: Partial<TagInputProps> & { initial?: string[] }) {
  const { initial = [], ...rest } = props;
  const [v, setV] = useState<string[]>(initial);
  return (
    <>
      <TagInput label="태그" value={v} onChange={setV} {...rest} />
      <output data-testid="value">{v.join('|')}</output>
    </>
  );
}

const valueOf = () => screen.getByTestId('value').textContent;

describe('TagInput', () => {
  it('콤보박스: 치면 추천이 열리고 가리킨 행은 aria-activedescendant', () => {
    render(<Controlled suggestions={KEYWORDS} />);
    const input = screen.getByRole('combobox', { name: '태그' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    fireEvent.change(input, { target: { value: '냉' } });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const list = screen.getByRole('listbox');
    expect(
      within(list)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['냉장', '냉동', '"냉" 추가']);
    // 글자 모드는 화살표로 고를 때만 가리킨다
    expect(input).not.toHaveAttribute('aria-activedescendant');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const first = within(list).getAllByRole('option')[0]!;
    expect(input).toHaveAttribute('aria-activedescendant', first.id);
    expect(first).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(valueOf()).toBe('냉장');
    expect(input).toHaveValue('');
  });

  it('글자 모드: Enter · 쉼표로 친 글자, 추천 이름과 같으면 그 추천, 겹친 값은 넣지 않는다', () => {
    render(<Controlled suggestions={KEYWORDS} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '수입 식자재' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: '냉동' } });
    fireEvent.keyDown(input, { key: ',' });
    fireEvent.change(input, { target: { value: '냉동' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(valueOf()).toBe('수입 식자재|냉동');
    expect(screen.getByRole('list', { name: '넣은 항목' })).toBeInTheDocument();
  });

  it('한글 조합 중 Enter는 칩을 만들지 않는다', () => {
    render(<Controlled suggestions={KEYWORDS} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '냉자' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(valueOf()).toBe('');
  });

  it('빈 칸 Backspace는 마지막 칩을 빼고, 알림 줄이 읽는다', () => {
    const { container } = render(<Controlled initial={['냉장', '냉동']} suggestions={KEYWORDS} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(valueOf()).toBe('냉장');
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('냉동 삭제했습니다');
  });

  it('칩 × 단추로 빼면 초점이 입력 칸으로', () => {
    render(<Controlled initial={['냉장', '냉동']} suggestions={KEYWORDS} />);
    fireEvent.click(screen.getByRole('button', { name: '냉장 삭제' }));
    expect(valueOf()).toBe('냉동');
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('붙여 넣기: 쉼표 · 줄바꿈으로 나눠 한 번에', () => {
    render(<Controlled suggestions={KEYWORDS} />);
    const input = screen.getByRole('combobox');
    fireEvent.paste(input, { clipboardData: { getData: () => '거래처 미팅, 견적 요청\n냉장' } });
    expect(valueOf()).toBe('거래처 미팅|견적 요청|냉장');
  });

  it('사람 모드: 첫 사람을 바로 가리켜 Enter가 넣는다, 칩은 아바타 + 이름, 값은 id', () => {
    const { container } = render(<Controlled mode="person" suggestions={PEOPLE} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '서연' } });
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]!.querySelector('.tl-person-label')).not.toBeNull();
    expect(input).toHaveAttribute('aria-activedescendant', options[0]!.id);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(valueOf()).toBe('E-0012');
    expect(container.querySelector('.tl-tag[data-person]')).toHaveTextContent('한서연');
    expect(screen.getByRole('button', { name: '한서연 삭제' })).toBeInTheDocument();
  });

  it('사람 모드: 목록에 없는 글자는 넣지 않고 "찾는 항목이 없습니다"', () => {
    render(<Controlled mode="person" suggestions={PEOPLE} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '없는 사람' } });
    expect(screen.getByText('찾는 항목이 없습니다')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(valueOf()).toBe('');
  });

  it('추천을 누르면 넣고 입력 칸은 초점을 지킨다(mousedown 기본 동작 막음)', () => {
    render(<Controlled mode="person" suggestions={PEOPLE} />);
    const input = screen.getByRole('combobox');
    input.focus();
    fireEvent.change(input, { target: { value: '정' } });
    const option = screen.getByRole('option', { name: /정민호/ });
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    option.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    fireEvent.click(option);
    expect(valueOf()).toBe('E-0031');
    expect(input).toHaveFocus();
  });

  it('Escape: 목록을 닫고, 닫혀 있으면 글자를 지운다', () => {
    render(<Controlled suggestions={KEYWORDS} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '냉' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveValue('냉');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('');
  });

  it('max: 다 차면 읽기 전용 · 자리 글자, 넘게 넣지 않는다', () => {
    render(<Controlled initial={['냉장']} suggestions={KEYWORDS} max={2} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '냉동' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(valueOf()).toBe('냉장|냉동');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('placeholder', '최대 2개를 넣었습니다');
  });

  it('Field 안: 라벨 연결 · 오류 · 필수 · 비활성', () => {
    const { rerender } = render(
      <Field label="참조" error="참조를 한 명 이상 넣으세요" required>
        <TagInput mode="person" suggestions={PEOPLE} />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: /참조/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input.closest('.tl-tag-input')).toHaveAttribute('data-state', 'error');
    rerender(
      <Field label="참조" disabled>
        <TagInput mode="person" suggestions={PEOPLE} defaultValue={['E-0012']} />
      </Field>,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('button', { name: '한서연 삭제' })).toBeNull();
  });

  it('name: 값마다 숨은 입력', () => {
    const { container } = render(
      <TagInput
        label="참조"
        mode="person"
        suggestions={PEOPLE}
        defaultValue={['E-0012', 'E-0031']}
        name="cc"
      />,
    );
    const hidden = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="cc"]'),
    ];
    expect(hidden.map((h) => h.value)).toEqual(['E-0012', 'E-0031']);
  });
});

describe('Divider', () => {
  it('기본: separator(가로), 가운데 글자는 이름', () => {
    render(<Divider label="이전 기록" testID="d" />);
    const sep = screen.getByRole('separator', { name: '이전 기록' });
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal');
    expect(sep).toHaveAttribute('data-labelled', '');
  });

  it('세로줄은 label을 그리지 않는다, decorative는 화면 읽기에서 빠진다', () => {
    const { rerender } = render(<Divider orientation="vertical" label="무시" testID="d" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByTestId('d')).toBeEmptyDOMElement();
    rerender(<Divider decorative testID="d" />);
    expect(screen.queryByRole('separator')).toBeNull();
    expect(screen.getByTestId('d')).toHaveAttribute('aria-hidden', 'true');
  });
});
