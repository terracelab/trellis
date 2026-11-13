import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  ORG,
  ROBOTS_CLOSED,
  ROBOTS_OPEN,
  breadcrumbList,
  displayWidth,
  firstSentences,
  jsonLd,
  organization,
  robotsMeta,
  robotsTxt,
  sitemapXml,
  trellisWebsite,
  verificationMeta,
} from './index.mjs';

const HOME = 'https://example.test/trellis/';
const ENV = ['SITE_INDEXABLE', 'SITE_VERIFY_GOOGLE', 'SITE_VERIFY_NAVER', 'SITE_VERIFY_BING'];
afterEach(() => {
  for (const k of ENV) delete process.env[k];
});

test('색인은 SITE_INDEXABLE=1일 때만 열린다', () => {
  assert.equal(robotsMeta(), ROBOTS_CLOSED);
  assert.equal(
    robotsTxt({ sitemaps: [`${HOME}sitemap-index.xml`] }),
    'User-agent: *\nDisallow: /\n',
  );
  process.env.SITE_INDEXABLE = '1';
  assert.equal(robotsMeta(), ROBOTS_OPEN);
  assert.equal(robotsMeta(true), ROBOTS_CLOSED);
  assert.equal(
    robotsTxt({ sitemaps: [`${HOME}sitemap-index.xml`] }),
    `User-agent: *\nAllow: /\n\nSitemap: ${HOME}sitemap-index.xml\n`,
  );
});

test('소유 확인 태그는 값이 있는 것만 낸다', () => {
  assert.deepEqual(verificationMeta(), []);
  process.env.SITE_VERIFY_NAVER = 'abc';
  assert.deepEqual(verificationMeta(), [{ name: 'naver-site-verification', content: 'abc' }]);
});

test('사이트맵은 주소와 언어 짝을 적고 lastmod는 넣지 않는다', () => {
  const out = sitemapXml([
    { loc: HOME, alternates: [{ hreflang: 'en', href: `${HOME}en/` }] },
    `${HOME}faq/?a=1&b=2`,
  ]);
  assert.match(
    out,
    /<loc>https:\/\/example\.test\/trellis\/<\/loc><xhtml:link rel="alternate" hreflang="en"/,
  );
  assert.match(out, /faq\/\?a=1&amp;b=2/);
  assert.doesNotMatch(out, /lastmod/);
});

test('회사 · 사이트 개체는 한 주소에 하나의 @id를 쓴다', () => {
  const org = organization(HOME);
  const site = trellisWebsite(HOME);
  assert.equal(org['@id'], `${ORG.url ?? HOME}#organization`);
  assert.equal(site['@id'], `${HOME}#website`);
  assert.deepEqual(site.publisher, { '@id': org['@id'] });
  assert.equal('url' in org, Boolean(ORG.url));
});

test('구조화 데이터 글은 script 안에서 끊기지 않는다', () => {
  const out = jsonLd(null, [breadcrumbList([{ name: '</script>', url: HOME }])], false);
  assert.doesNotMatch(out, /<\/script>/);
  assert.equal(JSON.parse(out)['@graph'].length, 1);
});

test('폭은 한글을 2로 센다', () => {
  assert.equal(displayWidth('Button'), 6);
  assert.equal(displayWidth('컴포넌트'), 8);
  assert.equal(displayWidth('Trellis 문서'), 12);
});

test('설명은 문장 단위로 끊는다', () => {
  const text = '첫 문장입니다. 둘째 문장은 조금 더 깁니다. 셋째 문장입니다.';
  assert.equal(firstSentences(text, 100), text);
  assert.equal(firstSentences(text, 26), '첫 문장입니다. 둘째 문장은 조금 더 깁니다.');
  assert.equal(firstSentences(text, 12), '첫 문장입니다.');
  assert.equal(firstSentences('마침표 없이 아주 길게 이어지는 한 문장', 12), '마침표 없이 아주…');
});
