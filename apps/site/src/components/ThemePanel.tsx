// 회사 테마 고르기: 컬러칩 · 직접 고른 색 · 회색 톤을 사이트 전체에 바로 입힌다.
// 값은 전부 엔진(@terracelab/trellis-tokens/theme)이 낸다. 컬러칩은 presets.css의 범위 CSS(<html data-brand>),
// 직접 고른 색은 themeCss 결과([data-brand='custom'] 범위)를 scripts/theme.ts의 setBrand('custom', { css })로 넣는다.
// 지금 고른 값은 따로 저장하지 않는다: <html data-brand>와 넣어 둔 CSS 첫 줄(trellis-theme {...})에서 다시 읽는다.
import { Button, Field, Icon, Input, SegmentedControl } from '@terracelab/trellis-react';
import {
  NEUTRAL_TONES,
  THEME_PRESETS,
  createTheme,
  normalizeHex,
  readThemeChoice,
  themeCss,
  type ButtonTextRule,
  type NeutralTone,
  type ThemeWarning,
} from '@terracelab/trellis-tokens/theme';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Choice {
  brand: string;
  neutral: NeutralTone;
  buttonText: ButtonTextRule;
}

const FIRST = THEME_PRESETS[0]!;
const DEFAULT: Choice = { brand: FIRST.brand, neutral: FIRST.neutral, buttonText: 'white' };
const STYLE_ID = 'tl-theme-preview';
// 직접 고른 색도 컬러칩처럼 범위 CSS로 만든다. 선택자가 겹쳐 있어 tokens.css보다 앞에 놓여도 이긴다
// (새로 고침 때 Base가 이 CSS를 <head> 중간, 토큰 스타일시트보다 앞에 되살린다)
const CUSTOM_SCOPE = "[data-brand='custom']";
const MODE_LABEL = { light: '라이트', dark: '다크' } as const;
const BUTTON_TEXT = [
  { value: 'white', label: '흰 글자 우선' },
  { value: 'input', label: '입력 색 바탕' },
] as const;

const sameHex = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();
const presetOf = (c: Choice) =>
  c.buttonText === 'white'
    ? THEME_PRESETS.find((p) => sameHex(p.brand, c.brand) && p.neutral === c.neutral)
    : undefined;

const hexOrNull = (text: string) => {
  try {
    return normalizeHex(text);
  } catch {
    return null;
  }
};

/** 지금 페이지에 입혀진 테마를 읽는다: 컬러칩 id 또는 넣어 둔 CSS 첫 줄 */
function readChoice(): Choice {
  const id = document.documentElement.dataset['brand'] ?? FIRST.id;
  const preset = THEME_PRESETS.find((p) => p.id === id);
  if (preset) return { brand: preset.brand, neutral: preset.neutral, buttonText: 'white' };
  const saved = readThemeChoice(document.getElementById(STYLE_ID)?.textContent);
  const brand = saved ? hexOrNull(saved.brand) : null;
  if (!saved || !brand) return DEFAULT;
  return { brand, neutral: saved.neutral, buttonText: saved.buttonText ?? 'white' };
}

/** 서비스 저장소에서 같은 테마를 theme.css로 남기는 명령(docs/guides/theme.md) */
export function themeCommand(c: Choice): string {
  const preset = presetOf(c);
  if (preset) return `pnpm ds:theme --preset ${preset.id}`;
  const rule = c.buttonText === 'input' ? ' --button-text input' : '';
  return `pnpm ds:theme --brand "${c.brand.toUpperCase()}" --neutral ${c.neutral}${rule}`;
}

/** 같은 색 · 같은 고정 색의 경고는 한 줄로(위험과 수입은 같은 빨강이다) */
function groupWarnings(warnings: readonly ThemeWarning[]) {
  const rows = new Map<string, { first: ThemeWarning; labels: string[]; modes: Set<string> }>();
  for (const w of warnings) {
    const key = `${w.role}|${w.brand}|${w.fixed}`;
    const row = rows.get(key) ?? { first: w, labels: [], modes: new Set<string>() };
    if (!row.labels.includes(w.label)) row.labels.push(w.label);
    row.modes.add(MODE_LABEL[w.mode]);
    rows.set(key, row);
  }
  return [...rows.values()];
}

