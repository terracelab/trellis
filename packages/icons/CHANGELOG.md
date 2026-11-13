# @terracelab/trellis-icons

## 1.0.0

### Major Changes

- 1.0.0. 첫 공개 버전이다. 0.x 미리보기를 마친다. 이후 토큰 이름과 컴포넌트 props의 변경 · 삭제는 major 버전에서만 하고 자동 변환 스크립트를 함께 낸다

### Minor Changes

- UI 아이콘 thumbs-up · thumbs-down을 더했다(에이전트 답변 평가 좋음 · 나쁨).
- UI 아이콘 7개를 더했다: smile-plus · reply(메시지 반응 추가 · 답글) · heart · party-popper(반응 종류) · pin-off(고정 해제) · panel-right-open(옆 칸 열기) · bot(업무 도우미 메뉴).
- 모듈 타일 일러스트 15종을 더했다: 세무 · 재고 · 입출고 · 배송·배차 · 수출입 · 상품 · 주문 · 취소·반품 · 정산 · 쿠폰·프로모션 · 판매 채널 · 현장 실적 · 설비 · 품질 · 자재. 모듈 35개 전부 타일이 있다(타일 36개, 지출결의 포함).
- 모듈 타일 일러스트 9종 추가(일정·게시판·메신저·문서함·전사문서·부서문서·영업기회·견적·상담). 모듈 20종 전부 타일을 가진다(미배정 지출결의 포함 21종). `modulesWithoutTile`은 빈 배열.
- 모듈 타일 일러스트 12종(`src/module-tiles/`)과 파이프라인(`scripts/module-tiles.mjs`: 정규화·검증·스프라이트·manifest·JS export), `@terracelab/trellis-icons/module-tiles` export 추가(D-36). 타일이 없는 모듈은 생성형 아이콘으로 폴백한다.
- 파일 보기 · 오류 화면 · 엑셀 업로드 아이콘 7개를 더했다(트랙 G PG-44): `zoom-in` · `zoom-out` · `rotate-cw` · `scan` · `file-up` · `map-pin-off` · `timer-off`.
- AppShell 옆 칸 폭을 바꿀 수 있다(`asideWidth` · `defaultAsideWidth` · `onAsideWidthChange`). 옆 칸 왼쪽 가장자리 손잡이를 끌거나 ← → · Home · End로 바꾸고, Enter나 두 번 누르기로 기본 폭(400)으로 돌아간다. 범위는 320 ~ 720이고 본문 옆 열이면 본문이 560 아래로 줄지 않는다.

  AppShell에 사이드바 접기 단추를 더했다(`onSidebarCollapsedChange` · `defaultSidebarCollapsed`). 틀이 사이드바 안 SideNav에 접힘을 넘기므로 SideNav에 `collapsed`를 따로 주지 않아도 된다. 접혔을 때 맨 위에 보일 짧은 로고는 `brandCollapsed`. 옆 칸이 본문 옆 열로 열려 본문이 1024보다 좁아지면 사이드바가 저절로 접힌다(`autoCollapseSidebar`, 기본 true).

  SideNav 묶음 열림을 앱이 정하고 알 수 있다: 묶음 `open`(제어) · `onSectionOpenChange(id, open)`. 지금 화면(activeId)이 접힌 묶음 안으로 바뀌면 그 묶음을 연다(`revealActive`, 기본 true). defaultOpen이 false여도 지금 화면이 든 묶음은 열린 채 시작한다. 지금 화면이 든 묶음이 닫혀 있으면 머리 글자가 지금 화면 색 · 굵기가 되고 화면 낭독기는 "지금 화면 있음"을 읽는다. 묶음 머리에 `data-section-id`가 붙고, 닫힌 묶음은 `aria-controls`를 달지 않는다.

  새 컴포넌트 AgentReplay: 에이전트가 화면을 옮기며 칸을 채우는 모습(커서 · 지금 칸 테두리 · 누름 물결 · 아래 진행 띠)을 클릭을 막지 않는 맨 위 층에 그린다. 휴대폰에서는 탭바 위 꽉 찬 띠, 움직임 줄이기에서는 테두리만. 아이콘 `mouse-pointer-2`를 더했다.

### Patch Changes

- 고객(customers) 모듈 타일을 다른 타일과 같은 문법(흰 유광 주 오브젝트 + 청록 포인트)으로 다시 그렸다. 반투명 원판과 평면 화살표를 없앴다.
- 서비스 저장소에서 git 하위 모듈로 쓰기(D-58). react · contracts · icons에 `@terracelab/source` 내보내기 조건을 더해 개발 중에는 소스를 바로 읽는다. 서비스용 스킬 패키지(install · doctor · docs)를 추가했다. SegmentedControl이 Field 안에서 칸 폭으로 늘어나던 것을 고쳤다.
- 회사별 테마 생성기 `@terracelab/trellis-tokens/theme`(D-58). 브랜드 색 하나와 회색 톤(차가운 · 중립 · 따뜻한)으로 semantic 변수를 덮는 theme.css를 만들고 대비를 잰다. 컬러칩 8개, `gen-theme` 명령. 아이콘에 `palette`를 더했다.
