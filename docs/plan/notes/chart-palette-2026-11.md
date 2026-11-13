# 차트 계열 색 제안 (2026-11-07)

`color.chart.*` 14종을 semantic에 추가했다(G1 전 이름 추가 — 값은 가안, 전부 primitive alias). 선택 근거는 dataviz 검증기(`validate_palette.js`: OKLCH 밝기 띠·채도 바닥·CVD 인접쌍 ΔE·정상 시각 바닥·표면 대비)다. **5개 색상(hue)의 순열 24개 × 단계 조합**을 전부 돌려 라이트·다크 모두 통과하는 순서만 남겼다.

## 결정(가안)

| 슬롯 | Light | Dark | 뜻 |
| --- | --- | --- | --- |
| `chart.series.1` | brand.500 `#2F6BFF` | brand.400 `#5F91FF` | 단일 계열 · 이번 기간(ERP 색) |
| `chart.series.2` | green.500 `#1F9D55` | green.500 | 그룹웨어 색 |
| `chart.series.3` | violet.500 `#7C5CFF` | violet.400 `#9486FF` | ECM 색 |
| `chart.series.4` | teal.500 `#1BA3A3` | teal.500 | CRM 색 |
| `chart.series.5` | amber.600 `#CD8600` | amber.500 `#F5A524` | 보조 5번 |
| `chart.compare` | neutral.400 | neutral.400 | 직전 기간(점선) |
| `chart.grid` · `track` | neutral.100 | neutral.800 | 격자 · 트랙 |
| `chart.axis` | neutral.500 | neutral.400 | 축 글자(= fg.tertiary) |
| `chart.heat.1~5` | brand 100·200·300·600·800 | brand 950·900·800·700·600 | 순차 5단계(4~5 위 글자 ≥ 4.5:1) |
| `chart.heatInk` | base.white | neutral.50 | 4~5단계 위 글자 |

순서 = 모듈 순서(ERP·그룹웨어·ECM·CRM) + amber. D-34의 "차트 범주 색은 모듈 4색 + 상태색 보조"를 그대로 잇는다.

## 검증 결과

```
light  #2F6BFF,#1F9D55,#7C5CFF,#1BA3A3,#CD8600  surface #FFFFFF
  Lightness band PASS · Chroma PASS · CVD 인접쌍 worst ΔE 15.4 (protan, amber↔teal) PASS
  Normal-vision worst ΔE 22.3 PASS · Contrast WARN: amber.600 3.0:1 (경계) → 값 글자·표 대체 필수(relief)
dark   #5F91FF,#1F9D55,#9486FF,#1BA3A3,#F5A524  surface #252830
  모든 검사 PASS
```

- 떨어진 후보: amber.500은 라이트에서 밝기 띠 밖(L 0.78)·대비 2.0:1. teal.600은 채도 바닥 미달(0.097). green·red 인접은 CVD ΔE 3.9로 탈락 → red는 계열에 넣지 않는다(상태·금융 전용).
- 다크에서 모듈 400 단계는 green·teal이 띠 밖/채도 미달이라 500을 쓴다. 그래서 다크 계열 색 ≠ 다크 모듈 색(brand·violet만 같음). 받아들일지 사람이 판단(메모 A).
- 전체쌍(산점도·지도) 검증은 하지 않았다. 그 형식은 쓰지 않는다(components.md §11).

## 적용

- `packages/tokens/src/semantic/color.{light,dark}.json` `color.chart`, `docs/spec/tokens.md` §2 표, NAMES.lock 265개.
- 컴포넌트는 슬롯 이름(`series-1`…)만 받고 구현이 `var(--tl-color-chart-*)`로 바꾼다(`packages/contracts/src/charts/README.md`).
- 값을 바꾸면 이 검증을 라이트·다크 두 번 다시 돌리고 결과를 여기 갱신한다.
