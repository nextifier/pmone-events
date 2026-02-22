<template>
  <div ref="logo" class="flex" :class="isInitialized ? 'visible' : 'invisible'">
    <LogoMark id="logomark" class="h-full" />
    <div class="h-full [clip-path:inset(-100%_-100%_-100%_0)]">
      <LogoType id="logotype" class="text-primary h-full" />
    </div>
  </div>
</template>

<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const isInitialized = ref(false);
const logo = ref(null);
let ctx;

const initializeAnimation = async () => {
  if (typeof window === "undefined") return;
  await nextTick();

  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: logo.value,
        toggleActions: "play none none none",
        start: "top 80%",
        end: "+=500",
        once: true,
        // markers: true,
      },
      delay: 0.3,
    });

    tl.from("#logomark", {
      rotate: 360 * 1.5,
      duration: 1.5,
      ease: "power1.inOut",
    }).from(
      "#logotype",
      {
        xPercent: -100,
        duration: 1.5,
        autoAlpha: 0,
        ease: "power1.out",
      },
      "-=1",
    );

    isInitialized.value = true;
  }, logo.value);
};

onMounted(() => {
  initializeAnimation();
});

onUnmounted(() => {
  if (ctx) {
    ctx.revert();
  }
});
</script>
