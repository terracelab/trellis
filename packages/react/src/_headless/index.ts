// headless 라이브러리의 유일한 import 지점(D1 · components.md §8). Base UI가 바뀌면 이 파일만 바뀐다.
// 패키지 이름은 1.0 뒤 @base-ui-components/react → @base-ui/react로 바뀌었다(D-52).
export { Checkbox } from '@base-ui/react/checkbox';
export { Combobox } from '@base-ui/react/combobox';
export { Dialog } from '@base-ui/react/dialog';
// 우리 Drawer 컴포넌트와 이름이 겹쳐 BaseDrawer로 내보낸다(좁은 화면 시트, _internal/sheet.tsx)
export { Drawer as BaseDrawer } from '@base-ui/react/drawer';
export { Menu } from '@base-ui/react/menu';
export { NumberField } from '@base-ui/react/number-field';
export { Popover } from '@base-ui/react/popover';
export { Progress } from '@base-ui/react/progress';
export { Radio } from '@base-ui/react/radio';
export { RadioGroup } from '@base-ui/react/radio-group';
export { Select } from '@base-ui/react/select';
export { Switch } from '@base-ui/react/switch';
export { Tabs } from '@base-ui/react/tabs';
export { Toast } from '@base-ui/react/toast';
export { Tooltip } from '@base-ui/react/tooltip';
// 우클릭 · 길게 누르기 메뉴(ContextMenu 컴포넌트). Menu와 같은 부품을 쓰고 영역(Trigger)만 다르다
export { ContextMenu } from '@base-ui/react/context-menu';
