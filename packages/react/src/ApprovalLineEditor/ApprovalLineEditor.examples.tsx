import { type ApprovalLineStep, type ApprovalPerson } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { ApprovalLineEditor } from './ApprovalLineEditor.js';

const PEOPLE: ApprovalPerson[] = [
  { id: 'e01', name: '정민호', title: '팀장', meta: '영업팀 · 팀장', code: 'E-0031' },
  { id: 'e02', name: '박서연', title: '선임', meta: '재무팀 · 자금', code: 'E-0044' },
  { id: 'e03', name: '한결', title: '대표', meta: '경영지원 · 대표', code: 'E-0001' },
  { id: 'e04', name: '이도윤', title: '주임', meta: '구매팀 · 발주', code: 'E-0052' },
  { id: 'e05', name: '최유진', title: '매니저', meta: '인사팀 · 근태', code: 'E-0060' },
  { id: 'e06', name: '오세훈', title: '책임', meta: '물류팀 · 입출고', code: 'E-0071' },
];

const DRAFTER: ApprovalPerson = {
  id: 'e10',
  name: '김하늘',
  title: '대리',
  meta: '영업팀',
  code: 'E-0102',
};

/** 지출결의 결재선 — 기안자 아래로 검토 · 합의 · 승인. 줄 단추에서 Alt + ↑ · ↓로 순서를 바꾸고, 참조자는 사람 칩 */
export function Expense() {
  const [line, setLine] = useState<ApprovalLineStep[]>([
    { person: 'e01', role: '검토' },
    { person: 'e02', role: '합의' },
    { person: 'e03', role: '승인' },
  ]);
  const [cc, setCc] = useState<string[]>(['e05']);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 11)' }}>
      <ApprovalLineEditor
        people={PEOPLE}
        drafter={DRAFTER}
        value={line}
        onChange={setLine}
        cc={cc}
        onCcChange={setCc}
      />
    </div>
  );
}

/** 빈 결재선 · 오류 — 결재자가 없으면 빈 줄 안내와 추가 칸 오류. 마지막 역할이 승인이 아니면 안내 글자 */
export function Empty() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-32)',
        maxWidth: 'calc(var(--tl-space-64) * 11)',
      }}
    >
      <ApprovalLineEditor
        people={PEOPLE}
        drafter={DRAFTER}
        defaultValue={[]}
        showCc={false}
        error="결재자를 한 명 이상 고르세요"
      />
      <ApprovalLineEditor
        people={PEOPLE}
        drafter={DRAFTER}
        defaultValue={[{ person: 'e01', role: '검토' }]}
        showCc={false}
        max={3}
      />
    </div>
  );
}
