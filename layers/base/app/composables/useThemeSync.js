import { useAppearance } from "@/composables/useAppearance";

/**
 * Thin shim → the unified {@link useAppearance} gate. Kept so existing callers
 * (and the byte-identical-across-repos `components/ui`: ColorModeToggle /
 * ColorModeButtons) work unchanged while color-mode storage and the reactive
 * theme-color meta live in one place. `updateMetaThemeColor` is a no-op now
 * (handled reactively + SSR by useAppearance).
 */
export function useThemeSync() {
  const a = useAppearance();
  return {
    colorMode: a.colorMode,
    setTheme: a.setColorMode,
    updateMetaThemeColor: () => {},
  };
}
