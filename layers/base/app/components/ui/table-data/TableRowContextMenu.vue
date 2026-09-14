<!--
  One row's right-click menu. The row itself is the trigger - a right-click, or
  a long press on touch - and the content is drawn by the TableRowActions inside
  the row, which registers here while it has items to show. A row with nothing
  registered keeps the browser's own menu.

  One root per row rather than one for the whole table: a single root has a
  single anchor, and its content would have to be lifted out of the row that
  owns the state, the dialogs and the permission checks behind each item. Here
  the content never leaves that row.
-->
<template>
  <ContextMenu v-model:open="open">
    <ContextMenuTrigger
      as-child
      :disabled="!hasActions"
      :data-menu-open="open ? '' : undefined"
      @contextmenu.capture="keepBrowserMenu"
    >
      <slot />
    </ContextMenuTrigger>
  </ContextMenu>
</template>

<script setup>
import { ContextMenu } from "@/components/ui/context-menu";
// The primitive rather than the styled trigger: that one adds `select-none`, and
// a table row has to keep its text selectable.
import { ContextMenuTrigger } from "reka-ui";
import { TABLE_ROW_MENU } from "./context";

const open = ref(false);

// A count rather than a flag, so a menu remounting in place (its v-if flipping
// twice in one patch) cannot switch the row off behind the new one.
const registrations = ref(0);
const hasActions = computed(() => registrations.value > 0);

provide(TABLE_ROW_MENU, {
  open,
  register() {
    registrations.value++;

    return () => {
      registrations.value--;
    };
  },
});

const BROWSER_MENU_TARGETS =
  "a[href], input, textarea, select, [contenteditable]:not([contenteditable='false'])";

// A mouse right-click on a link, a field or selected text keeps the browser's
// menu: open in new tab, paste and copy are what the reader is after there.
// Stopped in the capture phase, the event never reaches the trigger's own
// listener, so nothing prevents its default. Touch is left out on purpose - a
// long press anywhere on the row means the row menu.
function keepBrowserMenu(event) {
  if (event.pointerType && event.pointerType !== "mouse") {
    return;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest(BROWSER_MENU_TARGETS) || isOnSelectedText(target)) {
    event.stopPropagation();
  }
}

function isOnSelectedText(target) {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }

  return selection.getRangeAt(0).intersectsNode(target);
}
</script>
