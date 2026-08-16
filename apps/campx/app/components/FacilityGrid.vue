<template>
  <div v-if="groups.length" class="space-y-6">
    <section v-for="group in groups" :key="group.id" class="space-y-3">
      <h3 class="text-muted-foreground text-sm tracking-tight">{{ group.label }}</h3>
      <ul class="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        <li
          v-for="facility in group.items"
          :key="facility.slug"
          class="flex items-center gap-x-2 text-sm tracking-tight"
        >
          <Icon :name="facility.icon" class="text-muted-foreground size-4 shrink-0" />
          <span class="text-pretty">{{ facility.name }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { resolveFacilities } from "~/data/facilities";
import type { Facility } from "~/data/types";

const props = defineProps<{ slugs: string[] }>();

const GROUP_LABEL: Record<Facility["group"], string> = {
  basic: "Dasar",
  comfort: "Kenyamanan",
  service: "Layanan",
  activity: "Area & aktivitas",
};

const ORDER: Facility["group"][] = ["basic", "comfort", "service", "activity"];

const groups = computed(() => {
  const facilities = resolveFacilities(props.slugs);

  return ORDER.map((group) => ({
    id: group,
    label: GROUP_LABEL[group],
    items: facilities.filter((facility) => facility.group === group),
  })).filter((group) => group.items.length > 0);
});
</script>
