<template>
  <Drawer v-model:open="isOpen" side="right">
    <!--
      `toggle` because this button is the close control too: the bars morph into
      a cross while the menu is open. `pointer-events-auto` because the scroll
      lock sets `pointer-events: none` on the body, and the header sits outside
      the drawer — without it the cross was purely decorative and the only ways
      out were Escape, the backdrop, a swipe, or a link.
    -->
    <DrawerTrigger toggle as-child>
      <button
        type="button"
        class="pointer-events-auto relative flex size-8 items-center justify-center rounded-lg"
        aria-label="Menu"
      >
        <!--
          Icon swap (transitions-dev 09) tokens: the two bars are one slot
          swapping between a hamburger and a cross, rotated rather than
          cross-faded, so the swap clock applies. `transition-all` is deliberate
          — translate, rotate and scale all change.

          The two thicknesses aim at the same target, the icons sitting beside
          this button. Those are 24-unit glyphs drawn at 18px with a 2-unit
          stroke, so they paint at exactly 1.5px — and being strokes, they paint
          antialiased. A CSS box does not. Flat, it lands on the pixel grid and
          comes out hard-edged, which reads thinner than an antialiased stroke of
          the same width, so it takes 1.75px to look like the icons. Rotated 45°
          it can no longer snap, picks up the same soft edge the icons have, and
          wants the icons' own 1.5px back — hence scaling to 6/7 on the way to
          the cross.

          Calibrated by eye against a clone of the neighbouring icon at DPR 1.
        -->
        <span
          v-for="(_, index) in 2"
          :key="index"
          class="bg-primary absolute h-[1.75px] w-5 transition-all duration-(--icon-swap-dur) ease-(--icon-swap-ease) motion-reduce:transition-none"
          :class="{
            '-translate-y-1 scale-y-100': index === 0 && !isOpen,
            'translate-y-1 scale-y-100': index === 1 && !isOpen,
            'translate-y-0! scale-y-[.857] rotate-45': index === 0 && isOpen,
            'translate-y-0! scale-y-[.857] -rotate-45': index === 1 && isOpen,
          }"
        ></span>
      </button>
    </DrawerTrigger>

    <DrawerPopup
      id="header-menu"
      variant="straight"
      viewport-class="top-(--navbar-height-mobile) bottom-0 lg:top-(--navbar-height-desktop)"
      overlay-class="z-40 ease-(--panel-ease) duration-(--panel-open-dur) data-ending-style:duration-(--panel-close-dur) motion-reduce:transition-none!"
      class="bg-background text-primary ease-(--panel-ease) duration-(--panel-open-dur) data-ending-style:duration-(--panel-close-dur) motion-reduce:transition-none! w-full max-w-2xl border-s-0 shadow-none dark:sm:border dark:sm:border-gray-900"
      tabindex="-1"
    >
      <DrawerTitle class="sr-only">Menu</DrawerTitle>
      <DrawerDescription class="sr-only">Navigation menu</DrawerDescription>

      <!--
        `touch-auto` hands vertical scrolling back to the browser: the popup is
        `touch-none` so the horizontal drag belongs to JS, and without this the
        list would not scroll on a touch device.

        The `lg:` height used to carry a stray `d` that killed the variant, so the
        mobile value applied at every breakpoint. Both navbar tokens are 3.5rem
        today, so the two calcs resolve identically and removing it changes
        nothing on screen — but the variant works again if they ever diverge.
      -->
      <div
        class="scroll-fade-y lg:h-[calc(100dvh-var(--navbar-height-desktop)-3.5rem)] h-[calc(100dvh-var(--navbar-height-mobile)-3.5rem)] touch-auto overflow-y-auto"
      >
        <div
          class="grid grid-cols-12 gap-x-1 gap-y-10 px-2 pt-6 pb-10 sm:px-8"
        >
          <div
            v-if="primaryGroup"
            class="col-span-7 flex flex-col gap-y-2 lg:col-span-6"
          >
            <span
              class="text-muted-foreground/90 px-4 text-sm tracking-tight lg:px-6"
              >{{ tLabel(primaryGroup.label) }}</span
            >

            <div class="flex flex-col gap-y-3">
              <DrawerClose
                as-child
                v-for="(link, index) in primaryGroup.links"
                :key="index"
              >
                <NuxtLink
                  :to="lp(link.path)"
                  :target="link.path.startsWith('http') ? '_blank' : ''"
                  class="text-foreground hover:bg-muted overflow-x-hidden rounded-xl px-4 py-1.5 text-3xl leading-snug font-medium tracking-[-0.04em] transition active:scale-98 lg:px-6"
                  active-class="bg-muted"
                  @click="onLinkActivate(lp(link.path))"
                  @contextmenu="
                    (event) => {
                      if (link.rightClickLink) {
                        event.preventDefault();
                        navigateTo(link.rightClickLink, {
                          external: true,
                          open: { target: '_blank' },
                        });
                      }
                    }
                  "
                >
                  {{ tLabel(link.label) }}
                </NuxtLink>
              </DrawerClose>
            </div>
          </div>

          <div
            class="order-first col-span-5 flex flex-col gap-y-6 lg:col-span-6"
          >
            <ColorModeButtons />

            <div
              v-for="(item, index) in secondaryGroups"
              :key="index"
              class="flex flex-col gap-y-2"
            >
              <span
                class="text-muted-foreground/90 px-4 text-sm tracking-tight lg:px-6"
                >{{ tLabel(item.label) }}</span
              >

              <div class="flex flex-col gap-y-2 sm:gap-y-1">
                <DrawerClose
                  as-child
                  v-for="(link, index) in item.links"
                  :key="index"
                >
                  <NuxtLink
                    :to="lp(link.path)"
                    :target="link.path.startsWith('http') ? '_blank' : ''"
                    class="text-foreground hover:bg-muted rounded-lg px-4 py-1 text-sm leading-normal tracking-tight transition active:scale-98 sm:text-base lg:px-6 lg:py-1.5"
                    active-class="bg-muted"
                    @click="onLinkActivate(lp(link.path))"
                    @contextmenu="
                      (event) => {
                        if (link.rightClickLink) {
                          event.preventDefault();
                          navigateTo(link.rightClickLink, {
                            external: true,
                            open: { target: '_blank' },
                          });
                        }
                      }
                    "
                  >
                    {{ tLabel(link.label) }}</NuxtLink
                  >
                </DrawerClose>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="xs:px-4 absolute inset-x-0 bottom-0 grid h-16 w-full grid-cols-2 gap-2 px-2 pb-4 sm:px-8"
      >
        <DrawerClose as-child>
          <NuxtLink
            :to="localePath('/book-space')"
            class="bg-muted text-foreground hover:bg-border flex size-full items-center justify-center rounded-xl text-lg font-semibold tracking-tight transition select-none active:scale-98"
            @click="onLinkActivate(localePath('/book-space'))"
            v-ripple
            >{{ $t("ui.bookSpace") }}</NuxtLink
          ></DrawerClose
        >

        <DrawerClose as-child>
          <NuxtLink
            :to="localePath('/tickets')"
            class="bg-primary text-primary-foreground hover:bg-primary/80 flex size-full items-center justify-center rounded-xl text-lg font-semibold tracking-tight transition select-none active:scale-98"
            @click="onLinkActivate(localePath('/tickets'))"
            v-ripple
            >{{ $t("ui.getTicket") }}</NuxtLink
          >
        </DrawerClose>
      </div>
    </DrawerPopup>
  </Drawer>
