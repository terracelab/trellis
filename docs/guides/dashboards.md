# 대시보드 만들기

대시보드는 업무 숫자와 그 추이를 한 화면에 모은 화면입니다. 이 가이드는 Trellis 부품만으로 대시보드를 조립하는 순서와 규칙입니다. 맞는 화면 블록이 있으면 복사해서 시작합니다(아래 "시작할 블록").

## 조립 순서

위에서 아래로 다섯 가지를 놓습니다. 사용자는 숫자를 보고 추이로 이유를 찾은 뒤 표에서 행동합니다.

| 순서 | 부품 | 하는 일 |
| --- | --- | --- |
| 1 | [PageHeader](../components/PageHeader.md) | 화면 이름 · 기준일 · 단위. 배치 편집과 엑셀 다운로드는 `actions` |
| 2 | [FilterBar](../components/FilterBar.md) · [PeriodPicker](../components/PeriodPicker.md) | 조회 조건과 기간. 비교가 필요하면 PeriodPicker `compare` |
| 3 | [KpiCard](../components/KpiCard.md) 줄 | 숫자 4개 안팎. 증감은 `delta`, 비교 대상은 `delta.label` |
| 4 | [DashboardGrid](../components/DashboardGrid.md) + [ChartCard](../components/ChartCard.md) | 차트 위젯. 위젯마다 `span`(12열 중 칸 수) |
| 5 | [DataGrid](../components/DataGrid.md) + 내보내기 | 행동할 목록. 표 칸에 DataBar · HeatCell을 얹는다 |

```tsx
<Page header={<PageHeader title="매출 분석" description="11월 6일 기준 · 단위 원" actions={<ExportButton module="sales" name="매출 분석" rows={rows} columns={CSV}>엑셀 다운로드</ExportButton>} />}>
  <FilterBar>
    <PeriodPicker label="기간" value={period} onChange={setPeriod} compare={compare} onCompareChange={setCompare} />
  </FilterBar>
  <DashboardGrid widgets={widgets} layout={layout} onLayoutChange={saveLayout} editing={editing} label="매출 분석 위젯" />
  <DataGrid caption="거래처별 매출" rows={rows} rowKey="partyId" columns={columns} summary />
</Page>
```

- **기간 비교.** PeriodPicker `compare`는 직전 기간 · 전년 동기 · 직접 고르기 세 가지입니다(`compareModes`로 줄인다). 비교 기간은 `resolvePeriodCompare`(`@terracelab/trellis-contracts`)가 계산합니다. KpiCard `delta.label`과 차트의 `compare` 계열은 같은 비교 기간으로 맞춥니다.
- **위젯 배치.** 위젯은 `{ id, title, span, content }`입니다. 순서 바꾸기와 숨기기는 편집 모드(`editing`)에서 키보드와 단추로 합니다. 끌어 옮기기는 없습니다. `onLayoutChange`가 준 배열을 JSON으로 저장하고 다음에 `layout`으로 넘깁니다. 위젯이 늘거나 줄어도 `dashboardLayoutOf`가 맞춥니다. 화면의 기준이 되는 위젯은 `hideable: false`로 둡니다.
- **내보내기.** 단추 글자는 "엑셀 다운로드"이고 파일은 CSV입니다(UTF-8 BOM · 금액은 서식 없는 숫자). 블록 화면은 `ExportButton`(`@terracelab/trellis-blocks/ui`, `useCan(module, 'export')`로 막는다)을 씁니다. 직접 만들 때는 `toCsv`(contracts)와 `downloadCsv`(react)를 씁니다. 지금 보이는 행(필터 · 데이터 범위 뒤)만 넘깁니다.

## 어떤 차트를 쓰나

질문에서 형식을 고르는 표는 [차트 고르기](charts.md)에 있습니다. 대시보드에서 자주 묻는 네 가지는 아래와 같습니다.

