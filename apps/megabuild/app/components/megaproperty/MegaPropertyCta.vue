<template>
  <section id="mega-property-cta">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <h2
          class="text-foreground text-4xl font-semibold tracking-tighter text-balance lg:text-6xl"
        >
          {{ $t("megaProperty.cta.title") }}
        </h2>

        <p class="mt-3 max-w-xl tracking-tight text-balance lg:text-lg">
          {{ $t("megaProperty.cta.description") }}
        </p>

        <NuxtLink
          to="/book-space"
          class="bg-primary text-primary-foreground hover:bg-primary/80 mt-6 flex items-center gap-x-1 rounded-lg px-5 py-3 font-medium tracking-tight transition active:scale-98"
        >
          {{ $t("megaProperty.cta.button") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
