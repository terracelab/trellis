# FileViewer
## 용도
파일 하나를 내려받지 않고 화면 안에서 볼 때 쓴다. 그림(PNG · JPG · SVG)은 확대 · 축소 · 맞춤 · 회전, PDF는 브라우저 내장 PDF 보기로 쪽을 넘기고, 다른 형식은 파일 카드와 다운로드 단추를 보인다. 파일 목록 · 첨부 칩은 Attachment, 파일을 고르는 칸은 FileUpload, 인쇄할 서식은 Paper · PaperPreview다.
## 해부(Anatomy)
root(`tl-file-viewer`, `role="group"`, 테두리 `border.divider` · `radius.lg` · 바탕 `bg.surface`) · bar(도구 줄, 아래 선 `border.divider`, 안쪽 여백 `space.4` `space.8`) · name(파일 아이콘 16 `fg.tertiary` + 이름 `type.label` 600 `fg.primary` 말줄임 + 형식 · 크기 `type.caption` `fg.secondary` tabular) · tools(`role="toolbar"`, IconButton ghost sm, 묶음 사이 세로 선 `border.divider`) · value(배율 125% · 쪽 3 / 12, `type.caption` tabular `fg.secondary`) · stage(보기 영역, 바탕 `bg.sunken`, 넘치면 안에서 스크롤, 포커스 링 `border.focus` 안쪽) · image(그림, 그림자 `shadow.sm`) · pdf(`object`, 영역 전체) · card(EmptyState: 형식 아이콘 · 안내 · 다운로드 단추) · status(숨은 알림 줄, 배율 · 쪽 · 회전이 바뀌면 읽는다).
## Props
contract 표.
## Variants
kind 3 × height 4.

| kind | 보기 영역 | 도구 줄 |
|---|---|---|
| image | 그림. 처음에는 영역에 맞춤(작은 그림은 100%) | 축소 · 배율 · 확대 · 화면에 맞춤 · 회전 · 다운로드 |
| pdf | 브라우저 내장 PDF 보기(`object`). 쪽 · 배율은 주소 조각(`#page=3&zoom=125`)으로 넘긴다 | 이전 쪽 · 쪽 · 다음 쪽 · 축소 · 배율 · 확대 · 화면에 맞춤 · 새 창에서 열기 · 다운로드 |
| other | 파일 카드(형식 아이콘 · "미리 볼 수 없는 형식입니다" · 다운로드) | 다운로드 |

height sm 240 · md 400 · lg 560(`space.64` 배수) · fill(부모 남은 높이, Dialog · 목록 옆 칸). 좁은 칸(컨테이너 폭 400 미만)에서는 이름이 한 줄을 차지하고 도구가 그 아래 줄로 내려간다.

kind가 없으면 `fileViewerKind(name, mimeType)`가 정한다. MIME `image/*` · `application/pdf`가 먼저이고, 없으면 확장자다.
## States
default · focus(보기 영역에 포커스 링 `border.focus` 2px 안쪽, 도구 단추는 IconButton 포커스 링) · loading(`loading` 또는 그림을 받는 동안 보기 영역에 Skeleton rect. Skeleton이 `duration.normal` 뒤에 나타나 빠른 응답에 깜빡이지 않는다. root `aria-busy`) · error(`error` 또는 그림이 깨지면 보기 영역에 EmptyState kind="error": 이유 · 다시 시도. 도구 줄의 다운로드는 남는다). hover · active · disabled는 도구 단추(IconButton)의 상태이고 root에는 해당 없음.
## 동작
그림: 처음에는 영역에 맞춤이다(영역보다 작은 그림은 100%). 확대 · 축소는 25 · 50 · 75 · 100 · 125 · 150 · 200 · 300 · 400% 단계를 오간다(`nextZoom`). 맞춤 배율에서 확대하면 그보다 큰 첫 단계로 간다. 회전은 오른쪽으로 90도씩이고 맞춤은 회전한 모양에 맞춘다. 영역보다 크면 끌어서 옮기고, 두 번 누르면 맞춤 ↔ 100%다. 파일이 바뀌면 맞춤 · 회전 0으로 돌아간다.

