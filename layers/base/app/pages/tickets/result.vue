<template>
  <div class="mx-auto max-w-3xl space-y-6 px-4 pt-4 pb-16">
    <!-- Loading skeleton, first fetch only. The confirmation poll flips `pending`
         back to true, and swapping the hero out for the skeleton every 3 seconds
         would replay its entrance animation each time. -->
    <div v-if="pending && !order && !hasLoadedOnce" class="space-y-6">
      <div class="space-y-4 pt-4 text-center">
        <Skeleton class="mx-auto size-14 rounded-full" />
        <div class="space-y-1.5">
          <Skeleton class="mx-auto h-8 w-56 sm:h-9" />
          <Skeleton class="mx-auto h-4 w-72" />
        </div>
      </div>
      <Skeleton class="h-44 w-full rounded-xl" />
      <Skeleton class="h-64 w-full rounded-xl" />
    </div>

    <Empty v-else-if="!order" class="mx-auto max-w-md py-12">
      <EmptyHeader>
        <EmptyMedia variant="stacked">
          <Icon
            name="hugeicons:invoice-03"
            class="text-muted-foreground size-6 shrink-0"
          />
        </EmptyMedia>
        <EmptyTitle>{{ t("tickets.result.orderNotFound") }}</EmptyTitle>
      </EmptyHeader>
      <Button as-child variant="outline">
        <NuxtLink :to="localePath('/tickets')">
          <Icon name="hugeicons:arrow-left-01" class="size-4 shrink-0" />
          {{ t("tickets.backToTickets") }}
        </NuxtLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- Hero -->
      <Result
        class="pt-4"
        :status="isConfirmed ? 'success' : 'pending'"
        :title="heroTitle"
        :description="heroDescription"
        title-as="h1"
      >
        <ResultReference :value="String(order.order_number)">
          <ButtonCopy :text="String(order.order_number)" />
        </ResultReference>
      </Result>

      <!-- Pending payment CTA -->
      <div
        v-if="isPending && order.payment_url"
        class="frame"
      >
        <div class="frame-header">
          <div class="frame-title">{{ t("tickets.result.paymentPending") }}</div>
        </div>
        <div class="frame-panel space-y-3">
          <p class="text-sm tracking-tight">
            {{ t("tickets.result.paymentPendingNote") }}
          </p>
          <Button as-child>
            <a :href="order.payment_url">
              {{ t("tickets.result.payNow") }}
              <Icon name="hugeicons:arrow-right-02" class="size-4 shrink-0" />
            </a>
          </Button>
          <p
            v-if="isPolling"
            class="text-muted-foreground flex items-center gap-1.5 text-xs tracking-tight sm:text-sm"
          >
            <Icon name="svg-spinners:180-ring" class="size-3.5 shrink-0" />
            {{ t("tickets.result.autoUpdating") }}
          </p>
        </div>
      </div>

      <!-- Preparing payment: the checkout link is still being generated -->
      <div v-else-if="isPending && !magicToken" class="frame">
        <div class="frame-header">
          <div class="frame-title">{{ t("tickets.result.preparingPayment") }}</div>
        </div>
        <div class="frame-panel space-y-3">
          <p
            v-if="!checkoutTimedOut"
            class="text-muted-foreground flex items-center gap-1.5 text-sm tracking-tight"
          >
            <Icon name="svg-spinners:180-ring" class="size-4 shrink-0" />
            {{ t("tickets.result.preparingPaymentDescription") }}
          </p>
          <template v-else>
            <p class="text-sm tracking-tight">
              {{ t("tickets.result.preparingPaymentSlow") }}
            </p>
            <Button
              type="button"
              variant="outline"
              :disabled="retrying || pending"
              @click="retryPayment"
            >
              <Spinner v-if="retrying || pending" class="size-4" />
              {{ t("tickets.result.checkAgain") }}
            </Button>
          </template>
        </div>
      </div>

      <!-- Order summary -->
      <div class="frame">
        <div class="frame-header">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="frame-title">{{ t("tickets.orderSummary") }}</div>
            <Badge :variant="statusVariant" with-icon plain>{{ statusLabel }}</Badge>
          </div>
        </div>
        <div class="frame-panel space-y-3">
          <div
            v-for="(item, idx) in order.items || []"
            :key="idx"
            class="flex items-center gap-3 text-sm tracking-tight"
          >
            <!-- Same poster and the same sub-label the cart bar showed while the
                 buyer was choosing, so the receipt line is recognisably the line
                 they picked. -->
            <div
              v-if="posterSrc(item)"
              class="bg-muted size-11 shrink-0 overflow-hidden rounded-lg"
            >
              <BlurImage
                :src="posterSrc(item)"
                :lqip="item.poster?.lqip"
                alt=""
                image-class="object-cover"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium">{{ ticketTitle(item.ticket_id) }} × {{ item.quantity }}</p>
              <p
                v-if="itemSubLabel(item)"
                class="text-muted-foreground truncate text-sm tracking-tight"
              >
                {{ itemSubLabel(item) }}
              </p>
            </div>
            <p class="shrink-0 font-medium tabular-nums">Rp{{ formatRupiah(item.subtotal) }}</p>
          </div>

          <div class="space-y-1.5 border-t pt-3 text-sm tracking-tight">
            <div class="text-muted-foreground flex justify-between">
              <span>{{ t("tickets.subtotal") }}</span>
              <span class="tabular-nums">Rp{{ formatRupiah(order.subtotal) }}</span>
            </div>
            <div
              v-if="Number(order.discount_amount) > 0"
              class="text-success-foreground flex justify-between"
            >
              <span>{{ t("tickets.result.discount") }}</span>
              <span class="tabular-nums">-Rp{{ formatRupiah(order.discount_amount) }}</span>
            </div>
            <div class="flex justify-between border-t pt-1.5 text-base font-semibold">
              <span>{{ isConfirmed ? t("tickets.result.totalPaid") : t("tickets.result.total") }}</span>
              <span class="tabular-nums">Rp{{ formatRupiah(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- E-Tickets: only ready once the order is confirmed (paid/free). A
           pending order shows a note instead - the QR is not valid yet. -->
      <!-- Delivered by email: the QR is deliberately not on this page. -->
      <div
        v-if="isConfirmed && eticketByEmail"
        class="bg-card space-y-3 rounded-xl border p-5"
      >
        <div class="flex items-start gap-3">
          <Icon
            name="hugeicons:mail-validation-01"
            class="text-muted-foreground mt-0.5 size-5 shrink-0"
          />
          <div class="min-w-0 space-y-1.5">
            <h2 class="text-foreground text-lg font-semibold tracking-tight">
              {{ t("tickets.result.eTicketSentTitle") }}
            </h2>
            <p class="text-sm tracking-tight">
              {{ t("tickets.result.eTicketSentBody", { email: maskedEmail }) }}
            </p>
            <p class="text-muted-foreground text-sm tracking-tight">
              {{ t("tickets.result.eTicketSentHint") }}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          :disabled="resending"
          @click="resendEmail"
        >
          <Spinner v-if="resending" class="size-4" />
          <Icon v-else name="hugeicons:mail-01" class="size-4 shrink-0" />
          {{ t("tickets.result.resendEmail") }}
        </Button>
      </div>

      <div
        v-else-if="isConfirmed && (order.attendees || []).length"
        class="space-y-3"
      >
        <h2 class="text-foreground text-lg font-semibold tracking-tight">{{ t("tickets.result.yourETickets") }}</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ETicket
            v-for="att in order.attendees"
            :key="att.ulid"
            :attendee="att"
            :event-title="event?.title"
            :event-date="eventDateLabel"
            :event-venue="event?.location || ''"
            :order-number="t('tickets.attendee.order', { number: order.order_number })"
          />
        </div>
      </div>
      <div
        v-else-if="isPending"
        class="text-muted-foreground rounded-md border border-dashed py-8 text-center text-sm tracking-tight"
      >
        {{ t("tickets.result.eTicketsLockedNote") }}
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-center gap-2 print:hidden">
        <Button
          v-if="isConfirmed && !eticketByEmail && (order.attendees || []).length"
          type="button"
          variant="outline"
          :disabled="downloadingAll"
          @click="downloadAllTickets"
        >
          <Spinner v-if="downloadingAll" class="size-4" />
          <Icon v-else name="hugeicons:download-01" class="size-4 shrink-0" />
          {{ t("tickets.result.downloadAllETickets") }}
        </Button>
        <Button v-if="receiptUrl" as-child variant="outline">
          <a :href="receiptUrl" target="_blank" rel="noopener">
            <Icon name="hugeicons:invoice-03" class="size-4 shrink-0" />
            {{ t("tickets.result.downloadReceipt") }}
            <Icon name="hugeicons:link-square-02" class="text-muted-foreground size-3.5 shrink-0" />
          </a>
        </Button>
        <Button v-if="invoiceUrl" as-child variant="outline">
          <a :href="invoiceUrl" target="_blank" rel="noopener">
            <Icon name="hugeicons:file-02" class="size-4 shrink-0" />
            {{ t("tickets.result.downloadInvoice") }}
            <Icon name="hugeicons:link-square-02" class="text-muted-foreground size-3.5 shrink-0" />
          </a>
        </Button>
        <Button v-if="manageUrl" as-child variant="outline">
          <a :href="manageUrl">
            <Icon name="hugeicons:user-circle" class="size-4 shrink-0" />
            {{ t("tickets.result.loginToManage") }}
          </a>
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/ui/empty";
import { Result, ResultReference } from "../../components/ui/result";
import { Skeleton } from "../../components/ui/skeleton";
import { Spinner } from "../../components/ui/spinner";
import ETicket from "../../components/tickets/ETicket.vue";
import { BlurImage } from "../../components/ui/blur-image";
import { useTicketPdf } from "../../composables/useTicketPdf";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t, locale } = useI18n();
const route = useRoute();
const magicToken = computed(() => route.query.token);
const orderUlid = computed(() => route.query.order);

// Event hero data (title/date/venue) for the e-ticket PDFs - the result page is
// always viewed on its own event site, so the active event matches the order.
const event = useEvent();
const { downloadAll } = useTicketPdf();

const { data, pending, refresh } = await useLazyAsyncData(
  () => `ticket-result-${magicToken.value || orderUlid.value || "none"}`,
  async () => {
    if (magicToken.value) {
      return await $fetch(`/api/tickets/orders/magic/${magicToken.value}`).catch(() => null);
    }
    if (orderUlid.value) {
      return await $fetch(`/api/tickets/orders/${orderUlid.value}`).catch(() => null);
    }
    return null;
  }
);

const order = computed(() => data.value?.data ?? null);

// Latches once the first fetch settles so the confirmation poll below never
// sends the page back to the skeleton, which would replay the hero entrance.
const hasLoadedOnce = ref(false);
watch(
  pending,
  (value) => {
    if (!value) hasLoadedOnce.value = true;
  },
  { immediate: true }
);

usePageMeta(null, {
  title: computed(() => `${t("tickets.result.orderReceived")} · ${t("tickets.checkout")}`),
});

const ticketsById = computed(() => {
  const map = {};
  for (const att of order.value?.attendees ?? []) {
    if (att.ticket) map[att.ticket.id] = att.ticket;
  }
  return map;
});

function ticketTitle(ticketId) {
  return ticketsById.value[ticketId]?.title || t("ui.getTicket");
}

const posterSrc = (item) => item.poster?.sm || item.poster?.url || null;

/**
 * Day, session and price phase, joined the way `cartLineSubLabel` joins them in
 * the cart bar. The receipt used to show the phase alone, so a two-day order
 * read as two identical lines; the phase stays because on a receipt it is what
 * explains the price.
 */
function itemSubLabel(item) {
  const { $dayjs } = useNuxtApp();
  const parts = [];
  if (item.event_day_date) parts.push($dayjs(item.event_day_date).format("ddd, D MMM"));
  if (item.session_label) parts.push(item.session_label);
  if (item.phase_label) parts.push(item.phase_label);
  return parts.join(" · ");
}

const isConfirmed = computed(() => order.value?.status === "confirmed");
const isPending = computed(() => order.value?.status === "pending_payment");

// The API withheld the QR (and the attendee ulids) for this order: its price
// phase delivers the e-ticket by email only, so a free ticket capped at one per
// address actually requires opening that inbox. The emailed link is the way in.
const eticketByEmail = computed(
  () => order.value?.eticket_delivery === "email",
);
const maskedEmail = computed(() => order.value?.buyer_email_masked || "");

const resending = ref(false);

async function resendEmail() {
  if (resending.value || !orderUlid.value) return;
  resending.value = true;
  try {
    await $fetch(
      `/api/tickets/orders/${orderUlid.value}/resend-confirmation`,
      { method: "POST" },
    );
    toast.success(t("tickets.result.resendSent"));
  } catch (err) {
    // The 429 body carries its own "check your inbox" wording; show it verbatim
    // rather than replacing a specific message with a generic one.
    toast.error(
      err?.data?.message ||
        err?.statusMessage ||
        t("tickets.result.resendError"),
    );
  } finally {
    resending.value = false;
  }
}

const localePath = useLocalePath();

// Receipt + invoice + manage are reachable only with the magic token (paid
// orders, via the bouncer redirect). Free orders use the emailed link.
const isPaid = computed(() => isConfirmed.value && !order.value?.is_free);
const receiptUrl = computed(() =>
  magicToken.value && isPaid.value
    ? `/api/tickets/orders/magic/${magicToken.value}/receipt.pdf`
    : null
);
const invoiceUrl = computed(() =>
  magicToken.value && !order.value?.is_free
    ? `/api/tickets/orders/magic/${magicToken.value}/invoice.pdf`
    : null
);
const manageUrl = computed(() =>
  magicToken.value ? localePath(`/tickets/order/${magicToken.value}`) : null
);

const statusLabel = computed(() => {
  const status = order.value?.status;
  if (!status) return "";
  const key = `tickets.status.${status}`;
  const label = t(key);
  return label === key ? status : label;
});

const statusVariant = computed(() => {
  const map = {
    confirmed: "success",
    pending_payment: "warning",
    cancelled: "destructive",
    expired: "muted",
    refunded: "destructive",
  };
  return map[order.value?.status] || "muted";
});

const heroTitle = computed(() => {
  if (isConfirmed.value) {
    return order.value?.is_free
      ? t("tickets.result.ticketsClaimed")
      : t("tickets.result.paymentSuccessful");
  }
  return t("tickets.result.orderReceived");
});

const heroDescription = computed(() => {
  if (isConfirmed.value) {
    return eticketByEmail.value
      ? t("tickets.result.confirmedByEmailDescription")
      : t("tickets.result.confirmedDescription");
  }
  if (isPending.value) {
    // Arrived via magic link => the buyer came back from the gateway (or the
    // emailed link), so their payment is genuinely being confirmed.
    if (magicToken.value) return t("tickets.result.pendingDescription");
    // Fresh from checkout: the link is either ready (pay now) or still generating.
    if (order.value?.payment_url) return t("tickets.result.awaitingPaymentDescription");
    return t("tickets.result.preparingPaymentDescription");
  }
  return t("tickets.result.receivedDescription");
});

// Poll briefly while pending so the page flips to "confirmed" once the payment
// webhook lands (mirror hotels/success.vue).
const pollTimer = ref(null);
const isPolling = ref(false);
// Set once the payment link is still not ready after ~15s of polling, so the
// preparing state can offer a "taking longer than usual" hint + manual retry
// instead of leaving the buyer on a silent spinner (slow or failed checkout job).
const checkoutTimedOut = ref(false);

function stopPolling() {
  if (pollTimer.value) clearInterval(pollTimer.value);
  pollTimer.value = null;
  isPolling.value = false;
}

function startPolling() {
  stopPolling();
  if (isConfirmed.value) return;
  let attempts = 0;
  isPolling.value = true;
  pollTimer.value = setInterval(async () => {
    attempts += 1;
    await refresh();
    if (
      isPending.value &&
      !order.value?.payment_url &&
      !magicToken.value &&
      attempts >= 5
    ) {
      checkoutTimedOut.value = true;
    }
    if (isConfirmed.value || attempts >= 10) {
      stopPolling();
    }
  }, 3000);
}

onMounted(startPolling);
onBeforeUnmount(stopPolling);

/**
 * "Check again" asks PM One to re-open the checkout, not just to re-read the
 * order. If the queued job died against a gateway outage, refetching forever
 * would never produce a link - the job has to be dispatched again. Idempotent
 * upstream: an order that already has a link is answered with that link.
 */
const retrying = ref(false);

async function retryPayment() {
  if (retrying.value || !orderUlid.value) return;
  retrying.value = true;
  try {
    await $fetch(`/api/tickets/orders/${orderUlid.value}/retry-payment`, {
      method: "POST",
    });
    checkoutTimedOut.value = false;
    await refresh();
    startPolling();
  } catch (err) {
    toast.error(err?.statusMessage || t("tickets.result.preparingPaymentSlow"));
  } finally {
    retrying.value = false;
  }
}

const eventDateLabel = computed(() => [event?.date, event?.time].filter(Boolean).join(" · "));

function resolveLabel(label) {
  if (label && typeof label === "object") {
    return label[locale.value] || label.en || Object.values(label)[0] || "";
  }
  return label || "";
}

// Map an attendee row to the shape the PDF renderer expects (mirror ETicket.vue).
function toTicketData(att) {
  return {
    qrToken: att.qr_token,
    attendeeName: att.name || t("tickets.eticket.unassigned"),
    ticketTitle: att.ticket?.title || t("ui.getTicket"),
    tier: att.ticket?.tier || "",
    day: appendDayDate(resolveLabel(att.day?.label), att.day?.date),
    session: att.session?.label || "",
    checkedIn: !!att.is_checked_in,
  };
}

const downloadingAll = ref(false);
async function downloadAllTickets() {
  if (downloadingAll.value) return;
  downloadingAll.value = true;
  try {
    await downloadAll((order.value?.attendees || []).map(toTicketData), {
      eventTitle: event?.title || "",
      eventDate: eventDateLabel.value,
      eventVenue: event?.location || "",
      orderNumber: t("tickets.attendee.order", { number: order.value?.order_number }),
    });
  } catch {
    toast.error(t("tickets.eticket.downloadError"));
  } finally {
    downloadingAll.value = false;
  }
}

const formatRupiah = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);
</script>
