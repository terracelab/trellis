import { Legend } from './Legend.js';

/** 모양 — 막대 square · 선 line · 비교 dashed */
export function Shapes() {
  return (
    <Legend
      items={[
        { label: '매출', color: 'series-1' },
        { label: '마진율', color: 'series-3', shape: 'line' },
        { label: '전년', color: 'compare', shape: 'dashed' },
      ]}
    />
  );
}
