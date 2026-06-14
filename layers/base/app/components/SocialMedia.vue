<template>
  <div class="flex items-center justify-center gap-x-2">
    <SocialLink
      v-for="link in profile.socialLinks"
      :key="link.label"
      :to="link.path"
      :iconName="link.iconName"
      :iconClasses="iconClasses"
      :label="link.label"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  iconClasses: {
    type: String,
  },
});

const profile = useProjectProfile();
</script>
