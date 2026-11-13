import { useState } from 'react';
import { DataGrid } from '../DataGrid/DataGrid.js';
import { PersonLabel } from '../PersonLabel/PersonLabel.js';
import { TrellisProvider } from '../TrellisProvider/TrellisProvider.js';
import { Link } from './Link.js';

const ORDERS = [
  { id: 'SO-2611-018', party: '한결물산', amount: 12840000 },
  { id: 'SO-2611-021', party: '누리식품', amount: 6420000 },
  { id: 'SO-2611-024', party: '한빛무역', amount: 3189000 },
];

/** 앱 안 링크 — 링크 색 글자이고 가리키면 밑줄. 라우터가 있으면 새로 고침 없이 연다 */
export function Basic() {
  return <Link href="#orders">수주 목록</Link>;
}

/** 바깥 링크 — http(s) 주소는 새 탭으로 열고 끝에 바깥 아이콘을 붙인다. 화면 읽기는 "새 창에서 열림"을 읽는다 */
export function External() {
  return (
    <p style={{ margin: 0 }}>
      임금명세서 기재 사항은{' '}
      <Link href="https://www.law.go.kr" underline="always">
        국가법령정보센터
      </Link>
      의 근로기준법 제48조를 따릅니다.
    </p>
  );
}

/** 문장 안 · 덜 중요한 링크 · 목록 안 — 문장 안은 늘 밑줄, 출처 · 문서 이름은 subtle, 목록 · 표 안 이름은 plain(본문 색) */
export function Variants() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)', justifyItems: 'start' }}>
      <p style={{ margin: 0 }}>
        결재선은{' '}
        <Link href="#approval-settings" underline="always">
          결재 설정
        </Link>
        에서 바꿉니다.
      </p>
      <span>
        출처{' '}
        <Link href="#doc-2611-07" variant="subtle">
          2026년 11월 영업 회의록
        </Link>
      </span>
      <Link href="#locked" disabled>
        급여 대장(권한 없음)
      </Link>
      <ul style={{ margin: 0, paddingLeft: 'var(--tl-space-16)' }}>
        <li>
          <Link href="#tasks/insurance-E-0012" variant="plain">
            한서연 4대보험 취득신고
          </Link>
        </li>
        <li>
          <Link href="#tasks/leave-E-0031" variant="plain">
            이준호 연차 신청
          </Link>
        </li>
      </ul>
    </div>
  );
}

/** 표 칸 · 사람 — DataGrid render와 PersonLabel 옆에 그대로 넣는다. 표 칸 안 링크는 저절로 본문 색(plain). 링크를 눌러도 행 누름은 일어나지 않는다 */
export function InTable() {
  return (
    <DataGrid
      caption="이번 주 수주"
      rowKey="id"
      rows={ORDERS}
      onRowPress={() => undefined}
      columns={[
        {
          key: 'id',
          header: '수주 번호',
          width: 'md',
          render: (row: (typeof ORDERS)[number]) => (
            <Link href={`#orders/${row.id}`}>{row.id}</Link>
          ),
        },
        { key: 'party', header: '거래처', width: 'md' },
        { key: 'amount', header: '금액', width: 'md', format: 'amount' },
      ]}
    />
  );
}

/** 라우터 연결 — TrellisProvider navigate를 주면 Link와 PersonLabel href가 이 함수로 옮긴다. Ctrl · Cmd 누름은 새 탭 그대로 */
export function Router() {
  const [path, setPath] = useState('/home');
  return (
    <TrellisProvider navigate={setPath}>
      <div style={{ display: 'grid', gap: 'var(--tl-space-12)', justifyItems: 'start' }}>
        <span>지금 주소 {path}</span>
        <Link href="/erp/sales/orders">수주 목록</Link>
        <PersonLabel
          name="한서연"
          meta="인사팀 · 매니저"
          href="/erp/hr-payroll/hr-master?id=E-0012"
        />
      </div>
    </TrellisProvider>
  );
}
