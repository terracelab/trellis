// 생성물 — 수정 금지. pnpm --filter @terracelab/trellis-tokens build
export const themes = {
  light: {
    color: {
      bg: {
        canvas: "#F3F4F6",
        surface: "#FFFFFF",
        elevated: "#FFFFFF",
        sunken: "#F7F7F8",
        nav: "#3A3331",
        overlay: "#00000066",
        rowSelected: "#FF886714",
      },
      nav: {
        fg: "#EAE1DE",
        fgMuted: "#BDB4B2",
        fgActive: "#FFFFFF",
        hover: "#423A38",
        selected: "#4A4341",
        border: "#423A38",
        focus: "#FE5C2B",
        sub: "#352E2C",
      },
      avatar: {
        "1": {
          bg: "#DBE7FF",
          fg: "#1141BE",
        },
        "2": {
          bg: "#DAEEDF",
          fg: "#006934",
        },
        "3": {
          bg: "#E5E5FF",
          fg: "#5331BC",
        },
        "4": {
          bg: "#DAEEEE",
          fg: "#006B6B",
        },
        "5": {
          bg: "#FCEBD8",
          fg: "#734A00",
        },
        "6": {
          bg: "#FFE0DE",
          fg: "#A31A27",
        },
      },
      fg: {
        primary: "#1F2937",
        secondary: "#374151",
        tertiary: "#646B78",
        disabled: "#9CA3AF",
        inverse: "#FFFFFF",
        link: "#CC3A00",
        strong: "#111827",
      },
      border: {
        default: "#E5E7EB",
        strong: "#D1D5DB",
        focus: "#CC3A00",
        selected: "#CC3A00",
        divider: "#E5E7EB",
        focusStrong: "#A22C00",
        hover: "#9CA3AF",
      },
      brand: {
        default: "#CC3A00",
        hover: "#A22C00",
        active: "#7A1F00",
        subtle: "#FFF2EE",
        onBrand: "#FFFFFF",
        tint: "#FFE4DC",
        accent: "#FE5C2B",
      },
      status: {
        info: {
          default: "#1F56E2",
          subtle: "#F0F5FF",
          on: "#FFFFFF",
        },
        success: {
          default: "#008543",
          subtle: "#EEF8F0",
          on: "#FFFFFF",
        },
        warning: {
          default: "#CD8600",
          subtle: "#FCF4EA",
          on: "#111827",
        },
        danger: {
          default: "#C7313A",
          subtle: "#FFF2F0",
          on: "#FFFFFF",
        },
      },
      finance: {
        income: "#C7313A",
        expense: "#1F56E2",
        neutral: "#4B5563",
      },
      approval: {
        draft: {
          default: "#646B78",
          subtle: "#F3F4F6",
          text: "#374151",
        },
        pending: {
          default: "#CD8600",
          subtle: "#FCF4EA",
          text: "#734A00",
        },
        approved: {
          default: "#008543",
          subtle: "#EEF8F0",
          text: "#006934",
        },
        rejected: {
          default: "#C7313A",
          subtle: "#FFF2F0",
          text: "#C7313A",
        },
        withdrawn: {
          default: "#9CA3AF",
          subtle: "#F3F4F6",
          text: "#4B5563",
        },
      },
      module: {
        erp: {
          default: "#2F6BFF",
          subtle: "#F0F5FF",
          gradientFrom: "#5F91FF",
          gradientTo: "#1F56E2",
        },
        groupware: {
          default: "#1F9D55",
          subtle: "#EEF8F0",
          gradientFrom: "#5AB577",
          gradientTo: "#008543",
        },
        ecm: {
          default: "#7C5CFF",
          subtle: "#F4F4FF",
          gradientFrom: "#9486FF",
          gradientTo: "#6846E1",
        },
        crm: {
          default: "#1BA3A3",
          subtle: "#EDF7F7",
          gradientFrom: "#5AB8B8",
          gradientTo: "#008989",
        },
        scm: {
          default: "#F5A524",
          subtle: "#FCF4EA",
          gradientFrom: "#FBB85C",
          gradientTo: "#CD8600",
        },
        commerce: {
          default: "#E5484D",
          subtle: "#FFF2F0",
          gradientFrom: "#F67270",
          gradientTo: "#C7313A",
        },
        mes: {
          default: "#4B5563",
          subtle: "#F7F7F8",
          gradientFrom: "#9CA3AF",
          gradientTo: "#374151",
        },
        onTile: "#FFFFFF",
      },
      chart: {
        series: {
          "1": "#2F6BFF",
          "2": "#1F9D55",
          "3": "#7C5CFF",
          "4": "#1BA3A3",
          "5": "#CD8600",
        },
        compare: "#9CA3AF",
        grid: "#E5E7EB",
        axis: "#646B78",
        track: "#F3F4F6",
        heat: {
          "1": "#DBE7FF",
          "2": "#BFD4FF",
          "3": "#94B8FF",
          "4": "#1F56E2",
          "5": "#082E96",
        },
        heatInk: "#FFFFFF",
      },
    },
  },
  dark: {
    color: {
      bg: {
        canvas: "#141414",
        surface: "#1C1C1E",
        elevated: "#2C2C2F",
        sunken: "#232326",
        nav: "#2B2422",
        overlay: "#00000099",
        rowSelected: "#FF886729",
      },
      nav: {
        fg: "#EAE1DE",
        fgMuted: "#BDB4B2",
        fgActive: "#FFFFFF",
        hover: "#332C2A",
        selected: "#3A3331",
        border: "#332C2A",
        focus: "#FE5C2B",
        sub: "#251E1D",
      },
      avatar: {
        "1": {
          bg: "#031D6E",
          fg: "#BFD4FF",
        },
        "2": {
          bg: "#003617",
          fg: "#BBE2C5",
        },
        "3": {
          bg: "#2B116C",
          fg: "#D1D0FF",
        },
        "4": {
          bg: "#003535",
          fg: "#BCE3E2",
        },
        "5": {
          bg: "#4A2E00",
          fg: "#FEDFBA",
        },
        "6": {
          bg: "#59000C",
          fg: "#FFC8C4",
        },
      },
      fg: {
        primary: "#DCDCDC",
        secondary: "#A6A6A6",
        tertiary: "#9A9A9A",
        disabled: "#6E6E73",
        inverse: "#111827",
        link: "#FF8867",
        strong: "#F2F2F2",
      },
      border: {
        default: "#3A3A3D",
        strong: "#4A4A4E",
        focus: "#FF8867",
        selected: "#FF8867",
        divider: "#3A3A3D",
        focusStrong: "#FFB39D",
        hover: "#6E6E73",
      },
      brand: {
        default: "#CC3A00",
        hover: "#A22C00",
        active: "#7A1F00",
        subtle: "#FF886729",
        onBrand: "#FFFFFF",
        tint: "#FF88673D",
        accent: "#FE5C2B",
      },
      status: {
        info: {
          default: "#5F91FF",
          subtle: "#5F91FF29",
          on: "#030712",
        },
        success: {
          default: "#5AB577",
          subtle: "#5AB57729",
          on: "#030712",
        },
        warning: {
          default: "#FBB85C",
          subtle: "#FBB85C29",
          on: "#030712",
        },
        danger: {
          default: "#F67270",
          subtle: "#F6727029",
          on: "#030712",
        },
      },
      finance: {
        income: "#F67270",
        expense: "#5F91FF",
        neutral: "#A6A6A6",
      },
      approval: {
        draft: {
          default: "#A6A6A6",
          subtle: "#2C2C2F",
          text: "#DCDCDC",
        },
        pending: {
          default: "#FBB85C",
          subtle: "#221200",
          text: "#FBB85C",
        },
        approved: {
          default: "#5AB577",
          subtle: "#001C09",
          text: "#5AB577",
        },
        rejected: {
          default: "#F67270",
          subtle: "#320004",
          text: "#F67270",
        },
        withdrawn: {
          default: "#9A9A9A",
          subtle: "#2C2C2F",
          text: "#9A9A9A",
        },
      },
      module: {
        erp: {
          default: "#5F91FF",
          subtle: "#5F91FF29",
          gradientFrom: "#5F91FF",
          gradientTo: "#1F56E2",
        },
        groupware: {
          default: "#5AB577",
          subtle: "#5AB57729",
          gradientFrom: "#5AB577",
          gradientTo: "#008543",
        },
        ecm: {
          default: "#9486FF",
          subtle: "#9486FF29",
          gradientFrom: "#9486FF",
          gradientTo: "#6846E1",
        },
        crm: {
          default: "#5AB8B8",
          subtle: "#5AB8B829",
          gradientFrom: "#5AB8B8",
          gradientTo: "#008989",
        },
        scm: {
          default: "#FBB85C",
          subtle: "#FBB85C29",
          gradientFrom: "#FBB85C",
          gradientTo: "#CD8600",
        },
        commerce: {
          default: "#F67270",
          subtle: "#F6727029",
          gradientFrom: "#F67270",
          gradientTo: "#C7313A",
        },
        mes: {
          default: "#9A9A9A",
          subtle: "#9CA3AF29",
          gradientFrom: "#9CA3AF",
          gradientTo: "#374151",
        },
        onTile: "#FFFFFF",
      },
      chart: {
        series: {
          "1": "#5F91FF",
          "2": "#1F9D55",
          "3": "#9486FF",
          "4": "#1BA3A3",
          "5": "#F5A524",
        },
        compare: "#9A9A9A",
        grid: "#3A3A3D",
        axis: "#9A9A9A",
        track: "#2C2C2F",
        heat: {
          "1": "#000B46",
          "2": "#031D6E",
          "3": "#082E96",
          "4": "#1141BE",
          "5": "#1F56E2",
        },
        heatInk: "#F2F2F2",
      },
    },
  },
};

