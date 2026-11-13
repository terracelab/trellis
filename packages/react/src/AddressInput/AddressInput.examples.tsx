import {
  type AddressResult,
  type AddressSearch,
  type AddressValue,
} from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { AddressInput, AddressSearchProvider } from './AddressInput.js';

// 예시용 주소 목록. 실제 앱은 자기 주소 검색 서버(설치형은 사내 서버)를 부르는 함수를 넣는다
const ADDRESSES: AddressResult[] = [
  {
    postcode: '06236',
    road: '서울특별시 강남구 테헤란로 152',
    jibun: '서울특별시 강남구 역삼동 737',
    building: '테라빌딩',
  },
  {
    postcode: '04524',
    road: '서울특별시 중구 세종대로 110',
    jibun: '서울특별시 중구 태평로1가 31',
  },
  {
    postcode: '13529',
    road: '경기도 성남시 분당구 판교역로 146',
    jibun: '경기도 성남시 분당구 백현동 532',
  },
  {
    postcode: '48058',
    road: '부산광역시 해운대구 센텀중앙로 79',
    jibun: '부산광역시 해운대구 우동 1505',
  },
];

const searchAddresses: AddressSearch = (query) =>
  Promise.resolve(
    ADDRESSES.filter((a) =>
      query.split(/\s+/).every((w) => `${a.road} ${a.jibun ?? ''} ${a.building ?? ''}`.includes(w)),
    ),
  );

/** 배송지 — 주소 검색으로 우편번호 · 도로명을 채우고 상세 주소를 친다 */
export function Search() {
  const [value, setValue] = useState<AddressValue | null>({
    postcode: '06236',
    road: '서울특별시 강남구 테헤란로 152',
    jibun: '서울특별시 강남구 역삼동 737',
    detail: '12층',
  });
  return (
    <Field label="배송지" required>
      <AddressInput value={value} onChange={setValue} search={searchAddresses} name="shipTo" />
    </Field>
  );
}

/** 직접 입력 — 검색 함수가 없으면 세 칸을 직접 친다(오프라인 설치형) */
export function Manual() {
  return (
    <Field label="사업장 주소" help="우편번호 · 도로명 주소 · 상세 주소를 직접 입력합니다">
      <AddressInput />
    </Field>
  );
}

/** 앱 전체 검색 — 앱 루트에서 AddressSearchProvider로 한 번 넣으면 모든 칸이 쓴다 */
export function Provider() {
  return (
    <AddressSearchProvider search={searchAddresses}>
      <Field label="본사 주소">
        <AddressInput />
      </Field>
    </AddressSearchProvider>
  );
}

/** 앱의 검색 창 — onSearchRequest를 주면 앱이 자기 창을 열고 고른 결과를 apply로 넣는다 */
export function OwnWindow() {
  return (
    <Field label="반품지">
      <AddressInput
        onSearchRequest={(apply) => {
          // 앱이 여는 검색 창 자리. 여기서는 첫 주소를 바로 넣는다
          const first = ADDRESSES[2];
          if (first) apply(first);
        }}
      />
    </Field>
  );
}
