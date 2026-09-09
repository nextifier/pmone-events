<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { cn } from "@/lib/utils";

/**
 * Files that can only be named: a document, or an image whose bytes are gone.
 * Inlining a PDF is a viewer, not a thumbnail, so it stays a chip.
 *
 * Same block as a picture, other orientation. `AttachmentActions` sits inline
 * after the title when the attachment is horizontal and floats over the media
 * when it is vertical, which is why one structure covers both and neither
 * needs a download button written by hand.
 */
const props = defineProps<{
  items: Array<{
    name?: string | null;
    kind: "image" | "document";
    mime?: string | null;
    size?: number | null;
    downloadUrl?: string | null;
  }>;
  class?: HTMLAttributes["class"];
}>();

const EXTENSION_ICONS: Record<string, string> = {
  pdf: "hugeicons:pdf-01",
  doc: "hugeicons:doc-01",
  docx: "hugeicons:doc-01",
  xls: "hugeicons:xls-01",
  xlsx: "hugeicons:xls-01",
  csv: "hugeicons:csv-01",
  ppt: "hugeicons:ppt-01",
  pptx: "hugeicons:ppt-01",
  txt: "hugeicons:txt-01",
  zip: "hugeicons:zip-01",
};

function extensionOf(name?: string | null): string {
  return name?.split(".").pop()?.toLowerCase() ?? "";
}

function iconFor(file: { name?: string | null; kind: "image" | "document" }): string {
  if (file.kind === "image") return "hugeicons:image-01";

  return EXTENSION_ICONS[extensionOf(file.name)] ?? "hugeicons:file-01";
}

/** "PDF - 2.4 MB", the label shadcn's own attachment example carries. */
function describe(file: { name?: string | null; size?: number | null }): string {
  const label = extensionOf(file.name).toUpperCase();
  if (!file.size) return label;

  const mb = file.size / (1024 * 1024);
  const size = mb >= 0.1 ? `${Math.round(mb * 10) / 10} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

  return label ? `${label} - ${size}` : size;
}
</script>

<template>
  <AttachmentGroup
    v-if="items.length"
    data-slot="chat-file-chips"
    :class="cn('gap-2', props.class)"
  >
    <Attachment v-for="(file, i) in items" :key="i" size="sm" class="w-60 max-w-full">
      <AttachmentMedia variant="icon">
        <Icon :name="iconFor(file)" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{{ file.name || "Attachment" }}</AttachmentTitle>
        <AttachmentDescription v-if="describe(file)">{{ describe(file) }}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions v-if="file.downloadUrl">
        <AttachmentAction
          as="a"
          :href="file.downloadUrl"
          :aria-label="`Download ${file.name || 'attachment'}`"
          title="Download"
          size="icon-sm"
          variant="secondary"
        >
          <Icon name="hugeicons:download-01" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  </AttachmentGroup>
</template>
