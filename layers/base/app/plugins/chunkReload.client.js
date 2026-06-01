export default defineNuxtPlugin((nuxtApp) => {
  const KEY = "__chunk_reload";
  const MAX = 2; // batas reload sebelum menyerah ke error.vue
  const WINDOW = 10_000; // ms; reset counter kalau sudah lewat window ini

  const isChunkError = (msg) =>
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk \S+ failed|Loading CSS chunk/i.test(
      String(msg ?? ""),
    );

  const reload = () => {
    let state = { n: 0, t: 0 };
    try {
      state = JSON.parse(sessionStorage.getItem(KEY)) || state;
    } catch {}
    const now = Date.now();
    if (now - state.t > WINDOW) state = { n: 0, t: now }; // reset window basi
    if (state.n >= MAX) return; // menyerah -> biar error.vue render (noindex)
    state.n += 1;
    state.t = now;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
    window.location.reload();
  };

  // 1. Vite preload error (__vitePreload)
  window.addEventListener("vite:preloadError", (e) => {
    e.preventDefault();
    reload();
  });

  // 2. Native dynamic import() reject saat hydration/navigasi
  window.addEventListener("unhandledrejection", (e) => {
    if (isChunkError(e?.reason?.message ?? e?.reason)) {
      e.preventDefault();
      reload();
    }
  });

  // 3. Module/CSS script gagal load (error event)
  window.addEventListener("error", (e) => {
    if (isChunkError(e?.message)) reload();
  });

  // Reset counter setelah navigasi sukses (recovery sah, bukan loop)
  nuxtApp.hook("page:finish", () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  });
});
