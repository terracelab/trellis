import { type TagSuggestion } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { TagInput } from './TagInput.js';

const KEYWORDS: TagSuggestion[] = [
  { value: '냉장', label: '냉장' },
  { value: '냉동', label: '냉동' },
  { value: '수입 식자재', label: '수입 식자재' },
  { value: '행사 상품', label: '행사 상품' },
  { value: '유통기한 임박', label: '유통기한 임박' },
];

const PEOPLE: TagSuggestion[] = [
  { value: 'E-0012', label: '한서연', meta: '인사팀 · 매니저' },
  { value: 'E-0031', label: '정민호', meta: '영업팀 · 책임' },
  { value: 'E-0044', label: '박서연', meta: '재무팀 · 선임' },
  { value: 'E-0052', label: '이도윤', meta: '구매팀 · 주임' },
  { value: 'E-0067', label: '최하늘', meta: '물류팀 · 사원' },
];

/** 키워드 — 치면 추천이 걸러진다. 추천에 없는 글자도 Enter · 쉼표 · 붙여 넣기로 칩이 된다 */
export function Keywords() {
  const [tags, setTags] = useState<string[]>(['냉장', '행사 상품']);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <Field
        label="상품 태그"
        help="Enter나 쉼표로 넣습니다. 빈 칸에서 Backspace는 마지막 태그를 뺍니다"
      >
        <TagInput value={tags} onChange={setTags} suggestions={KEYWORDS} placeholder="냉장" />
      </Field>
    </div>
  );
}

/** 참조자 — 사람 모드는 사람 칩(아바타 + 이름)이고 목록에 있는 사람만 넣는다. 값은 사번 */
export function People() {
  const [cc, setCc] = useState<string[]>(['E-0031']);
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <Field label="참조" help={`${cc.length}명. 결재가 끝나면 알림을 받습니다`}>
        <TagInput
          mode="person"
          value={cc}
          onChange={setCc}
          suggestions={PEOPLE}
          placeholder="이름 · 부서"
          name="cc"
        />
      </Field>
    </div>
  );
}

/** 한도 · 오류 · 비활성 — max에 닿으면 입력 칸이 잠기고 그 사실을 읽어 준다 */
export function Limits() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="회의 참석자" help="최대 3명">
        <TagInput
          mode="person"
          defaultValue={['E-0012', 'E-0044', 'E-0067']}
          suggestions={PEOPLE}
          max={3}
        />
      </Field>
      <Field label="담당자" error="담당자를 한 명 이상 넣으세요" required>
        <TagInput mode="person" suggestions={PEOPLE} />
      </Field>
      <Field label="상품 태그" disabled>
        <TagInput defaultValue={['냉동']} suggestions={KEYWORDS} />
      </Field>
    </div>
  );
}
