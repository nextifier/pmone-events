<template>
  <section id="agenda">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span
          class="border-primary rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
          >{{ $t("agenda.badge") }}</span
        >
        <h2 class="section-title mt-2">
          {{ $t("agenda.title")
          }}<span class="text-gradient-accent">{{
            $t("agenda.titleAccent")
          }}</span>
        </h2>
        <p class="section-description mt-3 w-full">
          {{ $t("agenda.description") }}
        </p>
        <p class="mt-2 text-sm tracking-tight italic">
          {{ $t("agenda.draftNotice") }}
        </p>
      </div>

      <Tabs default-value="day1" class="mt-10">
        <div class="flex justify-center">
          <TabsList class="bg-muted border-0">
            <TabsIndicator class="bg-background shadow-sm" />
            <TabsTrigger
              v-for="day in days"
              :key="day.value"
              :value="day.value"
              class="data-[state=active]:text-foreground relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none [&>span]:overflow-visible [&>span]:whitespace-normal"
            >
              <span class="flex flex-col items-center gap-0.5 px-1">
                <span
                  class="text-base leading-tight font-semibold tracking-tighter"
                  >{{ day.label }}</span
                >
                <span class="text-xs leading-tight tracking-tight sm:text-sm"
                  >{{ day.shortDay }}, {{ day.shortDate }}</span
                >
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          v-for="day in days"
          :key="day.value"
          :value="day.value"
          class="mt-6"
        >
          <div class="mx-auto max-w-xl">
            <div class="grid grid-cols-1 gap-1">
              <template v-for="(block, i) in day.blocks" :key="i">
                <!-- Session Header -->
                <div
                  v-if="block.header"
                  class="border-accent/30 mt-3 mb-1 border-l-2 px-3 py-1"
                >
                  <span
                    class="text-accent text-base font-semibold tracking-tighter"
                    >{{ block.title }}</span
                  >
                  <p v-if="block.theme" class="tracking-tight">
                    {{ block.theme }}
                  </p>
                </div>

                <!-- Field Trip Card -->
                <div
                  v-else-if="block.fieldTrip"
                  class="border-border/50 bg-muted/30 flex items-start gap-4 rounded-2xl border p-4 sm:p-6"
                >
                  <div
                    class="bg-muted text-accent flex size-12 shrink-0 items-center justify-center rounded-xl"
                  >
                    <Icon name="hugeicons:bus-01" class="size-6" />
                  </div>
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <h3
                        class="text-base font-medium tracking-tighter sm:text-lg"
                      >
                        {{ block.title }}
                      </h3>
                      <span
                        class="bg-muted rounded-full px-2 py-0.5 text-sm font-medium tracking-tight"
                      >
                        {{ $t("agenda.types.trip") }}
                      </span>
                    </div>
                    <p class="mt-1 tracking-tight">
                      {{ block.time }}
                    </p>
                    <p class="mt-1 tracking-tight">
                      {{ block.description }}
                    </p>
                  </div>
                </div>

                <!-- Event Row -->
                <div
                  v-else
                  class="hover:bg-muted/50 flex w-full gap-x-2 rounded-2xl p-2 transition"
                >
                  <!-- Time -->
                  <span
                    class="w-24 shrink-0 pt-0.5 text-sm tracking-tight tabular-nums sm:pt-1"
                    >{{ block.time }}</span
                  >
                  <!-- Content -->
                  <div class="min-w-0 flex-1">
                    <span
                      class="text-base font-semibold tracking-tighter sm:text-lg"
                      >{{ block.title }}</span
                    >
                    <p v-if="block.speaker" class="mt-0.5 tracking-tight">
                      {{ block.speaker }}
                    </p>
                    <p v-if="block.subtitle" class="mt-0.5 tracking-tight">
                      {{ block.subtitle }}
                    </p>
                    <p
                      v-if="block.description"
                      class="mt-1.5 text-sm leading-relaxed tracking-tight"
                    >
                      {{ block.description }}
                    </p>
                    <p v-if="block.moderator" class="mt-1.5 tracking-tight">
                      <span class="font-medium"
                        >{{ $t("agenda.labels.moderator") }}:</span
                      >
                      {{ block.moderator }}
                    </p>
                    <div v-if="block.panelists" class="mt-0.5 tracking-tight">
                      <span class="font-medium"
                        >{{ $t("agenda.labels.panelists") }}:</span
                      >
                      <ul class="mt-1 list-outside list-disc space-y-0.5 pl-4">
                        <li
                          v-for="(panelist, i) in block.panelists.split(' · ')"
                          :key="i"
                        >
                          {{ panelist }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const days = computed(() => [
  {
    value: "day1",
    label: t("agenda.day1.label"),
    shortDay: t("agenda.day1.shortDay"),
    shortDate: t("agenda.day1.shortDate"),
    date: t("agenda.day1.date"),
    blocks: [
      {
        time: "07:30 – 08:30",
        title: t("agenda.events.registration"),
      },
      {
        time: "08:30 – 08:45",
        title: t("agenda.events.nationalAnthem"),
      },
      {
        time: "08:45 – 08:55",
        title: t("agenda.events.welcomeDance"),
      },
      {
        time: "08:55 – 09:05",
        title: t("agenda.events.openingRemarks"),
        speaker: t("agenda.speakers.jeffreyHaribowo"),
      },
      {
        time: "09:05 – 09:15",
        title: t("agenda.events.welcomeSpeech"),
        speaker: t("agenda.speakers.michelArrion"),
      },
      {
        time: "09:15 – 09:30",
        title: t("agenda.events.keynoteAddress"),
        speaker: t("agenda.speakers.zulkifliHasan"),
      },
      {
        time: "09:30 – 09:45",
        title: t("agenda.events.keynoteAddress"),
        speaker: t("agenda.speakers.gibranRakabuming"),
      },
      {
        time: "09:45 – 10:00",
        title: t("agenda.events.cocoaBreak"),
        subtitle: t("agenda.events.vipTour"),
      },
      // Session I
      {
        header: true,
        title: t("agenda.sessions.s1.title"),
        theme: t("agenda.sessions.s1.theme"),
      },
      {
        time: "10:00 – 10:15",
        title: t("agenda.events.keynoteAddress"),
        speaker: t("agenda.speakers.widiastuti"),
      },
      {
        time: "10:15 – 12:00",
        title: t("agenda.events.panelDiscussion"),
        subtitle: t("agenda.events.panelS1"),
        description: t("agenda.events.panelDescS1"),
        moderator: t("agenda.moderators.s1"),
        panelists: t("agenda.panelists.s1"),
      },
      {
        time: "12:00 – 13:00",
        title: t("agenda.events.lunchBreak"),
      },
      // Session II
      {
        header: true,
        title: t("agenda.sessions.s2.title"),
        theme: t("agenda.sessions.s2.theme"),
      },
      {
        time: "13:00 – 13:15",
        title: t("agenda.events.sessionRemark"),
        speaker: t("agenda.speakers.mohammadAlfansyah"),
      },
      {
        time: "13:15 – 15:00",
        title: t("agenda.events.panelDiscussion"),
        subtitle: t("agenda.events.panelS2"),
        description: t("agenda.events.panelDescS2"),
        moderator: t("agenda.moderators.s2"),
        panelists: t("agenda.panelists.s2"),
      },
      // Session III
      {
        header: true,
        title: t("agenda.sessions.s3.title"),
        theme: t("agenda.sessions.s3.theme"),
      },
      {
        time: "15:00 – 15:15",
        title: t("agenda.events.sessionRemark"),
        speaker: t("agenda.speakers.andiAmranSulaiman"),
      },
      {
        time: "15:15 – 17:00",
        title: t("agenda.events.panelDiscussion"),
        subtitle: t("agenda.events.panelS3"),
        description: t("agenda.events.panelDescS3"),
        moderator: t("agenda.moderators.s3"),
        panelists: t("agenda.panelists.s3"),
      },
      {
        time: "17:30 – 18:30",
        title: t("agenda.events.welcomeCocktail"),
        subtitle: t("agenda.events.welcomeSpeechOfi"),
      },
    ],
  },
  {
    value: "day2",
    label: t("agenda.day2.label"),
    shortDay: t("agenda.day2.shortDay"),
    shortDate: t("agenda.day2.shortDate"),
    date: t("agenda.day2.date"),
    blocks: [
      {
        time: "08:00 – 09:45",
        title: t("agenda.events.registration"),
      },
      {
        time: "09:45 – 10:00",
        title: t("agenda.events.openingEntertainment"),
      },
      {
        time: "10:00 – 10:15",
        title: t("agenda.events.keynoteAddress"),
        speaker: t("agenda.speakers.budiSantoso"),
      },
      {
        time: "10:15 – 10:30",
        title: t("agenda.events.keynoteAddress"),
        speaker: t("agenda.speakers.kashanRashid"),
      },
      // Session IV
      {
        header: true,
        title: t("agenda.sessions.s4.title"),
        theme: t("agenda.sessions.s4.theme"),
      },
      {
        time: "10:30 – 12:00",
        title: t("agenda.events.panelDiscussion"),
        subtitle: t("agenda.events.panelS4"),
        description: t("agenda.events.panelDescS4"),
        moderator: t("agenda.moderators.s4"),
        panelists: t("agenda.panelists.s4"),
      },
      {
        time: "12:00 – 13:00",
        title: t("agenda.events.lunchBreak"),
      },
      // Session V
      {
        header: true,
        title: t("agenda.sessions.s5.title"),
        theme: t("agenda.sessions.s5.theme"),
      },
      {
        time: "13:00 – 13:15",
        title: t("agenda.events.sessionRemark"),
        speaker: t("agenda.speakers.djatmikoBris"),
      },
      {
        time: "13:15 – 15:00",
        title: t("agenda.events.panelDiscussion"),
        subtitle: t("agenda.events.panelS5"),
        description: t("agenda.events.panelDescS5"),
        moderator: t("agenda.moderators.s5"),
        panelists: t("agenda.panelists.s5"),
      },
      // Closing Ceremony
      {
        header: true,
        title: t("agenda.sessions.closing.title"),
      },
      {
        time: "15:00 – 15:30",
        title: t("agenda.events.wrapUp"),
        speaker: t("agenda.speakers.sikstusGusli"),
      },
      {
        time: "15:30 – 16:00",
        title: t("agenda.events.announcement"),
      },
      {
        time: "16:00 – 16:15",
        title: t("agenda.events.grindRelease"),
        speaker: t("agenda.speakers.agusGumiwang"),
      },
      {
        time: "16:15 – 17:15",
        title: t("agenda.events.vvipDialogue"),
        subtitle: t("agenda.events.preDinnerDelegates"),
      },
      {
        time: "17:15 – 18:00",
        title: t("agenda.events.travelToDinner"),
      },
      {
        time: "18:00 – 19:00",
        title: t("agenda.events.preDinnerCocktail"),
      },
      {
        time: "19:00+",
        title: t("agenda.events.galaDinner"),
        subtitle: t("agenda.events.hostedBy"),
      },
    ],
  },
  {
    value: "day3",
    label: t("agenda.day3.label"),
    shortDay: t("agenda.day3.shortDay"),
    shortDate: t("agenda.day3.shortDate"),
    date: t("agenda.day3.date"),
    blocks: [
      {
        fieldTrip: true,
        time: "08:00 - Finish",
        title: t("agenda.day3.title"),
        description: t("agenda.day3.description"),
      },
    ],
  },
]);
</script>
