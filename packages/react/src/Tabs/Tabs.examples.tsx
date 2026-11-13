import { Tabs } from './Tabs.js';

/** 필터형 — 세금계산서 상태별 건수 */
export function Filter() {
  return (
    <Tabs
      label="세금계산서 상태"
      items={[
        { value: 'all', label: '전체', count: 248 },
        { value: 'ready', label: '발행 대기', count: 12 },
        { value: 'sent', label: '국세청 전송', count: 231 },
        { value: 'failed', label: '전송 실패', count: 2 },
        { value: 'cancelled', label: '발행 취소', count: 3 },
      ]}
    />
  );
}
