// 데모 테마: 컬러칩으로 고객사 색을 입혀 본다. 서비스에서 확정하는 명령도 보여 준다(D-58)
import { ThemeChips, themeCommand, type ThemeChoice } from '@terracelab/trellis-blocks/ui';
import { Button, Drawer, useToast } from '@terracelab/trellis-react';

export function ThemeDrawer({
  open,
  onOpenChange,
  value,
  onChange,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ThemeChoice;
  onChange: (next: ThemeChoice) => void;
  onReset: () => void;
}) {
  const toast = useToast();
  const command = themeCommand(value);
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="테마 색"
      description="고객사 브랜드 색과 회색 톤을 골라 화면 전체에 입혀 봅니다. 상태 · 수입 · 지출 · 결재 색은 바뀌지 않습니다"
      width="md"
      footer={
        <>
          <Button variant="ghost" onPress={onReset}>
            기본으로
          </Button>
          <Button
            icon="copy"
            onPress={() => {
              void navigator.clipboard?.writeText(command);
              toast.show({ title: '명령을 복사했습니다', description: command, tone: 'neutral' });
            }}
          >
            확정 명령 복사
          </Button>
        </>
      }
    >
      <div className="tl-demo-theme">
        <ThemeChips value={value} onChange={onChange} />
        <p className="tl-demo-theme__command">
          서비스에서 확정: <code>{command}</code>
        </p>
      </div>
    </Drawer>
  );
}
