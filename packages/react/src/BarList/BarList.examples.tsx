import { formatCompactWon } from '@terracelab/trellis-contracts';
import { BarList } from './BarList.js';

/** 세로 — 요일처럼 짧은 범주 */
export function Vertical() {
  return (
    <BarList
      data={[
        { label: '월', value: 132 },
        { label: '화', value: 148 },
        { label: '수', value: 141 },
        { label: '목', value: 156 },
        { label: '금', value: 171 },
      ]}
      unit="건"
      height={200}
      ariaLabel="요일별 주문 건수. 금요일이 171건으로 가장 많다"
    />
  );
}

/** 가로 + 값 글자 — 이름이 길거나 6개를 넘을 때 */
export function Horizontal() {
  const data = [
    { label: '서울 본사', value: 612_000_000 },
    { label: '경기 남부', value: 318_000_000 },
    { label: '부산·경남', value: 246_000_000 },
    { label: '대구·경북', value: 164_000_000 },
    { label: '광주·전라', value: 128_000_000 },
    { label: '대전·충청', value: 92_000_000 },
    { label: '강원', value: 28_000_000 },
  ];
  return (
    <BarList
      data={data}
      unit="원"
      layout="horizontal"
      height={data.length * 30 + 16}
      format={formatCompactWon}
      showValues
      ariaLabel="지사별 10월 매출. 서울 본사 6.1억이 가장 많다"
    />
  );
}

/** 최고 · 최저만 — 막대가 많으면 끝 두 막대에만 값 글자를 붙인다 */
export function Extremes() {
  return (
    <BarList
      data={[
        { label: '1주', value: 412 },
        { label: '2주', value: 388 },
        { label: '3주', value: 455 },
        { label: '4주', value: 301 },
        { label: '5주', value: 367 },
        { label: '6주', value: 429 },
      ]}
      unit="건"
      height={200}
      extremes
      ariaLabel="주별 출고 건수. 3주 455건이 가장 많고 4주 301건이 가장 적다"
    />
  );
}

/** 막대가 단추 — onBarPress를 주면 막대를 눌러 그 범주 목록으로 간다. Tab · Enter로도 누른다 */
export function Pressable() {
  return (
    <BarList
      data={[
        { label: '검수 대기', value: 18 },
        { label: '입고 지연', value: 7 },
        { label: '반품 요청', value: 4 },
      ]}
      unit="건"
      layout="horizontal"
      height={3 * 30 + 16}
      showValues
      onBarPress={() => {}}
      ariaLabel="상태별 입고 건수. 막대를 누르면 그 상태의 목록을 연다"
    />
  );
}
