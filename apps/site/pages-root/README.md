# terracelab.github.io

테라스랩 사이트의 빌드 결과를 두는 저장소다. GitHub Pages가 `main` 브랜치를 그대로 내준다.

| 주소 | 내용 |
| --- | --- |
| `https://terracelab.github.io/trellis/` | Trellis(테라스랩 디자인 시스템) 소개 · 문서 · 데모 |

- 여기 있는 파일은 손으로 고치지 않는다. 소스 저장소에서 빌드해 배포 스크립트로 올린다.
- `trellis/` 폴더는 배포할 때마다 통째로 바뀐다. 루트의 `index.html` · `404.html` · `robots.txt` · 아이콘(`favicon.svg` · `favicon.ico` · `apple-touch-icon.png`) · `.nojekyll`은 배포가 건드리지 않는다.
- 검색 엔진 색인은 막아 두었다(`robots.txt`, 페이지마다 `noindex`). 크롤러는 이 루트의 `robots.txt`만 읽는다. 색인을 열 때는 배포 스크립트의 `--root-robots`가 이 파일을 묶음의 것으로 바꾼다.