</template>

<script setup>
// Built on the Drawer rather than reka's Dialog primitives, so the panel follows
// the finger instead of snapping shut on a direction guess. The old `useSwipe`
// watcher only ever reported which way you moved; there was no drag, no rubber
// band, and no way to change your mind halfway.
//
// The back-button handling that used to live here went with it. `Drawer` calls
// `usePanelHistory`, which keeps one stack shared with Dialog and Lightbox, and
// only rewinds while the current history entry is still the one it pushed — the
// same thing the local `closingViaLink` flag was for, minus the bookkeeping.
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const localePath = useLocalePath();
const { t, te } = useI18n();
const lp = useEditionPath();
const tLabel = (label) => {
  if (!label) return "";
  const key = `nav.${label}`;
  return te(key) ? t(key) : label;
};

const dialogRoutes = computed(() => useAppConfig().routes.dialog ?? []);
const dialogGroups = computed(() => dialogRoutes.value || []);
const primaryGroup = computed(() => dialogGroups.value[0] || null);

// Social + contact links come from PM One project profile (single source of
// truth), appended after the static route groups.
const profile = useProjectProfile();
const profileGroups = computed(() => {
  const groups = [];
  const contact = Object.values(profile.contactLinks);
  if (contact.length) {
    groups.push({ label: "Get in touch", links: contact });
  }
  if (profile.socialLinks.length) {
    groups.push({ label: "Social", links: profile.socialLinks });
  }
  return groups;
});

const secondaryGroups = computed(() => [
  ...dialogGroups.value.slice(1),
  ...profileGroups.value,
]);

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:open"]);

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

defineShortcuts({
  m: {
    handler: () => {
      isOpen.value = !isOpen.value;
    },
  },
});

const { $scrollToTopIfCurrentPageIs } = useNuxtApp();
const onLinkActivate = (path) => {
  $scrollToTopIfCurrentPageIs(path);
};
</script>
