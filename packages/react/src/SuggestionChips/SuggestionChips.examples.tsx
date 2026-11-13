import { SuggestionChips } from './SuggestionChips.js';

const QUESTIONS = [
  '11월 미지급금 현황',
  '이번 주 입고 예정',
  '부가세 예정신고 일정',
  '연차 사용 현황',
];

/** 추천 질문 — 대화를 시작할 때 입력 위에 둔다. 누르면 그 글을 입력 칸에 넣는다 */
export function Questions() {
  return <SuggestionChips items={QUESTIONS} onSelect={() => {}} />;
}

/** 지금 입력과 같은 항목 — selected를 주면 같은 글의 칩이 눌린 모양이다(검색 · 이동의 자주 찾는 것) */
export function Selected() {
  return (
    <SuggestionChips
      label="자주 찾는 것"
      items={['급여명세서', '전표 입력', '거래처 등록']}
      selected="전표 입력"
      onSelect={() => {}}
    />
  );
}
