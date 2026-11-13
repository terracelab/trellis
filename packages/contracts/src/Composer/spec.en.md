---
props:
  label: Input name (needed outside a Field)
  placeholder: Example text
  value: Text (controlled)
  defaultValue: Initial text
  onChange: Called when the text changes
  onSend: Sends the text and the attached files
  attachable: Shows the attach button
  accept: File types to accept
  maxLength: Character limit (shows the count near the limit)
  maxRows: Most rows the input grows to
  enterToSend: Enter sends (Ctrl+Enter when false)
  loading: Sending
  disabled: Disabled
  sendLabel: Send button text
  sticky: Sticks to the bottom of the screen on phones
  suggestions: Suggested questions above the input (pressing one puts it in the input)
  mentions: People listed after "@" (mentions)
  commands: Commands listed after "/" at the start of the text
  onCommand: Called when a command is picked
examples:
  Chat: Message input — Enter sends and Shift+Enter adds a line. Enter during Korean composition does not send. Attached files show as chips.
  Suggestions: Suggested questions — They sit above the input. Pressing one puts its text in the input, where it can be edited before sending.
  Reply: Customer reply — For long text, Enter adds a line and Ctrl+Enter sends. Inside a Field it uses the Field label and help.
  MentionsCommands: Mentions and commands — "@" lists people and "/" at the start lists commands above the input. Arrow keys move, Enter or Tab inserts. Enter during Korean composition only commits the text.
