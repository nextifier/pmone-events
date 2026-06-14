/**
 * Project contact/social data sourced from PM One (`/api/project/profile` ->
 * ProjectResource) instead of hardcoded app.config. Derives social-media links
 * and contact links from the project's `links[]` (by label), mirroring the
 * parsing already used on the `/links` page.
 *
 * Returns a reactive object so consumers access `profile.socialLinks`,
 * `profile.contactLinks`, etc. SSR-shared by fetch key.
 */

const SOCIAL_LABELS = ["instagram", "facebook", "x", "tiktok", "linkedin", "youtube"];

const SOCIAL_ICON_MAP = {
  instagram: "hugeicons:instagram",
  facebook: "hugeicons:facebook-01",
  x: "hugeicons:new-twitter-rectangle",
  tiktok: "hugeicons:tiktok",
  linkedin: "hugeicons:linkedin-01",
  youtube: "hugeicons:youtube",
};

export function useProjectProfile() {
  const { data } = useFetch("/api/project/profile", {
    key: "project-profile",
    server: true,
    default: () => null,
  });

  const profile = () => data.value?.data ?? null;
  const links = () => profile()?.links ?? [];
  const whatsappLink = () =>
    links().find((l) => l?.label?.toLowerCase().startsWith("whatsapp")) ?? null;
  const whatsappByLabel = (label) =>
    links().find((l) => l?.label?.toLowerCase() === label) ?? null;
  // "WhatsApp Sales" is the general contact; fall back to any whatsapp link.
  const salesLink = () => whatsappByLabel("whatsapp sales") ?? whatsappLink();
  // "WhatsApp Marketing" is used by sponsorship/media-partner CTAs; fall back to sales.
  const marketingLink = () => whatsappByLabel("whatsapp marketing") ?? salesLink();
  const digits = (url) => (url ?? "").replace(/\D/g, "");

  return reactive({
    get _raw() {
      return profile();
    },
    get name() {
      return profile()?.name ?? "";
    },
    get email() {
      return profile()?.email ?? "";
    },
    get phone() {
      return profile()?.phone ?? [];
    },
    get socialLinks() {
      return links()
        .filter((l) => l?.label && SOCIAL_LABELS.includes(l.label.toLowerCase()))
        .map((l) => ({
          label: l.label,
          path: l.url,
          iconName: SOCIAL_ICON_MAP[l.label.toLowerCase()] || "hugeicons:link-02",
        }));
    },
    get whatsapp() {
      return salesLink()?.url ?? "";
    },
    get whatsappNumber() {
      return digits(salesLink()?.url);
    },
    get whatsappMarketing() {
      return marketingLink()?.url ?? "";
    },
    get whatsappMarketingNumber() {
      return digits(marketingLink()?.url);
    },
    get contactLinks() {
      const out = {};
      const email = profile()?.email;
      if (email) {
        out.email = { label: "Email", path: `mailto:${email}` };
      }
      const wa = whatsappLink();
      if (wa) {
        out.whatsapp = { label: "WhatsApp", path: wa.url };
      }
      return out;
    },
  });
}
