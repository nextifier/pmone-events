import { useAppearance } from "@/composables/useAppearance";

/**
 * Thin shim → the unified {@link useAppearance} gate. Kept so `components/ui`
 * stays byte-identical across repos while the `<body class="style-X">` injection
 * lives in one place.
 */
export function useStyleClass() {
  const a = useAppearance();
  return { current: a.style, setStyle: a.setStyle };
}
