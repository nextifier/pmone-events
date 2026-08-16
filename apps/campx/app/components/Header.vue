<template>
  <header
    v-bind="$attrs"
    class="pointer-events-none sticky inset-x-0 top-0 z-70 flex justify-center px-3 pt-3"
  >
    <!-- The bar floats: a sticky, transparent wrapper keeps it out of the
         document flow's way, so no page needs a compensating top padding.
         The surface is the base layer's Header treatment (translucent
         background + backdrop blur), which is what keeps it readable while
         full-bleed photography scrolls underneath. -->
    <nav
      class="pointer-events-auto border-border/60 bg-background/85 supports-backdrop-filter:bg-background/65 flex w-full max-w-3xl items-center gap-1.5 rounded-full border p-1.5 shadow-lg backdrop-blur-md sm:gap-2 sm:p-2"
      aria-label="Navigasi utama"
    >
      <button
        type="button"
        class="focusable hover:bg-muted flex h-11 shrink-0 items-center gap-x-2 rounded-full px-3 transition-colors sm:px-4"
        :class="{ 'bg-muted': isOpen }"
        :aria-expanded="isOpen"
        aria-controls="mega-menu"
        @click="toggle()"
      >
        <span class="relative block h-3.5 w-4" aria-hidden="true">
          <span
            class="t-burger-bar absolute left-0 block h-px w-full bg-current"
            :class="isOpen ? 'top-1/2 rotate-45' : 'top-0.5'"
          />
          <span
            class="t-burger-bar absolute left-0 block h-px w-full bg-current"
            :class="isOpen ? 'top-1/2 -rotate-45' : 'bottom-0.5'"
          />
        </span>
        <span class="t-swap text-sm font-medium tracking-tight sm:text-base">
          <span class="t-swap-inner">
            <span>{{ isOpen ? "Tutup" : "Menu" }}</span>
            <span>{{ isOpen ? "Tutup" : "Menu" }}</span>
          </span>
        </span>
      </button>

      <!-- Symbol only below `sm`. The full lockup is 107px wide at h-6, which on
           a 320px phone pushed the reservation button past the bar's edge and
           made the whole document scroll sideways. -->
      <nuxt-link
        to="/"
        aria-label="Beranda"
        class="focusable mx-auto flex h-11 shrink-0 items-center px-1 sm:px-2"
        @click="close()"
      >
        <Logo variant="mark" class="h-6 sm:hidden" />
        <Logo class="hidden h-6 sm:block" />
      </nuxt-link>

      <nuxt-link
        v-for="action in actions"
        :key="action.label"
        :to="action.to"
        :target="action.external ? '_blank' : undefined"
        :rel="action.external ? 'noopener' : undefined"
        class="focusable flex h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium tracking-tight transition-colors sm:px-4 sm:text-base"
        :class="[
          action.primary
            ? 'bg-brand text-brand-foreground hover:opacity-90'
            : 'hover:bg-muted hidden sm:flex',
        ]"
        @click="close()"
      >
        <span class="t-swap">
          <span class="t-swap-inner">
            <span>{{ action.label }}</span>
            <span>{{ action.label }}</span>
          </span>
        </span>
      </nuxt-link>
    </nav>
  </header>

  <!-- Mega menu.
       Opaque, not translucent: the bar floats over the page and earns its blur,
       but this replaces the page. Tried at 80% with a 24px backdrop blur and the
       hero headline read straight through it. -->
  <Teleport to="body">
    <Transition
      enter-active-class="t-menu-in"
      leave-active-class="t-menu-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        id="mega-menu"
        class="bg-background fixed inset-0 z-60 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        @keydown.esc="close()"
      >
        <div
          ref="panelRef"
          class="t-stagger container flex min-h-full flex-col gap-8 pt-20 pb-10 sm:gap-10 sm:pt-24 sm:pb-12 lg:pt-28"
          :class="{ 'is-shown': isShown, 'is-hiding': isHiding }"
        >
          <!-- `flex-1` so this block claims the height between the bar and the
               footer row. Without it the footer's `mt-auto` left a tall band of
               nothing on desktop; now the featured image absorbs it. -->
          <div class="grid flex-1 gap-8 sm:gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <div class="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
              <section v-for="(group, groupIndex) in groups" :key="group.label" class="space-y-4">
                <h2
                  class="t-stagger-line text-muted-foreground text-base tracking-tight"
                  :style="{ '--stagger-index': groupIndex }"
                >
                  {{ group.label }}
                </h2>
                <ul class="space-y-1">
                  <li
                    v-for="(link, linkIndex) in group.links"
                    :key="link.to"
                    class="t-stagger-line"
                    :style="{ '--stagger-index': groupIndex + linkIndex + 1 }"
                  >
                    <!-- Name on one line, place and status on the next. Kept
                         them inline at first; "Cikidang" plus its regency plus
                         a badge overran the column and wrapped, while
                         "Jatiluhur" stayed on one line, so the two branches
                         rendered in visibly different shapes. -->
                    <nuxt-link
                      :to="link.to"
                      class="focusable hover:bg-muted -mx-2 flex min-h-11 flex-col items-start justify-center gap-y-0.5 rounded-lg px-2 py-1.5 transition-colors"
                      @click="close()"
                    >
                      <span class="t-swap text-xl font-semibold tracking-tighter sm:text-2xl lg:text-3xl">
                        <span class="t-swap-inner">
                          <span>{{ link.label }}</span>
                          <span>{{ link.label }}</span>
                        </span>
                      </span>
                      <span v-if="link.hint || link.isNew" class="flex items-center gap-x-2">
                        <span v-if="link.hint" class="text-muted-foreground text-base tracking-tight">
                          {{ link.hint }}
                        </span>
                        <Badge v-if="link.isNew" variant="info" plain>Baru</Badge>
                      </span>
                    </nuxt-link>
                  </li>
                </ul>
              </section>
            </div>

            <!-- Featured: the newest branch, the way osmo features a product.
                 It stretches to the height of the link columns so the desktop
                 grid does not end in a band of empty space. -->
            <nuxt-link
              v-if="featured"
              :to="`/${featured.slug}`"
              class="t-stagger-line focusable border-border/60 group flex h-full flex-col overflow-hidden rounded-3xl border"
              :style="{ '--stagger-index': 6 }"
              @click="close()"
            >
              <div class="bg-muted relative aspect-16/10 overflow-hidden lg:aspect-auto lg:flex-1">
                <NuxtImg
                  :src="featured.heroMedia.src"
                  :alt="featured.heroMedia.alt"
                  :width="featured.heroMedia.width"
                  :height="featured.heroMedia.height"
                  format="webp"
                  loading="lazy"
                  sizes="100vw lg:480px"
                  class="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div class="space-y-1 p-5">
                <p class="text-muted-foreground text-base tracking-tight">Cabang terbaru</p>
                <p class="text-xl font-semibold tracking-tighter">{{ featured.name }}</p>
                <p class="text-muted-foreground text-base tracking-tight">{{ featured.tagline }}</p>
              </div>
            </nuxt-link>
          </div>

          <div
            class="t-stagger-line border-border/60 mt-auto flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
            :style="{ '--stagger-index': 7 }"
          >
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
              <nuxt-link
                v-for="social in socials"
                :key="social.url"
                :to="social.url"
                target="_blank"
                rel="noopener"
                class="focusable text-muted-foreground hover:text-foreground text-base tracking-tight transition-colors"
              >
                {{ social.label }}
              </nuxt-link>
            </div>

            <div class="flex flex-wrap gap-3">
              <nuxt-link
                v-if="whatsappUrl"
                :to="whatsappUrl"
                target="_blank"
                rel="noopener"
                class="focusable bg-brand text-brand-foreground flex h-12 items-center rounded-full px-6 text-base font-medium tracking-tight transition-opacity hover:opacity-90"
                @click="close()"
              >
                Reservasi lewat WhatsApp
              </nuxt-link>
              <nuxt-link
                to="/outing"
                class="focusable border-border/60 hover:bg-muted flex h-12 items-center rounded-full border px-6 text-base font-medium tracking-tight transition-colors"
                @click="close()"
              >
                Minta penawaran outing
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { isNewLocation, LOCATIONS } from "~/data/locations";

