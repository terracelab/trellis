# ProfileHeader

> `@terracelab/trellis-react` · CSS `.tl-profile-header` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ProfileHeader } from '@terracelab/trellis-react';
```

## 용도

구성원 상세 화면 · 서랍 맨 위에서 한 사람을 소개할 때 쓴다. 큰 아바타 · 굵은 이름 · 재직 상태 · 소속 줄 · 사번 · 입사일 · 근속 · 고용 형태 요약과 오른쪽 행동(정보 수정 · 발령 · 증명서 발급)을 한 줄에 둔다. 목록 칸은 PersonLabel.

## 해부(Anatomy)

avatar(64, 휴대폰 48) · name(제목 `type.h1` 700) · alt(한자 · 영문 `fg.tertiary`) · status(Badge sm) · presence(StatusDot sm) · meta(소속 · 직책 · 직위 · 직급 `fg.secondary`) · facts(`<dl>` 라벨 회색 · 값 500, 항목 사이 세로 구분선. 좁아서 줄이 바뀌면 줄 첫 항목은 구분선 없이 왼쪽 끝에서 시작한다) · actions.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `name` | `string` |  | 필수 | 성명 |
| `nameEn` | `string` |  |  | 영문 이름 |
| `nameHanja` | `string` |  |  | 한자 이름 |
| `src` | `string` |  |  | 사진 주소 |
| `department` | `string` |  |  | 소속 |
| `role` | `string` |  |  | 직책 |
| `position` | `string` |  |  | 직위 |
| `grade` | `string` |  |  | 직급(직위와 같으면 생략) |
| `status` | `'active' \| 'leave' \| 'leaving' \| 'resigned'` |  |  | 재직 상태(Badge) |
| `presence` | `'working' \| 'remote' \| 'fieldwork' \| 'leave' \| 'off'` |  |  | 오늘 근무 상태 |
| `employeeNo` | `string` |  |  | 사번 |
| `hireDate` | `string` |  |  | 입사일(근속 계산) |
| `employmentType` | `'regular' \| 'contract' \| 'intern' \| 'dispatch' \| 'daily' \| 'freelance'` |  |  | 고용 형태 |
| `today` | `string` |  |  | 근속 기준일(기본 오늘) |
| `facts` | `{ label: string; value: ReactNode }[]` |  |  | 더 붙일 요약 항목 |
| `actions` | `ReactNode` |  |  | 오른쪽 행동 |
| `headingLevel` | `1 \| 2 \| 3` | `2` |  | 이름 제목 단계 |

## Variants

status 재직 · 휴직 · 퇴사 예정 · 퇴사(Badge 톤 `EMPLOYMENT_STATUS_TONES`). facts로 항목을 더 붙인다(복직 예정일 · 계약 종료일).

## States

지원 상태: `default`

default.

## 동작

근속은 hireDate부터 today(기본 오늘)까지 만 년 · 개월(`serviceLength`): 3년 11개월 · 3년 · 5개월. 직급이 직위와 같으면 한 번만 보인다. 휴대폰(640 미만)은 행동이 아래 줄로 내려간다.

## 접근성

이름은 제목(headingLevel, 기본 h2. 화면 맨 위면 1). 아바타는 꾸밈. 요약은 `<dl>` 라벨 · 값 짝.

## 밀도

아바타와 본문 사이 `space.20`, 요약 줄 위 `space.12`. 밀도와 관계없이 같은 크기.

## 플랫폼 차이

네이티브는 행동을 아래 줄에 둔다.

## 금지 사항

상태마다 색 배너 · 이름 왼쪽 색 띠 · 요약 숫자를 알약으로 감싸기(D-56 · D-57) → 리뷰.

## 예시

### 구성원 상세

이름 · 재직 상태 · 오늘 근무, 소속 줄, 사번 · 입사일 · 근속 · 고용 형태

```tsx
import { Button, ProfileHeader } from '@terracelab/trellis-react';

function Member() {
  return (
    <ProfileHeader
      name="한서연"
      nameEn="Seoyeon Han"
      department="인사팀"
      role="파트장"
      position="매니저"
      grade="G4"
      status="active"
      presence="working"
      employeeNo="E-0012"
      hireDate="2022-03-02"
      employmentType="regular"
      today="2026-11-06"
      actions={
        <>
          <Button icon="pencil">정보 수정</Button>
          <Button variant="primary" icon="file-text">
            증명서 발급
          </Button>
        </>
      }
    />
  );
}
```

### 휴직 중 계약직

상태는 Badge 하나, 더 붙일 요약은 facts

```tsx
import { ProfileHeader } from '@terracelab/trellis-react';

function OnLeave() {
  return (
    <ProfileHeader
      name="오하늘"
      nameHanja="吳하늘"
      department="플랫폼팀"
      position="선임"
      status="leave"
      employeeNo="E-0047"
      hireDate="2024-01-08"
      employmentType="contract"
      today="2026-11-06"
      facts={[{ label: '복직 예정일', value: '2027-02-01' }]}
    />
  );
}
```
