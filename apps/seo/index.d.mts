// index.mjs의 타입. Astro(strict)와 astro.config.mjs가 같이 가져온다.

export interface JsonLdNode {
  '@type': string;
  [key: string]: unknown;
}

export declare const ORG: {
  name: string;
  alternateName: string[];
  url: string | undefined;
  logo: string | undefined;
  sameAs: string[];
};

export declare const TRELLIS: {
  name: string;
  alternateName: string[];
  about: { ko: string; en: string };
  imageAlt: { ko: string; en: string };
};

export declare function isIndexable(): boolean;
export declare const ROBOTS_OPEN: string;
export declare const ROBOTS_CLOSED: string;
export declare function robotsMeta(noindex?: boolean): string;
export declare function robotsTxt(options?: { sitemaps?: string[] }): string;
export declare function verificationMeta(): { name: string; content: string }[];

export interface SitemapUrl {
  loc: string;
  alternates?: { hreflang: string; href: string }[];
}
export declare function sitemapXml(urls: (string | SitemapUrl)[]): string;

export declare function orgId(home: string): string;
export declare function websiteId(home: string): string;
export declare function organization(home: string): JsonLdNode;
export declare function website(
  home: string,
  site: {
    name: string;
    alternateName?: string[];
    description: string;
    inLanguage: string | string[];
  },
): JsonLdNode;
export declare function trellisWebsite(home: string): JsonLdNode;
export declare function breadcrumbList(items: { name: string; url: string }[]): JsonLdNode;
export declare function jsonLd(
  ...nodes: (JsonLdNode | JsonLdNode[] | null | undefined | false)[]
): string;

export declare function displayWidth(text: string): number;
export declare function firstSentences(text: string, max: number): string;
