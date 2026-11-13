---
props:
  accept: Accepted formats
  multiple: Multiple files
  maxSize: Maximum bytes per file
  files: File list (managed by the app)
  onFilesChange: Newly chosen files
  onRemove: Called when delete is pressed in the list
  disabled: Disabled
  hint: Format and size guidance
examples:
  Basic: Attach supporting documents — Uploading, done and error in one list.
  Disabled: Disabled — Attachments on a closed voucher cannot change.
---
# FileUpload
## Purpose
Use it to upload files by dropping or choosing them and to show their progress (supporting documents, contracts, transaction statements). Use Attachment to only show files that are already uploaded.
## Anatomy
root · zone (dashed `border.default`, `bg.canvas`, `radius.md`, upload icon + instructions + hint `fg.tertiary`) · input (hidden `<input type="file">`) · notice (message about rejected files, `type.caption`) · list · file (file icon · name · size and status `fg.tertiary` · progress bar `brand.default` / `bg.sunken` · delete IconButton).
## Props
Generated from the contract.
## Variants
With or without multiple. File status uploading (progress bar + %) · done (complete) · error (`status.danger.default` icon + error message).
## States
default · hover (zone `border.strong`) · active (zone `border.focus` + `brand.subtle` while a file is dragged over) · focus (zone ring) · disabled (zone `bg.sunken`, `fg.disabled`) · error (rejected-file notice · file error). loading shows as uploading on the file row.
## Behavior
Pressing the zone, or Enter or Space, opens the file picker. Dropped files are also filtered by accept and maxSize, and only files that pass go to onFilesChange. Rejected files show their name and reason below the zone. The list renders the files prop as it is, and pressing delete calls onRemove(name). The app does the upload itself.
## Accessibility
The hidden input takes Tab, and the zone shows the focus ring. The name is the Field label plus the instruction text, and hint is linked with `aria-describedby`. The progress bar uses `role="progressbar"` with `aria-valuenow`. The rejected-file notice uses `role="alert"`. The delete button's name is `<파일 이름> 삭제` (delete <file name>).
## Density
Zone inner padding `space.16` (comfortable `space.24`), file rows at least `density.row-height`.
## Platform differences
Native shows a button that opens DocumentPicker (no drag and drop). The list is the same.
## Avoid
No progress shown for a file being uploaded. Errors shown by color alone. Rejecting files without saying the allowed format and size. Code review checks these.
## Stories
Default · Uploading · Error · Disabled.
## References
P2-10 FileUpload · Attachment. content.md §5 (error messages).
