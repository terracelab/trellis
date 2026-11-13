import { formatAmount } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { Progress } from '../Progress/Progress.js';
import { SelectableCard } from './SelectableCard.js';

const SHIPPING = [
  {
    value: 'parcel',
    title: '택배',
    description: '1~2일 · 전국',
    icon: 'truck' as const,
    meta: `${formatAmount(3000)}원`,
  },
  {
    value: 'quick',
    title: '퀵 배송',
    description: '당일 · 수도권',
    icon: 'zap' as const,
    meta: `${formatAmount(12000)}원`,
  },
  {
    value: 'pickup',
    title: '방문 수령',
    description: '본사 물류센터 · 평일 09:00~18:00',
    icon: 'store' as const,
    meta: '무료',
  },
];

/** 배송 방법 — 카드 하나를 고른다. Field 라벨이 묶음 이름이 된다 */
export function Single() {
  return (
    <Field label="배송 방법" required>
      <SelectableCard options={SHIPPING} defaultValue="parcel" columns={3} name="shipping" />
    </Field>
  );
}

/** 여러 개 고르기 — mode="multiple"이면 카드마다 체크 상자가 보인다 */
export function Multiple() {
  const [value, setValue] = useState<string[]>(['app', 'mail']);
  return (
    <Field label="알림 받을 곳" help="앱 알림은 끌 수 없습니다">
      <SelectableCard
        mode="multiple"
        value={value}
        onChange={setValue}
        columns={2}
        options={[
          {
            value: 'app',
            title: '앱 알림',
            description: '항상 받습니다',
            icon: 'bell',
            disabled: true,
          },
          { value: 'mail', title: '메일', description: 'kim@terra.example', icon: 'mail' },
          { value: 'sms', title: '문자', description: '010-****-1234', icon: 'smartphone' },
          {
            value: 'talk',
            title: '알림톡',
            description: '업무 시간에만 보냅니다',
            icon: 'message-circle',
          },
        ]}
      />
    </Field>
  );
}

/** 목록에서 하나 고르기 — 고른 카드의 상세를 옆에 보인다. 설명 아래 내용(content)에 진행률을 넣는다 */
export function WithContent() {
  const [id, setId] = useState('WO-1107-02');
  const orders = [
    { id: 'WO-1107-01', name: '냉동 만두 1kg', state: '완료', good: 1200, planned: 1200 },
    { id: 'WO-1107-02', name: '냉동 만두 2kg', state: '진행', good: 420, planned: 800 },
    { id: 'WO-1107-03', name: '물만두 500g', state: '대기', good: 0, planned: 1500 },
  ];
  return (
    <SelectableCard
      label="작업지시"
      columns={1}
      value={id}
      onChange={setId}
      options={orders.map((o) => ({
        value: o.id,
        title: o.name,
        description: o.id,
        meta: o.state,
        content: <Progress size="sm" label="양품" value={o.good} max={o.planned} unit="EA" />,
      }))}
    />
  );
}
