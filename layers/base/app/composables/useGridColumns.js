import { ref, onMounted, onBeforeUnmount, unref, toValue, watch } from "vue";

/**
 * Hitung jumlah kolom responsif untuk grid brand, meniru perilaku GridFill:
 * - di bawah breakpoint `sm` (640px) -> `baseCols` kolom (default 2)
 * - di atasnya -> auto-fit minmax(minColWidth, 1fr) ~ floor((w + gap) / (minColWidth + gap))
 *
 * Dipakai BrandVirtualList untuk meng-chunk brand jadi baris saat virtualization,
 * tanpa mengubah komponen GridFill yang dipakai event lain.
 */
export const useGridColumns = (containerRef, options = {}) => {
  const {
    minColWidth = 260,
    gap = 1,
    baseCols = 2,
    smBreakpoint = 640,
  } = options;

  const columnCount = ref(baseCols);
  let ro = null;

  const measure = () => {
    const el = unref(containerRef);
    if (!el) return;
    const w = el.clientWidth;
    if (!w) return;
    const mcw = toValue(minColWidth);
    const g = toValue(gap);
    const cols =
      w < smBreakpoint
        ? baseCols
        : Math.max(1, Math.floor((w + g) / (mcw + g)));
    if (cols !== columnCount.value) columnCount.value = cols;
  };

  onMounted(() => {
    measure();
    const el = unref(containerRef);
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
  });

  // Opsi bisa reaktif (mis. minColWidth/gap berubah saat variant grid<->card):
  // hitung ulang kolom tanpa perlu remount.
  watch([() => toValue(minColWidth), () => toValue(gap)], measure);

  onBeforeUnmount(() => {
    ro?.disconnect();
    ro = null;
  });

  return { columnCount, measure };
};
