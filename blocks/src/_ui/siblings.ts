// 제목 줄 탭(PageHeader siblings, PR-27): 같은 묶음 화면을 큰 제목 글자로 나란히 둔다.
// 앱에 없는 화면은 빼고, 남은 화면이 하나뿐이면 보통 제목으로 둔다.
// 묶음 목록(id · 라벨)은 블록마다 `siblings` slot 상수(SIBLINGS)로 둔다. 서비스는 라벨을 자기 화면 제목으로 바꾼다.
import { useScreens } from '../_platform/index.js';

export interface SiblingScreen {
  /** 블록 id */
  id: string;
  /** 제목 글자(그 화면의 PageHeader title과 같게) */
  label: string;
}

/**
 * 샘플 인사 묶음. 예전에 복사한 블록이 import하므로 남겨 둔다.
 * @deprecated 블록의 `siblings` slot(SIBLINGS 상수)을 쓴다. 라벨이 샘플 화면 이름으로 고정이다
 */
export const HR_SCREENS: readonly SiblingScreen[] = [
  { id: 'erp/hr-payroll/employees', label: '인사 기록' },
  { id: 'erp/hr-payroll/hr-master', label: '인사 마스터' },
  { id: 'erp/hr-payroll/org-chart', label: '조직도' },
];

/**
 * 샘플 급여 묶음. 예전에 복사한 블록이 import하므로 남겨 둔다.
 * @deprecated 블록의 `siblings` slot(SIBLINGS 상수)을 쓴다. 라벨이 샘플 화면 이름으로 고정이다
 */
export const PAY_SCREENS: readonly SiblingScreen[] = [
  { id: 'erp/hr-payroll/payroll', label: '급여 대장' },
  { id: 'erp/hr-payroll/payslip', label: '임금명세서' },
];

/**
 * const SIBLINGS: readonly SiblingScreen[] = [{ id: ID, label: '인사 기록' }, …] // slot: siblings
 * <PageHeader {...useSiblings(ID, SIBLINGS)} />
 */
export function useSiblings(current: string, screens: readonly SiblingScreen[]) {
  const links = useScreens();
  const list = screens.filter((s) => s.id === current || links.has(s.id));
  if (list.length < 2) return {};
  return {
    siblings: list.map((s) => ({
      label: s.label,
      href: links.href(s.id),
      current: s.id === current,
    })),
    onSiblingPress: (href: string) => {
      const hit = list.find((s) => links.href(s.id) === href);
      if (hit) links.go(hit.id);
    },
  };
}
