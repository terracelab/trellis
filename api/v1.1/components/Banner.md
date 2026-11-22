# Banner

> `@terracelab/trellis-react` · CSS `.tl-banner` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Banner } from '@terracelab/trellis-react';
```

## 용도

화면이나 카드 위쪽에 계속 남아 있어야 하는 안내 · 경고를 보여 줄 때 쓴다(마감 임박 · 전송 실패 · 점검 예정). 잠깐 알리고 사라지는 결과는 Toast, 칸 하나의 오류는 Field.

## 해부(Anatomy)

root(`radius.md`, `bg.surface` 바탕, `border.default` 1px 테두리. 톤 바탕 · 왼쪽 띠는 쓰지 않는다) · icon(톤 색 16) · title(`type.label` 600 `fg.primary`) · message(`density.body-font-size` `fg.secondary`) · action(Button sm) · close(IconButton sm "닫기").

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `tone` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `"info"` |  | 톤(아이콘 색) |
| `title` | `string` |  |  | 제목 |
| `children` | `ReactNode` |  |  | 본문 |
| `action` | `ReactNode` |  |  | 오른쪽 동작 |
| `onClose` | `() => void` |  |  | 닫기(있으면 버튼 표시) |

## Variants

tone 5(info · success · warning · danger · neutral). 아이콘은 톤이 정한다(info · circle-check · triangle-alert · circle-alert · info).

## States

지원 상태: `default`

default.

## 동작

onClose가 있을 때만 닫기 버튼을 보인다. 동작 단추는 배너 폭이 560 이상이면 글 오른쪽, 그보다 좁으면(휴대폰 · 좁은 카드, 컨테이너 쿼리) 글 아래 줄로 내려 글 첫머리에 맞춘다. 닫기는 늘 첫 줄 오른쪽이다(PR-38). 배너는 부모 폭을 채운다. 닫은 뒤 다시 보일지는 화면이 정한다(컨트롤드). 동작 버튼은 하나만 둔다. 문장은 무엇이 일어났고 무엇을 하면 되는지 합니다체로 쓴다.

## 접근성

`role="status"`, danger는 `role="alert"`(바로 읽힌다). 글자는 중립 색이고 상태는 아이콘 색 · 제목 글자로 보인다(상태 색 글자는 4.5:1을 못 넘는다). 닫기 버튼은 이름 "닫기"를 갖고 Tab으로 닿는다.

## 밀도

안쪽 여백 `space.8` × `density.card-padding`. 글자는 `density.body-font-size`.

## 플랫폼 차이

없음.

## 금지 사항

한 화면에 배너 둘 이상 · 성공 결과를 배너로 오래 남기기(Toast) · 사과 문구 · 느낌표 → 리뷰.

## 예시

### 톤

아이콘만 상태 색, 면과 글자는 중립

```tsx
import { Banner } from '@terracelab/trellis-react';

function Tones() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <Banner tone="info" title="11월 30일 02:00~04:00 시스템 점검">
        점검 중에는 전표 입력과 세금계산서 발행을 할 수 없습니다.
      </Banner>
      <Banner tone="success">10월 결산 마감을 끝냈습니다.</Banner>
      <Banner tone="warning" title="부가세 예정신고 마감 D-3">
        매입 세금계산서 4건이 아직 수취 확인 전입니다.
      </Banner>
      <Banner tone="neutral">이 거래처는 거래 중지 상태입니다. 발주를 등록할 수 없습니다.</Banner>
    </div>
  );
}
```

### 동작 · 닫기

오류는 alert로 바로 읽히고 다음 행동 버튼 하나

```tsx
import { Button, Banner } from '@terracelab/trellis-react';

function WithAction() {
  return (
    <Banner
      tone="danger"
      title="세금계산서 3건 국세청 전송 실패"
      action={
        <Button size="sm" icon="refresh-cw">
          다시 전송
        </Button>
      }
      onClose={() => {}}
    >
      공급받는자 사업자등록번호를 확인한 뒤 다시 전송하세요.
    </Banner>
  );
}
```

### 좁은 자리

폭이 560 미만이면 동작 단추가 글 아래 줄로 내려가고 닫기는 오른쪽 위에 남는다

```tsx
import { Button, Banner } from '@terracelab/trellis-react';

function Narrow() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5.5)' }}>
      <Banner
        tone="warning"
        title="Employees 담당자가 없습니다"
        action={
          <Button size="sm" icon="user-plus">
            담당자 지정
          </Button>
        }
        onClose={() => {}}
      >
        지정하기 전까지 입사 · 퇴사 할 일은 모두 대표에게 갑니다.
      </Banner>
    </div>
  );
}
```
