# 문서 사이트 (`@terracelab/docs`) — trellis.terracelab.co.kr

Astro + Starlight(D-41). 내용은 **동봉 문서**(`@terracelab/trellis-react/dist/docs`, `scripts/build-docs.mjs`)를 렌더한 것이고, 사람이 쓰는 글은 `docs/guides/*.md`(레포 루트) 한 곳에 있다. 규격 `docs/spec/distribution.md` §3.

```bash
pnpm build                        # 패키지 → 동봉 문서 → 사이트
pnpm --filter @terracelab/docs dev
pnpm --filter @terracelab/docs check [스크린샷 폴더]   # 빌드 결과: axe · 외부 요청 · 링크 · 콘솔
```

- `scripts/sync-content.mjs`가 동봉 문서를 `src/content/docs/docs/{guide,components}`, `public/api/{latest,v<x.y>}`, `public/llms.txt`로 옮긴다. 이 파일들은 생성물이라 커밋하지 않는다(.gitignore).
- 손으로 쓰는 페이지: 브랜드(`src/content/docs/index.mdx` + `BrandHero` · `BrandSections`), 컴포넌트 목록, 토큰, 모듈.
- 라이브 예시는 `packages/react/src/<Name>/<Name>.examples.tsx`를 그대로 렌더한다(D-46).
- 스타일은 `--tl-*`만(stylelint). Starlight 색은 `src/styles/starlight.css`에서 Trellis 토큰으로 매핑.
- 공개 승인 전에는 `noindex` · `robots.txt Disallow`. 배포 환경 변수 `SITE_INDEXABLE=1`로 해제. 배포 `docs/plan/notes/sites-hosting.md`.
- 검색 · 답변 엔진 값: 모든 페이지에 같은 것은 `astro.config.mjs`의 `head`, 페이지마다 다른 것(구조화 데이터 · 마크다운 짝 · 언어별 값)은 `src/routeMiddleware.ts`, 페이지 설명은 `scripts/descriptions.mjs`가 만든다. 값은 `apps/seo`에서 온다(D-152).
