export declare const ROOT: string;
export declare const DEFAULT_OUT: string;
export declare const SITE: string;
export declare const LIMITS: { manifest: number; llms: number; llmsFull: number };
export declare const FORBIDDEN: string[];
export declare const CONSUMER_RULES: string[];
export declare const ManifestSchema: { parse(v: unknown): unknown };
export interface BuiltManifest {
  version: string;
  docsVersion: string;
  components: {
    name: string;
    summary: string;
    entry: string;
    category: 'chart' | 'core';
    status: 'preview' | 'stable';
    props: { name: string; type: string; required: boolean; description: string }[];
    states: string[];
    examples: { name: string; title: string; description: string }[];
    doc: string;
  }[];
  tokens: {
    count: number;
    semantic: { name: string; css: string; light: string; dark: string; description: string }[];
    chart: { series: string[]; compare: string };
  };
  guides: { slug: string; title: string; doc: string }[];
  patterns: { name: string }[];
  rules: string[];
  principles: string[];
}
export interface BuildReport {
  components: number;
  examples: number;
  guides: number;
  sizes: { manifest: number; llms: number; llmsFull: number };
}
export declare function parseExamples(
  src: string,
  entry: string,
): { name: string; title: string; description: string; code: string }[];
export declare function publicPaths(body: string): string;
export declare function verify(outDir: string, manifest: BuiltManifest): BuildReport;
export declare function buildDocs(opts?: {
  outDir?: string;
  verifyNode?: boolean;
}): Promise<{ outDir: string; manifest: BuiltManifest; report: BuildReport }>;
