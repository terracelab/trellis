---
props:
  messages: Messages, oldest first
  label: Conversation name (accessible name of the log)
  unreadFrom: Message id where the "new messages" divider goes
  hasOlder: Shows the "earlier messages" button at the top
  onLoadOlder: Loads earlier messages
  loading: Earlier messages are loading
  onRetry: Sends a failed message again. Shows a button next to it when set
  today: Date used for "today" on the date divider (YYYY-MM-DD)
  groupMinutes: Gap in minutes that still groups messages from the same person
  height: Content height · fills the parent and scrolls inside
  empty: Text when there are no messages
  onCopy: Called after an answer is copied
  onRegenerate: Regenerates an answer (shows the button when set)
  onFeedback: Rates an answer (shows the good and bad buttons when set)
  onCitationOpen: Called when a source of an answer is opened
  onReact: Toggles a reaction (reactions become toggle buttons when set)
  reactionOptions: Reactions to pick from (with onReact, adds "Add reaction")
  onReply: Starts a reply (shows the Reply button when set)
  typing: Names of people typing (one line at the bottom)
examples:
  Conversation: Conversation — Grouped by date and sender. Others sit on the left with their name, your messages sit on the right with read state and unread count.
  LoadOlder: Earlier messages — The button at the top loads more. When it fills the parent, it scrolls inside and keeps your place.
  Failed: Not sent — A failed message says so in text and offers a send again button.
  AgentAnswer: Agent answer — It uses the width without a bubble. Run step summary, body (table and source numbers), source list, then copy, regenerate, good and bad. The next answer is still being written.
  Reactions: Reactions, replies and pictures — Reactions under the bubble (icon and count, yours pressed), a reply quote above the bubble (press it to go to the original), picture previews (press to enlarge), mentions in link color, and who is typing at the bottom. Add reaction and Reply show on hover or focus.
---
# MessageThread
## Purpose
Use it to show messages exchanged between people, such as a messenger or a support conversation, grouped by date and sender. In an agent conversation, answers (`kind: 'answer'`) show without a bubble as a formatted body, sources and an action row. Pair it with Composer for input. Use Timeline for a processing history (approval or receiving steps) and NotificationCard for notifications.
## Anatomy
root (`tl-message-thread`, `role="log"`) · older (ghost Button "earlier messages" at the top) · divider (date · new messages, `type.caption` `fg.secondary` text with a 1px `border.divider` line on each side; the new messages divider colors only its text `fg.link`) · system (centered notice line, `type.caption` `fg.secondary`, no background) · run (messages from one sender: avatar 32 + author (name `type.label` 600 · meta `type.caption` `fg.secondary`)) · bubble (others `bg.sunken`, yours `brand.subtle`, `radius.lg`, text `fg.primary`, no border or stripe) · files (Attachment chips) · extra (business card) · aside (read · unread count · time, `type.caption` `fg.secondary` tabular; a failure uses `status.danger.default` text and a "send again" link button) · answer (agent answer, no bubble, at most `space.64` × 12 wide, `space.8` gaps: steps (RunSteps collapsible slot), RichText body, files and extra (result cards), Citation list, answer error (`status.danger.default`), foot (actions: sm ghost IconButtons for copy, regenerate, good and bad, then the time, `type.caption` `fg.secondary`)). Added in PG-36: quote (reply quote, a box above the bubble with a 1px `border.divider` outline and `radius.md`: reply icon + original sender at 600 + one line of the original in `type.caption` `fg.secondary`, no left stripe) · mention (`@name` in the text, `fg.link` 600) · images (picture previews: one picture is `space.64` × 3.5 wide, two or more go in two columns, 4:3 with `radius.lg` and `border.divider`) · reactions (pills under the bubble: icon 16 + count in `type.caption` tabular, height `space.24`, `border.divider` · `bg.surface`; your own reaction `border.selected` · `brand.subtle`) · tools (message actions: xs IconButtons for add reaction (Menu) and reply, shown on hover or when focus is inside) · typing (three dots at the bottom + `이하은 과장 입력 중` (is typing), `type.caption` `fg.secondary`).
## Props
Generated from the contract.
## Variants
height auto (content height, inside a detail card) · fill (fills the parent and scrolls inside, messenger conversation pane). Messages are kind message · system · answer, own or not, status none · sending · failed. Answers also have streaming and feedback (good · bad). Messages also have reactions, replyTo, mentions and picture files (`files[].thumb`) (PG-36), and the list has typing. Without the new props it behaves as before.
## States
default · loading (earlier messages are loading: the top button shows progress, the root gets `aria-busy` · `data-state="loading"`). hover, active and focus belong to the buttons and links inside. disabled and error do not apply (a failed send shows per message through status). An answer being written is the loading state of the answer body (RichText: `aria-busy` and a caret at the end).
## Behavior
- Grouping: a date divider starts each new day (`11월 6일(금)`, with ` · 오늘` when it matches today). When the same person (same author.id and own) sends again within `groupMinutes` (default 5), the name and avatar show only on the first message. Notice lines and dividers break a group.
- Alignment: others sit on the left (avatar + name + meta). Your messages (`own`) sit on the right without name or avatar. The time shows only next to the last message sent in the same minute.
- Read state: when `unread` on your message is 0 it shows `읽음`. At 1 or more it shows muted text like `안 읽음 3`. No pill or number badge. A `status` of sending shows `보내는 중`. failed shows `보내지 못함` and, with `onRetry`, a `다시 보내기` button.
- Text: line breaks are kept and long text wraps inside the bubble. Only http and https addresses become links that open in a new tab (a trailing period or bracket is left out).
- Earlier messages: with `hasOlder`, a button sits at the top and calls `onLoadOlder`. There is no infinite scroll.
- Agent answers (answer): the text is a subset of markdown drawn with RichText (headings, lists, tables, code, links, bold). With `citations`, `[1]` in the body becomes a source number, and the source list follows the body once writing ends. `steps` (RunSteps collapsible) sits above the body and `extra` (result cards, ProposalCard) below it. While `streaming`, the action row and source list are hidden. Action row: copy (always shown; it puts the text on the clipboard, announces hidden "Copied" and then calls `onCopy(id)`), regenerate (with `onRegenerate`), good and bad (with `onFeedback`; `feedback` sets the pressed look, and pressing the pressed one again sends null). With status failed it shows "Could not answer" and only regenerate. Pressing a source calls `onCitationOpen(id, source)`, or opens the source href.
- Reactions (PG-36): the item's `reactions` (key · label · icon · count · mine) show as pills under the bubble. A reaction with a count of 0 is not drawn. Reactions are icons, not emoji, so they look the same in the offline installed product. With `onReact` the pills are toggle buttons (`aria-pressed` = mine), and pressing one calls `onReact(id, key)`. The app updates the count and mine and passes them back. With `reactionOptions` as well, each message gets an add reaction menu.
- Replies (PG-36): the item's `replyTo` (id · author · text) is a quote above the bubble. When the original id is in the conversation, the quote is a button. Pressing it scrolls to the original, moves focus there and shows the bubble outline briefly (1.6 seconds). With `onReply` each message gets a Reply button. The reply target line above the input is drawn by the app.
- Message actions (PG-36): the add reaction and Reply buttons show on hover or when focus is inside the message. While hidden they are still reached with Tab, and they show when reached. Messages being sent or not sent have none. Phones have no hover, so the block puts the same actions in a long-press menu (ContextMenu).
- Mentions (PG-36): only `@name` entries listed in the item's `mentions` (a list of names) show as mentions. The app builds the names from the people in Composer `onSend` meta.mentions.
- Pictures (PG-36): files in `files` that have a `thumb` show as preview buttons instead of chips (named like `파손-박스-01.jpg 크게 보기`, view larger). Pressing one shows it large in a dialog (the original `href`, or `thumb` when there is none), with a download link for the original when `href` is set. Other files stay chips as before.
- Typing (PG-36): when `typing` has names, a line at the bottom says `이하은 과장 입력 중` (is typing). Two names are listed in full, and from three on it says `외 N명` (and N others). If you were at the bottom, the view follows down.
- Scrolling (fill): it starts at the "new messages" divider, or at the bottom. When earlier messages are added on top, your place stays. When a new message arrives at the bottom, it follows only if you were at the bottom or sent it yourself. When switching conversations, the app changes the `key` to draw a fresh thread.

