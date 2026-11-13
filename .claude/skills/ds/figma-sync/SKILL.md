---
name: figma-sync
description: Trellis Figma 파일(Trellis · Foundations · Trellis · Components · Trellis · Screens)을 코드에서 다시 맞춘다. variables.json → Foundations 변수 6컬렉션(Company 포함) upsert, 해시 · 스냅샷 검증(scripts/figma-diff.mjs), Foundations 라이브러리 변수로 컴포넌트 세트 만들기(키트 v2), 지역 사본을 라이브러리로 다시 묶기, 세트 인스턴스로 화면 조립 · 모드별 복제, 감사(scripts/figma-audit.mjs). "피그마 동기화", "토큰 바뀐 것 피그마에 반영", "컴포넌트 피그마 다시 만들어", "화면 피그마로", "figma sync" 요청에 쓴다.
---

# figma-sync

코드가 원본이고 Figma는 생성물이다(docs/spec/pipeline.md §7). 이 스킬은 2026-11-10에 세 파일을 만들고 이어 붙인 절차를 그대로 다시 돌린다. 파일 주소 · 페이지 구조 · 검증 결과는 `docs/figma/README.md`, 라이브러리 key는 `docs/figma/keys.json`에 있다.

주인은 D-110대로 나뉜다. Foundations가 변수 · 글자 스타일 · 그림자 스타일의 주인이고 Components가 세트 · 아이콘 · 모듈 타일의 주인이다. Screens는 두 라이브러리를 쓰기만 한다. Components는 2026-11-10 PG-02에서 Foundations 라이브러리에 연결했고 지역 변수 · 스타일이 없다. Screens는 PG-03 전까지 사본을 가진다.

| 파일 | key | 하는 일 |
| --- | --- | --- |
| Trellis · Foundations | `k1mrv5tz9JpPUIt72dXHSj` | 변수 483 · 글자 스타일 12 · 그림자 스타일 3 게시 |
| Trellis · Components | `wm3bZ3mscnjwjmim1I8LeL` | 세트 167 · 낱개 컴포넌트 234(아이콘 173 · 타일 36 포함) 게시 |
| Trellis · Screens | `QNmIYwV6G64VXwampA4b9e` | 화면. PG-03에서 두 라이브러리에 연결 |

2026-11-07 파일 `uNZmEBsbRnkivkF79zdd2L`은 As-is 캡처 파일이다. 이 스킬로 고치지 않는다. 라이브러리 게시는 사람이 한다. 에이전트는 작업 끝 메시지에 "게시 필요"를 적는다.

## 0. 시작

1. 스킬 `figma:figma-use`와 `figma:figma-generate-library`를 읽는다. `use_figma`를 부를 때마다 `skillNames: "figma-use,figma-generate-library"`를 넣는다.
2. Figma 도구는 지연 로드다. `ToolSearch`로 한 번에 불러온다: `select:mcp__claude_ai_Figma__use_figma,mcp__claude_ai_Figma__create_session,mcp__claude_ai_Figma__get_screenshot,mcp__claude_ai_Figma__whoami,mcp__claude_ai_Figma__upload_assets`.
3. `create_session`(fileKey = Components 또는 Foundations)으로 세션 id를 받아 모든 호출에 넣는다. 여러 파일을 같은 세션으로 다뤄도 된다. `figma.teamLibrary`는 이 실행 환경에 없고 `get_libraries`는 Pro 팀 라이브러리를 보여 주지 않는다. 라이브러리 변수 · 스타일 · 세트는 `docs/figma/keys.json`의 key로 가져온다.
4. 상태 파일을 스크래치패드에 둔다(파일 key · 세트 id · 진행 단계). 호출 제한에 걸리면 `whoami`를 부르고 기다렸다가 상태 파일에서 이어 간다.
5. `use_figma` 하나의 코드는 50,000자 이하다. 한 호출에서 페이지 전환(`setCurrentPageAsync`)은 한 번만 한다. 다른 페이지로 노드를 옮길 때는 `await page.loadAsync()` 뒤 `page.appendChild(node)`를 쓴다(전환 없이 된다).

## 1. 변수 동기화(Foundations만)

변수는 Foundations에만 있다. Components는 Foundations 라이브러리 변수에 묶여 있고 Screens는 PG-03에서 같이 묶는다. 토큰이 바뀌면 Foundations만 고치고 사람이 다시 게시한다. Components · Screens에서는 라이브러리 갱신을 받으면 된다. 변수 이름이 새로 생기거나 지워지면 3절의 key 목록(`keys.json`과 파일 안 key 목록)도 다시 만든다.

```bash
pnpm --filter @terracelab/trellis-tokens build          # dist/figma/variables.json
node scripts/figma-diff.mjs --emit upsert > /tmp/trellis-upsert.js
node scripts/figma-diff.mjs --hash                      # 기대 해시 · 길이
```

- `/tmp/trellis-upsert.js` 내용을 그대로 Foundations에 `use_figma` code로 보낸다(약 29KB). 컬렉션 · 모드 · 변수를 이름으로 찾아 고치고 기준에 없는 변수 · 모드는 지운다(`--no-prune`이면 남긴다). 스코프와 WEB 코드 구문 `var(--tl-…)`도 맞춘다. 이름으로 고치므로 변수 key가 바뀌지 않아 연결된 파일의 바인딩이 그대로 이어진다. 변수를 지우면 그 변수를 쓰는 연결 파일의 바인딩이 끊기므로 지우기 전에 Components 감사(4절 links)로 쓰는 곳을 확인한다.
- Semantic의 회사 색 21개는 `Company/<light|dark|hcLight|hcDark>/<같은 이름>` 별칭이다. Company 컬렉션 모드는 회사 색 프리셋 8개다(Pro 요금제는 컬렉션당 모드 10개까지).
- 스코프: Primitives 색 · Company는 빈 스코프(선택 목록에서 숨김), Semantic bg는 FRAME_FILL · SHAPE_FILL, fg는 TEXT_FILL · SHAPE_FILL · STROKE_COLOR, border는 STROKE_COLOR 등(스크립트의 `scopesFor`).

### 검증

1. `node scripts/figma-diff.mjs --emit readback` 출력의 `const FULL = true`를 `false`로 바꿔 `use_figma`로 돌린다. 돌려받은 `hash` · `length`가 `--hash` 값과 같으면 차이가 없다. `audit.allScopes`와 `audit.codeSyntaxMismatch`는 0이어야 한다.
2. 해시가 다르면 `FULL = true`로 다시 돌려 `snapshot` 글을 파일로 저장하고 비교한다.

```bash
node scripts/figma-diff.mjs /tmp/figma-snapshot.txt   # 추가 · 삭제 · 값 · 모드 · 별칭 차이, 다르면 exit 1
node scripts/figma-diff.mjs --help
```

스냅샷 형식은 `#<컬렉션>|<모드…>` 머리줄과 `<이름>|<C|F|S>|<값…>` 줄이다. `^x` = `Primitives/color/x`, `^^x` = `Primitives/x`, `~` = Company 같은 이름 별칭이다.

## 2. 글자 · 효과 스타일(Foundations만)

스타일도 Foundations에만 있다. 이름으로 고치면 key가 유지되어 연결된 파일이 그대로 따라온다. 글자 스타일 12개(variables.json `textStyles`)는 Pretendard 정적 글꼴(400 Regular · 500 Medium · 600 SemiBold · 700 Bold)로 만들고(mono는 Roboto Mono Regular, PG-05 확인 대기) `fontSize` · `lineHeight` · `fontWeight`를 `type/<name>/…` 변수에 묶는다. 효과 스타일 `shadow/sm · md · lg`는 `packages/tokens/src/primitive/shadow.json` 값이다. 이름으로 찾아 고친다.

```js
const TSD=[['display',28,34,600,-1],['h1',24,31,600,-1],['h2',18,24,600,-1],['h3',16,21,600,0],['h4',15,20,600,0],['body',14,21,400,0],['label',13,20,500,0],['caption',12,18,400,0],['micro',11,16,400,0],['mono',12,16,400,0],['amount',16,24,600,0],['amountLg',20,24,600,0]];
// 값은 variables.json textStyles에서 다시 읽어 바꾼다. 굵기 → 'Regular'|'Medium'|'SemiBold'|'Bold'
for (const [name,size,lh,w,ls] of TSD) { /* createTextStyle 또는 이름으로 찾기 → fontName · fontSize · lineHeight(PIXELS) · letterSpacing(PERCENT) → setBoundVariable 3개 */ }
```

## 3. 컴포넌트 다시 만들기

바뀐 contract · CSS를 찾는다.

```bash
git log -1 --format=%H -- docs/figma/README.md          # 마지막 동기화 커밋
git diff --name-only <그 커밋> -- packages/contracts/src packages/react/src
```

규칙(2026-11-10 결정, D-113 · D-129):

