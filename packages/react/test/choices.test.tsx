// PR-08(G): SelectableCard · CheckboxGroup · AddressInput — 키보드 · Field 연결 · 제어/비제어
import {
  AddressInputContract,
  CheckboxGroupContract,
  SelectableCardContract,
  type AddressInputProps,
  type AddressResult,
  type AddressValue,
  type CheckboxGroupOption,
  type CheckboxGroupProps,
  type SelectableCardMultipleProps,
  type SelectableCardSingleProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AddressInput,
  AddressSearchProvider,
  CheckboxGroup,
  Field,
  SelectableCard,
  TrellisProvider,
} from '../src/core/index.js';
import { useTrellisForm } from '../src/form/index.js';

const PAIRS: [{ displayName?: string }, { name: string; props: Record<string, unknown> }][] = [
  [SelectableCard, SelectableCardContract],
  [CheckboxGroup, CheckboxGroupContract],
  [AddressInput, AddressInputContract],
];

describe('contract parity', () => {
  it('displayName === contract.name, id · testID가 있다', () => {
    for (const [c, k] of PAIRS) {
      expect(c.displayName).toBe(k.name);
      expect(Object.keys(k.props), k.name).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<Omit<SelectableCardSingleProps, 'options'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof SelectableCard>, 'options'>
    >();
    expectTypeOf<Omit<SelectableCardMultipleProps, 'options'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof SelectableCard>, 'options'>
    >();
    // meta는 contract에서 unknown(플랫폼마다 다른 슬롯), 웹은 ReactNode
    expectTypeOf<Omit<CheckboxGroupProps, 'options'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof CheckboxGroup>, 'options'>
    >();
    expectTypeOf<Omit<CheckboxGroupOption, 'meta'>>().toMatchTypeOf<
      ComponentProps<typeof CheckboxGroup>['options'][number]
    >();
    expectTypeOf<AddressInputProps>().toMatchTypeOf<ComponentProps<typeof AddressInput>>();
  });
});

const SHIPPING = [
  { value: 'parcel', title: '택배', description: '1~2일 · 전국', meta: '3,000원' },
  { value: 'quick', title: '퀵 배송', description: '당일 · 수도권', disabled: true },
  { value: 'pickup', title: '방문 수령', description: '평일 09:00~18:00' },
];

describe('SelectableCard single', () => {
  it('radiogroup + radio, 이름은 제목 · 설명은 meta와 설명', () => {
    render(<SelectableCard label="배송 방법" options={SHIPPING} defaultValue="parcel" />);
    const group = screen.getByRole('radiogroup', { name: '배송 방법' });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const parcel = screen.getByRole('radio', { name: '택배' });
    expect(parcel).toHaveAttribute('aria-checked', 'true');
    expect(parcel).toHaveAccessibleDescription('3,000원 1~2일 · 전국');
    expect(screen.getByRole('radio', { name: '퀵 배송' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('roving tabindex: 고른 카드만 Tab 순서에 있다. 없으면 첫 카드', () => {
    const { unmount } = render(<SelectableCard label="배송" options={SHIPPING} />);
    expect(screen.getByRole('radio', { name: '택배' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: '방문 수령' })).toHaveAttribute('tabindex', '-1');
    unmount();
    render(<SelectableCard label="배송" options={SHIPPING} defaultValue="pickup" />);
    expect(screen.getByRole('radio', { name: '택배' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: '방문 수령' })).toHaveAttribute('tabindex', '0');
  });

  it('화살표 키는 비활성 카드를 건너뛰며 옮기고 바로 고른다(끝에서 처음으로)', () => {
    const onChange = vi.fn();
    render(
      <SelectableCard label="배송" options={SHIPPING} defaultValue="parcel" onChange={onChange} />,
    );
    const parcel = screen.getByRole('radio', { name: '택배' });
    const pickup = screen.getByRole('radio', { name: '방문 수령' });
    parcel.focus();
    fireEvent.keyDown(parcel, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('pickup');
    expect(pickup).toHaveFocus();
    expect(pickup).toHaveAttribute('aria-checked', 'true');
    expect(pickup).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(pickup, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('parcel');
    expect(parcel).toHaveFocus();
    fireEvent.keyDown(parcel, { key: 'ArrowUp' });
    expect(pickup).toHaveFocus();
  });

  it('Space · Enter로 고르고, 비활성 카드는 누르지 않는다', () => {
    const onChange = vi.fn();
    render(<SelectableCard label="배송" options={SHIPPING} onChange={onChange} />);
    const pickup = screen.getByRole('radio', { name: '방문 수령' });
    fireEvent.keyDown(pickup, { key: ' ' });
    expect(onChange).toHaveBeenLastCalledWith('pickup');
    fireEvent.keyDown(screen.getByRole('radio', { name: '택배' }), { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('parcel');
    fireEvent.click(screen.getByRole('radio', { name: '퀵 배송' }));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('제어: value를 바꾸지 않으면 고른 카드가 그대로다', () => {
    const onChange = vi.fn();
    render(<SelectableCard label="배송" options={SHIPPING} value="parcel" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '방문 수령' }));
    expect(onChange).toHaveBeenCalledWith('pickup');
    expect(screen.getByRole('radio', { name: '택배' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '방문 수령' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('Field: 라벨 · 도움말 · 필수 · 오류가 묶음에 이어지고, 묶음 포커스는 고른 카드로 간다', () => {
    const { container, rerender } = render(
      <Field label="배송 방법" required help="출고 마감은 14시입니다">
        <SelectableCard options={SHIPPING} defaultValue="pickup" name="shipping" />
      </Field>,
    );
    const group = screen.getByRole('radiogroup', { name: '배송 방법(필수)' });
    expect(group).toHaveAccessibleDescription('출고 마감은 14시입니다');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(container.querySelector('input[type="hidden"][name="shipping"]')).toHaveValue('pickup');
    act(() => group.focus());
    expect(screen.getByRole('radio', { name: '방문 수령' })).toHaveFocus();
    rerender(
      <Field label="배송 방법" required error="배송 방법을 고르세요">
        <SelectableCard options={SHIPPING} defaultValue="pickup" />
      </Field>,
    );
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('data-state', 'error');
    expect(group).toHaveAccessibleDescription('배송 방법을 고르세요');
  });
});

describe('SelectableCard multiple', () => {
  const CHANNELS = [
    { value: 'app', title: '앱 알림', disabled: true },
    { value: 'mail', title: '메일' },
    { value: 'sms', title: '문자' },
  ];

  it('group + checkbox, Space로 켜고 끄며 옵션 순서로 넘긴다', () => {
    const onChange = vi.fn();
    render(
      <SelectableCard
        mode="multiple"
        label="알림"
        options={CHANNELS}
        defaultValue={['sms', 'app']}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('group', { name: '알림' })).toBeInTheDocument();
    const mail = screen.getByRole('checkbox', { name: '메일' });
    expect(mail).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('checkbox', { name: '문자' })).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(mail, { key: ' ' });
    expect(onChange).toHaveBeenLastCalledWith(['app', 'mail', 'sms']);
    expect(mail).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(mail, { key: ' ' });
    expect(onChange).toHaveBeenLastCalledWith(['app', 'sms']);
    // 비활성 카드는 그대로
    fireEvent.click(screen.getByRole('checkbox', { name: '앱 알림' }));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('useTrellisForm bind로 배열 값을 잇는다', () => {
    function Form() {
      const form = useTrellisForm<{ channels: string[] }>({
        defaultValues: { channels: ['mail'] },
      });
      return (
        <>
          <Field {...form.field('channels', '알림')}>
            <SelectableCard mode="multiple" options={CHANNELS} {...form.bind('channels')} />
          </Field>
          <output>{form.watch('channels').join(',')}</output>
        </>
      );
    }
    render(<Form />);
    fireEvent.click(screen.getByRole('checkbox', { name: '문자' }));
    expect(screen.getByRole('status')).toHaveTextContent('mail,sms');
  });
});

const OPTIONS = [
  { value: 'mall', label: '자사몰', description: '수수료 0%' },
  { value: 'open', label: '오픈마켓' },
  { value: 'social', label: '소셜 커머스' },
  { value: 'b2b', label: '도매 몰', disabled: true },
];

describe('CheckboxGroup', () => {
  it('Field 라벨 · 도움말이 group에 이어지고, 안의 체크박스는 자기 id · 이름을 갖는다', () => {
    const { container } = render(
      <Field label="판매 채널" required help="고른 채널에만 보냅니다" id="channels-field">
        <CheckboxGroup options={OPTIONS} defaultValue={['mall']} name="channels" />
      </Field>,
    );
    const group = screen.getByRole('group', { name: '판매 채널(필수)' });
    expect(group).toHaveAttribute('id', 'channels-field');
    expect(group).toHaveAccessibleDescription('고른 채널에만 보냅니다');
    const boxes = within(group).getAllByRole('checkbox');
    expect(boxes).toHaveLength(4);
    for (const b of boxes) {
      expect(b.id).not.toBe('channels-field');
      // 필수는 묶음의 뜻(하나 이상)이라 체크박스마다 required를 걸지 않는다
      expect(b).not.toHaveAttribute('aria-required');
    }
    expect(screen.getByRole('checkbox', { name: '자사몰' })).toHaveAccessibleDescription(
      '수수료 0%',
    );
    expect(container.querySelector('input[name="channels"][value="mall"]')).toBeTruthy();
  });

  it('Space로 켜고 끈다. 값은 옵션 순서', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        label="채널"
        options={OPTIONS}
        defaultValue={['social']}
        onChange={onChange}
      />,
    );
    const mall = screen.getByRole('checkbox', { name: '자사몰' });
    fireEvent.keyDown(mall, { key: ' ' });
    fireEvent.keyUp(mall, { key: ' ' });
    // 둘째 인자: 이번에 바뀐 선택지와 바뀐 뒤 상태
    expect(onChange).toHaveBeenLastCalledWith(['mall', 'social'], {
      values: ['mall'],
      checked: true,
    });
    expect(mall).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(mall);
    expect(onChange).toHaveBeenLastCalledWith(['social'], { values: ['mall'], checked: false });
  });

  it('전체: 일부면 mixed, 누르면 고를 수 있는 것만 전부 켜고 다시 누르면 끈다', () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>(['open', 'b2b']);
      return (
        <>
          <CheckboxGroup
            label="채널"
            options={OPTIONS}
            value={value}
            onChange={setValue}
            selectAll="채널 전체"
          />
          <output>{value.join(',')}</output>
        </>
      );
    }
    render(<Controlled />);
    const all = screen.getByRole('checkbox', { name: '채널 전체' });
    expect(all).toHaveAttribute('aria-checked', 'mixed');
    // 전체 선택은 선택지 목록 밖 맨 위에 있다
    expect(all.closest('.tl-checkbox-group__all')).toBeTruthy();
    fireEvent.click(all);
    expect(screen.getByRole('status')).toHaveTextContent('mall,open,social,b2b');
    expect(all).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(all);
    // 비활성 선택지(도매 몰)의 값은 남는다
    expect(screen.getByRole('status')).toHaveTextContent(/^b2b$/);
  });

  it('required: Field 밖이면 이름에 필수를 붙이고, Field 안이면 Field 라벨이 알린다', () => {
    const { unmount } = render(<CheckboxGroup label="법인 범위" required options={OPTIONS} />);
    expect(screen.getByRole('group', { name: '법인 범위(필수)' })).toHaveAttribute(
      'data-required',
      'true',
    );
    unmount();
    render(
      <Field label="4대보험 취득 대상" required>
        <CheckboxGroup options={OPTIONS} />
      </Field>,
    );
    expect(screen.getByRole('group', { name: '4대보험 취득 대상(필수)' })).toHaveAttribute(
      'data-required',
      'true',
    );
  });

  it('제어: value를 바꾸지 않으면 그대로', () => {
    const onChange = vi.fn();
    render(<CheckboxGroup label="채널" options={OPTIONS} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '오픈마켓' }));
    expect(onChange).toHaveBeenCalledWith(['open'], { values: ['open'], checked: true });
    expect(screen.getByRole('checkbox', { name: '오픈마켓' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('오류면 체크박스마다 aria-invalid, 묶음 포커스는 첫 체크박스로', () => {
    render(
      <Field label="판매 채널" error="채널을 하나 이상 고르세요">
        <CheckboxGroup options={OPTIONS} />
      </Field>,
    );
    const group = screen.getByRole('group', { name: '판매 채널' });
    expect(group).toHaveAttribute('data-state', 'error');
    for (const b of within(group).getAllByRole('checkbox'))
      expect(b).toHaveAttribute('aria-invalid', 'true');
    act(() => group.focus());
    expect(screen.getByRole('checkbox', { name: '자사몰' })).toHaveFocus();
  });

  it('maxVisible: 넘치는 선택지는 숨기고 더 보기로 펼친다', () => {
    render(<CheckboxGroup label="채널" options={OPTIONS} maxVisible={2} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    const more = screen.getByRole('button', { name: '2개 더 보기' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByRole('button', { name: '접기' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('영어 locale', () => {
    render(
      <TrellisProvider locale="en">
        <CheckboxGroup label="Channels" options={OPTIONS} selectAll maxVisible={2} />
      </TrellisProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show 2 more' })).toBeInTheDocument();
  });
});

describe('CheckboxGroup R-35: 줄 끝 정보 · 바로 저장', () => {
  it('meta는 라벨 밖 줄 끝에 서고 상자의 설명으로 읽힌다. 링크를 눌러도 상자는 그대로', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        label="캘린더"
        onChange={onChange}
        options={[
          { value: 'mine', label: '내 일정', meta: '12건' },
          { value: 'team', label: '영업팀', description: '팀 공유', meta: '34건' },
          { value: 'shared', label: '공유받은 캘린더', meta: <a href="#settings">설정</a> },
          { value: 'holiday', label: '공휴일' },
        ]}
      />,
    );
    const group = screen.getByRole('group', { name: '캘린더' });
    expect(group).toHaveAttribute('data-meta', 'true');
    const mine = screen.getByRole('checkbox', { name: '내 일정' });
    expect(mine).toHaveAccessibleDescription('12건');
    // 라벨 설명과 meta가 함께 읽힌다
    expect(screen.getByRole('checkbox', { name: '영업팀' })).toHaveAccessibleDescription(
      '팀 공유 34건',
    );
    expect(screen.getByRole('checkbox', { name: '공휴일' })).not.toHaveAttribute(
      'aria-describedby',
    );
    const link = screen.getByRole('link', { name: '설정' });
    expect(link.closest('label')).toBeNull();
    expect(link.closest('.tl-checkbox-group__meta')).toBeTruthy();
    fireEvent.click(link);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: '공유받은 캘린더' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('pending: 그 선택지는 Spinner · aria-busy · 읽기 전용이고 누를 수 없다. 포커스는 남는다', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        label="알림"
        options={OPTIONS}
        defaultValue={['mall']}
        pending={['open']}
        onChange={onChange}
      />,
    );
    const open = screen.getByRole('checkbox', { name: '오픈마켓' });
    expect(open).toHaveAttribute('aria-busy', 'true');
    expect(open).toHaveAttribute('aria-readonly', 'true');
    expect(open).not.toHaveAttribute('data-disabled');
    expect(open.closest('.tl-checkbox-group__option')).toHaveAttribute('data-state', 'loading');
    expect(screen.getByRole('status')).toHaveTextContent('저장 중');
    open.focus();
    fireEvent.click(open);
    fireEvent.keyDown(open, { key: ' ' });
    fireEvent.keyUp(open, { key: ' ' });
    expect(onChange).not.toHaveBeenCalled();
    expect(open).toHaveAttribute('aria-checked', 'false');
    expect(open).toHaveFocus();
    // 다른 선택지는 그대로 누를 수 있다
    const mall = screen.getByRole('checkbox', { name: '자사몰' });
    expect(mall).not.toHaveAttribute('aria-busy');
    fireEvent.click(mall);
    expect(onChange).toHaveBeenLastCalledWith([], { values: ['mall'], checked: false });
  });

  it('바로 저장: change로 바뀐 것만 보내고, 저장하는 동안 pending, 끝나면 다시 누를 수 있다', async () => {
    const save = vi.fn<(values: string[], checked: boolean) => Promise<void>>();
    let finish: () => void = () => {};
    save.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    function Immediate() {
      const [value, setValue] = useState<string[]>(['mall']);
      const [pending, setPending] = useState<string[]>([]);
      return (
        <CheckboxGroup
          label="알림"
          options={OPTIONS}
          value={value}
          pending={pending}
          onChange={(next, change) => {
            setValue(next);
            setPending((p) => [...p, ...change.values]);
            void save(change.values, change.checked).then(() =>
              setPending((p) => p.filter((v) => !change.values.includes(v))),
            );
          }}
        />
      );
    }
    render(<Immediate />);
    const social = screen.getByRole('checkbox', { name: '소셜 커머스' });
    fireEvent.click(social);
    expect(save).toHaveBeenCalledWith(['social'], true);
    expect(social).toHaveAttribute('aria-checked', 'true');
    expect(social).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(social);
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect(social).not.toHaveAttribute('aria-busy');
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(social);
    expect(save).toHaveBeenLastCalledWith(['social'], false);
  });

  it('전체 선택: change는 상태가 바뀐 것만, 하나라도 저장 중이면 전체 선택도 저장 중', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CheckboxGroup
        label="채널"
        options={OPTIONS}
        defaultValue={['open']}
        selectAll="채널 전체"
        onChange={onChange}
      />,
    );
    const all = screen.getByRole('checkbox', { name: '채널 전체' });
    fireEvent.click(all);
    // 이미 켜진 오픈마켓 · 비활성 도매 몰은 빠진다
    expect(onChange).toHaveBeenLastCalledWith(['mall', 'open', 'social'], {
      values: ['mall', 'social'],
      checked: true,
    });
    rerender(
      <CheckboxGroup
        label="채널"
        options={OPTIONS}
        defaultValue={['open']}
        selectAll="채널 전체"
        pending={['social']}
        onChange={onChange}
      />,
    );
    expect(all).toHaveAttribute('aria-busy', 'true');
    expect(all).toHaveAttribute('aria-readonly', 'true');
    fireEvent.click(all);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('비활성이 저장 중보다 이긴다(Spinner 없음)', () => {
    render(<CheckboxGroup label="채널" options={OPTIONS} pending={['b2b']} />);
    const b2b = screen.getByRole('checkbox', { name: '도매 몰' });
    expect(b2b).not.toHaveAttribute('aria-busy');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('영어 locale: 저장 중 글자', () => {
    render(
      <TrellisProvider locale="en">
        <CheckboxGroup label="Channels" options={OPTIONS} pending={['mall']} />
      </TrellisProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saving');
  });
});

const RESULTS: AddressResult[] = [
  {
    postcode: '06236',
    road: '서울특별시 강남구 테헤란로 152',
    jibun: '서울특별시 강남구 역삼동 737',
    building: '테라빌딩',
  },
  { postcode: '13529', road: '경기도 성남시 분당구 판교역로 146' },
];

describe('AddressInput', () => {
  afterEach(() => vi.useRealTimers());

  it('검색이 없으면 세 칸을 직접 입력한다(우편번호는 숫자 5자리)', () => {
    const onChange = vi.fn();
    render(
      <Field label="사업장 주소" required help="직접 입력합니다">
        <AddressInput onChange={onChange} name="addr" />
      </Field>,
    );
    const group = screen.getByRole('group', { name: '사업장 주소(필수)' });
    expect(within(group).queryByRole('button')).toBeNull();
    const postcode = screen.getByRole('textbox', { name: '우편번호' });
    expect(postcode).not.toHaveAttribute('readonly');
    expect(postcode).toBeRequired();
    expect(postcode).toHaveAccessibleDescription('직접 입력합니다');
    expect(screen.getByRole('textbox', { name: '상세 주소' })).not.toBeRequired();
    fireEvent.change(postcode, { target: { value: '06-2365' } });
    expect(onChange).toHaveBeenLastCalledWith({ postcode: '06236', road: '', detail: '' });
    expect(postcode).toHaveAttribute('name', 'addr.postcode');
    fireEvent.change(postcode, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('검색: 대화상자에서 찾고 화살표 · Enter로 고르면 상세 주소로 간다', async () => {
    const search = vi.fn(async (q: string) => RESULTS.filter((r) => r.road.includes(q)));
    const onChange = vi.fn();
    render(
      <Field label="배송지" required>
        <AddressInput
          search={search}
          onChange={onChange}
          defaultValue={{ postcode: '04524', road: '서울특별시 중구 세종대로 110', detail: '3층' }}
        />
      </Field>,
    );
    expect(screen.getByRole('textbox', { name: '도로명 주소' })).toHaveAttribute('readonly');
    fireEvent.click(screen.getByRole('button', { name: '주소 검색' }));
    const dialog = await screen.findByRole('dialog', { name: '주소 검색' });
    const query = within(dialog).getByRole('combobox', { name: '주소 검색어' });
    await waitFor(() => expect(query).toHaveFocus());
    expect(within(dialog).getByRole('status')).toHaveTextContent('번지를 붙이면');
    fireEvent.change(query, { target: { value: '서울' } });
    fireEvent.keyDown(query, { key: 'Enter' });
    expect(search).toHaveBeenCalledWith('서울', expect.any(AbortSignal));
    const list = await within(dialog).findByRole('listbox');
    const options = within(list).getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(within(dialog).getByRole('status')).toHaveTextContent('검색 결과 1건');
    expect(query).toHaveAttribute('aria-activedescendant', options[0]!.id);
    fireEvent.keyDown(query, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({
      postcode: '06236',
      road: '서울특별시 강남구 테헤란로 152',
      jibun: '서울특별시 강남구 역삼동 737',
      // 다른 건물이면 상세 주소를 비운다
      detail: '',
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(screen.getByRole('textbox', { name: '상세 주소' })).toHaveFocus());
    expect(screen.getByText('지번 서울특별시 강남구 역삼동 737')).toBeInTheDocument();
  });

  it('결과가 없으면 안내, 실패하면 다시 시도', async () => {
    let fail = true;
    const search = vi.fn(async () => {
      if (fail) throw new Error('offline');
      return [];
    });
    render(<AddressInput label="주소" search={search} />);
    fireEvent.click(screen.getByRole('button', { name: '주소 검색' }));
    const dialog = await screen.findByRole('dialog');
    const query = within(dialog).getByRole('combobox');
    fireEvent.change(query, { target: { value: '없는길 1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '검색' }));
    await within(dialog).findByText('주소를 불러오지 못했습니다');
    fail = false;
    fireEvent.click(within(dialog).getByRole('button', { name: '다시 시도' }));
    await within(dialog).findByText('검색 결과가 없습니다. 도로명과 번지를 확인하세요');
    expect(search).toHaveBeenCalledTimes(2);
    expect(within(dialog).queryByRole('option')).toBeNull();
  });

  it('AddressSearchProvider의 함수를 쓰고, 칸의 search가 이긴다', async () => {
    const fromApp = vi.fn(async () => RESULTS);
    const own = vi.fn(async () => RESULTS.slice(1));
    render(
      <AddressSearchProvider search={fromApp}>
        <AddressInput label="본사" />
        <AddressInput label="지점" search={own} />
      </AddressSearchProvider>,
    );
    const [first, second] = screen.getAllByRole('button', { name: '주소 검색' });
    fireEvent.click(first!);
    let dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: '로' } });
    fireEvent.keyDown(within(dialog).getByRole('combobox'), { key: 'Enter' });
    await within(dialog).findAllByRole('option');
    expect(fromApp).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(within(dialog).getByRole('combobox'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(second!);
    dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: '로' } });
    fireEvent.keyDown(within(dialog).getByRole('combobox'), { key: 'Enter' });
    await within(dialog).findAllByRole('option');
    expect(own).toHaveBeenCalledTimes(1);
    expect(fromApp).toHaveBeenCalledTimes(1);
  });

  it('onSearchRequest: 앱이 창을 열고 apply로 결과를 넣는다(비제어도 반영)', () => {
    let apply: ((r: AddressResult) => void) | undefined;
    render(
      <AddressInput
        label="반품지"
        defaultValue={{
          postcode: '13529',
          road: '경기도 성남시 분당구 판교역로 146',
          detail: '2층',
        }}
        onSearchRequest={(fn) => {
          apply = fn;
        }}
      />,
    );
    const button = screen.getByRole('button', { name: '주소 검색' });
    expect(button).not.toHaveAttribute('aria-haspopup');
    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => apply?.(RESULTS[1]!));
    // 같은 건물이면 상세 주소를 남긴다
    expect(screen.getByRole('textbox', { name: '상세 주소' })).toHaveValue('2층');
  });

  it('제어 값 + useTrellisForm bind', () => {
    function Form() {
      const form = useTrellisForm<{ address: AddressValue | null }>({
        defaultValues: { address: null },
      });
      const v = form.watch('address');
      return (
        <>
          <Field {...form.field('address', '주소')}>
            <AddressInput {...form.bind('address')} />
          </Field>
          <output>{v ? `${v.postcode}|${v.road}|${v.detail}` : 'null'}</output>
        </>
      );
    }
    render(<Form />);
    fireEvent.change(screen.getByRole('textbox', { name: '도로명 주소' }), {
      target: { value: '서울특별시 중구 세종대로 110' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '상세 주소' }), {
      target: { value: '3층' },
    });
    expect(screen.getByRole('status')).toHaveTextContent('|서울특별시 중구 세종대로 110|3층');
  });

  it('Field 오류 · 비활성이 세 칸에 이어지고, 묶음 포커스는 검색 단추로 간다', () => {
    const { rerender } = render(
      <Field label="배송지" error="배송지를 입력하세요">
        <AddressInput search={async () => []} />
      </Field>,
    );
    for (const name of ['우편번호', '도로명 주소', '상세 주소']) {
      const box = screen.getByRole('textbox', { name });
      expect(box).toHaveAttribute('aria-invalid', 'true');
      expect(box).toHaveAccessibleDescription('배송지를 입력하세요');
    }
    const group = screen.getByRole('group', { name: '배송지' });
    act(() => group.focus());
    expect(screen.getByRole('button', { name: '주소 검색' })).toHaveFocus();
    rerender(
      <Field label="배송지" disabled>
        <AddressInput search={async () => []} />
      </Field>,
    );
    expect(screen.getByRole('button', { name: '주소 검색' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: '상세 주소' })).toBeDisabled();
  });
});

describe('AddressInput 좁은 화면', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('검색 창이 아래 시트로 열리고 고르면 닫힌다', async () => {
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
    const onChange = vi.fn();
    render(<AddressInput label="배송지" search={async () => RESULTS} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '주소 검색' }));
    const sheet = await screen.findByRole('dialog', { name: '주소 검색' });
    expect(sheet.closest('.tl-sheet')).toBeTruthy();
    const query = within(sheet).getByRole('combobox', { name: '주소 검색어' });
    fireEvent.change(query, { target: { value: '로' } });
    fireEvent.keyDown(query, { key: 'Enter' });
    const options = await within(sheet).findAllByRole('option');
    expect(options).toHaveLength(2);
    fireEvent.click(options[1]!);
    expect(onChange).toHaveBeenLastCalledWith({
      postcode: '13529',
      road: '경기도 성남시 분당구 판교역로 146',
      detail: '',
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
