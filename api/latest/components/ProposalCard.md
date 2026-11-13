# ProposalCard

> `@terracelab/trellis-react` · CSS `.tl-proposal-card` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ProposalCard } from '@terracelab/trellis-react';
```

## 용도

에이전트가 제안한 데이터 변경(단가 · 지급 예정일 · 거래처 계좌)을 사람이 확인하고 승인 · 반려할 때 쓴다. 바뀌는 필드를 ChangeDiff로 보이고, 반려는 ReasonDialog에서 사유를 받는다. 전자결재 문서의 승인 · 반려는 ApprovalFlow(ApprovalLine + Badge approval), 변경 이력 보기만 할 때는 ChangeDiff.

## 해부(Anatomy)

root(`article`, `tl-proposal-card`, `bg.surface` · `border.divider` 1px · `radius.lg`, 안쪽 `density.card-padding`, `data-status`) · head(title `type.h3` `fg.strong` + status Badge: 확인 대기 warning · 승인 success · 반려 danger) · summary(근거 · 영향 한두 문장, `fg.secondary`) · changes(ChangeDiff table) · extra(children: 출처 · 실행 단계) · footer(위 `border.divider` 1px: 확인 대기면 error + actions[반려 Button · 승인 primary Button], 처리 뒤면 result[아이콘 · 결과 글 600 · 처리한 사람 · 시각 `type.caption` `fg.secondary` · 반려 사유]) · ReasonDialog(반려 사유).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | `string` |  | 필수 | 무엇을 바꾸는지(명사구) |
| `summary` | `string` |  |  | 근거 · 영향 한두 문장 |
| `changes` | `ChangeDiffRow[]` |  | 필수 | 바뀌는 필드(diffFields) |
| `status` | `'waiting' \| 'approved' \| 'rejected'` |  |  | 처리 상태(제어) |
| `defaultStatus` | `'waiting' \| 'approved' \| 'rejected'` | `"waiting"` |  | 처음 상태(비제어) |
| `onApprove` | `() => void \| Promise<unknown>` |  |  | 승인 |
| `onReject` | `(reason: string) => void \| Promise<unknown>` |  |  | 반려(사유 필수) |
| `reason` | `string` |  |  | 반려 사유(처리 뒤) |
| `resolvedBy` | `string` |  |  | 처리한 사람 · 시각 |
| `reasonMinLength` | `number` | `1` |  | 반려 사유 최소 글자 수 |
| `approveLabel` | `string` |  |  | 승인 단추 글자(기본 승인) |
| `rejectLabel` | `string` |  |  | 반려 단추 글자(기본 반려) |
| `loading` | `boolean` | `false` |  | 진행 중 |
| `disabled` | `boolean` | `false` |  | 처리할 수 없음(권한 없음) |
| `error` | `string` |  |  | 오류 문구 |
| `headingLevel` | `2 \| 3 \| 4` |  |  | 제목 단계(없으면 문맥) |
| `children` | `ReactNode` |  |  | 변경 표 아래 자리(출처 · 실행 단계) |

## Variants

status 3개. 색은 상태 Badge와 결과 아이콘에만 쓴다.

| status | 배지 | 아래 줄 |
|---|---|---|
| waiting(기본) | 확인 대기 · warning | [반려] [승인] |
| approved | 승인 · success | circle-check(`status.success.default`) + "승인했습니다" + 처리한 사람 · 시각 |
| rejected | 반려 · danger | circle-x(`status.danger.default`) + "반려했습니다" + 처리한 사람 · 시각 + 반려 사유 |

## States

지원 상태: `default` · `disabled` · `loading` · `error`

default · disabled(`disabled`: 두 단추 꺼짐, `data-state="disabled"`) · loading(`loading` 또는 승인 Promise 진행 중: 승인 단추 처리 중 · 반려 꺼짐, `aria-busy` · `data-state="loading"`) · error(`error` 또는 승인 실패: 단추 위 `status.danger.default` 글자 + `role="alert"`, `data-state="error"`). hover · active · focus는 안의 단추가 가진다.

## 동작

- 승인: 누르면 `onApprove()`. Promise면 끝날 때까지 진행 중이고, 성공하면 approved, 실패하면 확인 대기로 남고 "처리하지 못했습니다. 다시 시도하세요"(`error`가 있으면 그 글).
- 반려: 누르면 ReasonDialog("제안을 반려합니다", 설명 = 제목, 사유 칸 "반려 사유", 확인 단추 = 반려 글자, danger)가 열린다. 사유가 `reasonMinLength`(기본 1, 앞뒤 공백 제외)보다 짧으면 확인이 꺼지고, 바깥 누름으로 닫히지 않는다(ApprovalFlow 규칙). 확인하면 `onReject(사유)`. Promise면 사유 창이 진행 중이고, 실패하면 사유 창이 열린 채 오류 문구를 보인다.
- 처리 뒤: 단추 대신 결과 줄이 남는다. 반려 사유는 `reason`, 없으면 사유 창에서 받은 글자. 이 카드에서 처리한 직후에만 포커스를 결과 줄로 옮긴다(단추가 사라지므로). 바깥이 status를 바꾸면 포커스를 옮기지 않는다.
- 제어 · 비제어: `status`를 주면 앱이 상태를 들고(처리 뒤 앱이 바꾼다), 없으면 `defaultStatus`에서 시작해 카드가 바꾼다.
- 단추 글자: 승인 단추는 결과를 말하는 말로 바꿀 수 있다(변경 적용 · 등록). "확인"은 쓰지 않는다.

| 키 | 동작 |
| --- | --- |
| Tab | 출처 · 반려 · 승인 차례로 |
| Enter · Space | 승인 · 반려(사유 창 열기) |
| Ctrl+Enter | 사유 창에서 반려 확인 |
| Escape | 사유 창이 비었을 때만 닫기 |

## 접근성

root는 `article` + 제목 이름(`aria-labelledby`)이다. 제목 단계는 Card와 같은 문맥(화면 바로 아래 h2, 카드 안 h3)이고 `headingLevel`로 바꾼다. 상태는 배지 글자 · 결과 글로 읽히고 색만으로 말하지 않는다. 처리 직후 결과 줄(`tabindex="-1"`)로 포커스가 옮겨 가 결과를 읽는다. 오류는 `role="alert"`. 변경 표는 ChangeDiff의 접근성(숨은 "에서" · "없음")을 따른다. 포커스 링은 항상 보인다.

## 밀도

안쪽 여백 `density.card-padding`(compact 16 · comfortable 20 · touch 16), 아래 줄 위아래 `space.12`, 블록 사이 `space.12`. 단추 높이는 Button md.

## 플랫폼 차이

네이티브는 같은 카드를 View로 그리고 반려 사유는 ReasonDialog의 네이티브 모양(아래 시트)이다. 휴대폰 폭에서 두 단추가 폭을 나눠 쓴다. props는 같다.

## 금지 사항

반려를 사유 없이 처리 · 승인을 사람 확인 없이 자동으로 · 결재 5어휘 배지(Badge approval)로 상태 표시(전자결재 전용) · 카드 왼쪽 상태 띠(D-57) · 확인 단추를 "확인"으로. 리뷰로 막는다.

## 예시

### 확인 대기

에이전트가 바꾸려는 필드를 변경 표로 보이고, 사람이 승인하거나 사유를 적어 반려한다

```tsx
import { ProposalCard } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const PRICE = [
  { target: '냉동 가리비 관자 1KG', field: '단가', before: '17,000', after: '16,800' },
  { target: '냉동 새우 1KG', field: '단가', before: '12,400', after: '12,900' },
  { target: '냉동 새우 1KG', field: '적용 시작일', before: null, after: '2026-12-01' },
];

