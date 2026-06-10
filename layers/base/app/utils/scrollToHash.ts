/**
 * Scroll robust ke elemen target hash (mis. "#rundown"), lalu KOREKSI berulang
 * sampai posisinya stabil di offset (scroll-margin-top elemen, mis. tepat di
 * bawah navbar sticky).
 *
 * Kenapa serumit ini: di halaman dengan section lazy + gambar yang load/unload
 * per-viewport, tinggi dokumen berubah JUSTRU saat di-scroll -> sekali scroll
 * langsung meleset. Browser juga melakukan native fragment-scroll yang bisa
 * salah posisi untuk target yang jauh. Pendekatan relatif & iteratif
 * (scrollBy delta) ini meng-override native scroll dan self-correcting terhadap
 * perubahan tinggi. Berhenti saat elemen pas di offset DAN tinggi dokumen
 * berhenti berubah beberapa cek beruntun, atau timeout.
 *
 * Mengembalikan `true` bila elemen ditemukan & ditangani, `false` bila tidak.
 */
export const scrollHashIntoPlace = async (
  selector: string,
  behavior: ScrollBehavior = "auto",
  timeout = 5000,
): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  const query = () => {
    try {
      return document.querySelector(selector) as HTMLElement | null;
    } catch {
      return null;
    }
  };
  const offsetOf = (el: HTMLElement) =>
    parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const start = Date.now();
  // Section bisa dirender lewat `v-if` dari fetch yang baru jalan setelah mount,
  // jadi tunggu elemennya muncul dulu (capped).
  let el = query();
  while (!el && Date.now() - start < timeout) {
    await wait(32);
    el = query();
  }
  if (!el) return false;

  // Gerakan awal: smooth utk navigasi in-app, instan utk hard-load.
  window.scrollBy({ top: el.getBoundingClientRect().top - offsetOf(el), behavior });
  await wait(behavior === "smooth" ? 420 : 80);

  // Loop koreksi instan sampai posisi tepat DAN tinggi dokumen berhenti berubah.
  // Gate `scrollHeight` penting: tinggi bisa sempat lebih kecil saat masih load
  // (target kebetulan pas di offset) lalu tumbuh lagi -> kalau exit cuma karena
  // delta kecil, target keburu drift. Exit hanya saat delta kecil sambil tinggi
  // stabil beberapa cek beruntun.
  let goodStreak = 0;
  let lastHeight = -1;
  while (Date.now() - start < timeout) {
    el = query();
    if (!el) return true;
    const height = document.documentElement.scrollHeight;
    const delta = el.getBoundingClientRect().top - offsetOf(el);
    if (Math.abs(delta) > 1) {
      window.scrollBy({ top: delta, behavior: "auto" });
      goodStreak = 0;
    } else if (height === lastHeight) {
      if (++goodStreak >= 3) return true;
    } else {
      goodStreak = 0;
    }
    lastHeight = height;
    await wait(70);
  }
  return true;
};
