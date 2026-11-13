# TrellisProvider

> `@terracelab/trellis-react` · CSS `.tl-trellis-provider` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { TrellisProvider } from '@terracelab/trellis-react';
```

## 용도

앱 맨 바깥에 한 번 둔다. 컴포넌트 문구 언어(locale)를 고르고, 원하면 `<html>`의 테마 · 밀도 속성을 맞추고, 회사 메인 색 하나로 회사 테마를 입힌다(D-98). 없어도 모든 컴포넌트가 한국어 · 기본 테마(#FE5C2B) 그대로 동작한다(D-65).

## 해부(Anatomy)

감싸는 요소가 없다. locale 컨텍스트만 내려 준다. 범위 지정(`scope` 또는 안쪽 Provider)이고 theme · density가 있으면 `div.tl-theme-scope[data-tl-theme]`(display: contents) 하나로 감싼다. 회사 테마는 `<head>`의 `style[data-tl-theme-style]` 하나다.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `locale` | `'ko' \| 'en'` | `"ko"` |  | 컴포넌트 문구 언어 |
| `theme` | `'light' \| 'dark' \| { mode?, brand?, neutral?, buttonText? }` |  |  | html data-theme, 또는 회사 테마(회사 메인 색 하나 → 회사 색 토큰 21개 × 4모드) |
| `scope` | `boolean` | `false` |  | 이 안에만 테마 · 밀도를 입힌다(미리보기 · 회사 설정 화면) |
| `fontScale` | `'100' \| '112' \| '125'` | `"100"` |  | 글자 크기(data-font-scale) |
| `contrast` | `'normal' \| 'high'` | `"normal"` |  | 고대비(data-contrast) |
| `focusRing` | `'normal' \| 'strong'` | `"normal"` |  | 포커스 강조(data-focus) |
| `linkUnderline` | `boolean` | `false` |  | 링크 밑줄 항상(data-links) |
| `chartPalette` | `'default' \| 'cvd'` | `"default"` |  | 색각 친화 차트(data-chart) |
| `motion` | `'auto' \| 'reduce'` | `"auto"` |  | 움직임 줄이기(data-motion) |
| `contentWidth` | `'auto' \| '1280' \| '1440' \| '1600' \| 'full'` | `"auto"` |  | 본문 최대 너비(data-content-width) |
| `toastDuration` | `'default' \| 'long' \| 'manual'` | `"default"` |  | 토스트 표시 시간 설정(기본 · 길게 · 직접 닫기) |
| `density` | `'compact' \| 'comfortable' \| 'touch'` |  |  | html data-density |
| `navigate` | `(href: string) => void` |  |  | 앱 라우터 이동(Link · PersonLabel href의 앱 안 주소를 새로 고침 없이) |
| `children` | `ReactNode` |  |  | 앱 |

## Variants

locale ko · en. theme: 모드 문자열(`'light' | 'dark'`) 또는 회사 테마 객체(`{ mode, brand, neutral, buttonText }`).

## States

지원 상태: `default`

default. 나머지는 해당 없음.

## 동작

locale을 바꾸면 버튼 · 접근성 이름 · 빈 상태 · 오류 문구와 달력 요일이 그 언어로 바뀐다. 숫자 · 금액 · 날짜 서식(원 · 만 · 억 · ISO)은 한국 업무 관습 그대로다. theme · density를 주면 `<html data-theme · data-density>`를 맞추고, 안 주면 앱이 건 속성을 건드리지 않는다. `<html lang>`도 locale에 맞춘다. 바꾼 속성은 Provider가 내려갈 때 원래 값으로 돌린다. Provider 안의 Provider(문서 예시처럼 페이지 일부만 다른 언어)는 문구 언어만 바꾸고 `<html>`은 건드리지 않는다.

회사 테마(D-98): `theme={{ brand: '#hex' }}`를 주면 `@terracelab/trellis-tokens/theme`의 createTheme이 회사 색 토큰 21개를 라이트 · 다크 · 고대비 라이트 · 고대비 다크로 계산해 `<head>`에 넣는다. 색을 바꾸면 새로 고침 없이 바로 바뀌고(회사 설정에서 색을 고르는 쓰임새), Provider가 내려가면 지운다. 같은 입력이면 빌드(`pnpm ds:theme`)가 만든 theme.css와 같은 값이다. 기본 테마(#FE5C2B · cool · white)와 같거나 형식이 틀린 색(입력 중인 글자)이면 아무것도 넣지 않는다. `scope`(또는 안쪽 Provider)면 그 안에만 입히고 `<html>`의 테마 · 밀도는 그대로 둔다(미리보기 · 한 화면). 범위 선택자는 전역 테마보다 우선도가 한 단계 높다.

접근성 모드(D-97, 식자재 ERP 화면 설정과 같은 이름): `fontScale`(글자 112 · 125%) · `contrast`(고대비) · `focusRing`(포커스 강조) · `linkUnderline`(링크 밑줄) · `chartPalette`(색각 친화 차트) · `motion`(움직임 줄이기) · `contentWidth`(본문 최대 너비)는 각각 `data-font-scale` · `data-contrast` · `data-focus` · `data-links` · `data-chart` · `data-motion` · `data-content-width`를 `<html>`(범위 지정이면 감싼 요소)에 건다. 기본값이면 속성을 걸지 않는다. Provider 없이 앱이 속성을 직접 걸어도 같다(Django 호환). `toastDuration`(기본 · 길게 · 직접 닫기)은 그 아래 ToastProvider의 자동 닫힘 시간을 바꾼다(WCAG 2.2.1). 그 부분의 언어는 감싼 요소에 `lang`으로 적는다. 앱 문구(블록 · 화면)는 앱이 정한다.

`navigate`(R-T34)는 앱 라우터의 이동 함수다. 있으면 Link와 PersonLabel `href`의 앱 안 주소(스킴이 없고 `#id`가 아닌 주소)를 a 태그 기본 이동(전체 다시 불러오기) 대신 이 함수로 연다. 왼쪽 단추 누름일 때만이고 Ctrl · Cmd · Shift · Alt · 가운데 단추(새 탭) · `target`이 있는 링크 · 바깥 주소는 브라우저에 맡긴다. 안쪽 Provider가 `navigate`를 주지 않으면 바깥 것을 물려받는다. 없으면 a 태그 그대로라 Provider 없이도 동작한다.

