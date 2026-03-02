<template>
  <section id="about-mega-property">
    <div
      class="container-wider grid grid-cols-1 items-center gap-x-12 gap-y-8 lg:grid-cols-2"
    >
      <div class="-mx-4 lg:mx-0">
        <NuxtImg
          src="/img/mp-about-img.jpg"
          alt=""
          class="size-full object-cover"
          sizes="400px sm:800px"
          width="1080"
          height="1080"
          loading="lazy"
          format="webp"
        />
      </div>

      <div class="flex flex-col items-start">
        <span class="text-gradient-accent font-medium tracking-tight">{{
          $t("megaProperty.about.label")
        }}</span>
        <h2
          class="text-foreground mt-2.5 text-3xl font-semibold tracking-tighter"
        >
          {{ $t("megaProperty.about.title") }}
        </h2>

        <div
          class="text-body mt-6 space-y-4 text-base leading-normal! tracking-tight lg:text-xl"
        >
          <p v-html="$t('megaProperty.about.paragraph1')"></p>
          <p v-html="$t('megaProperty.about.paragraph2')"></p>
          <p v-html="$t('megaProperty.about.paragraph3')"></p>
          <p v-html="$t('megaProperty.about.paragraph4')"></p>
        </div>
      </div>
    </div>
  </section>
</template>
