/**
 * A leaf module on purpose.
 *
 * These live apart from `index.ts` because `ChatComposer` reads them for its
 * prop defaults, and `withDefaults` evaluates those at module scope. Importing
 * them from the barrel - which imports the component back - made a cycle whose
 * losing half was the constants: "Cannot access 'MAX_CHAT_ATTACHMENTS' before
 * initialization", and a 500 on every page that mounts the composer.
 */

/**
 * What a chat receiver can usually read.
 *
 * Images and PDF, because that is the intersection every model provider and
 * every human reader handles without a converter. A host that accepts more, or
 * less, passes its own list to `ChatComposer`; these are only the default, and
 * the composer's job is to reject the same files the receiver would.
 */
export const CHAT_ATTACHMENT_MIMES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]

/**
 * What one person can send another.
 *
 * A human on the other end opens a spreadsheet or a deck without thinking
 * about it, so a support thread accepts far more than a model does. Pass this
 * to `ChatComposer` on a person-to-person surface; leave the default in place
 * where the reader is a model.
 *
 * Deliberately absent: anything executable or scriptable (`.exe`, `.sh`,
 * `.js`, `.html`), because the receiver downloads these from a private bucket
 * and the name alone is not a safe signal.
 */
export const CHAT_DOCUMENT_MIMES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "text/csv",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]

export const MAX_CHAT_ATTACHMENTS = 5
export const MAX_CHAT_ATTACHMENT_BYTES = 10 * 1024 * 1024

/**
 * What to assume when the browser reports no type at all.
 *
 * Some file managers on Windows and Linux hand over a dragged file with an
 * empty `type`, so it was refused as "not an accepted file type" even when it
 * was a plain PDF. Office formats are the worst case: they are ZIP containers,
 * so even when a type does arrive it is often `application/zip`. The composer
 * falls back to the extension; the server still judges the bytes, so nothing
 * here widens what is accepted.
 */
export const EXTENSION_MIMES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  csv: "text/csv",
  txt: "text/plain",
  zip: "application/zip",
}
