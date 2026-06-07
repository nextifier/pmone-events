/**
 * Maps a guest from the PM One public API (/api/event/guests) into the exact
 * shape the existing Guest components on this site expect. Only the data source
 * moved (hardcoded list -> PM One); the display is unchanged.
 */
function socialFromLinks(links) {
  const social = {};
  for (const link of links || []) {
    const url = link?.url || "";
    if (link?.label === "Instagram") {
      social.instagram = url
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .replace(/\/+$/, "");
    } else if (link?.label === "Facebook") {
      social.facebook = url
        .replace(/^https?:\/\/(www\.)?facebook\.com\//i, "")
        .replace(/\/+$/, "");
    } else if (link?.label === "Website") {
      social.website = url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    }
  }
  return social;
}

export function mapGuestFromApi(guest) {
  const image = guest?.profile_image || {};
  return {
    name: guest.name,
    slug: guest.slug,
    photos: [image.xl || image.lg || image.md || image.original].filter(Boolean),
    categories: guest.title ? [guest.title] : [],
    appearanceDate: guest.appearance_date || null,
    transparentBackground: guest.transparent_background ?? false,
    description: guest.bio || "",
    social: socialFromLinks(guest.links),
    isPublished: true,
  };
}
