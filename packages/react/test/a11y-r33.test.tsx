// 접근성 묶음(R-33): Card 제목 단계 · 랜드마크, Dialog · Drawer Tab 순환
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, Card, Dialog, Drawer } from '../src/core/index.js';

describe('Card 제목 단계 · 랜드마크', () => {
  it('화면 바로 아래 카드는 h2, 카드 안 카드는 h3, headingLevel로 바꾼다', () => {
    render(
      <>
        <Card title="원천세 · 10월 귀속">
          <Card title="테라스랩">내용</Card>
        </Card>
        <Card title="벤처기업확인" headingLevel={3}>
          내용
        </Card>
      </>,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: '원천세 · 10월 귀속' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '테라스랩' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '벤처기업확인' })).toBeInTheDocument();
  });

  it('기본은 랜드마크가 아니고, landmark면 제목 이름의 region', () => {
    render(
      <>
        <Card title="벤처기업확인">A</Card>
        <Card title="벤처기업확인">B</Card>
        <Card title="이번 달 일정" landmark>
          C
        </Card>
      </>,
    );
    expect(screen.queryByRole('region', { name: '벤처기업확인' })).toBeNull();
    expect(screen.getByRole('region', { name: '이번 달 일정' })).toBeInTheDocument();
  });
});

describe('Dialog · Drawer Tab 순환', () => {
  it.each([
    [
      'Drawer',
      () => (
        <Drawer open title="직원 정보" footer={<Button variant="primary">수정</Button>}>
          <Button>첫 동작</Button>
        </Drawer>
      ),
    ],
    [
      'Dialog',
      () => (
        <Dialog open title="발행 확인" footer={<Button variant="primary">발행</Button>}>
          <Button>미리 보기</Button>
        </Dialog>
      ),
    ],
  ])('%s: 마지막 칸에서 Tab → 첫 칸, 첫 칸에서 Shift+Tab → 마지막 칸', async (_name, ui) => {
    render(ui());
    await act(async () => {});
    const buttons = screen.getAllByRole('button');
    const first = buttons[0]!;
    const last = buttons[buttons.length - 1]!;
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
