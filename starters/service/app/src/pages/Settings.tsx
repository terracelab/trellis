// 화면 설정: 테마 · 밀도 · 브랜드 색 미리보기. 브랜드 색 확정은 pnpm ds:theme이 theme.css로 만든다
import {
  Page,
  Stack,
  ThemeChips,
  themeCommand,
  useThemeChoice,
} from '@terracelab/trellis-blocks/ui';
import { Button, Card, Field, PageHeader, SegmentedControl } from '@terracelab/trellis-react';
import { CURRENT_THEME } from '../theme-current.js';
import { useDensity, useTheme } from '../view.js';

export function Settings() {
  const [theme, setTheme] = useTheme();
  const [density, setDensity] = useDensity();
  const { choice, setChoice, reset } = useThemeChoice('brand-preview', CURRENT_THEME);
  return (
    <Page
      width="form"
      header={<PageHeader title="화면 설정" description="이 브라우저에만 저장합니다" />}
    >
      <Stack>
        <Card title="보기">
          <Stack>
            <Field label="테마">
              <SegmentedControl
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'light', label: '라이트' },
                  { value: 'dark', label: '다크' },
                ]}
              />
            </Field>
            <Field label="밀도" help="촘촘하게가 기본입니다. 넓게는 행과 여백이 커집니다">
              <SegmentedControl
                value={density}
                onChange={setDensity}
                options={[
                  { value: 'compact', label: '촘촘하게' },
                  { value: 'comfortable', label: '넓게' },
                ]}
              />
            </Field>
          </Stack>
        </Card>
        <Card
          title="브랜드 색 미리보기"
          subtitle={`확정: ${themeCommand(choice)}`}
          action={
            <Button size="sm" variant="ghost" onPress={reset}>
              지금 테마로
            </Button>
          }
        >
          <ThemeChips value={choice} onChange={setChoice} />
        </Card>
      </Stack>
    </Page>
  );
}
