<template>
  <div class="space-y-8">
    <section v-for="day in days" :key="day.day" class="space-y-4">
      <h3 v-if="showDayLabel" class="text-base font-medium tracking-tight">
        {{ day.label ?? `Hari ${day.day}` }}
      </h3>

      <ol class="relative space-y-0">
        <li
          v-for="(step, index) in day.steps"
          :key="`${day.day}-${step.order}`"
          class="relative flex gap-x-4 pb-6 last:pb-0"
        >
          <!-- The rail stops at the last item instead of trailing into nothing. -->
          <span
            v-if="index < day.steps.length - 1"
            aria-hidden="true"
            class="bg-border absolute top-2 bottom-0 left-[3px] w-px"
          />

          <span
            aria-hidden="true"
            class="bg-brand relative mt-1.5 size-[7px] shrink-0 rounded-full"
          />

          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex flex-wrap items-baseline gap-x-2">
              <span
                v-if="step.time"
                class="text-muted-foreground shrink-0 text-sm tracking-tight tabular-nums"
              >
                {{ step.time }}
              </span>
              <p class="text-sm font-medium tracking-tight text-pretty">{{ step.title }}</p>
            </div>
            <p
              v-if="step.description"
              class="text-muted-foreground text-sm tracking-tight text-pretty"
            >
              {{ step.description }}
            </p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ItineraryDay } from "~/data/types";

const props = defineProps<{ days: ItineraryDay[] }>();

/**
 * A single-day itinerary does not need a "Hari 1" heading above it; the page
 * already says what it is.
 */
const showDayLabel = computed(() => props.days.length > 1 || Boolean(props.days[0]?.label));
</script>
