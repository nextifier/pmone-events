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
