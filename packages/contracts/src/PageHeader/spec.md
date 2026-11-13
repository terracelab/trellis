# PageHeader
## 용도
화면 맨 위의 이름 · 위치 · 동작. 모든 업무 화면이 하나씩 가진다.
## 해부(Anatomy)
breadcrumbs(`type.caption` fg.tertiary, `/` 구분) · back(IconButton) · title(`type.h1` 28 · 700) · meta · description(`fg.secondary`) · actions(오른쪽) · tabs(아래). PR-26: actions 안 크기를 정하지 않은(md) Button · IconButton은 `density.control-height-lg`(화면 행동은 한 단계 크게). 화면 행동은 라벨 단추가 기본이고 아이콘 전용은 3차 행동에만.
## Props
contract 표.
## Variants
breadcrumbs · back · tabs 유무. siblings(PR-27): 같은 묶음 화면 2~4개를 나란히 둔다. 지금 화면만 h1(`type.h1`, `fg.primary`)이고 나머지는 한 단계 작은 `type.h3`(`fg.tertiary`, 기준선은 h1에 맞춤)이다. 가리키면 `fg.secondary` + 밑줄 `border.width.2`로 누를 쪽이 보인다(D-141 확정). 형제 사이는 `space.32`이고 한가운데에 세로 구분선(`border.strong`, 줄 높이의 절반)을 둔다. 이름 안 가운뎃점(법인 · 임원 · 주주)과 형제 사이가 섞여 한 제목처럼 읽히지 않게 하려는 것이다. 줄이 넘치면 새 줄 맨 앞 구분선은 감춘다. 제목 아래 Tabs와 함께 쓰면 큰 묶음(제목 줄) → 작은 묶음(탭) 두 단계가 된다.
## States
default.
## 동작
1024 미만에서는 actions가 제목 아래로 내려간다. 형제(siblings)가 있으면 제목 줄은 형제만 두고 meta는 설명 줄(description 옆)로 내린다(PR-38). 휴대폰(폭 `breakpoint.sm` 미만)에서 형제 줄은 줄바꿈하지 않는다: 한 줄 가로 스크롤(스냅)이고 지금 화면이 보이게 그 줄만 옆으로 옮긴다(페이지 스크롤은 그대로). 넘치는 오른쪽 끝은 흐려진다. 휴대폰(폭 `breakpoint.sm` 미만)과 touch 밀도에서는 뒤로 단추가 엄지로 누르는 큰 크기가 된다. 크기는 `density.control-height-lg`이고 `size.touch.min`(44)보다 작아지지 않는다. touch에서는 56이다. 아이콘은 20으로 키우고, 제목이 한 줄이면 단추 가운데 높이에 맞춘다.
## 접근성
제목은 `<h1>`, 위치는 `<nav aria-label="위치">`.
## 밀도
아래 여백 `density.gutter`. 뒤로 단추는 넓은 화면 `density.control-height-md`, 휴대폰 · touch는 max(`size.touch.min`, `density.control-height-lg`).
## 플랫폼 차이
네이티브는 내비게이션 바가 대신한다.
## 금지 사항
인사말 제목(content.md §5) · primary 두 개.
## 스토리
List(VRT) · Detail · Siblings(VRT, 1280 · 390).
## 참고
content.md §5 화면 제목.
