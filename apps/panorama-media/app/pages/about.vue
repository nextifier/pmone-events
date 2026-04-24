<template>
  <div class="space-y-16 lg:space-y-24">
    <AboutHero />

    <div class="container-wider">
      <div
        class="bg-border *:bg-background grid grid-cols-1 gap-px p-px *:relative *:px-4 *:py-8 sm:*:px-6 sm:*:py-12 lg:grid-cols-2 xl:*:px-8 xl:*:py-16"
      >
        <section id="our-story" class="flex flex-col">
          <Cross position="top-left" />

          <h2 class="text-primary tracking-tighter">Our Story</h2>
          <span
            class="text-primary mt-2 text-4xl !leading-[1.2] font-bold tracking-tighter text-balance sm:text-5xl"
            >Started with one event. Now we run dozens.</span
          >
          <div
            class="text-primary/70 format-html space-y-4 text-xl font-medium tracking-tighter sm:text-2xl"
          >
            <p>
              We started in the early 2000s. Back when "event organizer" in
              Indonesia meant weddings and birthday parties. We had a different
              idea.
            </p>

            <p>
              Trade exhibitions. Music concerts. Corporate gatherings. Pop
              culture conventions. We built them one by one. Some worked. Some
              didn't. We learned.
            </p>

            <p>
              Now we run Indonesia's largest building expo. The country's
              biggest pop culture convention. Franchise expos that launch
              thousands of businesses. Concerts that sell out in hours.
            </p>

            <p>
              Different events. Same principle: create moments people remember.
            </p>
          </div>
        </section>

        <section id="our-philosophy" class="flex flex-col">
          <Cross position="top-right" />
          <Cross position="bottom-left" />

          <h2 class="text-primary tracking-tighter">Our Philosophy</h2>
          <span
            class="text-primary mt-2 text-4xl !leading-[1.2] font-bold tracking-tighter text-balance sm:text-5xl"
            >Events are our language. Connections are our purpose.</span
          >
          <div
            class="text-primary/70 format-html space-y-4 text-xl font-medium tracking-tighter sm:text-2xl"
          >
            <p>
              Every event has the potential to be a special moment. An
              exhibition where visitors gain new insights. A festival where
              friends gather. A corporate gathering that brings teams closer.
            </p>

            <p>
              We believe great events aren't the grandest ones. They're the ones
              that send people home smiling.
            </p>

            <span>What guides us:</span>
            <ul>
              <li>
                Understand first, design second. Every client, every audience,
                every industry has different needs. We listen before we plan.
              </li>
              <li>
                Details matter. The signage placement. The break timing. The
                lighting at 3PM. Small things create big experiences.
              </li>
              <li>
                Relationships over transactions. Some of our clients have been
                with us for 15+ years. That says more than any award.
              </li>
              <li>
                Keep evolving. What worked five years ago might not work today.
                We test. We adapt. We stay curious.
              </li>
            </ul>
          </div>
        </section>

        <section id="vision" class="flex flex-col">
          <Cross position="top-left" />

          <h2 class="text-primary tracking-tighter">Vision</h2>

          <div
            class="text-primary/70 mt-4 space-y-4 text-xl font-medium tracking-tighter sm:text-2xl"
          >
            <p>
              To be Indonesia's most trusted event company. Known for events
              that deliver results, build communities, and leave lasting
              impressions.
            </p>
          </div>
        </section>

        <section id="mission" class="flex flex-col">
          <Cross position="bottom-right" />

          <h2 class="text-primary tracking-tighter">Mission</h2>

          <div
            class="text-primary/70 mt-4 space-y-4 text-xl font-medium tracking-tighter sm:text-2xl"
          >
            <p>
              Create events where industries connect, communities thrive, and
              businesses grow. Do it responsibly. Do it consistently. Do it
              better each time.
            </p>
          </div>
        </section>

        <section id="values" class="flex flex-col">
          <Cross position="top-left" />

          <h2 class="text-primary tracking-tighter">Values</h2>

          <div
            class="text-primary/70 mt-4 space-y-4 text-xl font-medium tracking-tighter sm:text-2xl"
          >
            <p>
              Six values that guide how we work. We call it SPIRIT.
            </p>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-y-6">
            <div
              v-for="(item, index) in values"
              :key="index"
              class="flex items-start gap-x-4"
            >
              <span
                class="border-border flex size-10 shrink-0 items-center justify-center rounded-lg border"
              >
                <Icon
                  v-if="item.iconName"
                  :name="item.iconName"
                  class="text-primary size-6"
                />
              </span>

              <div class="flex flex-col items-start gap-y-0.5">
                <span
                  class="text-primary text-base font-semibold tracking-tighter text-balance sm:text-lg"
                  >{{ item.title }}</span
                >
                <span class="text-primary/70 tracking-tighter text-balance">{{
                  item.description
                }}</span>
              </div>
            </div>
          </div>

          <div class="mt-12 flex flex-col items-start">
            <span
              class="text-primary text-base font-semibold tracking-tighter sm:text-lg"
              >We embrace
              <span class="text-green-600 uppercase dark:text-green-500"
                >Green Initiatives</span
              ></span
            >

            <div class="mt-4 flex flex-col gap-y-4">
              <div class="flex gap-x-3">
                <Icon
                  name="hugeicons:leaf-03"
                  class="size-6 shrink-0 text-green-600 dark:text-green-500"
                />
                <p class="text-primary/70 text-sm tracking-tight">
                  Prioritize eco-friendly venues. Source locally when possible.
                  Minimize waste at every event.
                </p>
              </div>

              <div class="flex gap-x-3">
                <Icon
                  name="hugeicons:agreement-01"
                  class="size-6 shrink-0 text-green-600 dark:text-green-500"
                />
                <p class="text-primary/70 text-sm tracking-tight">
                  Partner with sustainable suppliers. Promote green practices
                  across our exhibitions and events.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="service-soul" class="flex flex-col">
          <Cross position="bottom-right" />

          <h2 class="text-primary tracking-tighter">Service Soul</h2>

          <div
            class="text-primary/70 mt-4 space-y-4 text-xl font-medium tracking-tighter sm:text-2xl"
          >
            <p>
              Events are service businesses. How we treat people matters as much
              as what we deliver.
            </p>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-y-6">
            <div
              v-for="(item, index) in serviceSoul"
              :key="index"
              class="flex items-start gap-x-4"
            >
              <span
                class="border-border flex size-10 shrink-0 items-center justify-center rounded-lg border"
              >
                <Icon
                  v-if="item.iconName"
                  :name="item.iconName"
                  class="text-primary size-6"
                />
              </span>

              <div class="flex flex-col items-start gap-y-0.5">
                <span
                  class="text-primary text-base font-semibold tracking-tighter text-balance sm:text-lg"
                  >{{ item.title }}</span
                >
                <span class="text-primary/70 tracking-tighter text-balance">{{
                  item.description
                }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- <WhyChooseUs /> -->
  </div>
</template>

<script setup>
usePageMeta("about");

const values = [
  {
    title: "Synergy",
    description:
      "Different strengths, combined results. Our teams collaborate. Our brands support each other.",
    iconName: "hugeicons:installing-updates-02",
  },
  {
    title: "Pursuit of Excellence",
    description:
      "Good enough isn't. We push for better. Every event, every time.",
    iconName: "hugeicons:star-circle",
  },
  {
    title: "Integrity",
    description:
      "Say what we mean. Do what we say. No shortcuts on ethics.",
    iconName: "hugeicons:ungroup-layers",
  },
  {
    title: "Reliability",
    description:
      "We deliver. On time. On budget. As promised. Consistently.",
    iconName: "hugeicons:security-validation",
  },
  {
    title: "Innovative & Proactive",
    description:
      "Test new formats. Try new tech. Don't wait for problems to find solutions.",
    iconName: "hugeicons:ai-idea",
  },
  {
    title: "Truly Care",
    description:
      "About our clients. About attendees. About the impact we create.",
    iconName: "hugeicons:favourite-circle",
  },
];

const serviceSoul = [
  {
    title: "Reliability",
    description: "Deliver what we promised. No excuses.",
    iconName: "hugeicons:security-check",
  },
  {
    title: "Convenience",
    description: "Make it easy. Remove friction wherever possible.",
    iconName: "hugeicons:thumbs-up",
  },
  {
    title: "Comfort",
    description: "People should feel taken care of. Not stressed.",
    iconName: "hugeicons:wedding",
  },
  {
    title: "Fair Value",
    description: "Honest pricing. Real benefits. No hidden fees.",
    iconName: "hugeicons:discount-tag-02",
  },
  {
    title: "Unique Experience",
    description: "Memorable moments. Not cookie-cutter events.",
    iconName: "hugeicons:ski-dice-faces-01",
  },
  {
    title: "Flexible Solutions",
    description: "Plans change. Budgets shift. We adapt.",
    iconName: "hugeicons:sine-02",
  },
  {
    title: "Recognition",
    description: "Remember names. Acknowledge loyalty. Say thank you.",
    iconName: "hugeicons:hand-prayer",
  },
];
</script>
