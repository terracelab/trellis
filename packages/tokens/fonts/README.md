# 서체

| 파일 | 내용 |
|---|---|
| `PretendardVariable.woff2` | Pretendard Variable v1.3.9(가변 굵기). 원본 그대로, 수정하지 않았다 |
| `LICENSE-OFL.txt` | SIL Open Font License 1.1 원문. Reserved Font Name "Pretendard" |
| `CHECKSUMS` | 위 두 파일의 SHA-256. `shasum -a 256 -c CHECKSUMS`로 확인 |

출처: 공식 릴리스 <https://github.com/orioncactus/pretendard/releases/tag/v1.3.9>의 `Pretendard-1.3.9.zip`
(SHA-256 `04be351a74d6bf7d60c480a3087e51d185485d35a52023142af1df19eb8c428a`) 안의 `web/variable/woff2/PretendardVariable.woff2`와 `LICENSE.txt`.

`dist/css/fonts.css`가 이 폴더를 상대 경로로 가리킨다(D-27). 서체를 바꾸면 체크섬과 `test/fonts.test.ts`가 함께 바뀌어야 한다.