PDF: 브라우저 내장 PDF 보기를 `object`로 넣고 쪽 · 배율을 주소 조각으로 넘긴다(PDF 라이브러리를 넣지 않는다, 외부 요청 없음). 쪽을 넘기면 보기를 그 쪽에서 다시 연다. `pageCount`가 있으면 "3 / 12"와 마지막 쪽에서 꺼지는 다음 쪽 단추, 없으면 "3쪽"이다. 사용자가 내장 보기 안에서 스크롤한 쪽은 도구 줄이 알지 못한다. 내장 PDF 보기가 없는 브라우저(`navigator.pdfViewerEnabled === false`, 머리 없는 브라우저 포함)는 보기 대신 안내 카드("이 브라우저는 PDF를 바로 보여 주지 않습니다")와 다운로드를 보이고, 새 창에서 열기는 남는다. `object`가 문서를 그리지 못해도 같은 카드가 선다.

다운로드: `onDownload`가 있으면 그것, 없으면 `src`를 파일 이름으로 받는다(`a[download]`). `downloadable={false}`면 단추가 없다.

쪽은 `page` · `onPageChange`로 제어하거나 `defaultPage`로 둔다. 배율 · 회전은 안에서 관리한다.

| 키 | 동작 |
|---|---|
| Tab | 도구 줄(지금 단추 하나) → 보기 영역 |
| ← · → | 도구 줄 안에서 앞 · 뒤 단추(꺼진 단추는 건너뛴다) |
| Home · End | 첫 · 끝 단추 |
| Enter · Space | 단추 누르기 |
| + · = / − / 0 | 그림 영역에서 확대 · 축소 · 화면에 맞춤 |
| R | 그림 영역에서 오른쪽으로 회전 |
| 방향 키 | 확대한 그림 옮기기(영역 스크롤) |
| PageUp · PageDown | 도구 줄에서 이전 · 다음 쪽(PDF) |
## 접근성
root는 `role="group"`이고 이름은 "{파일 이름} 미리 보기"다. 도구 줄은 `role="toolbar"`(이름 "보기 도구", `aria-controls` = 보기 영역)이고 탭 정지는 하나다(roving tabindex). 단추 이름은 IconButton `label`이 툴팁과 같다. 화면에 맞춤은 `aria-pressed`. 그림 영역은 `role="group"` · 이름 "그림 보기 영역"이고 키 안내를 `aria-describedby`로 읽는다. 넘치면 스크롤 영역이라 탭으로 닿는다. 그림 `alt`는 `alt` 또는 파일 이름. PDF `object`는 `title` · `aria-label`이 파일 이름이다. 배율 · 쪽 · 회전이 바뀌면 숨은 `role="status"`가 읽는다("배율 125%" · "12쪽 중 3쪽"). 불러오는 중은 root `aria-busy`, 오류는 EmptyState `role="alert"`. 글자 대비는 `fg.primary` · `fg.secondary`로 4.5:1 이상, 포커스 링은 늘 보인다. 움직임은 없다(배율 변화는 즉시).
## 밀도
도구 단추는 IconButton sm(밀도의 `control-height-sm`). 보기 높이는 밀도와 관계없다. 휴대폰(touch)에서는 단추가 손가락 크기다.
## 플랫폼 차이
웹은 그림 `img`와 브라우저 내장 PDF 보기(`object`). 네이티브는 그림이 Image + 핀치 확대이고, PDF는 OS 미리 보기(공유 시트 · 빠른 보기)로 연다. props는 같다.
## 금지 사항
PDF를 그리려고 PDF 라이브러리 · 외부 보기 서비스(외부 요청)를 넣기 → 리뷰. 보기 영역 바탕을 상태색으로 칠하기 · 오류에 붉은 바탕(D-56) → 리뷰. 미리 보기를 위해 파일을 서버 밖 주소로 보내기 → 리뷰. 도구 단추에 글자 없는 아이콘만 두고 `label`을 빼기 → IconButton이 막는다.
## 스토리
Image · Pdf · Other · LoadingError · Expand.
## 참고
SY-16 · PG-44. 문서함(`ecm/my-docs/browser`)의 미리 보기. Attachment(파일 종류 · 크기 서식 `inferAttachmentType` · `formatAttachmentSize`), EmptyState(파일 카드 · 오류), IconButton. 벤치마크는 구조만.
