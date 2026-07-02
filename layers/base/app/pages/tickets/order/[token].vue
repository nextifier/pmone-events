<template>
  <div class="mx-auto max-w-3xl space-y-6 px-4 pt-4 pb-16">
    <div v-if="pending" class="space-y-6">
      <Skeleton class="h-9 w-24 rounded-md" />
      <Skeleton class="h-8 w-72 sm:h-9" />
      <Skeleton class="h-40 w-full rounded-xl" />
      <Skeleton class="h-40 w-full rounded-xl" />
    </div>

    <div
      v-else-if="!order"
      class="text-muted-foreground rounded-md border border-dashed py-12 text-center text-sm tracking-tight"
    >
      {{ t("tickets.manage.invalidLink") }}
    </div>

    <div v-else class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <h1 class="page-title">{{ t("tickets.manage.title") }}</h1>
          <p class="text-muted-foreground text-sm tracking-tight">
            {{ t("tickets.manage.order", { number: order.order_number }) }}
          </p>
        </div>
        <Badge :variant="statusVariant" with-icon plain>{{ statusLabel }}</Badge>
      </div>

      <p class="text-muted-foreground text-sm tracking-tight">
        {{ t("tickets.manage.intro") }}
      </p>

      <!-- Order documents (paid orders only) -->
      <div v-if="receiptUrl || invoiceUrl" class="flex flex-wrap gap-2">
        <Button v-if="receiptUrl" as-child variant="outline" size="sm">
          <a :href="receiptUrl" target="_blank" rel="noopener">
            <Icon name="hugeicons:invoice-03" class="size-4 shrink-0" />
            {{ t("tickets.result.downloadReceipt") }}
            <Icon name="hugeicons:link-square-02" class="text-muted-foreground size-3.5 shrink-0" />
          </a>
        </Button>
        <Button v-if="invoiceUrl" as-child variant="outline" size="sm">
          <a :href="invoiceUrl" target="_blank" rel="noopener">
            <Icon name="hugeicons:file-02" class="size-4 shrink-0" />
            {{ t("tickets.result.downloadInvoice") }}
            <Icon name="hugeicons:link-square-02" class="text-muted-foreground size-3.5 shrink-0" />
          </a>
        </Button>
      </div>

      <!-- Bulk fill names (paste a list or import a CSV) -->
      <div v-if="editableAttendees.length > 1" class="frame">
        <div class="frame-panel space-y-3">
          <div class="space-y-1">
            <p class="text-foreground text-sm font-medium tracking-tight">{{ t("tickets.manage.bulkTitle") }}</p>
            <p class="text-muted-foreground text-xs tracking-tight sm:text-sm">{{ t("tickets.manage.bulkHint") }}</p>
          </div>
          <Textarea v-model="bulkText" :rows="4" :placeholder="t('tickets.manage.bulkPlaceholder')" />
          <div class="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" :disabled="!bulkText.trim()" @click="applyBulkNames">
              <Icon name="hugeicons:text-wrap" class="size-4 shrink-0" />
              {{ t("tickets.manage.bulkApply") }}
            </Button>
            <Button as-child type="button" variant="outline" size="sm">
              <label class="cursor-pointer">
                <Icon name="hugeicons:file-upload" class="size-4 shrink-0" />
                {{ t("tickets.manage.importCsv") }}
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  class="sr-only"
                  :aria-label="t('tickets.manage.importCsv')"
                  @change="onCsvFile"
                />
              </label>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              :disabled="savingAll"
              class="ms-auto"
              @click="saveAll"
            >
              <Icon
                v-if="savingAll"
                name="svg-spinners:180-ring"
                class="size-4 shrink-0"
              />
              {{ t("tickets.manage.saveAll") }}
            </Button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="att in order.attendees || []"
          :key="att.ulid"
          class="frame"
        >
          <div class="frame-panel space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="space-y-0.5">
                <p class="text-foreground text-sm font-medium tracking-tight">
                  {{ att.ticket?.title || t("ui.getTicket") }}
                  <span v-if="att.ticket?.tier" class="text-muted-foreground">
                    · {{ att.ticket.tier }}
                  </span>
                </p>
                <p class="text-muted-foreground text-xs tracking-tight sm:text-sm">
                  {{ att.is_personalized ? t("tickets.manage.personalized") : t("tickets.manage.notPersonalized") }}
                </p>
              </div>
              <span
                v-if="att.is_checked_in"
                class="bg-success/15 text-success-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight"
              >
                <Icon name="hugeicons:checkmark-circle-02" class="size-3.5 shrink-0" />
                {{ t("tickets.eticket.checkedIn") }}
              </span>
            </div>

            <!-- E-ticket QR shown inline so opening the email link lands straight
                 on a scannable code (no extra "View e-ticket" tap needed). Only a
                 confirmed order exposes qr_token. -->
            <div v-if="att.qr_token" class="flex flex-col items-center gap-2">
              <div
                class="w-44"
                role="img"
                :aria-label="t('tickets.eticket.qrAlt', { name: att.name || att.ticket?.title })"
              >
                <QRCode :url="att.qr_token" :size="240" />
              </div>
              <p class="text-muted-foreground text-center text-xs tracking-tight text-balance">
                {{ t("tickets.manage.scanAtEntrance") }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex-1 space-y-2">
                <Label :for="`name_${att.ulid}`">{{ t("tickets.manage.attendeeName") }}</Label>
                <Input
                  :id="`name_${att.ulid}`"
                  v-model="nameDrafts[att.ulid]"
                  :disabled="att.is_checked_in || savingId === att.ulid"
                  :placeholder="t('tickets.manage.fullNamePlaceholder')"
                />
                <FieldError :errors="errorsById[att.ulid]" />
              </div>
              <Button
                type="button"
                class="sm:min-w-24"
                :disabled="att.is_checked_in || savingId === att.ulid || !nameDrafts[att.ulid]?.trim()"
                @click="save(att)"
              >
                <Icon
                  v-if="savingId === att.ulid"
                  name="svg-spinners:180-ring"
                  class="size-4 shrink-0"
                />
                {{ t("tickets.manage.save") }}
              </Button>
            </div>

            <div class="flex flex-wrap items-center gap-2 border-t pt-3">
              <Button type="button" variant="outline" size="sm" @click="copyLink(att)">
                <Icon name="hugeicons:link-01" class="size-4 shrink-0" />
                {{ t("tickets.manage.copyTicketLink") }}
              </Button>
              <Button as-child variant="outline" size="sm">
                <NuxtLink :to="`/tickets/${att.ulid}`">
                  <Icon name="hugeicons:ticket-01" class="size-4 shrink-0" />
                  {{ t("tickets.manage.viewETicket") }}
                </NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { FieldError } from "../../../components/ui/field";
import { Skeleton } from "../../../components/ui/skeleton";
import { computed, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();
const token = computed(() => route.params.token);

const { data, pending, refresh } = await useLazyAsyncData(
  () => `ticket-order-${token.value}`,
  () => $fetch(`/api/tickets/orders/magic/${token.value}`).catch(() => null)
);

const order = computed(() => data.value?.data ?? null);

usePageMeta(null, {
  title: computed(() => `${t("tickets.manage.title")} · ${order.value?.order_number ?? ""}`),
});

const nameDrafts = reactive({});
const errorsById = reactive({});
const savingId = ref(null);

watch(
  order,
  (o) => {
    for (const att of o?.attendees ?? []) {
      if (nameDrafts[att.ulid] === undefined) {
        nameDrafts[att.ulid] = att.name || "";
      }
    }
  },
  { immediate: true }
);

async function save(att) {
  const name = nameDrafts[att.ulid]?.trim();
  if (!name) return;
  savingId.value = att.ulid;
  errorsById[att.ulid] = null;
  try {
    await $fetch(`/api/tickets/attendees/${att.ulid}`, {
      method: "PATCH",
      body: { name },
    });
    toast.success(t("tickets.manage.saved"));
    await refresh();
  } catch (err) {
    const body = err?.data || {};
    errorsById[att.ulid] = body.errors?.name || [body.message || t("tickets.manage.saveError")];
    toast.error(body.message || t("tickets.manage.saveError"));
  } finally {
    savingId.value = null;
  }
}

async function copyLink(att) {
  const base = (config.public.siteUrl || "").replace(/\/$/, "");
  try {
    await navigator.clipboard.writeText(`${base}/tickets/${att.ulid}`);
    toast.success(t("tickets.eticket.linkCopied"));
  } catch {
    toast.error(t("tickets.eticket.linkCopyError"));
  }
}

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

const isFree = computed(() => !!order.value?.is_free);
const isPaid = computed(() => order.value?.status === "confirmed" && !isFree.value);
const receiptUrl = computed(() =>
  isPaid.value ? `/api/tickets/orders/magic/${token.value}/receipt.pdf` : null
);
const invoiceUrl = computed(() =>
  order.value && !isFree.value ? `/api/tickets/orders/magic/${token.value}/invoice.pdf` : null
);

// Bulk attendee naming: paste one name per line (or import a CSV's first column),
// apply down the not-yet-checked-in tickets, then review + save them all.
const bulkText = ref("");
const editableAttendees = computed(() =>
  (order.value?.attendees ?? []).filter((a) => !a.is_checked_in)
);

function applyBulkNames() {
  const names = bulkText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!names.length) return;
  editableAttendees.value.forEach((att, i) => {
    if (names[i]) nameDrafts[att.ulid] = names[i];
  });
  toast.success(
    t("tickets.manage.bulkApplied", {
      count: Math.min(names.length, editableAttendees.value.length),
    })
  );
}

function onCsvFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    bulkText.value = String(reader.result || "")
      .split(/\r?\n/)
      .map((line) => line.split(",")[0].trim())
      .filter(Boolean)
      .join("\n");
  };
  reader.readAsText(file);
  e.target.value = "";
}

const savingAll = ref(false);
async function saveAll() {
  savingAll.value = true;
  try {
    for (const att of editableAttendees.value) {
      const name = nameDrafts[att.ulid]?.trim();
      if (name && name !== (att.name || "")) {
        await $fetch(`/api/tickets/attendees/${att.ulid}`, { method: "PATCH", body: { name } });
      }
    }
    toast.success(t("tickets.manage.saved"));
    await refresh();
  } catch (err) {
    toast.error(err?.data?.message || t("tickets.manage.saveError"));
  } finally {
    savingAll.value = false;
  }
}
</script>
