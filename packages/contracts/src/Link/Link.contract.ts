import { defineContract, type ContractBase } from '../_base.js';

/** 바깥 주소: http(s) · 프로토콜 생략(//)으로 시작한다. 새 탭으로 연다 */
export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href.trim());
}

/**
 * 앱 안 주소: 스킴이 없고(/path · ./path · path · ?q) 같은 쪽 안 이동(#id)이 아니다.
 * TrellisProvider navigate가 있으면 새로 고침 없이 이것으로 연다(R-T34). mailto: · tel:은 브라우저에 맡긴다
 */
export function isAppHref(href: string): boolean {
  const h = href.trim();
  return h !== '' && !h.startsWith('#') && !h.startsWith('//') && !/^[a-z][a-z0-9+.-]*:/i.test(h);
}

export interface LinkProps extends ContractBase {
  /** 주소. 앱 안 주소는 TrellisProvider navigate로, 바깥 주소는 새 탭으로 연다 */
  href: string;
  /** 링크 글자 */
  children?: unknown;
  /** 새 탭으로 여는 바깥 주소. 없으면 http(s)로 시작하는 주소를 바깥으로 본다 */
  external?: boolean;
  /**
   * default = 링크 색(fg.link), subtle = 보조 글자색(출처 · 문서 이름처럼 덜 중요한 링크),
   * plain = 본문 색(표 · 목록 안 링크. 회사 색 링크가 위험 빨강과 붙지 않게, D-146 제안).
   * DataGrid 칸 · DescriptionList 안의 default는 저절로 plain 모양이다
   */
  variant?: 'default' | 'subtle' | 'plain';
  /** hover = 가리킬 때 밑줄(표 칸 · 목록), always = 늘 밑줄(문장 안 링크는 색만으로 구분하지 않는다) */
  underline?: 'hover' | 'always';
  /** 갈 수 없는 링크(권한 없음). 주소를 떼고 흐린 글자 */
  disabled?: boolean;
  /** 누를 때(이동 전에). 이동은 그대로 일어난다 */
  onPress?: () => void;
}

export const LinkContract = defineContract<LinkProps>({
  name: 'Link',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    href: {
      type: 'string',
      required: true,
      description: '주소(앱 안은 TrellisProvider navigate, 바깥은 새 탭)',
    },
    children: { type: 'ReactNode', description: '링크 글자' },
    external: { type: 'boolean', description: '바깥 주소(새 탭). 없으면 http(s) 주소를 바깥으로' },
    variant: {
      type: "'default' | 'subtle' | 'plain'",
      default: 'default',
      values: ['default', 'subtle', 'plain'],
      description: '색(default 링크 색 · subtle 보조 글자색 · plain 본문 색, 표 · 목록 안)',
    },
    underline: {
      type: "'hover' | 'always'",
      default: 'hover',
      values: ['hover', 'always'],
      description: '밑줄(hover 가리킬 때 · always 늘, 문장 안 링크)',
    },
    disabled: { type: 'boolean', default: false, description: '갈 수 없는 링크(주소 없음)' },
    onPress: { type: '() => void', description: '누를 때(이동 전에)' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled'],
  a11y: { role: 'link', keyboard: ['Tab', 'Enter'], labelling: 'children' },
  platforms: { web: true, native: true },
});
