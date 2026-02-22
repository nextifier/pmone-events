<template>
  <div ref="containerRef" class="flex h-full items-center justify-center">
    <div
      ref="panelsRef"
      class="invisible relative z-10 flex w-full flex-col -space-y-24 *:odd:rotate-6 *:even:-rotate-6"
    >
      <NuxtImg
        src="/img/kv/kv-panel-1.png"
        alt=""
        class="hero-panel pointer-events-none relative z-10 w-full select-none transition-[filter] duration-700"
        width="1080"
        height="450"
        size="400px sm:800px"
        format="webp"
      />
      <NuxtImg
        src="/img/kv/kv-panel-2.png"
        alt=""
        class="hero-panel pointer-events-none relative z-10 w-full select-none transition-[filter] duration-700"
        width="1083"
        height="630"
        size="400px sm:800px"
        format="webp"
      />
      <NuxtImg
        src="/img/kv/kv-panel-3.png"
        alt=""
        class="hero-panel pointer-events-none relative z-10 w-full select-none transition-[filter] duration-700"
        width="1084"
        height="816"
        size="400px sm:800px"
        format="webp"
      />
      <NuxtImg
        src="/img/kv/kv-panel-4.png"
        alt=""
        class="hero-panel pointer-events-none relative z-10 w-full select-none transition-[filter] duration-700"
        width="1084"
        height="852"
        size="400px sm:800px"
        format="webp"
      />
    </div>

    <div
      class="hero-mascot invisible pointer-events-none absolute top-1/2 left-1/2 z-20 w-full -translate-x-1/2 -translate-y-1/2 select-none"
    >
      <NuxtImg
        src="/img/mascots/mascot-icc-captain-1.svg"
        alt=""
        class="hero-mascot-img w-full scale-[150%] transition-[filter] duration-700 md:scale-100 xl:scale-[160%] 2xl:scale-170"
        width="4000"
        height="4000"
      />
    </div>
  </div>
</template>

<script setup>
const containerRef = ref(null);
const panelsRef = ref(null);
const mascotRef = ref(null);

onMounted(() => {
  const { $gsap: gsap } = useNuxtApp();

  const ctx = gsap.context(() => {
    const panels = gsap.utils.toArray(".hero-panel");
    const mascotEl = containerRef.value?.querySelector(".hero-mascot");

    // Set initial states
    gsap.set(panels, {
      opacity: 0,
      y: 80,
      scale: 0.8,
    });

    if (mascotEl) {
      gsap.set(mascotEl, {
        scale: 0,
      });
    }

    // Remove invisible class now that GSAP initial states are set
    panelsRef.value?.classList.remove("invisible");
    mascotEl?.classList.remove("invisible");

    // Entrance timeline
    const tl = gsap.timeline({
      defaults: {
        ease: "back.out(1.4)",
      },
    });

    // Panels fly in with stagger
    tl.to(panels, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: {
        each: 0.15,
        from: "start",
      },
    });

    // Mascot entrance with bounce
    if (mascotEl) {
      tl.to(
        mascotEl,
        {
          scale: 1,
          duration: 1.2,
          ease: "back.out(1)",
        },
        "-=0.4",
      );
    }

    // Add drop-shadow classes after entrance animations complete
    tl.call(() => {
      const shadowClass = "dark:drop-shadow-[0px_0px_10px_rgba(0,0,0,0.8)]";
      panels.forEach((panel) => panel.classList.add(shadowClass));
      const mascotImg = mascotEl?.querySelector(".hero-mascot-img");
      mascotImg?.classList.add("dark:drop-shadow-[0px_0px_40px_rgba(0,0,0,0.4)]");
    });

    // Subtle hover animation for panels
    panels.forEach((panel, i) => {
      gsap.to(panel, {
        y: i % 2 === 0 ? -6 : 6,
        duration: 3 + i * 0.3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2 + i * 0.2,
      });
    });
  }, containerRef.value);

  onUnmounted(() => {
    ctx.revert();
  });
});
</script>
