<script setup>
import { useTicketCartStore } from "../../stores/ticketCart";
import { BlurImage } from "../ui/blur-image";
import { onClickOutside } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { toast } from "vue-sonner";

const props = defineProps({
  /**
   * Loaded tickets so the panel can show titles, posters and prices (the store
   * keeps ids and quantities only). Accepts the `Map` the listing builds or the
   * plain object the checkout page builds.
   */
  ticketsById: { type: [Object, Map], default: () => ({}) },
  /**
   * `select` on /tickets: the CTA navigates to checkout and the bar shows a
   * subtotal. `pay` on /tickets/checkout: the CTA submits the order, the bar
   * shows the real total, and the cart-emptying controls are dropped - clearing
   * the cart there navigates the buyer out of checkout entirely.
   */
  mode: { type: String, default: "select" },
  ctaLabel: { type: String, default: "" },
  /** Pay-mode glyph. The select-mode cart icon is fixed and stacked beside it. */
  ctaIcon: { type: String, default: "hugeicons:credit-card" },
  ctaDisabled: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  /** Hide the bar while a field is focused, so it never fights the on-screen keyboard. */
  hideWhileTyping: { type: Boolean, default: false },
});

const emit = defineEmits(["primary"]);

const { t } = useI18n();
const cart = useTicketCartStore();

const isPay = computed(() => props.mode === "pay");

const ticketFor = (id) =>
  props.ticketsById instanceof Map
    ? (props.ticketsById.get(id) ?? null)
    : (props.ticketsById[id] ?? null);

const lines = computed(() =>
  cart.mergedLines.map((l) => {
    const ticket = ticketFor(l.ticket_id);
    // The listing never runs a pricing preview, so its unit price has to come
    // from the ticket record; checkout's comes back priced from the server.
    const unit =
      l.unit ||
      Number(ticket ? (ticket.on_sale ? ticket.price : ticket.display_price) : 0) ||
      0;
    const lineTotal = l.subtotal || unit * l.qty;
    return {
      ...l,
      ticket,
      unit,
      lineTotal,
      title: l.title || ticket?.title || t("tickets.ticket"),
      subLabel: cartLineSubLabel(ticket, l.item),
      priceLabel: lineTotal > 0 ? fmtIdr(lineTotal) : t("tickets.free"),
    };
  }),
);

const localSubtotal = computed(() =>
  lines.value.reduce((sum, l) => sum + l.lineTotal, 0),
);

const subtotal = computed(() =>
  isPay.value && cart.previewLines?.length
    ? cart.displaySubtotal
    : localSubtotal.value,
);
const discount = computed(() => (isPay.value ? cart.displayDiscount : 0));
const total = computed(() => Math.max(0, subtotal.value - discount.value));

/** The figure in the always-visible action row: the real total when paying, the subtotal when selecting. */
const headlineAmount = computed(() => (isPay.value ? total.value : subtotal.value));
const headlineLabel = computed(() =>
  isPay.value ? t("tickets.total") : t("tickets.subtotal"),
);
const amountLabel = (n) => (n > 0 ? fmtIdr(n) : t("tickets.free"));

const expanded = ref(false);

/**
 * Tapping the page collapses the detail. Bound to the pill, not to the fixed
 * strip: the strip spans the full width and would count most of the page as
 * inside. Only armed while open, so a closed bar never listens.
 */
const pillRef = ref(null);
onClickOutside(pillRef, () => {
  if (expanded.value) expanded.value = false;
});
function toggleDetail() {
  expanded.value = !expanded.value;
}

function removeLine(line) {
  const index = cart.items.findIndex(
    (i) =>
      i.ticket_id === line.ticket_id &&
      (i.ticket_session_id ?? null) === line.ticket_session_id &&
      (i.selected_event_day_id ?? null) === line.selected_event_day_id,
  );
  const snapshot = index >= 0 ? { ...cart.items[index] } : null;
  cart.removeItem(
    line.ticket_id,
    line.ticket_session_id,
    line.selected_event_day_id,
  );
  if (!snapshot) return;
  toast(t("tickets.itemRemoved", { title: line.title }), {
    action: {
      label: t("tickets.undo"),
      onClick: () => cart.restoreItem(snapshot, index),
    },
  });
}

