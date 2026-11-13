import { THEME_PRESETS, createTheme } from '@terracelab/trellis-tokens/theme';
import { useState } from 'react';
import { Badge } from '../Badge/Badge.js';
import { Button } from '../Button/Button.js';
import { Field } from '../Field/Field.js';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl.js';
import { Switch } from '../Switch/Switch.js';
import { Tabs } from '../Tabs/Tabs.js';
import { MultiSelect } from '../MultiSelect/MultiSelect.js';
import { Pagination } from '../Pagination/Pagination.js';
import { PeriodPicker } from '../PeriodPicker/PeriodPicker.js';
import { TrellisProvider } from './TrellisProvider.js';

const CHANNELS = [
  { value: 'own', label: 'Online store' },
  { value: 'market', label: 'Marketplace' },
  { value: 'pos', label: 'POS' },
];

/** 영어 문구 — 버튼 · 접근성 이름 · 프리셋 · 달력이 영어로. 숫자 서식은 그대로 */
export function English() {
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

/** 회사 테마(D-98) — 회사 설정 화면처럼 컬러칩을 고르면 미리보기 안만 새로 고침 없이 바뀐다(scope) */
export function CompanyTheme() {
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