/**
 * The template's root is a fragment (the bar plus a teleported overlay), so Vue
 * cannot decide where an inherited `class` should land and warns about it. The
 * layout does pass one, so attributes are bound to the bar explicitly.
 */
defineOptions({ inheritAttrs: false });

const route = useRoute();
const profile = useProjectProfile();
const shortName = useAppConfig().app.shortName;

const isOpen = ref(false);
const isShown = ref(false);
const isHiding = ref(false);
const panelRef = ref<HTMLElement | null>(null);

const actions = computed(() => [
  { label: "Paket", to: "/paket", primary: false, external: false },
  ...(whatsappUrl.value
    ? [{ label: "Reservasi", to: whatsappUrl.value, primary: true, external: true }]
    : []),
]);

const whatsappUrl = computed(() => {
  if (!profile.whatsappNumber) return "";
  const text = encodeURIComponent(`Halo ${shortName}! Saya mau tanya soal reservasi.`);
  return `https://api.whatsapp.com/send?phone=${profile.whatsappNumber}&text=${text}`;
});

const groups = computed(() => [
  {
    label: "Lokasi",
    // The regency without its "Kabupaten" prefix. The full string wrapped one
    // branch onto a second line while the other stayed inline, which read as a
    // rendering accident rather than a decision.
    links: LOCATIONS.map((location) => ({
      to: `/${location.slug}`,
      label: location.shortName,
      hint: location.address.regency.replace(/^Kabupaten\s+/i, ""),
      isNew: isNewLocation(location),
    })),
  },
  {
    label: "Paket",
    links: [
      { to: "/paket?tipe=stay", label: "Menginap", hint: null, isNew: false },
      { to: "/paket?kategori=rafting", label: "Rafting", hint: null, isNew: false },
      { to: "/paket?tipe=activity", label: "Aktivitas", hint: null, isNew: false },
      { to: "/outing", label: "Outing", hint: null, isNew: false },
      { to: "/paket", label: "Semua paket", hint: null, isNew: false },
    ],
  },
  {
    label: "Info",
    links: [
      { to: "/galeri", label: "Galeri", hint: null, isNew: false },
      { to: "/news", label: "Artikel", hint: null, isNew: false },
      { to: "/faq", label: "FAQ", hint: null, isNew: false },
      { to: "/tentang", label: "Tentang", hint: null, isNew: false },
      { to: "/kontak", label: "Kontak", hint: null, isNew: false },
    ],
  },
]);

