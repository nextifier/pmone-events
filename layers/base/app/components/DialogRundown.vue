<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <div
        class="mx-auto w-full px-4 pb-10"
        :class="{
          'max-w-(--breakpoint-lg)': activity.poster_img,
          'max-w-xl': !activity.poster_img,
        }"
      >
        <DrawerHeader>
          <DrawerTitle class="hidden"></DrawerTitle>
          <DrawerDescription class="hidden"></DrawerDescription>
        </DrawerHeader>

        <div
          class="grid grid-cols-1 gap-x-8 gap-y-2 pb-8"
          :class="{
            'sm:grid-cols-2': activity.poster_img,
          }"
        >
          <NuxtImg
            v-if="activity.poster_img?.lg"
            :src="`${useAppConfig().app.apiUrl}/${activity.poster_img?.lg}`"
            alt=""
            class="bg-muted h-full w-full rounded-xl object-cover"
            sizes="100vw sm:800px"
            width="1080"
            height="1350"
            loading="lazy"
            format="webp"
          />

          <div
            class="mt-2 flex grow flex-col"
            :class="{
              'sm:pt-4': activity.poster_img,
            }"
          >
            <div
              v-if="activity.date_string || activity.location"
              class="flex items-center justify-between gap-3"
            >
              <div
                v-if="activity.date_string"
                class="flex items-center gap-x-1"
              >
                <IconCalendar class="h-4 shrink-0" />
                <span class="text-sm tracking-tight">{{
                  activity.date_string
                }}</span>
              </div>

              <div v-if="activity.location" class="flex items-center gap-x-1">
                <IconLocation class="h-4 shrink-0" />
                <span class="text-sm tracking-tight">{{
                  activity.location
                }}</span>
              </div>
            </div>

            <div class="mt-4 flex items-center">
              <span
                class="text-primary border-primary/25 flex shrink-0 items-center justify-center rounded-full border border-dashed p-2.5 text-center text-sm"
              >
                {{ activity.start_time }}
              </span>

              <span
                class="border-primary/25 grow border-b border-dashed"
              ></span>

              <span
                class="text-primary border-primary/25 flex shrink-0 items-center justify-center rounded-full border border-dashed p-2.5 text-center text-sm"
              >
                {{ activity.end_time }}
              </span>
            </div>

            <div
              class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl dark:text-white"
            >
              {{ activity.title }}
            </div>

            <div class="mt-2 flex flex-col gap-y-2">
              <div
                v-if="activity.categories?.length"
                class="flex items-center gap-x-1"
              >
                <IconTag class="h-4 shrink-0" />
                <span class="text-sm tracking-tight">{{
                  activity.categories.join(", ")
                }}</span>
              </div>

              <div
                v-if="activity.speakers?.length"
                class="flex items-start gap-x-1"
              >
                <IconMicrophone class="h-4 shrink-0 sm:mt-0.5" />
                <span class="text-sm tracking-tight">{{
                  activity.speakers.join(", ")
                }}</span>
              </div>

              <div
                v-if="activity.presented_by"
                class="flex items-start gap-x-1"
              >
                <span
                  class="text-xs tracking-tight text-gray-500 dark:text-gray-400"
                  >Presented by {{ activity.presented_by }}</span
                >
              </div>
            </div>

            <div
              v-if="activity.description"
              class="mt-2 text-sm tracking-tight"
            >
              <p>{{ activity.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup>
const activity = computed({
  get() {
    return uiStore.dialogRundown.data;
  },
});

const config = useRuntimeConfig();
const uiStore = useUiStore();
const isOpen = computed({
  get() {
    return uiStore.dialogRundown.isShow;
  },
  set(val) {
    uiStore.dialogRundown.isShow = val;
    if (!val) {
      uiStore.clearDialogRundown();
    }
  },
});
</script>
