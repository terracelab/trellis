# Checklist

> `@terracelab/trellis-react` · CSS `.tl-checklist` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Checklist } from '@terracelab/trellis-react';
```

## 용도

차례로 끝내는 일(월 결산 마감 · 신입 온보딩 · 도입 준비)을 항목 목록과 진행 요약으로 보여 줄 때 쓴다. 항목마다 상태 · 기한 · 담당 · 보조 글자 · 행동 단추 하나가 붙는다. 저장 전 검증 결과는 IssueList, 실행 단계(에이전트 · 배치)는 RunSteps, 결재 단계는 ApprovalLine, 한 화면 안의 순서 있는 입력 단계는 Stepper.

## 해부(Anatomy)

root(`div` role=group, `tl-checklist`) · summary(Progress sm "완료 n / 전체건" + 남은 상태 수 `type.caption` `fg.secondary`) · list(`ul`, 위 1px `border.divider`) · item(`li`, 최소 높이 `density.row-height`, 위아래 `space.8`, 아래 1px `border.divider`) · mark(앞 표시 칸 `density.control-height-xs` 정사각, onChange가 있으면 체크 단추, 아이콘 16) · title(500, 끝난 항목 `fg.secondary`) · description(`type.caption` `fg.secondary`) · meta(상태 글자 `fg.primary` 500 · 담당 · 기한 · 보조 글자, `type.caption` `fg.secondary`, 사이 가운뎃점 `fg.tertiary`) · action(Button sm, 끝난 항목은 ghost).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `items` | `ChecklistItem[]` |  | 필수 | 항목(id · title · description · state · due · owner · meta · action · disabled) |
| `label` | `string` |  | 필수 | 목록 이름(접근성) |
| `onChange` | `(id: string, done: boolean) => void` |  |  | 체크 단추를 누를 때(있으면 완료 ↔ 대기를 바꿀 수 있다) |
| `showProgress` | `boolean` | `true` |  | 진행 요약(완료 수 · 막대) |
| `today` | `string` |  |  | 기한 계산 기준일(ISO, 기본 오늘) |
| `loading` | `boolean` | `false` |  | 불러오는 중(Skeleton 줄) |
| `emptyText` | `string` |  |  | 항목이 없을 때 글자 |

## Variants

variant 없음. 상태 4개(`CHECKLIST_STATES`)는 앞 표시의 모양 · 색과 글자로 나뉜다.

| 상태 | 표시 | 색 | 글자 |
|---|---|---|---|
| done | circle-check | `status.success.default` | 완료 |
| doing | circle-dot | `status.info.default` | 진행 |
| pending | 빈 고리(아이콘 원과 같은 지름 · 굵기) | `border.strong` | 대기 |
| blocked | circle-pause | `status.warning.default` | 보류 |

onChange 유무로 체크 단추(누를 수 있다) · 보기 전용이 나뉜다. 줄 바탕을 칠하지 않고 왼쪽 색 띠 · 회색 수 알약이 없다(D-56 · D-57).

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `loading`

default · hover(체크 단추 바탕 `bg.sunken`, `duration.fast`) · focus(체크 단추 포커스 링 `border.focus` 2px) · disabled(항목 `disabled` · 보류 항목: 체크 단추를 누를 수 없고 disabled 항목 제목은 `fg.secondary`, 행동 단추는 그대로) · loading(`loading`: Skeleton list 4줄, `aria-busy`). active · error는 해당 없음(불러오기 실패는 부르는 쪽이 EmptyState).

## 동작

onChange가 있으면 앞 표시가 체크 단추다. 누르거나 Space를 치면 `onChange(id, !done)`를 부른다. 완료 ↔ 대기를 바꾸는 것은 부르는 쪽이다(진행 상태로 되돌릴지도 부르는 쪽이 정한다). 보류 항목은 앞선 일이 끝나야 하므로 누를 수 없다. onChange가 없으면 상태는 보기만 한다(다른 화면에서 일을 끝내면 상태가 바뀌는 목록).

기한: 끝나지 않은 항목은 "11월 25일 · D-19", 오늘이면 "D-day", 지났으면 "11월 4일 · 2일 경과"(본문 색 600 + 앞 경고 아이콘 `status.danger.default`). 끝난 항목은 날짜만. 기준일은 `today`(없으면 오늘)다.

진행 요약: 완료 수 / 전체 수를 Progress(sm)로 보이고, 다 끝나면 막대가 success 톤이 된다. 아래 줄에 남은 상태 수를 "진행 1 · 보류 1 · 대기 2"처럼 센다. 받은 순서를 그대로 쓴다(일의 차례가 순서다). 정렬하지 않는다.

| 키 | 동작 |
|---|---|
| Tab | 체크 단추 · 행동 단추를 차례로 |
| Space | 체크 단추: 완료 ↔ 대기 |
| Enter | 행동 단추를 누른다 |

## 접근성

root는 `role="group"` + `aria-label`(label). 체크 단추는 `role="checkbox"` + `aria-checked`, 이름은 "{제목} 완료 표시"다. 상태는 아이콘 모양과 보이는 글자(완료 · 진행 · 대기 · 보류)로도 전하므로 색에 기대지 않는다. 앞 표시 아이콘은 꾸밈이다. 지난 기한의 글자는 본문 색이라 4.5:1 이상이고 색은 경고 아이콘만 쓴다. 요약 막대는 Progress의 `progressbar`(값 글자 "2 / 6건"). 손가락 입력에서는 앞 표시 칸이 44가 된다.

## 밀도

줄 최소 높이 `density.row-height`(compact 36 · comfortable 40 · touch 48), 앞 표시 칸 `density.control-height-xs`(26 · 26 · 44), 본문 `density.body-font-size`.

## 플랫폼 차이

네이티브는 Pressable 체크 표시(`accessibilityRole="checkbox"` · `accessibilityState={{ checked, disabled }}`) + 같은 아이콘, 행동 단추는 Button. props는 같다.

## 금지 사항

줄 바탕을 상태색으로 칠하기 · 왼쪽 굵은 색 띠(D-57) · 상태를 회색 알약 배지로 줄마다 · 남은 수를 회색 알약으로 · 상태를 색만으로(모양 · 글자 없이) · 끝난 항목에 취소선 · 항목을 상태순으로 다시 정렬(일의 차례가 사라진다) · 한 항목에 행동 단추 둘 이상 → 리뷰. 블록이 `ul` + Badge로 점검 목록을 직접 짜기 → Checklist(SY-9).

## 예시

### 월 마감 점검

체크 단추로 완료를 표시하고, 항목마다 그 일을 하는 화면으로 가는 단추 하나

```tsx
import type { ChecklistItem } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Checklist } from '@terracelab/trellis-react';

