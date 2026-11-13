import { formatQuantity } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Select } from '../Select/Select.js';
import { Toolbar } from './Toolbar.js';

/** 문서 서식 — 문단 서식(Select) · 글자 서식(켜고 끄는 단추) · 넣기 묶음 사이에 구분선, 끝에 글자 수. 화살표로 옮긴다 */
export function Editor() {
  const [para, setPara] = useState<string | null>('body');
  const [marks, setMarks] = useState<string[]>(['bold']);
  const [last, setLast] = useState('');
  const toggle = (id: string) =>
    setMarks((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <Toolbar
        label="서식"
        onPress={(id) => (['bold', 'italic', 'underline'].includes(id) ? toggle(id) : setLast(id))}
        end={`${formatQuantity(1284, '자')} · 붙임 2건`}
        groups={[
          {
            id: 'para',
            label: '문단',
            content: (
              <Select
                size="sm"
                width="auto"
                label="문단 서식"
                value={para}
                onChange={setPara}
                options={[
                  { value: 'body', label: '본문' },
                  { value: 'h1', label: '제목 1' },
                  { value: 'h2', label: '제목 2' },
                  { value: 'quote', label: '인용' },
                ]}
              />
            ),
          },
          {
            id: 'marks',
            label: '글자 서식',
            items: [
              {
                id: 'bold',
                label: '굵게',
                text: '가',
                textStyle: 'bold',
                shortcut: 'Ctrl+B',
                pressed: marks.includes('bold'),
              },
              {
                id: 'italic',
                label: '기울임',
                text: '가',
                textStyle: 'italic',
                shortcut: 'Ctrl+I',
                pressed: marks.includes('italic'),
              },
              {
                id: 'underline',
                label: '밑줄',
                text: '가',
                textStyle: 'underline',
                shortcut: 'Ctrl+U',
                pressed: marks.includes('underline'),
              },
            ],
          },
          {
            id: 'insert',
            label: '넣기',
            items: [
              { id: 'list', label: '목록', icon: 'list' },
              { id: 'table', label: '표', icon: 'table' },
              { id: 'image', label: '이미지', icon: 'image' },
              { id: 'file', label: '첨부', icon: 'paperclip' },
            ],
          },
        ]}
      />
      <p style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }} aria-live="polite">
        {last ? `${last} 단추를 눌렀습니다` : '넣기 단추를 누르면 여기에 보입니다'}
      </p>
    </div>
  );
}

/** 글자 단추 · 잠금 — showLabel은 아이콘 옆에 이름을 쓴다. 결재 중 문서는 disabled로 잠그고 단추는 화살표 이동에 남는다 */
export function Labels() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <Toolbar
        label="목록 동작"
        size="md"
        groups={[
          {
            id: 'edit',
            items: [
              { id: 'add', label: '추가', icon: 'plus', showLabel: true },
              { id: 'copy', label: '복사', icon: 'copy', showLabel: true },
            ],
          },
          {
            id: 'out',
            items: [
              { id: 'print', label: '인쇄', icon: 'printer', showLabel: true },
              { id: 'download', label: '다운로드', icon: 'download', showLabel: true },
            ],
          },
        ]}
      />
      <Toolbar
        label="서식"
        disabled
        end="결재 중에는 고칠 수 없습니다"
        groups={[
          {
            id: 'marks',
            items: [
              { id: 'bold', label: '굵게', text: '가', textStyle: 'bold', pressed: false },
              { id: 'list', label: '목록', icon: 'list' },
            ],
          },
        ]}
      />
    </div>
  );
}
