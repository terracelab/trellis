// 에이전트 대화 묶음(PG-30 · PG-31 · PG-32): 실행 상태 어휘(D-116) · 답변 본문 해석기 · 단계 요약 · 출처 번호
import { describe, expect, it } from 'vitest';
import { STATES } from '../src/_base.js';
import { MESSAGES } from '../src/_shared/messages.js';
import {
  parseInline,
  parseRichText,
  richInlineText,
  safeHref,
  type RichBlock,
} from '../src/_shared/richtext.js';
import { AGENT_RUN_STATES, JOB_STATES } from '../src/_shared/vocab.js';
import { citationIndex } from '../src/Citation/Citation.contract.js';
import { runStepsState } from '../src/RunSteps/RunSteps.contract.js';

describe('AGENT_RUN_STATES(D-116)', () => {
  it('6개 고정: 이름 · 순서 · 라벨 · 색조', () => {
    expect(AGENT_RUN_STATES).toEqual({
      queued: { label: '대기', tone: 'neutral' },
      running: { label: '실행 중', tone: 'info' },
      waiting: { label: '확인 대기', tone: 'warning' },
      succeeded: { label: '완료', tone: 'success' },
      failed: { label: '실패', tone: 'danger' },
      canceled: { label: '중단', tone: 'neutral' },
    });
    expect(Object.keys(AGENT_RUN_STATES)).toEqual([
      'queued',
      'running',
      'waiting',
      'succeeded',
      'failed',
      'canceled',
    ]);
  });

  it('배치 상태와 겹치는 이름은 JOB_STATES와 같다(queued · running · succeeded · failed)', () => {
    for (const name of ['queued', 'running', 'succeeded', 'failed'])
      expect(Object.keys(JOB_STATES)).toContain(name);
  });

  it('컴포넌트 상태 7어휘와 겹치지 않는다(쓰는 중은 loading, 실패 표시는 error)', () => {
    for (const name of Object.keys(AGENT_RUN_STATES))
      expect(STATES as readonly string[]).not.toContain(name);
  });

  it('화면 글자(messages ko)가 어휘 라벨과 같고 en에도 있다', () => {
    for (const [name, entry] of Object.entries(AGENT_RUN_STATES)) {
      const key = `agentRun.${name}` as keyof typeof MESSAGES.ko;
      expect(MESSAGES.ko[key]).toBe(entry.label);
      expect(MESSAGES.en[key]).toBeTruthy();
    }
  });
});

describe('runStepsState', () => {
  it('실패 → 중단 → 확인 대기 → 실행 중 → 대기 → 완료', () => {
    const s = (...states: (keyof typeof AGENT_RUN_STATES)[]) => states.map((state) => ({ state }));
    expect(runStepsState(s('succeeded', 'failed', 'waiting'))).toBe('failed');
    expect(runStepsState(s('succeeded', 'canceled', 'queued'))).toBe('canceled');
    expect(runStepsState(s('succeeded', 'waiting', 'running'))).toBe('waiting');
    expect(runStepsState(s('succeeded', 'running', 'queued'))).toBe('running');
    expect(runStepsState(s('succeeded', 'queued'))).toBe('running');
    expect(runStepsState(s('queued', 'queued'))).toBe('queued');
    expect(runStepsState(s('succeeded', 'succeeded'))).toBe('succeeded');
    expect(runStepsState([])).toBe('succeeded');
  });
});

describe('citationIndex', () => {
  it('index가 없으면 목록 순서(1부터)', () => {
    expect(citationIndex({ title: 'A' }, 0)).toBe(1);
    expect(citationIndex({ title: 'B', index: 7 }, 1)).toBe(7);
  });
});