export const density = {
  compact: {
    row: {
      height: 36,
      heightTall: 48,
    },
    control: {
      height: {
        xs: 26,
        sm: 30,
        md: 36,
        lg: 42,
        xl: 48,
      },
    },
    card: {
      padding: 16,
    },
    body: {
      fontSize: 13,
      lineHeight: 20,
    },
    input: {
      fontSize: 13,
    },
    gutter: 16,
  },
  comfortable: {
    row: {
      height: 40,
      heightTall: 56,
    },
    control: {
      height: {
        xs: 26,
        sm: 30,
        md: 36,
        lg: 42,
        xl: 48,
      },
    },
    card: {
      padding: 20,
    },
    body: {
      fontSize: 14,
      lineHeight: 21,
    },
    input: {
      fontSize: 14,
    },
    gutter: 24,
  },
  touch: {
    row: {
      height: 48,
      heightTall: 64,
    },
    control: {
      height: {
        xs: 44,
        sm: 44,
        md: 48,
        lg: 56,
        xl: 56,
      },
    },
    card: {
      padding: 16,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
    },
    input: {
      fontSize: 16,
    },
    gutter: 16,
  },
};

/** 단위 없는 숫자. font.letterSpacing은 em 배율이다. */
export const primitives = {
  border: {
    width: {
      "1": 1,
      "2": 2,
      "3": 3,
    },
  },
  breakpoint: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  color: {
    alpha: {
      black: {
        "40": "#00000066",
        "48": "#0000007A",
        "60": "#00000099",
        "64": "#000000A3",
      },
      blue: {
        "16": "#5F91FF29",
      },
      neutral: {
        "16": "#9CA3AF29",
      },
      red: {
        "16": "#F6727029",
      },
      green: {
        "16": "#5AB57729",
      },
      amber: {
        "16": "#FBB85C29",
      },
      violet: {
        "16": "#9486FF29",
      },
      teal: {
        "16": "#5AB8B829",
      },
      brand: {
        "8": "#FF886714",
        "16": "#FF886729",
        "24": "#FF88673D",
      },
    },
    brand: {
      "50": "#FFF2EE",
      "100": "#FFE4DC",
      "200": "#FFD0C3",
      "300": "#FFB39D",
      "400": "#FF8867",
      "500": "#FE5C2B",
      "600": "#CC3A00",
      "700": "#A22C00",
      "800": "#7A1F00",
      "900": "#541200",
      "950": "#2E0600",
    },
    shell: {
      "100": "#EAE1DE",
      "300": "#BDB4B2",
      "600": "#5B5351",
      "700": "#4A4341",
      "750": "#423A38",
      "800": "#3A3331",
      "850": "#352E2C",
      "900": "#332C2A",
      "925": "#2B2422",
      "950": "#251E1D",
    },
    cvd: {
      vermilion: "#D55E00",
      blue: "#0072B2",
      orange: "#E69F00",
      sky: "#56B4E9",
      purple: "#CC79A7",
      gray: "#8B929C",
      dark: {
        vermilion: "#D97324",
        blue: "#006A9F",
        orange: "#B68B13",
        sky: "#339DD0",
        purple: "#C473A6",
        gray: "#9A9A9A",
      },
    },
    base: {
      white: "#FFFFFF",
      black: "#000000",
    },
    blue: {
      "50": "#F0F5FF",
      "100": "#DBE7FF",
      "200": "#BFD4FF",
      "300": "#94B8FF",
      "400": "#5F91FF",
      "500": "#2F6BFF",
      "600": "#1F56E2",
      "700": "#1141BE",
      "800": "#082E96",
      "900": "#031D6E",
      "950": "#000B46",
    },
    neutral: {
      "50": "#F7F7F8",
      "100": "#F3F4F6",
      "200": "#E5E7EB",
      "300": "#D1D5DB",
      "400": "#9CA3AF",
      "500": "#646B78",
      "600": "#4B5563",
      "700": "#374151",
      "800": "#1F2937",
      "900": "#111827",
      "950": "#030712",
    },
    graphite: {
      "50": "#F2F2F2",
      "100": "#DCDCDC",
      "200": "#A6A6A6",
      "300": "#9A9A9A",
      "400": "#6E6E73",
      "500": "#4A4A4E",
      "600": "#3A3A3D",
      "700": "#2C2C2F",
      "800": "#232326",
      "900": "#1C1C1E",
      "950": "#141414",
    },
    red: {
      "50": "#FFF2F0",
      "100": "#FFE0DE",
      "200": "#FFC8C4",
      "300": "#FFA29D",
      "400": "#F67270",
      "500": "#E5484D",
      "600": "#C7313A",
      "700": "#A31A27",
      "800": "#7E0818",
      "900": "#59000C",
      "950": "#320004",
    },
    green: {
      "50": "#EEF8F0",
      "100": "#DAEEDF",
      "200": "#BBE2C5",
      "300": "#91CFA1",
      "400": "#5AB577",
      "500": "#1F9D55",
      "600": "#008543",
      "700": "#006934",
      "800": "#004F25",
      "900": "#003617",
      "950": "#001C09",
    },
    amber: {
      "50": "#FCF4EA",
      "100": "#FCEBD8",
      "200": "#FEDFBA",
      "300": "#FFCE91",
      "400": "#FBB85C",
      "500": "#F5A524",
      "600": "#CD8600",
      "700": "#9F6700",
      "800": "#734A00",
      "900": "#4A2E00",
      "950": "#221200",
    },
    violet: {
      "50": "#F4F4FF",
      "100": "#E5E5FF",
      "200": "#D1D0FF",
      "300": "#B5B1FF",
      "400": "#9486FF",
      "500": "#7C5CFF",
      "600": "#6846E1",
      "700": "#5331BC",
      "800": "#3F2094",
      "900": "#2B116C",
      "950": "#170244",
    },
    teal: {
      "50": "#EDF7F7",
      "100": "#DAEEEE",
      "200": "#BCE3E2",
      "300": "#92D0D0",
      "400": "#5AB8B8",
      "500": "#1BA3A3",
      "600": "#008989",
      "700": "#006B6B",
      "800": "#005050",
      "900": "#003535",
      "950": "#001B1B",
    },
  },
  font: {
    family: {
      sans: "Pretendard Variable",
      mono: "ui-monospace",
    },
    weight: {
      "400": "400",
      "500": "500",
      "600": "600",
      "700": "700",
    },
    numeric: "tabular-nums",
    letterSpacing: {
      tight: -0.01,
      normal: 0,
    },
  },
  layout: {
    globalBar: {
      height: 48,
    },
    sidebar: {
      width: 240,
      collapsedWidth: 64,
    },
    content: {
      maxWidth: 1440,
      maxWidthWide: 1600,
    },
    gutter: {
      default: 24,
      compact: 16,
    },
    desktop: {
      minWidth: 1024,
    },
    wide: {
      minWidth: 1920,
    },
  },
  duration: {
    "100": 100,
    "150": 150,
    "200": 200,
    "300": 300,
    fast: 100,
    normal: 150,
    slow: 200,
    slower: 300,
    spin: 900,
    pulse: 1500,
    essential: 900,
  },
  easing: {
    standard: [0.2, 0, 0, 1],
    decelerate: [0, 0, 0, 1],
    accelerate: [0.3, 0, 1, 1],
    enter: [0, 0, 0, 1],
    exit: [0.3, 0, 1, 1],
  },
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadow: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.059,
      shadowRadius: 1.5,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.078,
      shadowRadius: 6,
      elevation: 6,
    },
    lg: {
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.102,
      shadowRadius: 12,
      elevation: 12,
    },
  },
  size: {
    icon: {
      "16": 16,
      "20": 20,
      "24": 24,
    },
    moduleIcon: {
      "32": 32,
      "40": 40,
      "48": 48,
    },
    avatar: {
      "24": 24,
      "32": 32,
      "40": 40,
      "48": 48,
    },
    touch: {
      min: 44,
      control: 48,
      main: 56,
    },
  },
  space: {
    "0": 0,
    "2": 2,
    "4": 4,
    "6": 6,
    "8": 8,
    "10": 10,
    "12": 12,
    "14": 14,
    "16": 16,
    "18": 18,
    "20": 20,
    "24": 24,
    "28": 28,
    "32": 32,
    "40": 40,
    "48": 48,
    "64": 64,
  },
  z: {
    base: 0,
    sticky: 100,
    dropdown: 450,
    overlay: 300,
    modal: 400,
    toast: 500,
  },
};

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
    letterSpacing: -0.28,
  },
  h1: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "600",
    letterSpacing: -0.24,
  },
  h2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: -0.18,
  },
  h3: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: 0,
  },
  h4: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: 0,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
    letterSpacing: 0,
  },
  label: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: 0,
  },
  micro: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0,
  },
  mono: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0,
  },
  amount: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: 0,
  },
  amountLg: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: 0,
  },
};

/** 종이 서식(테마와 무관). 크기 · 여백은 mm × 96 / 25.4, 글자(type)는 pt × 96 / 72 */
export const paper = {
  bg: "#FFFFFF",
  fg: "#000000",
  muted: "#4B5563",
  line: "#646B78",
  lineStrong: "#030712",
  fill: "#E5E7EB",
  shadow: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.078,
    shadowRadius: 6,
    elevation: 6,
  },
  size: {
    a4: {
      width: 793.7,
      height: 1122.52,
    },
    a5: {
      width: 559.37,
      height: 793.7,
    },
  },
  margin: {
    sm: 45.35,
    md: 68.03,
  },
  type: {
    display: {
      fontSize: 28,
      lineHeight: 36,
    },
    h1: {
      fontSize: 24,
      lineHeight: 32,
    },
    h2: {
      fontSize: 20,
      lineHeight: 28,
    },
    h3: {
      fontSize: 16,
      lineHeight: 24,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
};