/**
 * A fixed bottom bar and a virtual keyboard fight for the same space, and on a
 * page that is mostly text inputs the buyer is in that state most of the time.
 * Rather than measure `visualViewport` (which reports late on iOS and lands
 * after paint), step out of the way whenever a field has focus.
 */
const typing = ref(false);
let typingTimer = null;

const isTextEntry = (el) =>
  !!el &&
  (el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable === true);

function onFocusChange() {
  if (typingTimer) clearTimeout(typingTimer);
  // Debounced so tabbing from one field to the next does not flash the bar.
  typingTimer = setTimeout(() => {
    typing.value = isTextEntry(document.activeElement);
  }, 80);
}

onMounted(() => {
  if (!props.hideWhileTyping) return;
  document.addEventListener("focusin", onFocusChange);
  document.addEventListener("focusout", onFocusChange);
});

onBeforeUnmount(() => {
  if (typingTimer) clearTimeout(typingTimer);
  document.removeEventListener("focusin", onFocusChange);
  document.removeEventListener("focusout", onFocusChange);
});

const visible = computed(() => !cart.isEmpty && !(props.hideWhileTyping && typing.value));
</script>

<template>
  <Transition
    enter-active-class="transition-[translate,opacity,filter] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
    leave-active-class="transition-[translate,opacity,filter] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
    enter-from-class="translate-y-4 opacity-0 blur-[2px]"
    leave-to-class="translate-y-4 opacity-0 blur-[2px]"
  >
    <div
      v-if="visible"
      class="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      <!-- Inverted "contrast" pill: bg-foreground/text-background flips with the
           theme, so it stays high-contrast in light AND dark mode. Tapping the
           bar anywhere but the CTA expands the line detail (transitions-dev:
           accordion expand, growing upward from this bottom-anchored bar). -->
      <div
        ref="pillRef"
        class="t-acc bg-foreground text-background ring-foreground/10 mx-auto w-full max-w-xl overflow-hidden p-2 shadow-lg ring-1 ring-white/20 transition-[border-radius,padding] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        :class="expanded ? 'rounded-3xl sm:p-4' : 'rounded-4xl'"
        :data-open="expanded"
      >
        <!-- Collapsible detail, above the action row -->
        <div class="t-acc-panel">
          <div class="t-acc-panel-inner">
            <div class="px-2.5 pt-1.5 pb-3">
              <ul class="divide-background/10 flex flex-col divide-y">
                <li
                  v-for="line in lines"
                  :key="line.key"
                  class="flex items-center gap-3 py-2"
                >
                  <div
                    v-if="posterSrc(line.ticket)"
                    class="bg-background/10 size-11 shrink-0 overflow-hidden rounded-lg"
                  >
                    <BlurImage
                      :src="posterSrc(line.ticket)"
                      :lqip="line.ticket?.poster?.lqip"
                      alt=""
                      image-class="object-cover"
                    />
                  </div>
                  <span
                    v-else
                    class="bg-background/15 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums"
                    aria-hidden="true"
                  >
                    {{ line.qty }}
                  </span>
                  <div class="min-w-0 flex-1 leading-tight">
                    <p
                      class="truncate text-sm font-medium tracking-tight sm:text-base"
                    >
                      <span v-if="posterSrc(line.ticket)" class="tabular-nums"
                        >{{ line.qty }}&times;
                      </span>
                      {{ line.title }}
                    </p>
                    <p
                      v-if="line.subLabel"
                      class="text-background/80 truncate text-sm tracking-tight"
                    >
                      {{ line.subLabel }}
                    </p>
                  </div>
                  <span
                    class="shrink-0 text-sm font-medium tabular-nums transition-opacity sm:text-base"
                    :class="{ 'opacity-60': line.pending }"
                    >{{ line.priceLabel }}</span
                  >
                  <button
                    type="button"
                    class="text-background/50 hover:text-background hover:bg-background/15 focus-visible:ring-background/40 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    :aria-label="t('tickets.removeItem')"
                    @click="removeLine(line)"
                  >
                    <Icon name="hugeicons:cancel-01" class="size-4" />
                  </button>
                </li>
              </ul>

              <div
                v-if="discount > 0"
                class="border-background/10 mt-1 flex items-center justify-end gap-3 border-t pt-3"
              >
                <p class="leading-tight">
                  <span class="text-background/80 text-sm tracking-tight">
                    {{ t("tickets.discount") }}
                  </span>
                  <span class="ml-2 text-sm font-medium tabular-nums sm:text-base">
                    -{{ fmtIdr(discount) }}
                  </span>
                </p>
                <span class="-mr-1 size-7 shrink-0" aria-hidden="true" />
              </div>

              <div
                class="mt-1 flex items-center"
                :class="discount > 0 ? '' : 'border-background/10 border-t pt-3'"
              >
                <!-- Clearing the cart on the checkout page navigates the buyer
                     straight back out of checkout, so that control only exists
                     while they are still choosing. -->
                <button
                  v-if="!isPay"
                  type="button"
                  class="text-background/70 hover:text-background focus-visible:ring-background/40 inline-flex items-center gap-1.5 rounded-full text-sm font-medium tracking-tight transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-base"
                  @click="cart.clear()"
                >
                  <Icon
                    name="hugeicons:delete-01"
                    class="size-4 shrink-0 sm:size-5"
                  />
                  {{ t("tickets.clearCart") }}
                </button>
                <!-- Mirror the line item's trailing [price][gap-3][size-7 -mr-1] so the
                     total's price right-edge aligns with each item's price. -->
                <div class="flex flex-1 items-center justify-end gap-3">
                  <p class="leading-tight">
                    <span
                      class="text-background/80 text-sm tracking-tight"
                      >{{ headlineLabel }}</span
                    >
                    <span
                      class="ml-2 text-sm font-semibold tabular-nums sm:text-base"
                      >{{ amountLabel(headlineAmount) }}</span
                    >
                  </p>
                  <span class="-mr-1 size-7 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action row (always visible). The toggle covers everything but the CTA.
             `items-stretch` so the CTA's top and bottom margin is exactly the
             pill's 8px padding; centred, it inherited whatever the two-line label
             column left over. -->
        <div class="flex items-stretch gap-x-1.5">
          <button
            type="button"
            class="focus-visible:ring-background/40 flex min-w-0 flex-1 items-center gap-2.5 rounded-[1.4rem] text-left focus-visible:ring-2 focus-visible:outline-none"
            :aria-expanded="expanded"
            @click="toggleDetail"
          >
            <!-- Both modes are two lines on purpose. The bar is one persistent
                 instance across /tickets and /tickets/checkout, so if `select`
                 were a single line the pill would change height mid-navigation
                 and no text transition could look right. Equal heights reduce
                 the whole mode change to a text swap. Bonus on /tickets: the
                 running subtotal is now visible while choosing, not only after
                 expanding. -->
            <span
              class="flex h-full min-w-0 flex-col justify-center truncate rounded-full px-2.5 tracking-tight sm:px-3"
            >
              <!-- Both labels stay mounted and share one grid cell, cross-faded
                   by class. Not `<Transition mode="out-in">`: an out-in swap
                   inside this already-transitioning pill got stuck mid-flight and
                   left the bar showing "Total / Continue to payment" after
                   navigating back to /tickets. Stacking also pins the row height,
                   which is what keeps the pill the same size in both modes. -->
              <span class="grid min-w-0">
                <!-- Pay mode uses the short "Total", not the count phrase: at
                     text-sm the phrase no longer fits beside a "Continue to
                     payment" button on a 390px phone, and a truncated
                     "2 tickets select..." is worse than no count at all. The
                     count is one tap away, itemised, in the panel above. -->
                <span
                  class="t-bar-line text-background/70 col-start-1 row-start-1 truncate text-sm"
                  :data-shown="isPay"
                  :aria-hidden="!isPay"
                >
                  {{ headlineLabel }}
                </span>
                <!-- NumberFlow drops into the {count} slot, so the animated
                     digit keeps each locale's word order (incl. mid-string CJK
                     forms). -->
                <i18n-t
                  keypath="tickets.selected"
                  :plural="cart.count"
                  tag="span"
                  scope="global"
                  class="t-bar-line text-background/70 col-start-1 row-start-1 truncate text-sm"
                  :data-shown="!isPay"
                  :aria-hidden="isPay"
                >
                  <template #count>
                    <NumberFlow :value="cart.count" class="tabular-nums" />
                  </template>
                </i18n-t>
              </span>
              <span
                class="text-base font-semibold tabular-nums transition-opacity sm:text-lg"
                :class="{ 'opacity-60': isPay && cart.pricingPending }"
                aria-live="polite"
                aria-atomic="true"
              >
                {{ amountLabel(headlineAmount) }}
              </span>
            </span>
            <span
              class="t-acc-chevron bg-background/10 text-background/70 ml-auto flex size-9 shrink-0 items-center justify-center self-center rounded-full"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4 sm:size-5"
              >
                <path d="M4 10L8 6L12 10" />
              </svg>
            </span>
          </button>

          <button
            v-if="!isPay"
            type="button"
            class="bg-destructive/15 text-destructive-foreground hover:bg-destructive/25 focus-visible:ring-destructive-foreground/40 inline-flex size-9 shrink-0 items-center justify-center self-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            :aria-label="t('tickets.clearCart')"
            @click="cart.clear()"
          >
            <Icon name="hugeicons:delete-01" class="size-4 sm:size-5" />
          </button>

          <button
            type="button"
            class="bg-background text-foreground hover:bg-background/90 focus-visible:ring-background/50 inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium tracking-tight transition focus-visible:ring-2 focus-visible:outline-none active:scale-98 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 sm:text-base"
            :aria-disabled="ctaDisabled || submitting"
            :aria-busy="submitting || undefined"
            @click="emit('primary')"
          >
            <!-- t-icon-swap-slot stacks all three glyphs in one grid cell so the
                 button never changes width. Stacked and class-driven for the same
                 reason as the labels: a `<Transition mode="out-in">` in this pill
                 got stuck mid-leave and left the icon at opacity 0. -->
            <span class="t-icon-swap-slot grid shrink-0 place-items-center">
              <Icon
                name="hugeicons:shopping-cart-01"
                class="t-bar-line size-4 sm:size-5"
                :data-shown="!isPay && !submitting"
                :aria-hidden="true"
              />
              <Icon
                :name="ctaIcon"
                class="t-bar-line size-4 sm:size-5"
                :data-shown="isPay && !submitting"
                :aria-hidden="true"
              />
              <Icon
                name="svg-spinners:180-ring"
                class="t-bar-line size-4 sm:size-5"
                :data-shown="submitting"
                :aria-hidden="true"
              />
            </span>
            <span class="grid min-w-0">
              <span
                class="t-bar-line col-start-1 row-start-1 truncate"
                :data-shown="!!ctaLabel"
                :aria-hidden="!ctaLabel"
                >{{ ctaLabel }}</span
              >
              <span
                class="t-bar-line col-start-1 row-start-1 truncate"
                :data-shown="!ctaLabel"
                :aria-hidden="!!ctaLabel"
                >{{ t("tickets.checkout") }}</span
              >
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* transitions-dev: accordion expand. Height animates via grid-template-rows
   0fr -> 1fr (no JS height measuring); the chevron flips vertically. Motion
   tokens are scoped to .t-acc so they don't leak into the global :root. */
