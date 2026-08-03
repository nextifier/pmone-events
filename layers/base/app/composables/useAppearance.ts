import { computed } from "vue";
import { DEFAULT_STYLE } from "@/lib/appearance";

/**
 * Single source of truth for color mode + the shadcn "Style" (mono/vega/…) on
 * the public event sites. SSR-rendered so the first painted frame is already
 * correct (no flash, no hydration mismatch). NO backend, and NO design-token UI
 * here — per-project brand tokens are injected by `plugins/appearance.ts`
 * (app.config) / app.css, so this composable only owns: color mode, the active
 * Style `<body class="style-X">`, and the theme-color meta. (The full
 * token-capable variant lives only in the pmone admin.)
 *
 * The Style is baked at build time by `modules/appearance-style.ts` from the
 * app's `appearance: { style }` nuxt.config knob — only that one `style-X.css`
 * is bundled, so it is deliberately NOT switchable at runtime here. Runtime
 * switching needs all 9 sheets in the bundle, which is the pmone admin's job.
 */
export function useAppearance() {
  const colorMode = useColorMode();
  const appConfig = useAppConfig();

  const style = computed(() => appConfig.appearance?.style ?? DEFAULT_STYLE);

  const setColorMode = (mode: string) => {
    colorMode.preference = mode;
  };
  // Kept so `useStyleClass()` stays API-compatible with pmone (components/ui
  // must remain byte-identical across repos); a no-op for the reason above.
  const setStyle = (name: string) => {
    if (import.meta.dev && name !== style.value) {
      console.warn(
        `[appearance] Ignoring setStyle("${name}"): the event sites bundle only "${style.value}". Change apps/<app>/nuxt.config.ts → appearance: { style }.`,
      );
    }
  };

  const headRegistered = useState("appearance:head", () => false);
  if (!headRegistered.value) {
    headRegistered.value = true;
    useHead({
      bodyAttrs: { class: computed(() => `style-${style.value}`) },
      meta: [
        {
          name: "theme-color",
          content: computed(() =>
            colorMode.value === "light" ? "#ffffff" : "#09090b",
          ),
        },
      ],
    });
  }

  return { colorMode, setColorMode, style, setStyle };
}
