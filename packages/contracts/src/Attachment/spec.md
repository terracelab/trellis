# Attachment
## 용도
문서 · 결재 · 대화에 붙은 파일 목록을 보여 주고 받기 · 삭제를 제공한다. 파일을 올리는 영역은 FileUpload.
## 해부(Anatomy)
root(`tl-attachment`, list는 `border.default` 상자 + 행 사이 `border.divider`, chips는 줄바꿈 칩) · file(행 높이 `density.row-height` · 칩 높이 `density.control-height-md`) · icon(종류별 file-text · file-spreadsheet · image · archive · file, `fg.secondary`) · name(`fg.primary`, 넘치면 말줄임) · size(`type.caption` `fg.tertiary`, tabular, 182KB · 2.4MB) · download · remove(IconButton).
## Props
contract 표.
## Variants
layout list · chips × 다운로드 · 삭제 유무.
## States
default. hover · focus는 안의 버튼 · 링크가 가진다. 나머지는 해당 없음.
## 동작
type을 생략하면 확장자로 정한다(pdf · xlsx/xls/csv · 이미지 · zip/7z/rar · 그 밖). href가 있고 downloadable이면 다운로드 버튼이 받기를 시작한다. downloadable이 false면 파일 이름이 새 창 링크가 된다. onRemove가 있으면 삭제 버튼이 이름을 넘긴다. 크기는 1,024 단위로 B · KB(정수) · MB · GB(소수 한 자리). 파일의 `thumb`(그림 미리 보기 주소, PG-36)는 MessageThread가 쓰고 Attachment는 쓰지 않는다(그림 파일도 칩 · 목록으로 보인다).
## 접근성
`<ul aria-label="첨부 파일">`. 버튼 이름은 "견적서.pdf 다운로드" · "견적서.pdf 삭제"처럼 파일 이름을 담는다. 아이콘은 장식이고 종류는 이름의 확장자로 읽힌다.
## 밀도
list 행 `density.row-height`, chips 칩 `density.control-height-md`.
## 플랫폼 차이
네이티브는 받기 대신 공유 시트로 연다. props는 같다.
## 금지 사항
종류를 색으로만 구분 · 크기를 문자열로 직접 만들기(formatAttachmentSize) · 타사 파일 아이콘 자산 — 리뷰.
## 스토리
List · Chips · ReadOnly · Removable.
## 참고
components.md §10 ApprovalFlow · ConversationalWork.
