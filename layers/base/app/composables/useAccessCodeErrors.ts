/**
 * i18n key for an access code refusal, e.g. `tickets.access.errors.EXPIRED`.
 * Codes mirror App\DTOs\Ticketing\AccessCodeValidation on PM One, plus
 * TOO_MANY_ATTEMPTS from the validate endpoint's lockout.
 */
export const accessErrorKey = (code?: string | null): string =>
  code ? `tickets.access.errors.${code}` : "";

/**
 * The PM One body behind a failed `$fetch` to one of the ticket proxies.
 *
 * The Nitro route rethrows with the upstream body under `data`, and the validate
 * endpoint wraps its own payload in `data` once more, so the error code sits a
 * level deeper there than on the order endpoint. Reading one level too shallow
 * is why every refusal used to show the generic "Could not apply" text.
 */
export function accessErrorPayload(err: any): { error_code?: string; message?: string } {
  const upstream = err?.data?.data ?? err?.data ?? {};
  return upstream?.data?.error_code ? upstream.data : upstream;
}

/**
 * Translate an access code error code, falling back to the server's own message
 * and then to the generic line, so an unmapped code never renders a key path.
 */
export const useAccessCodeErrors = () => {
  const { t, te } = useI18n();

  return (code?: string | null, fallback?: string | null): string => {
    const key = accessErrorKey(code);
    if (key && te(key)) return t(key);
    return fallback || t("tickets.accessInvalid");
  };
};
