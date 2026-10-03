import { inject } from "vue";
import { megaMenuColumnKey, megaMenuContentKey } from "./context";

/**
 * Style for one revealed element. Inside a column it only needs its place in
 * the column (--mm-i) and inherits the column's group (--mm-g). Anywhere else
 * in a panel it is a group of its own.
 *
 * The delay is group * group-step + item * item-step, so each group starts a
 * beat after the previous one starts, not after it finishes.
 */
export function useRevealStyle(): Record<string, number> | undefined {
  const column = inject(megaMenuColumnKey, null);
  if (column) return { "--mm-i": column.nextIndex() };
  const content = inject(megaMenuContentKey, null);
  if (content) return { "--mm-g": content.nextIndex(), "--mm-i": 0 };
  return undefined;
}
