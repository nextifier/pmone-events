<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { AccordionContent, type AccordionContentProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
  AccordionContentProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <AccordionContent
    data-slot="accordion-content"
    v-bind="delegatedProps"
    class="cn-accordion-content overflow-hidden"
  >
    <!--
      The link rules dress PROSE links inside an accordion body. A <Button>
      rendered as an anchor (`to` / `href`) is not prose: left unscoped, a row
      of outline buttons in an accordion came out with every label underlined,
      reading as five inline links inside five boxes.
    -->
    <div :class="cn('cn-accordion-content-inner [&_a:not([data-slot=button])]:underline [&_a:not([data-slot=button])]:underline-offset-3 [&_a:not([data-slot=button])]:hover:text-foreground [&_p:not(:last-child)]:mb-4', props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>
