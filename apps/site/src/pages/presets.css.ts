// 회사 색 프리셋을 범위 CSS로 미리 만든다. <html data-brand="forest">처럼 속성만 바꾸면 색이 바뀐다(스크립트 계산 없음).
// 값은 @terracelab/trellis-tokens/theme의 엔진이 낸다. 기본(주황)도 넣는다: 다른 색 페이지 안의 주황 견본이 제 색을 낸다.
import type { APIRoute } from 'astro';
import { THEME_PRESETS, createTheme, themeCss } from '@terracelab/trellis-tokens/theme';

export const GET: APIRoute = () => {
  const body = THEME_PRESETS.map((p) =>
    themeCss(createTheme({ brand: p.brand, neutral: p.neutral }), {
      scope: `[data-brand='${p.id}']`,
    }),
  ).join('\n');
  return new Response(body, { headers: { 'content-type': 'text/css; charset=utf-8' } });
};
