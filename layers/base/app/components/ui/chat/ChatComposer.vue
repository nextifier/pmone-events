<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useMediaQuery, useThrottleFn } from "@vueuse/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import ChatAttachments from "./ChatAttachments.vue";
import { useFileDrop } from "./useFileDrop";
import {
  CHAT_ATTACHMENT_MIMES,
  EXTENSION_MIMES,
  MAX_CHAT_ATTACHMENTS,
  MAX_CHAT_ATTACHMENT_BYTES,
} from "./limits";
import { cn } from "@/lib/utils";

/**
 * The box someone types a message into.
 *
 * Everything here is about the act of composing: text, files, and the two keys
 * that send it. It knows nothing about where a message goes, what a reply looks
 * like, or who is allowed to send one - those belong to whatever mounts it.
 *
 * The behaviours are the point. A screenshot pasted from the clipboard, a file
 * dragged onto the box, the same limits the server will apply, Enter to send and
 * Shift+Enter for a newline (on a keyboard; on a phone Enter is a newline and
 * the button sends), and a send button that becomes a stop button while an
 * answer is arriving. Each of those is small and each has a way of going subtly
 * wrong, which is why they live in one place rather than being written again
 * per surface.
 */
const props = withDefaults(
  defineProps<{
    /** The draft. */
    modelValue?: string;
    /** Files queued for this message. */
    attachments?: File[];
    /** A reply is arriving: the send button becomes a stop button. */
    busy?: boolean;
    /** Nothing can be typed or attached. Say why through `placeholder`. */
    disabled?: boolean;
    placeholder?: string;
    /** Mirror whatever the receiving endpoint enforces. */
    maxLength?: number;
    /** A shorter box, for a floating panel rather than a page. */
    compact?: boolean;
    /** Offer the attachment menu at all. */
    attachable?: boolean;
    /**
     * Own the drop zone.
     *
     * The composer is a three-line strip at the bottom of a conversation, so a
     * surface that wants the whole panel to accept a drop turns this off, calls
     * `useFileDrop` on its own container and forwards what it catches to
     * `acceptFiles`. Two zones would otherwise both fire on a drop over the box.
     */
    dropZone?: boolean;
    /** MIME types the receiver can read. */
    accept?: string[];
    maxFiles?: number;
    maxFileBytes?: number;
    /**
     * Whether a bare Enter sends. `"auto"` sends on a pointer and inserts a
     * newline on a touch screen, where the send button is the send key and a
     * stray Enter used to fire half-written messages. Cmd/Ctrl+Enter always
     * sends.
     */
    enterToSend?: boolean | "auto";
    class?: HTMLAttributes["class"];
  }>(),
  {
    modelValue: "",
    busy: false,
    disabled: false,
    placeholder: "Ask anything",
    maxLength: 10000,
    compact: false,
    attachable: true,
    dropZone: true,
    maxFiles: MAX_CHAT_ATTACHMENTS,
    maxFileBytes: MAX_CHAT_ATTACHMENT_BYTES,
    enterToSend: "auto",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:attachments": [files: File[]];
  /** The message is ready. The text is trimmed; the files are in `attachments`. */
  submit: [text: string];
  /** The stop button, only reachable while `busy`. */
  stop: [];
  /**
   * A file was refused, with the reason in the host's own words to show. The
   * component does not raise a toast itself: where a message belongs on screen
   * is the host's decision.
   */
  reject: [reason: string];
  /**
   * Someone is typing. Throttled to once every two seconds while keys are
   * pressed, so a host can forward it as a presence whisper without adding
   * its own timer.
   */
  typing: [];
}>();

const accepted = computed(() => props.accept ?? CHAT_ATTACHMENT_MIMES);
const files = computed(() => props.attachments ?? []);

const fileInput = useTemplateRef<HTMLInputElement>("fileInput");
const textarea = useTemplateRef<any>("textarea");

const text = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const isNearLimit = computed(() => text.value.length > props.maxLength * 0.9);

const canSend = computed(
  () => !props.disabled && (Boolean(text.value.trim()) || files.value.length > 0)
);

/** Locked while a reply is arriving as well as when the surface is read-only. */
const locked = computed(() => props.disabled || props.busy);

/**
 * A coarse pointer is a finger. There, Enter is the only way to get a new
 * line, and the software keyboard has no modifier to make it a send key.
 */
const isCoarsePointer = useMediaQuery("(pointer: coarse)");

const sendsOnEnter = computed(() =>
  props.enterToSend === "auto" ? !isCoarsePointer.value : props.enterToSend
);

function pickFiles() {
  fileInput.value?.click();
}

function megabytes(bytes: number) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

/**
 * The MIME type to judge a file by.
 *
 * A file dragged in from some Windows and Linux file managers arrives with an
 * empty `type`, so it was refused as "not an accepted file type" even when it
 * was a plain PDF. The extension settles it; the server still sniffs the bytes.
 */
function typeOf(file: File) {
  if (file.type) return file.type;

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  return EXTENSION_MIMES[extension] ?? "";
}

function sameFile(a: File, b: File) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

/**
 * One entry point for every source of files: the picker, a paste, a drop.
 *
 * Rejections are reported rather than silently dropped - a file that vanishes
 * with no explanation reads as a broken control.
 */
function acceptFiles(incoming: File[]) {
  if (!incoming.length || props.disabled) return;

  const next = [...files.value];

  for (const file of incoming) {
    if (next.length >= props.maxFiles) {
      emit("reject", `Up to ${props.maxFiles} files per message.`);
      break;
    }
    if (next.some((queued) => sameFile(queued, file))) {
      emit("reject", `${file.name} is already attached.`);
      continue;
    }
    if (!accepted.value.includes(typeOf(file))) {
      emit("reject", `${file.name} is not an accepted file type.`);
      continue;
    }
    if (file.size > props.maxFileBytes) {
      emit("reject", `${file.name} is larger than ${megabytes(props.maxFileBytes)} MB.`);
      continue;
    }
    next.push(file);
  }

  if (next.length !== files.value.length) emit("update:attachments", next);
}

function removeAt(index: number) {
  emit(
    "update:attachments",
    files.value.filter((_, i) => i !== index)
  );
}

function onFilesPicked(event: Event) {
  const target = event.target as HTMLInputElement;

  acceptFiles(Array.from(target.files ?? []));

  // Cleared so picking the same file twice in a row still fires `change`.
  target.value = "";
}

/**
 * Paste. A screenshot on the clipboard arrives as a file with no text
 * alternative, so it would otherwise land nowhere; a copied file from a file
 * manager behaves the same. Text pastes are left to the textarea untouched,
 * which is why the default is only prevented when files are actually present.
 */
function onPaste(event: ClipboardEvent) {
  if (locked.value || !props.attachable) return;

  const dropped = Array.from(event.clipboardData?.files ?? []);
  if (!dropped.length) return;

  event.preventDefault();
  acceptFiles(dropped);
}

/**
 * Drag and drop, on the form unless the host took the zone over.
 *
 * The counter behind `isDraggingFiles` lives in `useFileDrop`; see there for
 * why a boolean is not enough.
 */
const form = useTemplateRef<HTMLFormElement>("form");
const { isDraggingFiles } = useFileDrop(form, {
  disabled: () => locked.value || !props.attachable || !props.dropZone,
  onDrop: acceptFiles,
});

function onSubmit() {
  if (props.busy) {
    emit("stop");
    return;
  }

  if (!canSend.value) return;

  const value = text.value.trim();
  emit("update:modelValue", "");
  emit("submit", value);

  // The button took the focus when it was clicked; the next message starts in
  // the box, not with a click back into it.
  focus();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.isComposing) return;

  const withModifier = event.metaKey || event.ctrlKey;
  if (!withModifier && (event.shiftKey || !sendsOnEnter.value)) return;

  event.preventDefault();

  // Enter while a reply is arriving used to stop it and leave whatever had been
  // typed sitting in the box, unsent. Stopping is what the button is for.
  if (props.busy) return;

  onSubmit();
}

