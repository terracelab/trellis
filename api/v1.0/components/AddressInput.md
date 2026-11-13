# AddressInput

> `@terracelab/trellis-react` · CSS `.tl-address-input` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { AddressInput } from '@terracelab/trellis-react';
```

## 용도

한국 주소를 입력할 때 쓴다(배송지 · 사업장 주소 · 반품지). 우편번호와 도로명은 앱이 넣은 주소 검색으로 채우고, 상세 주소는 사람이 친다. 주소를 보여 주기만 하면 DescriptionList.

## 해부(Anatomy)

root(group) · postcode(Input, 폭 `space.64` × 1.5, 숫자 5자리) · search(Button `search` 아이콘, 검색이 있을 때만) · road(Input) · jibun(지번 한 줄, `type.caption`, `fg.secondary`, 값에 있을 때만) · detail(Input). 검색 창: 넓은 화면은 대화상자(Dialog md), 좁은 화면은 아래 시트 · 찾기 칸(Input `search` 아이콘) + 검색 단추 · status(안내 · 불러오는 중 · 결과 수 · 없음 · 실패, `type.label`, `fg.secondary`) · listbox(행 `density.row-height`, 강조 행 `bg.sunken`, 도로명 · 건물 이름 · 지번 · 오른쪽 우편번호 `fg.secondary`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  |  | Field 밖 접근성 이름 |
| `value` | `AddressValue \| null` |  |  | 주소(제어) |
| `defaultValue` | `AddressValue \| null` |  |  | 처음 주소(비제어) |
| `onChange` | `(value: AddressValue \| null) => void` |  |  | 바뀔 때(모두 비면 null) |
| `search` | `(query, signal) => Promise<AddressResult[]>` |  |  | 검색 함수(앱이 넣는다). 없으면 AddressSearchProvider |
| `onSearchRequest` | `(apply) => void` |  |  | 앱이 자기 검색 창을 열 때(고른 결과를 apply(result)로 넘긴다) |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 필수(우편번호 · 도로명) |
| `readOnly` | `boolean` | `false` |  | 읽기 전용 |
| `name` | `string` |  |  | 폼 이름(<name>.postcode 등으로 제출) |

## Variants

검색 있음(우편번호 · 도로명은 읽기 전용, 누르면 검색 창) · 직접 입력(검색 함수가 없을 때 세 칸 모두 입력) · 앱 검색 창(onSearchRequest).

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `loading` · `error`

default · hover · focus(칸마다 Input과 같다) · disabled(세 칸 · 검색 단추 비활성) · loading(검색 창에서 찾는 중. 검색 단추 Spinner + status "불러오는 중") · error(Field 오류면 세 칸 테두리 `status.danger.default` + `aria-invalid`. 검색 실패는 status 문구 + 다시 시도 단추). active는 해당 없음.

## 동작

**검색 제공자는 앱이 넣는다.** Trellis는 네트워크를 쓰지 않는다. 설치형 제품은 사내 서버나 내장 주소 자료를 부르는 함수를 넣고, 클라우드 제품은 자기 서버 프록시를 부른다. 넣는 길은 셋이고 위에 있는 것이 이긴다.

| 길 | 쓰는 곳 | 하는 일 |
| --- | --- | --- |
| `onSearchRequest(apply)` | 앱이 이미 쓰는 검색 창(팝업 · 새 창)이 있을 때 | 검색 단추가 이 함수를 부른다. Trellis 검색 창은 열지 않는다. 앱은 고른 결과를 `apply(result)`로 넣는다(제어 · 비제어 모두 반영) |
| `search` prop | 칸 하나만 다른 검색을 쓸 때 | `(query, signal) => Promise<AddressResult[]>` |
| `<AddressSearchProvider search>` | 앱 전체(루트에서 한 번) | 안의 모든 AddressInput이 이 함수를 쓴다 |
| 없음 | 오프라인 · 검색 자료가 없는 설치형 | 검색 단추 없이 우편번호(숫자 5자리) · 도로명 · 상세 주소를 직접 입력한다 |

검색 창은 찾기 칸에 글자를 치고 Enter(또는 검색 단추)를 누를 때만 search를 부른다. 글자마다 부르지 않는다. 새 검색을 시작하거나 창을 닫으면 앞 요청의 `signal`이 끊긴다. 결과가 오면 첫 행이 강조된다.

| 키(찾기 칸) | 동작 |
| --- | --- |
| Enter | 강조한 행이 있으면 고르고, 없으면 검색 |
| ArrowDown · ArrowUp | 결과 행 강조를 옮긴다 |
| Escape | 검색 창을 닫는다(검색 단추로 돌아간다) |

결과를 고르면 우편번호 · 도로명 · 지번이 채워지고 창이 닫히며 포커스가 상세 주소로 간다. 같은 도로명을 다시 고르면 상세 주소를 남기고, 다른 주소면 비운다. onChange는 `{ postcode, road, jibun?, detail }`을 넘기고, 세 칸이 모두 비면 null을 넘긴다. value를 주면 제어, defaultValue면 비제어다. name을 주면 `<name>.postcode` · `<name>.road` · `<name>.jibun` · `<name>.detail`로 제출한다. `useTrellisForm`의 `form.bind(name)`을 그대로 넘긴다.

## 접근성

root는 `role="group"`이고 Field 라벨(밖이면 label prop, 없으면 "주소")이 이름이다. 세 칸은 각자 이름(우편번호 · 도로명 주소 · 상세 주소)을 갖고 Field의 도움말 · 오류를 `aria-describedby`로 받는다. 필수는 우편번호 · 도로명에만 건다. 검색 단추는 `aria-haspopup="dialog"` · `aria-expanded`. 찾기 칸은 `role="combobox"` + `aria-activedescendant`, 결과는 `role="listbox"` · `role="option"`. 안내 · 결과 수 · 없음 · 실패는 `role="status"`로 알린다. 대화상자가 열리면 찾기 칸에 포커스가 간다. 오류 요약에서 묶음으로 오면 비었을 때 검색 단추, 찬 뒤에는 상세 주소(직접 입력이면 우편번호)로 넘긴다.

## 밀도

칸 높이 `density.control-height-md`, 칸 글자 `density.input-font-size`(휴대폰 16). 칸 사이 `space.8`. 결과 행 `density.row-height`, 시트 안 결과 행은 `space.48`.

## 플랫폼 차이

웹은 폭이 `breakpoint.sm`보다 좁으면 검색 창이 아래 시트로 열린다(D-60). 검색 단추는 우편번호 옆을 채운다. 네이티브는 전체 화면 검색 시트다. 같은 search 함수 · onSearchRequest를 쓴다.

## 금지 사항

컴포넌트 안에서 주소 검색 서버를 직접 부르기(앱이 넣는다) · 외부 스크립트를 페이지에 끼워 넣는 검색 창을 기본으로 두기(설치형 오프라인) · 우편번호 · 도로명을 자유 입력으로 받으면서 검색도 켜기 · 상세 주소를 도로명 칸에 합치기 → 리뷰.

## 예시

### 배송지

주소 검색으로 우편번호 · 도로명을 채우고 상세 주소를 친다

```tsx
import type { AddressResult, AddressSearch, AddressValue } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field, AddressInput } from '@terracelab/trellis-react';

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

function Search() {
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
```

### 직접 입력

검색 함수가 없으면 세 칸을 직접 친다(오프라인 설치형)

```tsx
import { Field, AddressInput } from '@terracelab/trellis-react';

function Manual() {
  return (
    <Field label="사업장 주소" help="우편번호 · 도로명 주소 · 상세 주소를 직접 입력합니다">
      <AddressInput />
    </Field>
  );
}
```

### 앱 전체 검색

앱 루트에서 AddressSearchProvider로 한 번 넣으면 모든 칸이 쓴다

```tsx
import type { AddressResult, AddressSearch } from '@terracelab/trellis-contracts';
import { Field, AddressInput, AddressSearchProvider } from '@terracelab/trellis-react';

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

function Provider() {
  return (
    <AddressSearchProvider search={searchAddresses}>
      <Field label="본사 주소">
        <AddressInput />
      </Field>
    </AddressSearchProvider>
  );
}
```

### 앱의 검색 창

onSearchRequest를 주면 앱이 자기 창을 열고 고른 결과를 apply로 넣는다

```tsx
import type { AddressResult } from '@terracelab/trellis-contracts';
import { Field, AddressInput } from '@terracelab/trellis-react';

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

function OwnWindow() {
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
```
