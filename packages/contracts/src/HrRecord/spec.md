# HrRecord
## 용도
한국형 인사기록카드(인사 마스터)를 한 화면에 보일 때 쓴다. 인적 사항 · 재직 정보 · 급여 · 보험 · 병역 · 학력 · 경력 · 자격 · 면허 · 어학 · 가족 · 인사 발령 · 상벌을 항목별로 라벨 · 값(DescriptionList)이나 작은 표로 그린다. 항목 값과 타입은 contracts `_shared/hr.ts`의 `HrMasterRecord`. 입력은 FormSection.
## 해부(Anatomy)
bar(항목 이동 링크 줄 + 가린 정보 단추) · section(제목 `type.h3` 700 + 내용, 항목 사이 `border.divider`) · DescriptionList(2열) · table(머리 `fg.tertiary` · 줄 사이 가는 선) · empty(`fg.tertiary` 한 줄).
## Props
contract 표.
## Variants
sections로 항목 · 순서를 고른다(기본 `HR_RECORD_SECTIONS` 전부). nav false면 링크 줄을 숨긴다. onRevealChange가 없으면 가린 정보 단추도 없다. onRevealField가 있으면 주민등록번호 · 계좌번호 칸마다 MaskedValue 보기 단추가 생긴다.
## States
default · focus(링크 · 단추 · 이동한 제목).
## 동작
주민등록번호는 `formatRrn`으로 뒷자리 첫 숫자만, 계좌번호는 `maskAccount`로 끝 네 자리만 보인다. 두 칸은 MaskedValue로 그린다. revealed면 전부 보인다(권한 확인은 앱). onRevealField가 있으면 칸마다 보기 단추를 누르고 사유(ReasonDialog)를 넣은 뒤 `onRevealField(칸, 사유)`를 부른다. 앱이 권한을 확인하고 열람을 기록한 뒤 원문을 돌려주면 그것을, 아무것도 돌려주지 않으면 record의 값을 60초 동안 보인다. 거절하면(Promise 실패) 대화 상자에 오류 문구가 남는다. 근속은 입사일부터 퇴사일 또는 today까지. 인사 발령 · 상벌은 최근 것이 위. 내용이 없는 항목은 "등록된 내용이 없습니다". 링크를 누르면 그 항목 제목으로 옮기고 포커스를 둔다.
## 접근성
root는 "인사기록카드" 이름의 group, 링크 줄은 nav. 항목 제목은 headingLevel(기본 h2). 표는 숨긴 caption(항목 이름)과 `th scope=col`. 가린 글자 ●는 읽히는 그대로다.
## 밀도
항목 위아래 `space.24`, 표 칸 위아래 `space.12`. 휴대폰은 DescriptionList 1열, 표 칸은 줄바꿈.
## 플랫폼 차이
네이티브는 링크 줄 대신 항목 접기.
## 금지 사항
가린 정보를 기본으로 보이기 · 항목마다 색 바탕 카드 · 제목 왼쪽 색 띠(D-56) · 주민등록번호를 칸 하나에 숫자 13자리로 → 리뷰.
## 스토리
Full · NewHire · RevealField.
## 참고
ProfileHeader, DescriptionList, content.md §4(주민등록번호 · 날짜).
