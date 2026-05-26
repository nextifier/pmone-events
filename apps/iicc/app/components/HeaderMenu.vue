<template>
  <DialogRoot v-model:open="isOpen">
    <DialogTrigger as-child>
      <button
        class="relative flex size-8 items-center justify-center rounded-lg"
        aria-label="Menu"
      >
        <span
          v-for="(_, index) in 2"
          :key="index"
          class="bg-primary absolute h-px w-5 transition-all duration-200"
          :class="{
            '-translate-y-1': index === 0 && !isOpen,
            'translate-y-1': index === 1 && !isOpen,
            'translate-y-0! rotate-45': index === 0 && isOpen,
            'translate-y-0! -rotate-45': index === 1 && isOpen,
          }"
        ></span>
      </button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 !ease-out-swift fixed inset-0 z-40 bg-black/80 transition !duration-500"
      />
      <DialogContent
        id="header-menu"
        class="bg-background !ease-out-swift data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right text-primary fixed top-(--navbar-height-mobile) right-0 bottom-0 z-50 min-h-[calc(100dvh-var(--navbar-height-mobile))] w-full max-w-2xl transition !duration-500 lg:top-(--navbar-height-desktop) lg:min-h-[calc(100dvh-var(--navbar-height-desktop))] dark:sm:border dark:sm:border-gray-900"
        tabindex="-1"
      >
        <DialogHeader class="sr-only">
          <DialogTitle>Menu</DialogTitle>
          <DialogDescription>Navigation menu</DialogDescription>
        </DialogHeader>

        <ScrollArea type="scroll">
          <div
            ref="headerMenuContent"
            class="h-[calc(100dvh-var(--navbar-height-mobile)-3.5rem)] lg:h-[calc(100dvh-var(--navbar-height-desktop)-3.5rem)]"
          >
            <div
              class="grid grid-cols-12 gap-x-1 gap-y-10 px-2 pt-6 pb-10 sm:px-8"
            >
              <div class="col-span-7 flex flex-col gap-y-4 lg:col-span-6">
                <span
                  class="text-muted-foreground/90 px-4 text-sm tracking-tight sm:text-base lg:px-6"
                  >{{ dialogGroups[0]?.label }}</span
                >

                <div class="flex flex-col gap-y-3">
                  <DialogClose
                    as-child
                    v-for="(link, index) in dialogGroups[0]?.links ?? []"
                    :key="index"
                  >
                    <!-- Link dengan hash -->
                    <NuxtLink
                      v-if="link.path.includes('#')"
                      :to="getBasePath(link.path)"
                      v-scroll-to="getScrollToOptions(link.path)"
                      class="text-primary hover:bg-muted overflow-x-hidden rounded-xl px-4 py-1.5 text-3xl leading-snug font-medium tracking-[-0.04em] transition active:scale-98 lg:px-6"
                      active-class=""
                      @contextmenu="handleContextMenu($event, link)"
                    >
                      {{ link.label }}
                    </NuxtLink>
                    <!-- Link tanpa hash -->
                    <NuxtLink
                      v-else
                      :to="link.path.startsWith('/') ? localePath(link.path) : link.path"
                      :target="link.path.startsWith('http') ? '_blank' : ''"
                      class="text-primary hover:bg-muted overflow-x-hidden rounded-xl px-4 py-1.5 text-3xl leading-snug font-medium tracking-[-0.04em] transition active:scale-98 lg:px-6"
                      active-class=""
                      @click="$scrollToTopIfCurrentPageIs(link.path.startsWith('/') ? localePath(link.path) : link.path)"
                      @contextmenu="handleContextMenu($event, link)"
                    >
                      {{ link.label }}
                    </NuxtLink>
                  </DialogClose>
                </div>
              </div>

              <div
                class="order-first col-span-5 flex flex-col gap-y-6 lg:col-span-6"
              >
                <ColorModeButtons />

                <div
                  v-for="(item, index) in dialogGroups.slice(1)"
                  :key="index"
                  class="flex flex-col gap-y-2"
                >
                  <span
                    class="text-muted-foreground/90 px-4 text-sm tracking-tight sm:text-base lg:px-6"
                    >{{ item.label }}</span
                  >

                  <div class="flex flex-col gap-y-2 sm:gap-y-1">
                    <DialogClose
                      as-child
                      v-for="(link, index) in item.links"
                      :key="index"
                    >
                      <!-- Link dengan hash -->
                      <NuxtLink
                        v-if="link.path.includes('#')"
                        :to="getBasePath(link.path)"
                        v-scroll-to="getScrollToOptions(link.path)"
                        class="text-primary hover:bg-muted rounded-lg px-4 py-1 text-sm leading-normal tracking-tight transition active:scale-98 sm:text-base lg:px-6 lg:py-1.5"
                        active-class="bg-muted"
                        @contextmenu="handleContextMenu($event, link)"
                      >
                        {{ link.label }}
                      </NuxtLink>
                      <!-- Link tanpa hash -->
                      <NuxtLink
                        v-else
                        :to="link.path.startsWith('/') ? localePath(link.path) : link.path"
                        :target="link.path.startsWith('http') ? '_blank' : ''"
                        class="text-primary hover:bg-muted rounded-lg px-4 py-1 text-sm leading-normal tracking-tight transition active:scale-98 sm:text-base lg:px-6 lg:py-1.5"
                        active-class="bg-muted"
                        @click="$scrollToTopIfCurrentPageIs(link.path.startsWith('/') ? localePath(link.path) : link.path)"
                        @contextmenu="handleContextMenu($event, link)"
                      >
                        {{ link.label }}
                      </NuxtLink>
                    </DialogClose>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div
          class="xs:px-4 absolute inset-x-0 bottom-0 flex h-16 w-full gap-2 px-2 pb-4 sm:px-8"
        >
          <Button
            size="lg"
            class="bg-accent text-accent-foreground hover:bg-accent/80 h-full flex-1"
            @click="handleBuyTicket"
          >
            {{ $t("tickets.buyNow") }}
          </Button>
          <Button
            v-if="hotelVisible"
            :to="localePath('/hotels')"
            variant="secondary"
            size="lg"
            class="h-full flex-1"
            @click="isOpen = false"
          >
            {{ $t("hotels.bookNow") }}
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";
import { toast } from "vue-sonner";

