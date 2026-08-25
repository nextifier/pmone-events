<script setup>
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { ButtonCopy } from "../ui/button-copy";
import { computed, onBeforeUnmount, onMounted, ref, useId } from "vue";
import { toast } from "vue-sonner";
import { useTicketPdf } from "../../composables/useTicketPdf";

const props = defineProps({
  attendee: { type: Object, required: true },
  eventTitle: { type: String, default: "" },
  eventDate: { type: String, default: "" },
  eventVenue: { type: String, default: "" },
  orderNumber: { type: String, default: "" },
  // When false, hide the share/copy/download actions (e.g. on a summary list).
  showActions: { type: Boolean, default: true },
  // When true the order is not yet paid: show a locked placeholder instead of
  // the QR (the backend withholds qr_token until the order is confirmed).
  locked: { type: Boolean, default: false },
});

const { t, locale } = useI18n();
const config = useRuntimeConfig();
const { download } = useTicketPdf();

const downloading = ref(false);

const shareUrl = computed(() => {
  const base = (config.public.siteUrl || "").replace(/\/$/, "");
  return `${base}/tickets/${props.attendee?.ulid}`;
});

const ticketTitle = computed(() => props.attendee?.ticket?.title || t("ui.getTicket"));
const tierLabel = computed(() => props.attendee?.ticket?.tier || "");

function resolveLabel(label) {
  if (label && typeof label === "object") {
    return label[locale.value] || label.en || Object.values(label)[0] || "";
  }
  return label || "";
}
const dayLabel = computed(() =>
  appendDayDate(resolveLabel(props.attendee?.day?.label), props.attendee?.day?.date)
);
const sessionLabel = computed(() => {
  const session = props.attendee?.session;
  if (!session?.label) return "";

  const time = formatSessionTime(session.starts_at, session.ends_at);
  return time ? `${resolveLabel(session.label)} · ${time}` : resolveLabel(session.label);
});

// Room and host go on their own line rather than into the chip above: the
// session chip is already the longest one on the card, and three badges wrap to
// three lines on a phone.
const sessionDetail = computed(() => {
  const session = props.attendee?.session;
  if (!session) return "";

  return [session.location, session.host ? t("tickets.eticket.sessionHost", { host: session.host }) : null]
    .filter(Boolean)
    .join(" · ");
});

function formatSessionTime(start, end) {
  if (!start) return "";
  const fmt = (value) =>
    new Date(value).toLocaleTimeString(locale.value, { hour: "2-digit", minute: "2-digit" });
  return end ? `${fmt(start)}–${fmt(end)}` : fmt(start);
}

// The phase this seat was bought under ("Pre-registration"). The API already
// suppresses labels that say nothing, so presence is the whole test.
const phaseLabel = computed(() => props.attendee?.phase_label || "");

// A refunded seat keeps its row and its page but is rejected at the gate. It
// takes priority over `locked` and over the loading spinner: without a branch of
// its own the nulled qr_token falls through to a spinner that never resolves.
const cancelled = computed(() => props.attendee?.is_cancelled === true);

// Perforation done the CardNotch way: an SVG path draws the card fill AND the
// border stroke, so the border follows the two side notches. The content is
// clipped to the same path. The notches are real transparent cutouts.
const cardEl = ref(null);
const stubEl = ref(null);
const pathD = ref("");
const cardW = ref(0);
const cardH = ref(0);
const clipId = "etk-" + useId().replace(/[^a-z0-9]/gi, "");
const NOTCH_R = 11;
const CARD_R = 28;
let ro = null;

function buildClip() {
  const card = cardEl.value;
  if (!card || !stubEl.value) {
    pathD.value = "";
    return;
  }
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  if (!w || !h) {
    pathD.value = "";
    return;
  }
  cardW.value = w;
  cardH.value = h;
  const r = NOTCH_R;
  const R = CARD_R;
  const ty = h - stubEl.value.offsetHeight;
  pathD.value =
    `M ${R} 0 H ${w - R} A ${R} ${R} 0 0 1 ${w} ${R} ` +
    `V ${ty - r} A ${r} ${r} 0 0 0 ${w} ${ty + r} V ${h - R} ` +
    `A ${R} ${R} 0 0 1 ${w - R} ${h} H ${R} A ${R} ${R} 0 0 1 0 ${h - R} ` +
    `V ${ty + r} A ${r} ${r} 0 0 0 0 ${ty - r} V ${R} A ${R} ${R} 0 0 1 ${R} 0 Z`;
}

const clipStyle = computed(() =>
  pathD.value ? { clipPath: `path('${pathD.value}')`, background: "transparent" } : {}
);

onMounted(() => {
  buildClip();
  if (typeof ResizeObserver !== "undefined" && cardEl.value) {
    ro = new ResizeObserver(() => buildClip());
    ro.observe(cardEl.value);
    if (stubEl.value) ro.observe(stubEl.value);
  }
});
onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
});

const whatsappUrl = computed(() => {
  const text = t("tickets.eticket.whatsappText", {
    title: ticketTitle.value,
    url: shareUrl.value,
  });
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
});

