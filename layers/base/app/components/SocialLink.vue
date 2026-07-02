<template>
  <nuxt-link
    :to="to"
    :target="to.startsWith('http') ? '_blank' : ''"
    :class="[
      'text-foreground hover:bg-muted relative flex items-center justify-center rounded-xl transition active:scale-98',
      buttonSize,
    ]"
    :aria-label="label"
    v-tippy="label"
  >
    <Icon :name="iconName" :class="iconClasses || iconSize" />
  </nuxt-link>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
  },
  to: {
    type: String,
  },
  openInNewTab: {
    type: Boolean,
    default: true,
  },
  iconName: {
    type: String,
  },
  iconClasses: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "sm",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
});

const buttonSize = computed(
  () => ({ sm: "size-9", md: "size-9", lg: "size-9" })[props.size],
);

const iconSize = computed(
  () => ({ sm: "size-4.5", md: "size-5", lg: "size-6" })[props.size],
);
</script>