const appConfig = useAppConfig();
const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

const dialogRoutes = useDynamicHeaderRoutes("dialog");
const dialogGroups = computed(() => dialogRoutes.value || []);
const { visible: hotelVisible } = useHotelSectionVisibility();

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

const uiStore = useUiStore();
const openContactDialog = () => {
  uiStore.openContactDialog();
};

// Helper functions untuk scroll-to dengan offset
const SCROLL_OFFSET = -100;

const getBasePath = (path) => {
  if (path.includes("#")) {
    return localePath(path.split("#")[0] || "/");
  }
  return localePath(path);
};

const getScrollToOptions = (path) => {
  if (path.includes("#")) {
    return {
      el: `#${path.split("#")[1]}`,
      offset: SCROLL_OFFSET,
    };
  }
  return {};
};

const handleContextMenu = (event, item) => {
  if (item.rightClickLink) {
    event.preventDefault();
    navigateTo(item.rightClickLink, {
      external: true,
      open: { target: "_blank" },
    });
  }
};

const handleBuyTicket = () => {
  if (appConfig.ticket.status !== "available") {
    toast.info(t("tickets.notAvailable"));
    return;
  }

  isOpen.value = false;
  const url = appConfig.routes.visitorRegistration.path;
  if (url.startsWith("http")) {
    window.open(url, "_blank");
  } else {
    navigateTo(localePath(url));
  }
};

defineShortcuts({
  meta_m: {
    handler: () => {
      isOpen.value = !isOpen.value;
    },
  },
});

const headerMenuContent = ref(null);
const { isSwiping, direction } = useSwipe(headerMenuContent);
watch(isSwiping, () => {
  if (direction.value === "right") {
    isOpen.value = false;
  }
});
</script>
