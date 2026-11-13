import { ScanField } from './ScanField.js';

/** 입고 검수 — 스캔하면 칸이 비고 최근 스캔에 쌓인다 */
export function Receiving() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <ScanField
        label="박스 바코드"
        keepFocus={false}
        recent={['8801234567890', '8801234567883', 'HK261101-12']}
      />
    </div>
  );
}
