import { useState } from 'react';
import { RunSteps } from '../RunSteps/RunSteps.js';
import { MessageThread, type MessageThreadWebItem } from './MessageThread.js';

const JUNG = { id: 'u05', name: '정우진 주임', meta: '물류팀' };
const MOON = { id: 'u04', name: '문채원 주임', meta: '구매팀' };

const CHANNEL: MessageThreadWebItem[] = [
  {
    id: 'c1',
    author: MOON,
    at: '2026-11-05 16:42',
    text: 'PO-2611-0043 견적 받았습니다. 단가 USD 17.00으로 전월보다 0.20 내려왔습니다.',
  },
  {
    id: 'c2',
    author: JUNG,
    at: '2026-11-05 17:05',
    text: '12월 첫 주 평택 냉동센터 랙 여유 확인했습니다. 1,000KG 들어갑니다.',
  },
  { id: 'c3', kind: 'system', at: '2026-11-06 09:30', text: '김테라 팀장이 대화에 들어왔습니다' },
  {
    id: 'c4',
    author: JUNG,
    at: '2026-11-06 09:42',
    text: '평택 냉동센터에 가리비 관자 도착했습니다. 검수 시작합니다.',
  },
  {
    id: 'c5',
    author: JUNG,
    at: '2026-11-06 10:05',
    text: '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다.',
    files: [
      { name: '파손-박스-01.jpg', size: 1_929_216 },
      { name: '거래명세서-HK1101.pdf', size: 182_272 },
    ],
  },
  {
    id: 'c6',
    author: { id: 'me', name: '김테라 팀장' },
    own: true,
    at: '2026-11-06 10:12',
    text: '확인했습니다. 공급사에 클레임 메일 보내겠습니다.',
    unread: 0,
  },
  {
    id: 'c7',
    author: { id: 'me', name: '김테라 팀장' },
    own: true,
    at: '2026-11-06 10:13',
    text: '수량 차이는 입고 확정 때 반영해 주세요.\n검수 사진은 결재 문서에 붙여 두겠습니다.',
    unread: 2,
  },
];

/** 대화 — 날짜와 보낸 사람으로 묶는다. 다른 사람은 왼쪽에 이름과 함께, 내 메시지는 오른쪽에 읽음 · 안 읽은 수와 함께 보인다 */
export function Conversation() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <MessageThread
        label="구매 · 물류 채널 메시지"
        messages={CHANNEL}
        today="2026-11-06"
        unreadFrom="c4"
      />
    </div>
  );
}

const OLDER: MessageThreadWebItem[] = [
  {
    id: 'o1',
    author: MOON,
    at: '2026-11-04 15:10',
    text: '다음 주 입고 일정표 공유합니다.',
    files: [{ name: '11월 2주 입고 일정.xlsx', size: 48_128 }],
  },
  { id: 'o2', author: JUNG, at: '2026-11-04 15:22', text: '받았습니다. 랙 배치 다시 보겠습니다.' },
];

/** 이전 메시지 — 맨 위 단추로 더 불러온다. 부모 높이를 채우면 안에서 스크롤하고 보던 자리를 지킨다 */
export function LoadOlder() {
  const [messages, setMessages] = useState(CHANNEL.slice(3));
  const hasOlder = messages[0]?.id !== 'o1';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(var(--tl-space-64) * 6)',
        maxWidth: 'calc(var(--tl-space-64) * 10)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
      }}
    >
      <MessageThread
        label="구매 · 물류 채널 메시지"
        height="fill"
        today="2026-11-06"
        messages={messages}
        hasOlder={hasOlder}
        onLoadOlder={() =>
          setMessages((ms) =>
            ms[0]?.id === 'c4' ? [...CHANNEL.slice(0, 3), ...ms] : [...OLDER, ...ms],
          )
        }
      />
    </div>
  );
}

/** 보내지 못함 — 내 메시지 옆에 실패를 글자로 알리고 다시 보내기 단추를 둔다 */
export function Failed() {
  const [status, setStatus] = useState<'failed' | 'sending' | undefined>('failed');
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <MessageThread
        label="정우진 주임과 대화"
        today="2026-11-06"
        onRetry={() => setStatus('sending')}
        messages={[
          {
            id: 'd1',
            author: JUNG,
            at: '2026-11-06 13:20',
            text: '반품 박스 회수는 내일 오전입니다.',
          },
          {
            id: 'd2',
            author: { id: 'me', name: '김테라 팀장' },
            own: true,
            at: '2026-11-06 13:24',
            text: '회수 기사 연락처를 보내 주세요.',
            ...(status ? { status } : {}),
          },
        ]}
      />
    </div>
  );
}