- 컴포넌트마다 한 페이지, 세트 이름 = contract 이름. 페이지에 `Docs · <Name>` · `Labels · <Name>` · 세트를 둔다. P0 · Layout 묶음 페이지에는 `Usage · <Name>`도 둔다(아래 "Usage 프레임").
- 변형 축 = contract에서 `values`가 있는 props 가운데 모양을 바꾸는 것(값 그대로) + `state`(contract `states`). 기본값이 없어 "없음"이 다른 색인 Badge.approval · Avatar.status만 `none` 값을 더한다. 다른 선택 값이 없는 경우는 그 부분을 숨기는 BOOLEAN 속성으로 나타낸다.
- D-113: (1) CSS에서 모양을 바꾸지 않는 prop은 축에 두지 않는다(`headingLevel` · `initialFocus`). 축을 뺄 때는 기본값 변형을 남긴다(Card는 문맥 기본 2). (2) 값이 하나뿐인 `state` 축은 두지 않는다. (3) 항목 수가 바뀌는 세트는 항목 부품(`<Name> / <부품>`)과 최대 개수까지의 숨긴 칸으로 만든다. 더한 칸은 부품 인스턴스이고 `isExposedInstance = true`이며 BOOLEAN `show <칸>`(기본 false)으로 켠다. 기존 칸과 그 TEXT · BOOLEAN 속성은 그대로 두어 화면의 덮어쓰기가 이어진다. Tabs 8 · RadioGroup 6 · SelectableCard 6 · Payslip 지급 9 · 공제 8 · OrgChart 팀 6(`divisions` · `flat teams`)이다.
- D-129: (1) `values`가 없고 상태가 하나인 것은 세트가 아니라 낱개 컴포넌트다(Legend · Sparkline · PageHeader · Payslip / Row · OrgChart / Node). (2) 모양을 바꾸는 불리언 prop은 축으로 둔다(ActionBar `sticky` · SideNav `collapsed` · ComboChart `stacked` · Timeline `dense`). (3) 데이터에서 나오는 모양도 축이다(HeatCell `level` · BulletBar `status` · DueBadge `due`). (4) 차트는 상태 색 3개(성공 · 주의 · 위험)도 쓴다. (5) Field의 컨트롤은 INSTANCE_SWAP이라 변형마다 다를 수 없다. 오류 · 비활성은 드러낸 컨트롤에 덮어쓴다.
- 변형 수 = 축 값 개수의 곱. 감사 스크립트(`--emit sets`)가 이것을 확인하고 `singleStateAxis` · `nonVisualAxis`가 비어야 한다.
- 상태와 겹치지 않는 켜고 끄기(checked · indeterminate · unread · count · description …)는 BOOLEAN, 라벨은 TEXT, 아이콘은 `icon/<name>` INSTANCE_SWAP. 같은 TEXT 속성에 묶은 글자는 모든 변형에서 같은 기본값이 되므로 변형마다 글자가 다르면 묶지 않는다.
- 모든 칠 · 선은 Semantic 변수, 여백 · 간격은 `space/*` · `density/*`, 반경은 `radius/*`, 높이는 `density/control/height/*` 등에 묶는다. Primitives 색을 직접 쓰지 않는다.
- 포커스는 바깥 링(키트의 `ring`), 가리킴 · 누름 · 비활성 · 오류는 CSS의 토큰을 그대로 옮긴다. 시각 기준은 `packages/react/src/<Name>/<Name>.css`와 `packages/contracts/src/<Name>/spec.md`의 해부.
- 아이콘 자리를 INSTANCE_SWAP 속성에 묶으면 모든 변형의 그 자리가 속성 기본값 컴포넌트로 바뀐다. 변형마다 다른 모양(오류 · 비활성 색 등)은 아이콘을 바꾸지 말고 인스턴스 안 칠을 변수로 덮어 쓴다.
- 페이지 순서: Cover · Icons · Module tiles 뒤에 묶음 구분 페이지 `--- P0` · `--- PR-08` · `--- PR-30` · `--- HR` · `--- Layout` · `--- Inputs` · `--- Feedback` · `--- Navigation · Record · Paper` · `--- Charts` · `--- Conversation` · `--- Basics` · `--- Dashboard · Operations`를 두고 그 아래에 컴포넌트 페이지를 놓는다. 새 아이콘은 Icons 페이지 `Grid`의 칸(`cell <name>`)으로 `ICON_NAMES` 순서 자리에 넣는다. 다른 페이지에 임시로 두지 않는다. 새 세트는 맞는 묶음에 넣고 Cover의 묶음 카드(`groups` 안 `group <묶음>`)에 줄을 더한다. 카드 줄은 세트 이름과 `변형 N`, 낱개 컴포넌트는 `컴포넌트`다.
- 세트를 만들거나 고친 뒤 사람이 Components를 다시 게시해야 Screens에 보인다. 작업 끝 메시지에 "게시 필요"를 쓴다.
- 안쪽 부품은 같은 파일 세트의 인스턴스로 만든다. 세트를 지우고 다시 만들면 그 인스턴스가 끊기므로 아래 의존 목록의 세트도 같이 다시 만든다.

| 다시 만드는 세트 | 같이 다시 만들 세트 |
| --- | --- |
| Button | Dialog · Drawer · MonthCalendar · MessageThread · Composer · Popover · AddressInput · AmountBreakdown · ChangeDiff · IssueList · ReasonDialog · HrRecord · TimeClock · LeaveBalance · ProfileHeader · SectionHeader · NotificationList · AgentReplay · PersonLabel / Vacant |
| IconButton | Dialog · Drawer · AppShell · MonthCalendar · KanbanBoard · Composer · Popover · MaskedValue · DeadlineStrip |
| Badge | NotificationCard · KanbanBoard · ProfileHeader · NotificationItem |
| Avatar | AppShell · AppShell / Phone · KanbanBoard · MessageThread · PersonLabel · OrgChart · TeamSchedule |
| SideNav / Item | AppShell |
| ModuleIcon | NotificationCard · NotificationItem |
| NotificationItem | NotificationList |
| Avatar / Vacant | PersonLabel / Vacant |
| DeadlineStrip / Point · DeadlineStrip / Row | DeadlineStrip |
| AgentReplay / Pointer | AgentReplay |
| Checkbox | Popover · CheckboxGroup |

축을 더할 때(2026-11-12 3차 동기화의 Card `emphasis` · MonthCalendar `size`)는 기존 변형 이름 끝에 `, 축=기본값`을 붙이고 기존 변형을 `clone()` 해 새 값의 변형을 만든다. 세트 · 변형 key가 그대로다. 그다음 격자 자리, `Labels · <Name>`의 행 글자, 세트 설명과 Docs의 변형 수 글, Cover 카드 줄을 고친다. 한 축의 값이 다른 축과 곱해질 때 같은 모양만 늘면(PersonLabel 공석 × presence 5) 축 대신 부품 세트 `<Name> / <부품>`으로 둔다. `clone()`한 변형은 세트 속성 참조(`componentPropertyReferences`)가 비어 있다. 원본 변형의 같은 경로 레이어에서 참조를 옮겨야 TEXT · BOOLEAN 속성이 새 변형에도 듣는다(2026-11-13 4차 동기화의 Banner `layout`).

세트를 지우고 다시 만드는 대신 그 자리에서 고칠 수 있으면(글자 스타일 · 크기 · 칸 추가) 고친다. 2026-11-10 2차 동기화의 Avatar · PersonLabel · Payslip이 그 예다. 안쪽 인스턴스와 화면 인스턴스가 그대로 이어진다.

### 세트를 그 자리에서 고치기(PG-12)

세트를 지우고 다시 만들면 세트 · 변형 key가 바뀌어 이 파일 안 인스턴스와 Screens 인스턴스가 끊긴다. PG-12는 세트 16개를 아래 방법으로 고쳤고 key가 모두 그대로다.

- 값이 하나뿐인 축 빼기: 변형마다 이름에서 `축=값`만 지운다(`c.name = 남은 축=값 목록`). 그 축 속성이 사라지고 인스턴스는 그대로 이어진다.
- 값이 여럿인 축 빼기: 남길 값의 변형만 두고 나머지 변형을 지운 뒤 이름에서 축을 지운다. 지우기 전에 지울 변형의 인스턴스(`getInstancesAsync()`)를 같은 나머지 축 값의 남길 변형으로 `swapComponent` 한다. 그다음 격자를 makeSet과 같은 셈으로 다시 놓고(원래 열 간격 유지) `Labels · <Name>`의 행 · 열 글자를 기존 글자 `clone()`으로 다시 만들고, 세트 설명 · Docs의 축 줄을 고친다.
- 칸 더하기: 기존 칸 프레임을 `clone()` 해 `figma.createComponentFromNode`로 부품 변형을 만든다. 복제본에 남은 옛 속성 참조는 `componentPropertyReferences = {}`로 비우고 새 속성에 묶는다. 세트 변형마다 부품 인스턴스를 숨겨 넣고 `show <칸>` 속성에 묶는다(D-113 (3)).
- 고치기 전과 뒤에 변형마다 `getInstancesAsync()`로 인스턴스 수와 본체 유무를 센다. 지운 변형 안에 있던 안쪽 인스턴스(예: ProfileHeader 안 Badge 240)는 페이지 밖에 남아 계속 잡히므로 캔버스 위 수는 부모를 따라 올라가 페이지가 있는 것만 따로 센다.
- 지운 변형을 Screens가 쓰고 있었다면 다시 게시한 뒤 그 인스턴스는 라이브러리에서 지워진 컴포넌트가 된다. 작업 끝 메시지에 지운 변형을 적어 Screens 쪽이 남긴 변형으로 바꾸게 한다.

