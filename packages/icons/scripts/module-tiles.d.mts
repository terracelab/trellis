// module-tiles.mjs 의 타입 선언. 테스트가 파이프라인을 직접 불러 쓰기 위해 둔다.

export const PKG: string;
export const SRC: string;
export const DIST: string;
export const ID_PREFIX: string;
export const SIZE: number;
export const VIEWBOX: string;
export const RADIUS: number;

export interface ManifestEntry {
  module: string | null;
  label?: string;
}
export interface Manifest {
  $comment?: string;
  tiles: Record<string, ManifestEntry>;
}
export interface TileInfo {
  id: string;
  module: string | null;
  group: string | null;
  label: string;
}
export interface BuiltTile extends TileInfo {
  file: string;
  symbol: string;
  gradient: string[] | null;
}
export interface BuildResult {
  tiles: BuiltTile[];
  modulesWithoutTile: string[];
  viewBox: string;
  size: number;
  radius: number;
  idPrefix: string;
}

export function readManifest(dir?: string): Manifest;
export function listTiles(dir?: string): string[];
export function resolveTile(id: string, manifest: Manifest): TileInfo;
export function normalize(svg: string, id: string, label: string): string;
export function validate(svg: string, id: string, label: string): string[];
export function tileGradient(svg: string, id: string): string[] | null;
export function toSymbol(svg: string, id: string): string;
export function build(options?: { outDir?: string }): BuildResult;
export function normalizeSources(): number;
