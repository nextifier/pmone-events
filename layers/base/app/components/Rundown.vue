<template>
  <section id="rundown" class="container lg:max-w-3xl">
    <slot name="header" :content="content">
      <div class="flex flex-col items-center text-center">
        <h2 class="section-title">
          {{ content.title }}
        </h2>

        <p class="section-description mt-3">
          {{ content.description }}
        </p>
      </div>
    </slot>

    <div class="@container mx-auto mt-6 max-w-xl">
      <div v-if="pending" class="flex flex-col gap-y-6">
        <!-- Search bar skeleton (matches the real input row) -->
        <div v-if="effectiveShowSearch" class="flex gap-1.5">
          <Skeleton class="h-10 w-full rounded-xl" />
        </div>

        <!-- Day tabs skeleton (segmented pill, centered) -->
        <div class="flex flex-col">
          <div class="flex justify-center">
            <div
              class="bg-muted/60 inline-flex items-center gap-1 rounded-full p-1"
            >
              <div
                v-for="i in 3"
                :key="`day-tab-${i}`"
                class="flex flex-col items-center gap-1 rounded-full px-4 py-1.5"
              >
                <Skeleton class="h-4 w-12 rounded" />
                <Skeleton class="h-3 w-16 rounded" />
              </div>
            </div>
          </div>

          <!-- Activity item skeletons (10 rows, mirror the real card layout) -->
          <div class="pt-4">
            <div class="grid grid-cols-1 gap-1">
              <div
                v-for="i in 10"
                :key="`item-${i}`"
                class="flex w-full gap-x-2 rounded-2xl p-2 @xl:p-3"
              >
                <!-- Time block: w-24 shrink-0 to match the real time range column -->
                <div class="w-24 shrink-0 pt-0.5 sm:pt-1">
                  <Skeleton class="h-4 w-20 rounded" />
                </div>

                <!-- Body -->
                <div class="min-w-0 flex-1 space-y-1.5">
                  <Skeleton class="h-5 w-3/4 rounded sm:h-6" />
                  <Skeleton v-if="i % 3 !== 0" class="h-4 w-1/2 rounded" />
                  <div class="flex items-center gap-x-1 pt-1">
                    <Skeleton class="size-4 shrink-0 rounded" />
                    <Skeleton class="h-3 w-32 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex items-center justify-center text-center"
      >
        <span class="text-primary text-2xl font-semibold tracking-tighter">{{
          $t("ui.failedToGetData")
        }}</span>
      </div>

      <div v-else>
        <div v-if="activities?.length" class="flex flex-col gap-y-6">
          <div
            v-if="
              effectiveShowSearch ||
              (effectiveShowLocationFilter && uniqueLocations.length > 2)
            "
            class="flex gap-1.5"
          >
            <div
              v-if="effectiveShowSearch"
              class="group relative h-full w-full"
            >
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

            <DropdownMenu
              :modal="false"
              v-if="effectiveShowLocationFilter && uniqueLocations.length > 2"
            >
              <DropdownMenuTrigger as-child>
                <button
                  class="group flex items-center justify-center gap-x-2.5 rounded-xl tracking-tight"
                  aria-label="Filter by location"
                >
                  <div
                    class="border-border flex h-full w-44 items-center justify-between gap-x-3 rounded-xl border px-3 py-2 transition select-none @xl:w-64"
                  >
                    <span class="truncate text-sm"
                      >{{ selectedLocation || $t("ui.allLocations") }}
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
                  v-slot="{ active }"
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
                      location || $t("ui.allLocations")
                    }}</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs
            v-if="filteredRundownTabs?.length"
            v-model="activeTab"
            variant="segmented"
            swipe
            class="flex w-full flex-col"
          >
            <div class="flex justify-center">
              <TabsList>
                <TabsIndicator />

                <TabsTrigger
                  v-for="tab in filteredRundownTabs"
                  :key="tab.value"
                  :value="tab.value"
                  class="h-auto shrink-0 py-1.5"
                >
                  <span class="flex flex-col items-center gap-0.5">
                    <span
                      class="text-base leading-tight font-semibold tracking-tighter"
                      >{{ tab.label.dayName }}</span
                    >
                    <span
                      class="text-xs leading-tight tracking-tight sm:text-sm"
                      >{{ tab.label.dateLabel }}</span
                    >
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              v-for="tab in filteredRundownTabs"
              :key="tab.value"
              :value="tab.value"
              class="text-foreground outline-hidden"
              tabindex="-1"
            >
              <div class="pt-4">
                <div
                  v-if="tab.activities?.length"
                  class="grid grid-cols-1 gap-1"
                >
                  <template
                    v-for="(activity, index) in tab.activities"
                    :key="activity.id ?? index"
                  >
                    <!-- Section Header (settings.is_group_header — non-clickable) -->
                    <div
                      v-if="activity.is_header"
                      class="border-primary mt-6 mb-2 border-l-2 pl-4"
                    >
                      <span
                        class="text-base font-semibold tracking-tighter"
                        >{{ activity.title }}</span
                      >
                      <p
                        v-if="activity.subtitle"
                        class="mt-1 text-base tracking-tight"
                      >
                        {{ activity.subtitle }}
                      </p>
                      <p
                        v-if="activity.theme"
                        class="mt-1 text-base tracking-tight"
                      >
                        {{ activity.theme }}
                      </p>
                    </div>

                    <!-- Field Trip Card -->
                    <component
                      v-else-if="activity.type === 'field_trip'"
                      :is="effectiveClickToOpenDialog ? 'button' : 'div'"
                      :type="effectiveClickToOpenDialog ? 'button' : undefined"
                      class="border-border/50 bg-muted/30 flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition sm:p-6"
                      :class="
                        effectiveClickToOpenDialog
                          ? 'hover:bg-muted/50 cursor-pointer active:scale-98'
                          : ''
                      "
                      @click="
                        effectiveClickToOpenDialog ? openDialog(activity) : null
                      "
                    >
                      <div
                        class="bg-accent/10 text-accent flex size-12 shrink-0 items-center justify-center rounded-xl"
                      >
                        <Icon name="hugeicons:bus-01" class="size-6" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                          <h3
                            class="text-base font-medium tracking-tighter sm:text-lg"
                          >
                            {{ activity.title }}
                          </h3>
                          <span
                            class="bg-muted rounded-full px-2 py-0.5 text-sm font-medium tracking-tight"
                          >
                            {{ $t("ui.fieldTrip") }}
                          </span>
                        </div>
                        <p
                          v-if="activity.start_time || activity.end_time"
                          class="mt-1 tracking-tight"
                        >
                          {{ formatTimeRange(activity) }}
                        </p>
                        <p
                          v-if="activity.description"
                          class="mt-1 tracking-tight"
                          v-html="activity.description"
                        />
                      </div>
                      <div
                        v-if="activity.poster_image?.sm"
                        class="hidden w-20 shrink-0 self-start overflow-hidden rounded-xl bg-gray-100 sm:block dark:bg-gray-900"
                      >
                        <NuxtImg
                          :src="activity.poster_image.sm"
                          alt=""
                          class="h-full w-full object-cover"
                          sizes="200px"
                          width="1080"
                          height="1350"
                          loading="lazy"
                          format="webp"
                        />
                      </div>
                    </component>

                    <!-- Regular / break / custom -->
                    <component
                      v-else
                      :is="effectiveClickToOpenDialog ? 'button' : 'div'"
                      :type="effectiveClickToOpenDialog ? 'button' : undefined"
                      class="flex w-full gap-x-2 rounded-2xl p-2 text-left transition @xl:p-3"
                      :class="
                        effectiveClickToOpenDialog
                          ? 'hover:bg-muted/50 cursor-pointer active:scale-98'
                          : ''
                      "
                      @click="
                        effectiveClickToOpenDialog ? openDialog(activity) : null
                      "
                    >
                      <!-- Time + Poster (left column) -->
                      <div class="flex w-24 shrink-0 flex-col gap-2">
                        <span
                          class="pt-0.5 text-sm tracking-tight tabular-nums sm:pt-1"
                          >{{ formatTimeRange(activity) }}</span
                        >

                        <div
                          v-if="activity.poster_image?.sm"
                          class="w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900"
                        >
                          <NuxtImg
                            :src="activity.poster_image.sm"
                            alt=""
                            class="h-full w-full object-cover"
                            sizes="200px"
                            width="1080"
                            height="1350"
                            loading="lazy"
                            format="webp"
                          />
                        </div>
                      </div>

                      <!-- Body -->
                      <div class="min-w-0 flex-1">
                        <span
                          class="text-base font-semibold tracking-tighter sm:text-lg"
                          >{{ activity.title }}</span
                        >

                        <p
                          v-if="activity.speakers_list?.length === 1"
                          class="mt-0.5 tracking-tight"
                        >
                          <span class="font-semibold"
                            >{{ $t("ui.speaker") }}:&nbsp;</span
                          >
                          <span class="font-medium">{{
                            activity.speakers_list[0].name
                          }}</span>
                          <span
                            v-if="activity.speakers_list[0].title"
                            class="text-muted-foreground"
                            >, {{ activity.speakers_list[0].title }}</span
                          >
                          <span
                            v-if="activity.speakers_list[0].organization"
                            class="text-muted-foreground"
                          >
                            - {{ activity.speakers_list[0].organization }}</span
                          >
                        </p>

                        <div
                          v-else-if="activity.speakers_list?.length"
                          class="mt-0.5 tracking-tight"
                        >
                          <span class="font-semibold"
                            >{{ $t("ui.speakers") }}:</span
                          >
                          <ul
                            class="mt-1 list-outside list-disc space-y-0.5 pl-4"
                          >
                            <li
                              v-for="(speaker, sIdx) in activity.speakers_list"
                              :key="sIdx"
                            >
                              <span class="font-medium">{{
                                speaker.name
                              }}</span>
                              <span
                                v-if="speaker.title"
                                class="text-muted-foreground"
                                >, {{ speaker.title }}</span
                              >
                              <span
                                v-if="speaker.organization"
                                class="text-muted-foreground"
                              >
                                - {{ speaker.organization }}</span
                              >
                            </li>
                          </ul>
                        </div>

                        <p
                          v-if="activity.theme"
                          class="text-muted-foreground mt-0.5 tracking-tight"
                        >
                          {{ activity.theme }}
                        </p>

                        <p
                          v-if="activity.subtitle"
                          class="mt-0.5 font-semibold tracking-tight"
                        >
                          {{ activity.subtitle }}
                        </p>

                        <template v-if="effectiveShowAllDetails">
                          <div
                            v-if="activity.description"
                            class="mt-1.5 text-sm leading-relaxed tracking-tight sm:text-base"
                            v-html="activity.description"
                          />

                          <p
                            v-if="activity.moderator"
                            class="mt-1.5 tracking-tight"
                          >
                            <span class="font-semibold"
                              >{{ $t("ui.moderator") }}:</span
                            >
                            {{ activity.moderator }}
                          </p>

                          <div
                            v-if="activity.panelist_names?.length"
                            class="mt-0.5 tracking-tight"
                          >
                            <span class="font-semibold"
                              >{{ $t("ui.panelists") }}:</span
                            >
                            <ul
                              class="mt-1 list-outside list-disc space-y-0.5 pl-4"
                            >
                              <li
                                v-for="(
                                  panelist, pIdx
                                ) in activity.panelist_names"
                                :key="pIdx"
                              >
                                {{ panelist }}
                              </li>
                            </ul>
                          </div>

                          <div
                            v-if="activity.categories?.length"
                            class="mt-1.5 flex items-center gap-x-1"
                          >
                            <IconTag class="h-4 shrink-0" />
                            <span class="text-sm tracking-tight sm:text-base">{{
                              activity.categories.join(", ")
                            }}</span>
                          </div>

                          <div
                            v-if="activity.location"
                            class="mt-1 flex items-center gap-x-1"
                          >
                            <IconLocation class="h-4 shrink-0" />
                            <span class="text-sm tracking-tight sm:text-base">{{
                              activity.location
                            }}</span>
                          </div>

                          <div
                            v-if="activity.presented_by"
                            class="text-muted-foreground mt-1.5 text-sm tracking-tight sm:text-base"
                          >
                            {{ $t("ui.presentedBy") }}
                            {{ activity.presented_by }}
                          </div>
                        </template>
                      </div>
                    </component>
                  </template>
                </div>

                <div
                  v-else
                  class="flex flex-col items-center justify-center pt-4 text-center"
                >
                  <span class="text-base font-semibold tracking-tight">{{
                    $t("rundown.comingSoon")
                  }}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div v-else>
            <span
              class="text-primary text-center text-2xl font-semibold tracking-tighter"
              >{{ $t("rundown.nothingYet") }}
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
            >{{ $t("rundown.comingSoon") }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { refDebounced } from "@vueuse/core";

const props = defineProps({
  showSearch: { type: Boolean, default: true },
  clickToOpenDialog: { type: Boolean, default: true },
});

const uiStore = useUiStore();
const route = useRoute();
const { t, te, locale } = useI18n();
const appConfig = useAppConfig();

const content = computed(() => {
  const fromStore = useContentStore().components.rundown;
  const appName = appConfig.app.name;
  return {
    title: te("rundown.title") ? t("rundown.title") : fromStore?.title,
    description: te("rundown.description")
      ? t("rundown.description", { appName })
      : fromStore?.description,
  };
});

const searchInput = ref("");
const debouncedSearchInput = refDebounced(searchInput, 200);

const selectedLocation = ref(null);

const changeSelectedLocation = (location) => {
  selectedLocation.value = location;
};

// On the dedicated /rundown page we SSR the data so the page is SEO-friendly
// and renders the final markup on first paint. Embedded usage on other pages
// (home, etc.) defers fetch until after hydration to avoid mismatches between
// the SSR render (no data, no pending) and the client's initial hydration
// (where useFetch would otherwise flip pending → true immediately and re-render
// a different branch).
// `@nuxtjs/i18n` suffixes route names with `___<locale>` (e.g. `rundown___en`),
// so we match by prefix rather than exact equality.
const isRundownPage = (route.name?.toString() ?? "").startsWith("rundown");

const {
  data: rundownData,
  pending,
  error,
  execute: executeRundown,
} = await useFetch("/api/event/rundown", {
  query: { locale },
  server: isRundownPage,
  lazy: !isRundownPage,
  immediate: isRundownPage,
  watch: [locale],
});

if (!isRundownPage && import.meta.client) {
  onMounted(() => {
    executeRundown();
  });
}

// Day-first "D MMM" e.g. "7 May", "22 Jul"
function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat(locale.value, {
    month: "short",
  }).format(d);
  return `${day} ${month}`;
}

