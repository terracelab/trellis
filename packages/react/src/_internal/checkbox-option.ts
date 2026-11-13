// CheckboxGroup 선택지 하나가 안의 Checkbox에 넘기는 것. Checkbox의 공개 props는 그대로 두고 묶음 안에서만 쓴다.
// 혼자 쓰는 Checkbox로 바로 저장하는 설정은 Switch다(Checkbox 금지 사항). 바로 저장은 선택지 묶음에만 있다.
import { createContext, useContext } from 'react';

export interface CheckboxOptionContextValue {
  /** 저장 중(pending): 읽기 전용 + aria-busy + 상자 옆 Spinner. 포커스는 남는다 */
  busy?: boolean;
  /** 더 이을 설명 id(줄 끝 정보 meta) */
  describedBy?: string;
}

export const CheckboxOptionContext = createContext<CheckboxOptionContextValue | null>(null);

export const useCheckboxOption = () => useContext(CheckboxOptionContext);
