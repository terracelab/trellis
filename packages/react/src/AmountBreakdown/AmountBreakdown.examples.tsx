import { AmountBreakdown } from './AmountBreakdown.js';

/** 실지급액 — 지급 합계에서 공제 합계를 빼면 실지급액. 단위는 머리에 한 번 */
export function Payroll() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <AmountBreakdown
        title="11월 실지급액"
        unit="원"
        status="updated"
        updatedAt="14:32"
        rows={[
          { key: 'base', label: '기본급', value: 3200000 },
          { key: 'overtime', label: '연장근로수당', value: 184600, op: '+', hint: '8시간 × 1.5배' },
          { key: 'meal', label: '식대', value: 200000, op: '+', hint: '비과세' },
          { key: 'deduction', label: '공제 합계', value: 412380, op: '−' },
          { key: 'net', label: '실지급액', value: 3172220, op: '=' },
        ]}
      />
    </div>
  );
}

/** 세금계산서와 활성 줄 — 고치는 칸과 이어진 줄은 바탕이 한 단계 올라간다 */
export function TaxInvoice() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <AmountBreakdown
        title="세금계산서 금액"
        unit="원"
        activeKey="supply"
        rows={[
          { key: 'supply', label: '공급가액', value: 12480000 },
          { key: 'tax', label: '세액', value: 1248000, op: '+', hint: '공급가액의 10%' },
          { key: 'total', label: '합계', value: 13728000, op: '=' },
        ]}
      />
    </div>
  );
}

/** 상태 — 불러오는 중은 금액 자리 Skeleton, 계산 중은 지난 값을 둔다. 오류면 다시 계산 */
export function States() {
  const rows = [
    { key: 'sales', label: '매출', value: 48200000 },
    { key: 'fee', label: '판매 수수료', value: 5302000, op: '−' as const, hint: '11%' },
    { key: 'settle', label: '정산 예정 금액', value: 42898000, op: '=' as const },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4)), 1fr))',
        gap: 'var(--tl-space-24)',
      }}
    >
      <AmountBreakdown title="불러오는 중" unit="원" rows={rows} loading />
      <AmountBreakdown title="계산 중" unit="원" rows={rows} status="calculating" />
      <AmountBreakdown title="오류" unit="원" rows={rows} status="error" onRecalculate={() => {}} />
    </div>
  );
}
