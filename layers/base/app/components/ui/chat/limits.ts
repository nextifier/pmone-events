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

export const MAX_CHAT_ATTACHMENTS = 5
export const MAX_CHAT_ATTACHMENT_BYTES = 10 * 1024 * 1024

/**
 * What to assume when the browser reports no type at all.
 *
 * Some file managers on Windows and Linux hand over a dragged file with an
 * empty `type`, so it was refused as "not an accepted file type" even when it
 * was a plain PDF. The composer falls back to the extension; the server still
 * judges the bytes, so nothing here widens what is accepted.
 */
export const EXTENSION_MIMES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
}
