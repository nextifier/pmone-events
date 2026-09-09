<template>
  <ResponsiveDialog>
    <!-- `trigger` lets a call site bring its own button (e.g. a compact icon
         Button that has to match a neighbour's size); the default stays the
         pill below. -->
    <template #trigger="{ open }">
      <slot name="trigger" :open="() => open({ title: pageTitle })">
      <button
        type="button"
        @click="open({ title: pageTitle })"
        :class="
          cn(
            'text-foreground lg:hover:bg-muted flex items-center justify-center gap-x-1 rounded-full border p-3 transition active:scale-98 lg:border-0',
            isSemiTransparent
              ? 'bg-background/70 border border-white/10 shadow-lg backdrop-blur-sm'
              : 'bg-background border-border',
            props.buttonClass,
          )
        "
        v-ripple
      >
        <Icon name="lucide:share" class="size-4 shrink-0" />
        <span class="hidden text-sm tracking-tight lg:block">Share</span>
      </button>
      </slot>
    </template>

    <template #default="{ data }">
      <!-- `pt-5` to match the ResponsiveDialog body pattern used by the
           checkout T&C and hotel terms dialogs. `md:p-8` already padded the
           desktop side; on mobile the heading was sitting against the drag
           handle. -->
      <div class="px-4 pt-5 pb-6 md:p-8">
        <div
          class="text-foreground text-center text-lg font-semibold tracking-tight sm:text-xl"
        >
          Share this page
        </div>
        <SharePage :title="data.title || ''" :url="fullUrl" class="mt-4" />
      </div>
    </template>
  </ResponsiveDialog>
</template>

<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  pageTitle: {
    type: String,
    required: true,
  },
  isSemiTransparent: {
    type: Boolean,
    default: false,
  },
  /** Extra classes for the trigger button itself (size, colors), merged via
      cn. Plain `class` on <DialogShare> falls through to the wrapper div
      instead, which is what grid/flex placement needs. */
  buttonClass: {
    type: [String, Array, Object],
    default: undefined,
  },
});

const config = useRuntimeConfig();
const route = useRoute();

const fullUrl = computed(() => `${useAppConfig().app.url}${route.fullPath}`);
</script>
