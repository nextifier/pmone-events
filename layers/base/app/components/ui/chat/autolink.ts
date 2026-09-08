/**
 * Split plain text so URLs can become links.
 *
 * Segments rather than `v-html`: whatever someone typed stays text, and a link
 * is an element the caller builds from `href` rather than markup parsed out of
 * their message. That is the whole reason a human's message is not rendered as
 * markdown.
 */
const LINK = /\bhttps?:\/\/[^\s<>"']+/g

export interface TextSegment {
  text: string
  href?: string
}

export function linkSegments(text: string): TextSegment[] {
  const parts: TextSegment[] = []
  let cursor = 0

  for (const match of text.matchAll(LINK)) {
    const start = match.index ?? 0
    // Trailing punctuation belongs to the sentence, not the address.
    const href = match[0].replace(/[.,:;!?)\]}]+$/, "")
    const end = start + href.length

    if (start > cursor) parts.push({ text: text.slice(cursor, start) })
    parts.push({ text: href, href })
    cursor = end
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor) })

  return parts
}
