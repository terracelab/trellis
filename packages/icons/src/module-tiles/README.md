# 모듈 타일 일러스트

모듈 앱 아이콘의 일러스트 판. `modules.json`의 모듈 20종 가운데 타일이 있는 모듈은 이 그림을 쓰고, 없는 모듈은 P1-02의 생성형 아이콘(모듈 색 그라데이션 + 흰 Lucide 라인)으로 폴백한다(D-36).

## 규격

- 1024×1024, `viewBox="0 0 1024 1024"`, 배경 `<rect rx="220">`(≈22%, components.md §7의 radius와 같다)
- 루트 `role="img" aria-labelledby`, 첫 자식 `<title>`이 라벨. 라벨은 모듈에 묶인 타일이면 `modules.json`의 `label`
- 모든 `id`는 `tl-tile-<타일 id>-` 접두. 한 문서에 여러 타일을 인라인해도 충돌하지 않는다
- 안 쓰는 defs·id·주석 없음, `<text>`·`<image>`·`<script>`·`<style>`·외부 참조 없음
- 색은 그림 안에 raw hex로 들어 있다. **일러스트는 서체와 같은 자산 계층**이라 토큰 규칙의 예외다(D-36). 배경 그라데이션 3색은 빌드가 `manifest.json`에 뽑아 둔다

## 파일

`manifest.json`이 목록이다. 키는 파일명, `module`은 `modules.json`의 모듈 id. 모듈에 묶이지 않은 타일(`module: null`)은 `label`을 직접 쓴다.

| 타일 | 모듈 | 비고 |
| --- | --- | --- |
| accounting | 회계 | |
| treasury | 자금 | |
| purchasing | 구매 | 원본은 물류 그림(손수레·상자). 구매 모듈에 배정 |
| sales | 영업 | |
| production | 생산 | |
| hr-payroll | 인사·급여 | |
| mail | 메일 | |
| approval | 전자결재 | |
| attendance | 근태 | |
| doc-editor | 문서작성 | 원본 파일명이 타사 제품명이어서 모듈 id로 바꿨다. 글리프(고리 + 가로 막대 셋)가 워드마크처럼 읽혀 **다시 그리기 권장**(문서 + 펜 같은 모티프) |
| customers | 고객 | 원본은 CRM 묶음 그림(반투명 원판 + 평면 청록 화살표). 가족 문법(흰 유광 순환 화살표 + 사람 + 청록 "+" 배지)으로 다시 그림(2026-11-07) |
| calendar | 일정 | 2026-11-07 추가분(9종). 원본 파일명 `일정.svg` |
| board | 게시판 | 원본 `게시판.svg` |
| messenger | 메신저 | 원본 `메신저.svg` |
| my-docs | 문서함 | 원본 `문서함.svg` |
| company-docs | 전사문서 | 원본 `전사문서.svg` |
| dept-docs | 부서문서 | 원본 `부서문서.svg` |
| opportunities | 영업기회 | 원본 파일명은 `영업기획.svg`(깔때기 그림). 모듈 id·라벨은 modules.json의 영업기회를 따른다 |
| quotes | 견적 | 원본 `견적.svg` |
| support | 상담 | 원본 `상담.svg` |
| expense | — | 지출결의. 대응 모듈이 없어 미배정. 모듈이 생기면 `module`만 채운다 |

타일이 없는 모듈: 0(모듈 20종 전부 타일이 있다). 생성형 폴백은 새 모듈이 생길 때까지 쓰이지 않는다. 함께 다시 받은 기존 10종(근태·매출·메일·물류·생산·임직원·자금일보·전자결재·지출결의·회계)은 경로 데이터가 소스와 같아 바꾸지 않았다.

## 추가 절차

1. `src/module-tiles/<모듈 id>.svg`로 저장하고 `manifest.json`에 줄을 더한다.
2. `pnpm --filter @terracelab/trellis-icons tiles:normalize` — id 접두·title·루트 속성을 맞추고 안 쓰는 defs를 지운다. 경로 데이터는 손대지 않는다.
3. `pnpm --filter @terracelab/trellis-icons build && pnpm --filter @terracelab/trellis-icons test`
4. 미리보기(`apps/preview`)의 아이콘 섹션에서 눈으로 확인한다.

## 산출물 (`dist/`)

- `module-tiles/<id>.svg` — 정규화된 단독 SVG(Figma로 바로 가져올 수 있다)
- `module-tiles/sprite.svg` — `<symbol id="tl-tile-<id>">` 모음. 문서에 한 번 넣고 `<svg><use href="#tl-tile-<id>"/></svg>`로 쓴다
- `module-tiles/manifest.json` — 타일·모듈·라벨·그라데이션 3색, 타일 없는 모듈 목록
- `module-tiles.js` / `.d.ts` — `moduleTiles`(id → svg 문자열) · `moduleTileSprite` · `moduleTileByModule` · `moduleTileManifest`. import 경로 `@terracelab/trellis-icons/module-tiles`

타사 제품의 자산은 쓰지 않는다. 이 그림들은 Patrick이 제공한 Trellis 자체 자산이다.
