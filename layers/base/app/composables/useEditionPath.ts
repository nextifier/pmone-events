// Nav paths that have a per-edition variant (`/[edition]/brands`,
// `/[edition]/rundown`). When the user is browsing a specific (non-active)
// edition, links to these sections keep the edition context instead of jumping
// back to the active event.
const EDITIONABLE_PATHS = ["/brands", "/rundown"];

/**
 * Returns a path resolver for nav links that:
 *  - leaves external (`http`) links untouched,
 *  - prefixes the current edition for editionable paths when viewing a past
 *    edition (e.g. on `/25/brands`, the Rundown link resolves to `/25/rundown`),
 *  - otherwise resolves through `localePath` exactly like before.
 *
 * `route.params.edition` is only set on the `/[edition]/...` pages (the active
 * edition uses the unprefixed paths), so there is no ambiguity.
 */
export function useEditionPath() {
  const route = useRoute();
  const localePath = useLocalePath();

  return (path: string) => {
    if (!path) return path;
    if (path.startsWith("http")) return path;

    const edition = route.params.edition;
    if (edition && EDITIONABLE_PATHS.includes(path)) {
      return localePath(`/${edition}${path}`);
    }
    return localePath(path);
  };
}
