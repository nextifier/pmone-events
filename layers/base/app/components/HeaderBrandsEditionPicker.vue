<template>
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger as-child>
      <Button
        variant="secondary"
        size="sm"
        class="group h-7! rounded-full pr-1.5! pl-2!"
        aria-label="Edition"
      >
        <span class="font-medium tracking-tight">{{
          selectedEdition?.edition_label ?? "Edition"
        }}</span>
        <IconChevronDown
          class="size-3 shrink-0 opacity-70 transition group-data-[state=open]:rotate-180"
        />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="start"
      class="flex w-44 flex-col gap-y-1 rounded-lg px-1 py-2"
    >
      <!-- Only layout and the selected marker live here. The highlight
           (background + label colors) belongs to `.cn-dropdown-menu-item` in
           the active style, so nothing here may set a background. -->
      <DropdownMenuItem
        v-for="(item, index) in editions"
        :key="index"
        :text-value="`${item.edition_label} Edition`"
        class="w-full gap-x-4 rounded-md py-2 pr-4 pl-8 tracking-tight transition active:scale-98"
        :class="{
          'bg-muted text-foreground':
            selectedEdition?.edition_number === item.edition_number,
        }"
        @select="changeEdition(item)"
      >
        <IconCheck
          v-if="selectedEdition?.edition_number === item.edition_number"
          class="absolute top-1/2 left-2 size-5 -translate-y-1/2"
        />
        <div class="flex flex-col items-start gap-y-0.5">
          <span class="text-sm">{{ item.edition_label }} Edition</span>
          <span class="text-xs opacity-60 sm:text-sm">{{
            item.date_label
          }}</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
const props = defineProps({
  editions: { type: Array, default: () => [] },
});

const route = useRoute();
const localePath = useLocalePath();

const editionParam = computed(() => route.params.edition);

const selectedEdition = computed(() => {
  if (editionParam.value) {
    return props.editions?.find(
      (e) => String(e.edition_number) === String(editionParam.value),
    );
  }
  return props.editions?.find((e) => e.is_active);
});

// The picker serves both the brands and rundown pages. Derive the target
// section from the current route so navigation stays within the same section.
const section = computed(() => {
  const baseName = (route.name?.toString() ?? "").split("___")[0];
  return baseName.includes("rundown") ? "rundown" : "brands";
});

function changeEdition(item) {
  if (item.is_active) {
    navigateTo(localePath(`/${section.value}`));
  } else {
    navigateTo(localePath(`/${item.edition_number}/${section.value}`));
  }
}
</script>
