import { computed } from "vue";
import { DEFAULT_STYLE, STYLE_NAMES } from "@/lib/appearance";

/** The persisted Style selection (short name only). */
interface AppearanceCookie {
  style?: string;
}

const STYLE_SET = STYLE_NAMES as readonly string[];

/**
 * Single source of truth for color mode + the shadcn "Style" (mono/vega/…) on
 * the public event sites. Cookie-backed + SSR-rendered so the first painted
 * frame is already correct (no flash, no hydration mismatch). NO backend, and
 * NO design-token UI here — per-project brand tokens are injected by
 * `plugins/appearance.ts` (app.config) / app.css, so this composable only owns:
 * color mode, the active Style `<body class="style-X">`, and the theme-color
 * meta. (The full token-capable variant lives only in the pmone admin.)
 */
export function useAppearance() {
  const colorMode = useColorMode();

  const cookie = useCookie<AppearanceCookie | null>("events-appearance", {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const style = computed(() => {
    const s = cookie.value?.style;
    return s && STYLE_SET.includes(s) ? s : DEFAULT_STYLE;
  });

  const setColorMode = (mode: string) => {
    colorMode.preference = mode;
  };
  const setStyle = (name: string) => {
    cookie.value = { ...(cookie.value || {}), style: name };
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
