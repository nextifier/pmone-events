<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ease-(--modal-ease) data-open:duration-(--modal-open-dur) data-closed:duration-(--modal-close-dur) motion-reduce:animate-none! fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 ease-(--modal-ease) data-open:duration-(--modal-open-dur) data-closed:duration-(--modal-close-dur) motion-reduce:animate-none! xs:h-full xs:w-auto fixed top-1/2 left-1/2 z-50 flex aspect-9/16 h-auto max-h-[calc(100%-4rem)] w-[calc(100%-8px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl"
        @close-auto-focus.prevent
      >
        <DialogTitle class="hidden"></DialogTitle>
        <DialogDescription class="hidden"></DialogDescription>

        <div
          class="border-border size-full overflow-hidden rounded-xl border backdrop-blur-xl sm:rounded-2xl"
        >
          <iframe
            v-if="videoSrc"
            :src="`${videoSrc}?autoplay=1`"
            class="size-full border-0 bg-white/10 object-cover"
            title="Shorts video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>

        <DialogClose
          class="absolute bottom-0 left-1/2 flex size-10 -translate-x-1/2 translate-y-[calc(100%+1rem)] items-center justify-center rounded-full bg-white text-black transition hover:bg-white/80 active:scale-95 sm:top-0 sm:right-0 sm:bottom-auto sm:left-auto sm:translate-x-[calc(100%+1rem)] sm:translate-y-0"
          aria-label="Close"
        >
          <IconClose class="size-5" />
        </DialogClose>
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
} from "reka-ui";

const uiStore = useUiStore();

const isOpen = computed({
  get() {
    return uiStore.isShortsDialogOpen;
  },
  set(value) {
    if (!value) {
      uiStore.closeShortsDialog();
    }
  },
});

const videoSrc = computed(() => uiStore.shortsVideoSrc);
</script>
