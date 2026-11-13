import { useState } from 'react';
import { Tag } from './Tag.js';

const ROW = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--tl-space-8)',
  alignItems: 'center',
} as const;

/** 분류 · 키워드 — 중립 한 가지 색이다. 지울 수 있는 칩은 끝에 × 단추 */
export function Basic() {
  return (
    <div style={ROW}>
      <Tag onRemove={() => undefined}>냉장</Tag>
      <Tag>수입 식자재</Tag>
      <Tag icon="tag">행사 상품</Tag>
      <Tag variant="outline">반품 가능</Tag>
    </div>
  );
}

/** 지우기 — × 단추 이름은 "<라벨> 삭제"이고 Tab으로 닿는다 */
export function Removable() {
  const [tags, setTags] = useState(['거래처 미팅', '견적 요청', '샘플 발송', '재계약']);
  return (
    <div style={ROW}>
      {tags.map((tag) => (
        <Tag key={tag} onRemove={() => setTags((all) => all.filter((x) => x !== tag))}>
          {tag}
        </Tag>
      ))}
      {tags.length === 0 && <span>태그가 없습니다</span>}
    </div>
  );
}

/** 사람 칩 — 원 아바타 24 + 이름. 참조자 · 참석자처럼 사람을 넣고 빼는 자리 */
export function People() {
  return (
    <div style={ROW}>
      <Tag person={{ name: '한서연' }} onRemove={() => undefined} />
      <Tag person={{ name: '정민호' }} onRemove={() => undefined} />
      <Tag person={{ name: '박서연' }} />
    </div>
  );
}

/** 크기 — sm은 표 칸 · 카드, md는 입력 칸 · 필터. 비활성은 × 단추가 없다 */
export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div style={ROW}>
        <Tag size="sm">냉동</Tag>
        <Tag size="sm" variant="outline">
          유통기한 임박
        </Tag>
        <Tag size="sm" onRemove={() => undefined}>
          본사 창고
        </Tag>
      </div>
      <div style={ROW}>
        <Tag>냉동</Tag>
        <Tag variant="outline">유통기한 임박</Tag>
        <Tag disabled onRemove={() => undefined}>
          본사 창고
        </Tag>
      </div>
    </div>
  );
}
