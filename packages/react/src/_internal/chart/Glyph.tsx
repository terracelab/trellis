// 차트 상태 글리프 3종(Lucide 모양: check · triangle-alert · circle-alert). P1-02의 <Icon>이 생기면 그것으로 바꾼다.
import type { SVGProps } from 'react';

const PATHS = {
  check: ['M20 6 9 17l-5-5'],
  'triangle-alert': [
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
    'M12 9v4',
    'M12 17h.01',
  ],
  'circle-alert': ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 8v4', 'M12 16h.01'],
} as const;

export type GlyphName = keyof typeof PATHS;

export function Glyph({ name, className, ...rest }: { name: GlyphName } & SVGProps<SVGSVGElement>) {
  // 받은 className은 덧붙인다. 덮으면 tl-chart-glyph의 16px 크기가 빠져 글리프가 칸만큼 커진다
  return (
    <svg
      className={className ? `tl-chart-glyph ${className}` : 'tl-chart-glyph'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
