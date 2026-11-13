# 소개

Trellis(트렐리스)는 테라스랩의 디자인 시스템입니다. 파일 관리 · 브랜드 운영 · 식자재 ERP · 그룹웨어 · CRM 제품이 함께 쓰고, 테라스랩이 고객사마다 맞춰 구축하는 업무 플랫폼 테라스원도 이 시스템으로 만듭니다. 색 · 간격 · 글자 · 상태 어휘를 토큰으로 고정하고, 웹 · 데스크톱 · 모바일 · Django · Figma가 모두 같은 토큰에서 나옵니다.

## 이름

Trellis는 덩굴을 받치는 격자 틀입니다. 제품은 각자 자라고 틀은 하나라는 뜻으로 붙였습니다. 이름 풀이는 여기 한 번뿐이고, 화면과 문서에서 격자 은유를 다시 쓰지 않습니다([문구](content.md)).

## 무엇이 들어 있나

| 패키지 | 내용 | 상태 |
| --- | --- | --- |
| `@terracelab/trellis-tokens` | CSS 변수 `--tl-*` · TS 객체 · React Native 테마 · Tailwind v4 테마 · Pretendard Variable 폰트 | 사용 가능 |
| `@terracelab/trellis-icons` | UI 아이콘, 모듈 타일 일러스트 36종(모듈 35 전부 + 지출결의, 스프라이트 · SVG · manifest) | 사용 가능 |
| `@terracelab/trellis-contracts` | 컴포넌트 props 타입 · 상태 어휘 · 숫자 서식(`formatAmount` 등) | 사용 가능 |
| `@terracelab/trellis-react` | 웹 React 컴포넌트 121종: 기본 106종과 차트 15종(`/charts`). 컴포넌트마다 문서와 예시가 있고 전체 목록은 동봉 문서의 `manifest.json`에 있습니다 | 사용 가능 |
| `@terracelab/trellis-blocks` | 화면 블록(복사형 소스, `pnpm ds:add`)과 플랫폼 기본 기능 타입 · 화면 배치 도우미. 데모 앱이 이것으로 조립된다 | 사용 가능(git 하위 모듈) |
| `@terracelab/trellis-skill` | 서비스 저장소용 에이전트 스킬과 점검 도구(install · doctor · docs) | 사용 가능(git 하위 모듈) |
| `@terracelab/trellis-native` | Expo 컴포넌트(같은 props) | 1.0 뒤 |
| `terracelab-trellis` (PyPI) | Django 정적 파일 · 템플릿 태그 · 어드민 테마 | 1.0 뒤 |

Trellis는 오픈소스입니다. 라이선스는 Apache-2.0이고 소스는 GitHub 저장소 `terracelab/trellis`에 있습니다. tokens · icons · contracts · react는 npm에서 설치합니다([설치](install.md)).

모든 패키지는 **같은 버전 번호**로 함께 올라갑니다. 1.0부터 토큰 이름과 컴포넌트 props의 변경 · 삭제는 major 버전에서만 합니다([버전 정책](versions.md)).

## 한 문장 규칙

화면의 모든 값은 토큰에서 온다. raw hex · px · 글꼴 이름을 코드에 쓰지 않고 `--tl-*` 변수와 Trellis 컴포넌트로만 그린다. 자세한 규칙은 [원칙과 규칙](principles.md).

## 다음

1. [설치](install.md)
2. [CSS · 테마 · 밀도](setup.md)
3. 숫자를 보여 줘야 하면 [차트 고르기](charts.md)
4. 에이전트로 개발한다면 [에이전트로 개발하기](agents.md)
