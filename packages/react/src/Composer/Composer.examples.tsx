import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { Composer } from './Composer.js';

/** 메시지 입력 — Enter로 보내고 Shift+Enter로 줄을 바꾼다. 한글 조합 중 Enter는 보내지 않는다. 붙인 파일은 칩으로 보인다 */
export function Chat() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 10)',
      }}
    >
      <Composer
        label="구매 · 물류 채널에 메시지"
        placeholder="구매 · 물류 채널에 메시지 보내기"
        maxLength={1000}
        onSend={(text, files) =>
          setSent((s) => [...s, files.length ? `${text} (파일 ${files.length}개)` : text])
        }
      />
      {sent.length > 0 && (
        <p role="status" style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }}>
          보낸 메시지 {sent.length}개 · 마지막: {sent[sent.length - 1]}
        </p>
      )}
    </div>
  );
}

/** 추천 질문 — 입력 위에 추천 질문을 둔다. 누르면 입력 칸에 그 글이 들어가고 고쳐서 보낼 수 있다 */
export function Suggestions() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <Composer
        label="업무 도우미에게 질문"
        placeholder="전표 · 재고 · 규정을 묻습니다"
        attachable={false}
        sendLabel="질문"
        suggestions={['11월 미지급금 현황', '이번 주 입고 예정', '부가세 예정신고 일정']}
        onSend={() => {}}
      />
    </div>
  );
}

/** 고객 답변 — 긴 글은 Enter가 줄바꿈이고 Ctrl+Enter로 보낸다. Field 안에서는 Field 라벨과 도움말을 쓴다 */
export function Reply() {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <Field label="답변" help="한지민 팀장에게 메일과 알림톡으로 보냅니다. Ctrl+Enter로 보냅니다">
        <Composer
          value={draft}
          onChange={setDraft}
          placeholder="반품 회수는 11월 7일 오전에 진행합니다"
          enterToSend={false}
          attachable={false}
          maxRows={8}
          loading={sending}
          sendLabel="답변 보내기"
          onSend={() => {
            setSending(true);
            setTimeout(() => setSending(false), 600);
          }}
        />
      </Field>
    </div>
  );
}

const MEMBERS = [
  { id: 'u01', name: '윤지호', meta: '대표' },
  { id: 'u03', name: '박서연', meta: '경영지원팀 · 대리' },
  { id: 'u04', name: '이하은', meta: '구매팀 · 과장' },
  { id: 'u05', name: '정우진', meta: '물류팀 · 주임' },
];
const COMMANDS = [
  { id: 'notice', name: '공지', description: '채널 위에 고정 공지로 올립니다' },
  { id: 'po', name: '발주서', description: '발주서 카드를 붙입니다' },
  { id: 'stock', name: '재고', description: '품목 재고를 카드로 붙입니다' },
];

/** 멘션 · 명령 — "@"를 치면 사람 목록, 글 맨 앞에서 "/"를 치면 명령 목록이 입력 칸 위에 뜬다. 위아래 화살표로 고르고 Enter · Tab으로 넣는다. 한글 조합 중 Enter는 글자 확정이다 */
export function MentionsCommands() {
  const [last, setLast] = useState('');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 10)',
        paddingTop: 'calc(var(--tl-space-64) * 3)',
      }}
    >
      <Composer
        label="구매 · 물류 채널에 메시지"
        placeholder="@로 사람을, /로 명령을 부릅니다"
        defaultValue="입고 확인 부탁드립니다 @"
        mentions={MEMBERS}
        commands={COMMANDS}
        onSend={(text, _files, meta) =>
          setLast(
            `${text} · 멘션 ${meta?.mentions.length ?? 0}명${meta?.command ? ` · 명령 ${meta.command}` : ''}`,
          )
        }
      />
      {last && (
        <p role="status" style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }}>
          보냄: {last}
        </p>
      )}
    </div>
  );
}
