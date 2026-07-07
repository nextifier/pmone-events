/**
 * The project's Instagram profile URL from PM One social links, or "" when the
 * project has none. Used by empty-state CTAs across the site.
 */
export function useInstagramUrl() {
  const profile = useProjectProfile();
  return computed(
    () =>
      profile.socialLinks.find((l) => l.label.toLowerCase() === "instagram")
        ?.path || "",
  );
}
