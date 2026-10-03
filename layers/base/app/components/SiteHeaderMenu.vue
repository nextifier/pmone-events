<template>
  <HeaderMenu v-model:open="isOpen" offset="var(--navbar-height)">
    <HeaderMenuTrigger />

    <HeaderMenuPanel
      id="header-menu"
      size="2xl"
      overlay-class="bg-black/80"
      class="text-primary dark:sm:border-gray-900"
      body-class="overflow-visible"
    >
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
    </HeaderMenuPanel>
  </HeaderMenu>
</template>

<script setup>
// The site's menu: the groups and links of this event, in the reusable header
// menu (drawer, swipe, back button, the two-bar button and its tokens all live
// there). Named SiteHeaderMenu because HeaderMenu is the reusable one.
import { DrawerClose } from "@/components/ui/drawer";
import {
  HeaderMenu,
  HeaderMenuPanel,
  HeaderMenuTrigger,
} from "@/components/ui/header-menu";

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

// A ticket holder signed in for meetings finds their meetings here. Asked when
// the menu first opens; without a session cookie the site answers locally.
const { visitor, load: loadVisitor } = useVisitorSession();
const meetingGroups = computed(() =>
  visitor.value
    ? [{ label: t("meetings.menu.group"), links: [{ label: t("meetings.mine.title"), path: "/meetings" }] }]
    : [],
);

const secondaryGroups = computed(() => [
  ...meetingGroups.value,
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

watch(isOpen, (open) => {
  if (open) loadVisitor();
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
