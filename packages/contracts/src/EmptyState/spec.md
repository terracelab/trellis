# EmptyState
## 용도
카드 · 표 · 목록에 보여 줄 항목이 없을 때 무엇이 없는지와 다음 행동을 보여 줄 때 쓴다. 검색 결과 없음 · 불러오기 실패 · 권한 없음 · 연결 끊김 · 없는 주소 · 로그인 만료도 같은 블록에 `kind`로 그린다. 불러오는 중은 Skeleton이다. 화면 위쪽에 남겨 두는 알림(마감 임박 · 연동 끊김)은 Banner, 저장 같은 동작의 결과는 Toast다.
## 해부(Anatomy)
root(가운데 정렬, 세로 간격 `space.8`) · icon(원 40, `bg.sunken` 바탕, 아이콘 `fg.tertiary` 20. error는 아이콘만 `status.danger.default`) · title(`type.body` 600 `fg.primary`, sm은 `type.label`) · description(`type.caption` `fg.secondary`) · request(요청 ID 한 줄, `type.caption` `fg.secondary` tabular, 누르면 한 번에 골라진다) · action(Button 하나).
## Props
contract 표.
## Variants
size md · sm(원 32, 아이콘 16, 여백 절반). `headingLevel`이 1 · 2면 화면 크기(원 48, 제목 `type.h3`, 설명 `type.body`, 동작 위 여백 `space.12`). kind 일곱 가지. 종류마다 기본 아이콘과 문구가 있다.

| kind | 아이콘 | 기본 제목 | 기본 설명 | 쓰는 곳 |
|---|---|---|---|---|
| empty | inbox | 표시할 항목이 없습니다 | 새 항목이 생기면 여기에 나타납니다 | 아직 항목이 없는 목록 |
| noResult | search | 조건에 맞는 항목이 없습니다 | 검색어나 필터를 바꿔 보세요 | 검색 · 필터 결과가 없을 때 |
| error | circle-alert | 내용을 불러오지 못했습니다 | 잠시 뒤 다시 시도하세요 | 불러오기 실패. 다시 시도 단추를 action에 |
| forbidden | lock | 볼 수 있는 권한이 없습니다 | 권한이 필요하면 관리자에게 요청하세요 | 권한이 없는 화면 · 카드 |
| offline | globe | 인터넷에 연결되어 있지 않습니다 | 연결되면 다시 시도하세요 | 연결이 끊긴 동안 |
| notFound | map-pin-off | 주소에 해당하는 화면이 없습니다 | 주소를 확인하거나 홈에서 다시 찾으세요 | 주소에 화면이 없을 때(404). 블록 `platform/errors/not-found` |
| expired | timer-off | 로그인이 만료되었습니다 | 다시 로그인한 뒤 이어서 작업하세요 | 세션이 끝났을 때. 블록 `platform/errors/expired` |

문구는 contracts `_shared/messages.ts`의 `emptyState.<kind>.title · description`(ko · en)이다. KpiCard 오류 같은 다른 컴포넌트의 오류 블록도 이 사전을 쓴다.
## States
default. 오류는 상태가 아니라 kind="error"로 그린다.
## 동작
제목은 무엇이 없는지 한 문장, 설명은 다음 행동 한 문장이다("이번 달 전표가 없습니다" · "전표 입력에서 추가하세요"). 검색 · 필터 결과가 없으면 kind="noResult"로 조건을 바꾸라는 문장을 쓴다. action은 버튼 하나만 둔다. 화면 하나를 차지하는 오류(notFound · forbidden · expired 전체 화면 블록)만 주 동작과 "이전 화면" 둘까지 둔다.

title을 주지 않으면 제목과 설명이 모두 종류의 기본 문구가 된다. title을 주면 설명은 준 것만 보인다(앱이 쓴 제목 아래에 기본 설명을 끼워 넣지 않는다). icon을 주지 않으면 종류의 기본 아이콘이다.

kind="error"는 불러오기가 실패해 목록 · 카드 자리에 내용 대신 서는 블록이다. 무엇이 안 됐는지와 다음 행동을 쓰고, action에 "다시 시도" 단추를 둔다. `requestId`가 있으면 설명 아래에 "요청 ID req-8f2a" 한 줄을 보인다. 사용자가 관리자에게 그대로 옮겨 적는 값이다. DataGrid `error`가 이 블록을 쓴다. kind="forbidden"도 요청 ID를 받는다(관리자가 감사 로그에서 거절 기록을 찾는다).

전체 화면 오류: 주소에 화면이 없을 때(notFound) · 권한이 없을 때(forbidden) · 로그인이 만료됐을 때(expired)는 화면 블록 `platform/errors/*`가 이 블록을 영역 가운데에 세운다. 이때 `headingLevel={1}`로 제목이 화면 제목이 된다.
## 접근성
제목은 문단(`<p>`)이고 제목 수준을 만들지 않는다. `headingLevel`을 주면 그 단계의 제목(`h1`~`h4`)이다. 카드 · 표 안에서는 주지 않고, 화면 하나를 차지하는 오류 블록만 1을 준다. 아이콘은 장식(`aria-hidden`). 표 안에서는 한 칸이 전체 열을 차지하는 행에 넣는다. kind="error"는 루트가 `role="alert"`라 나타날 때 제목 · 설명 · 요청 ID가 읽힌다. 다른 종류는 알리지 않는다. 오류도 아이콘 색만으로 알리지 않고 제목 글자로 말한다.
## 밀도
md 위아래 `space.32`, sm 위아래 `space.16`. 밀도와 무관하다.
## 플랫폼 차이
없음.
## 금지 사항
사과 문구("죄송합니다") · 느낌표 · 일러스트 마스코트 · 버튼 두 개 이상(전체 화면 오류는 둘까지) · 오류 블록에 붉은 바탕이나 왼쪽 띠(D-56 · D-57) · 404 같은 큰 숫자 장식 → 리뷰.
## 스토리
Default · Small · WithAction · Search · Kinds(일곱 종류) · ErrorWithRequest · FullPage.
## 참고
content.md §5 빈 상태 · 오류 문구. PR-30(kind · requestId, 식자재 ERP ErrorState를 흡수). PG-44(notFound · expired · headingLevel, 전체 화면 오류 블록).