function Chip({ color }: { color: string }) {
  // 엔진이 계산한 값을 그대로 보여 주는 견본이라 style로 칠한다
  return <span className="tl-site-theme-dot" style={{ background: color }} aria-hidden="true" />;
}

export default function ThemePanel() {
  const [choice, setChoice] = useState<Choice>(DEFAULT);
  const [draft, setDraft] = useState(DEFAULT.brand);
  const [copied, setCopied] = useState(false);
  const api = useRef<typeof import('../scripts/theme') | null>(null);

  // 페이지에 이미 입혀진 테마로 맞추고, 다른 곳(컬러칩 클릭 · 화살표 키)에서 바뀌면 따라간다
  useEffect(() => {
    const sync = () => {
      const next = readChoice();
      setChoice(next);
      setDraft(next.brand);
      setCopied(false);
    };
    sync();
    void import('../scripts/theme').then((m) => (api.current = m));
    window.addEventListener('tl-site-brand', sync);
    return () => window.removeEventListener('tl-site-brand', sync);
  }, []);

  const theme = useMemo(() => createTheme(choice), [choice]);
  const preset = presetOf(choice);
  const command = themeCommand(choice);
  const failed = theme.checks.filter((c) => !c.pass);
  const warnings = useMemo(() => groupWarnings(theme.warnings), [theme]);
  const tone = NEUTRAL_TONES.find((t) => t.id === choice.neutral);
  const suggestion = theme.suggestions[0];
  // 입력 중(여섯 자리가 안 된 16진수)에는 오류를 띄우지 않는다
  const typed = draft.trim().replace(/^#/, '');
  const draftError =
    hexOrNull(draft) !== null || (typed.length < 6 && /^[0-9a-f]*$/i.test(typed))
      ? null
      : '#RRGGBB 형식으로 입력하세요';

  /** 고른 값을 입힌다. 컬러칩과 같으면 속성만, 아니면 계산한 CSS를 넣는다. 상태는 tl-site-brand 이벤트로 돌아온다 */
  const apply = async (next: Choice) => {
    const site = api.current ?? (await import('../scripts/theme'));
    api.current = site;
    const same = presetOf(next);
    if (same) site.setBrand(same.id);
    else site.setBrand('custom', { css: themeCss(createTheme(next), { scope: CUSTOM_SCOPE }) });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="tl-site-theme-controls">
      <section className="tl-site-theme-group" aria-labelledby="theme-presets-h">
        <h2 className="tl-site-theme-label" id="theme-presets-h">
          컬러칩
        </h2>
        <div className="tl-site-theme-presets" role="radiogroup" aria-labelledby="theme-presets-h">
          {THEME_PRESETS.map((p, i) => {
            const checked = preset?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked || (!preset && i === 0) ? 0 : -1}
                className="tl-site-theme-preset"
                data-brand={p.id}
                data-brand-pick={p.id}
              >
                <span className="tl-site-theme-chips" aria-hidden="true">
                  <i data-chip="accent" />
                  <i data-chip="default" />
                  <i data-chip="nav" />
                  <i data-chip="neutral" />
                </span>
                <span className="tl-site-theme-preset-name">{p.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Field
        label="회사 색"
        help="#RRGGBB. 대비가 모자라면 같은 색상에서 단계를 옮겨 맞춥니다"
        error={draftError}
      >
        <div className="tl-site-theme-color">
          <input
            type="color"
            className="tl-site-theme-well"
            aria-label="회사 색 고르기"
            value={choice.brand.toLowerCase()}
            onChange={(e) => {
              const brand = hexOrNull(e.target.value);
              if (brand) void apply({ ...choice, brand });
            }}
          />
          <Input
            value={draft}
            mono
            maxLength={7}
            autoComplete="off"
            onChange={(text) => {
              setDraft(text);
              const brand = hexOrNull(text);
              if (brand && !sameHex(brand, choice.brand)) void apply({ ...choice, brand });
            }}
          />
        </div>
      </Field>

      <Field label="회색 톤" help={tone?.description}>
        <SegmentedControl
          fullWidth
          value={choice.neutral}
          onChange={(neutral) => void apply({ ...choice, neutral: neutral as NeutralTone })}
          options={NEUTRAL_TONES.map((t) => ({ value: t.id, label: t.label }))}
        />
      </Field>

      {(suggestion || choice.buttonText === 'input') && (
        <Field
          label="주 버튼 글자"
          help={
            suggestion
              ? `흰 글자 규칙에서는 주 버튼이 ${suggestion.button}입니다. 입력 색 바탕은 ${suggestion.inputButton}에 짙은 글자이고 대비 검사를 모두 넘습니다`
              : '입력 색을 주 버튼 바탕으로 두고 대비를 넘는 글자 색을 고릅니다'
          }
        >
          <SegmentedControl
            fullWidth
            value={choice.buttonText}
            onChange={(rule) => void apply({ ...choice, buttonText: rule as ButtonTextRule })}
            options={BUTTON_TEXT}
          />
        </Field>
      )}

      <section className="tl-site-theme-group" aria-labelledby="theme-command-h">
        <h2 className="tl-site-theme-label" id="theme-command-h">
          서비스에 남기는 명령
        </h2>
        <code className="tl-site-theme-command" data-theme-command>
          {command}
        </code>
        <div className="tl-site-theme-copy">
          <Button size="sm" icon={copied ? 'check' : 'copy'} onPress={() => void copy()}>
            명령 복사
          </Button>
          <span role="status">{copied ? '복사했습니다' : ''}</span>
        </div>
      </section>

      <section className="tl-site-theme-group" aria-labelledby="theme-checks-h">
        <h2 className="tl-site-theme-label" id="theme-checks-h">
          검사 결과
        </h2>
        <div className="tl-site-theme-result" aria-live="polite" data-theme-result>
          <p className="tl-site-theme-row" data-tone={failed.length ? 'danger' : 'success'}>
            <Icon name={failed.length ? 'circle-x' : 'circle-check'} size={16} />
            <span>
              {failed.length
                ? `대비 검사 ${theme.checks.length}건 가운데 ${failed.length}건이 기준에 못 미칩니다`
                : `대비 검사 ${theme.checks.length}건 통과`}
            </span>
          </p>
          {warnings.map(({ first: w, labels, modes }) => (
            <div
              className="tl-site-theme-row"
              data-tone="warning"
              key={`${w.role}${w.brand}${w.fixed}`}
            >
              <Icon name="triangle-alert" size={16} />
              <div className="tl-site-theme-warning">
                <span>
                  {labels.join(' · ')} 색과 가깝습니다({[...modes].join(' · ')})
                </span>
                <span className="tl-site-theme-detail">
                  <Chip color={w.brand} />
                  {w.role} {w.brand}
                  <Chip color={w.fixed} />
                  {labels[0]} {w.fixed} · ΔEOK {w.deltaE.toFixed(1)}
                </span>
                {w.alternatives.length > 0 && (
                  <span className="tl-site-theme-alternatives">
                    대안 색
                    {w.alternatives.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className="tl-site-theme-alternative"
                        onClick={() => void apply({ ...choice, brand: hex })}
                      >
                        <Chip color={hex} />
                        {hex}
                      </button>
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {warnings.length > 0 && (
          <p className="tl-site-theme-hint">
            상태와 금액은 색만으로 보이지 않습니다. 배지는 글자, 증감은 부호와 화살표가 함께 있어
            그대로 써도 됩니다.
          </p>
        )}
        {theme.notes.length > 0 && (
          <details className="tl-site-theme-notes">
            <summary>단계를 옮긴 이유 {theme.notes.length}건</summary>
            <ul>
              {theme.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
