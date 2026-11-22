# PersonLabel

> `@terracelab/trellis-react` · CSS `.tl-person-label` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { PersonLabel } from '@terracelab/trellis-react';
```

## 용도

표 칸 · 목록 · 결재선 옆에서 사람 한 명을 아바타 + 이름 + 보조 한 줄(직책 · 부서)로 보여 줄 때 쓴다. 오늘 근무 상태(근무 중 · 재택 · 외근 · 휴가 · 퇴근)를 점과 글자로, 메신저 접속 상태(온라인 · 자리 비움 · 다른 용무 중 · 오프라인)를 아바타 점으로 붙일 수 있다. 상세 머리는 ProfileHeader, 사진만은 Avatar, 고르는 사람 목록(master-detail)은 SelectableList.

## 해부(Anatomy)

root(`span` · 링크면 `a` · 단추면 `button`) · Avatar(꾸밈, sm 24 · md 32, 이니셜은 Avatar 규칙인 성을 뺀 두 글자이고 크기와 관계없이 같다. status가 있으면 오른쪽 아래 접속 점) · name(`density.body` 600 `fg.primary`) · meta(caption `fg.secondary`) · presence(StatusDot sm, md는 점 + 글자 · sm은 점만).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  |  | 사람 이름(공석이면 없어도 된다) |
| `meta` | `string` |  |  | 보조 글자(직책 · 부서) |
| `src` | `string` |  |  | 사진 주소 |
| `presence` | `'working' \| 'remote' \| 'fieldwork' \| 'leave' \| 'off'` |  |  | 오늘 근무 상태(md 점 + 글자, sm 점만) |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'` |  |  | 메신저 접속 상태(아바타 점) |
| `size` | `'sm' \| 'md'` | `"md"` |  | sm = 한 줄(표 칸), md = 두 줄(목록) |
| `href` | `string` |  |  | 링크 주소(구성원 상세) |
| `onPress` | `() => void` |  |  | 누를 때(상세 서랍) |
| `vacant` | `boolean` | `false` |  | 공석(점선 아바타 + 담당자 없음) |
| `vacantLabel` | `string` |  |  | 공석 글자(기본 "담당자 없음") |
| `action` | `ReactNode` |  |  | 공석 줄 끝 동작(담당자 지정) |

## Variants

size sm(한 줄: 이름 옆에 보조 글자, 근무 상태는 점만, 표 행 높이 그대로) · md(두 줄: 이름 아래 보조 글자, 근무 상태는 점 + 글자). href = 링크, onPress = 단추, 둘 다 없으면 글자. 공석(vacant, PR-34): 점선 아바타(Avatar vacant) + 이름 자리에 vacantLabel(기본 "담당자 없음", `fg.secondary` 보통 굵기). 아바타 크기 · 글자 · 줄 수가 사람 있는 줄과 같아 높이가 같다(md 두 줄을 맞추려면 meta를 함께 준다). 줄은 누르지 않고(href · onPress 무시), 지정 동작은 action(표 칸 sm은 Button xs, 목록 md는 Button sm)으로 글 뒤에 붙인다.

## States

지원 상태: `default` · `hover` · `focus`

default · hover(누를 수 있을 때 이름 밑줄, `duration.fast`) · focus(포커스 링).

## 동작

이름 · 보조 글자는 한 줄로 자르고 말줄임. sm은 근무 상태를 점 하나로 줄여 표 md 칸에서도 이름이 폭을 지킨다(R-T35). 상태 글자는 숨은 글자(화면 읽기)와 점의 `title`(가리키면 툴팁)로 남는다. presence 톤은 `PRESENCE_TONES`(근무 중 success · 재택 · 외근 info · 휴가 warning · 퇴근 neutral).

사람 상태 어휘는 둘이고 합치지 않는다(R-T26). `presence`(근무 상태 `PresenceState`)는 오늘 어디서 일하는지(인사 · 근태 · 조직도), `status`(접속 상태 `AvatarStatus`)는 지금 메신저에 있는지(메신저 · 알림)다. 둘 다 줄 수 있다. 근무 상태만 아는 화면이 아바타 점을 그릴 때는 contracts `presenceToStatus`(근무 중 · 재택 → 온라인, 외근 → 자리 비움, 휴가 · 퇴근 → 오프라인)로 바꾼다. 라벨은 `presenceLabel` · `avatarStatusLabel`.

href는 a 태그다. TrellisProvider `navigate`가 있으면 앱 안 주소를 새로 고침 없이 그 함수로 연다(R-T34). Ctrl · Cmd · 가운데 단추 누름(새 탭) · 바깥 주소 · `#id`는 브라우저에 맡긴다. onPress는 이동 전에 불린다.

## 접근성