const AGENT = { id: 'agent', name: '업무 도우미', meta: '에이전트' };
const ME = { id: 'me', name: '김테라 팀장' };

const ANSWER = `11월 6일 기준 미지급금은 **3개 거래처 16,555,500원**입니다. 금액 단위는 원입니다.

| 거래처 | 미지급금 | 지급 예정일 |
|---|---|---|
| 한빛식품 | 12,480,000 | 2026-11-10 |
| 동해수산 | 3,215,500 | 2026-11-15 |
| 대성물류 | 860,000 | 2026-11-20 |

한빛식품은 세금계산서를 아직 수취하지 않았습니다[1]. 지급 전에 수취 여부를 확인하세요[2].`;

/** 에이전트 답변 — 말풍선 없이 폭을 쓴다. 실행 단계 요약 · 본문(표 · 출처 번호) · 출처 목록 · 복사 · 다시 생성 · 좋음 · 나쁨 순서다. 다음 답변은 쓰는 중이다 */
export function AgentAnswer() {
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 12)' }}>
      <MessageThread
        label="업무 도우미 대화"
        today="2026-11-06"
        onRegenerate={() => {}}
        onFeedback={(_id, value) => setFeedback(value)}
        messages={[
          {
            id: 'q1',
            author: ME,
            own: true,
            at: '2026-11-06 10:20',
            text: '이번 달 미지급금 거래처별로 보여 줘',
          },
          {
            id: 'a1',
            kind: 'answer',
            author: AGENT,
            at: '2026-11-06 10:20',
            text: ANSWER,
            steps: (
              <RunSteps
                collapsible
                steps={[
                  {
                    id: 's1',
                    name: '전표 조회',
                    description: '11월 · 미지급금',
                    state: 'succeeded',
                    durationMs: 1240,
                  },
                  { id: 's2', name: '세금계산서 수취 확인', state: 'succeeded', durationMs: 2050 },
                  { id: 's3', name: '답변 작성', state: 'succeeded', durationMs: 3100 },
                ]}
              />
            ),
            citations: [
              { title: '매입 세금계산서 목록', location: '11월' },
              {
                title: '경비 처리 규정',
                location: '4.2 지급 전 확인',
                href: 'https://intranet.terra-trading.example/policy/expense',
              },
            ],
            ...(feedback ? { feedback } : {}),
          },
          {
            id: 'q2',
            author: ME,
            own: true,
            at: '2026-11-06 10:22',
            text: '한빛식품 지급 예정일 하루 당겨 줘',
          },
          {
            id: 'a2',
            kind: 'answer',
            author: AGENT,
            at: '2026-11-06 10:22',
            streaming: true,
            text: '한빛식품 지급 예정일을 2026-11-09로 바꾸는 제안을 만들고 있습니다.',
          },
        ]}
      />
    </div>
  );
}

