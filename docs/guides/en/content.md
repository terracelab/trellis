# Content

Trellis products are written in Korean, and this page explains the Korean copy rules. Component text in English (`TrellisProvider locale="en"`) follows the same principles. It is short and plain, it uses sentence case, and buttons name the result.

These are the rules for the words on screens. Button names, the status vocabulary, number formats and message forms are fixed so the same words appear in every module. The full spec is in `docs/spec/content.md` in the repository.

## Three traits

| Trait | Meaning | Example |
| --- | --- | --- |
| Accurate | Use the names people use at work. Numbers are real values | `11월 부가세 예정신고 마감 11월 25일` (November preliminary VAT return due November 25) |
| Short | One idea per sentence. Titles stay under 20 characters | `결재 대기 12건` (12 awaiting approval) |
| Plain statements | Explain, do not persuade. No exclamation marks, modifiers or metaphors | `표로 볼 수 있습니다` (You can view it as a table) |

Sentences use `합니다체`, the formal polite form that ends in `-니다`, as in `저장했습니다` (saved). Do not use `해요체`, the softer polite form that ends in `-요`. Buttons, menus and labels end in a noun or a verb stem, for example `저장` (save), `결재 요청` (request approval) and `거래처` (business partner).

## What not to write

- Modifiers: `손쉽게` (easily) · `간편하게` (conveniently) · `강력한` (powerful) · `완벽한` (perfect) · `혁신` (innovation) · `매끄러운` (seamless) · `직관적` (intuitive) · `스마트한` (smart) · `최적화된` (optimized) · `놀라운` (amazing) · `최고의` (the best). In English text the same applies to seamless · effortless · powerful · intuitive · innovative · cutting-edge · best-in-class · world-class · stunning · delightful · game-changing · supercharge
- Exclamation marks, emoji and greetings as titles. A home title is a date or a context, for example `11월 7일(금)` (Fri, November 7) or `본사` (head office)
- Commas, colons and dashes inside titles. Split the sentence in two
- Metaphors. The meaning of the name Trellis is explained once, on the overview page
- Writing `다양한` (various) or `수많은` (numerous) when you can give the number

## Buttons and messages

| Place | Rule | Example |
| --- | --- | --- |
| Button | Verb stem or noun. 2 to 5 characters | `저장` (save) · `취소` (cancel) · `삭제` (delete) · `등록` (register) · `검색` (search) |
| Confirmation dialog buttons | Name the result. Do not use `예` (yes) or `확인` (OK) | `삭제` (delete) · `반려` (reject) · `회수` (withdraw) |
| `등록` · `추가` · `작성` (register · add · write) | `등록` for master data, `추가` for list items, `작성` for documents | `거래처 등록` (register business partner) · `품목 추가` (add item) · `기안 작성` (write draft) |
| `수정` · `삭제` (edit · delete) | Use these instead of `편집` (edit) · `제거` (remove) · `지우기` (erase) | `수정` · `삭제` |
| Form label | Noun, no colon. Required fields get a dot | `거래처` (business partner) · `공급가액` (supply amount) |
| Placeholder | Example values only. Do not use it in place of a label | `123-45-67890` (business registration number, 3-2-5 digits) |
| Empty state | What is missing + the next action | `이번 달 전표가 없습니다. 전표 입력에서 추가하세요` (There are no vouchers this month. Add one in voucher entry) |
| Error | What is wrong and how to fix it. Do not apologize | `사업자등록번호는 10자리입니다` (A business registration number has 10 digits) |
| Toast | One sentence in the past tense | `저장했습니다` (Saved) |
| Notification card | Module tile + one line of status + one number | `결재 대기 12건` (12 awaiting approval) |
| Submitting for approval | The button is `결재 요청` (request approval). The states are `기안` · `진행` · `승인` · `반려` · `회수` (draft · in progress · approved · rejected · withdrawn) | |

## Numbers and dates

