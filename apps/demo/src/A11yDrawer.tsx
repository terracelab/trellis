// 데모 접근성 설정: 글자 크기 · 고대비 · 포커스 · 링크 밑줄 · 차트 색 · 움직임(TrellisProvider 접근성 모드, D-97)
import { Button, Drawer, SegmentedControl, Switch } from '@terracelab/trellis-react';
import { A11Y_DEFAULT, type A11ySettings } from './settings.js';

const SCALE_OPTIONS = [
  { value: '100', label: '100%' },
  { value: '112', label: '112%' },
  { value: '125', label: '125%' },
] as const;

export function A11yDrawer({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: A11ySettings;
  onChange: (next: A11ySettings) => void;
}) {
  const set = <K extends keyof A11ySettings>(key: K, v: A11ySettings[K]) =>
    onChange({ ...value, [key]: v });
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="접근성"
      description="글자 크기 · 대비 · 움직임을 화면 전체에 적용합니다. 설정은 이 브라우저에 남습니다"
      width="md"
      footer={
        <Button variant="ghost" onPress={() => onChange(A11Y_DEFAULT)}>
          기본으로
        </Button>
      }
    >
      <div className="tl-demo-a11y">
        <div className="tl-demo-a11y__scale">
          <span className="tl-demo-a11y__label">글자 크기</span>
          <SegmentedControl
            label="글자 크기"
            options={SCALE_OPTIONS}
            value={value.fontScale}
            onChange={(v) => set('fontScale', v as A11ySettings['fontScale'])}
            fullWidth
          />
          <p className="tl-demo-a11y__hint">
            글자와 함께 단추 · 입력 칸 · 표 줄 높이가 같이 커집니다
          </p>
        </div>
        <Switch
          checked={value.contrast}
          onChange={(v) => set('contrast', v)}
          description="글자 대비 7:1, 선 대비 4.5:1로 올립니다"
        >
          고대비
        </Switch>
        <Switch
          checked={value.focusRing}
          onChange={(v) => set('focusRing', v)}
          description="키보드로 옮길 때 지금 자리를 굵은 링으로 보입니다"
        >
          포커스 강조
        </Switch>
        <Switch
          checked={value.linkUnderline}
          onChange={(v) => set('linkUnderline', v)}
          description="링크를 색만으로 구분하지 않습니다"
        >
          링크 밑줄 항상
        </Switch>
        <Switch
          checked={value.chartPalette}
          onChange={(v) => set('chartPalette', v)}
          description="차트 계열을 색각 보정 색으로 바꿉니다"
        >
          색각 보정 차트
        </Switch>
        <Switch
          checked={value.motion}
          onChange={(v) => set('motion', v)}
          description="화면 전환과 펼침 움직임을 멈춥니다. 불러오는 표시는 계속 돕니다"
        >
          움직임 줄이기
        </Switch>
      </div>
    </Drawer>
  );
}
