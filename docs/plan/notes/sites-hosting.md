# 사이트 호스팅 — trellis.terracelab.co.kr · one.terracelab.co.kr (D-45)

| 사이트 | 앱 | 내용 | Pages 프로젝트 |
| --- | --- | --- | --- |
| `trellis.terracelab.co.kr` | `apps/docs` (Astro + Starlight) | 브랜드 페이지 · 시작하기 · 레퍼런스 · `/llms.txt` · `/api/<v>/manifest.json` | `trellis-docs` |
| `one.terracelab.co.kr` | `apps/one` (Astro) | 테라스원 제품 소개(미리보기) | `terrace-one` |

도메인(`trellis-design.com` · `terrace-one.com`)은 나중에 산다. 사면 Pages 프로젝트에 커스텀 도메인을 하나 더 붙이고, `astro.config.mjs`의 `site`와 `scripts/build-docs.mjs`의 `SITE`만 바꾼 뒤 서브도메인은 301로 돌린다.

## 처음 한 번 (Patrick)

1. Cloudflare 계정에서 **Pages 프로젝트 2개**를 Direct Upload 방식으로 만든다: `trellis-docs`, `terrace-one`(빌드는 GitHub Actions가 한다).
2. 각 프로젝트 → Custom domains → `trellis.terracelab.co.kr` / `one.terracelab.co.kr` 추가.
3. `terracelab.co.kr`의 DNS(현재 등록 업체)에 CNAME 두 줄. 존을 Cloudflare로 옮길 필요는 없다.

   | 이름 | 종류 | 값 |
   | --- | --- | --- |
   | `trellis` | CNAME | `trellis-docs.pages.dev` |
   | `one` | CNAME | `terrace-one.pages.dev` |

4. API 토큰(권한: Account · Cloudflare Pages · Edit)을 만들어 GitHub 저장소 Secrets에 `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`로 넣는다. 저장소 Environments에 `sites`를 만들어 두면 배포 승인을 걸 수 있다.
5. 저장소를 GitHub에 올리면 `main` 푸시마다 `.github/workflows/sites.yml`이 빌드 → 검사(axe · 외부 요청 · 링크) → 두 사이트 배포를 한다.

## 공개 전후

- 지금은 **색인 금지**다: 모든 페이지에 `noindex`, `robots.txt`는 `Disallow: /`.
- 공개 범위가 승인되면(GD) 저장소 Variables에 `SITE_INDEXABLE=1`. 다음 배포부터 `noindex`가 빠지고 docs의 `robots.txt`에 사이트맵이 들어간다.
- 검색 · 답변 엔진 값(공유 그림 · 구조화 데이터 · FAQ · 사이트맵)은 색인이 닫혀 있어도 이미 들어 있다. 값은 `apps/seo` 한 곳에 있고 목록과 색인 여는 순서는 `apps/site/README.md`의 "검색 · 답변 엔진 값"에 있다(D-151 · D-152).

## 로컬

```bash
pnpm build                                   # 패키지 → 동봉 문서 → 두 사이트
pnpm --filter @terracelab/docs dev           # http://localhost:4321
pnpm --filter @terracelab/one dev
pnpm --filter @terracelab/docs check         # 빌드 결과 검사(Playwright)
pnpm --filter @terracelab/one check
```

## 롤백 · 비용

- Cloudflare Pages → Deployments에서 이전 배포를 "Rollback". 문서는 패키지에도 동봉돼 있어 사이트가 내려가도 소비 앱의 에이전트는 영향이 없다(D-42).
- 무료 플랜(월 500회 빌드 업로드, 대역폭 무제한)으로 충분하다. 빌드는 GitHub Actions에서 하므로 Pages 빌드 시간은 쓰지 않는다.

## GitHub Pages — Trellis 소개 · 문서 · 데모 묶음 (D-148, PD-10)

Cloudflare와 DNS를 기다리지 않고 먼저 여는 주소다. 소스 저장소는 비공개 그대로 두고 빌드 결과만 공개 저장소에 올린다.

| 주소 | 저장소 | 내용 |
| --- | --- | --- |
| `https://terracelab.github.io/trellis/` | 공개 `terracelab/terracelab.github.io`의 `trellis/` 폴더 | 소개 사이트(`apps/site`) + 문서(`/docs/…` · `/en/…` · `/llms.txt` · `/api/…`) + 데모(`/demo/`) |
| `https://terracelab.github.io/` | 같은 저장소 루트 | `/trellis/`로 넘기는 한 줄 페이지 · `404.html` · `robots.txt`(색인 금지) · `.nojekyll`. 원본은 `apps/site/pages-root/` |

조직이 무료 플랜이라 비공개 저장소에서는 Pages를 켤 수 없다. 소스 저장소를 공개하면(D-50) 그 저장소의 Pages가 같은 주소 `/trellis/`를 쓴다.

### 배포

```bash
# 1. 올릴 주소로 묶음을 만든다(패키지 → 문서 · 데모 → 소개 사이트 → 조립)
SITE_URL=https://terracelab.github.io SITE_BASE=/trellis/ pnpm turbo run build --filter=@terracelab/site...
# 2. 묶음 검사(검색 · 답변 엔진 값 · axe · 외부 요청 · 콘솔 오류 · 내부 링크 · 휴대폰 넘침)
SITE_URL=https://terracelab.github.io SITE_BASE=/trellis/ pnpm --filter @terracelab/site check
# 3. 바뀌는 파일을 먼저 보고(--dry-run) 올린다. trellis/ 폴더만 바뀐다
node apps/site/scripts/deploy.mjs --repo https://github.com/terracelab/terracelab.github.io.git --dir trellis --dry-run
node apps/site/scripts/deploy.mjs --repo https://github.com/terracelab/terracelab.github.io.git --dir trellis
```

- 배포는 손으로 돌린다. 푸시 권한은 로컬 git 자격 증명을 쓴다. CI에서 올리려면 공개 저장소에 쓰기 권한이 있는 배포 키를 Secrets에 넣어야 한다(아직 안 함).
- 배포 커밋의 작성자 · 커밋한 사람은 이 PC의 git 설정이 아니라 공개용 계정이다(`scripts/public-author.mjs`, D-153). 스크립트가 확인한 뒤에만 푸시한다.
- 올린 뒤 1~2분이면 반영된다. 확인: `gh api repos/terracelab/terracelab.github.io/pages/builds/latest --jq .status`
- 되돌리기: 공개 저장소에서 `git revert <배포 커밋>` 뒤 푸시.
- 블록이 바뀌면 `pnpm --filter @terracelab/site shots`로 블록 그림을 다시 찍고 커밋한 뒤 배포한다.
- 색인은 막혀 있다. 공개 범위가 승인되면 `SITE_INDEXABLE=1`로 빌드하고 배포할 때 `--root-robots`를 붙인다. 크롤러는 호스트 루트의 `robots.txt`만 읽으므로 `trellis/robots.txt`만 바뀌면 열리지 않는다. 붙이지 않으면 배포 스크립트가 둘이 어긋났다고 알린다(D-152).
- 도메인을 붙이면(`trellis.terracelab.co.kr`) `SITE_URL`만 바꾸고 `SITE_BASE` 없이 빌드해 그 저장소에 통째로 올린다.

## 대안

사설 서버라면 `apps/*/dist`를 정적 서빙(nginx)하면 된다. 서버 측 기능은 쓰지 않는다.
