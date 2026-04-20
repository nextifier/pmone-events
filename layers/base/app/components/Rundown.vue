<template>
  <section id="rundown" class="container lg:max-w-3xl">
    <div class="flex flex-col items-center text-center">
      <h2
        :class="{
          'section-title': route.name?.toString().startsWith('rundown'),
          'text-primary text-3xl font-semibold tracking-tighter sm:text-4xl': !['index', 'rundown'].some((n) => route.name?.toString().startsWith(n)),
        }"
      >
        {{ content.title }}
      </h2>

      <p class="section-description mt-3">
        {{ content.description }}
      </p>
    </div>

    <div class="@container mx-auto mt-6 max-w-xl">
      <div v-if="pending" class="flex items-center justify-center gap-x-2">
        <Spinner class="size-5 text-blue-600 dark:text-white" />
        <span class="tracking-tight">{{ $t('ui.loading') }}</span>
      </div>

      <div
        v-else-if="error"
        class="flex items-center justify-center text-center"
      >
        <span class="text-primary text-2xl font-semibold tracking-tighter"
          >{{ $t('ui.failedToGetData') }}</span
        >
      </div>

      <div v-else>
        <div v-if="activities?.length" class="flex flex-col gap-y-6">
          <div class="flex gap-1.5">
            <div class="group relative h-full w-full">
              <input
                type="text"
                v-model="searchInput"
                ref="searchInputEl"
                class="input-base peer h-10 px-9 py-2 text-sm tracking-tight"
                :placeholder="$t('ui.search')"
              />

              <IconSearch
                class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400 peer-focus:text-gray-400"
              />

              <span
                id="shortcut-key"
                class="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center gap-x-0.5 transition peer-placeholder-shown:flex peer-focus-within:hidden"
              >
                <kbd class="keyboard-symbol">{{ metaSymbol }} K</kbd>
              </span>

              <button
                id="clear-input"
                type="button"
                @click="
                  searchInput = '';
                  $refs.searchInputEl.focus();
                "
                class="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 transition-colors peer-placeholder-shown:hidden hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <IconClose class="h-3" />
              </button>
            </div>

            <DropdownMenu :modal="false" v-if="uniqueLocations.length > 2">
              <DropdownMenuTrigger as-child>
                <button
                  class="group flex items-center justify-center gap-x-2.5 rounded-xl tracking-tight"
                  aria-label="Filter by location"
                >
                  <div
                    class="border-border flex h-full w-44 items-center justify-between gap-x-3 rounded-xl border px-3 py-2 transition select-none @xl:w-64"
                  >
                    <span class="truncate text-sm"
                      >{{ selectedLocation || $t('ui.allLocations') }}
                    </span>
                    <IconChevronDown
                      class="size-3 shrink-0 transition group-data-[state=open]:rotate-180"
                    />
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                class="flex w-44 flex-col gap-y-1 rounded-xl px-1 py-2 @xl:w-64"
              >
                <DropdownMenuItem
                  v-for="(location, index) in uniqueLocations"
                  :key="location"
                  v-slot="{ active, close }"
                  as-child
                >
                  <button
                    :aria-label="location"
                    class="relative flex w-full cursor-pointer items-center gap-x-4 rounded-lg py-2 pr-4 pl-8 text-left tracking-tight text-black ring-black ring-offset-2 ring-offset-white transition hover:bg-gray-100 hover:text-black focus-visible:ring-1 focus-visible:outline-hidden active:scale-98 dark:text-white dark:ring-white dark:ring-offset-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
                    :class="{
                      'bg-gray-100 text-black dark:bg-gray-900 dark:text-white':
                        selectedLocation === location ||
                        (!selectedLocation && index === 0 && !active),
                      'bg-blue-600 text-white dark:bg-blue-600 dark:text-white':
                        active,
                    }"
                    @click="changeSelectedLocation(location)"
                  >
                    <IconCheck
                      v-if="
                        selectedLocation === location ||
                        (!selectedLocation && index === 0)
                      "
                      class="absolute top-2 left-2 size-5"
                    />
                    <span class="text-sm">{{
                      location || $t('ui.allLocations')
                    }}</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TabsRoot
            v-if="filteredRundownTabs?.length"
            :default-value="filteredRundownTabs[0]?.label.date"
            class="flex w-full flex-col"
          >
            <TabsList
              class="bg-muted text-muted-foreground/80 relative isolate flex items-center justify-center self-center rounded-xl p-0.5"
            >
              <TabsIndicator
                class="absolute inset-y-0.5 left-0 z-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position) rounded-full transition-all duration-300 ease-in-out"
              >
                <div class="bg-background h-full w-full rounded-lg" />
              </TabsIndicator>

              <TabsTrigger
                v-for="tab in filteredRundownTabs"
                :key="tab.label.date"
                :value="tab.label.date"
                class="ring-offset-background hover:text-muted-foreground focus-visible:ring-ring data-[state=active]:text-primary relative z-10 flex flex-col items-center justify-center gap-0.5 truncate rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap outline-hidden transition-all select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs data-[state=active]:shadow-black/5"
              >
                <span
                  class="text-base leading-tight! font-semibold tracking-tighter sm:text-base"
                  >{{ tab.label.date }}</span
                >
                <span
                  class="text-sm leading-tight! tracking-tight sm:text-sm"
                  >{{ tab.label.day }}</span
                >
              </TabsTrigger>
            </TabsList>

            <TabsContent
              v-for="tab in filteredRundownTabs"
              :key="tab.label.date"
              :value="tab.label.date"
              class="outline-hidden"
              tabindex="-1"
            >
              <div class="pt-4">
                <div
                  v-if="tab.activities?.length"
                  class="grid grid-cols-1 gap-1"
                >
                  <button
                    v-for="(activity, index) in tab.activities"
                    :key="index"
                    class="hover:bg-muted/50 flex w-full cursor-pointer gap-x-2 rounded-2xl p-2 text-left transition active:scale-98 @xl:gap-x-3 @xl:p-4"
                    @click="
                      uiStore.setDialogRundown({
                        isShow: true,
                        data: activity,
                      })
                    "
                  >
                    <div
                      class="flex w-12 shrink-0 flex-col items-center justify-between"
                    >
                      <span
                        class="flex w-full items-center justify-center rounded-lg border border-dotted border-gray-300 px-1 py-1 text-center text-xs font-semibold tracking-tight text-black sm:text-sm dark:border-gray-600 dark:text-white"
                        >{{ activity.start_time }}</span
                      >

                      <span
                        class="min-h-4 w-px grow border-l border-dotted border-gray-300 dark:border-gray-600"
                      ></span>

                      <span
                        class="flex w-full items-center justify-center rounded-lg border border-dotted border-gray-300 px-1 py-1 text-center text-xs font-semibold tracking-tight text-black sm:text-sm dark:border-gray-600 dark:text-white"
                        >{{ activity.end_time }}</span
                      >
                    </div>

                    <div class="flex grow flex-col py-1">
                      <div class="text-primary font-semibold tracking-tight">
                        {{ activity.title }}
                      </div>

                      <div class="mt-1.5 flex flex-col gap-y-2">
                        <div
                          v-if="activity.categories?.length"
                          class="flex items-center gap-x-1"
                        >
                          <IconTag class="h-4 shrink-0" />
                          <span class="text-xs tracking-tight sm:text-sm">{{
                            activity.categories.join(", ")
                          }}</span>
                        </div>

                        <div class="flex flex-wrap gap-3">
                          <div class="flex items-center gap-x-1">
                            <IconCalendar class="h-4 shrink-0" />
                            <span class="text-xs tracking-tight sm:text-sm">{{
                              activity.date_string
                            }}</span>
                          </div>

                          <div class="flex items-center gap-x-1">
                            <IconLocation class="h-4 shrink-0" />
                            <span class="text-xs tracking-tight sm:text-sm">{{
                              activity.location
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        v-if="activity.description"
                        class="mt-1.5 text-sm tracking-tight"
                      >
                        <p>{{ activity.description }}</p>
                      </div>

                      <!-- <div
                        v-if="activity.speakers?.length"
                        class="mt-1.5 flex items-start gap-x-1"
                      >
                        <IconMicrophone class="h-4 shrink-0 sm:mt-0.5" />
                        <span class="text-sm tracking-tight">{{
                          activity.speakers.join(", ")
                        }}</span>
                      </div> -->

                      <div
                        v-if="activity.presented_by"
                        class="text-muted-foreground mt-1.5 text-xs tracking-tight"
                      >
                        {{ $t('ui.presentedBy') }} {{ activity.presented_by }}
                      </div>
                    </div>

                    <div
                      v-if="activity.poster_img"
                      class="w-20 shrink-0 self-start overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900"
                    >
                      <NuxtImg
                        v-if="activity.poster_img?.sm"
                        :src="`${useAppConfig().app.apiUrl}/${activity.poster_img?.sm}`"
                        alt=""
                        class="h-full w-full object-cover"
                        sizes="200px"
                        width="1080"
                        height="1350"
                        loading="lazy"
                        format="webp"
                      />
                    </div>
                  </button>
                </div>

                <div
                  v-else
                  class="flex flex-col items-center justify-center pt-4 text-center"
                >
                  <span
                    class="text-primary text-base font-semibold tracking-tight"
                    >{{ $t('rundown.comingSoon') }}</span
                  >
                </div>
              </div>
            </TabsContent>
          </TabsRoot>

          <div v-else>
            <span
              class="text-primary text-center text-2xl font-semibold tracking-tighter"
              >{{ $t('rundown.nothingYet') }}
            </span>
          </div>
        </div>
        <div v-else class="mt-6 flex flex-col items-center gap-y-6 text-center">
          <div class="perspective-midrange">
            <RundownEmptyStateImage
              class="shadow-wrapper w-full max-w-80 rounded-md transition duration-300 hover:rotate-x-40"
            />
          </div>

          <span class="text-primary text-xl font-semibold tracking-tight"
            >{{ $t('rundown.comingSoon') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "reka-ui";
import { refDebounced } from "@vueuse/core";

const content = computed(() => useContentStore().components.rundown);
const config = useRuntimeConfig();
const uiStore = useUiStore();
const route = useRoute();

const searchInput = ref("");
const debouncedSearchInput = refDebounced(searchInput, 200);

const selectedLocation = ref(null);

const changeSelectedLocation = (location) => {
  selectedLocation.value = location;
};

// const {
//   data: activities,
//   refresh,
//   pending,
//   error,
// } = await useFetch(`${useAppConfig().app.apiUrl}/api/activities`, {
//   query: {
//     "filter[is_published]": 1,
//     sort: "date,start_time",
//   },
//   server: ["rundown"].includes(route.name) ? true : false,
//   lazy: true,
// });

const activities = ref([]);
const refresh = () => {};
const pending = ref(0);
const error = ref(0);

// Extract unique locations
const uniqueLocations = computed(() => {
  const locations = activities.value.map((activity) => activity.location);
  const sortedLocations = [...new Set(locations)].sort(); // Sort locations alphabetically
  return ["", ...sortedLocations]; // Include an empty string for "All Locations" at the top
});

// Filter activities by selected location and search query
const filteredActivities = computed(() => {
  let filtered = activities.value;

  // Filter by location if selected
  if (selectedLocation.value) {
    filtered = filtered.filter(
      (activity) => activity.location === selectedLocation.value,
    );
  }

  // Filter by search query
  if (debouncedSearchInput.value) {
    filtered = filtered.filter((activity) => {
      const query = debouncedSearchInput.value.toLowerCase();
      return (
        activity.title.toLowerCase().includes(query) ||
        (activity.description &&
          activity.description.toLowerCase().includes(query)) ||
        (activity.presented_by &&
          activity.presented_by.toLowerCase().includes(query)) ||
        (activity.categories &&
          activity.categories.some((category) =>
            category.toLowerCase().includes(query),
          )) ||
        (activity.speakers &&
          activity.speakers.some((speaker) =>
            speaker.toLowerCase().includes(query),
          ))
      );
    });
  }

  return filtered;
});

// Group filtered activities into tabs
const filteredRundownTabs = computed(() => {
  const groupedByDate = filteredActivities.value.reduce((acc, activity) => {
    const date = activity.date_string.split(",")[0];
    const day = activity.date_string.split(",")[1]?.trim();

    if (!acc[date]) {
      acc[date] = { label: { date, day }, activities: [] };
    }
    acc[date].activities.push(activity);

    return acc;
  }, {});

  return Object.values(groupedByDate);
});

const searchInputEl = ref();
const { metaSymbol } = useShortcuts();
defineShortcuts({
  meta_k: {
    handler: async () => {
      searchInputEl.value?.focus();
    },
  },
});
</script>
