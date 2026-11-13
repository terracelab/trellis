// gen-color-scale.mjs 의 타입 선언. 테스트가 생성기를 직접 불러 쓰기 위해 둔다.

export type Step = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export interface HueConfig {
  base: string;
  anchors?: Partial<Record<`${Step}`, string>>;
}

export interface ScaleConfig {
  steps: Step[];
  lightness: {
    lightEnd: number;
    darkEnd: number;
    towardLight: Record<string, number>;
    towardDark: Record<string, number>;
  };
  chroma: Record<string, number>;
  base: { white: string; black: string };
  hues: Record<string, HueConfig>;
}

export interface ColorToken {
  $value: string;
  $type: 'color';
  $description?: string;
}

export interface ColorTree {
  color: { $description: string; base: { white: ColorToken; black: ColorToken } } & Record<
    string,
    Record<string, ColorToken> | string
  >;
}

export const CONFIG_PATH: string;
export const OUTPUT_PATH: string;
export function readConfig(path?: string): ScaleConfig;
export function generateColorScale(config: ScaleConfig): ColorTree;
export function serialize(tree: ColorTree): string;
