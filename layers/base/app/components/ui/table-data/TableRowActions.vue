<!--
  A row's actions, reachable two ways: the ellipsis at the end of the row, and a
  right-click (a long press on touch) anywhere on it. Items are written once as
  TableRowActionsItem; each renders as a DropdownMenuItem under the ellipsis and
  as a ContextMenuItem under the pointer. The right-click half only exists
  inside TableData, which is what turns the row into a trigger - anywhere else
  this is the ellipsis menu alone.
-->
<template>
  <div class="flex justify-end">
    <template v-if="hasSlotContent($slots.default)">
      <DropdownMenu v-model:open="dropdownOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="iconSm" :aria-label="label">
            <Icon name="lucide:ellipsis" class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent :align="align" class="w-auto">
          <MenuSurface kind="dropdown">
            <slot />
          </MenuSurface>
        </DropdownMenuContent>
      </DropdownMenu>

      <template v-if="rowMenu">
        <RowRegistration />
        <ContextMenuContent class="w-auto">
          <MenuSurface kind="context">
            <slot />
          </MenuSurface>
        </ContextMenuContent>
      </template>
    </template>

    <!-- Every item conditioned out. The trigger stays so the row keeps its
         shape, but it has nothing to open. -->
    <Button v-else variant="ghost" size="iconSm" :aria-label="label" disabled>
      <Icon name="lucide:ellipsis" class="size-4" />
    </Button>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import { ContextMenuContent } from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasSlotContent } from "@/lib/utils";
import { TABLE_ROW_ACTIONS_SURFACE, TABLE_ROW_MENU } from "./context";

defineProps({
  label: {
    type: String,
    default: "Row actions",
  },
  align: {
    type: String,
    default: "end",
  },
});

// Fired whenever this row's menu opens, from either side. For a caller that
// mounts its dialogs lazily, on first use rather than once per row.
const emit = defineEmits(["open"]);

const rowMenu = inject(TABLE_ROW_MENU, null);
const dropdownOpen = ref(false);

watch(
  () => dropdownOpen.value || Boolean(rowMenu?.open.value),
  (isOpen) => {
    if (isOpen) {
      emit("open");
    }
  }
);

// Tells each item which menu it is being drawn into.
const MenuSurface = defineComponent({
  props: {
    kind: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(TABLE_ROW_ACTIONS_SURFACE, props.kind);

    return () => slots.default?.();
  },
});

// Mounted only while the menu has items, so the row's right-click is live for
// exactly as long as there is something to show. A row whose items are all
// conditioned out goes back to the browser's menu instead of opening nothing.
const RowRegistration = defineComponent({
  setup() {
    let unregister = null;

    onMounted(() => {
      unregister = rowMenu.register();
    });

    onBeforeUnmount(() => unregister?.());

    return () => null;
  },
});
</script>
