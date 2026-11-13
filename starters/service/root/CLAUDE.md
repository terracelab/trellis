# __TITLE__

Trellis 디자인 시스템으로 만드는 서비스다. UI 작업은 `.claude/skills/trellis/SKILL.md`를 먼저 읽고 따른다.

## 구조

- `apps/web` 웹 앱(Vite · React · React Router)
- `trellis/` Trellis 디자인 시스템(git 하위 모듈). 컴포넌트 · 토큰 · 화면 블록 · 문서
- `.trellis/` Trellis 보강 요청(requests.md) · 블록 복사 기록(blocks.lock) · 스킬 설치 기록(skill.lock)

## 규칙

- 화면 값은 `--tl-*` 토큰만. raw hex · px · font-family · primitive 색 토큰 금지. `pnpm ds:doctor` · `pnpm lint`가 막는다.
- 컴포넌트는 Trellis 것만 쓴다. 없으면 서비스에서 새로 만들지 않고 `.trellis/requests.md`에 보강 요청을 남긴다.
- 화면은 블록을 복사해서 시작한다(`pnpm ds:add`).
- `trellis/` 안을 고치면 `trellis/CLAUDE.md`의 규칙을 따르고, 커밋도 `trellis/` 안에서 따로 한다.

## 명령

```bash
pnpm dev          # 개발 서버
pnpm typecheck
pnpm lint         # eslint + Trellis 규칙
pnpm build
pnpm ds:doctor    # 작업 끝에 항상
pnpm check        # 화면 검사: 메뉴의 화면 × 4폭 × 라이트 · 다크(axe · 가로 넘침 · 콘솔 오류)
```
