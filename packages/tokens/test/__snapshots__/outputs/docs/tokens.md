# Trellis 토큰

> 생성물 — 수정 금지. pnpm --filter @terracelab/trellis-tokens build

## Semantic 색

대비는 같은 모드의 `color.bg.surface` 위에서 잰 WCAG 2 대비(알파 색은 합성 후).

| 토큰 | Light | Dark | 대비 L | 대비 D | 용도 |
| --- | --- | --- | ---: | ---: | --- |
| `--tl-color-bg-canvas` | `#F3F4F6` ← `color.neutral.100` | `#141414` ← `color.graphite.950` | 1.10 | 1.08 | 앱 바탕 |
| `--tl-color-bg-surface` | `#FFFFFF` ← `color.base.white` | `#1C1C1E` ← `color.graphite.900` | 1.00 | 1.00 | 카드·패널 |
| `--tl-color-bg-elevated` | `#FFFFFF` ← `color.base.white` | `#2C2C2F` ← `color.graphite.700` | 1.00 | 1.22 | 드롭다운·팝오버 |
| `--tl-color-bg-sunken` | `#F7F7F8` ← `color.neutral.50` | `#232326` ← `color.graphite.800` | 1.07 | 1.09 | 입력 배경·그리드 헤더 |
| `--tl-color-bg-nav` | `#3A3331` ← `color.shell.800` | `#2B2422` ← `color.shell.925` | 12.37 | 1.12 | 사이드바 면. 브랜드 가장 짙은 단계(라이트 · 다크 같은 값). 위 글자 · 아이콘은 color.nav.*(PR-27) |
| `--tl-color-bg-overlay` | `#00000066` ← `color.alpha.black.40` | `#00000099` ← `color.alpha.black.60` | 2.85 | 1.16 | 모달 뒤 |
| `--tl-color-bg-row-selected` | `#FF886714` ← `color.alpha.brand.8` | `#FF886729` ← `color.alpha.brand.16` | 1.06 | 1.32 | 표 · 목록의 선택 행 바탕(D-97) |
| `--tl-color-nav-fg` | `#EAE1DE` ← `color.shell.100` | `#EAE1DE` ← `color.shell.100` | 1.29 | 13.23 | 사이드바 항목 글자(쉴 때) |
| `--tl-color-nav-fg-muted` | `#BDB4B2` ← `color.shell.300` | `#BDB4B2` ← `color.shell.300` | 2.03 | 8.37 | 사이드바 묶음 이름 · 아이콘 · 펼침 표시 |
| `--tl-color-nav-fg-active` | `#FFFFFF` ← `color.base.white` | `#FFFFFF` ← `color.base.white` | 1.00 | 17.01 | 사이드바 지금 화면 · 가리킨 항목 글자 |
| `--tl-color-nav-hover` | `#423A38` ← `color.shell.750` | `#332C2A` ← `color.shell.900` | 11.09 | 1.24 | 사이드바 항목을 가리켰을 때 면 |
| `--tl-color-nav-selected` | `#4A4341` ← `color.shell.700` | `#3A3331` ← `color.shell.800` | 9.68 | 1.38 | 사이드바 지금 화면 항목 면 |
| `--tl-color-nav-border` | `#423A38` ← `color.shell.750` | `#332C2A` ← `color.shell.900` | 11.09 | 1.24 | 사이드바 안 구분선 |
| `--tl-color-nav-focus` | `#FE5C2B` ← `color.brand.500` | `#FE5C2B` ← `color.brand.500` | 3.10 | 5.49 | 사이드바 위 포커스 링(nav 면 위 3:1) |
| `--tl-color-nav-sub` | `#352E2C` ← `color.shell.850` | `#251E1D` ← `color.shell.950` | 13.30 | 1.04 | 사이드바 하위 메뉴 묶음 면(D-97) |
| `--tl-color-avatar-1-bg` | `#DBE7FF` ← `color.blue.100` | `#031D6E` ← `color.blue.900` | 1.24 | 1.14 | 아바타 글자 바탕(파랑) |
| `--tl-color-avatar-1-fg` | `#1141BE` ← `color.blue.700` | `#BFD4FF` ← `color.blue.200` | 8.32 | 11.41 | 아바타 글자(파랑) |
| `--tl-color-avatar-2-bg` | `#DAEEDF` ← `color.green.100` | `#003617` ← `color.green.900` | 1.22 | 1.25 | 아바타 글자 바탕(초록) |
| `--tl-color-avatar-2-fg` | `#006934` ← `color.green.700` | `#BBE2C5` ← `color.green.200` | 6.84 | 11.99 | 아바타 글자(초록) |
| `--tl-color-avatar-3-bg` | `#E5E5FF` ← `color.violet.100` | `#2B116C` ← `color.violet.900` | 1.24 | 1.13 | 아바타 글자 바탕(보라) |
| `--tl-color-avatar-3-fg` | `#5331BC` ← `color.violet.700` | `#D1D0FF` ← `color.violet.200` | 8.29 | 11.49 | 아바타 글자(보라) |
| `--tl-color-avatar-4-bg` | `#DAEEEE` ← `color.teal.100` | `#003535` ← `color.teal.900` | 1.20 | 1.26 | 아바타 글자 바탕(청록) |
| `--tl-color-avatar-4-fg` | `#006B6B` ← `color.teal.700` | `#BCE3E2` ← `color.teal.200` | 6.33 | 12.33 | 아바타 글자(청록) |
| `--tl-color-avatar-5-bg` | `#FCEBD8` ← `color.amber.100` | `#4A2E00` ← `color.amber.900` | 1.17 | 1.36 | 아바타 글자 바탕(호박) |
| `--tl-color-avatar-5-fg` | `#734A00` ← `color.amber.800` | `#FEDFBA` ← `color.amber.200` | 7.75 | 13.35 | 아바타 글자(호박) |
| `--tl-color-avatar-6-bg` | `#FFE0DE` ← `color.red.100` | `#59000C` ← `color.red.900` | 1.24 | 1.16 | 아바타 글자 바탕(빨강) |
| `--tl-color-avatar-6-fg` | `#A31A27` ← `color.red.700` | `#FFC8C4` ← `color.red.200` | 7.68 | 11.59 | 아바타 글자(빨강) |
| `--tl-color-fg-primary` | `#1F2937` ← `color.neutral.800` | `#DCDCDC` ← `color.graphite.100` | 14.68 | 12.41 | 본문. surface 대비 12:1 이상 |
| `--tl-color-fg-secondary` | `#374151` ← `color.neutral.700` | `#A6A6A6` ← `color.graphite.200` | 10.31 | 6.99 | 보조 글자. 4.5:1 이상(PR-26: 600 → 700, 가독성) |
| `--tl-color-fg-tertiary` | `#646B78` ← `color.neutral.500` | `#9A9A9A` ← `color.graphite.300` | 5.36 | 6.05 | 힌트·타임스탬프. 4.5:1 이상(PR-26: 500 → 600, canvas 위 4.47:1이던 것) |
| `--tl-color-fg-disabled` | `#9CA3AF` ← `color.neutral.400` | `#6E6E73` ← `color.graphite.400` | 2.54 | 3.36 | 비활성 글자(대비 예외) |
| `--tl-color-fg-inverse` | `#FFFFFF` ← `color.base.white` | `#111827` ← `color.neutral.900` | 1.00 | 1.04 | 진한 배경 위 글자 |
| `--tl-color-fg-link` | `#CC3A00` ← `color.brand.600` | `#FF8867` ← `color.brand.400` | 5.03 | 7.27 | 링크 |
| `--tl-color-fg-strong` | `#111827` ← `color.neutral.900` | `#F2F2F2` ← `color.graphite.50` | 17.74 | 15.20 | 제목 · 강조 값. fg.primary보다 한 단계 진하다(D-97) |
| `--tl-color-border-default` | `#E5E7EB` ← `color.neutral.200` | `#3A3A3D` ← `color.graphite.600` | 1.24 | 1.50 | 입력·카드 테두리 |
| `--tl-color-border-strong` | `#D1D5DB` ← `color.neutral.300` | `#4A4A4E` ← `color.graphite.500` | 1.47 | 1.93 | 강조 테두리, 다크에서 그림자 대체 |
| `--tl-color-border-focus` | `#CC3A00` ← `color.brand.600` | `#FF8867` ← `color.brand.400` | 5.03 | 7.27 | 포커스 링 2px |
| `--tl-color-border-selected` | `#CC3A00` ← `color.brand.600` | `#FF8867` ← `color.brand.400` | 5.03 | 7.27 | 선택 · 현재 표시 선(1px 테두리 · 탭 밑줄 · 진행 단계). surface 대비 3:1 이상(PR-26) |
| `--tl-color-border-divider` | `#E5E7EB` ← `color.neutral.200` | `#3A3A3D` ← `color.graphite.600` | 1.24 | 1.50 | 구분선 |
| `--tl-color-border-focus-strong` | `#A22C00` ← `color.brand.700` | `#FFB39D` ← `color.brand.300` | 7.25 | 9.87 | 포커스 강조 모드(data-focus="strong") · 고대비의 포커스 링. 면 · 바탕 위 4.5:1(D-97) |
| `--tl-color-border-hover` | `#9CA3AF` ← `color.neutral.400` | `#6E6E73` ← `color.graphite.400` | 2.54 | 3.36 | 입력 칸을 가리켰을 때 테두리(식자재 ERP line-strong, D-97) |
| `--tl-color-brand-default` | `#CC3A00` ← `color.brand.600` | `#CC3A00` ← `color.brand.600` | 5.03 | 3.38 | 주요 액션(D-10 주의) (2026-11-08 승인: 600. 흰 글자 대비 6.0:1) |
| `--tl-color-brand-hover` | `#A22C00` ← `color.brand.700` | `#A22C00` ← `color.brand.700` | 7.25 | 2.35 | 주요 액션 hover. 라이트는 한 단계 진하게, 다크는 밝게 |
| `--tl-color-brand-active` | `#7A1F00` ← `color.brand.800` | `#7A1F00` ← `color.brand.800` | 10.38 | 1.64 | 주요 액션 active |
| `--tl-color-brand-subtle` | `#FFF2EE` ← `color.brand.50` | `#FF886729` ← `color.alpha.brand.16` | 1.09 | 1.32 | 선택 배경 |
| `--tl-color-brand-on-brand` | `#FFFFFF` ← `color.base.white` | `#FFFFFF` ← `color.base.white` | 1.00 | 17.01 | 브랜드 위 글자 |
| `--tl-color-brand-tint` | `#FFE4DC` ← `color.brand.100` | `#FF88673D` ← `color.alpha.brand.24` | 1.21 | 1.56 | 옅은 강조 면(기간 사이 띠 · 지금 고치는 칸 · 끌어 놓을 자리 · 진행 막대 트랙). 위 글자는 fg.primary(D-97) |
| `--tl-color-brand-accent` | `#FE5C2B` ← `color.brand.500` | `#FE5C2B` ← `color.brand.500` | 3.10 | 5.49 | 회사 색 그대로의 강조(진행 막대 · 로고 · 선택 표시 점). 글자가 아닌 표시라 면 위 3:1(D-97) |
| `--tl-color-status-info-default` | `#1F56E2` ← `color.blue.600` | `#5F91FF` ← `color.blue.400` | 6.02 | 5.66 | 정보: 아이콘·테두리·글자 |
| `--tl-color-status-info-subtle` | `#F0F5FF` ← `color.blue.50` | `#5F91FF29` ← `color.alpha.blue.16` | 1.09 | 1.27 | 정보: 배지·토스트 배경 |
| `--tl-color-status-info-on` | `#FFFFFF` ← `color.base.white` | `#030712` ← `color.neutral.950` | 1.00 | 1.18 | 정보: default 위 글자 |
| `--tl-color-status-success-default` | `#008543` ← `color.green.600` | `#5AB577` ← `color.green.400` | 4.73 | 6.73 | 성공: 아이콘·테두리·글자 |
| `--tl-color-status-success-subtle` | `#EEF8F0` ← `color.green.50` | `#5AB57729` ← `color.alpha.green.16` | 1.09 | 1.32 | 성공: 배지·토스트 배경 |
| `--tl-color-status-success-on` | `#FFFFFF` ← `color.base.white` | `#030712` ← `color.neutral.950` | 1.00 | 1.18 | 성공: default 위 글자 |
| `--tl-color-status-warning-default` | `#CD8600` ← `color.amber.600` | `#FBB85C` ← `color.amber.400` | 3.00 | 9.81 | 경고: 아이콘·테두리·글자 |
| `--tl-color-status-warning-subtle` | `#FCF4EA` ← `color.amber.50` | `#FBB85C29` ← `color.alpha.amber.16` | 1.09 | 1.42 | 경고: 배지·토스트 배경 |
| `--tl-color-status-warning-on` | `#111827` ← `color.neutral.900` | `#030712` ← `color.neutral.950` | 17.74 | 1.18 | 경고: default 위 글자 |
| `--tl-color-status-danger-default` | `#C7313A` ← `color.red.600` | `#F67270` ← `color.red.400` | 5.35 | 6.12 | 위험: 아이콘·테두리·글자 |
| `--tl-color-status-danger-subtle` | `#FFF2F0` ← `color.red.50` | `#F6727029` ← `color.alpha.red.16` | 1.09 | 1.28 | 위험: 배지·토스트 배경 |
| `--tl-color-status-danger-on` | `#FFFFFF` ← `color.base.white` | `#030712` ← `color.neutral.950` | 1.00 | 1.18 | 위험: default 위 글자 |
| `--tl-color-finance-income` | `#C7313A` ← `color.red.600` | `#F67270` ← `color.red.400` | 5.35 | 6.12 | 수입·증가(빨강 고정) |
| `--tl-color-finance-expense` | `#1F56E2` ← `color.blue.600` | `#5F91FF` ← `color.blue.400` | 6.02 | 5.66 | 지출·감소(파랑 고정) |
| `--tl-color-finance-neutral` | `#4B5563` ← `color.neutral.600` | `#A6A6A6` ← `color.graphite.200` | 7.56 | 6.99 | 변동 없음 |
| `--tl-color-approval-draft-default` | `#646B78` ← `color.neutral.500` | `#A6A6A6` ← `color.graphite.200` | 5.36 | 6.99 | 결재 기안: 배지 점 · 결재선 표시(글자는 text) |
| `--tl-color-approval-draft-subtle` | `#F3F4F6` ← `color.neutral.100` | `#2C2C2F` ← `color.graphite.700` | 1.10 | 1.22 | 결재 기안: 배지 배경 |
| `--tl-color-approval-draft-text` | `#374151` ← `color.neutral.700` | `#DCDCDC` ← `color.graphite.100` | 10.31 | 12.41 | 결재 기안: 배지 글자(subtle 위 4.5:1, D-64) |
| `--tl-color-approval-pending-default` | `#CD8600` ← `color.amber.600` | `#FBB85C` ← `color.amber.400` | 3.00 | 9.81 | 결재 진행: 배지 점 · 결재선 표시(글자는 text) |
| `--tl-color-approval-pending-subtle` | `#FCF4EA` ← `color.amber.50` | `#221200` ← `color.amber.950` | 1.09 | 1.07 | 결재 진행: 배지 배경 |
| `--tl-color-approval-pending-text` | `#734A00` ← `color.amber.800` | `#FBB85C` ← `color.amber.400` | 7.75 | 9.81 | 결재 진행: 배지 글자(subtle 위 4.5:1, D-64) |
| `--tl-color-approval-approved-default` | `#008543` ← `color.green.600` | `#5AB577` ← `color.green.400` | 4.73 | 6.73 | 결재 승인: 배지 점 · 결재선 표시(글자는 text) |
| `--tl-color-approval-approved-subtle` | `#EEF8F0` ← `color.green.50` | `#001C09` ← `color.green.950` | 1.09 | 1.05 | 결재 승인: 배지 배경 |
| `--tl-color-approval-approved-text` | `#006934` ← `color.green.700` | `#5AB577` ← `color.green.400` | 6.84 | 6.73 | 결재 승인: 배지 글자(subtle 위 4.5:1, D-64) |
| `--tl-color-approval-rejected-default` | `#C7313A` ← `color.red.600` | `#F67270` ← `color.red.400` | 5.35 | 6.12 | 결재 반려: 배지 점 · 결재선 표시(글자는 text) |
| `--tl-color-approval-rejected-subtle` | `#FFF2F0` ← `color.red.50` | `#320004` ← `color.red.950` | 1.09 | 1.09 | 결재 반려: 배지 배경 |
| `--tl-color-approval-rejected-text` | `#C7313A` ← `color.red.600` | `#F67270` ← `color.red.400` | 5.35 | 6.12 | 결재 반려: 배지 글자(subtle 위 4.5:1, D-64) |
| `--tl-color-approval-withdrawn-default` | `#9CA3AF` ← `color.neutral.400` | `#9A9A9A` ← `color.graphite.300` | 2.54 | 6.05 | 결재 회수: 배지 점 · 결재선 표시(글자는 text) |
| `--tl-color-approval-withdrawn-subtle` | `#F3F4F6` ← `color.neutral.100` | `#2C2C2F` ← `color.graphite.700` | 1.10 | 1.22 | 결재 회수: 배지 배경 |
| `--tl-color-approval-withdrawn-text` | `#4B5563` ← `color.neutral.600` | `#9A9A9A` ← `color.graphite.300` | 7.56 | 6.05 | 결재 회수: 배지 글자(subtle 위 4.5:1, D-64) |
| `--tl-color-module-erp-default` | `#2F6BFF` ← `color.blue.500` | `#5F91FF` ← `color.blue.400` | 4.50 | 5.66 | ERP: 사이드바 활성·배지 |
| `--tl-color-module-erp-subtle` | `#F0F5FF` ← `color.blue.50` | `#5F91FF29` ← `color.alpha.blue.16` | 1.09 | 1.27 | ERP: 모듈 카드 배경 |
| `--tl-color-module-erp-gradient-from` | `#5F91FF` ← `color.blue.400` | `#5F91FF` ← `color.blue.400` | 3.01 | 5.66 | ERP: 앱 아이콘 그라데이션 위(밝게) |
| `--tl-color-module-erp-gradient-to` | `#1F56E2` ← `color.blue.600` | `#1F56E2` ← `color.blue.600` | 6.02 | 2.83 | ERP: 앱 아이콘 그라데이션 아래(진하게) |
| `--tl-color-module-groupware-default` | `#1F9D55` ← `color.green.500` | `#5AB577` ← `color.green.400` | 3.49 | 6.73 | 그룹웨어: 사이드바 활성·배지 |
| `--tl-color-module-groupware-subtle` | `#EEF8F0` ← `color.green.50` | `#5AB57729` ← `color.alpha.green.16` | 1.09 | 1.32 | 그룹웨어: 모듈 카드 배경 |
| `--tl-color-module-groupware-gradient-from` | `#5AB577` ← `color.green.400` | `#5AB577` ← `color.green.400` | 2.53 | 6.73 | 그룹웨어: 앱 아이콘 그라데이션 위(밝게) |
| `--tl-color-module-groupware-gradient-to` | `#008543` ← `color.green.600` | `#008543` ← `color.green.600` | 4.73 | 3.59 | 그룹웨어: 앱 아이콘 그라데이션 아래(진하게) |
| `--tl-color-module-ecm-default` | `#7C5CFF` ← `color.violet.500` | `#9486FF` ← `color.violet.400` | 4.35 | 5.76 | ECM: 사이드바 활성·배지 |
| `--tl-color-module-ecm-subtle` | `#F4F4FF` ← `color.violet.50` | `#9486FF29` ← `color.alpha.violet.16` | 1.09 | 1.28 | ECM: 모듈 카드 배경 |
| `--tl-color-module-ecm-gradient-from` | `#9486FF` ← `color.violet.400` | `#9486FF` ← `color.violet.400` | 2.95 | 5.76 | ECM: 앱 아이콘 그라데이션 위(밝게) |
| `--tl-color-module-ecm-gradient-to` | `#6846E1` ← `color.violet.600` | `#6846E1` ← `color.violet.600` | 5.91 | 2.88 | ECM: 앱 아이콘 그라데이션 아래(진하게) |
| `--tl-color-module-crm-default` | `#1BA3A3` ← `color.teal.500` | `#5AB8B8` ← `color.teal.400` | 3.08 | 7.28 | CRM: 사이드바 활성·배지 |
| `--tl-color-module-crm-subtle` | `#EDF7F7` ← `color.teal.50` | `#5AB8B829` ← `color.alpha.teal.16` | 1.09 | 1.33 | CRM: 모듈 카드 배경 |
| `--tl-color-module-crm-gradient-from` | `#5AB8B8` ← `color.teal.400` | `#5AB8B8` ← `color.teal.400` | 2.34 | 7.28 | CRM: 앱 아이콘 그라데이션 위(밝게) |
| `--tl-color-module-crm-gradient-to` | `#008989` ← `color.teal.600` | `#008989` ← `color.teal.600` | 4.25 | 4.00 | CRM: 앱 아이콘 그라데이션 아래(진하게) |
| `--tl-color-module-scm-default` | `#F5A524` ← `color.amber.500` | `#FBB85C` ← `color.amber.400` | 2.04 | 9.81 | 유통·물류: 사이드바 활성·배지(가안, D-53) |
| `--tl-color-module-scm-subtle` | `#FCF4EA` ← `color.amber.50` | `#FBB85C29` ← `color.alpha.amber.16` | 1.09 | 1.42 | 유통·물류: 모듈 카드 배경(가안) |
| `--tl-color-module-scm-gradient-from` | `#FBB85C` ← `color.amber.400` | `#FBB85C` ← `color.amber.400` | 1.73 | 9.81 | 유통·물류: 앱 아이콘 그라데이션 위(가안) |
| `--tl-color-module-scm-gradient-to` | `#CD8600` ← `color.amber.600` | `#CD8600` ← `color.amber.600` | 3.00 | 5.68 | 유통·물류: 앱 아이콘 그라데이션 아래(가안) |
| `--tl-color-module-commerce-default` | `#E5484D` ← `color.red.500` | `#F67270` ← `color.red.400` | 3.91 | 6.12 | 이커머스: 사이드바 활성·배지(가안, D-53) |
| `--tl-color-module-commerce-subtle` | `#FFF2F0` ← `color.red.50` | `#F6727029` ← `color.alpha.red.16` | 1.09 | 1.28 | 이커머스: 모듈 카드 배경(가안) |
| `--tl-color-module-commerce-gradient-from` | `#F67270` ← `color.red.400` | `#F67270` ← `color.red.400` | 2.78 | 6.12 | 이커머스: 앱 아이콘 그라데이션 위(가안) |
| `--tl-color-module-commerce-gradient-to` | `#C7313A` ← `color.red.600` | `#C7313A` ← `color.red.600` | 5.35 | 3.18 | 이커머스: 앱 아이콘 그라데이션 아래(가안) |
| `--tl-color-module-mes-default` | `#4B5563` ← `color.neutral.600` | `#9A9A9A` ← `color.graphite.300` | 7.56 | 6.05 | 제조: 사이드바 활성·배지(가안, D-53) |
| `--tl-color-module-mes-subtle` | `#F7F7F8` ← `color.neutral.50` | `#9CA3AF29` ← `color.alpha.neutral.16` | 1.07 | 1.33 | 제조: 모듈 카드 배경(가안) |
| `--tl-color-module-mes-gradient-from` | `#9CA3AF` ← `color.neutral.400` | `#9CA3AF` ← `color.neutral.400` | 2.54 | 6.70 | 제조: 앱 아이콘 그라데이션 위(가안) |
| `--tl-color-module-mes-gradient-to` | `#374151` ← `color.neutral.700` | `#374151` ← `color.neutral.700` | 10.31 | 1.65 | 제조: 앱 아이콘 그라데이션 아래(가안) |
| `--tl-color-module-on-tile` | `#FFFFFF` ← `color.base.white` | `#FFFFFF` ← `color.base.white` | 1.00 | 17.01 | 모듈 앱 아이콘(생성형 폴백) 위 라인 · 글자. 라이트 · 다크 모두 흰색(D-36, 가안) |
| `--tl-color-chart-series-1` | `#2F6BFF` ← `color.blue.500` | `#5F91FF` ← `color.blue.400` | 4.50 | 5.66 | 차트 계열 1: 단일·이번 기간(ERP 색) |
| `--tl-color-chart-series-2` | `#1F9D55` ← `color.green.500` | `#1F9D55` ← `color.green.500` | 3.49 | 4.87 | 차트 계열 2(그룹웨어 색) |
| `--tl-color-chart-series-3` | `#7C5CFF` ← `color.violet.500` | `#9486FF` ← `color.violet.400` | 4.35 | 5.76 | 차트 계열 3(ECM 색) |
| `--tl-color-chart-series-4` | `#1BA3A3` ← `color.teal.500` | `#1BA3A3` ← `color.teal.500` | 3.08 | 5.52 | 차트 계열 4(CRM 색) |
| `--tl-color-chart-series-5` | `#CD8600` ← `color.amber.600` | `#F5A524` ← `color.amber.500` | 3.00 | 8.34 | 차트 계열 5(보조, amber) |
| `--tl-color-chart-compare` | `#9CA3AF` ← `color.neutral.400` | `#9A9A9A` ← `color.graphite.300` | 2.54 | 6.05 | 비교·직전 기간(점선·회색) |
| `--tl-color-chart-grid` | `#E5E7EB` ← `color.neutral.200` | `#3A3A3D` ← `color.graphite.600` | 1.24 | 1.50 | 차트 격자선 |
| `--tl-color-chart-axis` | `#646B78` ← `color.neutral.500` | `#9A9A9A` ← `color.graphite.300` | 5.36 | 6.05 | 차트 축 글자·눈금 |
| `--tl-color-chart-track` | `#F3F4F6` ← `color.neutral.100` | `#2C2C2F` ← `color.graphite.700` | 1.10 | 1.22 | 막대 트랙·빈 칸·도넛 바탕 |
| `--tl-color-chart-heat-1` | `#DBE7FF` ← `color.blue.100` | `#000B46` ← `color.blue.950` | 1.24 | 1.09 | 순차(히트맵) 1단계: 가장 옅음 |
| `--tl-color-chart-heat-2` | `#BFD4FF` ← `color.blue.200` | `#031D6E` ← `color.blue.900` | 1.49 | 1.14 | 순차 2단계 |
| `--tl-color-chart-heat-3` | `#94B8FF` ← `color.blue.300` | `#082E96` ← `color.blue.800` | 1.99 | 1.49 | 순차 3단계. 1~3 위 글자는 fg.primary |
| `--tl-color-chart-heat-4` | `#1F56E2` ← `color.blue.600` | `#1141BE` ← `color.blue.700` | 6.02 | 2.04 | 순차 4단계. 4~5 위 글자는 chart.heatInk |
| `--tl-color-chart-heat-5` | `#082E96` ← `color.blue.800` | `#1F56E2` ← `color.blue.600` | 11.40 | 2.83 | 순차 5단계: 가장 진함 |
| `--tl-color-chart-heat-ink` | `#FFFFFF` ← `color.base.white` | `#F2F2F2` ← `color.graphite.50` | 1.00 | 15.20 | 순차 4~5단계 위 글자(흰색) |

