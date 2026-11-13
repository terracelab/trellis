# 대비 테스트 결과와 값 변경 제안 — 2026-11-07

작성: P0-05 세션(에이전트). 승인: Patrick. 값은 아직 아무것도 바꾸지 않았다.

`docs/spec/tokens.md` §7의 대비 검사 30개 중 **5개가 실패**했고, 모두 라이트 모드다. 다크 모드와 수입·지출 색차는 전부 통과했다. 아래 표에서 항목마다 추천안 또는 대안을 골라 주면 다음 세션이 값을 바꾸고 테스트와 산출물 스냅샷을 갱신한다.

재현 명령:

```bash
pnpm --filter @terracelab/trellis-tokens exec vitest run test/contrast.test.ts
```

## 1. 실패 5쌍과 제안

| # | 조합(라이트) | 현재 값 | 대비 | 제안 값 | 제안 대비 | 영향 토큰 |
|---|---|---|---:|---|---:|---|
| 1(✅ 2026-11-08 대안 A 채택) | `brand.onBrand` / `brand.default` | 흰색 on brand.500 `#2F6BFF` | 4.499 | **추천 B:** primitive brand 기준값 `#2F6BFF` → `#2E6AFE` | 4.556 | `color.brand.50~950` 재생성(전부 미세 변화). 색차 ΔEOK 0.30이라 눈으로 구분되지 않는다 |
| | | | | 대안 A: `brand.default` → brand.600 `#1F56E2`, `hover` → 700, `active` → 800 | 6.02 | 라이트 `brand.default·hover·active`. 주요 버튼이 한 단계 진해진다 |
| 2 | `approval.draft.default` / `.subtle` | neutral.500 `#6B7280` on neutral.100 `#E5E7EA` | 3.90 | default → neutral.700 `#474D58` | 6.86 | 라이트 `approval.draft.default` |
| 3 | `approval.pending.default` / `.subtle` | amber.600 `#CD8600` on amber.50 `#FCF4EA` | 2.75 | default → amber.800 `#734A00` | 7.11 | 라이트 `approval.pending.default`. amber.700은 4.36으로 모자란다 |
| 4 | `approval.approved.default` / `.subtle` | green.600 `#008543` on green.50 `#EEF8F0` | 4.36 | default → green.700 `#006934` | 6.29 | 라이트 `approval.approved.default` |
| 5 | `approval.withdrawn.default` / `.subtle` | neutral.400 `#8A909C` on neutral.100 `#E5E7EA` | 2.59 | default → neutral.600 `#59606D` | 5.11 | 라이트 `approval.withdrawn.default`. 기안(700)보다 옅게 유지된다 |

1번은 D-10에서 예상한 경계값이다. 추천을 B로 둔 이유는 브랜드 블루의 인상을 그대로 두고 원인인 기준값만 고치기 때문이다. A는 alias만 바꿔 primitive가 그대로지만 주요 버튼 색이 눈에 띄게 진해진다.

2~5번은 결재 배지 글자색을 한두 단계 진하게 내리는 안이다. 이 토큰은 배지의 **점**에도 쓰이므로 점도 같이 진해진다. 점은 지금 색을 유지하고 싶다면 아래 2절의 이름 추가가 필요하다.

## 2. §7 밖에서 발견한 것 — 판단 요청

테스트 대상은 아니지만 미리보기와 컴포넌트에서 바로 드러날 문제다.

| 관찰 | 수치 | 제안 |
|---|---|---|
| 상태 배지를 `status.*.subtle` 바탕에 `status.*.default` 글자로 그리면 라이트 success·warning이 미달 | success 4.36, warning 2.75 (info 5.51, danger 4.89는 통과) | §7에 `status.*.default / status.*.subtle` 조합을 추가하고 결재와 같은 방식으로 단계를 내린다. 또는 배지 글자는 `fg.primary`로 쓰고 점만 상태색으로 그린다 |
| 결재·상태 토큰 하나가 글자와 점을 함께 맡는다 | — | 글자 전용 이름(`approval.*.text`, `status.*.text`)을 추가하면 점은 밝게, 글자는 진하게 둘 수 있다. **이름 추가는 G1 동결 전에만 쉽다** |
| 다크에서 기안과 회수가 같은 색 | 둘 다 neutral.300 on neutral.900 (7.10) | §2 "Dark 규칙"의 "neutral은 300"을 그대로 따른 결과다. 회수 다크를 neutral.400으로 두면 4.60으로 통과하면서 구분된다 |
| 다크에서 기안·회수 배지 바탕이 카드 바탕과 같다 | 둘 다 neutral.900 | 카드 위에서 배지 면이 보이지 않는다. neutral.800으로 올리면 회수 글자(400)가 3.56으로 미달이라, D2에 따라 **Phase 3 다크 검수(P3-15)로 미루는 것**을 추천한다 |
| 수입 빨강을 `bg.sunken` 위에 쓰면 라이트에서 미달 | `finance.income` on `bg.sunken` 4.31 (지출 파랑은 4.86으로 통과) | 2026-11-07 쇼케이스 자금 위젯에서 발견해 미리보기는 카드 바탕으로 옮겼다. 금액 색은 surface 위에서만 쓰도록 KpiCard·StatRow(P2-06) 규칙에 적거나, §7에 sunken 조합을 추가한다 |
| 힌트 글자를 캔버스 위에 직접 쓰면 라이트에서 미달 | `fg.tertiary` on `bg.canvas` 4.47, on `bg.sunken` 3.90 | 힌트·타임스탬프는 카드 위에서만 쓰도록 컴포넌트 규칙에 적거나, §7에 canvas 조합을 추가한다 |

## 3. 통과한 항목

- 라이트·다크 `fg.primary` / `bg.surface`: 14.74 · 13.63 (기준 12)
- 다크 상태 `on` / `default` 4쌍, `brand.onBrand` / `brand.default`, 결재 5쌍 전부 통과
- 수입 빨강 vs 지출 파랑 ΔEOK ×100: 라이트 35.3, 다크 29.0 (기준 20)

## 4. 승인 방법

1절 각 항목에 "추천", "대안", "보류" 중 하나를, 2절 각 항목(6건)에 "반영" 또는 "보류"를 적어 주면 된다. 반영은 다음 세션이 한다: `scales.config.json` 또는 semantic 파일 수정 → `pnpm --filter @terracelab/trellis-tokens gen:colors` → 테스트 → 스냅샷 갱신(`vitest -u`, 변경 이유를 커밋에 기록) → 이 문서에 승인 날짜 기록.
