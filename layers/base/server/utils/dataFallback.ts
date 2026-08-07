/**
 * `?fallback=0|1` for the PM One public endpoints, read from this app's
 * `app.config.settings.dataFallback`.
 *
 * When an active event has no content of its own the API may borrow the most
 * recent previous edition's. Whether it should is an editorial decision per
 * site, so it lives in app.config and is resolved HERE rather than travelling
 * from the browser — the value is constant for a deployment, which also means
 * the handlers' cache keys do not need a variant for it.
 *
 * The brand LISTING is the exception: `/api/exhibitors` serves both the
 * home-page teaser (which may borrow) and the full /brands listing (which must
 * never), so that flag is passed per call site instead. Brand DETAIL resolves it
 * here, because it has to agree with whatever the teaser did.
 */
type FallbackSection =
  | "brands"
  | "guests"
  | "partners"
  | "mediaCoverages"
  | "programs"
  | "faqs"
  | "gallery";

export function dataFallbackFlag(section: FallbackSection): 0 | 1 {
  const settings = useAppConfig().settings as {
    dataFallback?: Record<string, boolean>;
  };

  return settings?.dataFallback?.[section] === false ? 0 : 1;
}
