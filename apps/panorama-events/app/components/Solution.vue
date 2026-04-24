<template>
  <section>
    <div class="sm:container">
      <div
        class="grid grid-cols-1 items-center gap-x-10 gap-y-8 lg:grid-cols-2"
      >
        <div class="aspect-square overflow-hidden">
          <NuxtImg
            src="/img/team-outing.jpg"
            alt=""
            class="bg-muted pointer-events-none size-full object-cover select-none"
            width="800"
            height="800"
            sizes="100vw lg:800px"
            format="webp"
            loading="lazy"
          />
        </div>

        <div class="flex flex-col px-4 sm:px-0 lg:order-first">
          <h2 class="section-title">
            We Handle the Details,
            <span class="text-gradient-accent">You Enjoy the Journey</span>
          </h2>
          <p class="section-description mt-2">
            Your Dream Outing, Minus the Planning Headache.
          </p>

          <div
            class="text-primary/50 mt-6 space-y-4 text-2xl font-medium tracking-tighter sm:mt-8 sm:text-3xl"
          >
            <p>
              Picture this:
              <span class="text-primary font-semibold"
                >An epic corporate outing that everyone loves, and you didn't
                have to lift a finger for the stressful parts.</span
              >
            </p>

            <p>Sounds good, right?</p>

            <p>
              From the first brainstorm to the final applause, our team expertly
              manages every single detail.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>
