# 서비스 시작 템플릿

Trellis를 git 하위 모듈로 넣은 서비스 저장소를 만든다(D-58).

```bash
# Trellis 저장소에서
node scripts/create-service.mjs ~/dev/Projects/my-service --title "내 서비스"
```

만들어지는 것:

- `apps/web` 이 폴더의 `app/`(Vite · React · React Router · AppShell · 알림 · 테마 · 밀도)
- 루트 파일 `root/`(package.json 명령 · pnpm 워크스페이스 · CLAUDE.md · README · eslint 설정 · `scripts/check.mjs` 화면 검사 · `.trellis/requests.md` 보강 요청 표). eslint 설정은 템플릿 안에서 `eslint-config.js`이고 create-service가 `eslint.config.js`로 바꾼다(Trellis 저장소의 eslint가 집지 않게)
- `trellis/` 하위 모듈(기본 주소는 이 저장소의 origin)
- `.claude/skills/trellis/` 에이전트 스킬, 설치 · Trellis 빌드 · 점검까지 마친 첫 커밋

옵션: `--name <패키지 이름>`(기본은 폴더 이름) · `--submodule <git 주소 또는 경로>` · `--no-install`

`app/`은 Trellis 워크스페이스에도 들어 있어 Trellis CI가 함께 타입 검사 · 빌드한다. 템플릿이 Trellis 변경을 따라가지 못하면 CI에서 먼저 깨진다.
