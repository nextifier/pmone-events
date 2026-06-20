<template>
  <div class="mx-auto max-w-3xl space-y-6 px-4 pt-4 pb-16">
    <!-- Loading skeleton -->
    <div v-if="pending && !order" class="space-y-6">
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

    <div
      v-else-if="!order"
      class="text-muted-foreground rounded-md border border-dashed py-12 text-center text-sm tracking-tight"
    >
      {{ t("tickets.result.orderNotFound") }}
    </div>

    <template v-else>
      <!-- Hero -->
      <header class="space-y-4 pt-4 text-center">
        <div class="flex justify-center">
          <span
            :class="[
              'inline-flex size-14 items-center justify-center rounded-full transition duration-500 ease-out motion-safe:starting:scale-50 motion-safe:starting:opacity-0',
              isConfirmed ? 'bg-success/15' : 'bg-warning/15',
            ]"
          >
            <Icon
              :name="isConfirmed ? 'hugeicons:checkmark-circle-02' : 'hugeicons:clock-02'"
              :class="['size-7', isConfirmed ? 'text-success-foreground' : 'text-warning-foreground']"
            />
          </span>
        </div>
        <div class="space-y-1.5">
          <h1 class="page-title">{{ heroTitle }}</h1>
          <p
            class="text-muted-foreground mx-auto max-w-md text-sm tracking-tight sm:text-base"
          >
            {{ heroDescription }}
          </p>
        </div>
        <div class="flex items-center justify-center gap-x-2 pt-1">
          <code
            class="bg-muted/60 inline-flex items-center rounded px-2 py-1 font-mono text-sm tracking-tight sm:text-base"
          >
            {{ order.order_number }}
          </code>
          <ButtonCopy :text="String(order.order_number)" />
        </div>
      </header>

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
            class="flex justify-between gap-3 text-sm tracking-tight"
          >
            <div>
              <p class="font-medium">{{ ticketTitle(item.ticket_id) }} × {{ item.quantity }}</p>
              <p
                v-if="item.phase_label"
                class="text-muted-foreground text-xs tracking-tight sm:text-sm"
              >
                {{ item.phase_label }}
              </p>
            </div>
            <p class="font-medium tabular-nums">Rp{{ formatRupiah(item.subtotal) }}</p>
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

      <!-- E-Tickets -->
      <div v-if="(order.attendees || []).length" class="space-y-3">
        <h2 class="text-primary text-lg font-semibold tracking-tight">{{ t("tickets.result.yourETickets") }}</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ETicket
            v-for="att in order.attendees"
            :key="att.ulid"
            :attendee="att"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-center gap-2 print:hidden">
        <Button type="button" variant="outline" @click="printPage">
          <Icon name="hugeicons:printer" class="size-4 shrink-0" />
          {{ t("tickets.result.downloadETicket") }}
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
import { Skeleton } from "../../components/ui/skeleton";
import ETicket from "../../components/tickets/ETicket.vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t } = useI18n();
const route = useRoute();
const magicToken = computed(() => route.query.token);
const orderUlid = computed(() => route.query.order);

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

const isConfirmed = computed(() => order.value?.status === "confirmed");
const isPending = computed(() => order.value?.status === "pending_payment");

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
  if (isConfirmed.value) return t("tickets.result.confirmedDescription");
  if (isPending.value) return t("tickets.result.pendingDescription");
  return t("tickets.result.receivedDescription");
});

// Poll briefly while pending so the page flips to "confirmed" once the payment
// webhook lands (mirror hotels/success.vue).
const pollTimer = ref(null);
const isPolling = ref(false);
onMounted(() => {
  if (isConfirmed.value) return;
  let attempts = 0;
  isPolling.value = true;
  pollTimer.value = setInterval(async () => {
    attempts += 1;
    await refresh();
    if (isConfirmed.value || attempts >= 10) {
      clearInterval(pollTimer.value);
      pollTimer.value = null;
      isPolling.value = false;
    }
  }, 3000);
});
onBeforeUnmount(() => {
  if (pollTimer.value) clearInterval(pollTimer.value);
  isPolling.value = false;
});

function printPage() {
  if (import.meta.client) window.print();
}

const formatRupiah = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);
</script>
