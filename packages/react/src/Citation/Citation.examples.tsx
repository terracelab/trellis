import { Citation } from './Citation.js';

const SOURCES = [
  {
    title: '2026 취업규칙',
    location: '제32조',
    href: 'https://intranet.terra-trading.example/rules/2026#32',
  },
  {
    title: '연차 수당 지급 기준',
    location: '3.2 정산',
    href: 'https://intranet.terra-trading.example/hr/leave-pay',
  },
  { title: '2025 연차 사용 현황.xlsx', location: '인사팀 시트' },
];

/** 출처 목록 — 답변 아래에 번호 · 문서 이름 · 쪽을 칩으로 늘어놓는다. 주소가 있으면 새 창으로 연다 */
export function List() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 10)' }}>
      <Citation sources={SOURCES} />
    </div>
  );
}

/** 글 안 번호 — 문장 끝에 작은 번호를 둔다. 마우스를 올리거나 포커스하면 문서 이름이 보인다 */
export function Inline() {
  return (
    <p style={{ maxWidth: 'calc(var(--tl-space-64) * 10)', margin: 0 }}>
      연차 사용 촉진은 사용 기간이 끝나기 6개월 전에 1차 통지를 보냅니다
      <Citation layout="inline" sources={[{ ...SOURCES[0]!, index: 1 }]} />. 쓰지 않은 연차는
      회계연도 말에 수당으로 정산합니다
      <Citation layout="inline" sources={[{ ...SOURCES[1]!, index: 2 }]} />.
    </p>
  );
}

/** 앱 안에서 열기 — onOpen이 있으면 새 창 대신 앱이 문서 보기를 연다 */
export function OpenInApp() {
  return (
    <Citation
      label="근거 문서"
      sources={[
        { title: '전표 EX-2611-0018', location: '증빙 2쪽' },
        { title: '거래처 원장 한빛식품', location: '11월' },
      ]}
      onOpen={() => {}}
    />
  );
}
