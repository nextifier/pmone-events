<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentMedia,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Lightbox } from "@/components/ui/lightbox";
import { cn } from "@/lib/utils";

/**
 * Pictures are shown, not named.
 *
 * A chat that answers a screenshot with the word "screenshot.png" makes the
 * reader open something to remember what they sent. Anything without a URL
 * belongs in `ChatFileChips` instead.
 *
 * One picture is an `Attachment`, the shape shadcn uses for a message
 * attachment: `orientation="vertical"` is what floats the download button over
 * the image instead of putting it in a row beside it, so the same block serves
 * a picture and a file. Several pictures go through the lightbox's own grid,
 * which already knows how to show four and say "+2" - a download button per
 * tile at that size would be noise, and the viewer carries one.
 */
const props = defineProps<{
  items: Array<{ url: string; name?: string | null; downloadUrl?: string | null }>;
  class?: HTMLAttributes["class"];
}>();

const lightboxItems = computed(() =>
  props.items.map((picture) => ({
    url: picture.url,
    name: picture.name ?? undefined,
    alt: picture.name ?? undefined,
    downloadUrl: picture.downloadUrl ?? picture.url,
  }))
);

const single = computed(() => (props.items.length === 1 ? props.items[0]! : null));
</script>

<template>
  <div v-if="items.length" data-slot="chat-pictures" :class="cn('min-w-0', props.class)">
    <Lightbox v-if="single" :items="lightboxItems" :alt="single.name || 'Attached image'">
      <template #trigger="{ open }">
        <!-- The vertical orientation is sized for the composer strip (w-24) and
             forces its image square; a photo in a transcript keeps its own
             shape, so both are overridden here rather than in the style pack. -->
        <Attachment orientation="vertical" class="w-fit max-w-80">
          <AttachmentMedia
            variant="image"
            class="aspect-auto w-fit *:[img]:aspect-auto *:[img]:w-auto *:[img]:object-contain"
          >
            <img
              :src="single.url"
              :alt="single.name || 'Attached image'"
              loading="lazy"
              class="max-h-72 w-auto max-w-full object-contain"
            />
          </AttachmentMedia>

          <AttachmentTrigger
            class="cursor-zoom-in"
            :aria-label="`Open ${single.name || 'the attached image'}`"
            @click="open"
          />

          <AttachmentActions v-if="single.downloadUrl">
            <AttachmentAction
              as="a"
              :href="single.downloadUrl"
              :aria-label="`Download ${single.name || 'image'}`"
              title="Download"
              size="icon-sm"
              variant="secondary"
              @click.stop
            >
              <Icon name="hugeicons:download-01" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </template>
    </Lightbox>

    <Lightbox
      v-else
      :items="lightboxItems"
      :limit="4"
      rounded="rounded-xl"
      grid-class="grid w-fit max-w-full grid-cols-2 gap-1"
      item-class="size-28 sm:size-32"
      alt="Attached image"
    />
  </div>
</template>
