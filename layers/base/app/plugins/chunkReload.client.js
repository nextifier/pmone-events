export default defineNuxtPlugin(() => {
  const RELOAD_KEY = "__chunk_reload_attempt";

  const reloadOnce = () => {
    if (sessionStorage.getItem(RELOAD_KEY)) return;
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
  };

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadOnce();
  });

  window.addEventListener("load", () => {
    sessionStorage.removeItem(RELOAD_KEY);
  });
});
