<template>
  <section id="tickets">
    <div class="container">
      <div class="flex flex-col items-start">
        <span
          class="border-primary rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
        >
          {{ $t("tickets.badge") }}
        </span>
        <SplitText3D
          tag="h2"
          origin="left"
          class="section-title ticket-title mt-2"
          :text="`${$t('tickets.title')} <span class='ticket-accent'>${$t('tickets.titleAccent')}</span>`"
        />

        <p class="section-description mt-3 w-full">
          {{ $t("tickets.description") }}
        </p>
      </div>

      <div class="flex flex-col items-start">
        <!-- Early Bird Banner -->
        <div
          v-if="isEarlyBird"
          class="bg-accent/8 border-accent/16 mt-6 flex items-center gap-3 rounded-xl border px-4 py-3"
        >
          <Icon name="hugeicons:discount" class="text-accent size-6 shrink-0" />
          <p class="text-sm tracking-tight">
            <span class="text-accent font-semibold">{{
              $t("tickets.earlyBird.title")
            }}</span>
            {{ " " }}
            <span class="text-body">{{
              $t("tickets.earlyBird.description", { date: earlyBirdEndDate })
            }}</span>
          </p>
        </div>
      </div>

      <!-- Tickets Grid -->
      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="border-border/50 bg-muted/30 relative flex flex-col rounded-2xl border p-6"
          :class="{ 'ring-accent/50 ring-2': ticket.popular }"
        >
          <!-- Popular Badge -->
          <div
            v-if="ticket.popular"
            class="bg-accent text-accent-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold tracking-tight"
          >
            {{ $t("tickets.popular") }}
          </div>

          <!-- Icon -->
          <div
            class="bg-muted text-accent flex size-12 items-center justify-center rounded-xl"
          >
            <Icon :name="ticket.icon" class="size-5" />
          </div>

          <!-- Title & Description -->
          <h3 class="text-foreground mt-4 text-xl font-medium tracking-tight">
            {{ ticket.title }}
          </h3>
          <p class="text-body mt-2 text-sm tracking-tight">
            {{ ticket.description }}
          </p>

          <!-- Pricing -->
          <div class="mt-4 flex-1">
            <!-- Early Bird Price -->
            <div v-if="isEarlyBird" class="mb-2">
              <span class="text-muted-foreground line-through">
                {{ formatUSD(ticket.normalPrice) }}
              </span>
              <span
                class="bg-success/10 text-success-foreground ml-2 rounded px-1.5 py-0.5 text-xs font-semibold"
              >
                {{ $t("tickets.save") }}
                {{ formatUSD(ticket.normalPrice - ticket.earlyBirdPrice) }}
              </span>
            </div>

            <!-- Current Price USD -->
            <div class="text-foreground text-3xl font-medium tracking-tighter">
              {{ formatUSD(currentPrice(ticket)) }}
            </div>

            <!-- Per Person (for table) -->
            <div
              v-if="ticket.perPerson"
              class="text-muted-foreground mt-1 text-xs"
            >
              {{
                $t("tickets.perPerson", {
                  price: formatUSD(currentPrice(ticket) / ticket.perPerson),
                })
              }}
            </div>
          </div>

          <!-- Features -->
          <!-- <ul class="mt-6 space-y-2">
            <li
              v-for="feature in ticket.features"
              :key="feature"
              class="flex items-start gap-2 text-sm tracking-tight"
            >
              <Icon
                name="hugeicons:checkmark-circle-02"
                class="text-accent mt-0.5 size-4 shrink-0"
              />
              <span>{{ feature }}</span>
            </li>
          </ul> -->

          <!-- CTA Button -->
          <button
            type="button"
            @click="handleBuyClick"
            class="bg-accent text-accent-foreground hover:bg-accent/80 mt-6 flex items-center justify-center rounded-xl px-5 py-3 font-medium tracking-tight transition active:scale-98"
            v-ripple
          >
            {{ $t("tickets.buyNow") }}
          </button>
        </div>
      </div>

      <!-- Note -->
      <p class="text-muted-foreground mt-6 text-center text-sm tracking-tight">
        {{ $t("tickets.note") }}
      </p>

      <!-- Agreement -->
      <p class="text-muted-foreground mt-3 text-center text-sm tracking-tight">
        {{ $t("tickets.agreement.text") }}
        <button
          type="button"
          class="text-accent font-medium tracking-tight hover:underline"
          @click="isTermsDialogOpen = true"
        >
          {{ $t("tickets.agreement.link") }}
        </button>
      </p>

      <!-- Terms & Conditions Dialog -->
      <DialogResponsive
        v-model:open="isTermsDialogOpen"
        dialog-max-width="600px"
        :overflow-content="true"
      >
        <div class="px-6 pb-6 sm:pt-6">
          <h3 class="text-foreground mb-6 text-xl font-semibold tracking-tight">
            {{ $t("tickets.terms.title") }}
          </h3>

          <div class="space-y-5">
            <div
              v-for="(term, key) in termsItems"
              :key="key"
              class="border-border/50 border-b pb-5 last:border-b-0"
            >
              <h4 class="text-foreground mb-2 font-medium tracking-tight">
                {{ key + 1 }}. {{ term.title }}
              </h4>
              <p class="text-body text-sm leading-relaxed tracking-tight">
                {{ term.content }}
              </p>
            </div>
          </div>
        </div>
      </DialogResponsive>
    </div>
  </section>
