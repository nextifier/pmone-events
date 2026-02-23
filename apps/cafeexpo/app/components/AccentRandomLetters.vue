<template>
  <span ref="rootRef">
    <slot />
  </span>
</template>

<script setup>
const rootRef = ref(null);

// Definisikan warna aksen yang akan digunakan
const accentColors = [
  "text-accent-brown",
  "text-accent-green",
  "text-accent-purple",
  "text-accent-red",
];

const applyRandomAccents = () => {
  if (!rootRef.value) return;

  // 1. Temukan semua node teks di dalam slot
  const textNodes = [];
  const walk = document.createTreeWalker(rootRef.value, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walk.nextNode())) {
    // Abaikan node teks yang hanya berisi spasi
    if (node.nodeValue.trim().length > 0) {
      textNodes.push(node);
    }
  }

  if (textNodes.length === 0) return;

  // 2. Kumpulkan semua indeks karakter yang valid (hanya huruf dan angka)
  let totalLength = 0;
  const availableIndices = [];
  textNodes.forEach((node) => {
    for (let i = 0; i < node.nodeValue.length; i++) {
      // PERUBAHAN: Gunakan regex untuk mencocokkan hanya huruf (a-z, A-Z) dan angka (0-9)
      if (/[a-zA-Z0-9]/.test(node.nodeValue[i])) {
        availableIndices.push(totalLength + i);
      }
    }
    totalLength += node.nodeValue.length;
  });

  // 3. Pilih beberapa indeks acak yang unik dari daftar yang tersedia
  const chosenIndices = new Set();
  const numToPick = Math.min(accentColors.length, availableIndices.length);
  while (chosenIndices.size < numToPick) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    chosenIndices.add(availableIndices[randomIndex]);
  }

  // 4. Ganti node teks dengan HTML baru yang berisi span berwarna
  let currentIndex = 0;
  const colorsToApply = [...accentColors]; // Buat salinan agar bisa di-pop

  textNodes.forEach((node) => {
    const parent = node.parentNode;
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const globalIndex = currentIndex + i;
      if (chosenIndices.has(globalIndex)) {
        if (i > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, i)),
          );
        }

        const span = document.createElement("span");
        span.className = colorsToApply.pop() || ""; // Ambil dan hapus warna
        span.textContent = text[i];
        fragment.appendChild(span);

        lastIndex = i + 1;
      }
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    if (fragment.childNodes.length > 0) {
      parent.replaceChild(fragment, node);
    }

    currentIndex += text.length;
  });
};

onMounted(() => {
  // Gunakan sedikit delay untuk memastikan komponen anak (seperti SplitText)
  // telah selesai memanipulasi DOM-nya sendiri.
  setTimeout(applyRandomAccents, 100);
});
</script>