### Usage 프레임(CP-5)

P0 · Layout 페이지에 `Usage · <Name>`을 세트 오른쪽에 둔다. 폭 1280이고 견본 · 화면 예가 넓으면 그만큼 넓힌다. 해부(번호 표시 견본 + 번호 목록) · 쓰는 곳 · 쓰지 않는 곳 · 키보드 · 화면 예(세트 인스턴스 조립) 순서다. 글은 `usage.mjs`가 spec.md(해부 첫 문장 · 용도 · 금지 사항 · 키 표)와 contract `a11y.keyboard`에서 뽑는다. 견본 변형 · 해부 이름과 레이어 이름의 대응 · 금지 조각 합치기는 `usage.mjs`의 CONFIG, 화면 예 조립은 `usage-frame.js`의 RECIPES에 있다.

```bash
node .claude/skills/ds/figma-sync/usage.mjs --data Button          # 뽑은 글 확인
node .claude/skills/ds/figma-sync/usage.mjs --emit Button Card     # 첫 호출: 키트 v2 + 생성기 + 글(약 37KB). 생성기 글을 문서 plugin data에 남긴다
node .claude/skills/ds/figma-sync/usage.mjs --run Input Select     # 다음 호출: 남긴 생성기로 짧게 돈다(5KB 안팎)
node .claude/skills/ds/figma-sync/usage.mjs --clear                # 끝나면 plugin data(trellis/usage)를 지운다
```

- 같은 이름의 Usage 프레임만 지우고 다시 만든다. 몇 번을 다시 돌려도 결과가 같다.
- 견본과 화면 예의 인스턴스는 줄이지 않는다. `rescale` · `scaleFactor`는 안쪽 글자 크기를 숫자로 바꿔 글자 스타일 · 변수 바인딩이 풀린다(links의 unboundText가 는다).
- 번호는 글자에 겹치지 않게 견본 밖에 둔다. 전체는 왼쪽 위, 맨 위 줄 부품은 견본 위, 아래 줄 부품은 오른쪽 같은 높이다. 레이어를 못 찾은 부품은 목록에만 번호가 있다.

### key 목록 넣기(파일마다 한 번)

키트 v2는 변수 · 스타일을 Foundations 라이브러리에서 key로 가져온다. key 483개를 호출마다 붙이지 않도록 파일 문서에 한 번 저장한다(`figma.root.setSharedPluginData('trellis','keys', …)`). Components에는 2026-11-10에 넣었다. 새 파일(Screens 등)이나 Foundations 변수 이름이 바뀐 뒤에는 아래 명령이 내는 스크립트를 그 파일에 `use_figma`로 돌린다(약 37KB).

```bash
node -e 'const k=require("./docs/figma/keys.json").Foundations; const m={collections:k.collections,variables:k.variables,textStyles:k.textStyles,effectStyles:k.effectStyles,counts:k.counts}; console.log("figma.root.setSharedPluginData(\"trellis\",\"keys\","+JSON.stringify(JSON.stringify(m))+");\nreturn JSON.parse(figma.root.getSharedPluginData(\"trellis\",\"keys\")).counts;")' > /tmp/trellis-keys-setter.js
```

돌려받은 `counts`가 변수 483 · 글자 스타일 12 · 효과 스타일 3이면 된다. `keys.json`은 `node scripts/figma-audit.mjs --emit keys`를 Foundations · Components에 돌려 다시 만들고 `node scripts/figma-audit.mjs --keys docs/figma/keys.json`으로 확인한다.

### 키트 v2

호출마다 맨 앞에 아래 키트를 붙이고 그 뒤에 `ICONS`(필요한 아이콘의 `icon/<name>` 노드 id) · 페이지 전환 · `makeSet` 호출을 쓴다. 빌더 API(`V` · `P` · `TS` · `ES` · `st` · `AL` · `TX` · `IC` · `ring` · `rect` · `ell` · `makeSet`)는 v1과 같다. 바뀐 점은 다음과 같다.

- 시작할 때 key 목록의 변수 483개와 스타일 15개를 `importVariableByKeyAsync` · `importStyleByKeyAsync`로 한꺼번에 가져온다(병렬, 약 4초). `V('color/bg/surface')`처럼 v1과 같은 이름(컬렉션 접두 없음, Company 제외)으로 찾는다.
- `P(c, op, node)`는 칠 색을 변수가 그 노드에서 풀리는 값으로 넣는다(node가 없으면 기본 모드 값). 인스턴스 안에 덮어 쓴 칠이 검정으로 남는 v1 함정을 막는다. `st` · `TX` · `IC` · `ring` · `makeSet`은 대상 노드를 넘긴다.
- 알파가 있는 변수(`bg/overlay` 등)에 새로 묶으면 칠 불투명도가 변수 알파로 바뀐다. `st`의 칠 · 선은 `setPaints`로 쓰고, 지정한 불투명도를 한 번 더 쓴다. 다만 변수 알파와 다른 칠 불투명도는 인스턴스 안에서 버려진다. 반투명은 칠을 그대로 두고 노드 `op`로 낸다(함정 "인스턴스 안에서는").
- 아이콘을 바꿔 끼운 뒤에는 선 색이 새 본체 색으로 돌아간다. `ICCOLOR(instance, color)`로 다시 칠한다.

`makeSet(name, axes, build, opt)`는 같은 이름의 세트 · Docs · Labels를 지우고(현재 페이지와 `opt.dest`) 변형을 만들어 격자로 놓고 설명 · 문서 링크 · 속성을 붙인다. 3차 동기화에서는 키트 글을 문서 plugin data(`trellis/ckit`)에 잠시 두고 `AsyncFunction`으로 불러 호출마다 붙이지 않았다(끝나면 지운다). 그때 더한 것: 부품 세트의 설명 · 문서 주소를 부모 컴포넌트로 적는 `opt.of` · `opt.cls`, 같은 페이지 아래쪽에 놓는 `opt.y`, 낱개 컴포넌트와 Docs를 만드는 `makeOne(name, comp, opt)`. 인스턴스의 `isExposedInstance`는 컴포넌트 안에 넣은 뒤에만 켤 수 있다. `opt.cols`는 열로 놓을 축, `opt.dest`는 옮길 페이지, `opt.props`는 `{name,type,def,layer,only?,pref?}` 목록이다. 2026-11-10에 Components Cover 페이지에서 임시 세트로 시험하고 지웠다. 바인딩과 글자 스타일이 모두 라이브러리였다. 아이콘 선 색은 풀린 값(흰색)이었고 덮어 쓴 불투명도 0.15가 남았다.

