/**
 * Narrows the header's language switcher for pages whose content only exists in
 * some of the site's languages. A public form carries whichever translations its
 * fields were authored in, which is rarely all five, and offering the rest would
 * just render the English fallback under another flag.
 *
 * `null` (the default) means "no restriction, offer every configured locale".
 * A page that sets this MUST clear it on unmount, otherwise the next page
 * inherits a scope that has nothing to do with it.
 */
export const useLocaleScope = () => useState<string[] | null>("locale-scope", () => null);
