/**
 * Company identity (name + address) shown in the footer and legal pages.
 * Sourced from the dashboard-managed `site_config.identity` (PM One plan 011),
 * with the baked `app.config.app.company` values as the fail-open fallback per
 * the site-config contract - never renders empty when the dashboard is unset
 * or the API is unavailable.
 */
export function useCompanyIdentity() {
  const siteConfig = useProjectSiteConfig();
  const appConfig = useAppConfig();

  const companyName = computed<string>(
    () =>
      (siteConfig.identity as { company_name?: string } | null)?.company_name ||
      appConfig.app?.company?.name ||
      appConfig.app?.name ||
      "",
  );

  const companyAddress = computed<string>(
    () =>
      (siteConfig.identity as { company_address?: string } | null)
        ?.company_address ||
      appConfig.app?.company?.address ||
      "",
  );

  return { companyName, companyAddress };
}