---
# Composer
## Purpose
Use it to write a message and send it with files in a conversation or a support case. It puts a growing input, an attach button and a send button on one line. Use Textarea for long text that is saved (remarks · reasons) and FileUpload for an area that only uploads files.
## Anatomy
root (`tl-composer`, no frame: the place it sits in sets padding and the top line) · suggestions (suggested questions, SuggestionChips above the input) · files (attached files, Attachment chips with remove) · row · attach (IconButton paperclip with a hidden `<input type="file" multiple>`) · input (`<textarea>`, `bg.surface` · `border.default` · `radius.md`, text `density.input-font-size`, one-line height `density.control-height-md`) · count (from 80% of the limit, `type.caption` `fg.tertiary`) · send (primary Button with the send icon) · menu (mention and command list, PG-33: a `role="listbox"` that opens above the input, styled like the Menu popup with `bg.elevated` · `border.default` · `radius.md` · `shadow.md`, width `space.64` × 5, rows `density.row-height` (`space.48` on phones), the highlighted row `bg.sunken`, a mention row = Avatar 24 + name + secondary text, a command row = `/name` + description in `type.caption` `fg.secondary`).
## Props
Generated from the contract.
## Variants
attachable on · off × enterToSend (Enter sends · Ctrl+Enter sends) × sticky (pinned to the bottom on phones) × mentions · commands on · off (when off it behaves as before: no list, no live region, no wrapper around the input, and onSend receives only the text and files).
## States
default · hover (input `border.strong`) · focus (input `border.focus` border and a 1px outline, same as Textarea) · disabled (input `bg.sunken` · `fg.disabled`, attach and send disabled, `data-state="disabled"`) · loading (the send button shows progress, the input stays usable, `aria-busy` · `data-state="loading"`). active and error do not apply (maxLength stops extra characters).
## Behavior
- Sending: the send button turns on only when there is text (trimmed) or an attached file. Sending calls `onSend(text, files)`, clears the input and files, and keeps focus in the input. When controlled (value), it reports the clear with onChange('').
- Rows: it starts at one row and grows with the text up to `maxRows` (default 6), then scrolls inside.
- Korean input: Enter during composition (`isComposing`, including Safari's keyCode 229) confirms the characters and does not send.
- Attach: the button opens the file picker (`accept`, several files). Picked files show as chips and the chip's remove button takes one out.
- Suggested questions (`suggestions`): SuggestionChips above the input. Pressing one puts its text in the input (onChange when controlled) and moves focus to the input. It does not send, so the text can be edited first. When Composer is disabled the chips are off too. The app decides when they show (start of a conversation, after an answer) through `suggestions`.
- Phones (`sticky`): below `breakpoint.sm` it sticks to the bottom of the screen (`position: sticky`) with bottom padding for the home indicator (`env(safe-area-inset-bottom)`). Input text is 16 (the touch density input text token), so iOS does not zoom.
- Mentions (`mentions`, PG-33): typing `@` at the start of the text or after a space opens the people list above the input (the `@` in an email address does not). The text after `@` filters names and secondary text and shows up to 8 people. Picking one inserts `@name ` and puts the caret after it. On send, the ids of the people whose `@name` is still in the text come back as the third argument of `onSend`, `meta.mentions` (a name that was inserted and then deleted is left out).
- Commands (`commands`, PG-33): typing `/` at the very start of the text opens the command list (name + description). Picking one inserts `/name ` and calls `onCommand(id)`. When the text still starts with `/name` on send, `meta.command` is that id. Running the command (attaching a card, posting a notice) is the app's job.
- While a list is open, the up and down arrows move the highlighted row, Enter and Tab pick it, and Escape closes only the list (it does not reach a side panel or sheet around it). Typing more opens it again. Keys during Korean composition (Enter included) commit the characters and do not pick. Picking with the pointer keeps focus in the input. When no person or command matches, the list closes.

| Key | Action |
| --- | --- |
| Enter | Send (enterToSend). Adds a line when false. Picks the row when a list is open |
| Shift+Enter | Adds a line |
| Ctrl+Enter · Cmd+Enter | Send |
| ArrowUp · ArrowDown | Move the highlighted row in the mention or command list |
| Tab | Suggested questions → attach → input → send. Picks the row when a list is open |
| Escape | Closes the mention or command list |
## Accessibility
Inside a Field, the input uses the Field label and help (`aria-describedby`). Outside, `label` (or `메시지`) is its `aria-label`. The placeholder is an example, not a name. The attach button is named `파일 첨부` and a chip remove button `사진.jpg 삭제`. The phone keyboard shows a send key through `enterkeyhint="send"`. When the count shows, it is linked to the input's description. The focus ring always shows. With mentions or commands the input has `aria-autocomplete="list"`, and while a list is open it has `aria-controls` (the list) and `aria-activedescendant` (the highlighted row). Focus stays in the input. The list is `role="listbox"` (named `멘션할 사람` or `명령`) and its rows are `role="option"` with `aria-selected`. A hidden live region reads `사람 3명. 위아래 화살표로 고르고 Enter로 넣습니다` (3 people, use the arrows and Enter) and, after a pick, `@박서연 넣었습니다` (inserted).
## Density
One-line height = `density.control-height-md` (compact 28 · comfortable 32 · touch 40), line height `density.body-line-height`, `space.8` between buttons.
## Platform differences
Native uses a multiline TextInput and the document picker (same onSend). The input row moves up with the keyboard (KeyboardAvoidingView). Enter to send works only with a hardware keyboard. Props are the same.
## Avoid
An icon-only send button. A placeholder instead of a label. Hiding how to add a line when Enter sends. Sending on Enter during composition. Input text under 16 on phones. Running a command as soon as it is picked (only insert it, and let the app run it on send). Marking mentions by text color alone (in the conversation, MessageThread `mentions` shows them in bold). Code review checks these.
## Stories
Chat · Suggestions · Reply · MentionsCommands.
## References
components.md §10 ConversationalWork (input pinned to the bottom), patterns/ConversationalWork (PG-30), SuggestionChips (PG-31), mentions and commands (PG-33). Pulled up from the groupware/messenger/chat and crm/support/tickets blocks (PF-15 · PR-08). Blocks that use mentions and commands: groupware/messenger/chat · platform/assistant/chat.
