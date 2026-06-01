<template>
  <div
    v-if="item"
    class="border-border flex h-full flex-col items-start justify-between gap-y-2.5 overflow-hidden rounded-2xl border p-4 lg:p-6"
  >
    <span
      class="text-primary text-2xl font-semibold tracking-tighter text-balance"
      >{{ item.title }}</span
    >
    <div class="flex w-full items-center justify-between gap-x-3">
      <div class="flex flex-col items-start gap-y-1">
        <span
          v-if="item.link"
          class="text-primary line-clamp-1 text-sm font-semibold tracking-tight"
          >{{
            item.link.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
          }}</span
        >
        <span
          v-if="item.created_at"
          class="text-muted-foregroundline-clamp-1 text-xs tracking-tight"
          v-tippy="$dayjs(item.created_at).format('MMMM D, YYYY [at] h:mm A')"
        >
          {{ $dayjs(item.created_at).fromNow() }}
        </span>
      </div>

      <nuxt-link
        :to="item.link ?? ''"
        target="_blank"
        :aria-label="item.title ? `Read more: ${item.title}` : 'Read more'"
        class="bg-muted text-primary hover:bg-border flex size-12 shrink-0 translate-x-2 items-center justify-center rounded-full transition active:scale-98"
        v-ripple
      >
        <Icon name="lucide:arrow-up-right" class="size-4" />
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: Object,
});

const { $dayjs } = useNuxtApp();
</script>
