import { formatCompactWon } from '@terracelab/trellis-contracts';
import { Donut } from './Donut.js';

/** 기본 — 가운데 합계 + 옆 범례(값 · 비율) */
export function Basic() {
  const data = [
    { label: '직판', value: 742_000_000, color: 'series-1' as const },
    { label: '대리점', value: 486_000_000, color: 'series-2' as const },
    { label: '온라인', value: 238_000_000, color: 'series-3' as const },
    { label: '수출', value: 122_000_000, color: 'series-4' as const },
  ];
  return (
    <Donut
      data={data}
      unit="원"
      height={168}
      format={formatCompactWon}
      centerValue="16억"
      centerLabel="합계"
      ariaLabel="10월 채널 구성. 직판 47%, 대리점 31%, 온라인 15%, 수출 8%"
    />
  );
}
