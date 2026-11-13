# AgentReplay
## 용도
에이전트(AI 도우미)가 화면을 옮기며 칸을 채우고 등록하는 모습을 사람에게 보여 줄 때 쓴다. 커서 · 지금 다루는 칸의 테두리 · 누름 물결과 아래 진행 띠(누가 · 무엇을 · 몇 단계 · 건너뛰기 · 멈추기)를 맨 위 층에 그린다. 화면 조작은 앱이 한다. 이 컴포넌트는 앱이 잰 좌표를 받아 그리기만 한다. 대화와 결과 확인은 옆 칸(AppShell `aside`)의 MessageThread · RunSteps · ProposalCard가 맡는다.
## 해부(Anatomy)
layer(화면 전체 `position: fixed`, `z.toast`, 누름은 통과) · ring(지금 칸 둘레 `space.4` 바깥, `border-width.2` `border.focus`, `radius.md`) · pointer(Icon `mouse-pointer-2` 20, 면 `fg.strong` · 테두리 `bg.surface` + 이름표: `fg.strong` 바탕 `fg.inverse` `type.caption` 600 알약, label 앞 점) · ripple(지름 `space.32` 원, `border.focus` 테두리, 퍼지며 사라짐) · bar(진행 띠: `bg.elevated`, `border.default`, `radius.lg`, `shadow.lg`, 높이 최소 `density.control-height-lg`. 안에 점 + label(600 `fg.strong`) · caption · trail(`type.caption` `fg.secondary`, "회계 › 세금계산서") · "3/7단계 · 약 20초 남음" · 단추).
## Props
contract 표. 웹은 `container`(그릴 자리, 기본 document.body 포털, null이면 제자리)를 더 받는다.
## Variants
status running(커서 · 테두리 · 물결 + 건너뛰기 · 멈추기) · done(체크 아이콘 + summary + 결과 보기 · 닫기) · stopped("멈춤 · " + caption + 닫기). labelColor는 차트 슬롯(`series-1` ~ 5 · 상태 색) 이름만 받는다. 범주 식별색 토큰(R-38)이 생기면 그 슬롯을 받는다.
## States
default · focus(띠 단추의 포커스 링). hover · active는 Button을 따른다. 띠 말고는 누를 수 없어 disabled · loading · error가 없다(실패는 caption 글로 알린다).
## 동작
층은 화면을 덮지만 `pointer-events: none`이라 아래 화면을 그대로 누를 수 있다. 띠만 누를 수 있다. pointer · ring · ripples는 화면 왼쪽 위 기준 px(getBoundingClientRect와 같은 좌표)이고, 바뀌면 커서는 `duration.slow`, 테두리는 `duration.normal`로 미끄러진다. ripples는 id가 새로 생길 때 한 번 퍼진다(`duration.slower`). 커서 · 테두리 · 물결은 running일 때만 그린다.
띠는 넓은 화면에서 아래 가운데에 뜨고, `--tl-toast-offset-bottom`(아래 시트 · 휴대폰 탭바 · 고정 ActionBar 높이, PR-19)만큼 올라간다. `breakpoint.sm` 미만에서는 탭바 바로 위 좌우 꽉 찬 띠가 되고 trail을 숨긴다. 글이 길면 caption이 말줄임된다(휴대폰은 두 줄까지 감싼다).
건너뛰기(onSkip)는 남은 단계를 보여 주지 않고 끝까지 바로 간다. 멈추기(onStop)는 running에서 멈춤, done · stopped에서 닫기다. 결과 보기(onOpenResult)는 done에서만 보인다.
움직임 줄이기(`prefers-reduced-motion` · `data-motion="reduce"`)에서는 커서와 물결을 그리지 않고 테두리만 둔다. 테두리도 미끄러지지 않고 바로 옮긴다(시간 토큰 0).
## 접근성
층의 그림(커서 · 테두리 · 물결)은 `aria-hidden`이다. 띠는 `section`(이름 "{label} 작업 재생")이고, 글 부분은 `role="status"`라 caption · 단계가 바뀔 때 조용히 읽힌다. 단추는 글자 단추("건너뛰기" · "멈추기" · "닫기" · "결과 보기")라 이름이 그대로 읽힌다. 색 점은 꾸밈이고 누가 하는지는 label 글로 말한다. 끝남은 체크 아이콘과 summary 글로, 멈춤은 "멈춤" 글로 말한다. 포커스를 옮기지 않는다(사람이 하던 자리를 빼앗지 않는다).
## 밀도
띠 단추는 Button sm(`density.control-height-sm`). 띠 높이 최소 `density.control-height-lg`. 휴대폰 터치 밀도에서는 단추가 손가락 크기가 된다.
## 플랫폼 차이
웹만. 네이티브 앱에는 화면 재생이 없다(1.0 뒤, D-101).
## 금지 사항
층이 누름을 막게 두기(`pointer-events`를 켜기) · 재생 중 포커스를 옮기기 · 커서 이동만으로 진행을 알리기(caption 글이 늘 있다) · 띠를 화면 위쪽에 두기(옆 칸 · 바와 겹친다) · 데이터 변경을 재생만으로 끝내기(바꾸는 일은 ProposalCard 승인 뒤).
## 스토리
Running · Done · Phone · States.
## 참고
R-41(서비스 AI 도우미), AppShell 옆 칸(PG-33), patterns/ConversationalWork, D-130.
