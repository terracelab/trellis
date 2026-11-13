// 생성물 — 수정 금지. pnpm --filter @terracelab/trellis-tokens build
export type Theme = {
  readonly color: {
    readonly bg: {
      readonly canvas: string;
      readonly surface: string;
      readonly elevated: string;
      readonly sunken: string;
      readonly nav: string;
      readonly overlay: string;
      readonly rowSelected: string;
    };
    readonly nav: {
      readonly fg: string;
      readonly fgMuted: string;
      readonly fgActive: string;
      readonly hover: string;
      readonly selected: string;
      readonly border: string;
      readonly focus: string;
      readonly sub: string;
    };
    readonly avatar: {
      readonly "1": {
        readonly bg: string;
        readonly fg: string;
      };
      readonly "2": {
        readonly bg: string;
        readonly fg: string;
      };
      readonly "3": {
        readonly bg: string;
        readonly fg: string;
      };
      readonly "4": {
        readonly bg: string;
        readonly fg: string;
      };
      readonly "5": {
        readonly bg: string;
        readonly fg: string;
      };
      readonly "6": {
        readonly bg: string;
        readonly fg: string;
      };
    };
    readonly fg: {
      readonly primary: string;
      readonly secondary: string;
      readonly tertiary: string;
      readonly disabled: string;
      readonly inverse: string;
      readonly link: string;
      readonly strong: string;
    };
    readonly border: {
      readonly default: string;
      readonly strong: string;
      readonly focus: string;
      readonly selected: string;
      readonly divider: string;
      readonly focusStrong: string;
      readonly hover: string;
    };
    readonly brand: {
      readonly default: string;
      readonly hover: string;
      readonly active: string;
      readonly subtle: string;
      readonly onBrand: string;
      readonly tint: string;
      readonly accent: string;
    };
    readonly status: {
      readonly info: {
        readonly default: string;
        readonly subtle: string;
        readonly on: string;
      };
      readonly success: {
        readonly default: string;
        readonly subtle: string;
        readonly on: string;
      };
      readonly warning: {
        readonly default: string;
        readonly subtle: string;
        readonly on: string;
      };
      readonly danger: {
        readonly default: string;
        readonly subtle: string;
        readonly on: string;
      };
    };
    readonly finance: {
      readonly income: string;
      readonly expense: string;
      readonly neutral: string;
    };
    readonly approval: {
      readonly draft: {
        readonly default: string;
        readonly subtle: string;
        readonly text: string;
      };
      readonly pending: {
        readonly default: string;
        readonly subtle: string;
        readonly text: string;
      };
      readonly approved: {
        readonly default: string;
        readonly subtle: string;
        readonly text: string;
      };
      readonly rejected: {
        readonly default: string;
        readonly subtle: string;
        readonly text: string;
      };
      readonly withdrawn: {
        readonly default: string;
        readonly subtle: string;
        readonly text: string;
      };
    };
    readonly module: {
      readonly erp: {
        readonly default: string;
        readonly subtle: string;
        readonly gradientFrom: string;
        readonly gradientTo: string;
      };
      readonly groupware: {
        readonly default: string;
        readonly subtle: string;
        readonly gradientFrom: string;
        readonly gradientTo: string;
      };
      readonly ecm: {
        readonly default: string;
        readonly subtle: string;
        readonly gradientFrom: string;
        readonly gradientTo: string;
      };
      readonly crm: {
        readonly default: string;
        readonly subtle: string;
        readonly gradientFrom: string;
        readonly gradientTo: string;
      };
      readonly scm: {
        readonly default: string;
        readonly subtle: string;
        readonly gradientFrom: string;
        readonly gradientTo: string;
      };
      readonly commerce: {
        readonly default: string;
        readonly subtle: string;
        readonly gradientFrom: string;
        readonly gradientTo: string;
      };
      readonly mes: {
        readonly default: string;
        readonly subtle: string;
        readonly gradientFrom: string;
        readonly gradientTo: string;
      };
      readonly onTile: string;
    };
    readonly chart: {
      readonly series: {
        readonly "1": string;
        readonly "2": string;
        readonly "3": string;
        readonly "4": string;
        readonly "5": string;
      };
      readonly compare: string;
      readonly grid: string;
      readonly axis: string;
      readonly track: string;
      readonly heat: {
        readonly "1": string;
        readonly "2": string;
        readonly "3": string;
        readonly "4": string;
        readonly "5": string;
      };
      readonly heatInk: string;
    };
  };
};
export type ThemeName = 'light' | 'dark';
export declare const themes: { readonly light: Theme; readonly dark: Theme };

