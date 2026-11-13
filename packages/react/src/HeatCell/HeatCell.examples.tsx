import { HeatCell } from './HeatCell.js';

/** 에이징 표 — 표 전체 최댓값을 한 척도로 */
export function Aging() {
  const rows = [
    { name: '누리식품', aging: [3100, 1240, 480, 0] },
    { name: '한결물산', aging: [950, 1120, 1060, 560] },
    { name: '서진유통', aging: [210, 340, 425, 900] },
  ];
  const max = Math.max(...rows.flatMap((r) => r.aging));
  const heads = ['~30일', '31~60', '61~90', '90일+'];
  return (
    <table style={{ borderCollapse: 'collapse', fontVariantNumeric: 'var(--tl-font-numeric)' }}>
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'left' }}>
            거래처
          </th>
          {heads.map((h) => (
            <th key={h} scope="col" style={{ textAlign: 'right', padding: '0 var(--tl-space-12)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <th scope="row" style={{ textAlign: 'left', paddingRight: 'var(--tl-space-16)' }}>
              {r.name}
            </th>
            {r.aging.map((v, i) => (
              <td key={i} style={{ padding: 0 }}>
                <HeatCell value={v || null} max={max} unit="만" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
