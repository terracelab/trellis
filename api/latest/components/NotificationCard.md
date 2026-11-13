# NotificationCard

> `@terracelab/trellis-react` · CSS `.tl-notification-card` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { NotificationCard } from '@terracelab/trellis-react';
```

## 용도

모듈 하나의 처리할 일(읽지 않은 메일 · 3일 넘은 결재)을 숫자 하나와 함께 홈에 보여 줄 때 쓴다. 지표 숫자는 KpiCard, 긴 목록은 Card.

## 해부(Anatomy)

root(`bg.surface`, `border.divider`, `radius.lg`, 안쪽 `density.card-padding`) · icon(ModuleIcon 40) · unread(점 `brand.default`) · title(`type.label` 600 `fg.primary`) · description(`type.caption` `fg.secondary`) · time(`type.caption` `fg.tertiary`) · count(우상단 Badge solid, 중립 `bg.sunken` · 지연 `status.danger`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `module` | `ModuleId` |  | 필수 | 모듈 id |
| `title` | `string` |  | 필수 | 상태 한 줄 |
| `description` | `string` |  |  | 보조 한 줄 |
| `count` | `number` |  |  | 카운트(99+) |
| `time` | `string` |  |  | 발생 시각 글자 |
| `tone` | `'neutral' \| 'danger'` | `"neutral"` |  | 카운트 배지 색 |
| `unread` | `boolean` | `false` |  | 읽지 않음 점 |
| `onPress` | `() => void` |  |  | 눌렀을 때(카드 전체가 버튼) |

## Variants

tone neutral · danger(카운트 배지 색) × unread 유무 × onPress 유무.

## States

지원 상태: `default` · `hover` · `active` · `focus`

default · hover(`border.strong`, `bg.canvas`) · active(`bg.sunken`) · focus(링). hover · active · focus는 onPress가 있을 때만.

## 동작

카운트는 `formatCount`(99+). 0이나 없으면 배지를 숨긴다. danger는 지연 · 오류일 때만 쓴다(D-35). time은 화면이 서식을 맞춘 글자를 그대로 보인다(09:12 · 3일 전, content.md §4). onPress가 있으면 카드 전체가 버튼이다.

## 접근성

onPress가 있으면 `<button>`이고 이름은 모듈 라벨 · 제목 · 보조 줄 · 카운트("12건") · 시각 순서로 읽힌다. 읽지 않음은 점과 숨긴 "읽지 않음" 글자로 전한다. 카운트 숫자는 숨기고 "12건" 글자를 읽는다.

## 밀도

안쪽 여백 `density.card-padding`(12 · 16). 타일은 40 고정.

## 플랫폼 차이

네이티브는 Pressable, hover 없음. 모바일 홈은 1열로 쌓는다.

## 금지 사항

제목에 인사말 · 느낌표 · 숫자 두 개 이상 · 카운트를 기본 위험 색으로 → 리뷰. 카드 span 규칙은 NotificationHome 패턴이 강제한다.

## 예시

### 알림 카드 홈

모듈 타일 · 상태 한 줄 · 숫자 하나, 지연만 위험 색

```tsx
import { NotificationCard } from '@terracelab/trellis-react';

function Home() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4.5)), 1fr))',
        gap: 'var(--tl-space-12)',
      }}
    >
      <NotificationCard
        module="mail"
        title="읽지 않은 메일"
        description="(주)한빛식자재 발주 확인 외"
        count={8}
        time="09:12"
        unread
        onPress={() => {}}
      />
      <NotificationCard
        module="approval"
        title="3일 넘은 결재"
        description="지출결의 2건 · 구매품의 2건"
        count={4}
        tone="danger"
        time="어제"
        onPress={() => {}}
      />
      <NotificationCard
        module="purchasing"
        title="발주 승인 대기"
        count={12}
        time="08:40"
        onPress={() => {}}
      />
      <NotificationCard
        module="inventory"
        title="안전재고 미달 품목"
        description="냉동 새우 외 5개 품목"
        count={6}
        time="07:00"
        onPress={() => {}}
      />
    </div>
  );
}
```

### 숫자 없음

처리할 일이 없으면 배지를 숨긴다

```tsx
import { NotificationCard } from '@terracelab/trellis-react';

function NoCount() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <NotificationCard
        module="accounting"
        title="11월 부가세 신고서 검토 완료"
        description="담당 최회계"
        time="3일 전"
      />
    </div>
  );
}
```
