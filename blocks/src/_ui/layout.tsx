// 블록 공통 배치. 12열 격자는 컴포넌트 DashboardGrid(PG-39)를 감싸고, 페이지 여백은 여기서 잡는다.
// Page는 정식 컴포넌트로 올릴 후보다. 토큰 밖 값 없음.
import { DashboardGrid, DashboardGridItem } from '@terracelab/trellis-react';
import type { CSSProperties, ReactNode } from 'react';

/** 화면 한 장: 위 PageHeader, 아래 내용. fill이면 내용이 남은 높이를 채운다(목록 · 상세) */
export function Page({
  header,
  children,
  fill = false,
  width = 'wide',
}: {
  header?: ReactNode;
  children?: ReactNode;
  fill?: boolean;
  width?: 'wide' | 'form';
}) {
  return (
    <div className="tl-block-page" data-fill={fill || undefined} data-width={width}>
      {header}
      <div className="tl-block-page__body">{children}</div>
    </div>
  );
}

/**
 * 12열 격자(DashboardGrid 고정 배치). 1280 미만에서 2 · 3열 칸은 반, 4 · 5 · 7 · 8열 칸은 한 줄,
 * 1024 미만은 한 줄(2 · 3열만 둘씩), 휴대폰은 한 줄. 위젯 순서 바꾸기 · 숨기기가 필요하면
 * DashboardGrid의 widgets · editing을 바로 쓴다
 */
export function Grid({
  children,
  gap = 'gutter',
}: {
  children?: ReactNode;
  gap?: 'gutter' | 'tight';
}) {
  return <DashboardGrid gap={gap}>{children}</DashboardGrid>;
}

export function Col({
  span = 12,
  children,
  rows,
}: {
  span?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 12;
  children?: ReactNode;
  rows?: 1 | 2;
}) {
  return (
    <DashboardGridItem span={span} {...(rows ? { rows } : {})}>
      {children}
    </DashboardGridItem>
  );
}

/** 가로 한 줄(사이 정렬). 툴바 · 요약 줄 */
export function Row({
  children,
  justify = 'between',
  wrap = true,
  style,
}: {
  children?: ReactNode;
  justify?: 'between' | 'start' | 'end';
  wrap?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className="tl-block-row"
      data-justify={justify}
      data-wrap={wrap || undefined}
      style={style}
    >
      {children}
    </div>
  );
}

/** 세로 쌓기 */
export function Stack({
  children,
  gap = 'md',
}: {
  children?: ReactNode;
  gap?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="tl-block-stack" data-gap={gap}>
      {children}
    </div>
  );
}

/** 목록 + 오른쪽 상세(넓은 화면에서 Drawer 대신 나란히) */
export function Split({
  main,
  aside,
  asideWidth = 'md',
}: {
  main: ReactNode;
  aside?: ReactNode;
  asideWidth?: 'md' | 'lg';
}) {
  return (
    <div className="tl-block-split" data-aside={aside ? asideWidth : undefined}>
      <div className="tl-block-split__main">{main}</div>
      {aside && <div className="tl-block-split__aside">{aside}</div>}
    </div>
  );
}

/** 숫자 한 줄(라벨 · 값). 카드 안 요약 */
export function Figure({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: 'income' | 'expense' | 'danger';
}) {
  return (
    <div className="tl-block-figure" data-tone={tone}>
      <span className="tl-block-figure__label">{label}</span>
      <span className="tl-block-figure__value">
        {value}
        {unit && <span className="tl-block-figure__unit">{unit}</span>}
      </span>
    </div>
  );
}

/** 작은 글자(보조 설명 · 메타) */
export function Muted({ children }: { children?: ReactNode }) {
  return <span className="tl-block-muted">{children}</span>;
}

/**
 * 목록 · 카드 줄 안의 두 줄 글자(위 = 본문, 아래 = 흐린 보조 한 줄, 둘 다 말줄임).
 * 표 칸은 DataGridLines(두 줄 행 높이를 맞춘다), 사람은 PersonLabel을 쓴다
 */
export function Lines({
  primary,
  secondary,
  align = 'start',
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  /** end = 숫자 · 금액 줄(오른쪽 정렬, 고정폭 숫자) */
  align?: 'start' | 'end';
}) {
  return (
    <span className="tl-block-lines" data-align={align === 'end' ? 'end' : undefined}>
      <span>{primary}</span>
      {secondary != null && secondary !== '' && secondary !== false && <span>{secondary}</span>}
    </span>
  );
}
