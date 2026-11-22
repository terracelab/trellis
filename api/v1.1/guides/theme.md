# 회사별 테마

회사 메인 색 하나로 회사 테마를 만든다. 엔진(`@terracelab/trellis-tokens/theme`)이 회사 색 토큰 21개를 라이트 · 다크 · 고대비 라이트 · 고대비 다크로 계산하고, 대비가 모자라면 같은 색상 안에서 단계를 옮겨 맞춘다. 기본 테마는 주황 `#FE5C2B`로 만든 결과다(D-98).

## 바뀌는 것과 안 바뀌는 것

| 회사 색 하나로 바뀐다 | 안 바뀐다 |
|---|---|
| 주 버튼 바탕 · 가리킴 · 누름 · 글자(`brand.default · hover · active · onBrand`) | 상태 색(정보 · 성공 · 경고 · 위험) |
| 선택 바탕 · 옅은 강조 면 · 선택 행(`brand.subtle · tint`, `bg.rowSelected`) | 수입 빨강 · 지출 파랑 |
| 회사 색 그대로의 강조: 진행 막대 · 로고 · 선택 점(`brand.accent`) | 결재 5색, 모듈 색, 차트 색, 아바타 색 |
| 링크 · 브랜드 글자(`fg.link`) | 종이 서식 색 |
| 포커스 링 · 포커스 강조 · 선택 테두리 · 탭 밑줄 · 진행 단계(`border.focus · focusStrong · selected`) | 글꼴 · 간격 · 반경 · 글자 크기 · 컨트롤 높이 |
| 사이드바 전부(`bg.nav`, `nav.*`): 회사 색상의 저채도 짙은 톤 | |
| (회색 톤을 고르면) 바탕 · 면 · 글자 · 테두리의 회색 | |

회색 톤(기본 · 중립 · 따뜻한)은 명도를 그대로 두고 색기만 바꾼다. 그래서 글자 대비가 기본 테마와 거의 같다.

## 엔진이 고르는 법

- 스케일: 50~950. 500은 입력 색 그대로다(너무 밝으면 명도만 내린다).
- 주 버튼(기본 규칙 "흰 글자 우선"): 회사 색 위 흰 글자가 4.5:1을 못 넘으면 같은 색상에서 흰 글자 5:1을 넘는 가장 밝은 단계로 옮긴다. 기본 주황은 `#CC3A00`이 된다. 입력 색은 글자가 아닌 강조(`brand.accent`)에 쓴다. `buttonText: 'input'`이면 입력 색을 그대로 바탕으로 두고 흰색 · 짙은 색 중 대비를 넘는 글자를 고른다.
- 링크 · 브랜드 글자는 면 · 회색 바탕 · 옅은 칸 · 팝업 · 선택 바탕 · 선택 행 위에서 4.5:1, 포커스 링 · 선택 테두리는 면 · 바탕 위에서 3:1, 포커스 강조는 4.5:1이다.
- 다크는 밝은 단계에서 다시 고른다. 주 버튼은 라이트와 같다. 고대비는 글자 7:1 · 선 4.5:1이다.
- 사이드바는 회사 색상에 채도를 아주 낮춘 짙은 톤이다. 명도가 기본 코코아 톤 `#3A3330`과 같아서 주황을 넣어도 눈으로 구분되지 않는다.
- 옮긴 단계마다 이유를 `notes`에 남긴다(`theme.notes`).

## 런타임: 새로 고침 없이 바꾸기

회사 설정에서 색을 고르면 바로 반영하는 쓰임새다.

```tsx
import { TrellisProvider } from '@terracelab/trellis-react';

// 문서 전체
<TrellisProvider theme={{ brand: company.color, neutral: 'cool', mode: 'light' }}>
  <App />
</TrellisProvider>

// 한 화면 · 미리보기 안에서만(바깥 화면은 그대로)
<TrellisProvider scope theme={{ brand: draftColor, mode: 'dark' }}>
  <ThemePreview />
</TrellisProvider>
```

- `theme`에 문자열(`'light' | 'dark'`)을 주면 예전처럼 `<html data-theme>`만 바꾼다.
- 기본 테마(`#FE5C2B` · 기본 회색 · 흰 글자 우선)와 같거나 형식이 틀린 색(입력 중인 글자)이면 아무것도 덮지 않는다.
- 안쪽 Provider는 저절로 범위 지정이다. 범위 안 테마는 바깥 회사 테마보다 우선한다.
- 같은 입력이면 빌드한 theme.css와 같은 값이다(Node · 브라우저 결과가 같다, `pnpm --filter @terracelab/demo check:theme`).

## 빌드: theme.css로 남기기