describe('parseRichText', () => {
  const types = (blocks: RichBlock[]) => blocks.map((b) => b.type);

  it('제목 · 문단 · 줄바꿈 · 구분선. 제목 단계는 글 안 가장 높은 것이 1', () => {
    const blocks = parseRichText('### 결과\n첫 줄\n둘째 줄\n\n#### 세부\n---\n끝');
    expect(types(blocks)).toEqual(['heading', 'paragraph', 'heading', 'rule', 'paragraph']);
    expect(blocks[0]).toMatchObject({ type: 'heading', depth: 1 });
    expect(blocks[2]).toMatchObject({ type: 'heading', depth: 2 });
    expect(blocks[1]).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', text: '첫 줄' },
        { type: 'break' },
        { type: 'text', text: '둘째 줄' },
      ],
    });
  });

  it('목록: 빈 줄 없이 문단 다음에 와도 목록, 들여 쓰면 안쪽 목록, 번호 시작값', () => {
    const blocks = parseRichText(
      '확인할 것입니다.\n3. 미지급금\n   - 사업자번호 없음\n4. 가지급금\n\n- 다른 목록',
    );
    expect(types(blocks)).toEqual(['paragraph', 'list', 'list']);
    const ol = blocks[1] as Extract<RichBlock, { type: 'list' }>;
    expect(ol).toMatchObject({ ordered: true, start: 3 });
    expect(ol.items).toHaveLength(2);
    expect(ol.items[0]!.lists[0]).toMatchObject({ ordered: false });
    expect(richInlineText(ol.items[0]!.lists[0]!.items[0]!.children)).toBe('사업자번호 없음');
    expect(blocks[2]).toMatchObject({ ordered: false });
  });

  it('연도로 시작하는 문장은 번호 목록이 아니다', () => {
    expect(types(parseRichText('2026. 11월 결산입니다'))).toEqual(['paragraph']);
  });

  it('표: 정렬은 구분 줄, 정하지 않은 숫자 열은 right, 빈 칸 · – 는 숫자 판단에서 뺀다', () => {
    const [table] = parseRichText(
      [
        '| 거래처 | 건수 | 금액 | 비율 | 메모 |',
        '|:---|---|---|:---:|---|',
        '| 한빛식품 | 3건 | 12,480,000 | 12.3% | 2026-11-10 |',
        '| 동해수산 | – | −3,215,500원 | 0.3%p | |',
        '| **합계** | **3건** | **9,264,500** | | |',
      ].join('\n'),
    );
    expect(table).toMatchObject({
      type: 'table',
      align: ['left', 'right', 'right', 'center', 'left'],
      numeric: [false, true, true, true, false],
    });
    const t = table as Extract<RichBlock, { type: 'table' }>;
    expect(t.rows).toHaveLength(3);
    expect(t.head.map(richInlineText)).toEqual(['거래처', '건수', '금액', '비율', '메모']);
  });

  it('구분 줄이 덜 왔으면(쓰는 중) 표가 아니라 문단', () => {
    expect(types(parseRichText('| 거래처 | 금액 |\n|---'))).toEqual(['paragraph']);
  });

  it('코드 블록: 언어 · 내용 그대로. 안의 # · - 는 해석하지 않는다', () => {
    expect(parseRichText('```sql\n# 주석\n- 1\n```\n끝')).toEqual([
      { type: 'code', lang: 'sql', text: '# 주석\n- 1' },
      { type: 'paragraph', children: [{ type: 'text', text: '끝' }] },
    ]);
  });

  it('닫히지 않은 코드 블록(쓰는 중)은 그 줄부터 끝까지 꾸밈 없는 글자', () => {
    expect(parseRichText('조건입니다.\n\n```\n기간: 11월\n## 제목 아님')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: '조건입니다.' }] },
      { type: 'plain', text: '```\n기간: 11월\n## 제목 아님' },
    ]);
  });

  it('같은 글에는 같은 결과(글자가 붙어도 앞 블록은 그대로)', () => {
    const a = parseRichText('## 결과\n- 하나\n');
    const b = parseRichText('## 결과\n- 하나\n\n두');
    expect(b.slice(0, 2)).toEqual(a);
  });
});

describe('parseInline', () => {
  it('굵게 · 인라인 코드 · 링크 · 출처 · 자동 링크', () => {
    expect(
      parseInline('**3건** `EX-1` [규정](https://a.example/r) 근거[1][^2] https://b.example/x.'),
    ).toEqual([
      { type: 'strong', children: [{ type: 'text', text: '3건' }] },
      { type: 'text', text: ' ' },
      { type: 'code', text: 'EX-1' },
      { type: 'text', text: ' ' },
      { type: 'link', href: 'https://a.example/r', children: [{ type: 'text', text: '규정' }] },
      { type: 'text', text: ' 근거' },
      { type: 'cite', index: 1 },
      { type: 'cite', index: 2 },
      { type: 'text', text: ' ' },
      {
        type: 'link',
        href: 'https://b.example/x',
        children: [{ type: 'text', text: 'https://b.example/x' }],
      },
      { type: 'text', text: '.' },
    ]);
  });

  it('닫히지 않은 ** · ` · [ 는 글자 그대로(쓰는 중)', () => {
    expect(richInlineText(parseInline('지급 예정일이 **11월'))).toBe('지급 예정일이 **11월');
    expect(parseInline('`EX-26')).toEqual([{ type: 'text', text: '`EX-26' }]);
    expect(parseInline('[규정](https://a.ex')).toEqual([
      { type: 'text', text: '[규정](https://a.ex' },
    ]);
  });

  it('열면 안 되는 주소는 링크가 되지 않고 글자만 남는다', () => {
    expect(parseInline('[누르기](javascript:alert(1))')).toEqual([
      { type: 'text', text: '누르기)' },
    ]);
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html,x')).toBeNull();
    expect(safeHref('//evil.example')).toBeNull();
    expect(safeHref('/erp/accounting/voucher')).toBe('/erp/accounting/voucher');
    expect(safeHref('mailto:a@b.example')).toBe('mailto:a@b.example');
  });

  it('역슬래시로 막은 글자는 서식이 아니다', () => {
    expect(parseInline('\\*\\*굵게 아님\\*\\*')).toEqual([{ type: 'text', text: '**굵게 아님**' }]);
  });
});
