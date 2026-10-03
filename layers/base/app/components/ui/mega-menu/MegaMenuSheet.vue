<script setup lang="ts">
/**
 * What the menu button opens, in your own layout: links, a footer, anything.
 * With the underlay variant it is the panel the page slides away from at desktop
 * width, and an ordinary sheet below that. Its slot receives { underlay }, so the
 * content can change shape between the two.
 *
 * While a MegaMenuSheet is mounted the mobile accordion is not drawn: the sheet
 * replaces it.
 */
import { HeaderMenuPanel } from "@/components/ui/header-menu";
import type { HTMLAttributes } from "vue";
import { inject } from "vue";
import { megaMenuKey } from "./context";

defineProps<{
  class?: HTMLAttributes["class"];
  bodyClass?: HTMLAttributes["class"];
  title?: string;
  description?: string;
}>();

inject(megaMenuKey)!.registerSheet();
</script>

<template>
  <HeaderMenuPanel :class="$props.class" :body-class="bodyClass" :title="title" :description="description" v-slot="{ underlay }">
    <slot :underlay="underlay" />
  </HeaderMenuPanel>
</template>
