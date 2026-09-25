<!--
  "Suggested for you": exhibitors taking meetings in the categories that match
  the visitor's checkout answers, the closest match first. Each row says why it
  is there (the categories it matched) and opens the exhibitor, where the
  visitor picks a time. Nothing renders without suggestions.
-->
<template>
  <section v-if="items.length" class="space-y-3" :aria-label="$t('meetings.suggest.title')">
    <div class="space-y-1">
      <h2 class="text-base font-semibold tracking-tighter">{{ $t("meetings.suggest.title") }}</h2>
      <p class="text-muted-foreground text-sm tracking-tight">{{ $t("meetings.suggest.body") }}</p>
    </div>

    <ItemGroup class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <Item v-for="item in shown" :key="item.brand_event_id" as-child variant="outline" size="sm" class="hover:bg-muted">
        <NuxtLink :to="to(item)">
          <ItemMedia>
            <Avatar
              :model="{ name: item.brand_name, profile_image: item.profile_image }"
              class="size-10"
              rounded="rounded-full"
              :colorful="false"
            />
          </ItemMedia>
          <ItemContent class="min-w-0">
            <ItemTitle class="w-full truncate tracking-tight">{{ item.brand_name }}</ItemTitle>
            <ItemDescription class="truncate tracking-tight">
              {{ describe(item) }}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Icon name="lucide:chevron-right" class="text-muted-foreground size-4 shrink-0" />
          </ItemActions>
        </NuxtLink>
      </Item>
    </ItemGroup>

    <Button v-if="items.length > shown.length" variant="ghost" size="sm" @click="expanded = true">
      {{ $t("meetings.suggest.more", { count: items.length - shown.length }) }}
    </Button>
  </section>
</template>

<script setup>
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "../ui/item";
import { computed, ref } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  /** Where a row leads: the exhibitor's page, where the time is picked. */
  to: { type: Function, required: true },
});

const { t } = useI18n();
const expanded = ref(false);

const shown = computed(() => (expanded.value ? props.items : props.items.slice(0, 6)));

function describe(item) {
  const match = t("meetings.suggest.match", { categories: item.matched_categories.join(", ") });
  return item.booth_number ? `${t("meetings.suggest.booth", { booth: item.booth_number })} · ${match}` : match;
}
</script>