async function downloadTicket() {
  if (downloading.value) return;
  downloading.value = true;
  try {
    await download({
      qrToken: props.attendee?.qr_token,
      eventTitle: props.eventTitle,
      eventDate: props.eventDate,
      eventVenue: props.eventVenue,
      attendeeName: props.attendee?.name || t("tickets.eticket.unassigned"),
      ticketTitle: ticketTitle.value,
      tier: tierLabel.value,
      day: dayLabel.value,
      session: sessionLabel.value,
      sessionDetail: sessionDetail.value,
      phase: phaseLabel.value,
      checkedIn: !!props.attendee?.is_checked_in,
      orderNumber: props.orderNumber,
      fileName: `ticket-${props.attendee?.name || props.attendee?.ulid || "e-ticket"}.pdf`,
    });
  } catch {
    toast.error(t("tickets.eticket.downloadError"));
  } finally {
    downloading.value = false;
  }
}
</script>

<template>
  <div ref="cardEl" class="relative print:break-inside-avoid">
    <!-- Card surface + border drawn as an SVG so the hairline follows the notches. -->
    <svg
      v-if="pathD"
      :width="cardW"
      :height="cardH"
      :viewBox="`0 0 ${cardW} ${cardH}`"
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
      shape-rendering="geometricPrecision"
    >
      <defs>
        <clipPath :id="clipId"><path :d="pathD" /></clipPath>
      </defs>
      <path :d="pathD" fill="var(--color-card)" />
      <path
        :d="pathD"
        fill="none"
        stroke="var(--color-border)"
        stroke-width="2"
        :clip-path="`url(#${clipId})`"
      />
    </svg>

    <div
      class="relative overflow-hidden"
      :class="pathD ? '' : 'bg-card border-border rounded-[1.75rem] border'"
      :style="clipStyle"
    >
      <div class="flex flex-col items-center gap-5 px-6 pt-7 pb-6">
        <!-- Holder -->
        <div class="space-y-1.5 text-center">
          <p class="text-foreground text-2xl/tight font-semibold tracking-tighter text-balance">
            {{ attendee.name || t("tickets.eticket.unassigned") }}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span class="text-foreground text-sm tracking-tight">{{ ticketTitle }}</span>
            <Badge v-if="tierLabel" variant="muted" plain>{{ tierLabel }}</Badge>
            <Badge v-if="phaseLabel" variant="muted" plain>{{ phaseLabel }}</Badge>
          </div>
        </div>

        <!-- QR: the shared QRCode component, same as the /links page. It handles
             theme/dark-mode colours and click-to-change-style itself. -->
        <div
          class="w-44 sm:w-52"
          role="img"
          :aria-label="t('tickets.eticket.qrAlt', { name: attendee.name || ticketTitle })"
        >
          <div
            v-if="cancelled"
            class="bg-destructive/10 text-destructive-foreground flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl px-4 text-center"
            role="status"
          >
            <Icon name="hugeicons:ticket-star" class="size-7 shrink-0" />
            <span class="text-sm tracking-tight text-balance">
              {{ t("tickets.eticket.cancelled") }}
            </span>
            <span class="text-muted-foreground text-sm tracking-tight text-balance">
              {{ t("tickets.eticket.cancelledHelp") }}
            </span>
          </div>
          <QRCode v-else-if="attendee.qr_token" :url="attendee.qr_token" :size="240" />
          <div
            v-else-if="locked"
            class="bg-muted/50 text-muted-foreground flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl px-4 text-center"
            role="status"
          >
            <Icon name="lucide:lock" class="size-7 shrink-0" />
            <span class="text-sm tracking-tight text-balance">{{ t("tickets.eticket.locked") }}</span>
          </div>
          <div
            v-else
            class="bg-muted flex aspect-square w-full items-center justify-center rounded-xl"
            role="status"
            :aria-label="t('ui.loading')"
          >
            <Icon
              name="svg-spinners:180-ring"
              class="text-muted-foreground size-6 motion-reduce:hidden"
            />
          </div>
        </div>

        <!-- Status chips -->
        <div
          v-if="dayLabel || sessionLabel || attendee.is_checked_in"
          class="flex flex-wrap items-center justify-center gap-1.5"
        >
          <Badge v-if="dayLabel" variant="info" icon="hugeicons:calendar-03">{{ dayLabel }}</Badge>
          <Badge v-if="sessionLabel" variant="muted" icon="hugeicons:clock-01">{{ sessionLabel }}</Badge>
          <Badge v-if="attendee.is_checked_in" variant="success" icon="lucide:check">
            {{ t("tickets.eticket.checkedIn") }}
          </Badge>
        </div>

        <p
          v-if="sessionDetail"
          class="text-muted-foreground -mt-3 text-center text-sm tracking-tight text-balance"
        >
          {{ sessionDetail }}
        </p>
      </div>

      <!-- Perforation + stub (side notches are carved by the SVG/clip path above) -->
      <div
        v-if="showActions && !locked && !cancelled"
        ref="stubEl"
        class="border-border flex flex-col gap-3 border-t border-dashed px-6 pt-4 pb-5 print:hidden"
      >
        <p v-if="orderNumber" class="text-muted-foreground text-center text-xs tracking-tight">
          {{ orderNumber }}
        </p>

        <div class="flex items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" :disabled="downloading || !attendee.qr_token" @click="downloadTicket">
            <Spinner v-if="downloading" class="size-4" />
            <Icon v-else name="hugeicons:download-01" class="size-4 shrink-0" />
            {{ t("tickets.eticket.download") }}
          </Button>
          <ButtonCopy :text="shareUrl" />
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            :aria-label="t('tickets.eticket.whatsapp')"
            v-tippy="t('tickets.eticket.whatsapp')"
            class="text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-lg"
          >
            <Icon name="hugeicons:whatsapp" class="size-4 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
