<!--
  A divider between groups of TableRowActionsItem, drawn by whichever of the two
  menus is showing them.
-->
<template>
  <ContextMenuSeparator v-if="surface === 'context'" />
  <DropdownMenuSeparator v-else />
</template>

<script setup>
import { ContextMenuSeparator } from "@/components/ui/context-menu";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TABLE_ROW_ACTIONS_SURFACE } from "./context";

const surface = inject(TABLE_ROW_ACTIONS_SURFACE, "dropdown");
</script>
