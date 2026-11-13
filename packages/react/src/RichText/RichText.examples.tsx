import { RichText } from './RichText.js';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const LIST = `## 11월 결산 전에 확인할 것
미결 전표가 **7건** 남아 있습니다. 마감은 11월 30일(월)입니다.

1. 미지급금 전표 4건
   - 거래처 사업자등록번호가 비어 있습니다
   - 세금계산서를 아직 수취하지 않았습니다
2. 가지급금 정산 2건
3. 미분류 카드 사용 내역 1건`;

const TABLE = `### 거래처별 미지급금
11월 6일 기준입니다. 금액 단위는 원입니다.

| 거래처 | 전표 | 미지급금 | 지급 예정일 |
|---|---|---|---|
| 한빛식품 | 3건 | 12,480,000 | 2026-11-10 |
| 동해수산 | 1건 | 3,215,500 | 2026-11-15 |
| 대성물류 | 2건 | 860,000 | 2026-11-20 |
| **합계** | **6건** | **16,555,500** | |`;

const CODE = `전표 번호는 \`EX-2611-0018\`입니다. 같은 조건으로 다시 조회하려면 아래 조건을 필터 저장에 붙여 넣습니다.

\`\`\`
기간: 2026-11-01~2026-11-30
계정과목: 251 미지급금
거래처: 한빛식품
\`\`\``;

const LINKS = `지출결의서 작성 기준은 [경비 처리 규정](https://intranet.terra-trading.example/policy/expense) 4장에 있습니다. 전표는 [전표 입력](#voucher "전표 입력 화면") 화면에서 엽니다.
문의는 [finance@terra-trading.example](mailto:finance@terra-trading.example)로 보냅니다. 규정 원문은 https://intranet.terra-trading.example/policy/expense.pdf 입니다.`;

const PARTIAL = `조회 조건은 다음과 같습니다.

\`\`\`
기간: 2026-11-01~2026-11-30
계정과목: 251 미지급금`;

const CITED = `연차 사용 촉진은 사용 기간이 끝나기 6개월 전에 1차 통지를 보냅니다[1]. 쓰지 않은 연차는 회계연도 말에 수당으로 정산합니다[2].`;

/** 목록 — 가장 높은 제목이 h3이 되고, 들여 쓴 줄은 안쪽 목록이 된다 */
export function List() {
  return (
    <div style={BOX}>
      <RichText text={LIST} />
    </div>
  );
}

/** 표 — 숫자 열은 오른쪽 정렬과 tabular 숫자다. 단위는 표 위에 한 번 적는다 */
export function Table() {
  return (
    <div style={BOX}>
      <RichText text={TABLE} />
    </div>
  );
}

/** 코드 — 인라인 코드와 코드 블록은 고정폭 글자이고 넓으면 칸 안에서 가로로 스크롤한다 */
export function Code() {
  return (
    <div style={BOX}>
      <RichText text={CODE} />
    </div>
  );
}

/** 링크 — http(s)는 새 창, 앱 안 경로는 같은 창으로 연다. 본문의 주소도 링크가 된다 */
export function Links() {
  return (
    <div style={BOX}>
      <RichText text={LINKS} />
    </div>
  );
}

/** 쓰는 중 — 끝에 커서가 보이고 aria-busy다. 닫히지 않은 코드 블록은 꾸밈 없는 글자로 보인다 */
export function Streaming() {
  return (
    <div style={{ ...BOX, display: 'grid', gap: 'var(--tl-space-16)' }}>
      <RichText text="" streaming />
      <RichText text={PARTIAL} streaming />
    </div>
  );
}

/** 출처 표시 — 본문의 [1]이 출처 번호가 된다. 누르면 출처 문서를 연다 */
export function Citations() {
  return (
    <div style={BOX}>
      <RichText
        text={CITED}
        citations={[
          {
            title: '2026 취업규칙',
            location: '제32조',
            href: 'https://intranet.terra-trading.example/rules/2026#32',
          },
          { title: '연차 수당 지급 기준', location: '3.2 정산' },
        ]}
      />
    </div>
  );
}
