<template>
  <section id="about" class="bg-muted/50 py-10">
    <div class="container">
      <div
        class="grid grid-cols-1 items-center gap-x-12 gap-y-8 lg:grid-cols-2"
      >
        <NuxtImg
          src="/img/iicc-9-poster.jpg"
          alt="About IICC"
          class="bg-muted outline-inside size-full rounded-xl object-cover"
          width="1080"
          height="1350"
          loading="lazy"
          format="webp"
          sizes="400px sm:800px"
        />

        <div class="flex flex-col items-start">
          <span
            class="border-primary rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
            >{{ $t("about.badge") }}</span
          >
          <h2 class="section-title mt-2">
            {{ $t("about.title") }}
            <span class="text-gradient-accent">{{
              $t("about.titleAccent")
            }}</span>
          </h2>

          <div class="mt-6 space-y-4">
            <p class="section-description">
              {{ $t("about.paragraph1") }}
            </p>
            <p class="section-description">
              {{ $t("about.paragraph2") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>
