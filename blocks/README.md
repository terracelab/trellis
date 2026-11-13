# 화면 블록

블록은 복사해서 소유하는 화면 소스다. 근거는 D-51이다. `blocks/src/<묶음>/<모듈>/<화면>/`에 `block.json` · `index.tsx` · `style.css`가 있고, 서비스는 `pnpm ds:add <블록 id>`로 복사한다. 플랫폼 모양은 `docs/spec/platform.md`에 있고, 검사는 `node blocks/scripts/check-blocks.mjs`가 한다.

## slot 표시

`block.json`의 `slots`는 서비스가 고쳐도 되는 자리다. 코드에서 그 자리의 시작과 끝을 주석으로 표시한다.

```tsx
// slot: siblings — 제목 줄 탭. 라벨은 그 화면의 PageHeader title과 같게 쓴다
const SIBLINGS: readonly SiblingScreen[] = [
  { id: 'erp/hr-payroll/employees', label: '인사 기록' },
  { id: 'erp/hr-payroll/hr-master', label: '인사 마스터' },
];
// slot: siblings end
```

- 시작 줄은 `slot: <이름>`으로 쓰고 뒤에 무엇을 바꾸는 자리인지 한 줄을 붙인다. 끝 줄은 `slot: <이름> end`다.
- JSX 안에서는 `{/* slot: filters */}`, JSX 속성 사이에서는 `// slot: columns`로 쓴다.
- 이름은 `block.json` slots와 같게 쓴다. 표시 밖의 배치 · 위계 · 컴포넌트 선택은 되도록 그대로 둔다.
- 바꿀 값은 블록 맨 위 상수로 모은다. SIBLINGS · SECTIONS · STATE_FILTERS · ROLES처럼 상수 하나를 바꾸면 화면이 따라온다.
- `check-blocks`는 표시가 없는 slot을 경고로 알린다. 목록은 `--slots`로 본다.

## 화면 값과 이동

- 주소 값은 `useScreenParams()`로 읽는다. `?id=` · `?tab=` · 경로 값이 여기에 온다. 블록은 `window.location`을 읽지 않고, 검사가 이것을 막는다.
- 해시 라우터를 쓰는 데모는 PlatformProvider가 해시에서 읽는다. 브라우저 라우터를 쓰는 서비스는 앱이 `ScreenParamsProvider`나 `PlatformProvider params`로 넘긴다.
- 다른 화면으로 가는 링크와 단추는 `useScreens()`의 `has` · `href` · `go`로 만든다. 앱에 없는 화면이면 그리지 않는다.
- 알림 `link`는 블록 id다. 값이 있으면 `'groupware/approval/document?id=AP-2611-014'`처럼 붙인다. `useOpenLink()(n.link)`가 누르는 함수를 돌려준다.

## 데이터 범위

사람 목록은 `useScope().canSee({ name, department, userId })`로 거른다. 구성원 · 인사기록카드 · 조직도 링크 · 팀 근태 · 홈 보기가 여기에 든다. 전사는 모두, 본부와 부서는 같은 본부 · 부서, 본인은 자기만 본다. 범위 밖 사람으로 가는 링크는 그리지 않는다. 서버가 같은 판정을 다시 한다.

## 검사가 막는 것

| 하지 않는다 | 대신 |
|---|---|
| 표 칸 두 줄을 `tl-block-cell-2`로 | 표 칸은 `DataGridLines`, 목록 · 카드 줄은 `_ui`의 `Lines`, 사람은 `PersonLabel` |
| 블록 CSS로 `.tl-<컴포넌트>__<파트>`나 표 안 `table` · `td`를 덮기 | props와 variant. prop이 없으면 규칙 바로 위 주석에 `inner-override:`와 이유를 적고 보강 요청을 낸다 |
| `window.location.hash`에서 id 읽기 | `useScreenParams()` |
| 샘플 회사 · 사람 · 창고 이름을 코드에 | `_data`의 profile.ts 같은 파일에서 읽는다 |
| 카드 · 행 왼쪽에 굵은 색 띠 | 상태는 점 · 아이콘 · 배지 · 글자, 선택은 바탕 한 단계 |

반려 · 회수 · 반품 사유는 Dialog와 Textarea로 짜지 않고 `ReasonDialog`를 쓴다. 검사가 막지는 않으니 리뷰에서 본다.