export type Density = {
  readonly row: {
    readonly height: number;
    readonly heightTall: number;
  };
  readonly control: {
    readonly height: {
      readonly xs: number;
      readonly sm: number;
      readonly md: number;
      readonly lg: number;
      readonly xl: number;
    };
  };
  readonly card: {
    readonly padding: number;
  };
  readonly body: {
    readonly fontSize: number;
    readonly lineHeight: number;
  };
  readonly input: {
    readonly fontSize: number;
  };
  readonly gutter: number;
};
export type DensityName = 'compact' | 'comfortable' | 'touch';
export declare const density: {
  readonly compact: Density;
  readonly comfortable: Density;
  readonly touch: Density;
};

/** 단위 없는 숫자. font.letterSpacing은 em 배율이다. */
export declare const primitives: {
  readonly border: {
    readonly width: {
      readonly "1": 1;
      readonly "2": 2;
      readonly "3": 3;
    };
  };
  readonly breakpoint: {
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
    readonly "2xl": 1536;
  };
  readonly color: {
    readonly alpha: {
      readonly black: {
        readonly "40": "#00000066";
        readonly "48": "#0000007A";
        readonly "60": "#00000099";
        readonly "64": "#000000A3";
      };
      readonly blue: {
        readonly "16": "#5F91FF29";
      };
      readonly neutral: {
        readonly "16": "#9CA3AF29";
      };
      readonly red: {
        readonly "16": "#F6727029";
      };
      readonly green: {
        readonly "16": "#5AB57729";
      };
      readonly amber: {
        readonly "16": "#FBB85C29";
      };
      readonly violet: {
        readonly "16": "#9486FF29";
      };
      readonly teal: {
        readonly "16": "#5AB8B829";
      };
      readonly brand: {
        readonly "8": "#FF886714";
        readonly "16": "#FF886729";
        readonly "24": "#FF88673D";
      };
    };
    readonly brand: {
      readonly "50": "#FFF2EE";
      readonly "100": "#FFE4DC";
      readonly "200": "#FFD0C3";
      readonly "300": "#FFB39D";
      readonly "400": "#FF8867";
      readonly "500": "#FE5C2B";
      readonly "600": "#CC3A00";
      readonly "700": "#A22C00";
      readonly "800": "#7A1F00";
      readonly "900": "#541200";
      readonly "950": "#2E0600";
    };
    readonly shell: {
      readonly "100": "#EAE1DE";
      readonly "300": "#BDB4B2";
      readonly "600": "#5B5351";
      readonly "700": "#4A4341";
      readonly "750": "#423A38";
      readonly "800": "#3A3331";
      readonly "850": "#352E2C";
      readonly "900": "#332C2A";
      readonly "925": "#2B2422";
      readonly "950": "#251E1D";
    };
    readonly cvd: {
      readonly vermilion: "#D55E00";
      readonly blue: "#0072B2";
      readonly orange: "#E69F00";
      readonly sky: "#56B4E9";
      readonly purple: "#CC79A7";
      readonly gray: "#8B929C";
      readonly dark: {
        readonly vermilion: "#D97324";
        readonly blue: "#006A9F";
        readonly orange: "#B68B13";
        readonly sky: "#339DD0";
        readonly purple: "#C473A6";
        readonly gray: "#9A9A9A";
      };
    };
    readonly base: {
      readonly white: "#FFFFFF";
      readonly black: "#000000";
    };
    readonly blue: {
      readonly "50": "#F0F5FF";
      readonly "100": "#DBE7FF";
      readonly "200": "#BFD4FF";
      readonly "300": "#94B8FF";
      readonly "400": "#5F91FF";
      readonly "500": "#2F6BFF";
      readonly "600": "#1F56E2";
      readonly "700": "#1141BE";
      readonly "800": "#082E96";
      readonly "900": "#031D6E";
      readonly "950": "#000B46";
    };
    readonly neutral: {
      readonly "50": "#F7F7F8";
      readonly "100": "#F3F4F6";
      readonly "200": "#E5E7EB";
      readonly "300": "#D1D5DB";
      readonly "400": "#9CA3AF";
      readonly "500": "#646B78";
      readonly "600": "#4B5563";
      readonly "700": "#374151";
      readonly "800": "#1F2937";
      readonly "900": "#111827";
      readonly "950": "#030712";
    };
    readonly graphite: {
      readonly "50": "#F2F2F2";
      readonly "100": "#DCDCDC";
      readonly "200": "#A6A6A6";
      readonly "300": "#9A9A9A";
      readonly "400": "#6E6E73";
      readonly "500": "#4A4A4E";
      readonly "600": "#3A3A3D";
      readonly "700": "#2C2C2F";
      readonly "800": "#232326";
      readonly "900": "#1C1C1E";
      readonly "950": "#141414";
    };
    readonly red: {
      readonly "50": "#FFF2F0";
      readonly "100": "#FFE0DE";
      readonly "200": "#FFC8C4";
      readonly "300": "#FFA29D";
      readonly "400": "#F67270";
      readonly "500": "#E5484D";
      readonly "600": "#C7313A";
      readonly "700": "#A31A27";
      readonly "800": "#7E0818";
      readonly "900": "#59000C";
      readonly "950": "#320004";
    };
    readonly green: {
      readonly "50": "#EEF8F0";
      readonly "100": "#DAEEDF";
      readonly "200": "#BBE2C5";
      readonly "300": "#91CFA1";
      readonly "400": "#5AB577";
      readonly "500": "#1F9D55";
      readonly "600": "#008543";
      readonly "700": "#006934";
      readonly "800": "#004F25";
      readonly "900": "#003617";
      readonly "950": "#001C09";
    };
    readonly amber: {
      readonly "50": "#FCF4EA";
      readonly "100": "#FCEBD8";
      readonly "200": "#FEDFBA";
      readonly "300": "#FFCE91";
      readonly "400": "#FBB85C";
      readonly "500": "#F5A524";
      readonly "600": "#CD8600";
      readonly "700": "#9F6700";
      readonly "800": "#734A00";
      readonly "900": "#4A2E00";
      readonly "950": "#221200";
    };
    readonly violet: {
      readonly "50": "#F4F4FF";
      readonly "100": "#E5E5FF";
      readonly "200": "#D1D0FF";
      readonly "300": "#B5B1FF";
      readonly "400": "#9486FF";
      readonly "500": "#7C5CFF";
      readonly "600": "#6846E1";
      readonly "700": "#5331BC";
      readonly "800": "#3F2094";
      readonly "900": "#2B116C";
      readonly "950": "#170244";
    };
    readonly teal: {
      readonly "50": "#EDF7F7";
      readonly "100": "#DAEEEE";
      readonly "200": "#BCE3E2";
      readonly "300": "#92D0D0";
      readonly "400": "#5AB8B8";
      readonly "500": "#1BA3A3";
      readonly "600": "#008989";
      readonly "700": "#006B6B";
      readonly "800": "#005050";
      readonly "900": "#003535";
      readonly "950": "#001B1B";
    };
  };
  readonly font: {
    readonly family: {
      readonly sans: "Pretendard Variable";
      readonly mono: "ui-monospace";
    };
    readonly weight: {
      readonly "400": "400";
      readonly "500": "500";
      readonly "600": "600";
      readonly "700": "700";
    };
    readonly numeric: "tabular-nums";
    readonly letterSpacing: {
      readonly tight: -0.01;
      readonly normal: 0;
    };
  };
  readonly layout: {
    readonly globalBar: {
      readonly height: 48;
    };
    readonly sidebar: {
      readonly width: 240;
      readonly collapsedWidth: 64;
    };
    readonly content: {
      readonly maxWidth: 1440;
      readonly maxWidthWide: 1600;
    };
    readonly gutter: {
      readonly default: 24;
      readonly compact: 16;
    };
    readonly desktop: {
      readonly minWidth: 1024;
    };
    readonly wide: {
      readonly minWidth: 1920;
    };
  };
  readonly duration: {
    readonly "100": 100;
    readonly "150": 150;
    readonly "200": 200;
    readonly "300": 300;
    readonly fast: 100;
    readonly normal: 150;
    readonly slow: 200;
    readonly slower: 300;
    readonly spin: 900;
    readonly pulse: 1500;
    readonly essential: 900;
  };
  readonly easing: {
    readonly standard: readonly [0.2, 0, 0, 1];
    readonly decelerate: readonly [0, 0, 0, 1];
    readonly accelerate: readonly [0.3, 0, 1, 1];
    readonly enter: readonly [0, 0, 0, 1];
    readonly exit: readonly [0.3, 0, 1, 1];
  };
  readonly radius: {
    readonly xs: 4;
    readonly sm: 6;
    readonly md: 8;
    readonly lg: 12;
    readonly xl: 16;
    readonly full: 9999;
  };
  readonly shadow: {
    readonly sm: {
      readonly shadowColor: "#000000";
      readonly shadowOffset: {
        readonly width: 0;
        readonly height: 1;
      };
      readonly shadowOpacity: 0.059;
      readonly shadowRadius: 1.5;
      readonly elevation: 2;
    };
    readonly md: {
      readonly shadowColor: "#000000";
      readonly shadowOffset: {
        readonly width: 0;
        readonly height: 4;
      };
      readonly shadowOpacity: 0.078;
      readonly shadowRadius: 6;
      readonly elevation: 6;
    };
    readonly lg: {
      readonly shadowColor: "#000000";
      readonly shadowOffset: {
        readonly width: 0;
        readonly height: 8;
      };
      readonly shadowOpacity: 0.102;
      readonly shadowRadius: 12;
      readonly elevation: 12;
    };
  };
  readonly size: {
    readonly icon: {
      readonly "16": 16;
      readonly "20": 20;
      readonly "24": 24;
    };
    readonly moduleIcon: {
      readonly "32": 32;
      readonly "40": 40;
      readonly "48": 48;
    };
    readonly avatar: {
      readonly "24": 24;
      readonly "32": 32;
      readonly "40": 40;
      readonly "48": 48;
    };
    readonly touch: {
      readonly min: 44;
      readonly control: 48;
      readonly main: 56;
    };
  };
  readonly space: {
    readonly "0": 0;
    readonly "2": 2;
    readonly "4": 4;
    readonly "6": 6;
    readonly "8": 8;
    readonly "10": 10;
    readonly "12": 12;
    readonly "14": 14;
    readonly "16": 16;
    readonly "18": 18;
    readonly "20": 20;
    readonly "24": 24;
    readonly "28": 28;
    readonly "32": 32;
    readonly "40": 40;
    readonly "48": 48;
    readonly "64": 64;
  };
  readonly z: {
    readonly base: 0;
    readonly sticky: 100;
    readonly dropdown: 450;
    readonly overlay: 300;
    readonly modal: 400;
    readonly toast: 500;
  };
};