```js
// ===== Trellis component kit v2 (Foundations library) =====
const _K = JSON.parse(figma.root.getSharedPluginData('trellis', 'keys') || 'null');
if (!_K) throw new Error('key 목록 없음: figma-sync 3절 "key 목록 넣기"를 먼저 돌린다');
await Promise.all([['Pretendard','Regular'],['Pretendard','Medium'],['Pretendard','SemiBold'],['Pretendard','Bold'],['Roboto Mono','Regular'],['Inter','Regular']].map(([family,style])=>figma.loadFontAsync({family,style})));
const _VE = Object.entries(_K.variables); // 483개를 한 번에 가져온다(병렬, 약 4초)
const _VV = await Promise.all(_VE.map(([,k])=>figma.variables.importVariableByKeyAsync(k)));
const _BYID = new Map(_VV.map(v=>[v.id,v])), VM = new Map();
_VE.forEach(([n],i)=>{ if(!n.startsWith('Company/')) VM.set(n.slice(n.indexOf('/')+1),_VV[i]); }); // v1과 같은 이름(컬렉션 접두 없음)
const V=n=>{const v=VM.get(n); if(!v) throw new Error('var '+n); return v;};
const TS=Object.fromEntries(await Promise.all(Object.entries(_K.textStyles).map(async([n,k])=>[n,await figma.importStyleByKeyAsync(k)])));
const ES=Object.fromEntries(await Promise.all(Object.entries(_K.effectStyles).map(async([n,k])=>[n,await figma.importStyleByKeyAsync(k)])));
const WN={400:'Regular',500:'Medium',600:'SemiBold',700:'Bold'};
const STW={display:600,h1:600,h2:600,h3:600,h4:600,body:400,label:500,caption:400,micro:400,mono:400,amount:600,amountLg:600};
const RAD=['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'];
const sv=x=>V(typeof x==='string'&&x.includes('/')?x:'space/'+x);
// 칠의 색 = 변수가 그 노드에서 풀리는 색(node가 없으면 기본 모드). 검정으로 저장된 덮어쓰기 칠을 막는다
const _RES=v=>{ let x=v; for(let g=0;x&&g<8;g++){ const val=Object.values(x.valuesByMode)[0]; if(val&&val.type==='VARIABLE_ALIAS') x=_BYID.get(val.id); else return val; } return null; };
const P=(c,op,node)=>{ const v=V('color/'+c); let r=null; try{ r=node?v.resolveForConsumer(node).value:_RES(v); }catch(e){ r=_RES(v); }
  const p=figma.variables.setBoundVariableForPaint({type:'SOLID',color:r&&'r' in r?{r:r.r,g:r.g,b:r.b}:{r:0,g:0,b:0}},'color',v);
  return op==null?p:Object.assign({},p,{opacity:op}); };
// 알파가 있는 변수에 새로 묶으면 불투명도가 변수 알파로 바뀐다 → 지정한 불투명도를 한 번 더 쓴다
function setPaints(n,k,list){ n[k]=list; if(list.some(p=>p.opacity!=null&&p.opacity!==1)) n[k]=n[k].map((p,i)=>Object.assign({},p,{opacity:list[i].opacity==null?p.opacity:list[i].opacity})); }
function st(n,o){
  if(o.f!==undefined) setPaints(n,'fills',o.f?(Array.isArray(o.f)?o.f.map(x=>typeof x==='string'?P(x,null,n):x):[P(o.f,null,n)]):[]);
  if(o.s!==undefined){ setPaints(n,'strokes',o.s?[P(o.s,null,n)]:[]); if(o.s){ n.setBoundVariable('strokeWeight',V('border/width/'+(o.sw||1))); n.strokeAlign=o.sa||'INSIDE'; } }
  if(o.r) for(const k of RAD) n.setBoundVariable(k,V('radius/'+o.r));
  if(o.w!=null){ if(typeof o.w==='string') n.setBoundVariable('width',V(o.w)); else n.resize(o.w,n.height); }
  if(o.h!=null){ if(typeof o.h==='string') n.setBoundVariable('height',V(o.h)); else n.resize(n.width,o.h); }
  if(o.e) n.effectStyleId=ES[o.e].id;
  if(o.n) n.name=o.n;
  if(o.op!=null) n.opacity=o.op;
  if(o.vis===false) n.visible=false;
  return n;
}
function add(p,k){ if(!k) return; const [n,o]=Array.isArray(k)?k:[k,{}]; p.appendChild(n);
  if(o.abs){ n.layoutPositioning='ABSOLUTE'; n.x=o.abs[0]; n.y=o.abs[1]; if(o.cons) n.constraints=o.cons; }
  if(o.fx) n.layoutSizingHorizontal=o.fx; if(o.fy) n.layoutSizingVertical=o.fy; if(o.grow) n.layoutGrow=1; return n; }
function AL(dir,o={},kids=[]){
  const f=o.comp?figma.createComponent():figma.createFrame(); const V2=dir==='V';
  f.layoutMode=V2?'VERTICAL':'HORIZONTAL'; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='AUTO'; f.fills=[]; f.clipsContent=!!o.clip;
  if(o.g!=null) f.setBoundVariable('itemSpacing',sv(o.g));
  if(o.p!=null){ const a=Array.isArray(o.p)?(o.p.length===2?[o.p[0],o.p[1],o.p[0],o.p[1]]:o.p):[o.p,o.p,o.p,o.p];
    [['paddingTop',a[0]],['paddingRight',a[1]],['paddingBottom',a[2]],['paddingLeft',a[3]]].forEach(([k,x])=>{ if(x!=null&&x!==0) f.setBoundVariable(k,sv(x)); }); }
  f.counterAxisAlignItems=o.ai||'CENTER'; if(o.jc) f.primaryAxisAlignItems=o.jc;
  if(o.w!=null){ if(V2) f.counterAxisSizingMode='FIXED'; else f.primaryAxisSizingMode='FIXED'; }
  if(o.h!=null){ if(V2) f.primaryAxisSizingMode='FIXED'; else f.counterAxisSizingMode='FIXED'; }
  st(f,o); for(const k of kids) add(f,k); return f;
}
function TX(chars,o={}){ const t=figma.createText(); const s=o.s||'body', w=o.w||STW[s];
  if(w===STW[s]&&!o.fs&&!o.lh) t.textStyleId=TS[s].id;
  else { t.fontName={family:'Pretendard',style:WN[w]}; t.setBoundVariable('fontSize',V(o.fs||'type/'+s+'/fontSize')); t.setBoundVariable('lineHeight',V(o.lh||'type/'+s+'/lineHeight')); t.setBoundVariable('fontWeight',V('font/weight/'+w)); }
  t.characters=chars; t.fills=[P(o.c||'fg/primary',null,t)]; if(o.n) t.name=o.n; if(o.al) t.textAlignHorizontal=o.al; if(o.vis===false) t.visible=false;
  if(o.wd){ t.resize(o.wd,t.height); t.textAutoResize='HEIGHT'; } return t; }
const _IC={};
async function IC(name,size=16,color='fg/primary',n){ const id=ICONS[name]; if(!_IC[id]) _IC[id]=await figma.getNodeByIdAsync(id);
  const i=_IC[id].createInstance(); if(size!==24) i.rescale(size/24);
  for(const v of i.findAll(x=>'strokes' in x&&x.strokes.length)) v.strokes=[P(color,null,v)];
  i.name=n||'icon'; return i; }
// 아이콘을 바꿔 끼운 뒤(INSTANCE_SWAP · swapComponent) 선 색은 새 본체 색으로 돌아간다 → 바꾼 뒤 다시 칠한다
function ICCOLOR(i,color){ for(const v of i.findAll(x=>'strokes' in x&&x.strokes.length)) v.strokes=[P(color,null,v)]; }
const RING={xs:'md',sm:'lg',md:'lg',lg:'xl',xl:'xl',full:'full'};
function ring(f,r='md',off=4){ const x=figma.createRectangle(); x.name='focus ring'; x.fills=[];
  x.strokes=[P('border/focus',null,x)]; x.setBoundVariable('strokeWeight',V('border/width/2')); x.strokeAlign='INSIDE';
  for(const k of RAD) x.setBoundVariable(k,V('radius/'+RING[r]));
  f.appendChild(x); x.layoutPositioning='ABSOLUTE'; x.resize(f.width+off*2,f.height+off*2); x.x=-off; x.y=-off;
  x.constraints={horizontal:'STRETCH',vertical:'STRETCH'}; return x; }
function rect(o={}){ const r=figma.createRectangle(); r.resize(o.wn||8,o.hn||8); st(r,o); return r; }
function ell(o={}){ const r=figma.createEllipse(); r.resize(o.wn||8,o.hn||8); st(r,o); return r; }
const kebab=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
const combos=axes=>axes.reduce((acc,a)=>acc.flatMap(c=>a.values.map(v=>({...c,[a.name]:v}))),[{}]);
function own(root,name){ const out=[]; (function walk(n){ for(const c of n.children||[]){ if(c.name===name) out.push(c); if(c.type!=='INSTANCE'&&'children' in c) walk(c); } })(root); return out; }
async function makeSet(name,axes,build,opt={}){
  const page=figma.currentPage, dest=opt.dest||page; if(dest!==page) await dest.loadAsync();
  for(const pg of new Set([page,dest])) for(const n of pg.children.filter(n=>n.name===name||n.name==='Docs · '+name||n.name==='Labels · '+name)) n.remove();
  const list=combos(axes), comps=[];
  for(const p of list){ const c=await build(p); c.name=axes.map(a=>a.name+'='+p[a.name]).join(', '); comps.push(c); }
  const pos=new Map(comps.map((c,i)=>[c.id,list[i]]));
  const set=figma.combineAsVariants(comps,page); set.name=name;
  const col=opt.cols?axes.find(a=>a.name===opt.cols):axes[axes.length-1], rowAxes=axes.filter(a=>a!==col), rk=p=>rowAxes.map(a=>p[a.name]).join(' · ');
  const rows=[...new Set(list.map(rk))], GAP=opt.gap||24, PAD=32, colW=col.values.map(()=>0), rowH=rows.map(()=>0);
  for(const c of set.children){ const p=pos.get(c.id), ci=col.values.indexOf(p[col.name]), ri=rows.indexOf(rk(p)); colW[ci]=Math.max(colW[ci],c.width); rowH[ri]=Math.max(rowH[ri],c.height); }
  const cx=[],ry=[]; let a=PAD; for(const w of colW){ cx.push(a); a+=w+GAP; } a=PAD; for(const h of rowH){ ry.push(a); a+=h+GAP; }
  for(const c of set.children){ const p=pos.get(c.id); c.x=cx[col.values.indexOf(p[col.name])]; c.y=ry[rows.indexOf(rk(p))]; }
  set.resizeWithoutConstraints(cx[cx.length-1]+colW[colW.length-1]+PAD, ry[ry.length-1]+rowH[rowH.length-1]+PAD);
  set.fills=[P('bg/canvas',null,set)]; for(const k of RAD) set.setBoundVariable(k,V('radius/lg'));
  const url='https://trellis.terracelab.co.kr/docs/components/'+kebab(name)+'/';
  set.description=`Trellis ${name}. contract packages/contracts/src/${name}/${name}.contract.ts · 규격 packages/contracts/src/${name}/spec.md · 문서 ${url} · 웹 클래스 .tl-${kebab(name)}. 변형 = ${axes.map(x=>x.name+' '+x.values.length).join(' × ')} = ${list.length}. ${opt.note||''}`.trim();
  try{ set.documentationLinks=[{uri:url}]; }catch(e){}
  for(const pr of (opt.props||[])){
    const key=set.addComponentProperty(pr.name,pr.type,pr.def,pr.pref?{preferredValues:pr.pref}:undefined);
    for(const c of set.children) for(const n of own(c,pr.layer)){ if(pr.only&&!pr.only(pos.get(c.id))) continue;
      const refs=Object.assign({},n.componentPropertyReferences||{}); refs[pr.type==='TEXT'?'characters':pr.type==='BOOLEAN'?'visible':'mainComponent']=key; n.componentPropertyReferences=refs; }
  }
  const hd=AL('V',{g:8,n:'Docs · '+name,ai:'MIN'}); add(hd,TX(name,{s:'h1',c:'fg/strong'}));
  for(const l of (opt.doc||[])) add(hd,TX(l,{s:'body',c:'fg/secondary',wd:960}));
  add(hd,TX(`contract packages/contracts/src/${name}/${name}.contract.ts · ${url}`,{s:'caption',c:'fg/tertiary'}));
  const LW=opt.labelW||200; hd.x=0; hd.y=0;
  const lab=figma.createFrame(); lab.name='Labels · '+name; lab.fills=[]; lab.clipsContent=false;
  const top=hd.height+48; set.x=LW; set.y=top+28;
  col.values.forEach((v,i)=>{ const t=TX(col.name+'='+v,{s:'micro',c:'fg/tertiary'}); lab.appendChild(t); t.x=LW+cx[i]; t.y=top; });
  rows.forEach((r,i)=>{ const t=TX(r,{s:'micro',c:'fg/tertiary',wd:LW-16}); lab.appendChild(t); t.x=0; t.y=top+28+ry[i]+rowH[i]/2-8; });
  lab.resize(LW+set.width, set.y+set.height); lab.x=0; lab.y=0; dest.insertChild(0,lab); if(dest!==page){ dest.appendChild(hd); dest.appendChild(set); }
  return {set,pos,count:set.children.length};
}
// ===== end kit v2 =====
```

