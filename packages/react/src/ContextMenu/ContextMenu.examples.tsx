import { formatAttachmentSize } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Icon } from '../Icon/Icon.js';
import { ContextMenu } from './ContextMenu.js';

const FILES = [
  { id: 'f1', name: '10월 결산 보고서.xlsx', size: 482_304, by: '김테라', at: '2026-11-05' },
  { id: 'f2', name: '부가세 예정신고 증빙.zip', size: 18_874_368, by: '정우진', at: '2026-11-04' },
  { id: 'f3', name: '누리식품 공급 계약서.pdf', size: 1_258_291, by: '문채원', at: '2026-11-02' },
];

/** 파일 목록 — 행을 우클릭하거나 길게 누르거나 포커스한 행에서 Shift+F10을 누르면 그 행의 메뉴가 열린다. 휴대폰은 아래 시트다 */
export function FileRows() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [last, setLast] = useState('');
  const file = FILES.find((f) => f.id === fileId);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 8)',
      }}
    >
      <ContextMenu
        title={file?.name ?? '파일'}
        onOpenChange={(open, target) => {
          if (open) setFileId(target?.closest('li')?.dataset['id'] ?? null);
        }}
        items={
          file
            ? [
                {
                  id: 'open',
                  label: '열기',
                  icon: 'eye',
                  onSelect: () => setLast(`${file.name} 열기`),
                },
                {
                  id: 'download',
                  label: '다운로드',
                  icon: 'download',
                  onSelect: () => setLast(`${file.name} 다운로드`),
                },
                {
                  id: 'share',
                  label: '공유',
                  icon: 'users',
                  onSelect: () => setLast(`${file.name} 공유`),
                },
                { type: 'separator' },
                {
                  id: 'trash',
                  label: '휴지통으로 이동',
                  icon: 'trash-2',
                  danger: true,
                  onSelect: () => setLast(`${file.name} 휴지통으로 이동`),
                },
              ]
            : []
        }
      >
        <ul
          aria-label="문서"
          style={{
            margin: 0,
            padding: 0,
            border: 'var(--tl-border-width-1) solid var(--tl-color-border-default)',
            borderRadius: 'var(--tl-radius-md)',
            listStyle: 'none',
          }}
        >
          {FILES.map((f, i) => (
            <li
              key={f.id}
              data-id={f.id}
              tabIndex={0}
              className="tl-focusable"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--tl-space-8)',
                minHeight: 'var(--tl-density-row-height)',
                padding: '0 var(--tl-space-12)',
                borderTop: i ? 'var(--tl-border-width-1) solid var(--tl-color-border-divider)' : 0,
              }}
            >
              <Icon name="file-text" size={16} />
              <span style={{ flex: '1 1 auto', minWidth: 0 }}>{f.name}</span>
              <span style={{ color: 'var(--tl-color-fg-secondary)' }}>
                {formatAttachmentSize(f.size)} · {f.by} · {f.at}
              </span>
            </li>
          ))}
        </ul>
      </ContextMenu>
      <p role="status" style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }}>
        {last || '행에서 우클릭하세요'}
      </p>
    </div>
  );
}
