// 문서 페이지의 설명(<meta name="description"> · og:description). 검색 결과와 답변 엔진이 이 글을 그대로 보여 준다(D-152).
// 가이드는 첫 문단이 주어 없이 시작하거나 목록으로 시작하는 것이 있어 한 줄씩 손으로 적는다.
// 여기에 없는 가이드는 본문 첫 문단을 문장 단위로 끊어 쓴다. 컴포넌트는 요약과 수(props · 상태 · 예시)로 만든다.
import { firstSentences } from '@terracelab/seo';

/** {charts}는 차트 수로 바뀐다(sync-content.mjs가 manifest에서 센다) */
export const GUIDE_DESCRIPTIONS = {
  overview: {
    ko: 'Trellis(트렐리스)는 테라스랩의 디자인 시스템입니다. 들어 있는 패키지 · 이름의 뜻 · 한 문장 규칙을 소개합니다.',
    en: "Trellis is TerraceLab's design system. This page lists the packages, explains the name and states the one-sentence rule.",
  },
  install: {
    ko: 'Trellis 패키지를 설치하는 방법입니다. npm 공개 전에는 모노레포 의존이나 tgz 묶음으로 설치합니다.',
    en: 'How to install the Trellis packages. Until the npm release, depend on them inside the monorepo or install packed tarballs.',
  },
  setup: {
    ko: 'CSS를 불러오는 순서와 테마 · 밀도를 정하는 html 속성을 설명합니다. Tailwind v4와 Django 설정도 다룹니다.',
    en: 'The order to load the CSS files and the html attributes that set theme and density. Also covers Tailwind v4 and Django.',
  },
  service: {
    ko: 'Trellis를 git 하위 모듈로 넣어 새 서비스를 시작하는 방법입니다. 화면 블록을 복사해 화면을 만듭니다.',
    en: 'How to start a new service with Trellis as a git submodule and build screens by copying screen blocks.',
  },
  theme: {
    ko: '회사 메인 색 하나로 회사 테마를 만드는 방법입니다. 테마 엔진이 라이트 · 다크 · 고대비 모드의 회사 색 토큰을 계산합니다.',
    en: 'How to build a company theme from one main color. The theme engine computes the brand color tokens for light, dark and high-contrast modes.',
  },
  agents: {
    ko: 'AI 에이전트가 Trellis로 화면을 만들 때 읽는 문서와 작업 순서입니다. 문서는 패키지 안에 들어 있어 설치한 버전과 같습니다.',
    en: 'The docs an AI agent reads when it builds screens with Trellis, and the order of work. The docs ship inside the package, so they match the installed version.',
  },
  principles: {
    ko: 'Trellis의 디자인 원칙과 앱 코드에서 지키는 규칙입니다. 고정 어휘 · 이름 규칙 · 숫자 표기를 함께 다룹니다.',
    en: 'Trellis design principles and the rules app code follows, with the fixed vocabulary, naming rules and number formats.',
  },
  content: {
    ko: '화면에 들어가는 말의 규칙입니다. 버튼 이름 · 상태 어휘 · 숫자 표기를 고정해 모듈마다 같은 말을 씁니다.',
    en: 'Rules for the words on screen. Button names, status vocabulary and number formats are fixed so every module says the same thing.',
  },
  charts: {
    ko: 'Trellis 차트 {charts}종에서 맞는 것을 고르는 표입니다. 사용자의 질문에서 형식을 정하고 형식에서 컴포넌트를 고릅니다.',
    en: "A table for choosing among the {charts} Trellis charts. Start from the user's question, pick the form, then pick the component.",
  },
  forms: {
    ko: 'react-hook-form을 Trellis 입력에 잇는 form 엔트리의 사용법입니다. 검증 시점 · 스키마 · 서버 오류를 다룹니다.',
    en: 'How to use the form entry that connects react-hook-form to Trellis inputs. Covers validation timing, schemas and server errors.',
  },
  patterns: {
    ko: '화면 유형마다 정해진 컴포넌트 조합과 규칙입니다. 맞는 화면 블록을 복사해서 시작합니다.',
    en: 'The component combinations and rules fixed for each screen type. Start by copying the matching screen block.',
  },
  dashboards: {
    ko: 'Trellis 부품으로 업무 대시보드를 조립하는 순서와 규칙입니다. 숫자 카드 · 차트 · 표를 위에서 아래로 놓습니다.',
    en: 'The order and rules for assembling a business dashboard from Trellis parts. Number cards come first, then charts, then tables.',
  },
  conversation: {
    ko: '사용자가 에이전트에게 업무를 묻고 답을 받는 화면을 만드는 방법입니다. 실행 단계 · 출처 · 사람의 승인을 다룹니다.',
    en: 'How to build a screen where a user asks an agent about work and gets answers, with run steps, sources and human approval.',
  },
  versions: {
    ko: 'Trellis 패키지의 버전 규칙입니다. 모든 패키지가 한 버전 번호로 함께 올라가고 이름 변경 · 삭제는 major 버전에서만 합니다.',
    en: 'Version rules for the Trellis packages. All packages share one version number, and renames and removals happen only in a major version.',
  },
  figma: {
    ko: 'Trellis Figma 라이브러리의 구성입니다. 코드의 토큰이 원본이고 Figma 파일은 그 생성물입니다.',
    en: 'How the Trellis Figma library is organized. The tokens in code are the source and the Figma file is generated from them.',
  },
};

