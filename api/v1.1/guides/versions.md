# 버전 정책

- 모든 패키지(`@terracelab/trellis-*`, PyPI `terracelab-trellis`)는 **한 버전 번호로 함께** 올라갑니다.
- **major**: 토큰 이름 변경 · 삭제, 컴포넌트 props 제거 · 이름 변경. 자동 변환 스크립트(codemod)를 함께 냅니다.
- **minor**: 토큰 값 변경, 컴포넌트 · 토큰 추가.
- **patch**: 버그 수정.
- **1.0.0**이 첫 공개 버전입니다. 그 전의 0.x는 미리보기였고 minor에서도 바뀌었습니다.

## 문서의 버전

- 패키지에 동봉된 문서(`dist/docs/`)는 그 패키지 버전과 항상 같습니다.
- 사이트의 `/docs/`는 최신 안정판입니다. 릴리즈마다 `/api/v<major.minor>/`에 그 버전의 manifest · llms.txt · 컴포넌트 문서가 남습니다.

## 업그레이드

소비 저장소는 Renovate 그룹 PR로 Trellis 패키지를 한꺼번에 올립니다. minor 이하는 소비 저장소의 화면 회귀 테스트가 통과하면 자동 병합, major는 사람이 승인하고 codemod를 실행합니다.