### 빌더 예(Button)

```js
const ICONS={plus:'3:991','chevron-down':'3:736','loader-circle':'3:904'}; // Components 파일의 icon/<name> id
const page=await figma.getNodeByIdAsync('2:20'); await figma.setCurrentPageAsync(page); // Button 페이지
const PX={xs:6,sm:8,md:12,lg:16,xl:20}, TXS={xs:'caption',sm:'caption',md:'label',lg:'body',xl:'body'};
const COL={primary:{default:['brand/default',null,'brand/onBrand'],hover:['brand/hover',null,'brand/onBrand'],active:['brand/active',null,'brand/onBrand']},
 secondary:{default:['bg/surface','border/default','fg/primary'],hover:['bg/sunken','border/strong','fg/primary'],active:['bg/sunken','border/strong','fg/primary']},
 ghost:{default:[null,null,'fg/secondary'],hover:['bg/sunken',null,'fg/primary'],active:['bg/sunken',null,'fg/primary']},
 danger:{default:['status/danger/default',null,'status/danger/on'],hover:['status/danger/default',null,'status/danger/on'],active:['status/danger/default',null,'status/danger/on']}};
const r=await makeSet('Button',[{name:'variant',values:['primary','secondary','ghost','danger']},{name:'size',values:['xs','sm','md','lg','xl']},{name:'state',values:['default','hover','active','focus','disabled','loading']}],async p=>{
  const {variant:v,size:s,state:S}=p; const k=(S==='hover'||S==='active')?S:'default';
  let [fl,sk,tc]=COL[v][k]; if(S==='disabled'){ fl='bg/sunken'; sk=null; tc='fg/disabled'; }
  const c=AL('H',{comp:true,g:s==='xl'?8:4,p:[0,PX[s]],h:'density/control/height/'+s,r:s==='xs'?'sm':'md',f:fl,s:sk,jc:'CENTER'});
  const sp=await IC('loader-circle',16,tc,'spinner'); sp.visible=S==='loading'; add(c,sp);
  const i1=await IC('plus',16,tc,'icon'); i1.visible=false; add(c,i1);
  add(c,TX('저장',{s:TXS[s],w:600,c:tc,n:'label'}));
  const i2=await IC('chevron-down',16,tc,'iconEnd'); i2.visible=false; add(c,i2);
  if(S==='focus') ring(c,s==='xs'?'sm':'md');
  // danger 가리킴 · 누름 덧칠: 칠 불투명도는 인스턴스에서 버려지므로 따로 사각형 + 노드 불투명도(bg/overlay 알파 0.40 × 0.375 · 0.625 = 0.15 · 0.25)
  if(v==='danger'&&(S==='hover'||S==='active')){ const o=rect({n:'overlay',f:'bg/overlay',r:s==='xs'?'sm':'md',op:S==='active'?0.625:0.375});
    c.insertChild(0,o); o.layoutPositioning='ABSOLUTE'; o.x=0; o.y=0; o.resize(c.width,c.height); o.constraints={horizontal:'STRETCH',vertical:'STRETCH'}; }
  return c;
},{props:[{name:'label',type:'TEXT',def:'저장',layer:'label'},{name:'icon',type:'BOOLEAN',def:false,layer:'icon',only:p=>p.state!=='loading'},{name:'icon name',type:'INSTANCE_SWAP',def:ICONS.plus,layer:'icon'},{name:'iconEnd',type:'BOOLEAN',def:false,layer:'iconEnd'},{name:'iconEnd name',type:'INSTANCE_SWAP',def:ICONS['chevron-down'],layer:'iconEnd'}],
 doc:['variant 4 × size 5 × state 6 = 120. …']});
return {setId:r.set.id,count:r.count};
```

다른 세트의 인스턴스는 `set.children.find(c=>c.name==='variant=secondary, size=md, state=default').createInstance()`로 만들고 속성은 `setProperties`로 바꾼다. 속성 키는 `Object.keys(set.componentPropertyDefinitions).find(k=>k.startsWith('label#'))`처럼 찾는다.

## 4. 감사(읽기 전용)

감사 스크립트는 `scripts/figma-audit.mjs`가 낸다. 결과 JSON을 `docs/figma/audit/<작업>.json`(`{ task, file, expect, measured }`)에 저장하고 `--check`로 비교한다. 다르면 exit 1이다.

```bash
node scripts/figma-audit.mjs --emit links    # 지역 컬렉션 · 스타일 수, 바인딩(지역 · 라이브러리), 묶이지 않은 칠 · 글자, 인스턴스
node scripts/figma-audit.mjs --emit sets     # 세트마다 페이지 · 변형 수 · 축 값의 곱 · 설명
node scripts/figma-audit.mjs --emit keys     # 변수 · 스타일 · 세트 · 낱개 컴포넌트의 이름 → key
node scripts/figma-audit.mjs --check docs/figma/audit/PG-02.json
```

- 맨 앞에 `figma.skipInvisibleInstanceChildren = false;`를 붙여 숨은 인스턴스 자식까지 센다. use_figma는 기본으로 건너뛴다. 바꾸기 전과 뒤를 같은 설정으로 잰다.
- Components는 숨은 자식까지 노드 약 8만 개다(DataGrid 2.5만 · ProfileHeader 1.8만). links는 `ONLY`로 네 묶음(DataGrid · ProfileHeader · 앞 절반 · 뒤 절반)으로 나눠 돌리면 한 번에 15초 안쪽이다.
- 지역 글자 · 효과 스타일을 쓰는 노드 수, 명시 모드, 그라디언트 정지점의 바인딩은 links에 없다. 연결 작업에서는 같은 순회에 세어 넣는다(PG-02.json의 `x`).
- 바인딩 수에는 글자 노드의 `textRangeFills`가 함께 들어간다. 같은 변수의 칠이 범위 칠로 한 번 더 잡히는 표기라서 칠을 노드 전체로 다시 쓰거나 글자 스타일을 바꾸면 그림은 같아도 수가 바뀐다.

