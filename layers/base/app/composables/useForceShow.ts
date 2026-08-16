/**
 * Lets a section be force-shown for previewing/QA via a URL query param,
 * independent of the project's Website Settings toggle or the event's own
 * visibility switch.
 *
 * Example: visiting `/?show-hotel=true` renders the Hotels section even when
 * the project setting is off — handy for checking a section privately before
 * enabling it for every visitor.
 *
 * Truthy: `?show-hotel`, `?show-hotel=`, `?show-hotel=1`, `?show-hotel=true`
 * (any case). `false` / `0` / any other value, or an absent param, are treated
 * as not forced.
 *
 * The valueless form is the one that used to break: vue-router parses
 * `?show-hotel` to `null`, NOT to the empty string, so a check for `""` alone
 * silently rejected the shortest and most-typed spelling.
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

    // Present with no value at all: `?show-hotel` (null) or `?show-hotel=` ("").
    if (value === null || value === "") {
      return true;
    }

    const normalized = String(value).trim().toLowerCase();

    return normalized === "true" || normalized === "1";
  });
}
