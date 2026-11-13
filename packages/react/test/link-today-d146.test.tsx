// D-146 제안(R-43 2, a + c): 표 · 목록 안 링크는 본문 색, 오늘 표시는 중립색.
// 실제 색은 브라우저에서 잰다(VRT · 측정). 여기서는 규칙이 바뀌었는지 · plain variant가 있는지만 본다
import { LinkContract } from '@terracelab/trellis-contracts';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Link } from '../src';

const css = (file: string) => readFileSync(join(process.cwd(), 'src', file), 'utf8');
const rule = (source: string, selector: string) =>
  new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(
    source,
  )?.[1] ?? '';

describe('D-146 a: 표 · 목록 안 링크는 본문 색', () => {
  it('Link variant plain', () => {
    render(
      <Link href="#employees/E-0012" variant="plain">
        한서연
      </Link>,
    );
    expect(screen.getByRole('link', { name: '한서연' })).toHaveAttribute('data-variant', 'plain');
    expect(LinkContract.props.variant?.values).toContain('plain');
  });

  it('plain · 표 칸 · DescriptionList 안 default 링크는 fg.primary', () => {
    const link = css('Link/Link.css');
    expect(link).toMatch(
      /\.tl-link\[data-variant='plain'\],\s*:where\(\.tl-data-grid__cell, \.tl-data-grid__card, \.tl-description-list\)\s+\.tl-link\[data-variant='default'\] \{\s*color: var\(--tl-color-fg-primary\);/,
    );
    expect(rule(link, '.tl-link:focus-visible')).toContain('text-decoration-color: currentcolor');
  });

  it('DataGrid 링크 열 · 첨부 이름은 fg.link를 쓰지 않는다', () => {
    const grid = rule(css('DataGrid/DataGrid.css'), '.tl-data-grid__cell[data-link]');
    expect(grid).toContain('var(--tl-color-fg-primary)');
    expect(grid).not.toContain('fg-link');
    const attachment = rule(css('Attachment/Attachment.css'), '.tl-attachment__name[href]');
    expect(attachment).toContain('var(--tl-color-fg-primary)');
    expect(attachment).not.toContain('fg-link');
  });
});

describe('D-146 c: 오늘 표시는 중립색', () => {
  it('MonthCalendar 오늘 원 · 지금 선', () => {
    const month = css('MonthCalendar/MonthCalendar.css');
    const today = rule(month, '.tl-month-calendar__day[data-today] .tl-month-calendar__num');
    expect(today).toContain('var(--tl-color-fg-strong)');
    expect(today).toContain('var(--tl-color-fg-inverse)');
    expect(rule(month, '.tl-month-calendar__now')).toContain('var(--tl-color-fg-strong)');
    expect(rule(month, '.tl-month-calendar__now::before')).toContain('var(--tl-color-fg-strong)');
    expect(month).not.toMatch(/data-today\][^{]*\{[^}]*brand-default/);
  });

  it('TeamSchedule 오늘 날짜 · 열', () => {
    const team = css('TeamSchedule/TeamSchedule.css');
    const date = rule(team, '.tl-team-schedule__day[data-today] .tl-team-schedule__date');
    expect(date).toContain('var(--tl-color-fg-strong)');
    expect(date).not.toContain('brand');
    expect(rule(team, '.tl-team-schedule [data-today]:is(td, th)')).toContain(
      'var(--tl-team-schedule-today)',
    );
  });
});
