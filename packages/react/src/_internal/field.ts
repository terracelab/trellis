// Field ↔ 입력 부품 연결. Field가 id · 설명 id · 오류 · 필수 · 비활성을 내려 주고, 입력 부품은 useFieldControl로 받는다.
// Field 밖에서도 입력 부품은 혼자 동작한다(값은 props가 이긴다).
import { createContext, useContext, useEffect, useId } from 'react';

export interface FieldContextValue {
  id: string;
  /** 라벨 요소 id. <label for>로 잇지 못하는 묶음(RadioGroup · CheckboxGroup)은 aria-labelledby로 쓴다 */
  labelId?: string;
  /** 라벨 글자. 좁은 화면에서 고르는 시트의 제목이 된다 */
  labelText?: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  /**
   * 입력 부품이 스스로 찾은 오류(DateField 범위 밖 · MaskedInput 검증 숫자)를 Field 오류 칸에 올린다.
   * key는 부품 하나, null이면 내린다. Field error prop이 있으면 그것이 보인다
   */
  report?: (key: string, message: string | null) => void;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldControl(props: {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}) {
  const field = useContext(FieldContext);
  const own = useId();
  return {
    id: props.id ?? field?.id ?? own,
    labelId: field?.labelId,
    labelText: field?.labelText,
    describedBy: field?.describedBy,
    invalid: props.invalid ?? field?.invalid ?? false,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
  };
}

/**
 * 입력 부품이 스스로 찾은 오류 문구를 Field 오류 칸에 보인다(null이면 내린다).
 * Field 안이면 true를 돌려준다. Field 밖이면 false이고, 부품이 칸 아래에 직접 그린다.
 */
export function useFieldMessage(message: string | null): boolean {
  const report = useContext(FieldContext)?.report;
  const key = useId();
  useEffect(() => {
    report?.(key, message);
  }, [report, key, message]);
  useEffect(() => () => report?.(key, null), [report, key]);
  return Boolean(report);
}