```bash
pnpm ds:theme --list                                  # 컬러칩 목록
pnpm ds:theme --preset forest                         # 컬러칩 그대로
pnpm ds:theme --brand "#0B7A5C" --neutral warm        # 직접 고르기
pnpm ds:theme --brand "#FE5C2B" --button-text input   # 주 버튼 = 입력 색 그대로
pnpm ds:theme --brand "#0B7A5C" --verbose             # 대비 검사 전부 출력
pnpm ds:theme --refresh                               # 첫 줄의 고른 값으로 지금 생성기로 다시
```

`src/theme.css`가 다시 만들어진다. 직접 고치지 않는다. 진입 파일에서 `tokens.css` 뒤, `styles.css` 앞에 import한다. theme.css는 라이트 · 다크 · 고대비 라이트 · 고대비 다크 네 블록이고 tokens.css와 같은 선택자를 쓴다.

```ts
import { createTheme, themeCss } from '@terracelab/trellis-tokens/theme';

const theme = createTheme({ brand: '#0B7A5C', neutral: 'warm' });
theme.ok; // 대비 전부 통과
theme.checks; // 항목별 대비(4모드)
theme.notes; // 단계를 옮긴 이유
theme.warnings; // 겹침 경고와 대안
theme.suggestions; // 다른 규칙 제안(아주 밝은 색)
themeCss(theme); // theme.css 본문
themeCss(theme, { scope: '[data-preview]' }); // 그 요소 안에만
```

`pnpm ds:doctor`는 theme.css가 허용된 변수만 덮는지 본다. 번호 붙은 primitive(`--tl-color-brand-600` 등)와 상태 · 금융 · 결재 · 차트 색은 덮을 수 없다.

theme.css 첫 줄 주석에는 고른 값(`trellis-theme {"brand":…}`)이 남는다. `pnpm ds:theme --refresh`는 그 값으로 지금 생성기를 다시 돌린다. 생성기가 블록 · 값을 바꾸면(예: 기기 고대비 설정용 `@media (prefers-contrast: more)` 블록) `pnpm ds:doctor`가 오래된 theme.css를 알리고, `pnpm ds:update`는 끝에 `--refresh`를 부른다.

## 겹침 경고를 받았을 때

회사 색(입력 · 주 버튼 · 강조)이 위험 · 수입 · 성공 · 경고 · 지출 · 정보 · 차트 첫 계열 색과 ΔEOK 9 미만으로 가까우면 경고가 나온다(D-99). 상태 · 금융 색은 바뀌지 않는다. 고르는 법:

1. **그대로 쓴다.** 상태와 금액을 색만으로 보이지 않는다. 배지는 글자, 알림 · 토스트는 아이콘, 증감은 부호 · 화살표가 같이 있다. Trellis 컴포넌트는 이미 그렇게 그린다. 기본 주황도 위험 · 수입 빨강과 가까워 경고가 나오고, 이 방식으로 쓴다.
2. **대안 색을 고른다.** 경고의 `alternatives`는 명도 · 채도를 그대로 두고 색상만 돌려 겹치지 않는 가장 가까운 색이다.
3. **주 버튼 규칙을 바꾼다.** `buttonTextAlternative`가 `'input'`이면 입력 색을 바탕으로 두는 규칙(B)에서 겹침이 풀린다.

파랑 계열 회사 색은 지출 파랑 · 정보 · 차트 첫 계열과, 초록은 성공, 노랑은 경고와 겹친다. 이런 색을 고르면 화면에서 같은 색이 두 뜻을 갖지 않는지 한 번 더 본다.

## 아주 밝은 회사 색

노랑 · 하늘 · 연두처럼 밝은 색은 흰 글자 규칙(A)이 주 버튼과 강조를 둘 다 어둡게 옮긴다. `#FFD400`은 주 버튼 · 강조가 `#856D00`(어두운 올리브)이 되어 화면 어디에도 회사 노랑이 보이지 않는다. 검사는 모두 통과한다.

주 버튼 · 강조가 둘 다 입력 색과 ΔEOK 15 이상 멀어지고 입력 색 바탕 규칙(`buttonText: 'input'`)이 대비 검사를 모두 넘으며 겹침 경고를 늘리지 않으면, 엔진이 `theme.suggestions`로 그 규칙을 제안한다. 생성기는 `? …`와 `제안: --button-text input`을 찍는다. `#FFD400`에 그 규칙을 쓰면 주 버튼은 `#F3CA00`(명도만 내린 입력 색)이고 글자는 짙은 색이다. 회사 색이 보이는 쪽을 원하면 제안대로 다시 만든다.

## 미리 보기

데모의 데모 설정 메뉴 → 테마 색, 또는 시작 템플릿의 화면 설정에서 컬러칩을 눌러 화면 전체에 입혀 본다. 확정 명령을 복사해 실행하면 같은 테마가 파일로 남는다.