// 작은 미리 보기 사진(합성 샘플, 96 × 72 JPEG)
const PHOTO =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCABIAGADASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAIBA//aAAwDAQACEAMQAAAB+gjcqCoKgqCoIzDbCdutOd3nz55vS+P0VnoYvXn5UTt9Pl3Fd88bN6zeM7neN3GkdIjNGuO4vbjrN1y1WW4a6MauMgAAAAA//8QAIRAAAgICAgIDAQAAAAAAAAAAAAECERASAyAhMCIxQEH/2gAIAQEAAQUC/ZYsWOdEHaxZsi0RjKQuN4k/N4438dkX0jyaxXKbsfkf0L1SlWF22NjYbta9/wCiwhiGL3f/xAAdEQABBAIDAAAAAAAAAAAAAAAAAQIQERIhIDAx/9oACAEDAQE/AeaIaEQd5LSodN0ZFmuj/8QAHBEAAgIDAQEAAAAAAAAAAAAAAAECEBESISAw/9oACAECAQE/Afcng6OTIvtyG6jeGzU1MP4f/8QAGhAAAgIDAAAAAAAAAAAAAAAAABEhQDAxUP/aAAgBAQAGPwLjsnGjbtRe/8QAIBAAAgEEAwADAAAAAAAAAAAAAREAECExcSBRYUBBgf/aAAgBAQABPyH5bjQCcwoQ9J3LwrjVO56T2gVCIKbhQzhwkjQAJy5mJ3wdJ+y7l4YmiEzmSmNNcQ+hXGFzTDi5pNJpDosm1HxD1oBd4cRvuYWjAXjK0ZX5vn//2gAMAwEAAgADAAAAEPnvvnrvrXhlvhr3BvyqjPI7uwovoggv/8QAHBEBAQACAgMAAAAAAAAAAAAAAQARMRAgITBB/9oACAEDAQE/EO5O5+Ah3A0OQI5gWpeOQTCTmVPo/8QAGxEBAQACAwEAAAAAAAAAAAAAAQAQMREgIUH/2gAIAQIBAT8Q7r4I+1tDmbZy0RJW3D3LuQ2FxAEd/wD/xAAjEAADAAIBBAIDAQAAAAAAAAAAAREhMVEQQWGRgcFxofDR/9oACAEBAAE/EKUpS9KXpSlKXpcFhSlKUvSlKNUhseMGWaIRVeC7wiFLmuA/8sRcFPH9jS5JiUWvQ4pknMje2V4K+ROhEb9MDbbrdbK4mdFYk8f2Ovfo13+O5hYfpHMB2HodPzmT0iz0GtaJs/Q6Zc4zf3yJtbehPj2VJ43yWeWPWjKqheH1Rps34FXrYjXkWuPDG+79ovBcDdPofxT+KMmS+4oX+BOLAnpaXkpRLN3IwKs6k5Eym4Kl+5TdbdhfyIrbLeSCqqUpSlKQUpSlKf/Z';

const REACTIONS = [
  { key: 'check', label: '확인', icon: 'check' as const },
  { key: 'thumbs-up', label: '좋아요', icon: 'thumbs-up' as const },
  { key: 'heart', label: '감사', icon: 'heart' as const },
];

/** 반응 · 답글 · 그림 — 말풍선 아래 반응(아이콘 + 수, 내가 누른 것은 눌린 모양), 답글은 말풍선 위 인용(누르면 원문으로), 그림 파일은 미리 보기(누르면 크게), 멘션은 링크 색 글자, 맨 아래는 입력 중인 사람이다. 반응 추가 · 답글 단추는 메시지를 가리키거나 포커스하면 보인다 */
export function Reactions() {
  const [mine, setMine] = useState<string[]>(['check']);
  const toggle = (key: string) =>
    setMine((m) => (m.includes(key) ? m.filter((k) => k !== key) : [...m, key]));
  const base: Record<string, number> = { check: 1, 'thumbs-up': 1, heart: 0 };
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <MessageThread
        label="구매-물류 메시지"
        today="2026-11-06"
        reactionOptions={REACTIONS}
        onReact={(_id, key) => toggle(key)}
        onReply={() => {}}
        typing={['이하은 과장']}
        messages={[
          {
            id: 'r1',
            author: JUNG,
            at: '2026-11-06 10:05',
            text: '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다. @김테라 확인 부탁드립니다.',
            mentions: ['김테라'],
            files: [
              { name: '파손-박스-01.jpg', size: 1_929_216, thumb: PHOTO, href: PHOTO },
              { name: '거래명세서-HK1101.pdf', size: 182_272 },
            ],
            reactions: REACTIONS.map((r) => ({
              ...r,
              count: (base[r.key] ?? 0) + (mine.includes(r.key) ? 1 : 0),
              mine: mine.includes(r.key),
            })),
          },
          {
            id: 'r2',
            author: { id: 'me', name: '김테라 팀장' },
            own: true,
            at: '2026-11-06 10:12',
            text: '확인했습니다. 공급사에 클레임 메일 보내겠습니다.',
            replyTo: {
              id: 'r1',
              author: '정우진 주임',
              text: '12KG 부족합니다. 박스 하나가 파손돼서 사진 올립니다.',
            },
            unread: 0,
          },
        ]}
      />
    </div>
  );
}
