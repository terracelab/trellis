# Figma 라이브러리

파일: [Trellis · Design System & Showcase](https://www.figma.com/design/uNZmEBsbRnkivkF79zdd2L). 팀 접근 권한이 필요합니다.

**코드가 진실이고 Figma는 생성물입니다.** Figma에서 바꾼 값은 코드(토큰 JSON)에 반영돼야 유효하고, 다음 동기화가 덮어씁니다.

| 페이지 | 내용 |
| --- | --- |
| Foundations | 색(semantic Light/Dark) · 글자 · 간격 · 반경 · 그림자 · 밀도 · 모듈 · 차트 팔레트 |
| Components | 버튼 · 배지 · 입력 · 카드 · 탭 · 표 · 차트 15세트 · 사이드바 조각 · 아이콘 48 · 모듈 타일 21 |
| Showcase · Screens | 미리보기 화면의 현재 모습(라이트 · 다크 · 1024 · 390) |

- 변수 이름은 CSS 변수와 1:1입니다: `color/bg/surface` ↔ `--tl-color-bg-surface`(Dev Mode에 코드 구문 표시).
- 컴포넌트 variant 축은 코드의 props와 같습니다(예: `Chart / BulletBar` State = default · reached · warning · over).
- 바꾸고 싶은 것은 Figma가 아니라 Trellis 저장소 이슈로 요청합니다.
