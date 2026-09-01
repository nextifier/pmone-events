<script setup lang="ts">
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import type { ComboboxGroupProps } from "reka-ui";
import { ComboboxGroup, ComboboxLabel } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  ComboboxGroupProps & {
    class?: HTMLAttributes["class"];
    heading?: string;
  }
>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <ComboboxGroup
    data-slot="combobox-group"
    v-bind="delegatedProps"
    :class="cn('cn-combobox-group text-foreground overflow-hidden', props.class)"
  >
    <ComboboxLabel v-if="heading" class="cn-combobox-label">
      {{ heading }}
    </ComboboxLabel>
    <slot />
  </ComboboxGroup>
</template>
