# 대시보드 만들기

요청받은 기능을 Trellis 부품으로 옮겨 대시보드 한 화면을 만드는 순서다. 자세한 규칙은 `npx @terracelab/trellis-skill docs guide dashboards`와 `docs guide charts`에 있다.

## 1. 시작 화면을 복사한다

```bash
npx @terracelab/trellis-skill add dashboard        # src/dashboard/ 에 복사. 다른 곳은 --to <폴더>
```

| 파일 | 내용 |
|---|---|
| `Dashboard.tsx` | 화면. 제목과 기간, 숫자 네 개, 추이와 순위 차트, 목록 표 |
| `data.ts` | 샘플 데이터와 `useDashboardData`. 서비스 데이터로 바꾸는 자리 |
| `dashboard.css` | 화면 바깥 여백. 값은 전부 토큰 |

복사한 파일은 서비스 코드다. 화면에 넣는다.

```tsx
import { Dashboard } from './dashboard/Dashboard';

<Dashboard />;
```

먼저 그대로 띄워서 보이는지 확인하고, 그다음에 요청에 맞게 고친다. 화면 이름 · 파일 이름 · 컴포넌트 이름도 요청한 업무에 맞게 바꾼다.

## 2. 요청을 부품으로 옮긴다

요청 문장에서 "무엇을 보고 싶은가"를 하나씩 떼어 아래 표에서 고른다. 표에 없으면 `docs guide charts`의 질문 표를 본다. 쓰기 전에 `docs <이름>`으로 Props를 확인한다.

| 요청 | 부품 | 메모 |
|---|---|---|
| 지금 숫자(매출 · 건수 · 잔액) | `KpiCard` | 한 줄에 4개 안팎. 증감은 `delta`에 비교 대상을 함께. 소수 자리가 필요한 값은 서식을 입힌 글자를 `value`로 넘긴다 |
| 시간에 따른 추이 | `TrendChart` | 비교 기간은 `dashed` + `compare` 색 |
| 앞으로의 예측 | `TrendChart` `forecast` | 같은 색 점선과 범위 음영 |
| 양과 비율을 같이(매출과 이익률) | `ComboChart` `lower` | 축을 둘로 나누지 않는다 |
| 구성이 달마다 어떻게 바뀌나 | `ComboChart` `stacked` | 3계열 이상 |
| 항목별 순위 · 비교 | `BarList` | 한 색. 가로는 `layout="horizontal"` |
| 전체에서 차지하는 몫 | `Donut` · `SegmentedBar` | 5조각 이하 |
| 목표 · 한도 대비 | `BulletBar` · `RadialMeter` | 여러 항목은 `Card` 안에 BulletBar를 세로로 쌓는다(사이 `--tl-space-12`). 하나는 RadialMeter |
| 단계마다 남는 수(문의 → 계약) | `FunnelChart` | `conversion`으로 전환율 |
| 날짜마다의 양 | `CalendarHeatmap` | 한 색 5단계 |
| 더하고 빼서 나온 값 | `WaterfallChart` | 증가 빨강 · 감소 파랑 |
| 행동할 목록 | `DataGrid` | 합계는 `summary`, 정렬은 `sortable` |
| 표 칸 안의 비교 | `DataBar` · `HeatCell` · `Sparkline` | 열의 `render`에 둔다 |
| 상태 | `Badge` · `StatusDot` | 점과 글자. 행 바탕색 · 왼쪽 띠는 쓰지 않는다 |
| 기한 | `DueBadge` · `DeadlineStrip` | |
| 진행률 | `Progress` | |
| 할 일 · 알림 카드 | `NotificationCard` · `Checklist` | |
| 일정 | `MonthCalendar` | |
| 사람 | `PersonLabel` · `AvatarGroup` | |
| 기간 고르기 | `PeriodPicker` · `SegmentedControl` | 선택지 2~5개면 SegmentedControl, 날짜 범위와 비교 기간은 PeriodPicker |
| 조회 조건 | `FilterBar` 안에 `Select` · `MultiSelect` | 조건마다 `label`을 준다 |
| 엑셀 다운로드 | `Button` + `downloadCsv` | 지금 보이는 행만 넘긴다. 아래 "표와 내보내기" |
| 위젯 순서 바꾸기 · 숨기기 | `DashboardGrid` `widgets` + `editing` | `onLayoutChange` 값을 저장한다 |

요청이 표의 어느 줄에도 맞지 않고 가까운 조합도 없으면 만들지 않고 `references/request.md`대로 남긴다.

## 3. 배치

위에서 아래로 놓는다. 사용자는 숫자를 보고, 추이에서 이유를 찾고, 표에서 행동한다.

1. `PageHeader`. 화면 이름, 기준일과 단위는 `description`, 기간과 내보내기는 `actions`.
2. 조건이 여럿이면 `FilterBar`.
3. `DashboardGrid` 안에 `DashboardGridItem`을 놓는다. 한 줄은 12칸이다.

| 줄 | 칸 나누기 |
|---|---|
| 숫자 | `span={3}` 네 개. 세 개면 `span={4}` |
| 차트 | 큰 차트 `span={8}` + 작은 차트 `span={4}`, 또는 `span={6}` 둘. 셋이면 가장 중요한 차트 `span={12}` 아래에 `span={6}` 둘 |
| 목록 | `span={12}` |

