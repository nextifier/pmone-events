/**
 * Company identity (name + address) shown in the footer and legal pages, from
 * each app's `app.config.app.company`. Falls back to the site name so a legal
 * page never renders a blank company.
 */
export function useCompanyIdentity() {
  const appConfig = useAppConfig();

  const companyName = computed<string>(
    () => appConfig.app?.company?.name || appConfig.app?.name || "",
  );

  const companyAddress = computed<string>(
    () => appConfig.app?.company?.address || "",
  );

  return { companyName, companyAddress };
}
