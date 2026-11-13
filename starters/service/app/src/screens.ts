// 블록 화면 id ↔ 앱 주소(R-T07). 블록은 이 표에 있는 화면으로만 단추 · 링크를 그린다(useScreens().has).
// `pnpm ds:add <블록 id>`로 블록을 받으면 App.tsx의 router에 라우트를 넣고 여기에도 한 줄을 더한다.
//   'erp/hr-payroll/employees': '/people',
export const SCREENS: Readonly<Record<string, string>> = {};

/** 블록 링크 값(블록 id, ?k=v 붙을 수 있다, D-107)을 앱 주소로 */
export function screenHref(id: string, params?: Record<string, string>): string {
  const path = SCREENS[id] ?? '/';
  const q = params ? new URLSearchParams(params).toString() : '';
  return q ? `${path}?${q}` : path;
}

export const screenIds = Object.keys(SCREENS);
