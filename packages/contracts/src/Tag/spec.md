# Tag
## 용도
분류 · 키워드 · 사람처럼 상태가 아닌 라벨 하나를 칩으로 보여 줄 때 쓴다. `onRemove`가 있으면 × 단추로 뺄 수 있다. 상태 뜻(승인 · 지연 · 오류)은 Badge · StatusDot, 고르는 칩 묶음은 FilterBar 칩 · SegmentedControl, 칩을 치고 넣는 칸은 TagInput.
## 해부(Anatomy)
root(`span`, `tl-tag`) · icon(16, `fg.secondary`) 또는 person(Avatar 원 24, 꾸밈) · label(`type.label` 500, sm은 `type.caption`, 넘치면 말줄임) · remove(`button`, 보이는 칸 16 · 누르는 영역 24, `x` 아이콘 `fg.secondary`). 면 `bg.sunken`, 테두리 `border.divider` 1px, 모서리 `radius.sm`(사람 칩은 `radius.full`).
## Props
contract 표.
## Variants
variant 2 × size 2. 색은 중립 하나다. 톤 prop이 없다(상태는 Badge).

| variant | 면 | 테두리 | 글자 |
|---|---|---|---|
| subtle(기본) | `bg.sunken` | `border.divider` | `fg.primary` |
| outline | 없음 | `border.strong` | `fg.primary` |

| size | 높이 | 좌우 여백 | 글자 |
|---|---|---|---|
| sm | `space.20` | `space.6` | `type.caption` |
| md(기본) | `space.24` | `space.8` | `type.label` |

person이 있으면 크기와 관계없이 높이 24, 앞 여백 0, 원 아바타가 앞 끝에 붙는 알약 모양이다.
## States
default · hover(× 단추 면 `fg.primary` 10% 섞음 + 아이콘 `fg.primary`, `duration.fast`) · focus(× 단추 포커스 링) · disabled(글자 `fg.disabled`, × 단추 없음, `aria-disabled`). active · loading · error는 해당 없음. 칩 자체는 누르는 부품이 아니다.
## 동작
× 단추를 누르면(마우스 · Enter · Space) `onRemove`를 부른다. 칩을 목록에서 빼는 것은 부르는 쪽이다(컨트롤드). 빼고 나서 초점은 부르는 쪽이 옮긴다(TagInput은 입력 칸으로).

| 키 | 동작 |
|---|---|
| Tab | × 단추로 초점 |
| Enter · Space | 빼기(onRemove) |
## 접근성
× 단추 이름은 "<라벨> 삭제"(`tag.remove`). 라벨이 글자가 아니면 `label`로 준다. 사람 칩의 아바타는 꾸밈이고 이름 글자가 읽힌다. 글자 대비 `fg.primary` / `bg.sunken` 4.5:1 이상, × 아이콘 `fg.secondary` 3:1 이상. 누르는 영역은 보이는 칸 밖으로 24(WCAG 2.5.8).
## 밀도
치수가 밀도와 관계없다(칩 높이는 글줄 높이에 맞춘다). TagInput이 칸 크기에 맞춰 size를 고른다(xs · sm 칸 = sm 칩).
## 플랫폼 차이
네이티브는 View + Text, × 단추는 Pressable(hitSlop 4). props는 같다.
## 금지 사항
상태(승인 · 지연)를 Tag 색으로 → Badge · StatusDot · 행마다 색 칩을 줄줄이(상태는 점 · 글자) · Tag를 단추처럼 누르게 · 사람 칩 아바타를 직접 그리기(Avatar 규칙) → 리뷰.
## 스토리
Basic · Removable · People · Sizes.
## 참고
SY-13(지울 수 있는 Tag), R-T25(참조자 칩), Badge(상태), Avatar(사람 칩), TagInput. 벤치마크는 구조만.
