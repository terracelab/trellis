# @terracelab/trellis-contracts

Component contracts for Trellis, TerraceLab's design system for Korean business software. Props types, the fixed state and approval vocabularies, and number, amount and date formatting.

Trellis(트렐리스) 컴포넌트의 contract입니다. props 타입, 상태 어휘 7개, 결재 상태 5개, 숫자 · 금액 · 날짜 서식 함수가 들어 있습니다. 웹과 네이티브 구현이 같은 contract를 따릅니다.

## 설치

```bash
pnpm add @terracelab/trellis-contracts
```

`@terracelab/trellis-react`를 설치하면 함께 들어옵니다. 서식 함수를 앱 코드에서 직접 부를 때만 따로 설치합니다.

## 쓰기

```ts
import { formatAmount, formatPercent } from '@terracelab/trellis-contracts';

formatAmount(1234567, { unit: '원' }); // "1,234,567원"
formatPercent(12.34); // "12.3%"
```

금액은 원 단위에 천 단위 쉼표를 쓰고, 음수 부호는 U+2212(−)입니다. 결재 상태는 `draft · pending · approved · rejected · withdrawn` 다섯 개로 고정입니다.

## 문서

- 원칙과 규칙: https://trellis.terracelab.co.kr/docs/guide/principles/
- 문구와 숫자 표기: https://trellis.terracelab.co.kr/docs/guide/content/
- 소스: https://github.com/terracelab/trellis

## 라이선스

Apache-2.0
