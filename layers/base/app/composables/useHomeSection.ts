/**
 * Generic home-page section visibility. Reads the `home_sections` map from the
 * public website-settings payload so any section can be shown/hidden from the
 * PM One admin (Website Settings -> Home Page). The per-section visibility
 * composables (rundown/brand-preview/hotel/credits) delegate here.
 *
 * The toggle itself is always read from the SSR-resolved project settings
 * (the `project-settings` payload the projectSettings plugin awaits during SSR,
 * read via useNuxtData so it resolves in component setups - a captured
 * useProjectSettingsData().data ref stayed null there). So the visibility
 * decision is made server-side and a toggled-on section is present in the
 * server-rendered HTML (crawlable, no post-hydration pop-in), provided any
 * content `guard` also resolves server-side.
 *
 * `defaultVisible` only controls the fail direction:
 * - defaultVisible: true — renders by default, hidden only when explicitly
 *   toggled off; fails OPEN (a missing key or an API outage keeps it visible).
 * - defaultVisible: false (default) — hidden unless explicitly turned on; fails
 *   CLOSED (a missing key or outage keeps it hidden).
 *
 * `?show-<key>=true` (or an explicit `forceParam`) force-shows the section for
 * QA regardless of the toggle — see useForceShow. An optional content `guard`
 * keeps a section hidden when it has no data even if the toggle is on (e.g.
 * brands need >10 logos, rundown needs >=1 item); the force param overrides it.
 * A guard backed by a client-only fetch still defers the section to the client
 * even though the toggle is now SSR-resolved.
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

  const { data } = useNuxtData("project-settings");

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
