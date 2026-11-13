// 서비스가 지금 쓰는 테마(theme.css 첫 줄). 화면 설정의 미리보기가 여기서 시작한다
import { DEFAULT_THEME, type ThemeChoice } from '@terracelab/trellis-blocks/ui';
import { readThemeChoice } from '@terracelab/trellis-tokens/theme';
import css from './theme.css?raw';

export const CURRENT_THEME: ThemeChoice = readThemeChoice(css) ?? DEFAULT_THEME;