/** 문장 단위로 끊는 길이. 검색 결과에 보이는 폭이 한글은 영문의 절반쯤이다 */
const MAX = { ko: 110, en: 160 };
/** 컴포넌트 설명 전체 길이. 요약이 길면 요약을 줄인다 */
const MAX_COMPONENT = { ko: 180, en: 210 };

/**
 * 설명은 꾸밈 없는 글이다. 저장소 안에서만 뜻이 있는 번호(요청 R-40 · 결정 D-98)와
 * 코드 표시(백틱 · 꺾쇠)를 뗀다. 기한 표기 D-3은 번호가 아니라 그대로 둔다.
 */
export const plain = (text) =>
  text
    .replace(/,?\s*R-[A-Z]?\d+\b/g, '')
    .replace(/\s*\((?:D|PR|PD)-\d+\)/g, '')
    .replace(/`/g, '')
    .replace(/<\/?([a-z][\w-]*)>/gi, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * @param {string} slug
 * @param {'ko' | 'en'} lang
 * @param {string} fallback 본문 첫 문단(마크다운 기호를 뗀 글)
 * @param {{ charts: number }} facts
 */
export function guideDescription(slug, lang, fallback, facts) {
  const written = GUIDE_DESCRIPTIONS[slug]?.[lang];
  if (written) return written.replace('{charts}', String(facts.charts));
  return firstSentences(plain(fallback), MAX[lang]);
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * 컴포넌트 페이지 설명. 이름 + 요약 + 문서에 들어 있는 것의 수.
 * @param {{ name: string, props: unknown[], states: unknown[], examples: unknown[] }} c manifest.components의 한 항목
 * @param {'ko' | 'en'} lang
 * @param {string} [summary] 한 줄 요약(없으면 수만 적는다)
 */
export function componentDescription(c, lang, summary = '') {
  const counts = [
    [c.props.length, 'props', 'prop'],
    [c.states.length, '상태', 'state'],
    [c.examples.length, '예시', 'example'],
  ].filter(([n]) => n > 0);
  const head = lang === 'en' ? `${c.name} component in Trellis.` : `Trellis ${c.name} 컴포넌트.`;
  const list =
    lang === 'en'
      ? counts.map(([n, , word]) => plural(n, word)).join(', ')
      : counts.map(([n, word]) => `${word} ${n}개`).join(' · ');
  const tail = list ? `${list}.` : '';
  const room = MAX_COMPONENT[lang] - head.length - tail.length - 2;
  const text = firstSentences(plain(summary).replace(/[.。]+$/, ''), room);
  const middle = text && (text.endsWith('…') ? text : `${text}.`);
  return [head, middle, tail].filter(Boolean).join(' ');
}
