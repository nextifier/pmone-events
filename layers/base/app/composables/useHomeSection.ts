/**
 * Generic home-page section visibility. Reads the `home_sections` map from the
 * public website-settings payload so any section can be shown/hidden from the
 * PM One admin (Website Settings -> Home Page). The per-section visibility
 * composables (rundown/brand-preview/hotel/credits) delegate here.
 *
 * Two modes, picked by `defaultVisible`:
 *
 * - defaultVisible: false (default) — the section is off unless explicitly
 *   turned on. Uses a `server: false` + `lazy: true` fetch, so SSR and initial
 *   hydration see `visible = false` and the section renders only after the
 *   client fetch resolves. This is the original behaviour of the four shipped
 *   toggles: hidden sections are never SSR-rendered, no hydration mismatch.
 *
 * - defaultVisible: true — the section renders by default and is only hidden
 *   when explicitly toggled off. Reads the SSR-resolved settings
 *   (useProjectSettingsData, `server: true`, awaited by the projectSettings
 *   plugin) so the section renders server-side with no flash/layout shift, and
 *   fails OPEN: a missing key or an API outage keeps the section visible.
 *
 * `?show-<key>=true` (or an explicit `forceParam`) force-shows the section for
 * QA regardless of the toggle — see useForceShow. An optional content `guard`
 * keeps a section hidden when it has no data even if the toggle is on (e.g.
 * brands need >10 logos, rundown needs >=1 item); the force param overrides it.
 */
export function useHomeSection(
  key: string,
  options?: {
    forceParam?: string;
    guard?: MaybeRefOrGetter<boolean>;
    defaultVisible?: boolean;
  },
) {
  const defaultVisible = options?.defaultVisible ?? false;
  const forced = useForceShow(options?.forceParam ?? `show-${key}`);

  const { locale } = useI18n();

  // Default-on sections share the SSR-resolved project settings (read via
  // useNuxtData so the awaited `project-settings` payload resolves in component
  // setups - a captured useProjectSettingsData().data ref stayed null there);
  // default-off sections use their own lazy client fetch (deduped by matching
  // url + query).
  const { data } = defaultVisible
    ? useNuxtData("project-settings")
    : useFetch<{
        data?: { settings?: { home_sections?: Record<string, boolean> } };
      }>("/api/event/website-settings", {
        query: { locale },
        server: false,
        lazy: true,
        watch: [locale],
      });

  const stored = computed(
    () => data.value?.data?.settings?.home_sections?.[key],
  );

  // Fail open when default-on (visible unless explicitly false), fail closed
  // otherwise (hidden unless explicitly true).
  const enabled = computed(() =>
    defaultVisible ? stored.value !== false : stored.value === true,
  );

  const guardOk = computed(() =>
    options?.guard != null ? toValue(options.guard) : true,
  );

  const visible = computed(
    () => forced.value || (enabled.value && guardOk.value),
  );

  return { visible };
}
