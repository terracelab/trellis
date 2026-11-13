# __TITLE__

Trellis 디자인 시스템으로 만드는 서비스다. Trellis는 `trellis/` 하위 모듈로 들어 있다.

## 처음 받을 때

```bash
git clone --recurse-submodules <이 저장소 주소>
pnpm install
pnpm ds:build      # Trellis 토큰 · 아이콘 · 컴포넌트 빌드(처음 한 번, 토큰을 바꿨을 때)
pnpm dev
```

하위 모듈 없이 받았다면 `git submodule update --init`.

설치할 때 "The settings in trellis/pnpm-workspace.yaml do not apply" 경고가 나온다. Trellis를 같은 워크스페이스로 묶어서 나는 안내라 무시해도 된다.

## 자주 쓰는 명령

| 명령 | 하는 일 |
|---|---|
| `pnpm dev` | 개발 서버. Trellis 컴포넌트 소스를 바로 읽어 고치면 바로 보인다 |
| `pnpm build` | Trellis 빌드 뒤 앱 빌드 |
| `pnpm lint` | eslint + Trellis 규칙(토큰 밖 색 · px · 글꼴, primitive 토큰) |
| `pnpm check` | 화면 검사. 메뉴의 화면 × 344 · 720 · 1024 · 1440 × 라이트 · 다크에서 axe · 가로 넘침 · 콘솔 오류, 스크린샷은 `check-results/` |
| `pnpm ds:doctor` | CSS 순서 · 토큰 밖 값 · 테마 범위 · 오래된 theme.css 점검 |
| `pnpm ds:add --list` | 화면 블록 목록 |
| `pnpm ds:add <블록 id>` | 블록을 `apps/web/src/blocks/`로 복사 |
| `pnpm ds:theme --brand <색> --neutral <톤>` | 서비스 테마(`apps/web/src/theme.css`) 생성 |
| `pnpm ds:docs <컴포넌트>` | 설치된 Trellis 문서 보기 |
| `pnpm ds:update` | Trellis를 최신 main으로 올리고 다시 빌드, theme.css를 지금 생성기로 다시 만들고 바뀐 블록 알림. 끝나면 개발 서버를 다시 켠다 |
| `pnpm ds:add --outdated` | 복사한 뒤 Trellis에서 바뀐 블록. 내용은 `--diff <블록 id>` |

## Trellis를 고칠 때

작은 수정은 `git -C trellis switch main` 뒤 `trellis/`에서 바로 고치고 그 안에서 커밋한다. 올린 뒤 `git add trellis`로 서비스에도 커밋한다. 큰 것은 `.trellis/requests.md`에 요청을 남긴다. 절차는 `.claude/skills/trellis/references/request.md`.