</template>

<script setup>
import { toast } from "vue-sonner";

const appConfig = useAppConfig();
const { t } = useI18n();

// Config
const purchaseLink = appConfig.routes.visitorRegistration.path;

const handleBuyClick = () => {
  if (appConfig.ticket.status !== "available") {
    toast.info(t("tickets.notAvailable"));
    return;
  }

  window.open(purchaseLink, "_blank");
};
const earlyBirdEndDate = "15 Maret 2026";
const isEarlyBird = ref(false);
const isTermsDialogOpen = ref(false);

// Terms items
const termsItems = computed(() => [
  {
    title: t("tickets.terms.items.ticketRegistration.title"),
    content: t("tickets.terms.items.ticketRegistration.content"),
  },
  {
    title: t("tickets.terms.items.conductActivities.title"),
    content: t("tickets.terms.items.conductActivities.content"),
  },
  {
    title: t("tickets.terms.items.liability.title"),
    content: t("tickets.terms.items.liability.content"),
  },
  {
    title: t("tickets.terms.items.eventChanges.title"),
    content: t("tickets.terms.items.eventChanges.content"),
  },
  {
    title: t("tickets.terms.items.dataDocumentation.title"),
    content: t("tickets.terms.items.dataDocumentation.content"),
  },
  {
    title: t("tickets.terms.items.ticketPriceExchange.title"),
    content: t("tickets.terms.items.ticketPriceExchange.content"),
  },
]);

// Tickets data
const tickets = computed(() => [
  {
    id: "full",
    icon: "hugeicons:star",
    title: t("tickets.items.full.title"),
    description: t("tickets.items.full.description"),
    earlyBirdPrice: 750,
    normalPrice: 900,
    popular: true,
    features: [
      t("tickets.items.full.features.allConference"),
      t("tickets.items.full.features.galaDinner"),
      t("tickets.items.full.features.priority"),
      t("tickets.items.full.features.certificate"),
    ],
  },
  {
    id: "conference",
    icon: "hugeicons:presentation-podium",
    title: t("tickets.items.conference.title"),
    description: t("tickets.items.conference.description"),
    earlyBirdPrice: 500,
    normalPrice: 600,
    popular: false,
    features: [
      t("tickets.items.conference.features.sessions"),
      t("tickets.items.conference.features.networking"),
      t("tickets.items.conference.features.materials"),
      t("tickets.items.conference.features.lunch"),
    ],
  },
  {
    id: "dinner",
    icon: "hugeicons:restaurant-01",
    title: t("tickets.items.dinner.title"),
    description: t("tickets.items.dinner.description"),
    earlyBirdPrice: 300,
    normalPrice: 350,
    popular: false,
    features: [
      t("tickets.items.dinner.features.gala"),
      t("tickets.items.dinner.features.entertainment"),
      t("tickets.items.dinner.features.networking"),
    ],
  },
  {
    id: "table",
    icon: "hugeicons:user-group",
    title: t("tickets.items.table.title"),
    description: t("tickets.items.table.description"),
    earlyBirdPrice: 2400,
    normalPrice: 2800,
    popular: false,
    perPerson: 8,
    features: [
      t("tickets.items.table.features.reserved"),
      t("tickets.items.table.features.branding"),
      t("tickets.items.table.features.vip"),
      t("tickets.items.table.features.recognition"),
    ],
  },
]);

// Helpers
const currentPrice = (ticket) => {
  return isEarlyBird.value ? ticket.earlyBirdPrice : ticket.normalPrice;
};

const formatUSD = (value) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `USD ${formatted}`;
};
</script>

<style scoped>
.ticket-title :deep(.ticket-accent) {
  background-image:
    linear-gradient(0deg, var(--color-accent), var(--color-accent)),
    linear-gradient(to right, rgba(255, 255, 255, 0) 52.79%, #ffffff 95.95%),
    linear-gradient(
      76.82deg,
      #576265 11.6%,
      #9ea1a1 25.31%,
      #848b8a 48.06%,
      #576265 55.72%,
      #576265 77.23%,
      #757a7b 85.34%,
      #576265 91.31%
    );
  background-blend-mode: color, overlay, normal;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
