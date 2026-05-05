export default defineEventHandler(() => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const key = config.pmOneApiKey || "";
  const username =
    (appConfig as any).app?.dataSourceUsername ||
    (appConfig as any).app?.projectUsername ||
    "(none)";
  return {
    keyFingerprint: key
      ? `${key.slice(0, 6)}…${key.slice(-4)}`
      : "EMPTY",
    keyLength: key.length,
    apiUrl: config.public.apiUrl,
    username,
    siteUrl: config.public.siteUrl,
    nodeEnv: process.env.NODE_ENV ?? "(unset)",
    hasEnvVar:
      typeof process.env.NUXT_PM_ONE_API_KEY === "string" &&
      process.env.NUXT_PM_ONE_API_KEY.length > 0,
    envKeyLengthAtRuntime: (process.env.NUXT_PM_ONE_API_KEY || "").length,
  };
});