| Key | Action |
| --- | --- |
| Tab | Log (fill) → buttons, links and files inside |
| ArrowUp · ArrowDown | Scroll while the log has focus |
## Accessibility
The root is `role="log"` with `aria-live="polite"` and `aria-label` (label), so new messages are read in turn. Date dividers are read as text (the lines are pseudo-elements). Messages without a visible name (inside a group, or yours) get the sender as hidden text in front. Avatars are decorative (the name is next to them). Times use `<time dateTime>`. Read state and failure are told in text, not by color. Bubble text is `fg.primary` on `bg.sunken` · `brand.subtle`, 4.5:1 or more. With fill, the log takes focus so keyboard users can scroll it (inner focus ring). The answer action row is `role="group"` "Answer actions", and every icon button has a name and a Tooltip. Good and bad use `aria-pressed`. An answer being written has an `aria-busy` body so reading waits while text arrives. The reaction set is `role="group"` named `반응` (reactions), and a pill is named like `확인 2명` (confirm, 2 people); the icon and number are part of the name and are not read separately. Message actions are `role="group"` named `메시지 동작` (message actions). A reply quote first reads hidden `이하은 과장의 메시지에 답글` (reply to a message from), and as a button it ends with `원문으로 이동` (go to the original). The img in a picture preview is decorative (alt="") and the button's name is the file name. The large picture has alt = file name. The typing line is `aria-live="off"`, so it is not read on every change (it is read when you browse the log).
## Density
Text `density.body-font-size` · `density.body-line-height`. `space.12` between groups, `space.4` between messages in a group, bubble padding `space.4` × `space.12`. On phones (touch), body 15/22 applies as is and bubbles may grow wider.
## Platform differences
Native draws an inverted FlatList and loads earlier messages when you pull from the top. Links open in the OS browser. Props are the same.
## Avoid
Unread counts as pills or colored badges. A different background color per sender. A colored stripe on the left of a bubble. A colored background on notice lines. An input inside a message. A reply quote marked with a left stripe (D-57). Emoji reactions (their shape changes with the font). A filled background behind mentions. Code review checks these.
## Stories
Conversation · LoadOlder · Failed · AgentAnswer · Reactions.
## References
components.md §10 ConversationalWork, patterns/ConversationalWork (PG-30), RichText, Citation and RunSteps (PG-31 · PG-32), reactions, replies, mentions, pictures and typing (PG-36, SY-8). Pulled up from the groupware/messenger/chat and crm/support/tickets blocks (PF-15 · PR-08).
