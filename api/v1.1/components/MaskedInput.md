# MaskedInput

> `@terracelab/trellis-react` · CSS `.tl-masked-input` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { MaskedInput } from '@terracelab/trellis-react';
```

## 용도

자리 수가 정해진 번호를 구분 글자와 함께 입력한다(사업자등록번호 · 법인등록번호 · 주민등록번호 · 외국인등록번호 · 전화번호 · 우편번호 · 계좌번호). 글자는 Input.

## 해부(Anatomy)

root(Input과 같은 테두리 · 높이 · 반경) · control(`font.numeric`) · reveal(secret일 때 오른쪽 보기 버튼, eye 아이콘 `fg.tertiary`, 누른 상태 `bg.sunken` + `fg.primary`, DateField 달력 버튼과 같은 모양) · note(Field 밖에서 스스로 찾은 오류, Field 오류 칸과 같은 모양).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  |  | Field 밖 접근성 이름 |
| `mask` | `'bizNo' \| 'corpNo' \| 'phone' \| 'zip' \| 'rrn' \| 'bankAccount' \| string` |  | 필수 | 프리셋 또는 # 패턴 |
| `bank` | `string \| null` |  |  | bankAccount 은행 코드(3자리, 없으면 숫자만 · 다른 마스크는 무시) |
| `value` | `string` |  |  | 숫자만(제어) |
| `defaultValue` | `string` |  |  | 처음 숫자(비제어) |
| `onChange` | `(raw: string, formatted: string) => void` |  |  | 값이 바뀔 때 |
| `placeholder` | `string` |  |  | 예시 값(없으면 프리셋 예시) |
| `secret` | `boolean` | `false` |  | rrn 뒷자리 여섯 자리 가림 · 보기 버튼(다른 마스크는 무시) |
| `validate` | `boolean` | `false` |  | bizNo 검증 숫자 검사(다 친 번호가 틀리면 오류, 다른 마스크는 무시) |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 필수 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 높이 |
| `name` | `string` |  |  | 폼 이름(숫자만 제출) |

## Variants

mask bizNo(###-##-#####) · corpNo(######-#######) · rrn(######-#######, 주민등록번호) · phone(02 · 010 · 지역번호 · 대표번호에 따라 자동) · zip(#####) · bankAccount(은행마다 다르다. `bank`의 형식, 없으면 숫자만) · 직접 패턴('#'이 숫자 한 자리). 외국인등록번호는 뒷자리 첫 숫자가 5~8일 뿐 주민등록번호와 형식이 같아서 rrn을 쓴다. size 5(xs · sm · md · lg · xl).

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`, 보기 버튼도 비활성) · error(`status.danger.default` 테두리, Field error · invalid · validate 실패). 모든 자리를 채우면 root에 `data-complete`. active · loading은 해당 없음.

## 동작

숫자만 받고 구분 글자는 자동으로 넣는다. 지울 때는 구분 글자를 건너뛴다(Backspace는 앞 숫자, Delete는 뒤 숫자). 커서는 입력하던 자리에 남는다. 붙여 넣은 "123 45 67890"도 정리된다. onChange는 숫자만(raw)과 보이는 값(formatted)을 함께 넘긴다. 자리 수 검증 오류 문구는 Field error로 보인다.

secret(rrn만): 뒷자리 첫 숫자까지 보이고 나머지 여섯 자리는 ●로 가린다(900101-1●●●●●●). 가린 칸에 숫자를 하나 치면 그 숫자가 1초쯤 보였다가 가려진다(휴대폰 비밀번호 칸과 같다). 붙여 넣은 숫자는 보이지 않는다. 가린 칸 가운데서 지우기 · 넣기 · 고른 구간 바꾸기 · 붙여 넣기가 모두 되고, 커서 자리로 어느 칸인지 정한다. 보기 버튼을 누르면 펼치고, 다시 누르거나 칸과 버튼 밖으로 포커스가 나가면 다시 가린다. 버튼을 눌러도 칸의 포커스와 커서는 그대로다. onChange의 raw는 늘 숫자 13자리 전부이고, formatted는 가린 글자(`formatRrn`)다. 폼 제출(name)은 숫자 전부. 다른 마스크에서는 secret을 무시한다.

검증: rrn은 자리 수(13)만 본다. 2020년 10월부터 새로 받는 주민등록번호는 성별 숫자 뒤 여섯 자리가 임의 번호라 예전 검증 숫자 공식이 맞지 않는다. 공식으로 막으면 그 뒤에 받은 번호가 오류가 된다.

bankAccount(PG-37): 계좌번호는 은행마다 자리 수와 구분이 다르다. `bank`에 은행 코드(금융결제원 3자리)를 주면 `BANK_ACCOUNT_FORMATS`의 그 은행 형식으로 구분 글자를 넣는다(기업은행 003 = 024-118420-01-011, 국민은행 004 = 421701-01-284519, 신한은행 088 = 110-123-456789). 모든 자리를 채우면 `data-complete`다. `bank`가 없거나 표에 없는 은행이면 구분 글자 없이 숫자만 16자리까지 받고 10자리부터 다 친 것으로 본다(은행 앱의 "숫자만 입력"과 같다). 형식은 은행이 지금 새로 여는 계좌 기준이라 옛 형식 계좌(자리 수가 다르다)는 `bank`를 비우고 받는다. 표에 없는 은행은 mask에 패턴을 직접 준다. `bank`가 바뀌면 같은 숫자를 새 형식으로 다시 보인다. placeholder 기본값은 그 은행의 예시, 은행이 없으면 숫자 예시다. 표 · 상세에서는 `maskAccount(formatBankAccount(raw, bank))`를 MaskedValue에 넘겨 끝 네 자리만 보인다. 저장은 숫자 + 은행 코드다.

