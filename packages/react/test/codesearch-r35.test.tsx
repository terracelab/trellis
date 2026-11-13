// R-35: CodeSearch 넓은 화면 팝업의 aria-hidden, 자유 입력 지우기, 시트 모드 FormSection 세기
import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUnhideOutside } from '../src/_internal/unhide-outside.js';
import { CodeSearch, Field, FormSection } from '../src/core/index.js';

const PARTIES = [
  { value: 'p1', label: '대양상사' },
  { value: 'p2', label: '한결물산' },
];

/** 좁은 화면(min-width 질의가 모두 거짓) */
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

const flush = () => act(async () => {});

describe('useUnhideOutside(R-35)', () => {
  it('열린 동안 새로 붙은 aria-hidden만 걷고, 원래 숨은 것은 둔다', async () => {
    const outside = document.createElement('div');
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    document.body.append(outside, icon);
    const { rerender, unmount } = renderHook(({ open }) => useUnhideOutside(open), {
      initialProps: { open: true },
    });
    outside.setAttribute('aria-hidden', 'true');
    icon.setAttribute('aria-hidden', 'true');
    await flush();
    expect(outside).not.toHaveAttribute('aria-hidden');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    // 닫히면 더는 건드리지 않는다
    rerender({ open: false });
    outside.setAttribute('aria-hidden', 'true');
    await flush();
    expect(outside).toHaveAttribute('aria-hidden', 'true');
    unmount();
    outside.remove();
    icon.remove();
  });
});

describe('CodeSearch 자유 입력 지우기(R-35)', () => {
  it('넓은 화면: 받은 글자에 지우기 단추, 누르면 칸을 비우고 빈 글자를 알린다', async () => {
    const onCustomValue = vi.fn();
    render(
      <Field label="거래처">
        <CodeSearch
          options={PARTIES}
          showCode={false}
          allowCustomValue
          onCustomValue={onCustomValue}
        />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: '거래처' });
    expect(screen.queryByRole('button', { name: '지우기' })).toBeNull();
    fireEvent.change(input, { target: { value: '동네 철물점' } });
    fireEvent.blur(input);
    expect(onCustomValue).toHaveBeenLastCalledWith('동네 철물점');
    expect(input).toHaveValue('동네 철물점');
    fireEvent.click(screen.getByRole('button', { name: '지우기' }));
    expect(onCustomValue).toHaveBeenLastCalledWith('');
    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: '지우기' })).toBeNull();
    await flush();
  });

  it('좁은 화면: 받은 글자를 지우면 빈 글자를 알린다', async () => {
    narrow();
    const onCustomValue = vi.fn();
    render(
      <CodeSearch
        label="거래처"
        options={PARTIES}
        showCode={false}
        allowCustomValue
        onCustomValue={onCustomValue}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /거래처/ }));
    const dialog = await screen.findByRole('dialog', { name: '거래처' });
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: '시장 식당' } });
    fireEvent.keyDown(within(dialog).getByRole('searchbox'), { key: 'Enter' });
    expect(onCustomValue).toHaveBeenLastCalledWith('시장 식당');
    fireEvent.click(screen.getByRole('button', { name: '지우기' }));
    expect(onCustomValue).toHaveBeenLastCalledWith('');
    await flush();
  });
});

describe('CodeSearch 시트 모드와 FormSection "입력 N개"(R-35)', () => {
  it('name이 없어도 고른 값을 센다(비제어)', async () => {
    narrow();
    render(
      <FormSection title="거래처 정보" collapsible defaultOpen>
        <Field label="거래처">
          <CodeSearch options={PARTIES} showCode={false} />
        </Field>
      </FormSection>,
    );
    fireEvent.click(screen.getByRole('button', { name: /^거래처 (?!정보)/ }));
    const dialog = await screen.findByRole('dialog', { name: '거래처' });
    fireEvent.click(within(dialog).getByRole('radio', { name: '한결물산' }));
    await flush();
    // 접으면 제목 옆에 센 수가 보인다
    fireEvent.click(screen.getByRole('button', { name: /거래처 정보/ }));
    expect(screen.getByText('입력 1개')).toBeInTheDocument();
  });
});
