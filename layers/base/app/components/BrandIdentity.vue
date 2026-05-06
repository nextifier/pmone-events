<template>
  <div class="flex items-center gap-x-3">
    <Avatar
      :model="{
        name: brand.brand_name,
        profile_image: brand.brand_logo,
      }"
      :class="avatarClass"
      rounded="rounded-full"
      :colorful="false"
      :gradient-frame="hasInstagram(brand)"
    />

    <div class="flex flex-col items-start gap-y-0.5 overflow-hidden">
      <p
        class="text-foreground truncate font-medium tracking-tight"
        :class="nameClass"
      >
        {{ brand.brand_name }}
      </p>
      <p
        v-if="brand.company_name"
        class="text-muted-foreground truncate text-xs tracking-tight"
      >
        {{ brand.company_name }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { hasInstagram } from "../composables/useBrandHelpers";

const props = defineProps({
  brand: { type: Object, required: true },
  avatarSize: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  nameClass: { type: String, default: "" },
});

const avatarClass = computed(() => {
  switch (props.avatarSize) {
    case "sm":
      return "size-10 shrink-0";
    case "lg":
      return "size-12";
    default:
      return "size-11";
  }
});
</script>
