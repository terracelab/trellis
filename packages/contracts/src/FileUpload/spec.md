# FileUpload
## 용도
파일을 끌어 놓거나 골라 올리고 진행을 보인다(증빙 · 계약서 · 거래명세서). 이미 올린 파일을 보여만 줄 때는 Attachment.
## 해부(Anatomy)
root · zone(점선 `border.default`, `bg.canvas`, `radius.md`, upload 아이콘 + 안내 + hint `fg.tertiary`) · input(숨은 `<input type="file">`) · notice(거른 파일 안내, `type.caption`) · list · file(파일 아이콘 · 이름 · 크기와 상태 `fg.tertiary` · 진행 막대 `brand.default` / `bg.sunken` · 삭제 IconButton).
## Props
contract 표.
## Variants
multiple 유무, 파일 상태 uploading(진행 막대 + %) · done(완료) · error(`status.danger.default` 아이콘 + 오류 문구).
## States
default · hover(zone `border.strong`) · active(끌어 놓는 중 zone `border.focus` + `brand.subtle`) · focus(zone 링) · disabled(zone `bg.sunken`, `fg.disabled`) · error(거른 파일 안내 · 파일 오류). loading은 파일 행의 uploading으로 보인다.
## 동작
zone을 누르거나 Enter · Space로 파일 선택 창을 연다. 끌어 놓은 파일도 accept · maxSize로 거르고, 통과한 파일만 onFilesChange로 넘긴다. 거른 파일은 이름과 이유를 zone 아래에 보인다. 목록은 files prop 그대로 그리고, 삭제를 누르면 onRemove(name). 업로드 자체는 앱이 한다.
## 접근성
숨은 input이 Tab을 받고 zone에 포커스 링이 보인다. 이름은 Field 라벨 + 안내 문구, hint는 `aria-describedby`. 진행 막대는 `role="progressbar"` + `aria-valuenow`. 거른 파일 안내는 `role="alert"`. 삭제 버튼 이름은 "<파일 이름> 삭제".
## 밀도
zone 안쪽 여백 `space.16`(comfortable `space.24`), 파일 행 `density.row-height` 이상.
## 플랫폼 차이
네이티브는 DocumentPicker를 여는 버튼(끌어 놓기 없음), 목록은 같다.
## 금지 사항
업로드 중 파일에 진행 표시 없음 · 오류를 색만으로 · 형식 · 크기 안내 없이 거르기 → 리뷰.
## 스토리
Default · Uploading · Error · Disabled.
## 참고
P2-10 FileUpload · Attachment. content.md §5 오류 문구.
