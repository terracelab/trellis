// 컴포넌트 목록의 차트 카드. 폭을 재서 그리는 차트는 서버에서 빈 틀만 나오므로 이 카드들만 브라우저에서 켠다
// (페이지에서 client:visible). 예시 모듈은 카드가 보일 때 그 차트 하나만 받는다. 다른 카드는 스크립트 없이 서버에서 그린 그대로다.
// 예시는 패키지 entry로 나가지 않아 소스 경로로 가져온다(lib/examples.ts와 같은 이유).
import { Suspense, lazy, type ComponentType } from 'react';

type ExampleModule = Record<string, ComponentType>;

const loaders = import.meta.glob<ExampleModule>(
  '../../../../packages/react/src/{BarList,ChartCard,ComboChart,Donut,TrendChart,WaterfallChart}/*.examples.tsx',
);

/** 이 카드로 켜는 컴포넌트. 페이지가 이 목록에 있는 것만 넘긴다 */
export const HYDRATED = Object.keys(loaders).map(
  (path) => /\/([^/]+)\.examples\.tsx$/.exec(path)![1]!,
);

const loaderOf = (component: string) => {
  const found = Object.entries(loaders).find(([path]) =>
    path.endsWith(`/${component}/${component}.examples.tsx`),
  );
  if (!found) throw new Error(`차트 예시가 없다: ${component}`);
  return found[1];
};

// 서버(빌드)에서는 미리 받아 두고 바로 그린다. 브라우저에서는 보일 때 받는다
const ready: Record<string, ExampleModule> = {};
if (import.meta.env.SSR)
  for (const component of HYDRATED) ready[component] = await loaderOf(component)();

const cache = new Map<string, ComponentType>();
function exampleOf(component: string, example: string): ComponentType {
  const key = `${component}.${example}`;
  let found = cache.get(key);
  if (!found) {
    const loaded = ready[component]?.[example];
    found =
      loaded ??
      lazy(async () => {
        const module = await loaderOf(component)();
        const Example = module[example];
        if (!Example) throw new Error(`예시가 없다: ${key}`);
        return { default: Example };
      });
    cache.set(key, found);
  }
  return found;
}

export default function GalleryChart({
  component,
  example,
}: {
  component: string;
  example: string;
}) {
  const Example = exampleOf(component, example);
  return (
    <Suspense fallback={null}>
      <Example />
    </Suspense>
  );
}
