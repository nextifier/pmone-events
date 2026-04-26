<template>
  <NuxtLink
    :to="localePath(`${props.brandBasePath}/${props.brand.slug}`)"
    class="group"
  >
    <BrandIdentity
      :brand="props.brand"
      avatar-size="sm"
      name-class="group-hover:text-primary text-sm tracking-tight transition"
    />
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  brand: { type: Object, required: true },
  brandBasePath: { type: String, default: "/brands" },
});

const localePath = useLocalePath();
</script>
