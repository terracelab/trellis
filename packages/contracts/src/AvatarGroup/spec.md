# AvatarGroup
## 용도
참석자 · 참조자 · 방 멤버처럼 여러 사람을 한 자리에 겹친 아바타로 보여 줄 때 쓴다. 자리가 넘치면 마지막 자리에 "+N"을 둔다. 사람 한 명은 Avatar · PersonLabel, 넣고 빼는 사람 칩은 TagInput person, 사람 이름 목록이 필요하면 글자로 나열한다.
## 해부(Anatomy)
root(`span` role=img, `tl-avatar-group`) · item(Avatar, 꾸밈, 앞 아바타를 `space.6`(24) · `space.8`(32) · `space.10`(40)만큼 덮는다, 둘레 `bg.surface` 2px 테두리) · more("+N", 아바타와 같은 크기, `bg.sunken` 위 `fg.primary`, `type.micro` 600 tabular, 넘친 이름은 `title`).
## Props
contract 표.
## Variants
size 3 × shape 2.

| size | 아바타 | 겹침 | +N 글자 |
|---|---|---|---|
| 24(기본) | `size.avatar.24` | `space.6` | `type.micro` |
| 32 | `size.avatar.32` | `space.8` | `type.caption` |
| 40 | `size.avatar.40` | `space.10` | `type.label` |

shape square(기본) = Avatar와 같은 둥근 사각형, circle = 원(사람 칩 · 원 아바타 화면과 맞출 때).
## States
default만. 누르는 부품이 아니다. hover · active · focus · disabled · loading · error는 해당 없음(목록을 열려면 Popover 트리거로 감싼다).
## 동작
`avatarGroupSlots(people, max)`가 보일 사람과 넘친 수를 정한다. 사람 수가 max 이하면 전부, 넘치면 max − 1명 + "+N"이라 자리 수는 늘 max다. 뒤 아바타가 앞 아바타 오른쪽을 덮는다(앞 사람의 오른쪽 아래 상태 점은 가려지므로 상태 점을 넘기지 않는다).
## 접근성
한 덩어리 그림이다(`role="img"`). 이름은 `label`(참석자 6명), 없으면 "앞 이름들 외 N명"(`avatarGroup.others`). 아바타 하나하나는 꾸밈이라 이름을 두 번 읽지 않는다. 넘친 사람 이름은 +N의 `title`로 가리키면 보인다. +N 글자 `fg.primary` / `bg.sunken` 4.5:1 이상.
## 밀도
치수가 밀도와 관계없다(아바타 크기 토큰).
## 플랫폼 차이
네이티브는 View 겹침(음수 여백) + Text "+N". props는 같다.
## 금지 사항
상태 점을 겹친 아바타에 넣기(가려진다) → PersonLabel · 사람 수만큼 아바타를 다 그려 줄을 넘기기 · +N을 회색 알약 배지로 · 이니셜을 직접 만들기(Avatar 규칙) → 리뷰.
## 스토리
Basic · Sizes · InRow.
## 참고
SY-13(AvatarGroup), PG-35, Avatar(이니셜 규칙 R-T46), TagInput person. 벤치마크는 구조만.
