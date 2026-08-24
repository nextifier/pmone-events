<script setup>
import { useTicketCartStore } from "../../stores/ticketCart";
import { BlurImage } from "../ui/blur-image";
import TicketLineQuantity from "./TicketLineQuantity.vue";
import { Button } from "../ui/button";
import ResponsiveDialog from "../ui/responsive-dialog/ResponsiveDialog.vue";
import { onClickOutside, useEventListener } from "@vueuse/core";
import { computed, onBeforeUnmount, ref } from "vue";
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
   * subtotal. `pay` on /tickets/checkout: the CTA submits the order and the bar
   * shows the real total after the preview's discount. Nothing else differs -
   * the rows, the stepper and the clear-cart controls are the same on both
   * pages, because it is the same cart.
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
    const ticket = ticketForLine(ticketFor(l.ticket_id), l);
    // The listing never runs a pricing preview, so its unit price has to come
    // from the ticket record; checkout's comes back priced from the server.
    const unit =
      l.unit ||
      Number(
        ticket ? (ticket.on_sale ? ticket.price : ticket.display_price) : 0,
      ) ||
      0;
    const lineTotal = l.subtotal || unit * l.qty;
    return {
      ...l,
      ticket,
      unit,
      lineTotal,
      title: l.title || ticket?.title || t("tickets.ticket"),
      subLabel:
        cartLineSubLabel(ticket, l.item) ||
        (lineMissingDay(ticket, l.item) ? t("tickets.dayMissing") : ""),
      missingDay: lineMissingDay(ticket, l.item),
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
const headlineAmount = computed(() =>
  isPay.value ? total.value : subtotal.value,
);
const headlineLabel = computed(() =>
  isPay.value ? t("tickets.total") : t("tickets.subtotal"),
);
const amountLabel = (n) => (n > 0 ? fmtIdr(n) : t("tickets.free"));

/**
 * What the cart would cost at full price, struck through beside the headline.
 * `original_price` arrives only while the live phase is actually cheaper, so a
 * cart at the normal price has nothing to compare against and this stays 0.
 * Lines already at full price contribute their own total, so a mixed cart adds
 * up rather than reporting only the discounted half.
 */
const originalHeadline = computed(() => {
  const full = lines.value.reduce((sum, line) => {
    const original = Number(line.ticket?.original_price);
    const lineFull =
      Number.isFinite(original) && original > 0 ? original * line.qty : 0;

    return sum + (lineFull > line.lineTotal ? lineFull : line.lineTotal);
  }, 0);

  return full > headlineAmount.value ? full : 0;
});

const expanded = ref(false);

/**
 * Two ways out of the expanded detail, both guarded on `expanded` so a closed
 * bar swallows nothing.
 *
 * Click-outside is bound to the pill, not to the fixed strip: the strip spans
 * the full width and would count most of the page as inside.
 *
 * Escape only acts when nothing is layered above the bar. A dialog or a
 * combobox owns Escape while it is open, and the bar sitting underneath must
 * not eat the same press.
 */
const pillRef = ref(null);

const collapse = () => {
  if (expanded.value) expanded.value = false;
};

// `[role=dialog]` is the clear-cart confirmation, which is teleported to <body>
// and therefore reads as "outside". Collapsing the panel behind a dialog the
// panel itself opened, so that cancelling drops the buyer somewhere else, is not
// what "clicked away" means.
onClickOutside(pillRef, collapse, {
  ignore: ['[role="dialog"]', "[data-sonner-toast]"],
});

useEventListener(window, "keydown", (event) => {
  if (event.key !== "Escape" || !expanded.value) return;
  // A dialog or an open combobox owns Escape while it is up; the bar sits
  // underneath and must not eat the same press.
  if (document.querySelector('[role="dialog"], [role="listbox"]')) return;
  collapse();
});
/**
 * Clearing the cart sits one thumb-width from Checkout, so a miss costs the
 * buyer every ticket they picked. It is also the only irreversible control on
 * the bar - removing a single line raises an Undo toast, this one has nothing
 * to undo - so it asks first.
 */
const clearConfirmOpen = ref(false);

function confirmClear() {
  cart.clear();
  clearConfirmOpen.value = false;
}

/**
 * A pointer press leaves focus on this button. The focus ring stays suppressed
 * until the next keystroke - and then ANY key flips `:focus-visible` on, so a
 * global shortcut (the site binds "D" for the theme) rings a control the buyer
 * was not thinking about.
 *
 * `detail > 0` means a real pointer activation. Keyboard activation reports 0,
 * and there focus is kept: the ring is the only thing telling that buyer where
 * they are.
 */
function toggleDetail(event) {
  expanded.value = !expanded.value;
  if (event?.detail > 0) event.currentTarget?.blur();
}

/**
 * A fixed bottom bar and a virtual keyboard fight for the same space, and on a
 * page that is mostly text inputs the buyer is in that state most of the time.
 * Rather than measure `visualViewport` (which reports late on iOS and lands
 * after paint), step out of the way whenever a field has focus.
 */
const typing = ref(false);
let typingTimer = null;

/**
 * A field the on-screen keyboard would cover. A quantity stepper is not one:
 * reka marks it `role="spinbutton"` and focuses it on every +/- press, so
 * counting it as typing tore the bar down and rebuilt it on each tap - the panel
 * blinked shut and back open under the buyer's thumb. The role, rather than
 * "is it inside the bar", because the checkout aside has the same stepper and
 * the same tap must not move the bar there either.
 */
const isTextEntry = (el) =>
  !!el &&
  el.getAttribute("role") !== "spinbutton" &&
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

// Attached unconditionally, and NOT gated on `hideWhileTyping` here. The bar is
// mounted once in app.vue and lives across /tickets -> /tickets/checkout, so
// `onMounted` ran while the prop was still false on the listing page and an
// early return left the listeners off for the rest of the session - the reason
// the bar sat on top of the keyboard at checkout. `visible` does the gating.
useEventListener(document, "focusin", onFocusChange);
useEventListener(document, "focusout", onFocusChange);

onBeforeUnmount(() => {
  if (typingTimer) clearTimeout(typingTimer);
});

const visible = computed(
  () => !cart.isEmpty && !(props.hideWhileTyping && typing.value),
);
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
           accordion expand, growing upward from this bottom-anchored bar).

           The destructive pair has to invert with it. `--destructive-foreground`
           is picked to contrast with the PAGE, so on a surface that is the page
           inverted it always landed on the wrong end: a dark red glyph on the
           near-black bar in light mode (2.78:1), a light red glyph on the cream
           bar in dark mode (2.08:1). Both fail the 3:1 floor for an icon.
           Swapping the two ends here fixes every destructive descendant at once
           (the trash button, the missing-day sub-label) with no call site
           reaching for a raw palette colour. -->
      <div
        ref="pillRef"
        class="t-acc bg-foreground text-background ring-foreground/10 mx-auto w-full max-w-xl overflow-hidden shadow-lg ring-1 ring-white/20 transition-[border-radius,padding] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] [--destructive-foreground:var(--color-red-400)] motion-reduce:transition-none dark:[--destructive-foreground:var(--color-red-700)]"
        :class="
          expanded
            ? 'rounded-3xl px-2.5 py-3 sm:p-4'
            : 'rounded-4xl p-1 pl-2.5'
        "
        :data-open="expanded"
      >
        <!-- Collapsible detail, above the action row -->
        <div class="t-acc-panel">
          <div class="t-acc-panel-inner">
            <div class="px-2.5 pb-2">
              <!-- The bottom rule used to come from the summary row that sat below.
                   With that row gone the list still needs to read as its own
                   group, separate from the action row. -->
              <ul
                class="divide-background/10 border-background/10 flex flex-col divide-y border-b"
              >
                <!-- `first:pt-0` so the first row's content starts exactly one
                     pill-padding from the top edge, the same distance the action
                     row ends from the bottom edge. Between rows the rhythm is
                     unchanged: 8px under one row plus 8px over the next. -->
                <li
                  v-for="line in lines"
                  :key="line.key"
                  class="flex items-center gap-3 py-2 first:pt-0"
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
                  <!-- Posterless rows keep the poster's footprint so titles and
                       quantities stay on one column. This slot used to hold the
                       quantity; that now lives in the stepper on the right, and
                       showing it twice made two rows of the same ticket harder
                       to tell apart, not easier. -->
                  <span
                    v-else
                    class="bg-background/10 text-background/50 inline-flex size-11 shrink-0 items-center justify-center rounded-lg"
                    aria-hidden="true"
                  >
                    <Icon name="hugeicons:ticket-02" class="size-5" />
                  </span>
                  <div class="min-w-0 flex-1 leading-tight">
                    <p
                      class="truncate text-sm font-medium tracking-tight sm:text-base"
                    >
                      {{ line.title }}
                    </p>
                    <!-- A line missing its required day says so, in the
                         destructive colour: two rows of the same ticket used to
                         be pixel-identical apart from one absent line. -->
                    <p
                      v-if="line.subLabel"
                      class="truncate text-sm tracking-tight"
                      :class="
                        line.missingDay
                          ? 'text-destructive-foreground'
                          : 'text-background/80'
                      "
                    >
                      {{ line.subLabel }}
                    </p>
                  </div>
                  <!-- Price over quantity on the trailing edge. The `x` button
                       that used to sit here is gone: stepping below the ticket's
                       minimum removes the line, so one control does both jobs and
                       the row no longer offers two ways to reach zero. -->
                  <div class="flex shrink-0 flex-col items-end gap-1">
                    <span
                      class="text-sm font-medium tabular-nums transition-opacity sm:text-base"
                      :class="{ 'opacity-60': line.pending }"
                      >{{ line.priceLabel }}</span
                    >
                    <TicketLineQuantity :line="line" tone="inverted" />
                  </div>
                </li>
              </ul>

              <!-- Only a real breakdown earns a row here. This block used to
                   repeat the action row directly below it - the same amount and
                   a second Clear cart, one thumb-width apart - which is two ways
                   to read one number and two ways to empty one cart. The total
                   and the trash button live in the action row; a subtotal only
                   means something once a discount has moved it. -->
              <div
                v-if="discount > 0"
                class="border-background/10 mt-1 space-y-1 border-t pt-3"
              >
                <p class="flex items-baseline justify-end leading-tight">
                  <span class="text-background/80 text-sm tracking-tight">
                    {{ t("tickets.subtotal") }}
                  </span>
                  <span
                    class="ml-2 text-sm font-medium tabular-nums sm:text-base"
                  >
                    {{ fmtIdr(subtotal) }}
                  </span>
                </p>
                <p class="flex items-baseline justify-end leading-tight">
                  <span class="text-background/80 text-sm tracking-tight">
                    {{ t("tickets.discount") }}
                  </span>
                  <span
                    class="ml-2 text-sm font-medium tabular-nums sm:text-base"
                  >
                    -{{ fmtIdr(discount) }}
                  </span>
                </p>
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
              <span class="-mt-0.5 flex items-baseline gap-x-2">
                <span
                  class="text-base font-semibold tabular-nums transition-opacity sm:text-lg"
                  :class="{ 'opacity-60': isPay && cart.pricingPending }"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {{ amountLabel(headlineAmount) }}
                </span>
                <!-- The same struck full price the card and the checkout summary
                     show. `--destructive-foreground` is a light-surface token and
                     this bar paints `bg-foreground`, so the strike borrows the
                     bar's own secondary weight instead. -->
                <span
                  v-if="originalHeadline"
                  class="text-background/60 text-sm tracking-tight tabular-nums line-through"
                >
                  {{ fmtIdr(originalHeadline) }}
                </span>
              </span>
            </span>
            <span
              class="t-acc-chevron bg-background/10 text-background/70 dark:bg-background/6 ml-auto flex size-9 shrink-0 items-center justify-center self-center rounded-full"
            >
              <!-- Hugeicons, like every other glyph in this row. The
                   hand-drawn path this replaces was on a 16 grid at stroke
                   1.75, which renders 2.19px at size-5 against Hugeicons'
                   1.25px - the trash button right next to it looked 75%
                   thinner. Rotation lives on the wrapper, so the swap is
                   free. -->
              <Icon name="hugeicons:arrow-up-01" class="size-4 sm:size-5" />
            </span>
          </button>

          <!-- `size-9` pinned rather than left to the size variant: this circle
               and the chevron beside it are a matched pair the bar draws itself,
               and each style pack sizes `icon` differently (mono makes it 32px,
               against the chevron's 36). It also keeps the 44px coarse-pointer
               pad from reaching its neighbours across the 6px gap. -->
          <Button
            variant="ghost"
            size="icon"
            class="bg-destructive/15 text-destructive-foreground hover:bg-destructive/25 focus-visible:ring-destructive-foreground/40 size-9 self-center rounded-full"
            :aria-label="t('tickets.clearCart')"
            @click="clearConfirmOpen = true"
          >
            <Icon name="hugeicons:delete-01" class="size-4 sm:size-5" />
          </Button>

          <!-- `h-auto` is load-bearing. The row is `items-stretch` so the CTA's
               top and bottom margin is exactly the pill's padding; a size
               class's own fixed height would pin it and break that. -->
          <Button
            size="lg"
            class="bg-background text-foreground hover:bg-background/90 focus-visible:ring-background/50 h-auto gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium active:scale-98 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 sm:h-auto sm:text-base"
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
            <!-- `t-bar-slot` takes the hidden label out of flow. Stacked in
                 flow, every label fed the intrinsic width, so the button stayed
                 as wide as the longest one - "Checkout" - long after it had
                 swapped to "Pay". -->
            <span class="t-bar-slot grid min-w-0">
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
          </Button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Outside the Transition on purpose: the bar hides itself while a field has
       focus, and a dialog that unmounted with it would take the confirmation
       away mid-decision. -->
  <ResponsiveDialog
    v-model:open="clearConfirmOpen"
    :title="t('tickets.clearCartTitle')"
    :description="t('tickets.clearCartBody')"
    dialog-max-width="26rem"
  >
    <template #default>
      <!-- Structure copied from pmone's ConfirmDialog.vue, the app's one
           confirmation shape: same paddings, same type, and the actions always
           side by side and right-aligned - Cancel, then the destructive one. It
           used to stack full-width below `sm`, which is a second pattern for the
           same job.
           `aria-hidden` on the prompt, because ResponsiveDialog already renders
           these two strings as the sr-only DialogTitle and DialogDescription;
           without it a screen reader reads the whole thing twice. -->
      <div class="px-4 pt-5 pb-8 md:px-6 md:py-5">
        <div aria-hidden="true">
          <div
            class="text-foreground text-lg font-semibold tracking-tighter text-balance"
          >
            {{ t("tickets.clearCartTitle") }}
          </div>
          <p class="text-body mt-1.5 text-sm tracking-tight">
            {{ t("tickets.clearCartBody") }}
          </p>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" @click="clearConfirmOpen = false">
            {{ t("tickets.clearCartCancel") }}
          </Button>
          <Button variant="destructive" @click="confirmClear">
            {{ t("tickets.clearCartConfirm") }}
          </Button>
        </div>
      </div>
    </template>
  </ResponsiveDialog>
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