마지막에 `get_screenshot`으로 대표 화면을 받아 `curl`로 `docs/plan/notes/<작업>/`에 저장하고 `docs/figma/README.md`의 검증 절을 고친다. 앞뒤 캡처를 비교할 때는 같은 `maxDimension`으로 받고 Playwright 브라우저의 canvas로 픽셀을 센다(`apps/preview/node_modules/playwright`).

## 5. 라이브러리로 다시 묶기(PG-02 절차, PG-03에 다시 쓴다)

지역 사본 변수 · 스타일에 묶인 파일을 Foundations 라이브러리로 옮긴다. 2026-11-10 Components에서 바인딩 257,202개를 이 절차로 옮겼다.

1. 바꾸기 전: 4절 links · sets를 저장하고 대표 세트를 캡처한다. 인스턴스 덮어쓰기 칠의 저장 색이 `variable.resolveForConsumer(node)`와 다른 곳(검정 칠 함정)을 찾아 고친다. 인스턴스 안 노드는 가장 바깥 인스턴스의 `overrides`에 그 칠이 있을 때만 고친다.
2. 대응표: 3절 key 목록을 문서에 넣고, 지역 변수마다 `컬렉션/이름`의 key로 `importVariableByKeyAsync`를 불러 `지역 id → [라이브러리 id, key]` 표를 만든다. 스타일도 이름으로 같은 표를 만든다. 표는 `setSharedPluginData('trellis','relink', …)`에 둔다.
3. A단계(인스턴스 밖 노드 전부): 글자 스타일을 먼저 바꾼다(`setTextStyleIdAsync`). 스타일이 있는 글자는 스타일의 fontSize · lineHeight · fontWeight를 `boundVariables`로 보여 주므로 바꾼 뒤 다시 읽는다. 그다음 효과 스타일(`setEffectStyleIdAsync`), `boundVariables`의 수치 바인딩(`setBoundVariable`, 네 모서리가 같은 변수면 `cornerRadius` 한 번), 칠 · 선(기존 칠에서 `setBoundVariableForPaint`, 그라디언트는 정지점의 `boundVariables`), 효과, 명시 모드(같은 이름 모드로 `setExplicitVariableModeForCollection` 뒤 지역 컬렉션 `clear…`) 순서다.
4. B단계(인스턴스 안): 가장 바깥 인스턴스의 `overrides[].overriddenFields`에 그 필드가 있는 덮어쓰기만 다시 묶는다. 칠은 `fills` · `strokes`, 크기는 `width` · `height`로 나오고 다른 수치 바인딩은 `boundVariables`로 나온다. 본체에서 물려받은 값은 건드리지 않는다. 물려받은 값이 아직 지역이면 그 본체 정의를 고치는 차례에 풀린다. 지역 참조가 0이 될 때까지 다시 돈다.
5. 실행: 본체에 쓰는 한 번이 13~90ms(인스턴스 전파)라서 쓰기 10만 번이면 한 시간이 넘는다. 다시 묶는 코드를 문서 plugin data에 두고 짧은 실행 호출이 50초씩 돌게 했다. 지역 참조만 고치므로 몇 번을 다시 돌려도 같다. 남은 페이지 목록도 plugin data에 둔다.
6. 확인 뒤 삭제: links의 localBindings 0, 지역 스타일 사용 0, 명시 모드 · 그라디언트 지역 참조 0을 확인한 뒤에만 지역 컬렉션 · 스타일을 지운다. 지운 뒤 links · sets를 다시 재고 캡처의 픽셀을 비교한다. 일회용 plugin data(`relink` 등)는 지우고 `keys`만 남긴다.

## 6. 화면 파일(Trellis · Screens)

PG-03(2026-11-10)부터 Screens는 두 라이브러리를 쓰기만 한다. 변수 · 스타일은 Foundations, 세트 · 아이콘 · 타일은 Components 라이브러리에서 key로 가져온다. 지역 변수 · 스타일 · 세트 사본을 만들지 않는다. Components 세트를 고치면 사람이 다시 게시하고 Screens에서 라이브러리 갱신을 받는다. 예외는 아래 "게시 대기 세트 바꾸기"의 두 세트다. 화면은 `figma:figma-generate-design`도 읽고 `skillNames: "figma-use,figma-generate-design"`으로 부른다.

1. key 목록(파일마다 한 번): 3절 "key 목록 넣기"로 Foundations key 목록(`keys`)을 넣는다. Components key 목록(`components`)은 아래 명령이 내는 스크립트를 `use_figma`로 돌린다(약 20KB). 돌려받은 `counts`가 세트 167 · 낱개 234이면 된다(2026-11-12 3차 동기화 뒤 keys.json). Components에 세트가 늘면 `keys.json`을 다시 만든 뒤 다시 넣는다.

```bash
node -e 'const k=require("./docs/figma/keys.json").Components; const m={sets:k.sets,components:k.components,counts:k.counts}; console.log("figma.root.setSharedPluginData(\"trellis\",\"components\","+JSON.stringify(JSON.stringify(m))+");\nreturn JSON.parse(figma.root.getSharedPluginData(\"trellis\",\"components\")).counts;")' > /tmp/trellis-components-setter.js
```

2. 키트 v2: `screen-kit.js`(이 폴더)를 문서 plugin data `kit`에 한 번 저장한다. 코드가 2만 자가 넘어 호출마다 보내면 낭비라서 `AsyncFunction`으로 실행한다. 시작할 때 변수 483 · 스타일 15 · 아이콘(key 목록의 `icon/*`, 2026-11-12 3차 동기화 뒤 173) · 타일 36 · 화면 세트 23을 병렬로 가져온다(약 1초). `ICONS` · `TILES`는 이름 → 라이브러리 컴포넌트 id이고 키트가 채운다. 라이브러리에서 가져오지 못한 세트는 `컴포넌트 사본` 페이지의 같은 이름 세트를 쓰고, 변형 이름이 없으면 축 값이 가장 많이 맞는 변형을 고른다. 둘 다 `KIT_WARN`에 적으므로 batch가 돌려받아 확인한다.

```js
// 저장(한 번). kitFn 본문 = screen-kit.js 내용 그대로
const kitFn=async()=>{ /* screen-kit.js 내용 */ };
const src=kitFn.toString(); figma.root.setSharedPluginData('trellis','kit',src.slice(src.indexOf('{')+1,src.lastIndexOf('}')));
```

```js
// 실행(호출마다). batch 안에서는 키트의 SCREEN · CARD · TBL · BT 등을 그대로 쓴다
const KIT=figma.root.getSharedPluginData('trellis','kit'); if(!KIT) throw new Error('kit missing');
const AF=Object.getPrototypeOf(async function(){}).constructor;
const batch=async()=>{ /* 화면 코드 */ return out; };
return await new AF('figma',KIT+'\nreturn await ('+batch.toString()+')();')(figma);
```

3. 화면 하나 = `SCREEN(이름, {fit:true})`(AppShell 인스턴스 + 내용 프레임 x 240 · y 49) → 내용 추가 → `FIT(sc)` → `MODE2(root,'Light','주황')` → `PLACE(root, 페이지 id, x, y)`. 시험 화면은 `SCREEN(이름, TRIAL(선택 메뉴, 사용자))`로 메뉴를 `SideNav / Item` 인스턴스로 바꾼다. 세트 인스턴스의 글자는 `REPL(inst, [[기본 글자, 새 글자], ...])`, 부분 숨기기는 `HIDE` · `STEPS`(ApprovalLine 단계)로 한다. 라이브러리 ApprovalLine은 글자 레이어 이름이 글자 내용이라 `STEPS` · `STEP`이 `step` · `role` · `body` · `person` 프레임 구조로 글자를 찾는다.
4. 모드별 복제: 기준 프레임(Light)을 다 만든 뒤 한 호출로 복제한다. 키트의 `MODE2`가 라이브러리 Semantic · Company 컬렉션(`_SE` · `_CO`)의 같은 이름 모드를 건다.

```js
// G2: 같은 페이지에 x = (폭+100) × i 로 Dark · 주황 / Light · 파랑 / Light · 노랑. 시험: 오른쪽에 Dark · 초록
const c=base.clone(); base.parent.appendChild(c); c.x=base.width+100; c.name=base.name.replace(' · Light · 주황',' · Dark · 주황'); MODE2(c,'Dark','주황');
```

5. 감사: `figma-audit --emit screens`의 `ONLY`에 화면 페이지만 넣는다(Cover · 컴포넌트 사본 제외). 기대는 묶이지 않은 칠 0, 프레임마다 라이브러리 모드 두 개, 본체가 지역인 인스턴스 0이다. `--emit links`로 지역 컬렉션 · 스타일 · 바인딩 0을 본다. 대표 화면 2~3장을 `get_screenshot` + `curl`로 `docs/plan/notes/<작업>/screens-*.png`에 저장한다.

