# 서비스 시작하기

서비스는 Trellis를 git 하위 모듈로 넣어 만든다. 화면 블록과 에이전트 스킬이 하위 모듈에 있고, 서비스를 만들다 Trellis를 그 자리에서 고쳐 그 수정을 Trellis 저장소에 커밋할 수 있다. 컴포넌트만 쓰는 앱은 npm에서 설치해도 된다([설치](install.md)).

## 새 서비스

```bash
# Trellis 저장소에서
node scripts/create-service.mjs ~/dev/Projects/my-service --title "내 서비스"
cd ~/dev/Projects/my-service
pnpm dev
```

만들어지는 것:

- `apps/web` Vite · React · React Router 앱. 앱 틀 · 메뉴 · 알림 · 테마 · 밀도 · 화면 설정이 들어 있다
- `trellis/` 하위 모듈과 같은 pnpm 워크스페이스
- `.claude/skills/trellis/` 서비스 쪽 에이전트 스킬, `CLAUDE.md`
- `pnpm lint`(eslint + Trellis 규칙) · `pnpm check`(화면 검사) · `.trellis/requests.md`(보강 요청 표)
- 설치 · Trellis 빌드 · 점검을 마친 첫 커밋

## 다른 컴퓨터에서 받기

```bash
git clone --recurse-submodules <서비스 저장소>
pnpm install
pnpm build
```

## 개발 중에 Trellis 소스를 바로 읽는다

앱의 Vite · TypeScript 설정이 `@terracelab/source` 조건을 켠다. 그래서 `trellis/packages/react/src`를 고치면 다시 빌드하지 않아도 화면에 바로 보인다. 토큰 JSON을 바꿨을 때만 `pnpm ds:build`가 필요하다.

## 화면 블록

```bash
pnpm ds:add --list
pnpm ds:add erp/tax/invoice-list
```

블록 소스가 `apps/web/src/blocks/`로 복사되고 import 경로가 패키지 경로로 바뀐다. 출처 커밋은 `.trellis/blocks.lock`에 남는다.

블록은 화면 id와 주소 값을 플랫폼에서 받는다. 브라우저 라우터를 쓰면 `PlatformProvider`에 `screens` · `screenHref` · `navigate`를 넘기고, 레이아웃 경로에서 주소 값을 넘긴다.

```tsx
// 레이아웃 경로(라우터 안)
const [search] = useSearchParams();
return (
  <ScreenParamsProvider params={search}>
    <Outlet />
  </ScreenParamsProvider>
);
```

블록이 `?id=` · `?tab=`을 이것으로 읽는다. 고쳐도 되는 자리는 블록 코드의 `slot: <이름>` … `slot: <이름> end` 사이다.

## 명령

| 명령 | 하는 일 |
|---|---|
| `pnpm ds:doctor` | CSS 순서 · 토큰 밖 값(hex · px · 글꼴 · primitive 색 · 색 함수 · 안쪽 부품 덮기 · onClick) · 테마 범위 · 오래된 theme.css · 스킬 버전 |
| `pnpm lint` | eslint + Trellis 규칙 |
| `pnpm check` | 화면 검사: 메뉴의 화면 × 344 · 720 · 1024 · 1440 × 라이트 · 다크에서 axe critical · serious 0, 가로 넘침 0, 콘솔 오류 0. 스크린샷은 `check-results/` |
| `pnpm ds:theme` | 회사별 테마(theme.css) |
| `pnpm ds:docs <컴포넌트>` | 설치된 Trellis 문서 |
| `pnpm ds:update` | Trellis를 최신 main으로 올리고 다시 빌드, theme.css를 지금 생성기로 다시 만들고(`ds:theme --refresh`) 바뀐 블록 알림 |
| `pnpm ds:add --outdated` | 복사한 뒤 Trellis에서 바뀐 블록 목록. 내용은 `--diff <블록 id>` |

## 최신 Trellis로 올리기

```bash
pnpm ds:update                               # main으로 옮겨 받기 · 설치 · 빌드 · 스킬 · theme.css · 바뀐 블록
git -C trellis log --oneline $(git rev-parse HEAD:trellis)..HEAD  # 들어온 커밋
pnpm typecheck && pnpm build && pnpm ds:doctor && pnpm check
git add trellis && git commit -m "chore: update Trellis"
```

복사한 블록은 저절로 바뀌지 않는다. `pnpm ds:add --diff <블록 id>`로 보고 필요한 부분만 옮긴다. 특정 커밋에 고정하려면 `git -C trellis checkout <커밋>` 뒤 `git add trellis`.

## 기존 프로젝트에 붙이기

하위 모듈 추가, `pnpm-workspace.yaml` 세 줄, `workspace:*` 의존성과 `ds:*` 명령, CSS 순서, Vite · TypeScript의 `@terracelab/source` 조건이다. 절차와 코드는 Trellis 저장소 README의 "기존 프로젝트에 붙이기".

## 모자란 것을 찾으면

작은 수정은 `git -C trellis switch main` 뒤 `trellis/`에서 바로 고치고 그 안에서 커밋한다. 새 컴포넌트 · 토큰 값처럼 큰 것은 서비스 저장소의 `.trellis/requests.md` 표에 한 줄을 남긴다. 시작 템플릿이 머리줄만 있는 이 파일을 만들어 둔다. 요청은 이 파일 한 곳에만 적고 `trellis/` 하위 모듈은 고치지 않는다. 칸과 쓰는 법은 스킬의 `references/request.md`.

Trellis 쪽에서는 서비스 여러 개의 요청을 모아 Trellis 작업 목록에 옮긴다. 이미 옮긴 줄은 빠진다.

```bash
# Trellis 저장소에서
node scripts/collect-requests.mjs ~/dev/Projects/my-service ~/dev/Projects/other-service
```
