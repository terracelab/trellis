// 테마 미리 보기의 폼 견본. 미리 보기에서 이 카드만 눌러 볼 수 있다(페이지에서 client:load로 켠다):
// 포커스 링 · 가리킴 · 누름 · 선택처럼 손을 대야 보이는 회사 색을 확인하는 자리다.
import {
  Button,
  Card,
  Checkbox,
  Field,
  FormSection,
  Input,
  Select,
  Switch,
} from '@terracelab/trellis-react';

const TAX_KINDS = [
  { value: 'tax', label: '과세' },
  { value: 'zero', label: '영세율' },
  { value: 'free', label: '면세' },
];

export default function ThemeForm() {
  return (
    <Card
      title="세금계산서 발행"
      subtitle="눌러 볼 수 있는 견본입니다. 포커스 링과 주 버튼이 회사 색을 따릅니다"
      headingLevel={3}
      footer={
        <div className="tl-site-theme-actions">
          <Button variant="ghost">취소</Button>
          <Button>임시 저장</Button>
          <Button variant="primary">발행</Button>
        </div>
      }
    >
      <div className="tl-site-theme-form">
        <FormSection columns={2}>
          <Field label="공급받는 자" required>
            <Input defaultValue="(주)한빛무역" />
          </Field>
          <Field label="과세 구분">
            <Select options={TAX_KINDS} defaultValue="tax" width="full" />
          </Field>
          <Field label="공급가액" help="단위: 원">
            <Input align="right" inputMode="numeric" defaultValue="12,400,000" />
          </Field>
          <Field label="작성일">
            <Input defaultValue="2026-11-06" />
          </Field>
        </FormSection>
        <div className="tl-site-theme-options">
          <Checkbox defaultChecked>거래처 담당자에게 메일 발송</Checkbox>
          <Switch defaultChecked>매월 25일 자동 발행</Switch>
        </div>
      </div>
    </Card>
  );
}
