import { useState } from 'react';
import { Field } from '../Field/Field.js';
import { QuantityInput } from './QuantityInput.js';

/** 발주 수량 — − / + 와 화살표 키로 step만큼, 단위는 현장 표기 그대로 */
export function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="발주 수량" required help="누리식품 최소 발주 10BOX">
        <QuantityInput defaultValue={24} unit="BOX" min={10} step={2} />
      </Field>
      <Field label="입고 수량">
        <QuantityInput defaultValue={1240} units={['EA', 'BOX', 'PLT']} />
      </Field>
      <Field label="원두 중량">
        <QuantityInput defaultValue={12.5} unit="kg" digits={1} step={0.5} showStepper={false} />
      </Field>
      <Field label="재고 조정" error="가용재고 320EA를 넘을 수 없습니다">
        <QuantityInput defaultValue={400} max={320} />
      </Field>
    </div>
  );
}

/** 단위 환산 — units에 factor를 주면 기준 단위가 아닌 단위를 고를 때 칸 아래에 기준 수량이 보인다 */
export function Conversion() {
  const [unit, setUnit] = useState('BOX');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="실사 수량" help="보냉팩 젤 타입 1BOX = 40EA">
        <QuantityInput
          defaultValue={18}
          unit={unit}
          onUnitChange={setUnit}
          units={[
            { unit: 'EA', factor: 1 },
            { unit: 'BOX', factor: 40 },
            { unit: 'PLT', factor: 1_600 },
          ]}
        />
      </Field>
      <Field label="피킹 수량" help="냉동 가리비 관자 1BOX = 10KG">
        <QuantityInput
          defaultValue={2.5}
          digits={1}
          step={0.5}
          units={[
            { unit: 'BOX', factor: 10 },
            { unit: 'KG', factor: 1 },
          ]}
        />
      </Field>
    </div>
  );
}