// Locale-aware weekday: short for English, long for Indonesian (matches typical convention).
function formatWeekdayShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const opt = locale.value.startsWith("id") ? "long" : "short";
  return new Intl.DateTimeFormat(locale.value, { weekday: opt }).format(d);
}

// Build "Day 1" / "Hari 1" from API day_label using i18n key if available
function formatDayName(dayNumber, fallback) {
  if (dayNumber == null) return fallback || "";
  if (te("rundown.day")) {
    return t("rundown.day", { n: dayNumber });
  }
  return fallback || `Day ${dayNumber}`;
}

// "Day 1 - Wednesday, 22 July 2026" / "Hari 1 - Rabu, 22 Juli 2026"
function formatDateLong(dateStr, dayName) {
  if (!dateStr) return dayName || "";
  const d = new Date(dateStr);
  const weekday = new Intl.DateTimeFormat(locale.value, {
    weekday: "long",
  }).format(d);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat(locale.value, { month: "long" }).format(
    d,
  );
  const year = d.getFullYear();
  const dateText = `${weekday}, ${day} ${month} ${year}`;
  return dayName ? `${dayName} - ${dateText}` : dateText;
}

const finishLabel = computed(() => {
  if (te("rundown.finish")) return t("rundown.finish");
  return locale.value.startsWith("id") ? "Selesai" : "Finish";
});