아바타는 꾸밈(aria-hidden)이라 이름을 두 번 읽지 않는다. 접속 상태는 이름 뒤 숨은 글자로 읽는다. 링크 · 단추 이름 = 이름 + 접속 상태 + 보조 글자 + 근무 상태. 상태는 색만이 아니라 글자로도 전한다. md는 보이는 글자, sm은 숨은 글자(`tl-sr-only`)라 sm에서도 근무 상태를 읽는다. 공석은 "담당자 없음" 글자로 읽는다. 아바타는 꾸밈이다.

## 밀도

sm은 compact 행(36)에 들어간다. md는 목록 · 카드용(두 줄 행은 `row.heightTall`).

## 플랫폼 차이

네이티브는 Pressable, 근무 상태 점은 같은 톤.

## 금지 사항

행마다 근무 상태 알약 · 이름 왼쪽 색 띠(D-56) · onRowPress가 있는 표 칸에 onPress(행 열기와 겹친다) → 리뷰.

## 예시

### 구성원 목록

이름 아래 직책 · 부서와 오늘 근무 상태(점 + 글자)

```tsx
import { PersonLabel } from '@terracelab/trellis-react';

const TEAM = [
  { name: '이도윤', meta: '대표', presence: 'working' },
  { name: '한서연', meta: '인사팀 · 매니저', presence: 'remote' },
  { name: '정민호', meta: '국내영업팀 · 책임', presence: 'fieldwork' },
  { name: '오하늘', meta: '플랫폼팀 · 선임', presence: 'leave' },
] as const;

function Team() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      {TEAM.map((p) => (
        <PersonLabel key={p.name} name={p.name} meta={p.meta} presence={p.presence} />
      ))}
    </div>
  );
}
```

### 표 칸

sm은 한 줄이라 표 행 높이를 늘리지 않는다. 근무 상태는 점만 보여 이름이 폭을 지킨다

```tsx
import { DataGrid, PersonLabel } from '@terracelab/trellis-react';

const ROWS = [
  {
    id: 'E-0012',
    name: '한서연',
    meta: '인사팀 · 매니저',
    presence: 'remote',
    hired: '2022-03-02',
    leave: 11.5,
  },
  {
    id: 'E-0031',
    name: '정민호',
    meta: '국내영업팀 · 책임',
    presence: 'working',
    hired: '2020-07-13',
    leave: 6,
  },
  {
    id: 'E-0047',
    name: '오하늘',
    meta: '플랫폼팀 · 선임',
    presence: 'leave',
    hired: '2024-01-08',
    leave: 3,
  },
] as const;

function InTable() {
  return (
    <DataGrid
      caption="구성원"
      rowKey="id"
      rows={ROWS}
      columns={[
        {
          key: 'name',
          header: '이름',
          width: 'lg',
          render: (row: (typeof ROWS)[number]) => (
            <PersonLabel size="sm" name={row.name} meta={row.meta} presence={row.presence} />
          ),
        },
        { key: 'id', header: '사번', width: 'sm' },
        { key: 'hired', header: '입사일', width: 'sm', format: 'date' },
        { key: 'leave', header: '남은 연차', width: 'sm', format: 'number', unit: '일' },
      ]}
    />
  );
}
```

### 링크

누르면 구성원 상세가 열린다. 가리키면 이름에 밑줄

```tsx
import { PersonLabel } from '@terracelab/trellis-react';

function Link() {
  return (
    <PersonLabel name="한서연" meta="인사팀 · 매니저" href="#member-E-0012" presence="working" />
  );
}
```

### 접속 상태

메신저 접속은 아바타 점(status), 오늘 근무는 점 + 글자(presence). 근무 상태만 알면 presenceToStatus로 점을 만든다

```tsx
import { presenceToStatus } from '@terracelab/trellis-contracts';
import { PersonLabel } from '@terracelab/trellis-react';

function Status() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <PersonLabel name="한서연" meta="인사팀 · 매니저" status="online" />
      <PersonLabel name="정민호" meta="국내영업팀 · 책임" status="busy" presence="fieldwork" />
      <PersonLabel name="오하늘" meta="플랫폼팀 · 선임" status={presenceToStatus('leave')} />
    </div>
  );
}
```

### 공석

담당자가 없으면 점선 아바타 + "담당자 없음". 사람 있는 줄과 높이가 같고, 지정 단추는 action으로 붙인다

```tsx
import { Button, PersonLabel } from '@terracelab/trellis-react';

function Vacant() {
  const row = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--tl-space-16)',
  } as const;
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <div style={row}>
        <PersonLabel name="한서연" meta="Operations 담당" />
        <PersonLabel vacant meta="Employees 담당" />
        <PersonLabel
          vacant
          meta="Numbers 담당"
          action={
            <Button size="sm" variant="secondary" icon="user-plus">
              담당자 지정
            </Button>
          }
        />
      </div>
      <div style={row}>
        <PersonLabel name="한서연" size="sm" />
        <PersonLabel vacant size="sm" />
        <PersonLabel
          vacant
          size="sm"
          action={
            <Button size="xs" variant="ghost">
              지정
            </Button>
          }
        />
      </div>
    </div>
  );
}
```
