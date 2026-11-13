// locale(D-65): TrellisProvider locale="en"이면 컴포넌트 문구가 영어, 없으면 한국어
import { MESSAGES, formatMessage, weekdayName } from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Badge,
  DataGrid,
  DateField,
  KpiCard,
  MultiSelect,
  Pagination,
  PeriodPicker,
  TrellisProvider,
} from '../src/core/index.js';

describe('사전', () => {
  it('ko · en 키가 같다', () => {
    expect(Object.keys(MESSAGES.en).sort()).toEqual(Object.keys(MESSAGES.ko).sort());
  });
  it('자리 표시를 채운다', () => {
    expect(formatMessage('ko', 'filterBar.showResults', { count: '837' })).toBe('837건 보기');
    expect(formatMessage('en', 'filterBar.showResults', { count: '837' })).toBe('Show 837 results');
  });
  it('요일', () => {
    expect(weekdayName('ko', 0)).toBe('일');
    expect(weekdayName('ko', 6, 'long')).toBe('토요일');
    expect(weekdayName('en', 1, 'long')).toBe('Monday');
  });
});

describe('TrellisProvider', () => {
  it('Provider가 없으면 한국어', () => {
    render(<Badge approval="approved" />);
    expect(screen.getByText('승인')).toBeInTheDocument();
  });

  it('locale="en"이면 영어 문구, html lang도 en', () => {
    render(
      <TrellisProvider locale="en">
        <Badge approval="withdrawn" />
        <DataGrid caption="Orders" columns={[{ key: 'no', header: 'No.' }]} rows={[]} rowKey="no" />
        <Pagination page={2} total={1284} pageSize={20} onPageChange={vi.fn()} />
        <MultiSelect
          label="Channel"
          options={[
            { value: 'a', label: 'Online store' },
            { value: 'b', label: 'Marketplace' },
          ]}
          defaultValue={['a', 'b']}
        />
      </TrellisProvider>,
    );
    expect(screen.getByText('Withdrawn')).toBeInTheDocument();
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Channel' })).toHaveTextContent('Online store +1');
    expect(document.documentElement.lang).toBe('en');
  });

  it('달력 · 기간 프리셋이 영어', async () => {
    render(
      <TrellisProvider locale="en">
        <PeriodPicker
          today="2026-11-07"
          defaultValue={{ from: '2026-11-01', to: '2026-11-30' }}
          label="Period"
        />
        <DateField label="Due" defaultValue="2026-11-07" today="2026-11-06" />
      </TrellisProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Period/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Choose a period' });
    expect(within(dialog).getByRole('button', { name: /^This month/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(dialog).getByLabelText('Start date')).toHaveValue('2026-11-01');
    expect(within(dialog).getByRole('grid')).toHaveAccessibleName('November 2026');
    // 11월 7일은 오늘(today), 12월 7일은 다음 달 칸
    expect(
      within(dialog).getAllByRole('button', { name: '7, Saturday, today, selected' }),
    ).toHaveLength(1);
    expect(within(dialog).getAllByRole('button', { name: '7, Monday' })).toHaveLength(1);
  });

  it('aria-label 단추는 두 언어 모두 보이는 글자를 이름 안에 그대로 갖는다(WCAG 2.5.3)', () => {
    // KpiCard 다시 시도: 보이는 글자는 common.retry, 이름은 kpiCard.retry(라벨을 붙여 카드끼리 구별)
    for (const locale of ['ko', 'en'] as const) {
      const { unmount } = render(
        <TrellisProvider locale={locale}>
          <KpiCard label="Sales" value={0} error onRetry={() => undefined} />
        </TrellisProvider>,
      );
      const button = screen.getByRole('button', {
        name: formatMessage(locale, 'kpiCard.retry', { label: 'Sales' }),
      });
      const visible = formatMessage(locale, 'common.retry');
      expect(button).toHaveTextContent(visible);
      expect(button.getAttribute('aria-label')).toContain(visible);
      unmount();
    }
  });
});

describe('TrellisProvider <html> 속성', () => {
  it('바깥 Provider만 html lang을 바꾸고, 내려가면 원래 값으로 돌린다', () => {
    document.documentElement.lang = 'ko';
    const { unmount } = render(
      <TrellisProvider locale="ko">
        <TrellisProvider locale="en">
          <span>안쪽</span>
        </TrellisProvider>
      </TrellisProvider>,
    );
    expect(document.documentElement.lang).toBe('ko');
    unmount();
    const solo = render(<TrellisProvider locale="en" theme="dark" />);
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    solo.unmount();
    expect(document.documentElement.lang).toBe('ko');
    expect(document.documentElement.dataset['theme']).toBeUndefined();
  });
});