validate(bizNo만, 기본 꺼짐): 10자리를 다 쳤는데 검증 숫자(`isValidBizNo`)가 틀리면 오류 상태가 되고 "사업자등록번호가 맞지 않습니다. 사업자등록증의 번호를 확인하세요"를 Field 오류 칸에 올린다(Field 밖이면 칸 아래). 덜 친 번호는 보지 않는다. 고치면 바로 걷힌다. Field error가 있으면 그것이 보인다. 기본으로 켜지 않는 이유는 검증 숫자가 맞아도 국세청에 있는 번호인지는 모르고, 앱이 서버 조회 · 폼 스키마로 검사하는 경우가 많아서다. 제출 전 검사는 앱이 `isValidBizNo`로 한다. 다른 마스크에서는 validate를 무시한다.

## 접근성

`<input inputmode="numeric" autocomplete="off">`(비밀번호 관리 도구가 끼어들지 않는다). Field 안에서는 라벨 · 설명 · 오류가 자동 연결된다. placeholder는 프리셋 예시 값(123-45-67890, secret이면 900101-1●●●●●●, bankAccount는 고른 은행의 예시)이고 라벨을 대신하지 않는다. 보기 버튼은 Tab으로 가는 `<button>`이고 이름은 "주민등록번호 보기", 펼친 상태는 `aria-pressed`, 칸과는 `aria-controls`로 잇는다. 화면 읽기 프로그램은 가린 칸을 가림 글자 그대로 읽는다. validate 문구는 치는 도중에 생기므로 `role="alert"`로 바로 읽힌다.

## 밀도

높이 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). 입력 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로). 보기 버튼 폭 `density.control-height-sm`, 좁은 화면은 `density.control-height-lg`.

## 플랫폼 차이

네이티브는 TextInput keyboardType number-pad, 같은 applyMask를 쓴다. secret은 같은 가림 규칙(`formatRrn`)을 쓰고, 보기 버튼은 칸 오른쪽 Pressable.

## 금지 사항

번호를 구분 글자째 저장(숫자만 저장) · 계좌번호를 은행 코드 없이 저장(형식을 되살리지 못한다) · 가린 글자(●)를 값으로 저장 · 사업자등록번호를 Input + 정규식으로 · 예시 값이 아닌 placeholder("번호를 입력하세요") · 표 · 상세 · 명세서에 주민등록번호 전부 보이기(`formatRrn` 기본은 가림) · 주민등록번호를 검증 숫자 공식으로 막기 → 리뷰.

## 예시

### 거래처 등록

숫자만 치면 구분 글자가 들어가고, 저장 값은 숫자만

```tsx
import { Field, MaskedInput } from '@terracelab/trellis-react';

function Presets() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="사업자등록번호" required>
        <MaskedInput mask="bizNo" defaultValue="2148812345" />
      </Field>
      <Field label="법인등록번호">
        <MaskedInput mask="corpNo" />
      </Field>
      <Field label="대표 전화" help="02 · 010 · 지역번호에 맞춰 나눕니다">
        <MaskedInput mask="phone" defaultValue="0215885678" />
      </Field>
      <Field label="우편번호">
        <MaskedInput mask="zip" defaultValue="06236" size="sm" />
      </Field>
    </div>
  );
}
```

### 직접 패턴 · 오류

'#'이 숫자 한 자리

```tsx
import { Field, MaskedInput } from '@terracelab/trellis-react';

function Pattern() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="계좌번호" help="대양상사 결제 계좌">
        <MaskedInput mask="###-######-##-###" defaultValue="11012345612345" />
      </Field>
      <Field label="사업자등록번호" error="사업자등록번호는 10자리입니다">
        <MaskedInput mask="bizNo" defaultValue="1234567" />
      </Field>
    </div>
  );
}
```

### 결제 계좌 등록

은행을 먼저 고르면 계좌번호가 그 은행 형식으로 나뉜다. 은행이 없으면 숫자만 받는다

```tsx
import { BANK_ACCOUNT_FORMATS, formatBankAccount, maskAccount } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { Field, MaskedValue, Select, MaskedInput } from '@terracelab/trellis-react';

function BankAccount() {
  const [bank, setBank] = useState<string | null>('003');
  const [digits, setDigits] = useState('02411842001011');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="은행" required>
        <Select
          value={bank}
          onChange={setBank}
          options={BANK_ACCOUNT_FORMATS.map((b) => ({ value: b.code, label: b.name }))}
        />
      </Field>
      <Field label="계좌번호" required help="저장 값은 숫자와 은행 코드입니다">
        <MaskedInput mask="bankAccount" bank={bank} value={digits} onChange={setDigits} />
      </Field>
      <Field label="계좌번호" help="은행을 모르면 숫자만 받습니다">
        <MaskedInput mask="bankAccount" defaultValue="110123456789" />
      </Field>
      <MaskedValue label="결제 계좌" value={maskAccount(formatBankAccount(digits, bank))} />
    </div>
  );
}
```

### 직원 등록

주민등록번호는 뒷자리 첫 숫자만 보이고 나머지는 가린다. 사업자등록번호는 validate로 검증 숫자를 본다

```tsx
import { Field, MaskedInput } from '@terracelab/trellis-react';

function Secret() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="주민등록번호" required help="보기 버튼을 누르면 잠깐 펼칩니다">
        <MaskedInput mask="rrn" secret defaultValue="9001011234567" />
      </Field>
      <Field label="외국인등록번호">
        <MaskedInput mask="rrn" secret />
      </Field>
      <Field label="사업자등록번호" required>
        <MaskedInput mask="bizNo" validate defaultValue="1234567890" />
      </Field>
    </div>
  );
}
```
