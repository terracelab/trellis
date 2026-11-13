---
props:
  files: Files (name · bytes · type · URL)
  onRemove: Remove handler. Shows a remove button when set
  layout: List · chips
  downloadable: Shows a download button when the file has a URL
examples:
  DocumentFiles: Under an approval document — Type icon, name, size and download.
  DraftChips: Chips while writing — Chips under the input. The remove button passes the file name.
---
# Attachment
## Purpose
Use it to list the files attached to a document, an approval or a conversation, with download and remove. For the area where users upload files, use FileUpload.
## Anatomy
root (`tl-attachment`; list is a `border.default` box with `border.divider` between rows, chips wrap onto new lines) · file (row height `density.row-height` · chip height `density.control-height-md`) · icon (by type: file-text · file-spreadsheet · image · archive · file, `fg.secondary`) · name (`fg.primary`, ellipsis when it overflows) · size (`type.caption` `fg.tertiary`, tabular, 182KB · 2.4MB) · download · remove (IconButton).
## Props
Generated from the contract.
## Variants
layout list · chips × with or without download · remove.
## States
default. The buttons and links inside carry hover and focus. The other states do not apply.
## Behavior
When type is omitted, the file extension sets it (pdf · xlsx/xls/csv · images · zip/7z/rar · anything else). When href is set and downloadable is true, the download button starts the download. When downloadable is false, the file name becomes a link that opens in a new window. When onRemove is set, the remove button passes the file name. Sizes use steps of 1,024: B · KB (whole number) · MB · GB (one decimal place).
## Accessibility
`<ul aria-label="첨부 파일">` (attached files). Button names include the file name, for example `견적서.pdf 다운로드` (download quote.pdf) and `견적서.pdf 삭제` (delete quote.pdf). Icons are decorative. The file type is read from the extension in the name.
## Density
list rows `density.row-height`, chips `density.control-height-md`.
## Platform differences
Native opens the share sheet instead of downloading. The props are the same.
## Avoid
Telling file types apart by color alone. Building the size string by hand (use formatAttachmentSize). Third-party file icon assets. Code review checks these.
## Stories
List · Chips · ReadOnly · Removable.
## References
components.md §10 ApprovalFlow · ConversationalWork.
