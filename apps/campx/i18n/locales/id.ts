/**
 * campx-only Indonesian strings.
 *
 * `layers/base/i18n/locales/id.ts` is loaded first and already covers 300 keys,
 * so this file carries only what it does not: a handful of `ui.*` labels and
 * the blog listing copy.
 *
 * `nav.*` keys are deliberately absent. HeaderNav, HeaderMenu and Footer all do
 * `te(key) ? t(key) : label`, so a nav label that has no translation renders as
 * written. campx's nav labels in `app.config.ts` are already Indonesian, so
 * translating them would just be the same string twice.
 *
 * Never put a literal "|" in a message. vue-i18n reads it as a plural separator
 * and silently truncates everything after it.
 */
export default {
  ui: {
    toggleSidebar: "Buka atau tutup sidebar",
    openMenu: "Buka menu",
    toggleFullscreen: "Layar penuh",
    switchLanguage: "Ganti bahasa",
    allRightsReserved: "Semua hak dilindungi.",
    searchPosts: "Cari artikel",
    created: "Dibuat",
    views: "{n} kali dilihat",
  },
  news: {
    showingPostsFor: "Menampilkan {total} artikel untuk",
    showingPosts: "Menampilkan {total} artikel",
    noResultsFor: "Tidak ada hasil untuk",
    noResultsHint:
      "Coba kata kunci lain, atau lihat topik yang lain. Pasti ada yang menarik.",
    noPostsYet: "Belum ada artikel",
    comeBackLater: "Mampir lagi nanti, ya",
  },
};