| Value | Format | Function |
| --- | --- | --- |
| Amount | `874,479,500원` (won). The unit follows the number without a space. Right-aligned | `formatAmount(v, { unit: '원' })` |
| Negative | `−1,234원` (U+2212). No parentheses | `formatAmount` |
| Large amount summary | `8.7억` (`억` = 100,000,000). Only as a secondary figure in KPIs | `formatCompactWon` |
| Ratio | 12.3% | `formatPercent` |
| Quantity | `12건` (12 items) · `3.5kg` · `240EA` | (`formatQuantity` arrives in track E) |
| Change | `전월 대비 +12.4%` (vs. last month +12.4%). Always show the sign | `formatAmount(v, { sign: 'always' })` |
| Date (tables · inputs) | 2026-11-07 | |
| Date (sentences) | `11월 7일(금)` (Fri, November 7) | |
| Period | 2026-11-01~11-30. No spaces around the tilde | |
| Time | 09:00 · 18:30 | |
| Relative time | `3일 전` (3 days ago). After 7 days, show the date | |

Color shows only the direction of a number. Income and increase use `--tl-color-finance-income` (red). Expense and decrease use `--tl-color-finance-expense` (blue). This is the Korean convention. Say in words whether a number is good or bad.

## Terms

Use only the words in the "Use" column.

| Area | Use | Do not use |
| --- | --- | --- |
| Common | `거래처` (business partner) · `담당자` (person in charge) · `사용자` (user) · `다운로드` (download) · `업로드` (upload) | `고객사` (client company) · `업체` (company) · `유저` (user, loanword) · `내려받기` (download, native word) |
| Approval | `기안` (draft) · `진행` (in progress) · `승인` (approved) · `반려` (rejected) · `회수` (withdrawn) · `결재선` (approval line) · `결재 요청` (request approval) | `상신` (submit) · `완료` (complete) · `거부` (refuse) · `철회` (retract) |
| Accounting · tax | `전표` (voucher) · `차변` (debit) · `대변` (credit) · `계정과목` (account) · `공급가액` (supply amount) · `세액` (tax amount) · `합계` (total) · `세금계산서 발행` (issue a tax invoice) · `수취` (receive) · `예정신고` (preliminary return) · `확정신고` (final return) · `결산` (closing of accounts) · `마감` (period close) · `시재` (cash on hand) | `저널` (journal, loanword) · `총액` (gross amount) · `발급` (issue) · `클로징` (closing, loanword) · `잔고` (balance) |
| Distribution · logistics | `발주` (purchase order) · `수주` (sales order) · `입고` (receiving) · `출고` (shipping) · `재고` (inventory) · `안전재고` (safety stock) · `로트` (lot) · `유통기한` (expiry date) · `피킹` (picking) · `검수` (inspection) · `배차` (dispatch) | `오더` (order, loanword) · `인바운드` (inbound, loanword) · `스톡` (stock, loanword) · `배치` (batch, loanword) · `만료일` (expiration date) |
| E-commerce | `상품` (product) · `옵션` (option) · `주문` (order) · `결제` (payment) · `취소` (cancellation) · `반품` (return) · `교환` (exchange) · `정산` (settlement) · `쿠폰` (coupon) · `판매 채널` (sales channel) | `아이템` (item, loanword) · `오더` (order, loanword) · `클레임` (claim, loanword) · `지급` (payout) · `마켓` (market, loanword) |
| Manufacturing | `작업지시` (work order) · `공정` (process) · `설비` (equipment) · `가동` (running) · `대기` (idle) · `비가동` (down) · `점검` (maintenance) · `양품` (good unit) · `불량` (defect) · `수율` (yield) · `합격` (pass) · `불합격` (fail) · `보류` (on hold) · `자재` (material) | `워크오더` (work order, loanword) · `머신` (machine, loanword) · `러닝` (running, loanword) · `다운` (down, loanword) · `패스` (pass, loanword) · `페일` (fail, loanword) |
| Period | `당일` (today) · `전일` (previous day) · `당월` (this month) · `전월` (last month) · `누계` (cumulative) · `전년 동기` (same period last year) | `오늘` (today) · `어제` (yesterday) in table headers |
