// 사이트가 놓이는 주소. 기본은 https://trellis.terracelab.co.kr 의 루트이고, 다른 곳에 올릴 때는
// SITE_URL · SITE_BASE(astro.config.mjs)로 바뀐다. 컴포넌트가 직접 만드는 링크는 전부 withBase를 거친다.

/** 사이트 경로(끝에 /). 도메인 루트면 '/', 프로젝트 주소면 '/trellis/' 같은 값 */
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** 루트 기준 경로('/docs/guide/install/')에 사이트 경로를 붙인다. 바깥 주소(https://…)는 그대로 */
export const withBase = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') ? BASE + path.slice(1) : path;

/** 배포된 사이트의 원본 + 경로(끝 / 없음). /llms.txt · /api 주소를 글자로 보여 줄 때 쓴다 */
export const LIVE = new URL(BASE, import.meta.env.SITE).href.replace(/\/$/, '');
