# MaskedValue

> `@terracelab/trellis-react` · CSS `.tl-masked-value` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { MaskedValue } from '@terracelab/trellis-react';
```

## 용도

가린 개인정보(주민등록번호 · 계좌번호 · 전화번호 · 주소)를 보이고, 사유를 받은 뒤 잠깐 원문을 보여 줄 때 쓴다. 가린 글자는 contracts `formatRrn` · `maskAccount` · `maskPhone` · `maskName` · `maskAddress`로 만든다. 권한 확인과 열람 기록은 앱이 `onReveal` 안에서 한다. 입력하면서 가리는 칸은 MaskedInput, 항목 전체를 한 번에 여닫는 것은 HrRecord `onRevealChange`.

## 해부(Anatomy)

root(`span`, 글줄 안에 놓인다) · text(가린 글자 · 원문, tabular, `fg.primary`) · toggle(IconButton ghost sm: eye "보기" · eye-off "다시 가리기") · timer(timer 아이콘 + "58초 뒤 가림", `type.caption` `fg.tertiary`) · copy(IconButton copy, 원문이 보일 때만) · lock(자물쇠 아이콘 `fg.tertiary` + 이유 `type.caption` `fg.tertiary`. 이유는 좁은 칸 · 큰 글자에서 줄을 바꾸고 아이콘은 첫 줄에 남는다) · ReasonDialog(사유 입력) · 숨은 알림 영역(`aria-live`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `string` |  | 필수 | 가린 글자 |
| `label` | `string` |  | 필수 | 값 이름(단추 · 대화상자 이름) |
| `onReveal` | `(reason: string) => Promise<string>` |  |  | 사유 → 원문(권한 확인 · 기록은 앱) |
| `revealSeconds` | `number` | `60` |  | 원문을 보이는 시간(초) |
| `copyable` | `boolean` | `false` |  | 원문 복사 단추 |
| `canReveal` | `boolean` | `true` |  | false면 자물쇠 + 이유 |
| `lockedReason` | `string` |  |  | 볼 수 없는 이유 |

## Variants

보기 가능(onReveal 있음 · canReveal) · 잠김(canReveal false: 자물쇠 + 이유) · 읽기 전용(onReveal 없음: 가린 글자만). 원문이 보이는 동안은 남은 시간과 copyable이면 복사 단추가 붙는다.

## States

지원 상태: `default` · `focus` · `disabled`

default · focus(보기 · 복사 단추의 포커스 링) · disabled(canReveal false, 단추 대신 자물쇠). 원문을 불러오는 동안의 loading과 실패한 error는 ReasonDialog 안에 보인다(확인 단추 스피너 · "원문을 불러오지 못했습니다"). hover · active는 IconButton을 따른다.

## 동작

보기 단추를 누르면 ReasonDialog(제목 "{label} 보기", 확인 "원문 보기")가 열린다. 사유를 넣고 확인하면 `onReveal(사유)`를 부르고, 돌려받은 원문을 revealSeconds(기본 60초) 동안 보인다. 남은 시간은 1초마다 줄고 0이 되면 다시 가린다. 다시 가리기 단추로 먼저 가릴 수 있다. 다시 가리면 원문을 메모리에서도 지운다. 컴포넌트가 사라져도 지운다. onReveal이 실패하면 대화 상자가 열린 채 오류 문구가 보인다. 복사는 원문이 보일 때만 되고 "복사했습니다"를 알린다. 보기 · 다시 가리기는 같은 단추라 포커스가 그 자리에 남는다.

## 접근성

보기 단추 이름 "{label} 보기", 다시 가리기 "{label} 다시 가리기", 복사 "{label} 복사". 원문을 보이면 숨은 알림 영역이 "원문을 보입니다. 60초 뒤 다시 가립니다"를, 다시 가리면 "다시 가렸습니다"를 읽는다(`aria-live="polite"`). 1초마다 바뀌는 남은 시간 글자는 알림 영역 밖이라 계속 읽히지 않는다. 가린 글자 ●는 읽히는 그대로다. 잠김 이유는 화면 글자로 보인다.

## 밀도

단추는 IconButton sm(`density.control-height-sm`). 글자는 부모 글줄을 따른다. 표 칸에 넣어도 행 높이가 바뀌지 않는다.

## 플랫폼 차이

네이티브는 같은 단추 구성. 복사는 Clipboard, 알림은 AccessibilityInfo.announceForAccessibility.

## 금지 사항

원문을 props로 받아 화면 안에서만 가리기(가린 글자를 넘긴다) · 사유 없이 원문 보이기 · 원문을 시간 제한 없이 두기 · 권한 확인 · 기록을 컴포넌트에 맡기기 · 가린 글자를 문자열 템플릿으로 직접 만들기 → 리뷰.

## 예시

### 주민등록번호

보기를 누르면 사유를 받고, 60초 동안 원문을 보인 뒤 다시 가린다

```tsx
import { formatRrn } from '@terracelab/trellis-contracts';
import { MaskedValue } from '@terracelab/trellis-react';

