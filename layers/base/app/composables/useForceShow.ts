/**
 * Lets a home-page section be force-shown for previewing/QA via a URL query
 * param, independent of the project's Website Settings toggle.
 *
 * Example: visiting `/?show-hotel=true` renders the Hotels section even when
 * the project setting is off — handy for checking a section privately before
 * enabling it for every visitor.
 *
 * Truthy: `?show-hotel=true`, `?show-hotel=1`, or a bare `?show-hotel`.
 * `false` / `0` (or an absent param) are treated as not forced.
 *
 * Reads from `route.query`, which is identical on server and client, so it
 * stays hydration-safe even though section visibility is otherwise resolved
 * client-side.
 */
export function useForceShow(param: string) {
  const route = useRoute();

  return computed(() => {
    const raw = route.query[param];
    if (raw === undefined) {
      return false;
    }
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value === "" || value === "true" || value === "1";
  });
}
