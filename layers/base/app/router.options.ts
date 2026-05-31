import type { RouterConfig } from "@nuxt/schema";

// Tunggu sampai dokumen cukup tinggi untuk menghormati posisi scroll yang
// disimpan. Listing yang client-only + virtualized (mis. /brands) mulai dengan
// tinggi nyaris 0 lalu mengembang async; tanpa menunggu, Vue Router meng-apply
// savedPosition sebelum kontennya ada -> browser clamp ke atas. rAF poll, capped.
const waitForScrollHeight = (minHeight: number, timeout = 1200) =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    const start = Date.now();
    const check = () => {
      if (
        document.documentElement.scrollHeight >= minHeight ||
        Date.now() - start > timeout
      ) {
        resolve();
      } else {
        // setTimeout, bukan rAF: rAF di-throttle saat tab tidak fokus/visible.
        setTimeout(check, 16);
      }
    };
    check();
  });

export default <RouterConfig>{
  async scrollBehavior(to, from, savedPosition) {
    const stripLocale = (name: unknown) =>
      typeof name === "string" ? name.split("___")[0] : "";

    // Pertahankan scroll hanya saat berpindah dalam "halaman" yang sama: route
    // name sama, path beda, TAPI dynamic params identik (mis. tab/view-switch
    // yang mengubah path tanpa mengubah param). Navigasi antar dynamic param
    // (mis. /brands/[slug-a] -> /brands/[slug-b], klik related brand) adalah
    // konten yang berbeda dan HARUS reset ke atas, jadi sengaja TIDAK kena blok
    // ini -> jatuh ke savedPosition (back/forward) atau { top: 0 }.
    if (
      to.name &&
      from.name &&
      stripLocale(to.name) === stripLocale(from.name) &&
      to.path !== from.path &&
      JSON.stringify(to.params) === JSON.stringify(from.params)
    ) {
      return false;
    }

    if (savedPosition) {
      await waitForScrollHeight(
        savedPosition.top + (typeof window !== "undefined" ? window.innerHeight : 0),
      );
      return savedPosition;
    }
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
};
