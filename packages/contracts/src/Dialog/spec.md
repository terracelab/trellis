# Dialog
## 용도
화면을 떠나지 않고 짧게 확인하거나 입력받는다(반려 사유 · 삭제 확인 · 발행 확인). 긴 입력이나 상세 보기는 Drawer.
## 해부(Anatomy)
backdrop(`bg.overlay`) · popup(`bg.elevated`, `radius.lg`, `shadow.lg`, 폭 sm 400 · md 560 · lg 800) · head(title `type.h2`, description, 닫기) · body · footer(오른쪽 정렬 버튼).
## Props
contract 표.
## Variants
size 3, tone default · danger(제목 앞 경고 아이콘).
## States
default.
## 동작
Base UI Dialog. 열리면 첫 입력 칸이나 첫 버튼으로 포커스, 닫히면 연 버튼으로 돌아간다. Escape · 바깥 누름으로 닫힌다(danger는 바깥 누름으로 닫지 않는다).
## 접근성
`role="dialog" aria-modal`, 제목 · 설명 연결, 포커스 가둠. 포커스는 창 안에 갇힌다: 마지막 칸에서 Tab → 첫 칸, 첫 칸에서 Shift+Tab → 마지막 칸을 keydown에서 바로 옮겨, Tab을 빨리 눌러도(자동 검사 · 키 반복) 창 밖으로 나가지 않는다. 창에는 aria-modal="true"(R-33).
## 밀도
안쪽 여백 `space.24`, 버튼 사이 `space.8`.
## 플랫폼 차이
네이티브는 Modal(components.md §9).
## 금지 사항
대화상자 안에서 대화상자 · "예 / 확인" 버튼 · 긴 폼.
## 스토리
Confirm · Danger · Form.
## 참고
Base UI Dialog, content.md §5 확인 질문.
