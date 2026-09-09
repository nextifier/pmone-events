<script setup>
import { Skeleton } from "../ui/skeleton";

const { t } = useI18n();
const event = useEvent();

defineProps({
  // How many placeholder cards to render (defaults to a typical 3-up grid).
  count: { type: Number, default: 3 },
});
</script>

<template>
  <div class="container">
    <section>
      <!-- The heading is real text with TicketList's exact classes, not
           bars: its copy does not depend on the data, so rendering it here
           means the swap to the loaded list moves nothing above the cards. -->
      <div class="flex flex-col items-center gap-y-1 text-center sm:gap-y-3">
        <h2
          class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
        >
          {{ t("tickets.entryTitle") }}
        </h2>
        <p class="text-foreground tracking-tight text-balance max-sm:text-muted-foreground">
          {{ t("tickets.entrySubtitle", { event: event.title }) }}
        </p>
      </div>

      <div class="mx-auto mt-4 grid grid-cols-1 gap-4 sm:mt-6 xl:grid-cols-3">
        <!-- `ring`, not `border`: TicketStub draws its own hairline as an SVG
             path once mounted, and its pre-mount fallback is an inset ring for
             the same reason - a real border would make every card 2px taller
             than the one that replaces it. -->
        <div
          v-for="n in count"
          :key="n"
          class="bg-background ring-border flex h-full flex-col overflow-hidden rounded-3xl ring-1 ring-inset"
        >
          <!-- Same block rhythm as the real card: 16px between rows, trimmed
               to 14px above the benefits list (see TicketList). -->
          <div class="flex grow flex-col px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
            <!-- Poster + title -->
            <div class="flex items-center gap-x-3">
              <Skeleton class="size-12 shrink-0 rounded-xl lg:size-14" />
              <div class="flex flex-col gap-y-1.5">
                <Skeleton class="h-4 w-32 rounded" />
                <Skeleton class="h-3.5 w-40 rounded" />
              </div>
            </div>

            <!-- Badges -->
            <div class="mt-4 flex flex-wrap gap-1.5">
              <Skeleton class="h-7 w-24 rounded-full" />
              <Skeleton class="h-7 w-28 rounded-full" />
            </div>

            <!-- Benefits (check icon + line), on the real list's line box -->
            <div class="mt-3.5 flex flex-col gap-y-1">
              <div v-for="i in 3" :key="i" class="flex h-5 items-center gap-x-1.5">
                <Skeleton class="size-4 shrink-0 rounded-full" />
                <Skeleton class="h-3.5 rounded" :class="i === 3 ? 'w-1/2' : 'w-full'" />
              </div>
            </div>
          </div>

          <!-- Footer: perforation + price + Add button -->
          <div
            class="border-border flex grow-0 items-center justify-between gap-x-3 border-t border-dashed px-5 py-3 sm:px-8 sm:py-4"
          >
            <Skeleton class="h-6 w-24 rounded" />
            <Skeleton class="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
