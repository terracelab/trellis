# 화면 하나 만드는 순서

1. 요청을 화면 유형으로 바꾼다(홈 · 목록 · 상세 · 폼 · 결재).
2. `pnpm ds:add --list`에서 가까운 블록을 찾아 복사한다. 없으면 같은 유형 블록의 배치를 본떠 `Page` · `Grid` · 컴포넌트로 조립한다.
3. 샘플 데이터를 서비스 데이터로 바꾼다. 행 타입 · 상태 어휘는 블록 그대로 둔다.
4. 권한이 필요한 버튼은 `useCan(모듈, 동작)`으로 막는다.
5. `pnpm ds:doctor` · `pnpm lint` · `pnpm typecheck` · `pnpm build`.
6. 화면을 메뉴(`apps/web/src/nav.ts`)에 넣거나 `scripts/check.mjs`의 `EXTRA_ROUTES`에 더하고 `pnpm check`(4폭 × 라이트 · 다크, axe · 가로 넘침 · 콘솔 오류). `check-results/`의 스크린샷을 열어 본다. 빈 상태 · 로딩 · 오류도 본다.
7. 모자란 것은 `references/request.md`대로 `.trellis/requests.md`에 남긴다.
