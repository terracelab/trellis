// 테마 컬러칩: 브랜드 색 · 회색 톤을 골라 화면에 바로 입힌다(D-58). 데모 · 서비스 설정 화면이 같이 쓴다.
// 정식 컴포넌트 후보(ThemePicker). 확정은 pnpm ds:theme이 theme.css로 만든다.
import { Field, Input, SegmentedControl, SelectableCard } from '@terracelab/trellis-react';
import {
  NEUTRAL_TONES,
  THEME_PRESETS,
  createTheme,
  themeCss,
  type NeutralTone,
} from '@terracelab/trellis-tokens/theme';
import { useEffect, useMemo, useState } from 'react';

export interface ThemeChoice {
  brand: string;
  neutral: NeutralTone;
}

export const DEFAULT_THEME: ThemeChoice = {
  brand: THEME_PRESETS[0]!.brand,
  neutral: THEME_PRESETS[0]!.neutral,
};

const STYLE_ID = 'tl-theme-preview';

/**
 * 고른 테마를 <head> 끝 style로 입힌다. base(앱의 theme.css 값)와 같으면 지운다. 저장 키가 있으면 기억한다
 * @param base 앱이 지금 쓰는 테마. 서비스는 readThemeChoice(theme.css 내용)로 읽어 넘긴다
 */
export function useThemeChoice(storageKey?: string, base: ThemeChoice = DEFAULT_THEME) {
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    if (!storageKey) return base;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as ThemeChoice) : base;
    } catch {
      return base;
    }
  });
  const theme = useMemo(() => createTheme(choice), [choice]);
  useEffect(() => {
    const isDefault =
      choice.brand.toUpperCase() === base.brand.toUpperCase() && choice.neutral === base.neutral;
    let el = document.getElementById(STYLE_ID);
    if (isDefault) el?.remove();
    else {
      if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ID;
      }
      el.textContent = themeCss(theme);
      document.head.appendChild(el);
    }
    if (storageKey)
      try {
        localStorage.setItem(storageKey, JSON.stringify(choice));
      } catch {
        /* 저장소를 못 쓰면 이번 방문만 */
      }
  }, [theme, choice, storageKey, base.brand, base.neutral]);
  return { choice, setChoice, reset: () => setChoice(base), theme } as const;
}

/** 고른 조합을 확정하는 명령 */
export function themeCommand(choice: ThemeChoice): string {
  const preset = THEME_PRESETS.find(
    (p) => p.brand.toUpperCase() === choice.brand.toUpperCase() && p.neutral === choice.neutral,
  );
  return preset
    ? `pnpm ds:theme --preset ${preset.id}`
    : `pnpm ds:theme --brand "${choice.brand.toUpperCase()}" --neutral ${choice.neutral}`;
}

export function ThemeChips({
  value,
  onChange,
}: {
  value: ThemeChoice;
  onChange: (next: ThemeChoice) => void;
}) {
  const [draft, setDraft] = useState(value.brand);
  useEffect(() => setDraft(value.brand), [value.brand]);
  const valid = /^#?[0-9a-f]{6}$/i.test(draft.trim());
  const swatches = useMemo(
    () =>
      THEME_PRESETS.map((p) => ({
        ...p,
        swatch: createTheme(p).light['--tl-color-brand-default'] ?? p.brand,
      })),
    [],
  );
  return (
    <div className="tl-block-theme">
      <SelectableCard
        label="컬러칩"
        value={
          swatches.find(
            (p) =>
              p.brand.toUpperCase() === value.brand.toUpperCase() && p.neutral === value.neutral,
          )?.id ?? null
        }
        onChange={(id) => {
          const p = swatches.find((x) => x.id === id);
          if (p) onChange({ brand: p.brand, neutral: p.neutral });
        }}
        options={swatches.map((p) => ({
          value: p.id,
          title: p.label,
          description: NEUTRAL_TONES.find((t) => t.id === p.neutral)?.label,
          // 색 견본은 고른 조합에서 계산한 값이라 style로 칠한다(토큰 값을 보여 주는 자리)
          icon: (
            <span className="tl-block-theme__swatch" style={{ background: p.swatch }} aria-hidden />
          ),
        }))}
      />
      <Field label="회색 톤" help={NEUTRAL_TONES.find((t) => t.id === value.neutral)?.description}>
        <SegmentedControl
          value={value.neutral}
          onChange={(neutral) => onChange({ ...value, neutral: neutral as NeutralTone })}
          options={NEUTRAL_TONES.map((t) => ({ value: t.id, label: t.label }))}
        />
      </Field>
      <Field
        label="브랜드 색 직접 입력"
        help="#RRGGBB. 대비가 모자라면 단계를 옮겨 맞춥니다"
        error={valid ? null : '#RRGGBB 형식으로 입력하세요'}
      >
        <Input
          value={draft}
          onChange={(v) => {
            setDraft(v);
            if (/^#?[0-9a-f]{6}$/i.test(v.trim()))
              onChange({ ...value, brand: v.trim().startsWith('#') ? v.trim() : `#${v.trim()}` });
          }}
          size="sm"
        />
      </Field>
    </div>
  );
}
