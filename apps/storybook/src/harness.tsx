// 생성 스토리(Matrix · States)가 쓰는 도구. 첫 요소의 props는 예시가 실제로 그리는 트리에서 꺼낸다:
// 예시 함수를 이 컴포넌트 안에서 불러(예시의 훅은 이 컴포넌트의 훅이 된다) 돌려준 요소 트리를 훑는다.
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useLayoutEffect,
  useRef,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react';

type AnyProps = Record<string, unknown>;
type AnyElement = ReactElement<AnyProps>;
// 생성 스토리는 컴포넌트마다 props 타입이 달라 여기서는 넓게 받는다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;
type Example = () => ReactNode;

export interface MatrixAxis {
  prop: string;
  values: readonly (string | number)[];
}

export interface StateCell {
  state: string;
  props?: AnyProps;
  force?: string;
}

/**
 * 트리에서 type 요소를 처음 만나는 곳까지의 경로(바깥 → 대상). children을 먼저, 그다음 요소를 담은
 * 다른 props(trigger · actions 등)를 본다.
 */
export function findPath(node: unknown, type: unknown): AnyElement[] | null {
  if (Array.isArray(node)) {
    for (const n of node) {
      const found = findPath(n, type);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement<AnyProps>(node)) return null;
  if (node.type === type) return [node];
  const { children, ...rest } = node.props;
  const inChildren = findPath(children, type);
  if (inChildren) return [node, ...inChildren];
  for (const value of Object.values(rest)) {
    // children이 아닌 prop 안에서 찾으면 감싸는 요소로 쓰지 않는다(경로를 끊는다)
    const found = findPath(value, type);
    if (found) return found;
  }
  return null;
}

interface Base {
  /** 대상 요소의 props(칸마다 같은 id가 생기지 않게 id는 뺀다) */
  props: AnyProps;
  /** 대상만 감싼 바깥 요소(Field 등)를 칸마다 다시 씌운다 — 라벨 · 설명 연결이 그대로 남는다 */
  wrap: (node: ReactNode) => ReactNode;
}

/** 경로 끝에서부터, 자식이 그 하나뿐인 바깥 요소만 감싸개로 남긴다(여러 예시를 늘어놓은 줄은 버린다) */
function toBase(path: AnyElement[]): Base {
  const target = path[path.length - 1] as AnyElement;
  const wrappers: AnyElement[] = [];
  for (let i = path.length - 2; i >= 0; i -= 1) {
    const el = path[i] as AnyElement;
    const kids = Children.toArray(el.props['children'] as ReactNode);
    if (kids.length !== 1 || kids[0] === undefined || !isValidElement(kids[0])) break;
    wrappers.unshift(el);
  }
  const props = { ...target.props };
  delete props['id'];
  return {
    props,
    wrap: (node) => wrappers.reduceRight<ReactNode>((acc, w) => cloneElement(w, {}, acc), node),
  };
}

function useBase(example: Example, component: AnyComponent): Base | null {
  const path = findPath(example(), component);
  return path ? toBase(path) : null;
}

function Missing({ name }: { name: string }) {
  return (
    <p className="tl-storybook-missing" role="alert">
      예시 트리에서 {name} 요소를 찾지 못했습니다. 예시가 다른 컴포넌트 안에서 그린다면 생성기의
      Matrix · States 대상에서 빼야 합니다.
    </p>
  );
}

const label = (v: unknown) => String(v);
const noop = () => {};

function product(axes: readonly MatrixAxis[]): AnyProps[] {
  return axes.reduce<AnyProps[]>(
    (rows, axis) => rows.flatMap((row) => axis.values.map((v) => ({ ...row, [axis.prop]: v }))),
    [{}],
  );
}

/** variant · tone · shape 조합은 행, size는 열 */
export function MatrixStory({
  example,
  component: C,
  axes,
}: {
  example: Example;
  component: AnyComponent;
  axes: readonly MatrixAxis[];
}) {
  const base = useBase(example, C);
  if (!base) return <Missing name={C.displayName ?? C.name} />;
  const colAxis = axes.find((a) => a.prop === 'size');
  const rowAxes = axes.filter((a) => a !== colAxis);
  const cols: AnyProps[] = colAxis ? colAxis.values.map((v) => ({ [colAxis.prop]: v })) : [{}];
  const rows = product(rowAxes);
  const corner = [rowAxes.map((a) => a.prop).join(' · '), colAxis?.prop]
    .filter(Boolean)
    .join(' / ');
  return (
    <div
      className="tl-storybook-matrix"
      style={{ gridTemplateColumns: `max-content repeat(${cols.length}, minmax(0, 1fr))` }}
    >
      <span className="tl-storybook-matrix__head">{corner}</span>
      {cols.map((col, i) => (
        <span key={i} className="tl-storybook-matrix__head">
          {colAxis ? label(col[colAxis.prop]) : ''}
        </span>
      ))}
      {rows.map((row, r) => (
        <Fragment key={r}>
          <span className="tl-storybook-matrix__head">
            {rowAxes.map((a) => label(row[a.prop])).join(' · ')}
          </span>
          {cols.map((col, c) => (
            <div key={c} className="tl-storybook-matrix__cell">
              {base.wrap(<C {...base.props} {...row} {...col} />)}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

/** data-force-state를 칸 안 컴포넌트 루트에 붙인다(컴포넌트가 data-* prop을 넘기지 않아도 된다) */
function Forced({
  force,
  rootClass,
  children,
}: {
  force?: string | undefined;
  rootClass: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!force || !ref.current) return;
    const root = ref.current.querySelector(`.${rootClass}`) ?? ref.current.firstElementChild;
    root?.setAttribute('data-force-state', force);
  });
  return (
    <div ref={ref} className="tl-storybook-states__cell">
      {children}
    </div>
  );
}

export function StatesStory({
  example,
  component: C,
  rootClass,
  cells,
  unsupported,
  pressable = false,
}: {
  example: Example;
  component: AnyComponent;
  rootClass: string;
  cells: readonly StateCell[];
  unsupported: readonly string[];
  /** 강제 상태 CSS가 누를 수 있는 모양([data-pressable])에만 걸릴 때 onPress를 넣는다 */
  pressable?: boolean;
}) {
  const base = useBase(example, C);
  if (!base) return <Missing name={C.displayName ?? C.name} />;
  const props = pressable ? { ...base.props, onPress: base.props['onPress'] ?? noop } : base.props;
  return (
    <div className="tl-storybook-states">
      <div className="tl-storybook-matrix" style={{ gridTemplateColumns: 'max-content 1fr' }}>
        {cells.map((cell) => (
          <Fragment key={cell.state}>
            <span className="tl-storybook-matrix__head">{cell.state}</span>
            <Forced force={cell.force} rootClass={rootClass}>
              {base.wrap(<C {...props} {...cell.props} />)}
            </Forced>
          </Fragment>
        ))}
      </div>
      {unsupported.length > 0 && (
        <p className="tl-storybook-states__note">강제할 수 없는 상태: {unsupported.join(', ')}</p>
      )}
    </div>
  );
}