## Primitive 색

| hue | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 750 | 800 | 850 | 900 | 925 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| brand | `#FFF2EE` | `#FFE4DC` | `#FFD0C3` | `#FFB39D` | `#FF8867` | `#FE5C2B` | `#CC3A00` | `#A22C00` | – | `#7A1F00` | – | `#541200` | – | `#2E0600` |
| shell | – | `#EAE1DE` | – | `#BDB4B2` | – | – | `#5B5351` | `#4A4341` | `#423A38` | `#3A3331` | `#352E2C` | `#332C2A` | `#2B2422` | `#251E1D` |
| blue | `#F0F5FF` | `#DBE7FF` | `#BFD4FF` | `#94B8FF` | `#5F91FF` | `#2F6BFF` | `#1F56E2` | `#1141BE` | – | `#082E96` | – | `#031D6E` | – | `#000B46` |
| neutral | `#F7F7F8` | `#F3F4F6` | `#E5E7EB` | `#D1D5DB` | `#9CA3AF` | `#646B78` | `#4B5563` | `#374151` | – | `#1F2937` | – | `#111827` | – | `#030712` |
| graphite | `#F2F2F2` | `#DCDCDC` | `#A6A6A6` | `#9A9A9A` | `#6E6E73` | `#4A4A4E` | `#3A3A3D` | `#2C2C2F` | – | `#232326` | – | `#1C1C1E` | – | `#141414` |
| red | `#FFF2F0` | `#FFE0DE` | `#FFC8C4` | `#FFA29D` | `#F67270` | `#E5484D` | `#C7313A` | `#A31A27` | – | `#7E0818` | – | `#59000C` | – | `#320004` |
| green | `#EEF8F0` | `#DAEEDF` | `#BBE2C5` | `#91CFA1` | `#5AB577` | `#1F9D55` | `#008543` | `#006934` | – | `#004F25` | – | `#003617` | – | `#001C09` |
| amber | `#FCF4EA` | `#FCEBD8` | `#FEDFBA` | `#FFCE91` | `#FBB85C` | `#F5A524` | `#CD8600` | `#9F6700` | – | `#734A00` | – | `#4A2E00` | – | `#221200` |
| violet | `#F4F4FF` | `#E5E5FF` | `#D1D0FF` | `#B5B1FF` | `#9486FF` | `#7C5CFF` | `#6846E1` | `#5331BC` | – | `#3F2094` | – | `#2B116C` | – | `#170244` |
| teal | `#EDF7F7` | `#DAEEEE` | `#BCE3E2` | `#92D0D0` | `#5AB8B8` | `#1BA3A3` | `#008989` | `#006B6B` | – | `#005050` | – | `#003535` | – | `#001B1B` |

