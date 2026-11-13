import { Field } from '../Field/Field.js';
import { RadioGroup } from './RadioGroup.js';

const TAX_TYPES = [
  { value: 'tax', label: '과세', description: '공급가액의 10%를 세액으로 계산합니다' },
  { value: 'zero', label: '영세율', description: '수출 · 내국신용장 거래' },
  { value: 'free', label: '면세', description: '미가공 식료품 등', disabled: true },
];

/** 과세 구분 — Field 라벨이 그룹 이름이 된다 */
export function Vertical() {
  return (
    <Field label="과세 구분" required>
      <RadioGroup options={TAX_TYPES} defaultValue="tax" name="taxType" />
    </Field>
  );
}

/** 가로 배치 — 짧은 라벨 3개 이하 */
export function Horizontal() {
  return (
    <RadioGroup
      label="결제 조건"
      orientation="horizontal"
      defaultValue="credit"
      options={[
        { value: 'cash', label: '현금' },
        { value: 'credit', label: '외상' },
        { value: 'bill', label: '어음' },
      ]}
    />
  );
}
