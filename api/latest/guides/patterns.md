# 패턴

화면 유형마다 정해진 조합입니다. 새 화면은 맞는 화면 블록을 복사해서 시작합니다(`pnpm ds:add --list`, [서비스 시작하기](service.md)). 맞는 블록이 없으면 아래 구성대로 조립합니다. 화면 배치는 `@terracelab/trellis-blocks/ui`의 `Page` · `Grid` · `Col` · `Stack` · `Split`이 잡습니다.

| 패턴 | 코드 이름 | 구성 | 규칙 | 블록 예 |
| --- | --- | --- | --- | --- |
| 알림 카드 홈 | `NotificationHome` | AppShell + Grid(12열) + NotificationCard + KpiCard | 카드 너비는 4 · 6 · 12열만, 카운트 배지는 우상단, 카드는 눌러서 이동 | `home/dashboard/trade` |
| 목록 · 상세 | `ListDetail` | FilterBar + DataGrid + Pagination + Drawer(넓은 화면은 Split) | 필터는 한 줄, 표가 남은 높이 전부, Drawer 안에 Drawer 금지 | `erp/tax/invoice-list` |
| 폼 · 등록 | `FormRegister` | FormSection(2열) + Field + 하단 고정 ActionBar | 묶음마다 FormSection, 필수 표시 점, 저장 오른쪽 아래 · 취소는 그 왼쪽 | `erp/purchasing/po-form` |
| 결재 · 승인 | `ApprovalFlow` | ApprovalLine + 본문 + Attachment + 승인 · 반려 · 회수 | 상태는 결재 배지만, 반려 · 회수 사유는 ReasonDialog, 결재선은 가로 단계 | `groupware/approval/document` |
| 대화형 작업 | `ConversationalWork` | MessageThread + Composer + 결과 카드 + CommandPalette | 답변은 카드 컴포넌트로, 데이터 변경은 ProposalCard 승인 뒤에만, 입력창 하단 고정 | `platform/assistant/chat` |

오류 화면은 블록 패턴 `ErrorPage`입니다. EmptyState(`notFound` · `forbidden`)와 단추로 만들고 메뉴에 넣지 않습니다(블록 `platform/errors/not-found` · `platform/errors/forbidden`). 로그인 만료 화면은 보던 화면을 `?next=`로 로그인에 넘깁니다.

패턴 이름은 화면 유형을 부르는 이름이고 컴포넌트가 아닙니다. 모든 패턴이 휴대폰 폭에서 동작합니다. 목록은 카드, 상세는 아래 시트, 폼은 한 열입니다.

## 숫자가 있는 화면

대시보드 · 통계 블록은 **숫자 → 추이 → 구성 → 비교 → 표(행동)** 순서로 쌓습니다. 부품과 상태 · 휴대폰 규칙은 [대시보드 만들기](dashboards.md), 에이전트 대화는 [에이전트 대화 화면 만들기](conversation.md)에 있습니다. 블록마다 [차트 고르기](charts.md)의 표로 형식을 고르고, 사용자는 결국 표에서 행동하므로 표 칸에 막대(DataBar) · 진하기(HeatCell)를 얹어 읽히면 차트를 따로 그리지 않습니다.

## 홈의 개인 기록

개인 홈(역할별 홈의 구성원 보기 같은 화면)에는 로그인한 사람 한 명의 기록을 보이는 자리 `record`를 하나 둡니다. 연속 일수 · 정시 완수율이 여기에 들어갑니다.

- 자리: 첫 줄(출퇴근 · 숫자 줄) 바로 아래, 12열 Card 하나입니다. 제목은 "내 기록"이고, 부제에 무엇을 셌는지와 세지 않는 날(휴일 · 보류)을 적습니다. 카드 오른쪽 위에 기록의 출처 화면으로 가는 단추를 둡니다.
- 내용: 숫자 셋(연속 일수 · 당월 비율 · 전월 건수)은 `Figure`로, 그 옆에 최근 3개월 `CalendarHeatmap`(`layout="year"`, 주가 열인 띠)을 둡니다. 좁은 화면은 숫자 줄 아래 달력입니다.
- 셈: 본인 것만 셉니다. 팀 · 회사 숫자와 한 카드에 섞지 않습니다.
- 빼는 때: 기록의 출처 화면(예: 임무)이 앱에 없을 때, 회사 숫자를 보는 홈(대표 · 인사 보기)일 때입니다. 빈 카드나 0을 그리지 않고 자리째 뺍니다.

블록 예는 `home/dashboard/people`의 구성원 보기이고, 숫자와 달력의 원본 화면은 `groupware/mission/list`입니다.

## 모듈

업무 모듈(ERP · 그룹웨어 · ECM · CRM · 유통·물류 · 이커머스 · 제조)은 `@terracelab/trellis-tokens/modules`에 등록돼 있습니다. 사이드바 · 런처 · 알림 카드는 이 목록에서 라벨과 아이콘을 가져오고, 모듈 타일 일러스트는 `@terracelab/trellis-icons/module-tiles`에서 가져옵니다.

```ts
import { moduleTileSprite, moduleTileByModule } from '@terracelab/trellis-icons/module-tiles';
// 문서에 스프라이트를 한 번 넣고
// <svg aria-hidden="true"><use href={`#tl-tile-${moduleTileByModule.approval}`} /></svg>
```
