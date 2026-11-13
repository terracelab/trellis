# Avatar

> `@terracelab/trellis-react` · CSS `.tl-avatar` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Avatar } from '@terracelab/trellis-react';
```

## 용도

사람 한 명(기안자 · 결재자 · 담당자 · 작업자)을 동그란 사진이나 이름 글자로 보여 줄 때 쓴다. 모듈은 ModuleIcon, 회사 · 거래처는 글자로.

## 해부(Anatomy)

root(둥근 사각형(지름의 30% 모서리) · circle은 원, `size.avatar-24/32/40/48`, 바탕 `avatar.{1~6}.bg`) · image(사진, 모양에 맞춰 자름) · initials(`avatar.{1~6}.fg`, 600, 한글 이름은 성을 뺀 두 글자(김테라 → 테라), 24는 `type.micro`, 32는 `type.caption`, 40은 `type.label`, 48은 `type.h3`) · status(우하단 점, `bg.surface` 테두리 2).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  | 사람 이름(접근성 이름 · 이니셜). 공석이면 없어도 된다 |
| `src` | `string` |  |  | 사진 주소 |
| `size` | `24 \| 32 \| 40 \| 48` | `32` |  | 지름(size.avatar 토큰) |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'` |  |  | 근무 상태 점 |
| `decorative` | `boolean` | `false` |  | 장식(옆에 이름이 있을 때) |
| `shape` | `'square' \| 'circle'` | `"square"` |  | 모양(둥근 사각형 · 원) |
| `tone` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` |  |  | 글자 바탕 색(없으면 이름으로) |
| `vacant` | `boolean` | `false` |  | 공석(점선 테두리 + 사람 아이콘) |

## Variants

shape 2(square 기본 · circle) × tone 6(없으면 이름으로 고른다: 같은 사람은 어디서나 같은 색, PR-27) × size 4 × status 5(없음 · online `status.success` · away `status.warning` · busy `status.danger` · offline `fg.disabled`). 공석(vacant, PR-34): 담당자가 없는 자리. 바탕 없이 점선 1px 테두리(`border.strong`) + 사람 아이콘(`fg.tertiary`, 24 · 32는 16, 40 · 48은 20). 크기 · 모양(shape)은 사람 아바타와 같아 같은 줄에서 높이 · 정렬이 흔들리지 않는다. name 없이 쓸 수 있다.

## States

지원 상태: `default`

default. 사진을 불러오는 동안과 실패했을 때는 이니셜을 보인다.

## 동작

이니셜은 한글 이름이면 성을 뺀 이름 두 글자다(김테라 → 테라, 남궁민수 → 민수, 두 글자 이름은 그대로). 영문 이름은 단어 머리글자 둘(Kim Tera → KT). 크기와 관계없이 같은 글자다. 24도 두 글자이고 글자 크기만 `type.micro`로 줄인다(R-T46). 사람을 그리는 컴포넌트(PersonLabel · OrgChart · TeamSchedule · ProfileHeader)는 모두 Avatar를 써서 이 규칙 하나를 따른다. 이니셜을 따로 만들지 않는다. 사진은 다 불러온 뒤에 바꿔 끼워 깜박이지 않는다.

`status`는 메신저 접속 상태(`AvatarStatus`: 온라인 · 자리 비움 · 다른 용무 중 · 오프라인)다. 오늘 근무 상태(`PresenceState`: 근무 중 · 재택 · 외근 · 휴가 · 퇴근, PersonLabel `presence`)와 다른 어휘이고 합치지 않는다(R-T26). 근무 상태만 아는 화면은 contracts `presenceToStatus`로 점을 만든다(근무 중 · 재택 → 온라인, 외근 → 자리 비움, 휴가 · 퇴근 → 오프라인). 점 색 톤은 `AVATAR_STATUS_TONES`, 라벨은 `avatarStatusLabel`이다. 여러 사람을 겹쳐 보일 때는 AvatarGroup.

## 접근성

`role="img"`, 이름은 `aria-label`(이름 + 근무 상태: "김테라, 자리 비움"). 옆에 이름 글자가 이미 있으면 `decorative`로 숨겨 두 번 읽지 않게 한다. 상태 점은 색만이 아니라 접근성 이름과 `title`로도 전한다. 공석은 "담당자 없음"으로 읽는다(점선만으로 말하지 않는다). decorative 규칙은 같다.

## 밀도

크기는 밀도와 무관하다. 표 행은 24, 목록 · 결재선은 32, 프로필 카드는 48.

## 플랫폼 차이

네이티브는 Image의 onError로 이니셜로 돌아간다. props는 같다.

## 금지 사항

상태 점을 결재 상태에 쓰기(결재는 Badge approval) · 사진 대신 일러스트 마스코트 → 리뷰.

## 예시

### 크기

표 행 24 · 목록 32 · 결재선 40 · 프로필 48

```tsx
import { Avatar } from '@terracelab/trellis-react';

function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)', alignItems: 'center' }}>
      <Avatar name="김테라" size={24} />
      <Avatar name="김테라" size={32} />
      <Avatar name="김테라" size={40} />
      <Avatar name="김테라" size={48} />
    </div>
  );
}
```

### 근무 상태

메신저 · 조직도의 우하단 점과 접근성 이름

```tsx
import { Avatar } from '@terracelab/trellis-react';

function Status() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-12)', alignItems: 'center' }}>
      <Avatar name="박영업" status="online" />
      <Avatar name="이구매" status="away" />
      <Avatar name="최회계" status="busy" />
      <Avatar name="정물류" status="offline" />
    </div>
  );
}
```

### 이름 옆

이름 글자가 이미 있으면 장식으로 숨긴다

```tsx
import { Avatar } from '@terracelab/trellis-react';

function WithName() {
  return (
    <span style={{ display: 'inline-flex', gap: 'var(--tl-space-8)', alignItems: 'center' }}>
      <Avatar name="한결재" size={24} decorative />
      한결재 · 영업2팀 과장
    </span>
  );
}
```

### 모양 · 색

사람은 둥근 사각형이 기본, 색은 이름으로 고른다(같은 사람 = 같은 색)(PR-27)

```tsx
import { Avatar } from '@terracelab/trellis-react';

function ShapesAndTones() {
  const names = ['김테라', '이민호', '최유진', '정하늘', '한지민', '오세훈'];
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
        {names.map((n) => (
          <Avatar key={n} name={n} size={40} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
        {names.map((n) => (
          <Avatar key={n} name={n} size={40} shape="circle" />
        ))}
      </div>
    </div>
  );
}
```

### 공석

담당자가 없는 자리. 점선 테두리 + 사람 아이콘이고 "담당자 없음"으로 읽는다. 크기 · 모양은 사람 아바타와 같다

```tsx
import { Avatar } from '@terracelab/trellis-react';

function Vacant() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-8)' }}>
        {([24, 32, 40, 48] as const).map((size) => (
          <Avatar key={size} vacant size={size} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tl-space-8)' }}>
        <Avatar name="김테라" size={32} />
        <Avatar vacant size={32} />
        <Avatar name="김테라" size={32} shape="circle" />
        <Avatar vacant size={32} shape="circle" />
      </div>
    </div>
  );
}
```
