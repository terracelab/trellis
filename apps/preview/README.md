# 미리보기 (`@terracelab/preview`)

토큰 빌드 산출물(+ 차트 섹션은 `@terracelab/trellis-react/charts`)로 그린 단일 HTML 갤러리다. 쇼케이스(헥사곤 모듈 지도 히어로 · 기기 콜라주 · 알림 카드 월), 업무 홈(실제 비율의 테라스원 홈 창 · 모듈 격자판 · 모바일 홈), 차트 · 데이터 시각화(대시보드 + 390), 토큰, 타이포그래피, 아이콘, P0 컴포넌트 경량 마크업, 밀도 비교(compact·comfortable 나란히)를 한 페이지에서 본다. 상단 바에서 Light·Dark, Compact·Comfortable, 프레임 폭 1440·1024·390을 바꾼다. 실제 창이 1024보다 좁으면 390 레이아웃을 자동으로 쓴다.

```bash
pnpm --filter @terracelab/trellis-tokens build   # 토큰이 바뀌었으면 먼저
pnpm --filter preview build                      # apps/preview/dist/preview.html 생성
open apps/preview/dist/preview.html              # 폰트까지 인라인이라 오프라인에서도 같다
pnpm --filter preview check                      # 크기·외부 요청·axe 4조합 검사
pnpm --filter preview dev                        # 고치면서 볼 때
```

- 쇼케이스는 판 5개다(PG-04, D-111): 히어로(모듈 지도) · 기기 콜라주 · 알림 카드 월 · 회사 색 · 업무 영역. 앞 세 판은 레퍼런스 소개 화면의 구성만 가져와 Trellis 조각과 데이터로 다시 그린 것이다(D-37). 판 안의 화면은 `src/sections/showcase-screens.tsx`가 실제 `@terracelab/trellis-react` 컴포넌트로 조립하고, 기기 틀은 고정 비율로 자른다.
- 모듈 지도는 `src/molecule.ts`가 `modules.json`의 묶음 · 모듈을 육각 격자에 놓는다. 격자에 맞지 않는 간선 · 겹치는 꼭짓점 · 겹치는 라벨 · 모듈 수와 다른 가지 수는 빌드에서 던진다. `build`가 좌표를 `dist/showcase/molecule.json`으로 내보내고(`scripts/export-showcase.mjs`, Figma 쇼케이스용), `pnpm --filter preview test`가 묶음 7 · 모듈 35를 확인한다.
- 히어로 문단의 컴포넌트 · 화면 블록 수는 빌드 때 저장소에서 센다(`scripts/gen-facts.mjs`). 회사 색 판의 프리셋 8개는 `@terracelab/trellis-tokens/figma`의 Company 컬렉션 모드 값을 그대로 쓴다.
- 모듈 앱 아이콘은 `@terracelab/trellis-icons/module-tiles`의 일러스트 타일(스프라이트 한 번 + `<use>`)을 쓴다 — 모듈 35종 전부(미배정 지출결의 포함 36종). 생성형 폴백(모듈 색 그라데이션 + 흰 라인)은 타일 없는 새 모듈에만(D-36).
- 차트 섹션(`#charts`)은 `@terracelab/trellis-react/charts`의 차트(종류 수는 `scripts/gen-facts.mjs`가 센다)를 React로 마운트한 ERP 대시보드(1440) + 모바일 매출 현황(390)이다(D-39). 업무 홈 창의 매출 행도 같은 컴포넌트다. 숫자는 `src/data.ts`, 색은 `color.chart.*` 슬롯만.
- 사이드바는 프로필 · 빠른 실행 · 즐겨찾기(타일) · 접히는 모듈 그룹 · 공지 · 근무 푸터로 구성된다(D-40).
- 업무 홈은 레퍼런스의 구조만 가져와 Trellis 토큰으로 다시 그린 것이다. 레퍼런스 제품의 자산(아이콘·일러스트·마스코트·문구)은 쓰지 않는다(D-34, D-35). mock 숫자는 `src/data.ts` 한 곳에서 온다.
- 컴포넌트는 실제 구현이 아니다. 치수와 토큰을 확인하는 `tl-preview-*` 마크업이고, 실제 구현은 Phase 1에서 한다.
- 대비 승인 대기 중인 조합은 `data-contrast-pending`으로 표시되어 있고, `check`는 그 요소를 실패가 아니라 승인 대기로 따로 센다(D-33, `docs/plan/notes/contrast-2026-11.md`).
- 세션이 끝날 때 Claude가 이 파일을 Artifact로 게시한다. v0 링크: https://claude.ai/artifact/2kJx3xod2fzcoACojNFKZh
