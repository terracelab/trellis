import { useState } from 'react';
import { OrgChart } from './OrgChart.js';

const COMPANY = [
  {
    id: 'root',
    name: '테라트레이딩',
    head: { name: '이도윤', title: '대표' },
    headcount: 42,
    children: [
      {
        id: 'ops',
        name: '경영지원본부',
        head: { name: '김성경', title: '본부장' },
        headcount: 9,
        children: [
          { id: 'fin', name: '재무팀', head: { name: '박지수', title: '팀장' }, headcount: 4 },
          { id: 'hr', name: '인사팀', head: { name: '한서연', title: '파트장' }, headcount: 3 },
        ],
      },
      {
        id: 'sales',
        name: '영업본부',
        head: { name: '정민호', title: '본부장' },
        headcount: 18,
        children: [
          { id: 'kr', name: '국내영업팀', head: { name: '최유진', title: '팀장' }, headcount: 11 },
          { id: 'global', name: '해외영업팀', headcount: 6 },
        ],
      },
      {
        id: 'dev',
        name: '개발본부',
        head: { name: '이민호', title: '본부장' },
        headcount: 14,
        children: [
          {
            id: 'platform',
            name: '플랫폼팀',
            head: { name: '오세훈', title: '팀장' },
            headcount: 8,
          },
          { id: 'data', name: '데이터팀', head: { name: '서다은', title: '팀장' }, headcount: 5 },
        ],
      },
    ],
  },
];

/** 회사 조직도 — 조직 칸에 조직장과 인원. 고른 조직은 테두리 한 바퀴 */
export function Company() {
  const [selected, setSelected] = useState<string | null>('hr');
  return <OrgChart nodes={COMPANY} selected={selected} onSelect={setSelected} />;
}

/** 본부까지만 펼침 — 동그라미 단추나 → 키로 하위 조직을 연다 */
export function Collapsed() {
  return <OrgChart nodes={COMPANY} defaultExpanded={['root']} />;
}
