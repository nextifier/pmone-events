/**
 * Centralized theme synchronization composable
 * Handles instant UI updates + meta theme-color sync.
 * pmone-events (public site) tidak punya auth, jadi backend sync dihilangkan.
 */
export function useThemeSync() {
  const colorMode = useColorMode();

  const updateMetaThemeColor = () => {
    if (typeof document === "undefined") return;

    const currentColorMode = localStorage.getItem("color-mode") || "dark";
    const themeColor = currentColorMode === "light" ? "#ffffff" : "#09090b";

    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) {
      meta.setAttribute("content", themeColor);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "theme-color";
      newMeta.content = themeColor;
      document.head.appendChild(newMeta);
    }
  };

  const setTheme = (theme) => {
    colorMode.preference = theme;
    nextTick(() => {
      updateMetaThemeColor();
    });
  };

  onMounted(() => {
    updateMetaThemeColor();
    watch(
      () => colorMode.value,
      () => {
        nextTick(() => {
          updateMetaThemeColor();
        });
      }
    );
  });

  return {
    colorMode,
    setTheme,
    updateMetaThemeColor,
  };
}
