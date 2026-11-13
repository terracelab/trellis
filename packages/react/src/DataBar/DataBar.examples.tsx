import { DataBar } from './DataBar.js';

/** 표 안 — 같은 열의 최댓값 기준, 기준선(marker) · 부족 경고 */
export function InTable() {
  const rows = [
    { name: '쌀 20kg', stock: 184 },
    { name: '식용유 18L', stock: 96 },
    { name: '설탕 15kg', stock: 7 },
  ];
  const max = Math.max(...rows.map((r) => r.stock));
  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'left', paddingRight: 'var(--tl-space-24)' }}>
            품목
          </th>
          <th scope="col" style={{ textAlign: 'left' }}>
            재고
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <th scope="row" style={{ textAlign: 'left', fontWeight: 'var(--tl-font-weight-500)' }}>
              {r.name}
            </th>
            <td>
              <DataBar
                value={r.stock}
                max={max}
                marker={40}
                warnBelow={20}
                unit="개"
                label="재고"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
