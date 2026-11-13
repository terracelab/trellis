import { defineContract, type ContractBase } from '../_base.js';

/** 한국 주소 한 건. 우편번호 · 도로명은 검색에서, 상세 주소는 사람이 친다 */
export interface AddressValue {
  /** 우편번호(국가기초구역번호 5자리) */
  postcode: string;
  /** 도로명 주소 */
  road: string;
  /** 지번 주소(검색 결과에 있을 때) */
  jibun?: string;
  /** 상세 주소(동 · 층 · 호) */
  detail: string;
}

/** 검색 결과 한 건 */
export interface AddressResult {
  postcode: string;
  road: string;
  jibun?: string;
  /** 건물 이름(결과 목록에서 도로명 옆에 보인다) */
  building?: string;
}

/**
 * 주소 검색 함수. 앱이 넣는다(Trellis는 네트워크를 쓰지 않는다).
 * signal은 새 검색이 시작되거나 검색 창이 닫히면 끊긴다.
 */
export type AddressSearch = (
  query: string,
  signal: AbortSignal,
) => Promise<readonly AddressResult[]>;

export interface AddressInputProps extends ContractBase {
  /** Field 밖에서 쓸 때의 접근성 이름. Field 안이면 Field 라벨이 이름이 된다 */
  label?: string;
  /** 주소(제어). 비어 있으면 null */
  value?: AddressValue | null;
  defaultValue?: AddressValue | null;
  /** 바뀔 때. 우편번호 · 도로명 · 상세 주소가 모두 비면 null */
  onChange?: (value: AddressValue | null) => void;
  /** 이 칸의 검색 함수. 없으면 AddressSearchProvider의 함수, 둘 다 없으면 직접 입력 */
  search?: AddressSearch;
  /** 앱이 자기 검색 창을 열 때. 주면 검색 단추가 이 함수를 부르고, 앱은 고른 결과를 apply로 넣는다 */
  onSearchRequest?: (apply: (result: AddressResult) => void) => void;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  /** 폼 이름. 칸마다 <name>.postcode · <name>.road · <name>.jibun · <name>.detail로 제출한다 */
  name?: string;
}

export const AddressInputContract = defineContract<AddressInputProps>({
  name: 'AddressInput',
  props: {
    label: { type: 'string', description: 'Field 밖 접근성 이름' },
    id: { type: 'string', description: '묶음 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'AddressValue | null', description: '주소(제어)' },
    defaultValue: { type: 'AddressValue | null', description: '처음 주소(비제어)' },
    onChange: {
      type: '(value: AddressValue | null) => void',
      description: '바뀔 때(모두 비면 null)',
    },
    search: {
      type: '(query, signal) => Promise<AddressResult[]>',
      description: '검색 함수(앱이 넣는다). 없으면 AddressSearchProvider',
    },
    onSearchRequest: {
      type: '(apply) => void',
      description: '앱이 자기 검색 창을 열 때(고른 결과를 apply(result)로 넘긴다)',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류(Field error면 자동)' },
    required: { type: 'boolean', default: false, description: '필수(우편번호 · 도로명)' },
    readOnly: { type: 'boolean', default: false, description: '읽기 전용' },
    name: { type: 'string', description: '폼 이름(<name>.postcode 등으로 제출)' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'loading', 'error'],
  a11y: {
    role: 'group',
    keyboard: ['Tab', 'Enter(검색)', 'ArrowDown', 'ArrowUp', 'Enter(고르기)', 'Escape'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