## 접근성

`<html lang>`이 화면 낭독기 발음을 정하므로 locale과 같게 둔다. 컴포넌트가 만드는 aria 이름도 같은 언어가 된다.

## 밀도

해당 없음(density를 주면 html 속성만 바꾼다).

## 플랫폼 차이

네이티브는 같은 props로 테마 · 밀도 객체(`@terracelab/trellis-tokens/native`)와 문구 사전을 내려 준다.

## 금지 사항

문서 전체 Provider를 여러 겹 두기(문서 전체 테마는 하나, 미리보기 · 한 화면은 `scope`) · 회사 색을 CSS 변수로 직접 덮기(엔진을 거치지 않으면 대비 검사가 없다) · 앱 문구를 Trellis 사전에 넣기(사전은 컴포넌트 문구만) → 리뷰.

## 예시

### 영어 문구

버튼 · 접근성 이름 · 프리셋 · 달력이 영어로. 숫자 서식은 그대로

```tsx
import { Field, MultiSelect, Pagination, PeriodPicker, TrellisProvider } from '@terracelab/trellis-react';

const CHANNELS = [
  { value: 'own', label: 'Online store' },
  { value: 'market', label: 'Marketplace' },
  { value: 'pos', label: 'POS' },
];

function English() {
  return (
    <TrellisProvider locale="en">
      {/* 안쪽 Provider는 <html lang>을 바꾸지 않는다. 이 부분의 언어는 감싼 요소에 적는다 */}
      <div
        lang="en"
        style={{
          display: 'grid',
          gap: 'var(--tl-space-16)',
          maxWidth: 'calc(var(--tl-space-64) * 6)',
        }}
      >
        <Field label="Order date">
          <PeriodPicker
            today="2026-11-06"
            defaultValue={{ from: '2026-11-01', to: '2026-11-06' }}
          />
        </Field>
        <Field label="Channel">
          <MultiSelect options={CHANNELS} defaultValue={['own', 'market']} />
        </Field>
        <Pagination page={2} total={1284} pageSize={20} onPageChange={() => {}} />
      </div>
    </TrellisProvider>
  );
}
```

### 회사 테마(D-98)

회사 설정 화면처럼 컬러칩을 고르면 미리보기 안만 새로 고침 없이 바뀐다(scope)

```tsx
import { THEME_PRESETS, createTheme } from '@terracelab/trellis-tokens/theme';
import { useState } from 'react';
import { Badge, Button, Field, SegmentedControl, Switch, Tabs, TrellisProvider } from '@terracelab/trellis-react';

function CompanyTheme() {
  const [preset, setPreset] = useState(THEME_PRESETS[0]!.id);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const p = THEME_PRESETS.find((x) => x.id === preset) ?? THEME_PRESETS[0]!;
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <Field label="회사 색">
        <SegmentedControl
          value={preset}
          onChange={setPreset}
          options={THEME_PRESETS.slice(0, 5).map((x) => ({ value: x.id, label: x.label }))}
        />
      </Field>
      <Field label="미리보기 모드">
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as 'light' | 'dark')}
          options={[
            { value: 'light', label: '라이트' },
            { value: 'dark', label: '다크' },
          ]}
        />
      </Field>
      <TrellisProvider scope theme={{ brand: p.brand, neutral: p.neutral, mode }}>
        <div
          style={{
            display: 'grid',
            gap: 'var(--tl-space-12)',
            padding: 'var(--tl-space-16)',
            background: 'var(--tl-color-bg-canvas)',
            borderRadius: 'var(--tl-radius-md)',
          }}
        >
          <Tabs
            items={[
              { value: 'all', label: '전체' },
              { value: 'mine', label: '내 문서' },
            ]}
            defaultValue="all"
          />
          <div style={{ display: 'flex', gap: 'var(--tl-space-8)', alignItems: 'center' }}>
            <Button>저장</Button>
            <Button variant="secondary">취소</Button>
            <Switch defaultChecked>알림</Switch>
            <Badge approval="pending" />
          </div>
          {/* 견본은 계산한 회사 색(강조) — 토큰 값을 보여 주는 자리 */}
          <span
            aria-hidden
            style={{
              inlineSize: 'var(--tl-space-24)',
              blockSize: 'var(--tl-space-8)',
              borderRadius: 'var(--tl-radius-full)',
              background: createTheme(p).light['--tl-color-brand-accent'],
            }}
          />
        </div>
      </TrellisProvider>
    </div>
  );
}
```
