import { type ClassValue, clsx } from 'clsx'
import { Comment, Fragment, type Slot, Text, type VNode } from 'vue'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a Date to local datetime string (YYYY-MM-DDTHH:MM)
 * Unlike toISOString() which converts to UTC, this preserves local time.
 */
export function toLocalDateTimeString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format a Date to a local date-only string (YYYY-MM-DD). Uses the local
 * timezone, NOT UTC, so the calendar day matches what the user picked in
 * their browser regardless of timezone offset.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a `YYYY-MM-DD` string back into a local Date (midnight local time).
 * Returns null for empty / invalid input. Counterpart to {@link toLocalDateString}.
 */
export function parseLocalDateString(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/**
 * Does this slot actually render anything?
 *
 * `slots.default?.()` is never falsy, which is the trap: `v-if="false"` leaves
 * a Comment vnode behind and a `v-for` over an empty list leaves an empty
 * Fragment. A menu whose every item was conditioned out therefore still opened
 * - as a small empty box with a shadow, dismissable layer and all. This looks
 * past both so a part can decline to render itself when there is nothing in it.
 */
export function hasSlotContent(
  slot?: Slot | null,
  props: Record<string, unknown> = {},
): boolean {
  return slot ? hasRenderableNode(slot(props)) : false;
}

function hasRenderableNode(nodes: VNode[] | undefined): boolean {
  return (nodes ?? []).some((node) => {
    if (node.type === Comment) return false;
    if (node.type === Text) return String(node.children ?? "").trim() !== "";
    if (node.type === Fragment) return hasRenderableNode(node.children as VNode[]);

    return true;
  });
}
