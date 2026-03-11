<template>
  <div v-if="ticketCategories?.length" class="container">
    <div class="grid grid-cols-1 gap-y-10 lg:gap-y-16">
      <div
        v-for="(category, index) in ticketCategories"
        :key="index"
        :id="category.slug"
      >
        <div class="flex flex-col items-center gap-y-3 text-center">
          <h2
            class="text-primary text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ category.title }}
          </h2>

          <p
            v-if="category.description"
            class="text-primary tracking-tight text-balance"
          >
            {{ category.description }}
          </p>

          <p
            class="text-xs tracking-tight text-balance sm:text-sm xl:text-pretty"
          >
            {{ $t('ticket.agreementPrefix') }}
            <nuxt-link :to="localePath('/ticket-terms-and-conditions')" class="text-info hover:underline"
              >{{ $t('ticket.ticketTerms') }}</nuxt-link
            >
            {{ $t('ticket.agreementAnd') }}
            <nuxt-link :to="localePath('/event-policy')" class="text-info hover:underline"
              >{{ $t('ticket.eventPolicy') }}</nuxt-link
            >.
          </p>

          <div
            v-if="category.notes"
            v-html="category.notes"
            class="prose prose-sm dark:prose-invert sm:prose max-w-3xl tracking-tight text-pretty break-words"
          ></div>
        </div>

        <div
          class="mx-auto mt-6 grid grid-cols-1 gap-4 lg:mt-8"
          :class="{
            'max-w-lg': category.tickets.length === 1,
            'max-w-5xl lg:grid-cols-2': category.tickets.length === 2,
            'xl:grid-cols-3': category.tickets.length >= 3,
          }"
        >
          <div
            v-for="(ticket, index) in category.tickets"
            :id="ticket.slug"
            class="overflow-hidden rounded-2xl"
          >
            <div
              class="border-border bg-background flex h-full flex-col rounded-3xl border"
            >
              <div class="flex grow flex-col px-4 pt-4 sm:px-6 sm:pt-6">
                <div class="flex items-center gap-x-3">
                  <nuxt-link
                    :to="ticket.disableLink ? '' : ticket.button_url"
                    v-if="ticket.image"
                    class="bg-muted border-border block size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl lg:size-18"
                    @click="handleGetTicketButtonClick(ticket)"
                  >
                    <NuxtImg
                      :src="ticket.image"
                      :alt="ticket.title"
                      class="size-full object-cover"
                      sizes="250px"
                      width="250"
                      height="250"
                      loading="lazy"
                      format="webp"
                    />
                  </nuxt-link>

                  <div class="flex flex-col items-start gap-y-1">
                    <nuxt-link
                      :to="ticket.disableLink ? '' : ticket.button_url"
                      class="text-primary line-clamp-2 cursor-pointer text-sm font-semibold tracking-tight"
                      @click="handleGetTicketButtonClick(ticket)"
                      >{{ ticket.title }}</nuxt-link
                    >

                    <div
                      v-if="ticket.status"
                      class="inline-flex items-center gap-1.5 text-xs tracking-tight sm:text-sm"
                    >
                      <StatusIndicator
                        :status="ticket.status"
                        :showStatusLabel="
                          (ticket.starts_in &&
                            ticket.showStartCountdownLabel) ||
                          (ticket.ends_in && ticket.showEndCountdownLabel)
                            ? false
                            : true
                        "
                      />

                      <div
                        v-if="
                          (ticket.starts_in &&
                            ticket.showStartCountdownLabel) ||
                          (ticket.ends_in && ticket.showEndCountdownLabel)
                        "
                      >
                        <span
                          v-if="
                            ticket.starts_in && ticket.showStartCountdownLabel
                          "
                          v-tippy="
                            $dayjs(ticket.starts_in).format(
                              'MMMM D, YYYY [at] h:mm A',
                            )
                          "
                        >
                          <Countdown
                            variant="no-style"
                            :textBeforeCountdown="`${$t('ui.startsIn')} `"
                            :countdownDate="new Date(ticket.starts_in)"
                        /></span>

                        <span
                          v-if="ticket.ends_in && ticket.showEndCountdownLabel"
                          v-tippy="
                            $dayjs(ticket.ends_in).format(
                              'MMMM D, YYYY [at] h:mm A',
                            )
                          "
                        >
                          <Countdown
                            variant="no-style"
                            :textBeforeCountdown="`${$t('ui.endsIn')} `"
                            :countdownDate="new Date(ticket.ends_in)"
                        /></span>
                      </div>
                    </div>

                    <LoadingChaoticOrbit
                      v-else
                      class="size-[1lh] translate-y-1 scale-110 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div
                  v-if="
                    ticket.date ||
                    ticket.time ||
                    ticket.location ||
                    ticket.day_pass ||
                    ticket.entrance
                  "
                  class="mt-4 flex flex-wrap gap-x-1.5 gap-y-2"
                >
                  <Chip
                    v-if="ticket.date"
                    :label="ticket.date"
                    iconName="hugeicons:calendar-03"
                  />
                  <Chip
                    v-if="ticket.time"
                    :label="ticket.time"
                    iconName="hugeicons:clock-01"
                  />
                  <Chip
                    v-if="ticket.location"
                    :label="ticket.location"
                    iconName="hugeicons:location-01"
                  />
                  <Chip
                    v-if="ticket.day_pass"
                    :label="ticket.day_pass"
                    iconName="hugeicons:ticket-star"
                  />
                  <Chip
                    v-if="ticket.entrance"
                    :label="ticket.entrance"
                    iconName="hugeicons:square-arrow-right-03"
                  />
                </div>

                <div
                  v-if="ticket.description"
                  v-html="ticket.description"
                  class="prose prose-sm dark:prose-invert mt-4 tracking-tight"
                ></div>

                <div
                  v-if="ticket.benefits && ticket.benefits.length"
                  class="mt-2 flex flex-col"
                >
                  <div class="mt-2 flex flex-col gap-y-1">
                    <div
                      v-for="(benefit, index) in ticket.benefits"
                      :key="index"
                      class="flex gap-x-1.5"
                    >
                      <IconCheck class="h-4 shrink-0 text-green-500 sm:h-5" />
                      <span
                        class="text-xs leading-normal! tracking-tight sm:text-sm"
                        >{{ benefit }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="border-border relative mt-4 flex grow-0 items-center justify-between gap-x-3 border-t border-dashed px-5 py-2.5 sm:mt-6 sm:px-8 sm:py-4"
              >
                <div
                  class="border-border bg-background absolute top-0 left-0 aspect-square h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                ></div>

                <div
                  class="border-border bg-background absolute top-0 right-0 aspect-square h-8 translate-x-1/2 -translate-y-1/2 rounded-full border"
                ></div>

                <div v-if="ticket.price" class="flex flex-col">
                  <span
                    v-if="ticket.showPriceStartsFrom"
                    class="text-xs tracking-tight"
                    >{{ $t('ui.startsFrom') }}</span
                  >
                  <span
                    v-if="ticket.price_before_discounted"
                    class="text-xs text-red-500 line-through"
                    >{{ ticket.price_before_discounted }}</span
                  >
                  <span
                    class="text-primary text-base font-semibold tracking-tighter"
                    >{{ ticket.price }}</span
                  >
                </div>

                <div class="shrink-0">
                  <nuxt-link
                    :to="ticket.disableLink ? '' : ticket.button_url"
                    @click="handleGetTicketButtonClick(ticket)"
                    class="cursor-pointer font-semibold tracking-tight transition *:flex *:items-center *:rounded-lg *:px-3 *:py-2 *:select-none active:scale-98 *:sm:rounded-xl"
                  >
                    <span
                      v-if="ticket.status.toLowerCase() === 'available'"
                      class="bg-primary hover:bg-primary/80 text-primary-foreground"
                      v-ripple
                      >{{ ticket.button_label }}</span
                    >
                    <span
                      v-else-if="ticket.status.toLowerCase() === 'coming soon'"
                      class="bg-yellow-500/10 text-yellow-700 dark:text-yellow-600"
                      v-ripple
                      >{{ $t('ui.comingSoon') }}</span
                    >
                    <span
                      v-else-if="ticket.status.toLowerCase() === 'sold out'"
                      class="bg-red-500/10 text-red-700 dark:text-red-600"
                      v-ripple
                      >{{ $t('ui.soldOut') }}</span
                    >
                    <span v-else>
                      <LoadingChaoticOrbit class="size-4" />
                    </span>
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tickets: {
    type: Array,
    required: true,
  },
});