## 그 밖의 primitive

| 토큰 | 값 | 설명 |
| --- | --- | --- |
| `--tl-border-width-1` | `1px` |  |
| `--tl-border-width-2` | `2px` |  |
| `--tl-border-width-3` | `3px` | 포커스 강조 모드의 포커스 링(data-focus="strong", D-97) |
| `--tl-breakpoint-sm` | `640px` |  |
| `--tl-breakpoint-md` | `768px` |  |
| `--tl-breakpoint-lg` | `1024px` |  |
| `--tl-breakpoint-xl` | `1280px` |  |
| `--tl-breakpoint-2xl` | `1536px` |  |
| `--tl-color-alpha-black-40` | `#00000066` | 검정 40% — 라이트 오버레이(식자재 ERP backdrop, D-97) |
| `--tl-color-alpha-black-48` | `#0000007A` | 검정 48% — 라이트 오버레이(D-14) |
| `--tl-color-alpha-black-60` | `#00000099` | 검정 60% — 다크 오버레이(식자재 ERP backdrop, D-97) |
| `--tl-color-alpha-black-64` | `#000000A3` | 검정 64% — 다크 오버레이(D-14) |
| `--tl-color-alpha-blue-16` | `#5F91FF29` | 파랑 400 16% — 다크 정보 · 모듈 erp 바탕(D-97, PR-28 전 alpha.brand.16 값) |
| `--tl-color-alpha-neutral-16` | `#9CA3AF29` | 회색 400 16% — 다크 subtle 바탕(선택 · 배지 · 모듈 카드, D-62) |
| `--tl-color-alpha-red-16` | `#F6727029` | 빨강 400 16% — 다크 subtle 바탕(선택 · 배지 · 모듈 카드, D-62) |
| `--tl-color-alpha-green-16` | `#5AB57729` | 초록 400 16% — 다크 subtle 바탕(선택 · 배지 · 모듈 카드, D-62) |
| `--tl-color-alpha-amber-16` | `#FBB85C29` | 노랑 400 16% — 다크 subtle 바탕(선택 · 배지 · 모듈 카드, D-62) |
| `--tl-color-alpha-violet-16` | `#9486FF29` | 보라 400 16% — 다크 subtle 바탕(선택 · 배지 · 모듈 카드, D-62) |
| `--tl-color-alpha-teal-16` | `#5AB8B829` | 청록 400 16% — 다크 subtle 바탕(선택 · 배지 · 모듈 카드, D-62) |
| `--tl-color-alpha-brand-8` | `#FF886714` | 회사 색 8% — 라이트 선택 행 |
| `--tl-color-alpha-brand-16` | `#FF886729` | 회사 색 16% — 다크 선택 바탕 · 선택 행 |
| `--tl-color-alpha-brand-24` | `#FF88673D` | 회사 색 24% — 다크 옅은 강조 면 |
| `--tl-color-cvd-vermilion` | `#D55E00` | 주홍 |
| `--tl-color-cvd-blue` | `#0072B2` | 파랑 |
| `--tl-color-cvd-orange` | `#E69F00` | 주황 |
| `--tl-color-cvd-sky` | `#56B4E9` | 하늘 |
| `--tl-color-cvd-purple` | `#CC79A7` | 자주 |
| `--tl-color-cvd-gray` | `#8B929C` | 회색(비교) |
| `--tl-color-cvd-dark-vermilion` | `#D97324` | 다크 주홍 |
| `--tl-color-cvd-dark-blue` | `#006A9F` | 다크 파랑 |
| `--tl-color-cvd-dark-orange` | `#B68B13` | 다크 주황 |
| `--tl-color-cvd-dark-sky` | `#339DD0` | 다크 하늘 |
| `--tl-color-cvd-dark-purple` | `#C473A6` | 다크 자주 |
| `--tl-color-cvd-dark-gray` | `#9A9A9A` | 다크 회색(비교) |
| `--tl-color-base-white` | `#FFFFFF` |  |
| `--tl-color-base-black` | `#000000` |  |
| `--tl-font-family-sans` | `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif` | 첫 항목이 번들 서체. 나머지는 폴백(D-22) |
| `--tl-font-family-mono` | `ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace` | 코드 · 번호. 시스템 고정폭만 쓴다(식자재 ERP의 IBM Plex Mono는 번들하지 않는다, 외부 네트워크 0, D-97) |
| `--tl-font-weight-400` | `400` |  |
| `--tl-font-weight-500` | `500` |  |
| `--tl-font-weight-600` | `600` |  |
| `--tl-font-weight-700` | `700` |  |
| `--tl-font-numeric` | `tabular-nums` | 숫자는 항상 고정폭 |
| `--tl-font-letter-spacing-tight` | `-0.01em` | 한글 제목 |
| `--tl-font-letter-spacing-normal` | `0em` | 본문 |
| `--tl-layout-global-bar-height` | `48px` | 상단 글로벌 바 |
| `--tl-layout-sidebar-width` | `240px` |  |
| `--tl-layout-sidebar-collapsed-width` | `64px` |  |
| `--tl-layout-content-max-width` | `1440px` |  |
| `--tl-layout-content-max-width-wide` | `1600px` | 와이드(layout.wide.minWidth 이상) 본문 최대 폭(식자재 ERP 와이드, D-97) |
| `--tl-layout-gutter-default` | `24px` |  |
| `--tl-layout-gutter-compact` | `16px` |  |
| `--tl-layout-desktop-min-width` | `1024px` | 데스크톱 최소 폭 |
| `--tl-layout-wide-min-width` | `1920px` | 와이드 화면 시작 폭. 미디어 쿼리는 이 숫자를 그대로 쓴다(D-97) |
| `--tl-duration-100` | `100ms` |  |
| `--tl-duration-150` | `150ms` |  |
| `--tl-duration-200` | `200ms` |  |
| `--tl-duration-300` | `300ms` |  |
| `--tl-duration-fast` | `100ms` | hover · active · 선택 바뀜(배경 · 글자색 · 테두리), 작은 팝업(Menu · Popover · Tooltip) |
| `--tl-duration-normal` | `150ms` | 대화 상자 · 화면 들어오기 · 접기 |
| `--tl-duration-slow` | `200ms` | 서랍 · 탭 밑줄 · 사이드바 덮개 |
| `--tl-duration-slower` | `300ms` | 아래 시트 · 토스트 · 진행 막대 폭 |
| `--tl-duration-spin` | `900ms` | 도는 것 한 바퀴(Spinner) |
| `--tl-duration-pulse` | `1500ms` | 반복 표시 한 주기(스켈레톤 · 깜빡임 · 진행 줄) |
| `--tl-duration-essential` | `900ms` | 움직임 줄이기에서도 0이 되지 않는 시간. 상태를 알리는 회전(Spinner)만 쓴다(식자재 ERP animate-spin 예외, D-97) |
| `--tl-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | 기본 전환. 가안(G2 승인 항목, D-21) |
| `--tl-easing-decelerate` | `cubic-bezier(0, 0, 0, 1)` | 들어올 때. 가안(G2 승인 항목, D-21) |
| `--tl-easing-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | 나갈 때. 가안(G2 승인 항목, D-21) |
| `--tl-easing-enter` | `cubic-bezier(0, 0, 0, 1)` | 나타날 때 |
| `--tl-easing-exit` | `cubic-bezier(0.3, 0, 1, 1)` | 사라질 때 |
| `--tl-radius-xs` | `4px` |  |
| `--tl-radius-sm` | `6px` |  |
| `--tl-radius-md` | `8px` |  |
| `--tl-radius-lg` | `12px` |  |
| `--tl-radius-xl` | `16px` |  |
| `--tl-radius-full` | `9999px` |  |
| `--tl-shadow-sm` | `0px 1px 3px 0px #0000000F` | 카드 · 입력 칸(식자재 ERP shadow-sm, D-97) |
| `--tl-shadow-md` | `0px 4px 12px 0px #00000014` | 팝업 · 메뉴(식자재 ERP shadow-md) |
| `--tl-shadow-lg` | `0px 8px 24px 0px #0000001A` | 대화상자 · 토스트(식자재 ERP shadow-lg) |
| `--tl-size-icon-16` | `16px` |  |
| `--tl-size-icon-20` | `20px` |  |
| `--tl-size-icon-24` | `24px` |  |
| `--tl-size-module-icon-32` | `32px` |  |
| `--tl-size-module-icon-40` | `40px` |  |
| `--tl-size-module-icon-48` | `48px` |  |
| `--tl-size-avatar-24` | `24px` |  |
| `--tl-size-avatar-32` | `32px` |  |
| `--tl-size-avatar-40` | `40px` |  |
| `--tl-size-avatar-48` | `48px` |  |
| `--tl-size-touch-min` | `44px` | 손가락으로 누르는 모든 것의 최소(WCAG 2.5.5 · iOS 44, D-97) |
| `--tl-size-touch-control` | `48px` | 손가락 컨트롤(Button · Input · Select의 xl) |
| `--tl-size-touch-main` | `56px` | 꼭 누를 주요 실행(하단 고정 단추 · 목록 한 줄) |
| `--tl-space-0` | `0px` |  |
| `--tl-space-2` | `2px` | 식자재 ERP 간격(D-97) |
| `--tl-space-4` | `4px` |  |
| `--tl-space-6` | `6px` | 식자재 ERP 간격(D-97) |
| `--tl-space-8` | `8px` |  |
| `--tl-space-10` | `10px` | 식자재 ERP 간격(D-97) |
| `--tl-space-12` | `12px` |  |
| `--tl-space-14` | `14px` | 식자재 ERP 간격(D-97) |
| `--tl-space-16` | `16px` |  |
| `--tl-space-18` | `18px` | 식자재 ERP 간격(D-97) |
| `--tl-space-20` | `20px` |  |
| `--tl-space-24` | `24px` |  |
| `--tl-space-28` | `28px` | 식자재 ERP 간격(D-97) |
| `--tl-space-32` | `32px` |  |
| `--tl-space-40` | `40px` |  |
| `--tl-space-48` | `48px` |  |
| `--tl-space-64` | `64px` |  |
| `--tl-z-base` | `0` |  |
| `--tl-z-sticky` | `100` |  |
| `--tl-z-dropdown` | `450` |  |
| `--tl-z-overlay` | `300` |  |
| `--tl-z-modal` | `400` |  |
| `--tl-z-toast` | `500` |  |