const emitTyping = useThrottleFn(() => emit("typing"), 2000);

watch(text, (value, previous) => {
  if (value && value !== previous && !locked.value) emitTyping();
});

/** Lets a surface put the cursor here when it opens. */
function focus() {
  nextTick(() => {
    // The ref is a component, whose root element is the textarea itself.
    const el = (textarea.value?.$el ?? textarea.value) as HTMLTextAreaElement | undefined;
    el?.focus?.();
  });
}

defineExpose({ focus, acceptFiles });
</script>

<template>
  <form
    ref="form"
    data-slot="chat-composer"
    :class="cn('w-full space-y-2', props.class)"
    @submit.prevent="onSubmit"
  >
    <ChatAttachments :files="files" :disabled="locked" @remove="removeAt" />

    <InputGroup class="cn-input-group-variant-chat">
      <InputGroupTextarea
        ref="textarea"
        v-model="text"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :disabled="disabled"
        :class="compact ? 'max-h-40 min-h-12' : 'max-h-[40svh] min-h-16'"
        @keydown="onKeydown"
        @paste="onPaste"
      />
      <InputGroupAddon align="block-end">
        <DropdownMenu v-if="attachable">
          <DropdownMenuTrigger as-child>
            <InputGroupButton
              v-tippy="'Add attachment'"
              aria-label="Add attachment"
              type="button"
              size="icon-sm"
              variant="outline"
              :disabled="locked"
            >
              <Icon name="hugeicons:add-01" />
            </InputGroupButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" :side-offset="10" class="w-56">
            <DropdownMenuItem @select="pickFiles">
              <Icon name="hugeicons:attachment-01" />
              Add photos &amp; files
            </DropdownMenuItem>
            <slot name="menu" />
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Controls the host owns: a mode toggle, saved replies, anything that
             belongs beside the message rather than inside it. -->
        <slot name="actions" :disabled="locked" />

        <span
          v-if="isNearLimit"
          class="text-muted-foreground text-sm tracking-tight tabular-nums"
        >
          {{ text.length }} / {{ maxLength }}
        </span>

        <InputGroupButton
          v-tippy="busy ? 'Stop' : 'Send'"
          type="submit"
          variant="default"
          size="icon-sm"
          class="ml-auto"
          :disabled="!busy && !canSend"
        >
          <Icon :name="busy ? 'hugeicons:stop' : 'hugeicons:arrow-up-02'" />
          <span class="sr-only">{{ busy ? "Stop" : "Send" }}</span>
        </InputGroupButton>
      </InputGroupAddon>

      <!-- Drop target. A child of the group, not a sibling: `rounded-[inherit]`
           then picks up whichever radius the active style gave the box, and
           `pointer-events-none` keeps the drop itself going to the form - an
           overlay that swallowed pointer events would eat the file. -->
      <div
        v-if="isDraggingFiles"
        class="border-ring bg-background/85 text-muted-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-[inherit] border-2 border-dashed text-sm tracking-tight backdrop-blur-xs"
      >
        <Icon name="hugeicons:attachment-01" />
        Drop to attach
      </div>
    </InputGroup>

    <!-- Owned by the + menu; never focusable in its own right. -->
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      :accept="accepted.join(',')"
      @change="onFilesPicked"
    />
  </form>
</template>
