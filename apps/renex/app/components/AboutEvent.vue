<template>
  <div
    class="space-y-16 overflow-hidden lg:space-y-24"
    :class="{
      'pt-6': ['ticket'].includes(route.name),
    }"
  >
    <div class="container-wider flex flex-col items-center">
      <SplitText3D tag="h2" origin="center">
        <TextFit
          tag="span"
          text="Designing for"
          text-classes="text-outline !leading-[1.1] font-extrabold tracking-tighter"
        />

        <TextFit
          tag="span"
          text="Inspired Living"
          text-classes="text-transparent gradient-gold bg-clip-text pb-5 !leading-[1.1] font-extrabold tracking-tighter text-right"
        />
      </SplitText3D>

      <NuxtImg
        src="/img/about-img-1.png"
        alt=""
        class="pointer-events-none mt-6 w-full max-w-4xl select-none lg:mt-10"
        width="1600"
        height="1358"
        sizes="100vw lg:1000px"
        loading="lazy"
        format="webp"
      />
    </div>

    <MainPrograms />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
