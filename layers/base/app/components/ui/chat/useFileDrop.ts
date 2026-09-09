import type { ComputedRef, MaybeRefOrGetter } from "vue"
import { computed, ref, toValue } from "vue"
import { useEventListener } from "@vueuse/core"

/**
 * Turn any element into a drop zone for files.
 *
 * This lived inside `ChatComposer`, which made the drop zone exactly as tall as
 * the box someone types into - a three-line strip at the bottom of a
 * conversation. Dropping a file on the transcript, which is where a reader's
 * pointer already is, did nothing. Pulling it out lets a surface hand the whole
 * panel to the reader while the composer keeps owning what a file has to
 * satisfy.
 *
 * The counter is the part worth keeping: `dragenter` and `dragleave` fire for
 * every child the pointer crosses, so a boolean flickers as the cursor moves
 * over a textarea or a button inside the zone.
 */
export interface UseFileDropOptions {
  /** Files that passed the browser's own drag check. Validate them yourself. */
  onDrop: (files: File[]) => void
  /** While true the zone ignores every drag. */
  disabled?: MaybeRefOrGetter<boolean>
}

export interface UseFileDrop {
  /** True while a drag carrying files is over the zone. Drive the overlay with it. */
  isDraggingFiles: ComputedRef<boolean>
}

function carriesFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files")
}

export function useFileDrop(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UseFileDropOptions
): UseFileDrop {
  const depth = ref(0)
  const isDraggingFiles = computed(() => depth.value > 0)
  const isDisabled = () => Boolean(toValue(options.disabled))

  function reset() {
    depth.value = 0
  }

  useEventListener(target, "dragenter", (event: DragEvent) => {
    if (isDisabled() || !carriesFiles(event)) return
    depth.value++
  })

  useEventListener(target, "dragover", (event: DragEvent) => {
    if (!isDraggingFiles.value) return
    // Without this the browser navigates to the dropped file instead.
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy"
  })

  useEventListener(target, "dragleave", () => {
    if (depth.value > 0) depth.value--
  })

  useEventListener(target, "drop", (event: DragEvent) => {
    reset()
    if (isDisabled() || !carriesFiles(event)) return

    event.preventDefault()
    options.onDrop(Array.from(event.dataTransfer?.files ?? []))
  })

  // A drag that leaves the window, or ends over something else, never sends
  // `dragleave` to the elements it crossed on the way in. The counter then stays
  // above zero and the overlay sits there until the next drag.
  useEventListener(window, "dragend", reset)
  useEventListener(document, "drop", reset)
  useEventListener(document, "dragleave", (event: DragEvent) => {
    if (!event.relatedTarget) reset()
  })

  return { isDraggingFiles }
}
