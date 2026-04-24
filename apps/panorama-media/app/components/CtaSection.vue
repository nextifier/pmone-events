<template>
  <section class="container">
    <div class="mx-auto flex max-w-2xl flex-col items-center text-center">
      <h2 class="section-title">Ready to create something?</h2>
      <p class="section-description mt-4">
        Expo booth, sponsorship, corporate event, or something else entirely.
        Tell us what you're thinking.
      </p>

      <div
        class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <NuxtLink
          to="/contact"
          class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-x-2 rounded-xl px-6 py-3 font-medium tracking-tight transition active:scale-95"
        >
          <span>Start a conversation</span>
          <Icon name="hugeicons:arrow-right-01" class="size-4" />
        </NuxtLink>

        <NuxtLink
          to="/brands"
          class="text-muted-foreground hover:text-primary inline-flex items-center gap-x-2 px-6 py-3 font-medium tracking-tight transition"
        >
          <span>See what we do</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
