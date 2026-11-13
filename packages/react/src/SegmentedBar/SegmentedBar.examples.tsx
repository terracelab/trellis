import { formatCompactWon } from '@terracelab/trellis-contracts';
import { SegmentedBar } from './SegmentedBar.js';

/** 기본 — 부분-전체 한 줄 + 범례 */
export function Basic() {
  return (
    <SegmentedBar
      data={[
        { label: '직판', value: 742_000_000, color: 'series-1' },
        { label: '대리점', value: 486_000_000, color: 'series-2' },
        { label: '온라인', value: 238_000_000, color: 'series-3' },
        { label: '수출', value: 122_000_000, color: 'series-4' },
      ]}
      unit="원"
      format={formatCompactWon}
      ariaLabel="10월 채널 구성"
    />
  );
}

/** 얇게 — 순위 트랙(나머지는 compare) */
export function Thin() {
  return (
    <SegmentedBar
      data={[
        { label: '서울 본사', value: 612, color: 'series-1' },
        { label: '경기 남부', value: 318, color: 'series-2' },
        { label: '부산·경남', value: 246, color: 'series-4' },
        { label: '나머지 4곳', value: 412, color: 'compare' },
      ]}
      unit="백만원"
      size="thin"
      ariaLabel="지사 매출 비중"
    />
  );
}