### 라이브러리로 옮기기(PG-03 절차)

사본을 쓰던 화면 파일을 라이브러리로 옮기는 순서다. 2026-11-10 Screens 프레임 48(맨 위 인스턴스 1,146)에 썼고 G2 캡처 4장의 픽셀 차이가 0이었다.

1. 바꾸기 전: links · screens 감사와 대표 프레임 캡처. 화면이 쓰는 지역 변형마다 라이브러리에 같은 이름 변형이 있는지, 크기와 레이어 구조(이름 포함)가 같은지 가져온 세트로 비교한다.
2. 인스턴스 먼저 바꾼다. 맨 위 인스턴스(다른 인스턴스 안이 아닌 것)마다 한다. ① 덮어쓰기(`overrides`의 글자 · 칠 · 선 · 보이기 · 불투명도 · 이름 · 크기)를 맨 위 인스턴스에서 자식 순번 경로로 적는다. 속성 값(INSTANCE_SWAP은 컴포넌트 이름)과 모든 글자 목록도 적는다. ② 라이브러리 변형으로 `swapComponent`. ③ 속성을 같은 이름 키로 다시 넣는다(INSTANCE_SWAP은 라이브러리 `icon/<name>` id). ④ 안쪽에 남은 지역 본체 인스턴스를 라이브러리로 바꾼다. ⑤ 경로로 덮어쓰기를 다시 넣는다. 칠은 지역 변수를 같은 이름 라이브러리 변수로 바꿔 넣는다. ⑥ 다시 읽어 비교한다. 크기는 일부러 바꾼 크기만 되돌리고, 옛 본체 크기와 같던 크기는 라이브러리 본체 크기를 따른다.
3. 그다음 5절 A단계(인스턴스 밖 노드 + 명시 모드)와 B단계(남은 덮어쓰기)를 돌린다. 지울 사본 본체는 다시 묶지 않는다.
4. 지울 컴포넌트를 가리키는 인스턴스 0과 파일 전체의 지역 변수 · 스타일 · 모드 참조 0을 지우는 호출 안에서 확인한다. 남아 있으면 throw해서 호출 전체를 되돌린다.
5. 앞뒤 캡처를 같은 `maxDimension`으로 받아 픽셀을 비교한다(4절).

### 게시 대기 세트 바꾸기(PersonLabel · ProfileHeader)

2026-11-10 기준 Components의 PersonLabel · ProfileHeader가 게시되지 않아(`getPublishStatusAsync` UNPUBLISHED) Screens에 지역 변형 하나씩(`컴포넌트 사본` 페이지)이 남아 있다. 사본 안의 인스턴스와 변수는 라이브러리다. 사람이 두 세트를 게시한 뒤 아래를 돌린다. `pg03swap`은 위 2번 절차를 담은 일회용 키트다(문서 plugin data, 13KB).

게시되지 않던 원인은 같은 이름의 속성 두 개였다(아래 함정). Components 정리에서 불리언 이름을 바꿨으므로 라이브러리 세트의 속성은 PersonLabel `show presence`, ProfileHeader `show status` · `show presence`다. 사본은 아직 `presence` · `status`(BOOLEAN)라서 `pg03swap`이 속성을 같은 이름 키로 다시 넣을 때 이 둘은 새 이름으로 바꿔 넣는다. 돌리기 전에 Screens 문서의 Components key 목록(`components`)을 새 `keys.json`으로 다시 넣는다(1번).

```js
const SP=['G2 · 결재 상세','시험 · 테라스원 인사']; const pages=figma.root.children.filter(p=>SP.includes(p.name)); for (const p of pages) await p.loadAsync();
const KIT=figma.root.getSharedPluginData('trellis','pg03swap'); const AF=Object.getPrototypeOf(async function(){}).constructor;
const ROOTS=pages.flatMap(p=>p.children.filter(f=>f.type==='FRAME').map(f=>f.id));
return await new AF('figma','P',KIT)(figma,{ROOTS,BUDGET:45000,SKIP:[]}); // 기대: st.swapped 14 · st.mismatch 0 · st.localLeft 0. ProfileHeader는 st.closest에 고른 변형이 나온다
```

그 뒤 `컴포넌트 사본` 페이지, Cover 색인의 `Row 컴포넌트 사본` 줄, plugin data `pg03swap`을 지운다. links · screens 감사를 다시 돌려 `docs/figma/audit/PG-03.json`의 localSets · localMainInstances가 0인지 본다.

## 함정(2026-11-10에 실제로 걸린 것)

