<template>
  <div class="xl:pt-6">
    <GuestList />
  </div>
</template>

<script setup>
usePageMeta("guests");
defineOptions({
  name: "guests",
});
</script>
