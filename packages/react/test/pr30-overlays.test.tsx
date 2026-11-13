// PR-30(component-parity §5): Drawer 이전 · 다음 · 아래 시트 · 안전 영역, PageHeader 뒤로 단추,
// BarList onBarPress · extremes, BulletBar targetLabel · showRatio
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { BarList, BulletBar } from '../src/charts/index.js';
import { Button, Dialog, Drawer, Input, PageHeader, Tabs } from '../src/core/index.js';

const css = (file: string) => readFileSync(join(process.cwd(), 'src', file), 'utf8');
const rule = (source: string, selector: string) =>
  new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(
    source,
  )?.[1] ?? '';

describe('Drawer 이전 · 다음', () => {
  it('머리에 이전 · 다음 단추를 두고 누르면 onPrev · onNext를 부른다', async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <Drawer open title="PO-2611-0042" onPrev={onPrev} onNext={onNext}>
        내용
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog', { name: 'PO-2611-0042' });
    const prev = within(dialog).getByRole('button', { name: '이전 건' });
    const next = within(dialog).getByRole('button', { name: '다음 건' });
    expect(prev).toHaveAttribute('aria-keyshortcuts', 'ArrowLeft');
    expect(next).toHaveAttribute('aria-keyshortcuts', 'ArrowRight');
    fireEvent.click(prev);
    fireEvent.click(next);
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('한쪽만 주면 다른 쪽 단추는 꺼지고 자리는 남는다 · 이름을 바꿀 수 있다', async () => {
    render(
      <Drawer open title="첫 건" onNext={() => {}} prevLabel="이전 발주" nextLabel="다음 발주">
        내용
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog', { name: '첫 건' });
    expect(within(dialog).getByRole('button', { name: '이전 발주' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: '다음 발주' })).toBeEnabled();
  });

  it('onPrev · onNext가 없으면 단추도 없다', async () => {
    render(
      <Drawer open title="상세">
        내용
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog', { name: '상세' });
    expect(dialog.querySelector('.tl-drawer__nav')).toBeNull();
  });

  it('← → 키가 이전 · 다음으로 가고, 입력 칸 · 방향키 위젯 · 수정 키에서는 무시한다', async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <Drawer open title="상세" onPrev={onPrev} onNext={onNext}>
        <Input aria-label="메모" />
        <textarea aria-label="비고" />
        <div contentEditable suppressContentEditableWarning data-testid="editor">
          글
        </div>
        <Tabs
          items={[
            { value: 'a', label: '품목' },
            { value: 'b', label: '이력' },
          ]}
        />
        <Button>인쇄</Button>
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog', { name: '상세' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(onNext).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole('button', { name: '인쇄' }), { key: 'ArrowLeft' });
    expect(onPrev).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('textbox', { name: '메모' }), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('textbox', { name: '비고' }), { key: 'ArrowRight' });
    const editor = screen.getByTestId('editor');
    // jsdom은 isContentEditable을 계산하지 않는다
    Object.defineProperty(editor, 'isContentEditable', { value: true });
    fireEvent.keyDown(editor, { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getAllByRole('tab')[0]!, { key: 'ArrowRight' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight', altKey: true });
    fireEvent.keyDown(dialog, { key: 'ArrowLeft', metaKey: true });
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('서랍 안에서 연 창(포털)의 ← →는 이전 · 다음으로 가지 않는다', async () => {
    const onNext = vi.fn();
    render(
      <Drawer open title="상세" onNext={onNext}>
        <Dialog open title="삭제 확인">
          <Button>삭제</Button>
        </Dialog>
      </Drawer>,
    );
    await screen.findByRole('dialog', { name: '삭제 확인' });
    fireEvent.keyDown(screen.getByRole('button', { name: '삭제' }), { key: 'ArrowRight' });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('한쪽 끝에서는 그쪽 키가 아무 일도 하지 않는다', async () => {
    const onNext = vi.fn();
    render(
      <Drawer open title="마지막 건" onPrev={undefined} onNext={onNext}>
        내용
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog', { name: '마지막 건' });
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(onNext).not.toHaveBeenCalled();
  });
});

describe('Drawer 아래 시트', () => {
  it('side bottom은 손잡이 · 손가락 크기 닫기 · 높이 auto/full을 가진 시트로 연다', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Drawer
        open
        side="bottom"
        title="입고 예정 3건"
        onOpenChange={onOpenChange}
        footer={<Button variant="primary">입고 처리</Button>}
        testID="sheet"
      >
        내용
      </Drawer>,
    );
    const sheet = await screen.findByTestId('sheet');
    expect(sheet).toHaveClass('tl-drawer');
    expect(sheet).toHaveAttribute('data-side', 'bottom');
    expect(sheet).toHaveAttribute('data-height', 'auto');
    expect(sheet).toHaveAttribute('aria-modal', 'true');
    expect(sheet.querySelector('.tl-drawer__handle')).toHaveAttribute('aria-hidden', 'true');
    expect(sheet.closest('.tl-drawer__viewport')).not.toBeNull();
    const close = within(sheet).getByRole('button', { name: '닫기' });
    expect(close).toHaveClass('tl-drawer__close');
    fireEvent.click(close);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(
      <Drawer open side="bottom" height="full" title="입고 예정 3건" testID="sheet">
        내용
      </Drawer>,
    );
    expect(screen.getByTestId('sheet')).toHaveAttribute('data-height', 'full');
  });

  it('아래 시트도 이전 · 다음 · ← →를 쓴다', async () => {
    const onNext = vi.fn();
    render(
      <Drawer open side="bottom" title="입고 예정" onNext={onNext}>
        내용
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog', { name: '입고 예정' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('CSS: 시트 머리 단추는 size.touch.min, footer · 마지막 body는 안전 영역만큼 띄운다', () => {
    const drawer = css('Drawer/Drawer.css');
    const touch = rule(
      drawer,
      ".tl-drawer[data-side='bottom'] .tl-drawer__nav .tl-icon-button,\n.tl-drawer[data-side='bottom'] .tl-drawer__close",
    );
    expect(touch).toContain('width: var(--tl-size-touch-min)');
    expect(touch).toContain('height: var(--tl-size-touch-min)');
    expect(rule(drawer, '.tl-drawer__footer')).toContain('env(safe-area-inset-bottom, 0)');
    expect(rule(drawer, '.tl-drawer__body:last-child')).toContain('env(safe-area-inset-bottom, 0)');
    expect(rule(drawer, ".tl-drawer[data-side='bottom'] .tl-drawer__footer")).toContain(
      'env(safe-area-inset-bottom, 0)',
    );
    expect(rule(drawer, ".tl-drawer[data-side='bottom']")).toContain(
      'translateY(var(--drawer-swipe-movement-y, 0))',
    );
  });
});

describe('안전 영역 · 휴대폰 뒤로 단추', () => {
  it('ActionBar sticky는 아래 여백에 안전 영역을 더한다', () => {
    expect(rule(css('ActionBar/ActionBar.css'), '.tl-action-bar[data-sticky]')).toContain(
      'calc(var(--tl-space-12) + env(safe-area-inset-bottom, 0))',
    );
  });

  it('PageHeader 뒤로 단추는 휴대폰 · touch에서 lg 손가락 크기', () => {
    const onBack = vi.fn();
    render(<PageHeader title="발주 상세" onBack={onBack} />);
    const back = screen.getByRole('button', { name: '뒤로' });
    expect(back).toHaveClass('tl-page-header__back');
    fireEvent.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
    const header = css('PageHeader/PageHeader.css');
    expect(rule(header, "[data-density='touch'] .tl-page-header")).toContain(
      'max(var(--tl-size-touch-min), var(--tl-density-control-height-lg))',
    );
    expect(rule(header, '.tl-page-header__back.tl-icon-button')).toContain(
      'var(--tl-page-header-back, var(--tl-density-control-height-md))',
    );
  });
});

describe('BarList extremes · onBarPress', () => {
  const DATA = [
    { label: '1주', value: 412 },
    { label: '2주', value: 388 },
    { label: '3주', value: 455 },
    { label: '4주', value: 301 },
  ];

  it('extremes면 최고 · 최저 막대에만 값 글자', async () => {
    const { container } = render(<BarList data={DATA} extremes ariaLabel="주별 출고" />);
    await waitFor(() => expect(container.querySelectorAll('.tl-bar-list__extreme').length).toBe(2));
    const labels = [...container.querySelectorAll('.tl-bar-list__extreme')];
    expect(labels.map((l) => [l.textContent, l.getAttribute('data-extreme')])).toEqual([
      ['455', 'high'],
      ['301', 'low'],
    ]);
  });

  it('onBarPress가 없으면 img, 막대 단추가 없다', async () => {
    const { container } = render(<BarList data={DATA} ariaLabel="주별 출고" />);
    expect(screen.getByRole('img', { name: '주별 출고' })).toHaveClass('tl-bar-list');
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(4),
    );
    expect(container.querySelector('.tl-bar-list__bar')).toBeNull();
  });

  it('onBarPress면 루트는 group, 막대는 Tab으로 닿는 단추(누르기 · Enter · Space)', async () => {
    const onBarPress = vi.fn();
    render(<BarList data={DATA} unit="건" onBarPress={onBarPress} ariaLabel="주별 출고" />);
    const group = screen.getByRole('group', { name: '주별 출고' });
    expect(screen.queryByRole('img', { name: '주별 출고' })).toBeNull();
    const bars = await within(group).findAllByRole('button');
    expect(bars).toHaveLength(4);
    expect(bars[0]).toHaveAttribute('tabindex', '0');
    expect(bars[2]).toHaveAccessibleName('3주 455건');
    fireEvent.click(bars[2]!);
    expect(onBarPress).toHaveBeenLastCalledWith(DATA[2]);
    act(() => bars[3]!.focus());
    fireEvent.keyDown(bars[3]!, { key: 'Enter' });
    expect(onBarPress).toHaveBeenLastCalledWith(DATA[3]);
    fireEvent.keyDown(bars[0]!, { key: ' ' });
    expect(onBarPress).toHaveBeenLastCalledWith(DATA[0]);
    fireEvent.keyDown(bars[0]!, { key: 'a' });
    expect(onBarPress).toHaveBeenCalledTimes(3);
  });
});

describe('BulletBar targetLabel · showRatio', () => {
  it('기본은 오른쪽에 비율(값 ÷ 목표)을 보이고 읽힌다', () => {
    const { container } = render(
      <BulletBar label="식자재" value={11_040_000} target={12_000_000} unit="원" />,
    );
    expect(container.querySelector('.tl-bullet-bar__ratio')).toHaveTextContent('92%');
    expect(screen.getByRole('meter', { name: '식자재' })).toHaveAttribute(
      'aria-valuetext',
      '11,040,000원, 목표 12,000,000원, 목표 대비 92%, 주의',
    );
  });

  it('showRatio false면 비율이 없다', () => {
    const { container } = render(
      <BulletBar label="소모품" value={61} target={100} unit="%" showRatio={false} />,
    );
    expect(container.querySelector('.tl-bullet-bar__ratio')).toBeNull();
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '61%, 목표 100%');
  });

  it('targetLabel이면 "/ 평균 9.1%"로 보이고 읽힌다. showState false면 칩 · 상태 색이 없다', () => {
    const { container } = render(
      <BulletBar
        label="강남점 반품률"
        value={16.5}
        target={9.1}
        unit="%"
        format={(v) => v.toFixed(1)}
        targetLabel="평균"
        showState={false}
        showRatio={false}
      />,
    );
    expect(container.querySelector('.tl-bullet-bar__target')).toHaveTextContent('/ 평균 9.1%');
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '16.5%, 평균 9.1%');
    expect(container.querySelector('.tl-bullet-bar__state')).toBeNull();
    expect((container.querySelector('.tl-bullet-bar__fill') as HTMLElement).style.background).toBe(
      'var(--tl-color-chart-series-1)',
    );
  });

  it('targetLabel과 비율을 같이 쓰면 "기준 대비"로 읽힌다', () => {
    render(<BulletBar label="판교점" value={18.2} target={9.1} unit="%" targetLabel="평균" />);
    expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toContain('평균 대비 200%');
  });
});
