# 테라스원 소개 (`@terracelab/one`) — one.terracelab.co.kr

테라스원(테라스랩 맞춤 구축 서비스, D-49) 한 쪽짜리 소개 사이트. 테라스원은 완성품이 아니라 회사마다 Trellis로 맞춰 만드는 올인원 업무 플랫폼이다. 화면 조각은 `@terracelab/preview`의 exports(`./showcase` · `./home` · `./charts` · `./styles.css`)를 그대로 쓰고 문구만 제품 기준으로 넘긴다(D-45).

```bash
pnpm --filter @terracelab/one dev
pnpm --filter @terracelab/one build && pnpm --filter @terracelab/one check [스크린샷 폴더]
```

- 폭은 미리보기와 같은 `data-width`(1440 · 1024 · 390)로 바꾸고, 테마는 버튼 + `prefers-color-scheme`(localStorage `one-theme`).
- 화면과 숫자는 미리보기용 예시라는 고지를 바닥글에 둔다. 공개 승인 전에는 `noindex`.
