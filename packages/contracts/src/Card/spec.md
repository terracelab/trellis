# Card
## 용도
화면 안의 한 덩어리(목록 · 표 · 요약)를 묶는다. 숫자 하나는 KpiCard, 차트는 ChartCard.
## 해부(Anatomy)
root(`bg.surface`, `border.divider`, `radius.lg`) · head(tone 아이콘 16 · title `type.h3` · subtitle `type.caption` fg.tertiary · action) · body(`density.card-padding`) · footer(위 구분선).
## Props
contract 표.
## Variants
padding default · none. emphasis 세 단계(PR-38, 한 화면에서 어디부터 볼지):

| emphasis | 모양 | 쓰는 자리 |
| --- | --- | --- |
| strong | 테두리 `border.strong` + 제목 `type.h2` | "지금 해야 할 것" 한 구역. 화면에 하나 |
| default | 테두리 `border.divider` + 제목 `type.h3` | 나머지 카드 |
| quiet | 테두리 · 면 없음(바탕 그대로), 안쪽 여백은 그대로 | 참고 정보 · 보조 목록. 카드 안 카드 대신 |

그림자 · 색 면 · 왼쪽 색 띠로 올리지 않는다(다크에서 그림자가 안 보이고, 색 면 · 띠는 장식으로 읽힌다). tone(info · success · warning · danger · neutral)은 제목 앞 상태 아이콘(Banner와 같은 모양, 톤 색)만 더하고 면 · 테두리 색은 그대로 둔다. 뜻은 제목 글자가 말한다("지난 기한 2건"). strong과 함께 쓰는 것이 기본이다.
## States
default.
## 동작
title이 있으면 `aria-labelledby`로 영역 이름이 된다. 제목 단계는 headingLevel(2 · 3 · 4), 없으면 문맥으로 정한다: 화면 바로 아래 카드는 h2(PageHeader h1 다음), 카드 안 카드는 한 단계 아래. 기본은 랜드마크가 아니고(div), landmark면 section + 제목 이름의 region이다. 법인마다 같은 제목 카드가 여러 개면 같은 이름 랜드마크가 겹치기 때문이다(R-33). 머리 · 바닥은 header · footer 요소가 아니라 div다(main 밖에서 banner · contentinfo가 되지 않게). 본문(children)이 비면 본문 칸을 그리지 않는다. footer가 제목 바로 아래에 붙고, 격자에서 늘어난 높이는 카드 아래 빈자리가 된다. 본문이 있으면 footer는 카드 맨 아래에 붙어 같은 줄 카드끼리 footer가 맞는다.
## 접근성
landmark면 `<section>` + 제목 연결. tone 아이콘은 꾸밈(aria-hidden)이라 상태는 제목 글자로 말한다.
## 밀도
안쪽 여백 `density.card-padding`(12 · 16).
## 플랫폼 차이
없음.
## 금지 사항
카드 안에 카드(→ quiet) · 그림자 강조(다크에서는 테두리로) · 한 화면에 strong 둘 이상 · 무게 4단계 이상(KpiCard · ChartCard도 세 단계 안에서) · 색 면 · 왼쪽 색 띠.
## 스토리
Emphasis(VRT) · Default · NoBody.
## 참고
—