function Resident() {
  return (
    <MaskedValue
      label="주민등록번호"
      value={formatRrn('9204152345678')}
      onReveal={async () => formatRrn('9204152345678', { masked: false })}
    />
  );
}
```

### 권한 없음

보기 단추 대신 자물쇠와 이유

```tsx
import { maskAccount } from '@terracelab/trellis-contracts';
import { MaskedValue } from '@terracelab/trellis-react';

function Locked() {
  return (
    <MaskedValue
      label="계좌번호"
      value={`국민은행 ${maskAccount('482-21-0193-847')}`}
      canReveal={false}
      lockedReason="급여 담당자만 봅니다"
    />
  );
}
```

### 설명 목록 안

계좌번호는 끝 네 자리만, 원문이 보이는 동안 복사할 수 있다

```tsx
import { maskAccount, maskAddress, maskPhone } from '@terracelab/trellis-contracts';
import { DescriptionList, MaskedValue } from '@terracelab/trellis-react';

function InRecord() {
  return (
    <DescriptionList
      items={[
        { label: '성명', value: '한서연' },
        {
          label: '휴대전화',
          value: (
            <MaskedValue
              label="휴대전화"
              value={maskPhone('010-2231-7780')}
              onReveal={async () => '010-2231-7780'}
              copyable
            />
          ),
        },
        {
          label: '급여 계좌',
          value: (
            <MaskedValue
              label="급여 계좌"
              value={`국민은행 ${maskAccount('482-21-0193-847')}`}
              onReveal={async () => '국민은행 482-21-0193-847'}
              revealSeconds={30}
              copyable
            />
          ),
        },
        {
          label: '주소',
          value: (
            <MaskedValue
              label="주소"
              value={maskAddress('서울특별시 강남구 테헤란로 152 강남파이낸스센터 4층')}
              onReveal={async () => '서울특별시 강남구 테헤란로 152 강남파이낸스센터 4층'}
            />
          ),
          span: 2,
        },
      ]}
    />
  );
}
```

### 상태

onReveal이 없으면 읽기 전용, 잠김, 원문을 불러오지 못하면 대화 상자에 오류가 남는다

```tsx
import { formatRrn } from '@terracelab/trellis-contracts';
import { MaskedValue } from '@terracelab/trellis-react';

function States() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)', justifyItems: 'start' }}>
      <MaskedValue label="주민등록번호" value={formatRrn('9204152345678')} />
      <MaskedValue label="주민등록번호" value={formatRrn('9204152345678')} canReveal={false} />
      <MaskedValue
        label="주민등록번호"
        value={formatRrn('9204152345678')}
        onReveal={() => Promise.reject(new Error('forbidden'))}
      />
    </div>
  );
}
```