function Waiting() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="한빛식품 단가 변경"
        summary="11월 견적서 기준으로 2품목 단가를 바꿉니다. 12월 발주부터 적용됩니다."
        changes={PRICE}
        onApprove={() => {}}
        onReject={() => {}}
      />
    </div>
  );
}
```

### 승인

처리하면 단추 대신 결과와 처리한 사람 · 시각이 남는다

```tsx
import { ProposalCard } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

const PRICE = [
  { target: '냉동 가리비 관자 1KG', field: '단가', before: '17,000', after: '16,800' },
  { target: '냉동 새우 1KG', field: '단가', before: '12,400', after: '12,900' },
  { target: '냉동 새우 1KG', field: '적용 시작일', before: null, after: '2026-12-01' },
];

function Approved() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="한빛식품 단가 변경"
        changes={PRICE}
        defaultStatus="approved"
        resolvedBy="김테라 팀장 · 2026-11-06 14:20"
      />
    </div>
  );
}
```

### 반려

사유 창에서 받은 반려 사유가 결과 아래에 보인다

```tsx
import { ProposalCard } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

function Rejected() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="대성물류 지급 예정일 변경"
        changes={[{ field: '지급 예정일', before: '2026-11-20', after: '2026-11-13' }]}
        defaultStatus="rejected"
        reason="계약서 지급 조건이 월말 지급입니다. 앞당기지 않습니다."
        resolvedBy="박회계 대리 · 2026-11-06 15:02"
      />
    </div>
  );
}
```

### 근거와 함께

변경 표 아래 자리에 출처를 둔다. 승인 단추 글자는 결과를 말하는 말로 바꿀 수 있다

```tsx
import { Citation, ProposalCard } from '@terracelab/trellis-react';

const BOX = { maxWidth: 'calc(var(--tl-space-64) * 10)' };

function WithSources() {
  return (
    <div style={BOX}>
      <ProposalCard
        title="동해수산 거래처 계좌 변경"
        summary="거래처가 보낸 계좌 변경 요청 공문과 통장 사본의 계좌가 같습니다."
        changes={[
          { field: '은행', before: '가람은행', after: '테라은행' },
          { field: '계좌번호', before: '123-45-●●●●●', after: '987-65-●●●●●' },
        ]}
        approveLabel="변경 적용"
        reasonMinLength={5}
        onApprove={() => new Promise((resolve) => setTimeout(resolve, 800))}
        onReject={() => {}}
      >
        <Citation
          label="근거 문서"
          sources={[
            { title: '계좌 변경 요청 공문', location: '1쪽' },
            { title: '통장 사본.pdf', location: '1쪽' },
          ]}
          onOpen={() => {}}
        />
      </ProposalCard>
    </div>
  );
}
```
