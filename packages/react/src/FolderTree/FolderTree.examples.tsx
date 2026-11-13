import { useState } from 'react';
import { FolderTree } from './FolderTree.js';

const DOC_FOLDERS = [
  {
    id: 'root',
    label: '내 문서',
    count: 14,
    children: [
      {
        id: 'close',
        label: '2026 결산',
        count: 7,
        children: [
          { id: 'close-10', label: '10월 마감', count: 4 },
          { id: 'close-11', label: '11월 마감', count: 3 },
        ],
      },
      {
        id: 'tax',
        label: '세무 신고',
        count: 2,
        children: [{ id: 'vat', label: '부가세 2기 예정', count: 2 }],
      },
      { id: 'contracts', label: '거래처 계약서', count: 3 },
      { id: 'minutes', label: '회의록', count: 2 },
    ],
  },
  { id: 'shared', label: '공유받은 문서', icon: 'users', count: 2 },
  { id: 'trash', label: '휴지통', icon: 'trash-2', count: 0 },
] as const;

const MAILBOXES = [
  { id: 'inbox', label: '받은편지함', icon: 'inbox', count: 3 },
  { id: 'sent', label: '보낸편지함', icon: 'send' },
  { id: 'drafts', label: '임시 보관함', icon: 'file-pen', count: 1 },
  { id: 'spam', label: '스팸', icon: 'ban' },
] as const;

/** 문서함 폴더 — 펼친 폴더 · 고른 폴더를 화면이 들고 있다. 숫자는 하위 폴더까지 센 문서 수 */
export function Documents() {
  const [selected, setSelected] = useState('close-10');
  const [expanded, setExpanded] = useState<string[]>(['root', 'close', 'tax']);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 4)' }}>
      <FolderTree
        label="문서 폴더"
        nodes={DOC_FOLDERS}
        selected={selected}
        onSelect={setSelected}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />
    </div>
  );
}

/** 메일함 — 하위가 없는 한 단계 목록도 같은 트리로 그린다. 숫자는 안 읽은 메일 */
export function Mailboxes() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 3)' }}>
      <FolderTree label="메일함" nodes={MAILBOXES} defaultSelected="inbox" />
    </div>
  );
}
