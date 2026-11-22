# DescriptionList

> `@terracelab/trellis-react` · CSS `.tl-description-list` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { DescriptionList } from '@terracelab/trellis-react';
```

## 용도

상세 화면 · 서랍에서 한 건의 속성(거래처 · 사업자등록번호 · 결제 조건)을 라벨과 값의 쌍으로 보여 줄 때 쓴다. 입력은 FormSection + Field, 여러 건 비교는 표.

## 해부(Anatomy)

list(`<dl>`, 격자 columns열) · item(`<div>`) · label(`<dt>`, `type.label` `fg.tertiary`) · value(`<dd>`, `density.body-font-size` `fg.primary`) · copy(IconButton sm, copy → check).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `items` | `{ label: string; value: ReactNode; span?: 1 \| 2 \| 3; copyable?: boolean; copyText?: string }[]` |  | 필수 | 라벨 · 값 쌍 |
| `columns` | `1 \| 2 \| 3` | `2` |  | 열 수 |
| `layout` | `'horizontal' \| 'vertical'` | `"horizontal"` |  | 라벨 위치 |

## Variants

columns 1 · 2 · 3 × layout horizontal(라벨 열 120, compact · 140, comfortable) · vertical(라벨 위). 항목마다 span 1 · 2 · 3.

## States

지원 상태: `default` · `hover` · `focus`

default · hover · focus(복사 버튼).

## 동작

span은 columns를 넘지 않게 줄인다. copyable 항목의 복사 버튼을 누르면 copyText(없으면 글자 · 숫자 값)를 클립보드에 쓰고, 아이콘이 2초 동안 check로 바뀐다. 값이 없으면 "–"를 보인다. 좁은 화면(640 미만)에서는 1열이 된다.

## 접근성

`<dl>` · `<dt>` · `<dd>` 짝. 복사 버튼 이름은 "<라벨> 복사"이고, 복사하면 숨긴 상태 글자 "복사했습니다"를 읽는다. 키보드 Tab으로 복사 버튼에 닿고 Enter · Space로 누른다.

## 밀도

행 간격 `space.12`, 가로 배치 라벨 열 120(compact) · 140(comfortable).

## 플랫폼 차이

네이티브는 항상 1열 vertical에 가깝게 그리고 복사는 Clipboard API.

## 금지 사항

입력 칸을 값 자리에 넣기(FormSection) · 라벨에 콜론 · 금액을 왼쪽 정렬 문자열로 → 리뷰.

## 예시

### 거래처 상세

라벨 왼쪽 2열, 번호는 복사 버튼

```tsx
import { formatAmount, formatBizNo } from '@terracelab/trellis-contracts';
import { DescriptionList } from '@terracelab/trellis-react';

const VENDOR = [
  { label: '거래처', value: '(주)한빛식자재' },
  { label: '사업자등록번호', value: formatBizNo('1248165307'), copyable: true },
  { label: '대표자', value: '한빛나' },
  { label: '담당자', value: '오수입 과장 · 031-778-2040' },
  { label: '결제 조건', value: '월말 마감 · 익월 25일 현금' },
  { label: '미수금', value: formatAmount(18420000, { unit: '원' }) },
  { label: '입금 계좌', value: '기업은행 482-019284-01-013', copyable: true, span: 2 as const },
  { label: '주소', value: '경기도 이천시 마장면 서이천로 512 물류센터 B동', span: 2 as const },
];

function Vendor() {
  return <DescriptionList items={VENDOR} />;
}
```

### 서랍 안

좁은 폭은 1열 · 라벨 위

```tsx
import { DescriptionList } from '@terracelab/trellis-react';

function Vertical() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 5)' }}>
      <DescriptionList
        columns={1}
        layout="vertical"
        items={[
          { label: '수입 신고번호', value: '41270-26-110482M', copyable: true },
          { label: '선적항', value: '부산항 · 2026-11-03 입항' },
          { label: '통관 상태', value: '통관 완료' },
        ]}
      />
    </div>
  );
}
```
