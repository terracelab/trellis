# Trellis 소개 사이트 (`apps/site`)

Trellis를 소개하는 사이트다. 문서(`apps/docs`) · 데모(`apps/demo`)와 한 묶음으로 정적 호스팅에 올린다(D-148, PD-10).

| 주소 | 내용 | 출처 |
| --- | --- | --- |
| `/` | 홈 | `src/pages/index.astro` |
| `/components/` | 컴포넌트 목록(예시를 빌드 때 그린 미리보기) | `packages/react/src/*/*.examples.tsx` |
| `/blocks/` | 화면 블록 목록(데모에서 찍은 그림) | `blocks/src/*/*/*/block.json` · `public/blocks/` |
| `/themes/` | 회사 테마(색을 넣으면 테마 엔진이 계산) | `@terracelab/trellis-tokens/theme` |
| `/docs/…` · `/en/…` · `/llms.txt` · `/api/…` | 문서 사이트 | `apps/docs/dist` |
| `/demo/` | 데모 | `apps/demo/dist` |

숫자(토큰 · 컴포넌트 · 블록 수)는 `src/lib/site.ts`가 빌드 때 저장소에서 읽는다. 손으로 적지 않는다.

## 명령

```bash
pnpm --filter @terracelab/site dev        # 소개 페이지만(문서 · 데모 링크는 묶음에서 열린다)
pnpm turbo run build --filter=@terracelab/site...   # 패키지 → 문서 · 데모 → 소개 사이트 → 묶음(dist)
pnpm --filter @terracelab/site check      # 묶음 검사: 검색 · 답변 엔진 값 · axe · 외부 요청 · 콘솔 오류 · 내부 링크 · 휴대폰 넘침
pnpm --filter @terracelab/site check:seo  # 검색 · 답변 엔진 값만(브라우저 없이 1초, 문서 포함 전 페이지)
pnpm --filter @terracelab/site check:overflow  # 넘침 점검: 문서 · 소개 사이트 · 데모 전 화면을 여러 폭으로 열어 상자 밖 글자 · 잘린 표 · 페이지 가로 넘침을 찾는다(5분쯤)
pnpm --filter @terracelab/site og         # 공유 그림을 다시 만든다(og.png · 문서의 og.png · 데모의 og.jpg)
pnpm --filter @terracelab/site shots      # 블록 그림 다시 찍기(블록이 바뀌면). 데모 빌드가 먼저 있어야 한다
pnpm --filter @terracelab/site favicons   # 표식(src/lib/mark.json)으로 아이콘 파일을 다시 만든다. 다른 앱의 public에도 쓴다
```

## 주소

경로 아래에 올릴 때는 세 앱을 같은 환경 변수로 빌드한다. 없으면 도메인 루트 기준이다.

```bash
SITE_URL=https://terracelab.github.io SITE_BASE=/trellis/ pnpm turbo run build --filter=@terracelab/site...
SITE_BASE=/trellis/ pnpm --filter @terracelab/site check
```

검색 엔진 색인은 `SITE_INDEXABLE=1`일 때만 연다. 배포 절차는 `docs/plan/notes/sites-hosting.md`.

## 회사 색

`<html data-brand="forest">`처럼 속성만 바꾼다. 프리셋의 값은 테마 엔진이 만든 범위 CSS(`/presets.css`)에 들어 있다.
직접 고른 색은 테마 페이지가 엔진으로 계산해 `<style id="tl-theme-preview">`로 넣는다. 고른 값은 브라우저에만 남는다.

## 검색 · 답변 엔진 값(SEO · AEO · GEO)

값은 `apps/seo`(`@terracelab/seo`) 한 곳에 있다. 소개 사이트 · 문서 · 테라스원이 같은 함수로 회사 · 사이트 개체, `robots`, `robots.txt`, 사이트맵을 만든다(D-152). 색인은 `SITE_INDEXABLE=1`일 때만 열리고 지금 배포는 닫혀 있다.