- 차트는 `ChartCard`에 하나씩 담는다. `title`, 단위를 적은 `subtitle`, 표로 보기용 `table`, 차트의 `ariaLabel`(무엇을 · 어느 기간 · 어디서 어디로)을 모두 준다. 계열이 둘 이상이면 `legend`도 준다.
- 표는 카드로 감싸지 않는다. `SectionHeader` 아래에 `DataGrid`를 바로 둔다.
- 좁은 화면 배치는 `DashboardGrid`가 맡는다. 직접 미디어 쿼리로 칸을 바꾸지 않는다.
- 첫 화면에 숫자와 가장 중요한 차트 하나가 보이게 하고, 나머지는 아래로 내린다. 차트는 한 화면에 4개를 넘기지 않는다.

## 4. 표와 내보내기

`DataGrid`의 열은 `docs DataGrid`의 예시와 시작 화면의 열을 본다. 자주 쓰는 칸은 아래와 같다.

| 칸 | 뜻 |
|---|---|
| `key` · `header` | 행의 필드 이름과 열 이름 |
| `width` | `xs` · `sm` · `md` · `lg` · `xl` · `auto` |
| `format` | `amount` · `number` · `percent` · `date` 등. 숫자는 오른쪽 정렬이 된다 |
| `headerUnit` | 머리에 한 번 붙는 단위. `'건'`이면 "주문 (건)". 금액 열은 원이 저절로 붙는다 |
| `total: 'sum'` | `summary`를 켠 표의 합계 줄에 더한다 |
| `sortable` | 머리를 눌러 정렬 |
| `finance` | 증가 빨강 · 감소 파랑 |
| `render` | 칸을 직접 그린다. `DataBar` · `Badge` · `PersonLabel`을 둔다 |

엑셀 다운로드는 `downloadCsv`(`@terracelab/trellis-react`)와 `CsvColumn`(`@terracelab/trellis-contracts`)이다. 문서에는 따로 쪽이 없다.

```tsx
const CSV: CsvColumn<Row>[] = [
  { label: '거래처', value: 'name' }, // 행의 필드 이름
  { label: '매출(원)', value: 'sales' }, // 금액은 서식 없는 숫자, 단위는 머리에
  { label: '상태', value: (r) => (r.active ? '거래 중' : '거래 중지') }, // 값을 만드는 함수
];

<Button icon="download" onPress={() => downloadCsv({ name: '매출 현황', date: '2026-11-06', rows, columns: CSV })}>
  엑셀 다운로드
</Button>;
```

파일은 `이름_날짜.csv`로 내려온다.

## 5. 데이터와 상태

- `data.ts`의 `useDashboardData`가 `data · loading · error · reload`를 돌려준다. 이 모양을 두고 안쪽에서 서비스 API를 부른다.
- 불러오는 중은 `KpiCard` · `ChartCard` · `DataGrid`의 `loading`이다. 화면 가운데 Spinner 하나로 덮지 않는다.
- 데이터가 없으면 `ChartCard`의 `empty`에 무엇이 없는지 한 문장을 쓰고, `DataGrid`는 `empty`를 쓴다.
- 오류는 `ChartCard` `error` + `onRetry`, `KpiCard` `error` + `onRetry`, `DataGrid` `error`다.
- 요청에 실제 데이터가 없으면 샘플 데이터로 만들고, 보고에 샘플이라고 적는다.

## 6. 고정 규칙

- 금액의 증가 · 수입은 빨강, 감소 · 지출은 파랑이다. `KpiCard` `delta`와 표 열의 `finance`가 색을 맡는다. 좋고 나쁨은 글자로 쓴다.
- 금액이 아니고 좋고 나쁨이 분명한 숫자는 `delta.polarity`를 준다. 늘면 좋은 값(처리 완료 · 달성률)은 `'up-good'`, 늘면 나쁜 값(미처리 · 불량 · 처리 시간)은 `'up-bad'`다.
- 아직 끝나지 않은 기간(오늘 · 이번 달)을 끝난 기간과 비교하면 증감이 실제보다 나쁘게 보인다. 같은 시점까지만 비교하거나 부제에 "집계 중"이라고 쓴다.
- 단위는 칸마다 붙이지 않는다. 화면 설명이나 카드 부제에 한 번 쓴다. 금액은 `formatAmount`, 축은 `formatCompactWon`, 비율은 `formatPercent`다.
- 차트 색은 슬롯 이름만 쓴다(`series-1`~`series-5` · `compare`). 항목에 색을 고정하고 순위대로 다시 칠하지 않는다.
- 화면에 직접 쓰는 CSS는 바깥 여백 정도다. 카드 · 표 · 단추 모양을 CSS로 다시 만들지 않는다.

## 7. 확인

```bash
npx @terracelab/trellis-skill doctor
```

그다음 서비스의 타입 검사와 빌드를 돌리고, 화면을 1440 · 390 두 폭과 라이트 · 다크로 본다. 볼 것은 가로 넘침, 숫자 오른쪽 정렬, 차트의 표로 보기, 좁은 화면에서 표가 행 카드로 바뀌는지다.
