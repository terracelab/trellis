// 업종 프리셋: 맞춤 구축 범위를 미리 골라 둔 것. 고객 미팅에서 "이 회사라면 이 메뉴"를 보여 준다.
import modules from '@terracelab/trellis-tokens/modules';

export interface Preset {
  id: string;
  label: string;
  description: string;
  home: string;
  /** 대시보드 아래에 더 보이는 홈 화면(블록 id). 업종에 맞는 대시보드 예시 */
  dashboards?: readonly string[];
  modules: readonly string[];
}

export const PRESETS: readonly Preset[] = [
  {
    id: 'trade',
    label: '무역 회사',
    description:
      '수입 식자재 · 포장재 유통. 세금계산서 · 발주 · 입고 · 거래처 원장 · 재고 · 수출입',
    home: 'home/dashboard/trade',
    dashboards: ['home/dashboard/forecast'],
    modules: [
      'tax',
      'accounting',
      'treasury',
      'purchasing',
      'warehouse',
      'inventory',
      'trade',
      'delivery',
      'sales',
      'approval',
      'customers',
    ],
  },
  {
    id: 'commerce',
    label: '이커머스 회사',
    description: '자사몰 · 오픈마켓 판매. 상품 · 주문 · 취소와 반품 · 채널 정산 · 재고 · 배송',
    home: 'commerce/orders/list',
    modules: [
      'products',
      'orders',
      'claims',
      'settlement',
      'promotions',
      'channels',
      'inventory',
      'warehouse',
      'delivery',
      'tax',
      'accounting',
      'customers',
      'support',
    ],
  },
  {
    id: 'manufacturing',
    label: '제조 회사',
    description: '재포장 공장. 현장 보드 · 생산 실적 · 설비 · 품질 · 자재 · 구매 · 재고',
    home: 'mes/shop-floor/board',
    modules: [
      'shop-floor',
      'equipment',
      'quality',
      'materials',
      'production',
      'purchasing',
      'inventory',
      'warehouse',
      'delivery',
      'accounting',
      'tax',
      'hr-payroll',
      'approval',
    ],
  },
  {
    id: 'office',
    label: '사무 · 그룹웨어',
    description: '전자결재 · 메일 · 근태 · 일정 · 게시판 · 메신저 · 문서함 · 인사',
    home: 'groupware/approval/inbox',
    modules: [
      'approval',
      'mail',
      'attendance',
      'calendar',
      'board',
      'messenger',
      'my-docs',
      'company-docs',
      'dept-docs',
      'doc-editor',
      'hr-payroll',
      'customers',
    ],
  },
  {
    id: 'franchise',
    label: '프랜차이즈 본부',
    description:
      '외식 가맹 본부. 가맹점 매출 · 지역 비교 · 개점 준비 · 초도 물량 · 식자재 공급 · 수요 예측',
    home: 'home/dashboard/franchise',
    dashboards: ['home/dashboard/forecast'],
    modules: [
      'sales',
      'purchasing',
      'inventory',
      'warehouse',
      'delivery',
      'customers',
      'support',
      'approval',
      'accounting',
      'tax',
    ],
  },
  {
    id: 'all',
    label: '전체 모듈',
    description: `모듈 ${modules.modules.length}종과 업종 화면 전부`,
    home: 'home/dashboard/trade',
    dashboards: ['home/dashboard/forecast', 'home/dashboard/franchise', 'home/dashboard/people'],
    modules: modules.modules.map((m) => m.id),
  },
];