| 구분 | 들어 있는 것 | 어디 |
| --- | --- | --- |
| SEO | 제목 · 설명 · canonical · Open Graph · Twitter 카드 · 공유 그림(`og.png` 1200×630) · 스니펫 지시어(색인이 열릴 때) | `src/layouts/Base.astro` · 문서는 `apps/docs/astro.config.mjs` |
| SEO | 문서 282쪽의 설명. 가이드는 한 줄씩 적은 글, 컴포넌트는 이름 · 요약 · props · 상태 · 예시 수 | `apps/docs/scripts/descriptions.mjs` |
| SEO | 사이트맵 입구 하나(`sitemap-index.xml`). 문서의 사이트맵에 소개 사이트의 `sitemap-site.xml`을 조립 때 더한다. 소개 사이트 목록은 `src/pages`에서 모은다 | `src/pages/sitemap-site.xml.ts` · `scripts/assemble.mjs` |
| SEO | 언어 짝(`hreflang`). 문서는 Starlight가, 홈은 영어 문서 첫 화면과 서로 가리킨다 | `Base.astro` |
| SEO | 블록 목록 그림의 설명 글(`alt`). 장식으로 쓰는 그림은 비운다 | `src/components/Shot.astro` |
| AEO | 질문이 제목이고 답이 바로 아래 한 문단인 `/faq/` 14문항. `FAQPage` 구조화 데이터가 보이는 글과 같은 원문에서 나온다. 질문마다 주소가 있다(`/faq/#theme`) | `src/pages/faq/index.astro` |
| GEO | 회사 · 사이트 개체(묶음 전체에서 하나씩), 홈의 `SoftwareSourceCode`, 페이지의 `WebPage` · 빵 부스러기 | `Base.astro` · `apps/seo` |
| GEO | 문서 280쪽의 `TechArticle` · 빵 부스러기, 한국어 문서 138쪽의 마크다운 짝(`<link rel="alternate" type="text/markdown">` → `/api/latest/…md`) | `apps/docs/src/routeMiddleware.ts` |
| GEO | `llms.txt` · `llms-full.txt` · `manifest.json`(문서가 만든다)과 모든 페이지의 `llms.txt` 연결 | `scripts/build-docs.mjs` |
| 공유 | 데모 링크의 미리보기(데모 화면 그림). 데모는 색인에서 빠져 있다 | `apps/demo/vite.config.mjs` · `apps/demo/public/og.jpg` |
| 검사 | 묶음의 289쪽 전부: 제목 폭 · 설명 길이 · 겹침 · canonical · 공유 그림 파일 · robots · 구조화 데이터 종류 · 개체가 하나인지 · 언어 짝 · 사이트맵과 페이지가 같은지 · FAQ 수 | `scripts/seo.mjs`(`check`가 먼저 돌린다) |

### 색인을 열 때

1. 배포 환경에 `SITE_INDEXABLE=1`을 주고 빌드한다. 페이지의 `noindex`가 빠지고 `robots.txt`가 사이트맵 입구를 알린다. 404와 데모는 그대로 `noindex`다.
2. `robots.txt`는 호스트 루트에 있는 것만 읽힌다. `/trellis/` 아래에 올리는 지금 주소에서는 묶음의 `robots.txt`가 읽히지 않으므로 배포할 때 `--root-robots`를 붙여 저장소 루트의 `robots.txt`를 같이 바꾼다. 붙이지 않으면 배포 스크립트가 둘이 어긋났다고 알린다.
3. 검색 도구에 사이트를 등록한다. 소유 확인 값은 `SITE_VERIFY_GOOGLE` · `SITE_VERIFY_NAVER` · `SITE_VERIFY_BING` 환경 변수로 주면 홈에 태그가 들어간다. 사이트맵은 `sitemap-index.xml` 하나를 낸다.

### 정해지면 넣을 것

- **회사 주소**: `apps/seo/index.mjs`의 `ORG.url` 한 줄. 넣으면 세 사이트의 `Organization`에 `url`이 들어가고 회사 개체의 `@id`가 그 주소로 모인다. 로고(`ORG.logo`)와 공식 계정(`ORG.sameAs`)도 같은 곳이다.
- **도메인**: `SITE_URL`을 바꾸고 `SITE_BASE` 없이 빌드한다. 도메인 루트에 올리면 묶음의 `robots.txt`가 그대로 읽힌다.
- **라이선스**: 공개할 때 정해지면 홈의 `SoftwareSourceCode`에 `license`와 `codeRepository`를 넣는다.
- **크롤러별 정책**: 답변 엔진 크롤러를 따로 허용하거나 막지 않는다(`User-agent: *` 하나). 학습용 크롤러만 막으려면 `apps/seo`의 `robotsTxt`에 줄을 더한다.
- **고친 날짜**: 사이트맵 `lastmod`와 구조화 데이터의 날짜는 넣지 않았다. 문서가 빌드 때 만들어져 고친 날짜를 알 수 없고, 빌드 날짜를 넣으면 틀린 값이 된다.
- **페이지별 공유 그림**: 소개 사이트와 문서는 같은 `og.png`를 쓴다. 컴포넌트 · 블록 상세 페이지가 생기면 페이지마다 만든다.
- **문서의 h1**: 예시가 제목을 그리는 문서 3쪽(`Paper` · `PageHeader` · `EmptyState`)은 `h1`이 여러 개다. 예시는 실제 컴포넌트라 그대로 둔다.
- **측정**: Search Console · 분석 도구는 연결하지 않았다. 외부 요청 0 원칙이 있어 분석 스크립트는 따로 정한다.
