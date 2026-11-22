# @terracelab/trellis-skill

Agent skill and check tool for apps built with Trellis, TerraceLab's design system for Korean business software. It installs a Claude Code skill into your repository, checks that the app uses Trellis correctly, prints the docs of the installed version and copies a dashboard starter screen.

Trellis(트렐리스)로 화면을 만드는 서비스 저장소용 에이전트 스킬과 점검 도구입니다. 설치하지 않고 `npx`로 부릅니다. 서비스 저장소 루트에서 돌립니다.

## 쓰기

```bash
npx @terracelab/trellis-skill install        # 에이전트 스킬을 .claude/skills/trellis/ 에 둡니다
npx @terracelab/trellis-skill doctor         # 설치 · CSS 순서 · 글꼴 · 토큰 밖 값을 점검합니다
npx @terracelab/trellis-skill add dashboard  # 대시보드 시작 화면을 src/dashboard/ 로 복사합니다
npx @terracelab/trellis-skill docs KpiCard   # 설치된 Trellis 버전의 문서를 출력합니다
```

그다음 에이전트에게 만들 화면을 말로 요청합니다. 스킬이 점검, 문서 읽기, 시작 화면 복사, 요청을 부품으로 옮기기, 검증 순서를 정해 둡니다.

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `install [--to <폴더>] [--app <앱 폴더>]` | SKILL.md와 참고 문서를 복사하고 `.trellis/skill.lock`에 버전을 적습니다. 스킬은 커밋합니다 |
| `doctor [--app] [--entry <파일>] [--strict]` | 실패가 있으면 종료 코드 1입니다. 빠진 패키지 · CSS import는 넣을 명령과 줄을, hex · px에는 대신 쓸 토큰 후보를 알려 줍니다 |
| `docs [list \| llms \| tokens \| path \| <컴포넌트> \| guide <이름>]` | `@terracelab/trellis-react`에 든 문서를 출력합니다. 네트워크를 쓰지 않습니다 |
| `add [<시작 화면>] [--to <폴더>] [--force]` | 시작 화면을 서비스 소스로 복사합니다. 이름 없이 부르면 목록입니다 |

- 앱이 저장소 루트가 아니면 `install --app <앱 폴더>`를 한 번 줍니다. 다음 명령이 그대로 씁니다.
- `doctor`는 Trellis를 쓰는 파일의 토큰 밖 값만 실패로 셉니다. 그 밖 파일의 값은 경고로 건수만 알리고, `--strict`면 전부 실패로 셉니다.
- `devDependencies`에 Trellis와 같은 버전으로 넣어 두면 `npx`가 그 버전을 씁니다.
- Trellis를 git 하위 모듈로 넣은 서비스에서도 같은 도구가 돕니다. 그때는 시작 템플릿의 `pnpm ds:doctor` · `pnpm ds:skill`로 부릅니다.

## 요구 사항

Node 20 이상. 앱은 React 19와 `@terracelab/trellis-react` · `@terracelab/trellis-tokens`를 씁니다. 없으면 `doctor`가 설치 명령을 알려 줍니다.

## 문서

- 에이전트로 개발하기: https://trellis.terracelab.co.kr/docs/guide/agents/
- 대시보드 만들기: https://trellis.terracelab.co.kr/docs/guide/dashboards/
- 소스: https://github.com/terracelab/trellis

## 라이선스

Apache-2.0
