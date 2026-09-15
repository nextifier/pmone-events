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
      @pointerdown.capture="rememberLink"
      @contextmenu.capture="onContextMenu"
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

// The link under the pointer when the menu opened. A right-click on a link lands
// in the row menu, and "Open in new tab" is the one thing from the browser's own
// menu people reach for there, so the row menu offers it for that link.
const link = ref(null);

provide(TABLE_ROW_MENU, {
  open,
  link,
  register() {
    registrations.value++;

    return () => {
      registrations.value--;
    };
  },
});

// Read at pointerdown as well as at `contextmenu`: a long press on touch opens the
// menu from the pointerdown, and iOS never fires `contextmenu` at all.
function rememberLink(event) {
  const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;

  // http(s) only: a mailto: or tel: link has no tab to open.
  link.value =
    anchor instanceof HTMLAnchorElement && /^https?:$/.test(anchor.protocol) ? anchor.href : null;
}

function onContextMenu(event) {
  if (keepsBrowserMenu(event)) {
    // Stopped in the capture phase, the event never reaches the trigger's own
    // listener, so nothing prevents its default.
    event.stopPropagation();

    return;
  }

  rememberLink(event);
}

const BROWSER_MENU_TARGETS =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

// A mouse right-click on a field, or on text the reader has already selected,
// keeps the browser's menu: paste and copy are what they are after there. Links
// get no such pass - the row menu opens over them like anywhere else on the row,
// and offers the new tab itself. Touch is left out on purpose: a long press
// anywhere on the row means the row menu.
function keepsBrowserMenu(event) {
  if (event.pointerType && event.pointerType !== "mouse") {
    return false;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest(BROWSER_MENU_TARGETS)) || isOnSelectedText(target);
}

function isOnSelectedText(target) {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }

  return selection.getRangeAt(0).intersectsNode(target);
}
</script>
