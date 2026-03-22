// Fix: h3 decodes %3F (encoded ?) in OG image URL path to literal ?,
// splitting the path incorrectly and losing title/description props.
// This hook re-parses the raw URL to extract correct component props.

const PARAM_ALIASES: Record<string, string> = {
  c: "component",
  w: "width",
  h: "height",
  em: "emojis",
  k: "key",
  a: "alt",
  u: "url",
  p: "_path",
  q: "_query",
  cache: "cacheMaxAgeSeconds",
};

const OPTION_KEYS = new Set([
  "component",
  "width",
  "height",
  "key",
  "alt",
  "url",
  "_path",
  "_query",
  "emojis",
  "renderer",
  "extension",
  "cacheMaxAgeSeconds",
  "cacheKey",
  "_hash",
]);

const RE_COMMA_PARAM = /,(?=\w+_)/;
const RE_FIRST_UNDERSCORE = /(?<!_)_(?!_)/;

function decodeValue(raw: string): string {
  if (raw.startsWith("~")) {
    try {
      // Base64-encoded value
      const standard = raw
        .slice(1)
        .replace(/-/g, "+")
        .replace(/~/g, "/");
      const padded = standard + "=".repeat((4 - (standard.length % 4)) % 4);
      if (typeof atob === "function") {
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      }
      return Buffer.from(padded, "base64").toString("utf8");
    } catch {
      return decodeURIComponent(raw.replace(/\+/g, "%20")).replace(/__/g, "_");
    }
  }
  return decodeURIComponent(raw.replace(/\+/g, "%20")).replace(/__/g, "_");
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("nuxt-og-image:context" as any, (ctx: any) => {
    // Get raw URL before h3 decoding
    const rawUrl: string = ctx.e?.node?.req?.url || "";
    if (!rawUrl.includes("/_og/")) return;

    // Extract the encoded segment from raw URL
    const ogMatch = rawUrl.match(
      /\/_og\/[ds]\/(.+?)\.(?:png|jpe?g|webp|svg|html|json)(?:\?|$)/
    );
    if (!ogMatch) return;

    const encodedSegment = ogMatch[1];
    const parts = encodedSegment.split(RE_COMMA_PARAM);

    // Parse component props from raw URL
    const componentProps: Record<string, string> = {};
    for (const part of parts) {
      const idx = part.search(RE_FIRST_UNDERSCORE);
      if (idx === -1) continue;

      const alias = part.slice(0, idx);
      const rawValue = part.slice(idx + 1);
      const paramName = PARAM_ALIASES[alias] || alias;

      // Skip known options - only collect component props
      if (OPTION_KEYS.has(paramName)) continue;

      componentProps[paramName] = decodeValue(rawValue);
    }

    // Override props with correctly parsed values
    if (Object.keys(componentProps).length > 0) {
      ctx.options.props = componentProps;
    }
  });
});
