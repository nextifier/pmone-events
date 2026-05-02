import type { RouterConfig } from "@nuxt/schema";

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const stripLocale = (name: unknown) =>
      typeof name === "string" ? name.split("___")[0] : "";

    if (
      to.name &&
      from.name &&
      stripLocale(to.name) === stripLocale(from.name) &&
      to.path !== from.path
    ) {
      return false;
    }

    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
};