- `resize()`는 자동 레이아웃 크기 방식을 FIXED로 바꾼다. 세로 프레임에 폭만 정할 때는 `resize` 뒤 `primaryAxisSizingMode='AUTO'`(키트 `AL`의 `w`가 처리).
- `figma.variables.setBoundVariableForPaint`는 입력 칠의 `opacity`를 버린다. 반투명 칠은 돌려받은 칠에 `opacity`를 다시 넣는다(키트 `P(color, opacity)`).
- 칠을 알파가 있는 변수(`bg/overlay` 0.40 · `bg/rowSelected` 0.08 등)에 새로 묶으면 넣은 `opacity`와 상관없이 칠 불투명도가 변수 알파가 된다. 묶인 뒤 같은 칠에 `opacity`만 바꿔 한 번 더 쓰면 남는다(키트 v2 `setPaints`). PG-02에서 Button danger hover · active 10개가 0.15 · 0.25에서 0.40으로 바뀌어 되돌렸다. 이렇게 되돌린 칠도 인스턴스에서는 0.40으로 그려져서 2026-11-10 정리에서 덧칠 사각형 + 노드 불투명도로 바꿨다.
- 빈 자동 레이아웃 프레임은 100 × 100으로 남는다. 간격 메우기용 프레임은 `resize(1,1)` 뒤 `layoutGrow=1`.
- `makeSet`에 `dest`를 빼면 세트가 현재 페이지에 남는다. 감사의 페이지 이름 확인으로 잡는다.
- 텍스트 속성에 묶은 글자는 모든 변형에서 같은 값이 된다. 변형마다 글자가 다르면(배지 라벨 등) 묶지 않는다.
- 모듈 타일 SVG는 feDropShadow 때문에 벡터로 가져오면 그림자가 빠진다. Playwright로 512px PNG를 만들어 `upload_assets`(nodeIds = `tile/<id>` 컴포넌트)로 이미지 칠을 넣는다. 아이콘 SVG는 `upload_assets`에 multipart `file` 필드로 올리면 파일 이름이 레이어 이름이 된다.
- `use_figma` 연결이 끊기면 스크립트가 끝났는지 모른다. 다시 돌리기 전에 읽기 전용 호출로 캔버스를 확인한다.
- `use_figma`에서 `figma.skipInvisibleInstanceChildren`이 켜져 있을 수 있다. 숨긴 인스턴스 안쪽 노드를 `findOne`이 못 찾으므로 화면 키트는 맨 앞에서 `false`로 둔다. 다른 페이지 노드를 찾기 전에는 그 페이지를 `loadAsync()` 한다.
- 함수의 `toString()`은 원문이 아니라 다시 찍은 코드(`(n) => n.name === 'nav'`처럼 공백 · 괄호가 바뀜)를 돌려준다. 저장한 키트를 문자열 치환으로 고칠 때는 저장된 글을 먼저 읽고 그 모양으로 찾는다.
- AppShell 메뉴 칸(`nav`)을 숨기면 바닥글이 위로 붙는다. 시험 화면처럼 메뉴를 바꿀 때는 `nav`는 두고 안쪽 항목만 숨긴다(nav는 layoutGrow 1).
- 내용 프레임을 `resize`하면 세로도 FIXED가 되어 긴 화면이 900에서 잘린다. `fit` 화면은 `primaryAxisSizingMode='AUTO'`로 높이를 잰 뒤 프레임 · AppShell을 그 높이로 늘린다(키트 `FIT`).
- 줄바꿈하는 자동 레이아웃(`layoutWrap`)은 폭이 정해져야 한다. 메타 격자처럼 부모를 채울 때는 넣은 뒤 `layoutSizingHorizontal='FILL'`.
- 인스턴스에서 본체와 같은 변수로 칠을 덮어 쓰면(키트 v1 `P()`) 바인딩은 남고 저장 색이 검정이라 검정으로 그려진다. 키트 v2 `P(c, op, node)`는 풀린 색을 넣는다. 2026-11-10 Components 전체(묶인 칠 60,904개)를 훑었을 때는 남은 곳이 0이었다.
- 아이콘을 바꿔 끼우면(INSTANCE_SWAP · `swapComponent`) 선 색 덮어쓰기가 사라져 새 본체의 `fg/primary`로 돌아간다. 인스턴스 `overrides`에는 옛 아이콘 벡터 id가 남는다. 바꾼 뒤 `ICCOLOR`로 다시 칠한다.
- INSTANCE_SWAP 속성은 모든 변형에 같은 기본 컴포넌트를 넣는다. 변형마다 다른 아이콘을 둘 수 없다.
- `getVariableByIdAsync(라이브러리 변수 id)`는 그 변수가 파일 어디에도 묶여 있지 않으면 null이다. 가져오기만 하고 쓰지 않은 변수는 호출이 끝나면 사라진다. `setBoundVariable(field, null)`은 오류 없이 바인딩을 푼다. 라이브러리 변수는 key로 가져오고 null이면 멈춘다. PG-02에서 Button 변형 하나의 바인딩 9개가 이렇게 풀려 다시 묶었다.
- `importVariableByKeyAsync`는 하나에 약 0.65초다. 순서대로 부르지 말고 `Promise.all`로 묶는다(483개 약 4초).
- 오류가 나거나 연결이 끊긴 호출은 그 호출의 변경이 모두 되돌아간다(페이지 만들기도 함께). 다시 돌리기 전에 읽기 전용 호출로 확인한다.
- 페이지 순서를 바꾸는 `figma.root.insertChild`도 그 페이지 글꼴을 요구한다. 글꼴을 먼저 불러오고 페이지를 `loadAsync()` 한다.
- `figma.setFileThumbnailNodeAsync`는 이 실행 환경에서 지원되지 않는다. 섬네일은 사람이 Cover 프레임을 오른쪽 클릭해 Set as thumbnail로 지정한다.
- `get_libraries`는 Pro 팀 라이브러리를 보여 주지 않고 `figma.teamLibrary`는 없다. 게시 확인은 key로 `importVariableByKeyAsync`가 `remote: true` 변수를 돌려주는지로 한다.
- Figma는 새 변수를 컬렉션 끝에 붙인다. 변수 순서가 달라도 `figma-diff` 해시는 컬렉션 안 이름순이라 같다.
- 인스턴스 안 수치 바인딩 덮어쓰기는 `overriddenFields`에 필드 이름이 아니라 `boundVariables`로 나온다. 칠 · 선 · 크기는 필드 이름으로 나온다.
- 다시 묶을 때 쓰기 비용은 본체의 인스턴스 수에 비례한다. 아이콘 · 단추 · 배지처럼 많이 쓰이는 본체는 한 번에 30~90ms, 인스턴스가 없는 프레임은 2ms다.
- 게시되지 않은 세트(`getPublishStatusAsync` UNPUBLISHED)는 key가 있어도 `importComponentSetByKeyAsync`가 "not found"로 실패한다. PG-03에서 PersonLabel · ProfileHeader가 그랬다. 연결 작업 전에 쓰는 세트를 모두 key로 가져와 본다.
- 가져온 세트는 게시된 판이다. Components 파일이 그 뒤 바뀌었으면(CHANGED) 파일의 변형 이름 · 구조와 다를 수 있다. 비교와 바꾸기는 가져온 세트로 한다.
- `swapComponent`는 레이어 이름 · 구조가 맞는 덮어쓰기만 남긴다. 라이브러리 ApprovalLine · TimeClock · WorkHoursMeter는 글자 레이어 이름이 글자 내용이라 이름이 사본과 다르다. 바꾸기 전에 덮어쓰기를 자식 순번 경로로 적고 바꾼 뒤 다시 넣는다(6절 "라이브러리로 옮기기").
- 프레임의 지역 명시 모드를 지우면 지역 변수에 묶인 채 남은 노드(사본 인스턴스 등)는 지역 컬렉션 기본 모드(Light · 주황)로 그려진다. 남는 사본도 라이브러리 변수로 바꾼 뒤 캡처한다.
- 직접 묶인 변수가 없는 라이브러리 컬렉션(Company 등)은 그 컬렉션의 변수 하나를 key로 가져온 뒤에야 `getVariableCollectionByIdAsync`가 돌려준다.
- 키트 `SCREEN()`이 만든 프레임은 먼저 현재 페이지(호출마다 첫 페이지 Cover)에 붙는다. 같은 이름 프레임을 지우는 정리 코드를 `SCREEN()` 뒤에 두면 방금 만든 프레임도 지운다.
- 화면 프레임 안 인스턴스의 `swapComponent`와 덮어쓰기 복원은 인스턴스 하나에 수십 ms다. 맨 위 인스턴스 1,132개를 45초 호출 두 번에 바꿨다.
- 속성 이름이 겹치는 세트는 게시되지 않는다. 오류 없이 목록에서만 빠지고 `getPublishStatusAsync`가 UNPUBLISHED로 남는다. PersonLabel · ProfileHeader가 BOOLEAN `presence`(`presence#15:62`)와 변형 축 `presence`를 함께 가져 첫 게시에서 빠졌다. `#id`를 뺀 이름이 같은 속성 두 개, 변형 축과 같은 이름의 TEXT · BOOLEAN · INSTANCE_SWAP 속성을 두지 않는다. 숨기는 불리언은 `show <부분>`으로 짓는다. 이미 있으면 `set.editComponentProperty(key, {name:'show presence'})`로 이름만 바꾼다. `#id`가 그대로라 레이어 참조와 인스턴스 값이 이어진다. 게시 전에 모든 세트 · 낱개 컴포넌트의 `componentPropertyDefinitions`를 훑어 겹치는 이름(대소문자 무시) · 변형 이름 중복 · 같은 축 값 조합 · 빈 값 · 앞에 `_`나 `.`이 붙은 이름이 0인지 본다(`docs/figma/audit/components-final.json`의 `publishBlockers`).
- 인스턴스 안에서는 변수에 묶인 칠의 불투명도가 버려지고 변수 값의 알파로 그려진다. 알파가 없는 변수(`chart/series/1` 등)에 칠 불투명도 0.14를 준 TrendChart 예측 구간은 인스턴스에서 100%, `bg/overlay`(알파 0.40)에 0.15를 준 Button danger 덧칠은 0.40으로 보였다. 본체에서는 맞게 보여서 본체 캡처로는 못 잡는다. 반투명은 칠 불투명도를 변수 알파와 같게 두고(알파 없는 변수는 1) 노드 `opacity`로 낸다. 덧칠은 따로 사각형(절대 위치 · STRETCH · 같은 반경 변수)으로 둔다. 감사는 모든 SOLID 칠에서 `|paint.opacity - variable.resolveForConsumer(node).value.a| > 0.01`인 곳을 세고(0이어야 한다), 고친 세트는 인스턴스를 만들어 `exportAsync` 결과를 본체와 비교한다.
- 맨 위 노드가 겹치는지는 페이지마다 경계 상자로 본다. `Docs · <Name>` · `Labels · <Name>` · `<Name>`은 키트가 일부러 겹쳐 놓으므로 같은 이름끼리는 빼고 센다. 부품 세트를 더할 때 기존 세트 옆 빈자리를 계산해서 놓는다(AppShell 페이지에서 `SideNav / Item`이 AppShell 세트 위에 놓였다).
- `description`을 읽으면 `<` · `>` · `"`가 `&lt;` · `&gt;` · `&quot;`로 온다. 읽은 글을 고쳐 그대로 다시 쓰면 `&amp;lt;`가 된다. 엔티티를 풀고 쓴다(2026-11-13 4차 동기화).
- `strokesIncludedInLayout`이 켜진 자동 레이아웃 프레임에 선을 주면 선 두께만큼 커진다(FilterBar 격자 줄 53 → 54). 자식의 선 위에 겹쳐 그리는 구분선은 이 값을 끄고 준다.
- 내용이 든 칸의 옅은 덧칠은 칸의 칠이 아니라 안쪽 `tint` 사각형(절대 위치 · STRETCH, 맨 아래)의 노드 불투명도로 낸다. fg/primary처럼 알파가 없는 변수에 준 칠 불투명도는 다시 묶을 때 100%가 된다. TeamSchedule 주말 열이 그렇게 검게 남아 있었다. 감사의 "칠 불투명도 ≠ 변수 알파"는 이 경우를 잡지 못한다. 진한 글자색 변수(fg/primary · secondary · tertiary)를 100%로 칠한 넓은 프레임 · 사각형을 따로 찾아 코드와 맞는지 본다.
- 기준선을 맞춘 글자 사이의 세로 구분선은 `figma.createLine()`을 -90도 돌려 넣는다. 자동 레이아웃에서 폭이 0이라 간격이 늘지 않고 아래 끝이 기준선에 놓인다(PageHeader 형제 구분선, 간격 space/16 + space/16 = 32).
- 아이콘은 `figma.createNodeFromSvg`(viewBox 24, stroke 1.5, round)로 만든 벡터를 새 컴포넌트에 옮기고 선을 `color/fg/primary`에 묶는다. `rect` · `circle`이 벡터가 아니면 `figma.flatten([node])`로 바꾼다. 레이어 이름 `Vector`, 제약 SCALE, `clipsContent = true`, 설명 `Lucide <name> (ISC) · 24 격자 · …`은 기존 아이콘과 같게 둔다.
