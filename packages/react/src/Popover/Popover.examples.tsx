import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { Button } from '../Button/Button.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { Popover } from './Popover.js';

const MEMBERS = [
  { name: '김테라', title: '팀장', team: '경영지원팀', status: 'online' },
  { name: '문채원', title: '주임', team: 'CS팀', status: 'online' },
  { name: '정우진', title: '주임', team: '물류팀', status: 'away' },
  { name: '송유나', title: '대리', team: 'CS팀', status: 'busy' },
  { name: '박서연', title: '사원', team: '구매팀', status: 'offline' },
] as const;

const WAREHOUSES = ['평택 냉동센터', '인천 상온센터', '부산 항만창고'];

/** 멤버 — 읽기만 하는 패널은 패널 자체에 포커스를 둔다. Escape나 바깥을 누르면 닫히고 트리거로 돌아간다 */
export function Members() {
  return (
    <Popover
      title={`멤버 ${MEMBERS.length}명`}
      initialFocus="panel"
      width="sm"
      trigger={<Button icon="users">멤버 {MEMBERS.length}명</Button>}
    >
      <ul style={{ display: 'grid', gap: 'var(--tl-space-8)', margin: 0, padding: 0 }}>
        {MEMBERS.map((m) => (
          <li
            key={m.name}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-8)' }}
          >
            <Avatar name={m.name} size={24} status={m.status} decorative />
            <span>
              {m.name} {m.title}
            </span>
            <span style={{ marginLeft: 'auto', color: 'var(--tl-color-fg-secondary)' }}>
              {m.team}
            </span>
          </li>
        ))}
      </ul>
    </Popover>
  );
}

/** 적용 · 초기화 — 고르는 칸이 있으면 첫 칸에 포커스가 간다. 아래 동작으로 적용하고 닫는다 */
export function Apply() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(['평택 냉동센터']);
  const [applied, setApplied] = useState<string[]>(['평택 냉동센터']);
  return (
    <Popover
      title="창고"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setPicked(applied);
      }}
      trigger={<Button iconEnd="chevron-down">창고 {applied.length}곳</Button>}
      footer={
        <>
          <Button size="sm" variant="ghost" onPress={() => setPicked([])}>
            초기화
          </Button>
          <Button
            size="sm"
            variant="primary"
            onPress={() => {
              setApplied(picked);
              setOpen(false);
            }}
          >
            적용
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
        {WAREHOUSES.map((w) => (
          <Checkbox
            key={w}
            checked={picked.includes(w)}
            onChange={(on) => setPicked((p) => (on ? [...p, w] : p.filter((x) => x !== w)))}
          >
            {w}
          </Checkbox>
        ))}
      </div>
    </Popover>
  );
}