.t-acc {
  --acc-expand: 250ms;
  --acc-collapse: 250ms;
  --acc-chevron: 250ms;
  --acc-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-acc-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--acc-collapse) var(--acc-ease);
}
.t-acc[data-open="true"] .t-acc-panel {
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--acc-expand) var(--acc-ease);
}
.t-acc-panel-inner {
  overflow: hidden;
  opacity: 0;
  filter: blur(2px);
  transition:
    opacity var(--acc-collapse) var(--acc-ease),
    filter var(--acc-collapse) var(--acc-ease);
}
.t-acc[data-open="true"] .t-acc-panel-inner {
  opacity: 1;
  filter: blur(0);
  transition:
    opacity var(--acc-expand) var(--acc-ease),
    filter var(--acc-expand) var(--acc-ease);
}
/* Rotate the chevron 180° to turn the "^" into a "v". Rotation is Chromium-safe
   and animates in every browser; duration + easing share the accordion's motion
   tokens (transitions-dev). */
.t-acc-chevron {
  display: inline-flex;
  transform: rotate(0deg);
  transform-origin: center;
  transition: transform var(--acc-chevron) var(--acc-ease);
}
.t-acc[data-open="true"] .t-acc-chevron {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .t-acc-panel,
  .t-acc-panel-inner,
  .t-acc-chevron {
    transition: none !important;
  }
}
</style>
