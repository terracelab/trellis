import { defineContract, type ContractBase } from '../_base.js';

export interface Crumb {
  label: string;
  href?: string;
}

/** 같은 묶음의 다른 화면(제목 줄 탭). current = 지금 화면(title과 같은 글자) */
export interface PageSibling {
  label: string;
  href: string;
  current?: boolean;
}

export interface PageHeaderProps extends ContractBase {
  /** 화면 이름(모듈 · 기능 이름 그대로) */
  title: string;
  description?: string;
  breadcrumbs?: readonly Crumb[];
  /** 오른쪽 동작. primary는 하나 */
  actions?: unknown;
  /** 제목 옆 상태(Badge · DueBadge) */
  meta?: unknown;
  /** 뒤로 가기(상세 화면) */
  onBack?: () => void;
  /** 아래에 붙는 Tabs */
  tabs?: unknown;
  /** 제목 줄 탭: 같은 묶음 화면을 큰 제목 글자로 나란히(지금 화면만 진하게). 2~4개(PR-27) */
  siblings?: readonly PageSibling[];
  /** 제목 줄 탭을 누를 때(라우터 이동). 없으면 링크 기본 동작 */
  onSiblingPress?: (href: string) => void;
}

export const PageHeaderContract = defineContract<PageHeaderProps>({
  name: 'PageHeader',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    title: { type: 'string', required: true, description: '화면 이름' },
    description: { type: 'string', description: '설명 한 문장' },
    breadcrumbs: { type: 'Crumb[]', description: '위치' },
    actions: { type: 'ReactNode', description: '오른쪽 동작' },
    meta: { type: 'ReactNode', description: '제목 옆 상태(형제가 있으면 설명 줄)' },
    onBack: { type: '() => void', description: '뒤로' },
    tabs: { type: 'ReactNode', description: '아래 탭' },
    siblings: { type: 'PageSibling[]', description: '제목 줄 탭(같은 묶음 화면 2~4개)' },
    onSiblingPress: { type: '(href: string) => void', description: '제목 줄 탭을 누를 때' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'label-prop' },
  slots: ['actions', 'meta', 'tabs'],
  platforms: { web: true, native: true },
});
