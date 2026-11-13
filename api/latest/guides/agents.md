# 에이전트로 개발하기

Trellis는 에이전트(Claude Code 등)가 읽을 문서를 패키지에 함께 넣어 배포합니다. 에이전트는 **설치된 버전의 문서만** 읽습니다. 최신 문서는 업그레이드할 때 봅니다.

## 문서가 있는 곳

| 어디 | 무엇 |
| --- | --- |
| `node_modules/@terracelab/trellis-react/dist/docs/llms.txt` | 시작점. 규칙 · 설치 · 문서 목록(6 KB 이하) |
| `…/dist/docs/llms-full.txt` | 전부 한 파일로(1.5 MB 이하, 변경 이력 제외) |
| `…/dist/docs/manifest.json` | 기계 읽기: 컴포넌트 · props · 상태 · 토큰 · 모듈 · 예시 이름 |
| `…/dist/docs/components/<Name>.md` | 컴포넌트 하나: 용도 · Props 표 · 상태 · 접근성 · 예시 코드 |
| `…/dist/docs/guides/*.md` | 이 사이트의 가이드와 같은 글 |
| `https://trellis.terracelab.co.kr/llms.txt` | 최신판(사이트) |
| `https://trellis.terracelab.co.kr/api/latest/manifest.json` | 최신 manifest. 버전별은 `/api/v<major.minor>/` |

패키지 안에서는 `import manifest from '@terracelab/trellis-react/docs/manifest.json' with { type: 'json' }`으로도 읽을 수 있습니다.

## 작업 순서

1. 설치된 `@terracelab/trellis-react` 버전을 확인하고 `llms.txt`를 읽는다.
2. 요청을 Trellis 어휘로 바꾼다. 화면 유형은 [패턴](patterns.md), 숫자는 [차트 고르기](charts.md), 부품은 `manifest.components`에 있는 것만, 말은 [문구](content.md)대로.
3. 토큰과 컴포넌트로만 구현한다([원칙과 규칙](principles.md)).
4. 점검(`pnpm ds:doctor`) · 타입 · 테스트. 화면이면 `pnpm check`(전 화면 × 4폭 × 라이트 · 다크)와 1440 · 390 스크린샷.
5. 보고: 쓴 패턴 · 컴포넌트, 새로 드러난 요구(없는 컴포넌트 · 토큰)와 남긴 요청, 검증 결과.

## 없는 컴포넌트가 필요하면

앱에서 새로 만들지 않습니다. 서비스 저장소의 `.trellis/requests.md` 표에 한 줄을 적습니다(날짜 · 서비스 · 종류 · 내용 · 임시 처리 · 상태). 내용에는 무엇이 없어서 어떤 화면에서 막혔는지, 필요한 props와 상태, 비슷한 기존 컴포넌트를 씁니다. 그동안은 가장 가까운 기존 컴포넌트 조합으로 둡니다. 요청은 이 파일 한 곳에만 적습니다. Trellis 쪽은 `node scripts/collect-requests.mjs <서비스 경로>`로 요청을 모아 spec → contract → 구현 → 릴리즈 순서로 처리합니다. 절차는 스킬의 `references/request.md`입니다.

## 스킬

서비스 저장소용 스킬 패키지 `@terracelab/trellis-skill`은 Trellis 저장소의 `packages/skill`에 있습니다. [서비스 시작하기](service.md)의 시작 템플릿이 아래 명령을 루트 package.json에 넣어 둡니다.

```bash
pnpm ds:skill              # .claude/skills/trellis/ 설치, .trellis/skill.lock에 Trellis 커밋 기록
pnpm ds:doctor             # 빌드 · CSS 순서 · 토큰 밖 값 · 테마 범위 · 스킬 버전 점검
pnpm ds:docs TrendChart    # 설치된 Trellis의 문서 출력(오프라인)
pnpm check                 # 전 화면 검사: axe · 가로 넘침 · 콘솔 오류
```
