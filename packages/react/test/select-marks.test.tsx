// Select · MultiSelect 선택지 앞 표시(leading) · 보조 글자(note) — 팝업 · 시트 · 닫힌 칸(PR-20)
import { SELECT_MARK_TONES, type SelectOption } from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { markColor } from '../src/_internal/option-mark.js';
import { Field, MultiSelect, Select } from '../src/core/index.js';

const PROJECTS: SelectOption[] = [
  { value: 'erp', label: 'ERP 고도화', leading: { kind: 'dot', tone: 'series-1' } },
  { value: 'crm', label: 'CRM 이전', leading: { kind: 'dot', tone: 'series-2' }, note: '사용 중' },
  {
    value: 'old',
    label: '2025 결산',
    leading: { kind: 'dot', tone: 'neutral' },
    note: '마감',
    disabled: true,
  },
  { value: 'mail', label: '메일 이관', leading: { kind: 'icon', icon: 'mail' } },
];

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

const markIn = (el: Element) => el.querySelector<HTMLElement>('.tl-select__mark');

describe('점 색 = 토큰 이름', () => {
  it('차트 슬롯 · 상태 톤 · 결재 상태를 CSS 변수로 바꾼다', () => {
    expect(markColor('series-3')).toBe('var(--tl-color-chart-series-3)');
    expect(markColor('compare')).toBe('var(--tl-color-chart-compare)');
    expect(markColor('income')).toBe('var(--tl-color-finance-income)');
    expect(markColor('danger')).toBe('var(--tl-color-status-danger-default)');
    expect(markColor('info')).toBe('var(--tl-color-status-info-default)');
    expect(markColor('neutral')).toBe('var(--tl-color-fg-tertiary)');
    expect(markColor('pending')).toBe('var(--tl-color-approval-pending-default)');
    for (const tone of SELECT_MARK_TONES) expect(markColor(tone)).toMatch(/^var\(--tl-color-/);
  });

  it('raw 색은 타입이 막는다', () => {
    type Tone = Extract<NonNullable<SelectOption['leading']>, { kind: 'dot' }>['tone'];
    expectTypeOf<'#ff0000'>().not.toMatchTypeOf<Tone>();
    expectTypeOf<'series-1'>().toMatchTypeOf<Tone>();
    expectTypeOf<'approved'>().toMatchTypeOf<Tone>();
  });
});

describe('Select leading · note', () => {
  it('닫힌 칸에 고른 선택지의 점이 보이고, 고르지 않으면 없다', () => {
    const { rerender } = render(
      <Field label="프로젝트">
        <Select options={PROJECTS} value="crm" />
      </Field>,
    );
    const trigger = screen.getByRole('combobox', { name: '프로젝트' });
    expect(trigger).toHaveTextContent('CRM 이전');
    // note는 닫힌 칸에 보이지 않는다
    expect(trigger).not.toHaveTextContent('사용 중');
    const mark = markIn(trigger)!;
    expect(mark).toHaveAttribute('data-kind', 'dot');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark.style.getPropertyValue('--tl-select-mark-color')).toBe(
      'var(--tl-color-chart-series-2)',
    );
    rerender(
      <Field label="프로젝트">
        <Select options={PROJECTS} value={null} />
      </Field>,
    );
    expect(markIn(screen.getByRole('combobox'))).toBeNull();
    rerender(
      <Field label="프로젝트">
        <Select options={PROJECTS} value="mail" />
      </Field>,
    );
    expect(markIn(screen.getByRole('combobox'))).toHaveAttribute('data-kind', 'icon');
  });

  it('팝업: 점 · 아이콘 · note, 키보드로 고른다', async () => {
    const onChange = vi.fn();
    render(
      <Field label="프로젝트">
        <Select options={PROJECTS} defaultValue="erp" onChange={onChange} />
      </Field>,
    );
    const trigger = screen.getByRole('combobox', { name: '프로젝트' });
    await act(async () => {
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    });
    const listbox = await screen.findByRole('listbox');
    const crm = within(listbox).getByRole('option', { name: /CRM 이전/ });
    expect(crm).toHaveTextContent('사용 중');
    expect(crm.querySelector('.tl-select__note')).toHaveTextContent('사용 중');
    expect(markIn(crm)).toHaveAttribute('data-tone', 'series-2');
    // note와 disabled는 따로: 마감은 둘 다
    const old = within(listbox).getByRole('option', { name: /2025 결산/ });
    expect(old).toHaveAttribute('aria-disabled', 'true');
    expect(old.querySelector('.tl-select__note')).toHaveTextContent('마감');
    expect(markIn(within(listbox).getByRole('option', { name: /메일 이관/ }))).toHaveAttribute(
      'data-kind',
      'icon',
    );
    // 체크는 고르지 않은 줄에도 자리를 잡는다(note가 같은 끝에 선다)
    expect(listbox.querySelectorAll('.tl-select__check')).toHaveLength(PROJECTS.length);
    // 화살표로 옮기고 Enter로 고른다(열 때 고른 줄 ERP에 놓인다)
    await act(async () => {
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    });
    expect(document.activeElement).toBe(crm);
    await act(async () => {
      fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    });
    expect(onChange).toHaveBeenCalledWith('crm');
    await waitFor(() => expect(markIn(trigger)).toHaveAttribute('data-tone', 'series-2'));
  });

  it('좁은 화면 시트: 점 · note가 같고 닫힌 칸에도 점', async () => {
    narrow();
    const onChange = vi.fn();
    render(
      <Field label="프로젝트">
        <Select options={PROJECTS} defaultValue="erp" onChange={onChange} />
      </Field>,
    );
    const trigger = screen.getByRole('button', { name: '프로젝트 ERP 고도화' });
    expect(markIn(trigger)).toHaveAttribute('data-tone', 'series-1');
    fireEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', { name: '프로젝트' });
    const crm = within(sheet).getByRole('radio', { name: /CRM 이전/ });
    expect(crm).toHaveTextContent('사용 중');
    expect(markIn(crm)).toHaveAttribute('data-tone', 'series-2');
    expect(within(sheet).getByRole('radio', { name: /2025 결산/ })).toBeDisabled();
    fireEvent.click(crm);
    expect(onChange).toHaveBeenCalledWith('crm');
    await waitFor(() => expect(markIn(trigger)).toHaveAttribute('data-tone', 'series-2'));
  });

  it('표시 없는 선택지는 지금 모양 그대로(표시 · note 요소 없음)', () => {
    render(
      <Select
        label="창고"
        options={[
          { value: 'a', label: '이천 1센터' },
          { value: 'b', label: '평택 2센터' },
        ]}
        defaultValue="a"
      />,
    );
    const trigger = screen.getByRole('combobox', { name: '창고' });
    expect(markIn(trigger)).toBeNull();
    expect(document.querySelector('.tl-select__note')).toBeNull();
  });
});