## Density

touch는 휴대폰(breakpoint.sm 미만)에서 루트에 자동으로 적용된다.

| 토큰 | compact | comfortable | touch |
| --- | ---: | ---: | ---: |
| `--tl-density-row-height` | `36px` | `40px` | `48px` |
| `--tl-density-row-height-tall` | `48px` | `56px` | `64px` |
| `--tl-density-control-height-xs` | `26px` | `26px` | `44px` |
| `--tl-density-control-height-sm` | `30px` | `30px` | `44px` |
| `--tl-density-control-height-md` | `36px` | `36px` | `48px` |
| `--tl-density-control-height-lg` | `42px` | `42px` | `56px` |
| `--tl-density-control-height-xl` | `48px` | `48px` | `56px` |
| `--tl-density-card-padding` | `16px` | `20px` | `16px` |
| `--tl-density-body-font-size` | `13px` | `14px` | `15px` |
| `--tl-density-body-line-height` | `20px` | `21px` | `22px` |
| `--tl-density-input-font-size` | `13px` | `14px` | `16px` |
| `--tl-density-gutter` | `16px` | `24px` | `16px` |

## Typography

| 토큰 | 값 |
| --- | --- |
| `--tl-type-display-font-size` | `28px` |
| `--tl-type-display-line-height` | `34px` |
| `--tl-type-display-font-weight` | `var(--tl-font-weight-600)` |
| `--tl-type-display-letter-spacing` | `var(--tl-font-letter-spacing-tight)` |
| `--tl-type-h1-font-size` | `24px` |
| `--tl-type-h1-line-height` | `31px` |
| `--tl-type-h1-font-weight` | `var(--tl-font-weight-600)` |
| `--tl-type-h1-letter-spacing` | `var(--tl-font-letter-spacing-tight)` |
| `--tl-type-h2-font-size` | `18px` |
| `--tl-type-h2-line-height` | `24px` |
| `--tl-type-h2-font-weight` | `var(--tl-font-weight-600)` |
| `--tl-type-h2-letter-spacing` | `var(--tl-font-letter-spacing-tight)` |
| `--tl-type-h3-font-size` | `16px` |
| `--tl-type-h3-line-height` | `21px` |
| `--tl-type-h3-font-weight` | `var(--tl-font-weight-600)` |
| `--tl-type-h3-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-h4-font-size` | `15px` |
| `--tl-type-h4-line-height` | `20px` |
| `--tl-type-h4-font-weight` | `var(--tl-font-weight-600)` |
| `--tl-type-h4-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-body-font-size` | `14px` |
| `--tl-type-body-line-height` | `21px` |
| `--tl-type-body-font-weight` | `var(--tl-font-weight-400)` |
| `--tl-type-body-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-label-font-size` | `13px` |
| `--tl-type-label-line-height` | `20px` |
| `--tl-type-label-font-weight` | `var(--tl-font-weight-500)` |
| `--tl-type-label-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-caption-font-size` | `12px` |
| `--tl-type-caption-line-height` | `18px` |
| `--tl-type-caption-font-weight` | `var(--tl-font-weight-400)` |
| `--tl-type-caption-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-micro-font-size` | `11px` |
| `--tl-type-micro-line-height` | `16px` |
| `--tl-type-micro-font-weight` | `var(--tl-font-weight-400)` |
| `--tl-type-micro-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-mono-font-size` | `12px` |
| `--tl-type-mono-line-height` | `16px` |
| `--tl-type-mono-font-weight` | `var(--tl-font-weight-400)` |
| `--tl-type-mono-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-amount-font-size` | `16px` |
| `--tl-type-amount-line-height` | `24px` |
| `--tl-type-amount-font-weight` | `var(--tl-font-weight-600)` |
| `--tl-type-amount-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |
| `--tl-type-amount-lg-font-size` | `20px` |
| `--tl-type-amount-lg-line-height` | `24px` |
| `--tl-type-amount-lg-font-weight` | `var(--tl-font-weight-600)` |
| `--tl-type-amount-lg-letter-spacing` | `var(--tl-font-letter-spacing-normal)` |

## Paper

종이 서식(A4 · A5 인쇄 · PDF). 테마와 무관하게 라이트 · 다크 값이 같다. 색 대비는 `paper.bg` 위에서 잰다.

| 토큰 | 값 | 대비 | 용도 |
| --- | --- | ---: | --- |
| `--tl-paper-bg` | `#FFFFFF` ← `color.base.white` | 1.00 | 종이 바탕. 가안(승인 대기) |
| `--tl-paper-fg` | `#000000` ← `color.base.black` | 21.00 | 종이 본문 글자. 인쇄에서 단색 검정으로 찍힌다. 가안(승인 대기) |
| `--tl-paper-muted` | `#4B5563` ← `color.neutral.600` | 7.56 | 머리 · 꼬리 · 주석 글자. bg · fill 위 4.5:1 이상. 가안(승인 대기) |
| `--tl-paper-line` | `#646B78` ← `color.neutral.500` | 5.36 | 표 안쪽 칸 선 · 꼬리 위 구분선. 가안(승인 대기) · PR-28: 회색 단계가 식자재 ERP 회색으로 바뀌어 400(2.5:1) 대신 500(5.3:1) |
| `--tl-paper-line-strong` | `#030712` ← `color.neutral.950` | 20.13 | 표 바깥 테두리 · 합계 행 위 선. 가안(승인 대기) |
| `--tl-paper-fill` | `#E5E7EB` ← `color.neutral.200` | 1.24 | 표 머리 · 라벨 칸 바탕. 가안(승인 대기) · PR-28: 예전 100(#E5E7EA)과 같은 값인 200(#E5E7EB) |
| `--tl-paper-shadow` | `0px 4px 12px 0px #00000014` ← `shadow.md` |  | 화면 미리보기의 종이 그림자. 인쇄에는 그리지 않는다. 가안(승인 대기) |
| `--tl-paper-size-a4-width` | `210mm` |  | A4 세로 폭(ISO 216). 가안(승인 대기) |
| `--tl-paper-size-a4-height` | `297mm` |  | A4 세로 높이(ISO 216). 가안(승인 대기) |
| `--tl-paper-size-a5-width` | `148mm` |  | A5 세로 폭(ISO 216). 가안(승인 대기) |
| `--tl-paper-size-a5-height` | `210mm` |  | A5 세로 높이(ISO 216). 가안(승인 대기) |
| `--tl-paper-margin-sm` | `12mm` |  | 좁은 여백. 칸이 많은 국세청 서식 · A5. 가안(승인 대기) |
| `--tl-paper-margin-md` | `18mm` |  | 기본 여백. 증명서 · 명세서 · 계산서. 가안(승인 대기) |
| `--tl-paper-type-display-font-size` | `21pt` |  | 문서 제목(PaperTitle). 28px과 같은 크기. 가안(승인 대기) |
| `--tl-paper-type-display-line-height` | `27pt` |  | display 행간. 36px과 같다. 가안(승인 대기) |
| `--tl-paper-type-h1-font-size` | `18pt` |  | compact 문서 제목. 24px과 같은 크기. 가안(승인 대기) |
| `--tl-paper-type-h1-line-height` | `24pt` |  | h1 행간. 32px과 같다. 가안(승인 대기) |
| `--tl-paper-type-h2-font-size` | `15pt` |  | 서명 줄(회사 · 직함 · 이름). 20px과 같은 크기. 가안(승인 대기) |
| `--tl-paper-type-h2-line-height` | `21pt` |  | h2 행간. 28px과 같다. 가안(승인 대기) |
| `--tl-paper-type-h3-font-size` | `12pt` |  | 묶음 제목 · 확인 문장 · 서명 날짜. compact에서는 서명 줄. 16px과 같은 크기. 가안(승인 대기) |
| `--tl-paper-type-h3-line-height` | `18pt` |  | h3 행간. 24px과 같다. 가안(승인 대기) |
| `--tl-paper-type-body-font-size` | `10.5pt` |  | 종이 본문 · 표 칸. compact에서는 묶음 제목 · 확인 문장. 14px과 같은 크기. 가안(승인 대기) |
| `--tl-paper-type-body-line-height` | `15pt` |  | body 행간. 20px과 같다. 가안(승인 대기) |
| `--tl-paper-type-label-font-size` | `9.75pt` |  | compact 본문 · 표 칸. 13px과 같은 크기. 가안(승인 대기) |
| `--tl-paper-type-label-line-height` | `13.5pt` |  | label 행간. 18px과 같다. 가안(승인 대기) |
| `--tl-paper-type-caption-font-size` | `9pt` |  | 머리 · 꼬리 · 주석 · 표 위 설명. 12px과 같은 크기. 가안(승인 대기) |
| `--tl-paper-type-caption-line-height` | `12pt` |  | caption 행간. 16px과 같다. 가안(승인 대기) |
