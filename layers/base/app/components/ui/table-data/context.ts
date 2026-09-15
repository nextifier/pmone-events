import type { InjectionKey, Ref } from "vue";

/**
 * One table row's right-click menu, provided by TableRowContextMenu. The row is
 * the trigger; the content comes from the TableRowActions rendered inside it,
 * which registers only while it has items to show. A row with nothing
 * registered keeps the browser's own menu.
 */
export interface TableRowMenuContext {
  open: Ref<boolean>;
  /** The http(s) link the menu was opened on, offered as "Open in new tab". */
  link: Ref<string | null>;
  register: () => () => void;
}

export const TABLE_ROW_MENU: InjectionKey<TableRowMenuContext> = Symbol("TableRowMenu");

/** Which menu a TableRowActionsItem is being drawn into. */
export type TableRowActionsSurface = "dropdown" | "context";

export const TABLE_ROW_ACTIONS_SURFACE: InjectionKey<TableRowActionsSurface> =
  Symbol("TableRowActionsSurface");
