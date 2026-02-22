<template>
  <div class="relative isolate size-full min-h-64 grow lg:min-h-[450px]">
    <div
      ref="containerRef"
      class="relative z-0 grid size-full grid-cols-12 gap-2 overflow-hidden perspective-dramatic perspective-origin-top"
    >
      <div
        v-for="(_, index) in 12"
        :key="index"
        :ref="(el) => (columns[index] = el)"
        class="column-container from-primary/5 relative h-full rotate-x-45 bg-linear-to-t to-transparent"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { gsap } from "gsap";

const containerRef = ref(null);
const columns = ref([]);

let ctx;

const colorOptions = [
  { class: "bg-linear-to-b from-cyan-400 to-cyan-600", solid: "#22d3ee" },
  { class: "bg-linear-to-b from-pink-400 to-pink-600", solid: "#ec4899" },
  { class: "bg-linear-to-b from-blue-400 to-blue-600", solid: "#3b82f6" },
];

const getRandom = (min, max) => Math.random() * (max - min) + min;

const createMovingBar = (columnEl) => {
  if (!columnEl || !containerRef.value) return;

  const bar = document.createElement("div");
  const randomHeight = getRandom(50, 250);
  const randomDuration = getRandom(10, 14);
  const randomColor =
    colorOptions[Math.floor(Math.random() * colorOptions.length)];

  bar.className = `absolute bottom-0 w-full cursor-pointer ${randomColor.class}`;
  bar.style.height = `${randomHeight}px`;

  columnEl.appendChild(bar);

  const mainTween = gsap.fromTo(
    bar,
    { y: containerRef.value.offsetHeight },
    {
      y: -containerRef.value.offsetHeight - randomHeight,
      duration: randomDuration,
      ease: "none",
      onComplete: () => {
        bar.remove();
        gsap.delayedCall(getRandom(0.5, 2), () => createMovingBar(columnEl));
      },
    },
  );

  bar.addEventListener("click", () => {
    mainTween.kill();

    gsap.to(bar, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        bar.remove();
        gsap.delayedCall(getRandom(0.5, 2), () => createMovingBar(columnEl));
      },
    });
  });
};

onMounted(() => {
  ctx = gsap.context(() => {
    columns.value.forEach((col) => {
      if (col) {
        gsap.delayedCall(getRandom(0, 2), () => createMovingBar(col));
      }
    });
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) {
    ctx.revert();
  }
});
</script>