const featured = computed(() => LOCATIONS.find((location) => isNewLocation(location)) ?? null);

const socials = computed(() =>
  (profile.socialLinks ?? [])
    .map((link: { label?: string; url?: string }) => ({
      label: link?.label ?? "",
      url: link?.url ?? "",
    }))
    .filter((link: { label: string; url: string }) => link.label && link.url),
);

/**
 * Entrance and exit are decoupled. `.is-shown` plays the stagger; `.is-hiding`
 * fades every line at once, so closing never replays the reveal backwards.
 */
function open() {
  isOpen.value = true;
  isHiding.value = false;
  nextTick(() => {
    void panelRef.value?.offsetHeight;
    isShown.value = true;
  });
}

function close() {
  if (!isOpen.value) return;
  isShown.value = false;
  isHiding.value = true;
  window.setTimeout(() => {
    isOpen.value = false;
    isHiding.value = false;
  }, 200);
}

function toggle() {
  isOpen.value ? close() : open();
}

// Body scroll lock while the overlay owns the screen.
watch(isOpen, (value) => {
  if (!import.meta.client) return;
  document.documentElement.style.overflow = value ? "hidden" : "";
});

// Escape closes from anywhere, not only when the panel holds focus.
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.documentElement.style.overflow = "";
});

// A route change while the menu is open must not leave it hanging.
watch(() => route.fullPath, close);
</script>