export interface TextStyle {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: '400' | '500' | '600' | '700';
  readonly letterSpacing: number;
}
export type TypographyName = "display" | "h1" | "h2" | "h3" | "h4" | "body" | "label" | "caption" | "micro" | "mono" | "amount" | "amountLg";
export declare const typography: { readonly [K in TypographyName]: TextStyle };

/** 종이 서식(테마와 무관). 크기 · 여백은 mm × 96 / 25.4, 글자(type)는 pt × 96 / 72 */
export declare const paper: {
  readonly bg: "#FFFFFF";
  readonly fg: "#000000";
  readonly muted: "#4B5563";
  readonly line: "#646B78";
  readonly lineStrong: "#030712";
  readonly fill: "#E5E7EB";
  readonly shadow: {
    readonly shadowColor: "#000000";
    readonly shadowOffset: {
      readonly width: 0;
      readonly height: 4;
    };
    readonly shadowOpacity: 0.078;
    readonly shadowRadius: 6;
    readonly elevation: 6;
  };
  readonly size: {
    readonly a4: {
      readonly width: 793.7;
      readonly height: 1122.52;
    };
    readonly a5: {
      readonly width: 559.37;
      readonly height: 793.7;
    };
  };
  readonly margin: {
    readonly sm: 45.35;
    readonly md: 68.03;
  };
  readonly type: {
    readonly display: {
      readonly fontSize: 28;
      readonly lineHeight: 36;
    };
    readonly h1: {
      readonly fontSize: 24;
      readonly lineHeight: 32;
    };
    readonly h2: {
      readonly fontSize: 20;
      readonly lineHeight: 28;
    };
    readonly h3: {
      readonly fontSize: 16;
      readonly lineHeight: 24;
    };
    readonly body: {
      readonly fontSize: 14;
      readonly lineHeight: 20;
    };
    readonly label: {
      readonly fontSize: 13;
      readonly lineHeight: 18;
    };
    readonly caption: {
      readonly fontSize: 12;
      readonly lineHeight: 16;
    };
  };
};
