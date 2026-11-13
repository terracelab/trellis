// 에이전트 대화 부품(PG-31 · PG-32): RichText · Citation · SuggestionChips · RunSteps · ProposalCard,
// MessageThread 답변 모양 · 동작 줄, Composer 추천 질문, CommandPalette가 SuggestionChips를 같이 쓰는 것
import {
  CitationContract,
  ProposalCardContract,
  RichTextContract,
  RunStepsContract,
  SuggestionChipsContract,
  type CitationProps,
  type ProposalCardProps,
  type RichTextProps,
  type RunStepsProps,
  type SuggestionChipsProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Citation,
  CommandPalette,
  Composer,
  formatRunDuration,
  MessageThread,
  ProposalCard,
  RichText,
  RunSteps,
  SuggestionChips,
  TrellisProvider,
  type MessageThreadWebItem,
  type RunStepWeb,
} from '../src/core/index.js';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const flush = () => act(async () => {});

describe('contract parity', () => {
  const PAIRS: [{ displayName?: string }, { name: string; props: object; platforms: object }][] = [
    [RichText, RichTextContract],
    [Citation, CitationContract],
    [SuggestionChips, SuggestionChipsContract],
    [RunSteps, RunStepsContract],
    [ProposalCard, ProposalCardContract],
  ];

  it('displayName === contract.name, props에 id · testID, 네이티브도 같은 props', () => {
    for (const [component, contract] of PAIRS) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
      expect(contract.platforms).toEqual({ web: true, native: true });
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<RichTextProps>().toMatchTypeOf<ComponentProps<typeof RichText>>();
    expectTypeOf<CitationProps>().toMatchTypeOf<ComponentProps<typeof Citation>>();
    expectTypeOf<SuggestionChipsProps>().toMatchTypeOf<ComponentProps<typeof SuggestionChips>>();
    expectTypeOf<Omit<RunStepsProps, 'steps'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof RunSteps>, 'steps'>
    >();
    expectTypeOf<Omit<ProposalCardProps, 'children'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof ProposalCard>, 'children'>
    >();
  });

  it('values가 있는 prop은 값마다 data-<prop>가 붙는다', () => {
    for (const layout of ['list', 'inline'] as const) {
      const { container, unmount } = render(
        <Citation layout={layout} sources={[{ title: '규정', href: 'https://a.example' }]} />,
      );
      expect(container.querySelector('.tl-citation')).toHaveAttribute('data-layout', layout);
      unmount();
    }
    for (const status of ['waiting', 'approved', 'rejected'] as const) {
      const { container, unmount } = render(
        <ProposalCard title="단가 변경" changes={[]} status={status} />,
      );
      expect(container.querySelector('.tl-proposal-card')).toHaveAttribute('data-status', status);
      unmount();
    }
  });
});