import { toast } from "vue-sonner";
const localePath = useLocalePath();
const { t } = useI18n();
const { $dayjs } = useNuxtApp();

const ticketCategories = ref(JSON.parse(JSON.stringify(props.tickets)));

const handleGetTicketButtonClick = (ticket) => {
  ticket.disableLink
    ? toast(
        ticket.status.toLowerCase() == "sold out"
          ? t('ui.ticketsSoldOut')
          : t('ui.ticketsComingSoon'),
      )
    : "";
};

onMounted(() => {
  const allTickets = ticketCategories.value.reduce(
    (acc, category) => acc.concat(category.tickets),
    [],
  );

  setInterval(() => {
    const now = Date.now();

    allTickets.forEach((ticket) => {
      if (
        ticket.starts_in &&
        ticket.ends_in &&
        ticket.status.toLowerCase() !== "sold out"
      ) {
        const startsIn = new Date(ticket.starts_in).getTime();
        const endsIn = new Date(ticket.ends_in).getTime();

        if (now < startsIn) {
          ticket.disableLink = true;
          ticket.showStartCountdownLabel = true;
          ticket.showEndCountdownLabel = false;
          ticket.status = "Coming soon";
        } else if (startsIn < now && now < endsIn) {
          ticket.disableLink = false;
          ticket.showStartCountdownLabel = false;
          ticket.showEndCountdownLabel = true;
          ticket.status = "Available";
        } else if (endsIn < now) {
          ticket.disableLink = true;
          ticket.showStartCountdownLabel = false;
          ticket.showEndCountdownLabel = false;
          ticket.status = "Sold out";
        }
      }
    });
  }, 1000);
});
</script>