| 질문 | 컴포넌트 | 메모 |
| --- | --- | --- |
| 앞으로 얼마나 필요한가 | [TrendChart](../components/TrendChart.md) `forecast` | 실적 실선 뒤에 같은 색 예측 점선과 범위 음영. `from`은 예측이 시작하는 행 |
| 단계마다 얼마나 남나 | [FunnelChart](../components/FunnelChart.md) | 한 색 왼쪽 정렬 막대와 단계 전환율(`conversion`) |
| 구성이 어떻게 바뀌나 | [ComboChart](../components/ComboChart.md) `stacked` | 3계열 이상. 6계열부터 다섯 뒤는 "기타"로 접힌다 |
| 목표 대비 어디까지 왔나 | [BulletBar](../components/BulletBar.md) · [RadialMeter](../components/RadialMeter.md) | 여러 항목은 BulletBar 목록, 하나는 RadialMeter |

단위가 다른 보조 지표(마진율)는 ComboChart `lower`에 둡니다. 축을 둘로 나누지 않습니다. 모든 ChartCard에 `table`을 넘겨 표로 보기를 켭니다.

## 상태

| 상태 | 무엇을 쓰나 |
| --- | --- |
| 불러오는 중 | KpiCard · ChartCard · DataGrid의 `loading`. 높이가 그대로라 화면이 뛰지 않는다. 직접 만든 카드는 `Skeleton shape="kpi" · "card" · "table" · "list"` |
| 데이터 없음 | ChartCard `empty`에 무엇이 없는지 한 문장. DataGrid는 `empty`, 조건 결과가 없으면 `filtered` |
| 오류 | ChartCard `error` + `onRetry`, KpiCard `error` + `onRetry`, DataGrid `error`(요청 ID와 다시 시도). 화면 전체가 실패하면 `EmptyState kind="error"` |
| 다시 불러오는 중 | ChartCard `refreshing`. 지난 차트를 남기고 표시만 한다 |

가운데 Spinner 하나로 화면 전체를 덮지 않습니다. 카드마다 제 상태를 보입니다.

## 휴대폰

- DashboardGrid는 1280 미만에서 2 · 3칸 위젯을 반 줄로 바꿉니다. 4~8칸 위젯은 한 줄이 됩니다. 1024 미만에서는 2 · 3칸 위젯만 둘씩 놓이고 나머지는 한 줄입니다. 640 미만은 한 줄에 하나입니다. 순서는 폭과 관계없이 같습니다.
- KpiCard는 640 미만에서 두 열(이름 · 값)로 바뀝니다. DataGrid는 행마다 카드가 됩니다.
- FilterBar는 칩 한 줄이 되고 PeriodPicker는 아래 시트로 엽니다.
- 차트는 부모 폭을 채우고 `height`는 그대로입니다. 휴대폰 첫 화면에는 숫자와 차트 하나를 두고 나머지는 아래로 내립니다.

## 고정 규칙

- 수입 · 증가는 빨강(`finance.income`), 지출 · 감소는 파랑(`finance.expense`)입니다. 좋고 나쁨은 글자로 씁니다("목표 미달").
- 단위는 칸마다 붙이지 않고 표 머리나 카드 부제에 한 번 씁니다("단위 원"). 금액은 `formatAmount`, 축은 `formatCompactWon`, 비율은 `formatPercent`입니다.
- 상태는 점과 글자로 보입니다(StatusDot · 표 칸 Badge). 행 바탕색 · 왼쪽 띠 · 회색 알약은 쓰지 않습니다.
- 차트 색은 슬롯 이름만 쓰고 항목에 고정합니다. 이중 축은 쓰지 않습니다.

## 시작할 블록

`pnpm ds:add <블록 id>`로 복사합니다.

| 블록 id | 화면 | 볼 것 |
| --- | --- | --- |
| `home/dashboard/trade` | 무역 회사 대시보드 | KpiCard 줄 · ComboChart `lower` · BulletBar |
| `home/dashboard/people` | 역할별 홈 | 역할별 보기 바꾸기 · 불러오는 동안의 Skeleton |
| `erp/sales/analysis` | 매출 분석 | 누계 비교 · 구성 차트 · 표 칸 DataBar |
| `home/dashboard/forecast` | 수요 예측 · 발주 추천 | 예측 구간이 있는 추이와 발주 추천 |
| `home/dashboard/franchise` | 가맹점 현황 | 가맹점별 숫자 비교 |
