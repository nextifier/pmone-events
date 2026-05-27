<template>
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger as-child>
      <Button
        variant="secondary"
        size="sm"
        class="group rounded-full"
        aria-label="Edition"
      >
        <span class="tracking-tight">{{
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
      <DropdownMenuItem
        v-for="(item, index) in editions"
        :key="index"
        v-slot="{ active }"
        as-child
      >
        <button
          :aria-label="item.title"
          class="relative flex w-full cursor-pointer items-center gap-x-4 rounded-md py-2 pr-4 pl-8 tracking-tight text-black ring-black ring-offset-2 ring-offset-white transition hover:bg-gray-100 hover:text-black focus-visible:ring-1 focus-visible:outline-hidden active:scale-98 dark:text-white dark:ring-white dark:ring-offset-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
          :class="{
            'bg-gray-100 text-black dark:bg-gray-900 dark:text-white':
              selectedEdition?.edition_number === item.edition_number && !active,
            'bg-blue-600 text-white dark:bg-blue-600 dark:text-white': active,
          }"
          @click="changeEdition(item)"
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
        </button>
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

function changeEdition(item) {
  if (item.is_active) {
    navigateTo(localePath("/brands"));
  } else {
    navigateTo(localePath(`/${item.edition_number}/brands`));
  }
}
</script>
