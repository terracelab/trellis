# Payslip

> `@terracelab/trellis-react` · CSS `.tl-payslip` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Payslip } from '@terracelab/trellis-react';
```

## 용도

월 임금명세서를 화면과 인쇄로 보여 줄 때 쓴다(내 급여명세서 · 급여 정산 결과). 정산 목록은 DataGrid, 원천징수영수증 같은 정식 서식은 Paper.

## 해부(Anatomy)

article(`bg.surface`, `border.divider`, `radius.xl`) · 머리(회사 · 제목 `type.h1` · 지급일) · 근로자 칸(성명 · 사번 또는 생년월일 · 소속 · 직위 · 직급) · 근로 정보(근로일수 · 총 근로시간 · 연장 · 야간 · 휴일) · "금액 단위 원" 한 번 · 지급 항목 표 · 공제 항목 표(두 열, 휴대폰은 한 열) · 실지급액(`type.display`, 위 2px `fg.primary` 선).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `period` | `string` |  | 필수 | 귀속 연월 'YYYY-MM' |
| `payDate` | `string` |  | 필수 | 지급일 'YYYY-MM-DD' |
| `company` | `string` |  |  | 회사 이름 |
| `employee` | `PayslipEmployee` |  | 필수 | 근로자(성명 + 사번 또는 생년월일 · 소속 · 직위 · 직급) |
| `work` | `PayslipWork` |  |  | 근로일수 · 시간(연장 · 야간 · 휴일) |
| `earnings` | `PayItem[]` |  | 필수 | 지급 항목 |
| `deductions` | `PayItem[]` |  | 필수 | 공제 항목 |
| `note` | `ReactNode` |  |  | 아래 안내 |
| `headingLevel` | `1 \| 2 \| 3` | `2` |  | 제목 단계 |
| `loading` | `boolean` | `false` |  | 불러오는 중(스켈레톤) |

## Variants

사번 · 생년월일 × 근로 정보 있음 · 없음 × 계산 방법 있음 · 없음.

## States

지원 상태: `default` · `loading`

default · loading(스켈레톤).

## 동작

금액은 formatAmount(천 단위, 오른쪽 정렬, tabular)이고 칸마다 원을 붙이지 않는다. 계산 방법(basis)은 항목 이름 아래 작은 글자, 비과세는 이름 옆 글자. code가 있으면 이름을 사전에서 꺼낸다(국민연금 · 건강보험 · 장기요양보험 · 고용보험 · 소득세 · 지방소득세 등). 합계 줄은 굵은 위 선 + 굵은 글자, 바탕은 칠하지 않는다. 연장 · 야간 · 휴일 시간은 0이어도 적는다(법정 기재 사항). 근로자 칸은 `employee.position`을 "직위", `employee.grade`를 "직급"으로 적는다(ProfileHeader · HrRecord와 같은 이름). 직급이 직위와 같으면 한 번만 적는다. 인쇄하면 paper 토큰(흰 종이 · 검은 글자)으로 바뀐다.

## 접근성

`<article>` 이름 = 제목. 표마다 caption(지급 항목 · 공제 항목), 항목 이름은 `th scope="row"`, 계산 방법 앞에 숨은 "계산 방법".

## 밀도

밀도와 무관하다(문서).

## 플랫폼 차이

네이티브는 인쇄 대신 PDF 공유.

## 금지 사항

공제를 파랑 · 지급을 빨강으로 칠하기(금융 색은 수입 · 지출 방향에만), 칸마다 원, 실지급액에 바탕색 → 리뷰.

## 예시

### 월급제

근로자 특정 정보 · 근로 시간 · 항목별 계산 방법 · 공제 · 실지급액(임금명세서 법정 기재 사항)

```tsx
import { Payslip } from '@terracelab/trellis-react';

const EARNINGS = [
  { code: 'basePay', amount: 3200000, basis: '월 소정근로 209시간' },
  { code: 'overtimePay', amount: 137799, basis: '6시간 × 통상시급 15,311원 × 1.5' },
  { code: 'mealAllowance', amount: 200000, taxFree: true },
] as const;

const DEDUCTIONS = [
  { code: 'nationalPension', amount: 158500, basis: '기준소득월액 3,337,000원 × 4.75%' },
  { code: 'healthInsurance', amount: 119990, basis: '보수월액 × 3.595%' },
  { code: 'longTermCare', amount: 15760, basis: '건강보험료 × 13.14%' },
  { code: 'employmentInsurance', amount: 30040, basis: '보수 × 0.9%' },
  { code: 'incomeTax', amount: 105540, basis: '간이세액표 · 부양가족 1명' },
  { code: 'localIncomeTax', amount: 10550, basis: '소득세 × 10%' },
] as const;

function Monthly() {
  return (
    <Payslip
      company="테라트레이딩"
      period="2026-10"
      payDate="2026-10-23"
      employee={{
        name: '박서연',
        employeeNo: 'E-2024-031',
        department: '경영지원팀',
        position: '대리',
        grade: 'G2',
      }}
      work={{ days: 20, hours: 166, overtimeHours: 6 }}
      earnings={EARNINGS}
      deductions={DEDUCTIONS}
      note="급여 문의는 경영지원팀 내선 204로 연락해 주세요."
    />
  );
}
```

### 시급제 단시간 근로자

사번 대신 생년월일, 주휴수당 계산 방법을 적는다

```tsx
import { Payslip } from '@terracelab/trellis-react';

function Hourly() {
  return (
    <Payslip
      company="테라트레이딩"
      period="2026-10"
      payDate="2026-11-05"
      employee={{
        name: '정하늘',
        birthDate: '2003-04-17',
        department: '물류센터',
        position: '사원',
      }}
      work={{ days: 16, hours: 96 }}
      earnings={[
        { code: 'basePay', label: '기본급(시급)', amount: 990720, basis: '96시간 × 10,320원' },
        { label: '주휴수당', amount: 198144, basis: '4주 × 4.8시간 × 10,320원' },
      ]}
      deductions={[
        { code: 'nationalPension', amount: 56470 },
        { code: 'healthInsurance', amount: 42730 },
        { code: 'longTermCare', amount: 5610 },
        { code: 'employmentInsurance', amount: 10690 },
      ]}
    />
  );
}
```
