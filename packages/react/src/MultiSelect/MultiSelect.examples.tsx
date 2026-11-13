import { type SelectOption } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { MultiSelect } from './MultiSelect.js';

const CHANNELS = [
  { value: 'own', label: '자사몰' },
  { value: 'open-a', label: '오픈마켓 A' },
  { value: 'open-b', label: '오픈마켓 B' },
  { value: 'easy-pay', label: '간편결제 쇼핑' },
];

const STATUSES = [
  { value: 'paid', label: '결제 완료' },
  { value: 'preparing', label: '상품 준비' },
  { value: 'shipping', label: '배송 중' },
  { value: 'delivered', label: '배송 완료' },
  { value: 'claim', label: '취소 · 반품' },
];

/** 판매 채널 여러 개 — 아무것도 고르지 않으면 전체. 둘 이상이면 "첫 이름 외 n" */
export function Basic() {
  const [channels, setChannels] = useState<string[]>(['own', 'open-a', 'open-b']);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="판매 채널" help={`고른 값 ${channels.length}개. 아무것도 고르지 않으면 전체`}>
        <MultiSelect
          options={CHANNELS}
          value={channels}
          onChange={setChannels}
          placeholder="전체 채널"
        />
      </Field>
      <Field label="주문 상태">
        <MultiSelect options={STATUSES} defaultValue={['paid']} placeholder="전체 상태" />
      </Field>
    </div>
  );
}

/** 필터 바 안 — 내용 폭(width auto) · Field 밖이라 label이 접근성 이름 */
export function Filter() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <MultiSelect options={CHANNELS} width="auto" label="판매 채널" placeholder="전체 채널" />
      <MultiSelect
        options={STATUSES}
        width="auto"
        label="주문 상태"
        placeholder="전체 상태"
        defaultValue={['preparing', 'shipping']}
      />
    </div>
  );
}

const APPROVALS: SelectOption[] = [
  { value: 'draft', label: '기안', leading: { kind: 'dot', tone: 'draft' }, note: '3건' },
  { value: 'pending', label: '진행', leading: { kind: 'dot', tone: 'pending' }, note: '12건' },
  { value: 'approved', label: '승인', leading: { kind: 'dot', tone: 'approved' }, note: '48건' },
  { value: 'rejected', label: '반려', leading: { kind: 'dot', tone: 'rejected' }, note: '2건' },
  { value: 'withdrawn', label: '회수', leading: { kind: 'dot', tone: 'withdrawn' }, note: '0건' },
];

/** 결재 상태 필터 — 점은 결재 배지 점과 같은 색, note는 건수. 닫힌 칸은 요약에 이름이 보이는 첫 선택지의 점 */
export function Marks() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <MultiSelect
        options={APPROVALS}
        width="auto"
        label="결재 상태"
        placeholder="전체 상태"
        defaultValue={['pending', 'rejected']}
      />
    </div>
  );
}