describe('MultiSelect leading · note', () => {
  it('닫힌 칸 = 요약에 이름이 보이는 첫 선택지의 표시', () => {
    const { rerender } = render(
      <MultiSelect options={PROJECTS} value={[]} label="프로젝트" placeholder="전체 프로젝트" />,
    );
    expect(markIn(screen.getByRole('combobox', { name: '프로젝트' }))).toBeNull();
    rerender(<MultiSelect options={PROJECTS} value={['mail', 'crm']} label="프로젝트" />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('CRM 이전 외 1');
    expect(markIn(trigger)).toHaveAttribute('data-tone', 'series-2');
  });

  it('팝업: 체크 상자 + 점 + 이름 + note', async () => {
    const onChange = vi.fn();
    render(<MultiSelect options={PROJECTS} label="프로젝트" onChange={onChange} />);
    const trigger = screen.getByRole('combobox', { name: '프로젝트' });
    await act(async () => {
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    });
    const listbox = await screen.findByRole('listbox');
    const crm = within(listbox).getByRole('option', { name: /CRM 이전/ });
    expect(crm.querySelector('.tl-multi-select__box')).not.toBeNull();
    expect(markIn(crm)).toHaveAttribute('data-tone', 'series-2');
    expect(crm.querySelector('.tl-select__note')).toHaveTextContent('사용 중');
    await act(async () => {
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    });
    expect(document.activeElement).toBe(crm);
    await act(async () => {
      fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    });
    expect(onChange).toHaveBeenLastCalledWith(['crm']);
  });

  it('좁은 화면 시트: 행마다 체크 상자 + 점 + note', async () => {
    narrow();
    const onChange = vi.fn();
    render(<MultiSelect options={PROJECTS} label="프로젝트" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '프로젝트 전체' }));
    const sheet = await screen.findByRole('dialog', { name: '프로젝트' });
    const crm = within(sheet).getByRole('checkbox', { name: /CRM 이전/ });
    expect(markIn(crm)).toHaveAttribute('data-tone', 'series-2');
    expect(crm).toHaveTextContent('사용 중');
    fireEvent.click(crm);
    expect(onChange).toHaveBeenLastCalledWith(['crm']);
  });
});