function formatTimeRange(activity) {
  const start = activity.start_time;
  const end = activity.end_time;
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - ${finishLabel.value}`;
  if (end) return end;
  return "";
}

function openDialog(activity) {
  uiStore.setDialogRundown({ isShow: true, data: activity });
}

const activities = computed(() => {
  const days = rundownData.value?.data?.days ?? [];
  return days.flatMap((day) =>
    day.items.map((item) => ({
      ...item,
      day_date: day.date,
      day_number: day.day_number,
      day_label: day.day_label,
      day_name: formatDayName(day.day_number, day.day_label),
      date_label_short: formatDateShort(day.date),
      date_label_full: formatDateLong(
        day.date,
        formatDayName(day.day_number, day.day_label),
      ),
      weekday_short: formatWeekdayShort(day.date),
      speakers_list: (item.speakers ?? [])
        .map((s) => ({
          name: s?.name ?? "",
          title: s?.title ?? "",
          organization: s?.organization ?? "",
        }))
        .filter((s) => s.name),
      speaker_names: (item.speakers ?? []).map((s) => s?.name).filter(Boolean),
      panelist_names: (item.panelists ?? [])
        .map((p) => p?.name)
        .filter(Boolean),
      is_header: Boolean(item.settings?.is_group_header),
    })),
  );
});

// Settings sourced from /api/projects/{username}/website-settings (admin) and
// surfaced through the public rundown payload at `data.settings`. The component
// props remain the local fallback when the API hasn't returned settings yet.
const remoteSettings = computed(
  () => rundownData.value?.data?.settings ?? null,
);

const effectiveShowSearch = computed(() => {
  if (
    remoteSettings.value &&
    typeof remoteSettings.value.show_search_bar === "boolean"
  ) {
    return remoteSettings.value.show_search_bar;
  }
  return props.showSearch;
});

const effectiveShowLocationFilter = computed(() => {
  if (
    remoteSettings.value &&
    typeof remoteSettings.value.show_location_filter === "boolean"
  ) {
    return remoteSettings.value.show_location_filter;
  }
  return true;
});

const effectiveShowAllDetails = computed(() => {
  if (
    remoteSettings.value &&
    typeof remoteSettings.value.show_all_rundown_details === "boolean"
  ) {
    return remoteSettings.value.show_all_rundown_details;
  }
  return false;
});

const effectiveClickToOpenDialog = computed(() => {
  // When details render inline, the dialog is redundant.
  return !effectiveShowAllDetails.value && props.clickToOpenDialog;
});

const uniqueLocations = computed(() => {
  const locations = activities.value.map((a) => a.location).filter((l) => l);
  const sortedLocations = [...new Set(locations)].sort();
  return ["", ...sortedLocations];
});

const filteredActivities = computed(() => {
  let filtered = activities.value;

  if (selectedLocation.value) {
    filtered = filtered.filter((a) => a.location === selectedLocation.value);
  }

  if (debouncedSearchInput.value) {
    const q = debouncedSearchInput.value.toLowerCase();
    filtered = filtered.filter((a) => {
      const speakerHaystack = (a.speakers_list ?? []).flatMap((s) => [
        s.name,
        s.title,
        s.organization,
      ]);
      const haystack = [
        a.title,
        a.subtitle,
        a.theme,
        a.location,
        a.presented_by,
        a.moderator,
        ...(a.categories ?? []),
        ...speakerHaystack,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return filtered;
});

const filteredRundownTabs = computed(() => {
  const groups = new Map();
  for (const activity of filteredActivities.value) {
    const key = activity.day_date ?? "_unscheduled";
    if (!groups.has(key)) {
      groups.set(key, {
        value: key,
        label: {
          dayName: activity.day_name,
          dateLabel: [activity.weekday_short, activity.date_label_short]
            .filter(Boolean)
            .join(", "),
        },
        activities: [],
      });
    }
    groups.get(key).activities.push(activity);
  }
  return Array.from(groups.values());
});

// Active day tab: auto-switch to first available tab when current tab is
// filtered out (e.g. user types a search term that only matches items on
// another day).
const activeTab = ref(null);

watch(
  filteredRundownTabs,
  (tabs) => {
    if (!tabs?.length) return;
    if (!tabs.some((t) => t.value === activeTab.value)) {
      activeTab.value = tabs[0].value;
    }
  },
  { immediate: true },
);

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