describe('RichText', () => {
  it('제목은 가장 높은 것이 headingLevel, 목록 · 굵게 · 인라인 코드', () => {
    const { container } = render(
      <RichText
        text={
          '### 결과\n미결 전표 **7건** `EX-1`\n\n#### 세부\n1. 미지급금\n   - 사업자번호 없음\n2. 가지급금'
        }
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: '결과' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: '세부' })).toBeInTheDocument();
    expect(container.querySelector('strong')).toHaveTextContent('7건');
    expect(container.querySelector('code')).toHaveTextContent('EX-1');
    const ol = container.querySelector('ol')!;
    expect(within(ol).getAllByRole('listitem')).toHaveLength(3);
    expect(ol.querySelector('ul')).toHaveTextContent('사업자번호 없음');
  });

  it('headingLevel을 바꾸면 그 단계부터', () => {
    render(<RichText headingLevel={2} text="# 요약" />);
    expect(screen.getByRole('heading', { level: 2, name: '요약' })).toBeInTheDocument();
  });

  it('표: 숫자 열은 오른쪽 정렬 · tabular, 머리는 열 머리 칸, 넓으면 포커스로 스크롤', () => {
    render(
      <RichText
        text={
          '| 거래처 | 미지급금 | 지급 예정일 |\n|---|---|---|\n| 한빛식품 | 12,480,000 | 2026-11-10 |\n| 동해수산 | 3,215,500 | 2026-11-15 |'
        }
      />,
    );
    const table = screen.getByRole('table');
    const heads = within(table).getAllByRole('columnheader');
    expect(heads.map((h) => h.textContent)).toEqual(['거래처', '미지급금', '지급 예정일']);
    expect(heads[1]).toHaveAttribute('data-align', 'right');
    const cell = within(table).getByRole('cell', { name: '12,480,000' });
    expect(cell).toHaveAttribute('data-align', 'right');
    expect(cell).toHaveAttribute('data-numeric');
    expect(within(table).getByRole('cell', { name: '2026-11-10' })).toHaveAttribute(
      'data-align',
      'left',
    );
    expect(screen.getByRole('group', { name: '표' })).toHaveAttribute('tabindex', '0');
  });

  it('링크: http(s)는 새 창, 앱 안 경로는 같은 창, 열면 안 되는 주소는 글자만', () => {
    render(
      <RichText text="[규정](https://a.example/r) · [전표](/erp/voucher) · [위험](javascript:alert(1))" />,
    );
    expect(screen.getByRole('link', { name: '규정' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: '규정' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link', { name: '전표' })).not.toHaveAttribute('target');
    expect(screen.queryByRole('link', { name: '위험' })).toBeNull();
    expect(screen.getByText(/위험/)).toBeInTheDocument();
  });

  it('onLinkPress가 있으면 앱이 연다(기본 이동을 막는다)', () => {
    const onLinkPress = vi.fn();
    render(<RichText text="[전표 입력](/erp/voucher)" onLinkPress={onLinkPress} />);
    const event = fireEvent.click(screen.getByRole('link', { name: '전표 입력' }));
    expect(onLinkPress).toHaveBeenCalledWith('/erp/voucher');
    expect(event).toBe(false);
  });

  it('쓰는 중: 끝에 커서 · aria-busy · data-state=loading. 닫히지 않은 코드 블록은 꾸밈 없는 글자', () => {
    const { container } = render(
      <RichText streaming text={'조건입니다.\n\n```\n기간: 11월\n## 제목 아님'} />,
    );
    const root = container.querySelector('.tl-rich-text')!;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('data-state', 'loading');
    expect(container.querySelector('pre')).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
    const plain = container.querySelector('.tl-rich-text__plain')!;
    expect(plain.textContent).toContain('## 제목 아님');
    expect(plain.querySelector('.tl-rich-text__caret')).not.toBeNull();
  });

  it('쓰는 중이고 아직 글이 없으면 커서와 숨은 글자만, 다 쓰면 커서가 사라진다', () => {
    const { container, rerender } = render(<RichText streaming text="" />);
    expect(container.querySelector('.tl-rich-text__caret')).not.toBeNull();
    expect(screen.getByText('답변을 쓰는 중')).toHaveClass('tl-sr-only');
    rerender(<RichText text="끝났습니다" />);
    expect(container.querySelector('.tl-rich-text__caret')).toBeNull();
    expect(container.querySelector('.tl-rich-text')).not.toHaveAttribute('aria-busy');
  });

  it('출처: 본문 [1]이 출처 표시가 되고, 없는 번호는 글자 그대로', () => {
    const onCitationOpen = vi.fn();
    render(
      <RichText
        text="근거입니다[1]. 다른 근거[3]."
        citations={[{ title: '취업규칙', location: '제32조' }]}
        onCitationOpen={onCitationOpen}
      />,
    );
    const marker = screen.getByRole('button', { name: '출처 1 · 취업규칙 · 제32조' });
    fireEvent.click(marker);
    expect(onCitationOpen).toHaveBeenCalledWith({ title: '취업규칙', location: '제32조' });
    expect(screen.getByText(/다른 근거\[3\]/)).toBeInTheDocument();
  });

  it('영어 locale: 숨은 글자가 바뀐다', () => {
    render(
      <TrellisProvider locale="en">
        <RichText streaming text="" />
      </TrellisProvider>,
    );
    expect(screen.getByText('Writing the answer')).toBeInTheDocument();
  });
});

describe('Citation', () => {
  const SOURCES = [
    { title: '2026 취업규칙', location: '제32조', href: 'https://a.example/rules' },
    { title: '연차 기준' },
  ];

  it('목록: 이름 붙은 번호 목록, href는 새 창 링크, 주소도 onOpen도 없으면 글자', () => {
    render(<Citation sources={SOURCES} />);
    const list = screen.getByRole('list', { name: '출처' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    const link = within(items[0]!).getByRole('link');
    expect(link).toHaveAttribute('href', 'https://a.example/rules');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveTextContent('12026 취업규칙제32조');
    expect(within(items[1]!).queryByRole('link')).toBeNull();
    expect(within(items[1]!).queryByRole('button')).toBeNull();
  });

  it('onOpen이 있으면 href보다 먼저(링크는 남기고 앱이 연다), 주소가 없으면 단추', () => {
    const onOpen = vi.fn();
    render(<Citation sources={SOURCES} onOpen={onOpen} />);
    const event = fireEvent.click(screen.getByRole('link'));
    expect(event).toBe(false);
    expect(onOpen).toHaveBeenLastCalledWith(SOURCES[0]);
    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenLastCalledWith(SOURCES[1]);
  });

  it('index가 있으면 그 번호, 글 안 번호의 접근성 이름은 번호 · 문서 · 쪽', () => {
    render(<Citation layout="inline" sources={[{ ...SOURCES[0]!, index: 4 }]} />);
    const marker = screen.getByRole('link', { name: '출처 4 · 2026 취업규칙 · 제32조' });
    expect(marker).toHaveTextContent('4');
  });

  it('출처가 없으면 목록을 그리지 않는다', () => {
    const { container } = render(<Citation sources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('SuggestionChips', () => {
  it('묶음 이름 · 고르기 · selected면 같은 글(띄어쓰기 무시)이 눌린 모양 · 비활성', () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <SuggestionChips items={['11월 미지급금', '입고 예정']} onSelect={onSelect} />,
    );
    const group = screen.getByRole('group', { name: '추천 질문' });
    const chip = within(group).getByRole('button', { name: '입고 예정' });
    expect(chip).not.toHaveAttribute('aria-pressed');
    fireEvent.click(chip);
    expect(onSelect).toHaveBeenCalledWith('입고 예정');
    rerender(
      <SuggestionChips
        items={['11월 미지급금', '입고 예정']}
        selected="입고예정"
        onSelect={onSelect}
        disabled
      />,
    );
    expect(screen.getByRole('button', { name: '입고 예정' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '11월 미지급금' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: '입고 예정' })).toBeDisabled();
  });

  it('항목이 없으면 그리지 않는다', () => {
    const { container } = render(<SuggestionChips items={[]} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('Composer suggestions: 누르면 입력 칸에 넣고 포커스, 보내지는 않는다', () => {
    const onSend = vi.fn();
    render(<Composer label="질문" suggestions={['이번 주 입고 예정']} onSend={onSend} />);
    fireEvent.click(screen.getByRole('button', { name: '이번 주 입고 예정' }));
    const input = screen.getByRole('textbox', { name: '질문' });
    expect(input).toHaveValue('이번 주 입고 예정');
    expect(document.activeElement).toBe(input);
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('이번 주 입고 예정', []);
  });

  it('Composer가 비활성이면 추천 질문도 꺼진다', () => {
    render(<Composer label="질문" disabled suggestions={['입고 예정']} onSend={() => {}} />);
    expect(screen.getByRole('button', { name: '입고 예정' })).toBeDisabled();
  });

  it('CommandPalette 빠른 질문이 같은 부품이다(API 그대로)', () => {
    const { container } = render(
      <CommandPalette inline groups={[]} suggestions={['급여명세서']} defaultQuery="급여명세서" />,
    );
    const group = screen.getByRole('group', { name: '자주 찾는 것' });
    expect(group).toHaveClass('tl-suggestion-chips', 'tl-command-palette__suggestions');
    expect(within(group).getByRole('button', { name: '급여명세서' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(container.querySelector('.tl-suggestion-chips__chip')).not.toBeNull();
  });
});

describe('RunSteps', () => {
  const ALL: RunStepWeb[] = [
    { id: 's1', name: '전표 조회', state: 'succeeded', durationMs: 1240 },
    {
      id: 's2',
      name: '원장 대사',
      state: 'failed',
      durationMs: 3800,
      detail: '원장이 마감되지 않았습니다',
    },
    { id: 's3', name: '단가 변경 제안', state: 'waiting' },
    { id: 's4', name: '세금계산서 확인', state: 'running', durationMs: 65_400 },
    { id: 's5', name: '지급 예정표', state: 'queued' },
    { id: 's6', name: '결재 요청', state: 'canceled', detail: '사용자가 멈췄습니다' },
  ];

  it('실행 상태 6개가 점 색조 · 글자로 보인다(색만으로 말하지 않는다)', () => {
    const { container } = render(<RunSteps steps={ALL} />);
    const list = screen.getByRole('list', { name: '실행 단계' });
    const items = within(list).getAllByRole('listitem');
    expect(items.map((li) => li.getAttribute('data-run-state'))).toEqual([
      'succeeded',
      'failed',
      'waiting',
      'running',
      'queued',
      'canceled',
    ]);
    expect(items.map((li) => li.querySelector('.tl-run-steps__state')!.textContent)).toEqual([
      '완료',
      '실패',
      '확인 대기',
      '실행 중',
      '대기',
      '중단',
    ]);
    const tones = [...container.querySelectorAll('.tl-run-steps__step .tl-status-dot')].map((d) =>
      d.getAttribute('data-tone'),
    );
    expect(tones).toEqual(['success', 'danger', 'warning', 'info', 'neutral', 'neutral']);
    expect(container.querySelectorAll('[data-pulse]')).toHaveLength(1);
  });

  it('걸린 시간: 1.2초 · 12초 · 1분 5초', () => {
    const t = (key: string, vars?: Record<string, string | number>) =>
      key === 'runSteps.seconds'
        ? `${vars!['value']}초`
        : `${vars!['minutes']}분 ${vars!['seconds']}초`;
    expect(formatRunDuration(1240, t as never)).toBe('1.2초');
    expect(formatRunDuration(12_400, t as never)).toBe('12초');
    expect(formatRunDuration(65_400, t as never)).toBe('1분 5초');
    render(<RunSteps steps={ALL.slice(0, 1)} />);
    expect(screen.getByText('1.2초')).toBeInTheDocument();
  });

  it('상세가 있는 단계는 줄이 펼침 단추. 실패 단계는 처음부터 펼쳐 있다', () => {
    render(<RunSteps steps={ALL} />);
    const failed = screen.getByRole('button', { name: /원장 대사/ });
    expect(failed).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('원장이 마감되지 않았습니다')).toBeVisible();
    const canceled = screen.getByRole('button', { name: /결재 요청/ });
    expect(canceled).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(canceled);
    expect(canceled).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(canceled.getAttribute('aria-controls')!)).toBeVisible();
    expect(screen.queryByRole('button', { name: /전표 조회/ })).toBeNull();
  });

  it('collapsible: 요약 한 줄(전체 상태 · 단계 수 · 합계 시간), 끝난 실행은 접혀 있다', () => {
    render(
      <RunSteps
        collapsible
        steps={[
          { id: 'a', name: '규정 찾기', state: 'succeeded', durationMs: 800 },
          { id: 'b', name: '답변 작성', state: 'succeeded', durationMs: 4300 },
        ]}
      />,
    );
    const summary = screen.getByRole('button', { name: /실행 단계 2개/ });
    expect(summary).toHaveTextContent('완료');
    expect(summary).toHaveTextContent('5.1초');
    expect(summary).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('list')).toBeNull();
    fireEvent.click(summary);
    expect(screen.getByRole('list', { name: '실행 단계' })).toBeVisible();
  });

  it('collapsible: 실행 중 · 확인 대기 · 실패가 있으면 펼쳐서 시작한다', () => {
    render(<RunSteps collapsible steps={ALL} />);
    expect(screen.getByRole('button', { name: /실행 단계 6개/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: /실행 단계 6개/ })).toHaveTextContent('실패');
  });
});

describe('ProposalCard', () => {
  const CHANGES = [{ target: '가리비 관자 1KG', field: '단가', before: '17,000', after: '16,800' }];

  it('확인 대기: 제목 · 상태 배지 · 변경 표 · 반려 왼쪽 · 승인 오른쪽', () => {
    render(
      <ProposalCard title="한빛식품 단가 변경" summary="11월 견적 기준입니다." changes={CHANGES} />,
    );
    const card = screen.getByRole('article', { name: '한빛식품 단가 변경' });
    expect(within(card).getByRole('heading', { level: 2 })).toHaveTextContent('한빛식품 단가 변경');
    expect(within(card).getByText('확인 대기')).toHaveClass('tl-badge');
    expect(within(card).getByRole('table')).toHaveTextContent('16,800');
    const buttons = within(card).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['반려', '승인']);
  });

  it('키보드: 승인은 Tab으로 닿는 기본 단추이고, 누르면 결과 줄로 포커스가 옮겨 간다', async () => {
    const onApprove = vi.fn();
    render(
      <ProposalCard
        title="단가 변경"
        changes={CHANGES}
        onApprove={onApprove}
        resolvedBy="김테라 팀장"
      />,
    );
    const approve = screen.getByRole('button', { name: '승인' });
    expect(approve.tagName).toBe('BUTTON');
    expect(approve).not.toHaveAttribute('tabindex', '-1');
    approve.focus();
    expect(document.activeElement).toBe(approve);
    fireEvent.click(approve);
    await flush();
    expect(onApprove).toHaveBeenCalledTimes(1);
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-status', 'approved');
    expect(screen.queryByRole('button', { name: '승인' })).toBeNull();
    expect(within(card).getByText('승인했습니다')).toBeInTheDocument();
    expect(within(card).getByText('김테라 팀장')).toBeInTheDocument();
    await waitFor(() => expect(document.activeElement).toHaveClass('tl-proposal-card__result'));
  });

  it('승인이 Promise면 진행 중, 실패하면 오류 문구와 함께 확인 대기로 남는다', async () => {
    let fail: (e: Error) => void = () => {};
    const onApprove = () =>
      new Promise((_resolve, reject) => {
        fail = reject;
      });
    render(<ProposalCard title="단가 변경" changes={CHANGES} onApprove={onApprove} />);
    fireEvent.click(screen.getByRole('button', { name: '승인' }));
    await flush();
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-state', 'loading');
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: '반려' })).toBeDisabled();
    await act(async () => fail(new Error('403')));
    expect(card).toHaveAttribute('data-status', 'waiting');
    expect(card).toHaveAttribute('data-state', 'error');
    expect(screen.getByRole('alert')).toHaveTextContent('처리하지 못했습니다. 다시 시도하세요');
  });

  it('반려: 사유 창이 열리고 사유가 있어야 확인이 켜진다. Ctrl+Enter로 확인하면 사유가 결과에 남는다', async () => {
    const onReject = vi.fn();
    render(
      <ProposalCard
        title="한빛식품 단가 변경"
        changes={CHANGES}
        onReject={onReject}
        reasonMinLength={5}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '반려' }));
    await flush();
    const dialog = screen.getByRole('dialog', { name: '제안을 반려합니다' });
    expect(dialog).toHaveTextContent('한빛식품 단가 변경');
    const confirm = within(dialog).getByRole('button', { name: '반려' });
    expect(confirm).toBeDisabled();
    const reason = within(dialog).getByRole('textbox', { name: /반려 사유/ });
    fireEvent.change(reason, { target: { value: '견적' } });
    expect(confirm).toBeDisabled();
    expect(onReject).not.toHaveBeenCalled();
    fireEvent.change(reason, { target: { value: '  11월 견적서가 아직 없습니다  ' } });
    expect(confirm).toBeEnabled();
    await act(async () => {
      fireEvent.keyDown(reason, { key: 'Enter', ctrlKey: true });
    });
    expect(onReject).toHaveBeenCalledWith('11월 견적서가 아직 없습니다');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-status', 'rejected');
    expect(within(card).getByText('반려했습니다')).toBeInTheDocument();
    expect(card).toHaveTextContent('반려 사유11월 견적서가 아직 없습니다');
    expect(within(card).getByText('반려', { selector: '.tl-badge' })).toBeInTheDocument();
  });

  it('제어 모드: status를 주면 그대로, 비활성이면 단추가 꺼진다', () => {
    const { rerender } = render(
      <ProposalCard title="단가 변경" changes={CHANGES} status="waiting" disabled />,
    );
    expect(screen.getByRole('button', { name: '승인' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '반려' })).toBeDisabled();
    expect(screen.getByRole('article')).toHaveAttribute('data-state', 'disabled');
    rerender(
      <ProposalCard
        title="단가 변경"
        changes={CHANGES}
        status="rejected"
        reason="계약 조건과 다릅니다"
      />,
    );
    expect(screen.getByRole('article')).toHaveTextContent('반려 사유계약 조건과 다릅니다');
    // 바깥이 바꾼 상태에는 포커스를 옮기지 않는다
    expect(document.activeElement).toBe(document.body);
  });

  it('카드 안 제목 단계는 한 단계 아래(Card 문맥)', () => {
    render(<ProposalCard title="단가 변경" changes={CHANGES} headingLevel={3} />);
    expect(screen.getByRole('heading', { level: 3, name: '단가 변경' })).toBeInTheDocument();
  });
});

describe('MessageThread — 에이전트 답변', () => {
  const AGENT = { id: 'agent', name: '업무 도우미' };
  const ANSWER: MessageThreadWebItem = {
    id: 'a1',
    kind: 'answer',
    author: AGENT,
    at: '2026-11-06 10:20',
    text: '미지급금은 **3건**입니다[1].\n\n| 거래처 | 금액 |\n|---|---|\n| 한빛식품 | 12,480,000 |',
    citations: [{ title: '매입 세금계산서 목록', location: '11월' }],
    steps: <p>단계 자리</p>,
  };

  it('말풍선 없이 본문(RichText) · 실행 단계 자리 · 출처 목록 · 복사 단추', () => {
    const { container } = render(
      <MessageThread label="도우미 대화" messages={[ANSWER]} today="2026-11-06" />,
    );
    const answer = container.querySelector('[data-kind="answer"]')!;
    expect(answer.querySelector('.tl-message-thread__bubble')).toBeNull();
    expect(answer.querySelector('.tl-rich-text strong')).toHaveTextContent('3건');
    expect(within(answer as HTMLElement).getByRole('table')).toBeInTheDocument();
    expect(within(answer as HTMLElement).getByText('단계 자리')).toBeInTheDocument();
    expect(within(answer as HTMLElement).getByRole('list', { name: '출처' })).toBeInTheDocument();
    const actions = within(answer as HTMLElement).getByRole('group', { name: '답변 동작' });
    expect(
      within(actions)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual(['답변 복사']);
    expect(answer.querySelector('time')).toHaveTextContent('10:20');
  });

  it('복사: 글을 클립보드에 넣고 알린 뒤 onCopy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const onCopy = vi.fn();
    render(<MessageThread label="도우미 대화" messages={[ANSWER]} onCopy={onCopy} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '답변 복사' }));
    });
    expect(writeText).toHaveBeenCalledWith(ANSWER.text);
    expect(onCopy).toHaveBeenCalledWith('a1');
    expect(screen.getByRole('status')).toHaveTextContent('복사했습니다');
  });

  it('다시 생성 · 좋음 · 나쁨: 콜백이 있을 때만, 눌린 것을 다시 누르면 null', () => {
    const onRegenerate = vi.fn();
    const onFeedback = vi.fn();
    function Harness() {
      const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
      return (
        <MessageThread
          label="도우미 대화"
          messages={[{ ...ANSWER, ...(feedback ? { feedback } : {}) }]}
          onRegenerate={onRegenerate}
          onFeedback={(id, value) => {
            onFeedback(id, value);
            setFeedback(value);
          }}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '다시 생성' }));
    expect(onRegenerate).toHaveBeenCalledWith('a1');
    const good = screen.getByRole('button', { name: '좋음' });
    expect(good).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(good);
    expect(onFeedback).toHaveBeenLastCalledWith('a1', 'good');
    expect(screen.getByRole('button', { name: '좋음' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '좋음' }));
    expect(onFeedback).toHaveBeenLastCalledWith('a1', null);
    fireEvent.click(screen.getByRole('button', { name: '나쁨' }));
    expect(onFeedback).toHaveBeenLastCalledWith('a1', 'bad');
  });

  it('쓰는 중: 동작 줄 · 출처 목록을 숨기고 본문이 aria-busy', () => {
    const { container } = render(
      <MessageThread
        label="도우미 대화"
        onRegenerate={() => {}}
        messages={[{ ...ANSWER, streaming: true }]}
      />,
    );
    expect(container.querySelector('.tl-rich-text')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('group', { name: '답변 동작' })).toBeNull();
    expect(screen.queryByRole('list', { name: '출처' })).toBeNull();
    // 본문의 출처 번호는 쓰는 중에도 보인다
    expect(container.querySelector('.tl-citation[data-layout="inline"]')).toHaveTextContent('1');
  });

  it('답변 실패: 글자로 알리고 다시 생성만 남는다', () => {
    render(
      <MessageThread
        label="도우미 대화"
        onRegenerate={() => {}}
        onFeedback={() => {}}
        messages={[
          { id: 'a2', kind: 'answer', author: AGENT, at: '2026-11-06 10:21', status: 'failed' },
        ]}
      />,
    );
    expect(screen.getByText('답변하지 못했습니다')).toBeInTheDocument();
    const actions = screen.getByRole('group', { name: '답변 동작' });
    expect(
      within(actions)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual(['다시 생성']);
  });

  it('출처 열기: 본문 번호와 목록이 같은 콜백(메시지 id와 함께)', () => {
    const onCitationOpen = vi.fn();
    render(
      <MessageThread label="도우미 대화" messages={[ANSWER]} onCitationOpen={onCitationOpen} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '출처 1 · 매입 세금계산서 목록 · 11월' }));
    expect(onCitationOpen).toHaveBeenLastCalledWith('a1', ANSWER.citations![0]);
    const list = screen.getByRole('list', { name: '출처' });
    fireEvent.click(within(list).getByRole('button'));
    expect(onCitationOpen).toHaveBeenCalledTimes(2);
  });

  it('답변이 없는 대화는 지금 모양 그대로(상태 알림 자리도 없다)', () => {
    render(
      <MessageThread
        label="채널"
        messages={[{ id: 'm1', author: AGENT, at: '2026-11-06 10:20', text: '안녕하세요' }]}
      />,
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('안녕하세요')).toHaveClass('tl-message-thread__bubble');
  });
});
