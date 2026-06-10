import { scrollHashIntoPlace } from "../utils/scrollToHash";

// Scroll-ke-hash ditangani di sini, BUKAN di scrollBehavior router, karena pada
// HARD-LOAD awal Nuxt tidak menjalankan scrollBehavior untuk hash -> browser
// memakai native fragment-scroll yang meleset di section yang jauh + lazy (tidak
// mengoreksi saat tinggi dokumen berubah). Plugin ini jalan setelah mount
// (initial load) dan tiap navigasi SPA berikutnya, memakai settle-loop yang
// tahan terhadap perubahan tinggi. scrollBehavior sengaja `return false` untuk
// hash supaya tidak ada scroll ganda.
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  // Initial hard-load: koreksi setelah DOM ter-mount (override native scroll).
  nuxtApp.hook("app:mounted", () => {
    const { hash } = router.currentRoute.value;
    if (hash) scrollHashIntoPlace(hash, "auto");
  });

  // Navigasi SPA berikutnya. `from.name` terisi -> bukan render awal (yang sudah
  // ditangani app:mounted), jadi tidak dobel.
  router.afterEach((to, from) => {
    if (to.hash && from.name) scrollHashIntoPlace(to.hash, "smooth");
  });
});