const TODAY = '2026-11-06';

const CLOSING: ChecklistItem[] = [
  {
    id: 'bank',
    title: '은행 잔액 대사',
    description: '기업 · 국민 · 외화 계좌 3개',
    state: 'done',
    owner: '정민호',
    meta: '11-06 15:40',
  },
  {
    id: 'sales',
    title: '매출 · 매입 전표',
    description: '11월 6일까지 16건 입력',
    state: 'doing',
    owner: '박서연',
    due: '2026-11-30',
  },
  {
    id: 'payroll',
    title: '급여 전표',
    description: '11월 25일 급여 확정 뒤에 입력합니다',
    state: 'blocked',
    owner: '한서연',
    due: '2026-11-25',
  },
  {
    id: 'fx',
    title: '외화 환산',
    description: 'USD 계좌 · 외상매입금',
    state: 'pending',
    owner: '박서연',
    due: '2026-11-04',
  },
];

function Closing() {
  const [items, setItems] = useState(CLOSING);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <Checklist
        label="11월 결산 준비"
        today={TODAY}
        items={items.map((i) =>
          i.id === 'fx' ? { ...i, action: { label: '환산하기', onPress: () => {} } } : i,
        )}
        onChange={(id, done) =>
          setItems((list) =>
            list.map((i) => (i.id === id ? { ...i, state: done ? 'done' : 'pending' } : i)),
          )
        }
      />
    </div>
  );
}
```

### 온보딩

다른 화면에서 일을 끝내면 상태가 바뀌는 목록이라 체크 단추 없이 보기만 한다

```tsx
import { Checklist } from '@terracelab/trellis-react';

const TODAY = '2026-11-06';

function Onboarding() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <Checklist
        label="테라스원 시작하기"
        today={TODAY}
        items={[
          { id: 'company', title: '회사 정보 입력', state: 'done', meta: '11-03' },
          { id: 'users', title: '사용자 초대', description: '12명 중 9명 가입', state: 'doing' },
          {
            id: 'bank',
            title: '은행 계좌 연결',
            state: 'pending',
            action: { label: '연결', icon: 'landmark', onPress: () => {} },
          },
          {
            id: 'tax',
            title: '전자세금계산서 인증서 등록',
            description: '계좌 연결 뒤에 할 수 있습니다',
            state: 'blocked',
          },
        ]}
      />
    </div>
  );
}
```

### 불러오는 중 · 빈 목록

불러오는 동안 같은 모양의 Skeleton, 항목이 없으면 다음 행동을 말한다

```tsx
import { Checklist } from '@terracelab/trellis-react';

function Loading() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-24)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 4), 1fr))',
      }}
    >
      <Checklist label="11월 결산 준비" items={[]} loading />
      <Checklist
        label="12월 결산 준비"
        items={[]}
        emptyText="12월 결산 항목이 없습니다. 11월 마감 뒤에 만듭니다"
      />
    </div>
  );
}
```
