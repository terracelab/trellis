---
props:
  label: Accessible name outside a Field
  value: Address (controlled)
  defaultValue: Initial address (uncontrolled)
  onChange: Called when the address changes (null when all fields are empty)
  search: Search function from the app. Without it, the provider's search is used
  onSearchRequest: When the app opens its own search window (it passes the picked result to apply(result))
  disabled: Disabled
  invalid: Error (automatic when the Field has an error)
  required: Required (postcode and road address)
  readOnly: Read only
  name: Form name (submits name.postcode and so on)
examples:
  Search: Shipping address — Address search fills the postcode and road address, then the user types the details.
  Manual: Manual entry — Without a search function, the user types all three fields (offline installs).
  Provider: App-wide search — Wrap the app root in AddressSearchProvider once and every field uses it.
  OwnWindow: The app's search window — With onSearchRequest, the app opens its own window and passes the picked result to apply.
---
# AddressInput
## Purpose
Use it to enter a Korean address (shipping address, business address, return address). Address search provided by the app fills the postcode and road address, and the user types the details. To only show an address, use DescriptionList.
## Anatomy
root (group) · postcode (Input, `space.64` × 1.5 wide, 5 digits) · search (Button with the `search` icon, only when search is available) · road (Input) · jibun (one line with the lot address, `type.caption`, `fg.secondary`, only when the value has one) · detail (Input). Search window: a dialog (Dialog md) on wide screens and a bottom sheet on narrow screens · query field (Input with the `search` icon) + search button · status (hint, loading, result count, no results, failure; `type.label`, `fg.secondary`) · listbox (rows `density.row-height`, highlighted row `bg.sunken`; road address, building name, lot address, postcode on the right in `fg.secondary`).
## Props
Generated from the contract.
## Variants
With search (postcode and road address are read only and open the search window when pressed) · manual entry (all three fields are typed when there is no search function) · the app's own search window (onSearchRequest).
## States
default · hover · focus (same as Input for each field) · disabled (all three fields and the search button) · loading (searching in the search window; Spinner on the search button + status "Loading") · error (with a Field error, all three fields get a `status.danger.default` border + `aria-invalid`; a failed search shows a status message and a retry button). active does not apply.
## Behavior
**The app provides the search.** Trellis makes no network calls. Installed products pass a function that calls an in-house server or bundled address data, and cloud products call their own server proxy. There are three ways to provide it, and the one higher in the table wins.

| Way | When | What it does |
| --- | --- | --- |
| `onSearchRequest(apply)` | The app already has a search window (popup or new window) | The search button calls this function and the Trellis search window does not open. The app passes the picked result to `apply(result)` (works controlled and uncontrolled) |
| `search` prop | One field needs a different search | A function from the query (and an abort signal) to a list of results |
| `AddressSearchProvider` | The whole app (once at the root) | Every AddressInput inside uses its `search` function |
| None | Offline installs or installs without address data | No search button. The user types the postcode (5 digits), road address and details |

The search window calls search only when the user types in the query field and presses Enter (or the search button). It does not call it on every keystroke. Starting a new search or closing the window aborts the previous request's `signal`. When results arrive, the first row is highlighted.

| Key (query field) | Action |
| --- | --- |
| Enter | Picks the highlighted row, or searches when no row is highlighted |
| ArrowDown · ArrowUp | Moves the highlight between result rows |
| Escape | Closes the search window (focus returns to the search button) |

Picking a result fills the postcode, road address and lot address, closes the window and moves focus to the details field. Picking the same road address again keeps the details, and a different address clears them. onChange receives `{ postcode, road, jibun?, detail }`, or null when all three fields are empty. Passing value makes it controlled, and defaultValue makes it uncontrolled. With name, the fields submit as `<name>.postcode` · `<name>.road` · `<name>.jibun` · `<name>.detail`. Pass `form.bind(name)` from `useTrellisForm` as is.
## Accessibility
The root has `role="group"` and is named by the Field label (the label prop outside a Field, `주소` when neither is given). Each field has its own name (postcode, road address, details) and gets the Field help and error through `aria-describedby`. Required applies to the postcode and road address only. The search button has `aria-haspopup="dialog"` and `aria-expanded`. The query field has `role="combobox"` + `aria-activedescendant`, and the results use `role="listbox"` and `role="option"`. The hint, result count, no results and failure messages are announced with `role="status"`. Opening the dialog focuses the query field. When focus arrives on the group from an error summary, it moves to the search button when empty, and to the details field once filled (the postcode in manual entry).
## Density
field height `density.control-height-md`, field text `density.input-font-size` (16 on phones). `space.8` between fields. Result rows `density.row-height`, and `space.48` inside the sheet.
## Platform differences
On the web, when the width is below `breakpoint.sm`, the search window opens as a bottom sheet (D-60). The search button fills the row next to the postcode. Native uses a full-screen search sheet with the same search function and onSearchRequest.
## Avoid
Calling an address search server from inside the component (the app provides it). Making a search window that injects an external script into the page the default (installs work offline). Accepting free-typed postcode and road address while search is on. Merging the details into the road address field. Code review checks these.
## Stories
Search · Manual · Provider · OwnWindow.
## References
07-domain-coverage.md 2.5 · PE-05 (search provider injected by the app). PR-08.
