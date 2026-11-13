// 컴포넌트 예시(packages/react/src/<Name>/<Name>.examples.tsx)를 이름으로 꺼낸다. 문서 사이트의 라이브 예시와
// 같은 파일이다(D-46). 예시는 패키지 entry로 나가지 않아 소스 경로로 가져온다(eslint 예외는 eslint.config.js).
// 빌드 때 서버에서만 그린다. 브라우저 번들에는 들어가지 않는다.
import type { ComponentType } from 'react';

const modules = import.meta.glob<Record<string, ComponentType>>(
  '../../../../packages/react/src/*/*.examples.tsx',
  { eager: true },
);

const byName = new Map<string, Record<string, ComponentType>>();
for (const [path, mod] of Object.entries(modules)) {
  const name = /\/([^/]+)\.examples\.tsx$/.exec(path)?.[1];
  if (name) byName.set(name, mod);
}

export function exampleOf(component: string, example: string): ComponentType {
  const found = byName.get(component)?.[example];
  if (!found) throw new Error(`예시가 없다: ${component}.${example}`);
  return found;
}
