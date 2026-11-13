---
props:
  name: File name with extension. Sets the view, icon, download name and accessible name
  src: File address (server address, blob: or data:). Without it the file card shows
  size: Bytes (the format and size line in the toolbar)
  mimeType: MIME type (image/png, application/pdf). Without it the extension decides
  kind: How to show the file (`image`, `pdf` or `other`). Without it MIME type and extension decide
  alt: Alternative text for an image. Defaults to the file name
  pageCount: Total pages of a PDF, known by the server. Shows "3 / 12" and turns off next page on the last page
  page: Current page (controlled, from 1)
  defaultPage: First page (uncontrolled)
  onPageChange: Called when the page changes
  height: Viewer height (`sm` 240, `md` 400, `lg` 560, `fill` takes the remaining height of the parent)
  loading: The file address is still loading (Skeleton)
  error: Why the file could not load, in one sentence. Shows the error block
  onRetry: Try again in the error block. Without it the image reloads
  onDownload: Download handler. Without it the browser downloads `src` with the file name
  downloadable: Show the download button
examples:
  Image: Image — Zoom out, zoom in, fit and rotate. In the image area the + − 0 R keys do the same.
  Pdf: PDF — Page and zoom go to the browser's built-in PDF viewer. Browsers without one show a file card.
  Other: Other formats — Formats that cannot be previewed show a file card with a download button.
  LoadingError: Loading and error — A Skeleton while the address loads. On failure the reason, try again and download.
  Expand: Larger view — Opens the small viewer next to a list in a large Dialog.
---
# FileViewer
## Purpose
Use it to view one file on the screen without downloading it. Images (PNG, JPG, SVG) zoom, fit and rotate, PDFs turn pages in the browser's built-in PDF viewer, and other formats show a file card with a download button. For a file list or attachment chips use Attachment, for picking files use FileUpload, and for printable forms use Paper and PaperPreview.
## Anatomy
root (`tl-file-viewer`, `role="group"`, border `border.divider`, `radius.lg`, background `bg.surface`) · bar (toolbar row, bottom line `border.divider`, padding `space.4` `space.8`) · name (file icon 16 `fg.tertiary`, name `type.label` 600 `fg.primary` truncated, format and size `type.caption` `fg.secondary` tabular) · tools (`role="toolbar"`, IconButton ghost sm, vertical line `border.divider` between groups) · value (zoom 125%, page 3 / 12, `type.caption` tabular `fg.secondary`) · stage (viewing area, background `bg.sunken`, scrolls inside when content overflows, focus ring `border.focus` inside) · image (shadow `shadow.sm`) · pdf (`object`, fills the area) · card (EmptyState with a format icon, a message and a download button) · status (hidden announcement line for zoom, page and rotation changes).
## Props
Generated from the contract.
## Variants
3 kinds × 4 heights.

| kind | Viewing area | Toolbar |
|---|---|---|
| image | The image. Starts fitted to the area (small images at 100%) | zoom out · zoom · zoom in · fit · rotate · download |
| pdf | The browser's built-in PDF viewer (`object`). Page and zoom go in the address fragment (`#page=3&zoom=125`) | previous page · page · next page · zoom out · zoom · zoom in · fit · open in a new window · download |
| other | File card (format icon, "This format cannot be previewed", download) | download |

height sm 240, md 400, lg 560 (multiples of `space.64`), fill (remaining height of the parent, for a Dialog or a pane next to a list). In a narrow container (under 400 wide) the name takes its own line and the tools move to the next line.

Without kind, `fileViewerKind(name, mimeType)` decides. The MIME types `image/*` and `application/pdf` come first, then the extension.
## States
default · focus (focus ring `border.focus` 2px inside the viewing area, the IconButton focus ring on tools) · loading (a Skeleton rect in the viewing area while `loading` is set or the image downloads. The Skeleton appears after `duration.normal`, so fast responses do not flicker. root `aria-busy`) · error (when `error` is set or the image breaks, EmptyState kind="error" with the reason and try again. Download stays in the toolbar). hover, active and disabled belong to the tool buttons (IconButton) and do not apply to the root.
## Behavior
Images start fitted to the area (images smaller than the area show at 100%). Zoom moves through 25, 50, 75, 100, 125, 150, 200, 300 and 400% (`nextZoom`). Zooming in from the fitted scale goes to the first larger step. Rotation turns right by 90 degrees, and fit uses the rotated shape. When the image is larger than the area, drag it to move. A double press switches between fit and 100%. A new file resets fit and rotation.

PDFs use the browser's built-in PDF viewer in an `object`, and page and zoom go in the address fragment (no PDF library and no outside requests). Turning a page reopens the viewer at that page. With `pageCount` the toolbar shows "3 / 12" and turns off next page on the last page. Without it, it shows "Page 3". The toolbar does not know which page the user scrolled to inside the built-in viewer. Browsers without a built-in PDF viewer (`navigator.pdfViewerEnabled === false`, including headless browsers) show a message card ("This browser does not show PDFs directly") with a download button, and open in a new window stays in the toolbar. The same card shows when the `object` cannot draw the document.

Download calls `onDownload` when given. Otherwise the browser downloads `src` with the file name (`a[download]`). With `downloadable={false}` the button is gone.

Control the page with `page` and `onPageChange`, or leave it to `defaultPage`. Zoom and rotation are managed inside.

| Key | Action |
|---|---|
| Tab | Toolbar (one current button) → viewing area |
| ← · → | Previous or next button in the toolbar (skips turned-off buttons) |
| Home · End | First or last button |
| Enter · Space | Press the button |
| + · = / − / 0 | Zoom in, zoom out or fit in the image area |
| R | Rotate right in the image area |
| Arrow keys | Move a zoomed image (scroll the area) |
| PageUp · PageDown | Previous or next page in the toolbar (PDF) |
## Accessibility
The root is `role="group"` named "Preview of {file name}". The toolbar is `role="toolbar"` (named "Viewer tools", `aria-controls` pointing at the viewing area) with a single tab stop (roving tabindex). Button names come from IconButton `label`, the same as the tooltip. Fit uses `aria-pressed`. The image area is `role="group"` named "Image area" and reads the key hints through `aria-describedby`. When content overflows it is a scroll region reachable with Tab. The image `alt` is `alt` or the file name. The PDF `object` has `title` and `aria-label` set to the file name. A hidden `role="status"` reads zoom, page and rotation changes ("Zoom 125%", "Page 3 of 12"). Loading sets `aria-busy` on the root, and errors use EmptyState `role="alert"`. Text contrast is 4.5:1 or more with `fg.primary` and `fg.secondary`, and the focus ring always shows. There is no motion (zoom changes apply at once).
## Density
Tool buttons are IconButton sm (the density's `control-height-sm`). The viewer height does not depend on density. On phones (touch) the buttons are finger sized.
## Platform differences
The web uses an `img` for images and the browser's built-in PDF viewer (`object`). Native shows images in an Image with pinch zoom, and opens PDFs in the OS preview (share sheet or quick look). The props are the same.
## Avoid
Adding a PDF library or an outside viewer service (outside requests) to draw PDFs → review. Painting the viewing area with a status color, or a red background for errors (D-56) → review. Sending files to an address outside your server for previews → review. Tool buttons with icons and no `label` → IconButton blocks it.
## Stories
Image · Pdf · Other · LoadingError · Expand.
## References
SY-16 · PG-44. The preview in the document box (`ecm/my-docs/browser`). Attachment (file type and size format `inferAttachmentType`, `formatAttachmentSize`), EmptyState (file card and errors), IconButton. Benchmarks are for structure only.
