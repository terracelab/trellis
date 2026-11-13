import { CommandPaletteContract, type CommandPaletteGroup } from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette, TrellisProvider } from '../src/core/index.js';

const GROUPS: CommandPaletteGroup[] = [
  {
    id: 'recent',
    label: '최근',
    items: [{ id: 'tx', label: '거래 내역', description: '카드 · 계좌', meta: '회계' }],
  },
  {
    id: 'screens',
    label: '화면',
    items: [
      { id: 'home', label: '홈' },
      { id: 'invoices', label: '매출 · 세금계산서', keywords: ['invoice'] },
      { id: 'audit', label: '감사 로그', disabled: true },
      { id: 'filings', label: '세무 신고', description: '부가세 · 원천세' },
    ],
  },
];

const input = () => screen.getByRole('combobox');
const activeLabel = () =>
  screen.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true')
    ?.textContent;

describe('CommandPalette', () => {
  it('displayName === contract.name, 웹 전용', () => {
    expect(CommandPalette.displayName).toBe(CommandPaletteContract.name);
    expect(CommandPaletteContract.platforms.native).toBe(false);
  });

  it('콤보박스 · listbox · 묶음 이름 · 첫 결과가 지금 결과', () => {
    render(<CommandPalette inline groups={GROUPS} />);
    const box = input();
    const list = screen.getByRole('listbox');
    expect(box).toHaveAttribute('aria-controls', list.id);
    expect(box).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: '화면' })).toBeInTheDocument();
    const first = screen.getAllByRole('option')[0]!;
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(box).toHaveAttribute('aria-activedescendant', first.id);
  });

  it('화살표는 비활성 결과를 건너뛰고 끝에서 처음으로 돈다 · Tab은 다음 묶음', () => {
    render(<CommandPalette inline groups={GROUPS} />);
    const box = input();
    fireEvent.keyDown(box, { key: 'ArrowUp' });
    expect(activeLabel()).toContain('세무 신고');
    fireEvent.keyDown(box, { key: 'ArrowUp' });
    expect(activeLabel()).toContain('매출 · 세금계산서'); // 감사 로그(비활성)를 건너뜀
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(activeLabel()).toContain('거래 내역');
    fireEvent.keyDown(box, { key: 'Tab' });
    expect(activeLabel()).toContain('홈');
    fireEvent.keyDown(box, { key: 'Tab', shiftKey: true });
    expect(activeLabel()).toContain('거래 내역');
  });

  it('글자로 이름 · 설명 · keywords를 거르고(띄어쓰기 무시) 빈 묶음은 숨긴다', () => {
    render(<CommandPalette inline groups={GROUPS} />);
    fireEvent.change(input(), { target: { value: '부가 세' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.queryByRole('group', { name: '최근' })).toBeNull();
    fireEvent.change(input(), { target: { value: 'INVOICE' } });
    expect(activeLabel()).toContain('매출 · 세금계산서');
    expect(screen.getByRole('status')).toHaveTextContent('결과 1건');
  });

  it('filter=false면 앱이 준 그대로 보인다', () => {
    render(<CommandPalette inline groups={GROUPS} filter={false} defaultQuery="없는 글자" />);
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('Enter · 누르기는 onSelect(item, group), 비활성은 고르지 않는다', () => {
    const onSelect = vi.fn();
    render(<CommandPalette inline groups={GROUPS} onSelect={onSelect} />);
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'tx' }),
      expect.objectContaining({ id: 'recent' }),
    );
    fireEvent.click(screen.getByRole('option', { name: /감사 로그/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('option', { name: /세무 신고/ }));
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'filings' }),
      expect.objectContaining({ id: 'screens' }),
    );
  });

  it('한글 조합 중 Enter는 고르지 않는다', () => {
    const onSelect = vi.fn();
    render(<CommandPalette inline groups={GROUPS} onSelect={onSelect} />);
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('빠른 질문은 글자를 채우고(onQueryChange) 결과가 없으면 empty', () => {
    const onQueryChange = vi.fn();
    render(
      <CommandPalette
        inline
        groups={GROUPS}
        suggestions={['급여명세서']}
        onQueryChange={onQueryChange}
        empty="찾는 화면이 없습니다"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '급여명세서' }));
    expect(onQueryChange).toHaveBeenCalledWith('급여명세서');
    expect(input()).toHaveValue('급여명세서');
    expect(screen.getByText('찾는 화면이 없습니다')).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('대화상자: 제목 줄 없이 이름만, 고르면 닫힌다', async () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette open groups={GROUPS} onOpenChange={onOpenChange} />);
    const dialog = await screen.findByRole('dialog', { name: '검색 · 이동' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('heading')).toHaveClass('tl-sr-only');
    await act(async () => {
      fireEvent.keyDown(within(dialog).getByRole('combobox'), { key: 'Enter' });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('영어 사전', () => {
    render(
      <TrellisProvider locale="en">
        <CommandPalette inline groups={[]} />
      </TrellisProvider>,
    );
    expect(input()).toHaveAttribute('placeholder', 'Find a screen or a task');
    expect(screen.getByText('Nothing matches')).toBeInTheDocument();
  });
});
