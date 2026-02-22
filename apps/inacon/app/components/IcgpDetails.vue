<template>
  <section id="icgp-details" class="container">
    <div class="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
      <div
        class="flex flex-col items-start gap-2 rounded-2xl bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900"
      >
        <span class="font-semibold text-black uppercase dark:text-white"
          >Introduction</span
        >
        <p class="text-base tracking-tight sm:text-lg">
          The Indonesia Cosplay Grand Prix (ICGP) is the premier national
          cosplay competition, where talented cosplayers showcase their
          creativity and passion on stage. Each team, consisting of two members,
          will perform a cosplay act, judged on costume craftsmanship and stage
          performance, supported by background audio and video.
        </p>
      </div>

      <div
        class="flex flex-col items-start gap-2 rounded-2xl bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900"
      >
        <span class="font-semibold text-black uppercase dark:text-white"
          >Competition Details</span
        >
        <p class="text-base tracking-tight sm:text-lg">
          The ICGP will be held in multiple regions throughout Indonesia.
          Regional winners will advance to the ICGP Finals at Indonesia Anime
          Con in Jakarta. The champion team from the ICGP Finals will represent
          Indonesia at the World Cosplay Summit in Japan, the world’s largest
          cosplay event!
        </p>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-center gap-2">
      <DialogResponsive dialogMaxWidth="600px" :overflowContent="true">
        <template #trigger="{ open }">
          <button
            type="button"
            @click="open({ title: pageTitle })"
            class="hover:bg-opacity-80 dark:hover:bg-opacity-80 rounded-full bg-black p-4 font-semibold tracking-tight text-white transition active:scale-95 dark:bg-white dark:text-black"
            v-ripple
          >
            <span>Basic Rules for ICGP</span>
          </button>
        </template>

        <template #default="{ data }">
          <div class="px-4 pb-6 md:p-8">
            <div
              class="font-heading text-5xl leading-[0.9] tracking-tight text-balance text-black uppercase sm:text-6xl sm:leading-[0.9] dark:text-white"
            >
              Basic Rules for ICGP
            </div>

            <ol
              class="mt-6 flex list-outside list-decimal flex-col gap-y-2 pl-4"
            >
              <li class="space-y-1">
                <span
                  class="font-semibold tracking-tight text-black dark:text-white"
                  >Team Composition</span
                >
                <p class="tracking-tight">
                  Each team must consist of 2 Indonesian nationals, both at
                  least 18 years old.
                </p>
              </li>

              <li class="space-y-1">
                <span
                  class="font-semibold tracking-tight text-black dark:text-white"
                  >Costume Creation</span
                >
                <p class="tracking-tight">
                  Costumes must be made by both team members. Costumes created
                  by a single team member or by a third party are not allowed.
                  Participants must provide photographic documentation of the
                  costume-making process.
                </p>
              </li>

              <li class="space-y-1">
                <span
                  class="font-semibold tracking-tight text-black dark:text-white"
                  >Cosplay Character Origin</span
                >
                <p class="tracking-tight">
                  Both team members must wear costumes from the same source,
                  which must originate from Japanese manga, anime, video games,
                  or tokusatsu.
                </p>
              </li>

              <li class="space-y-1">
                <span
                  class="font-semibold tracking-tight text-black dark:text-white"
                  >Performance Duration</span
                >
                <p class="tracking-tight">
                  Each cosplay performance must not exceed 2 minutes and 30
                  seconds.
                </p>
              </li>

              <li class="space-y-1">
                <span
                  class="font-semibold tracking-tight text-black dark:text-white"
                  >Audio and Background Video (BGV)</span
                >
                <p class="tracking-tight">
                  Teams must use audio and BGV to enhance their stage
                  performance.
                </p>
              </li>

              <li class="space-y-1">
                <span
                  class="font-semibold tracking-tight text-black dark:text-white"
                  >Registration</span
                >
                <p class="tracking-tight">
                  All participants must register before the deadline for their
                  respective regional selection.
                </p>
              </li>
            </ol>
          </div>
        </template>
      </DialogResponsive>

      <nuxt-link
        to="https://drive.google.com/file/d/1F9w2RAGKXIsql-Jq9wAWVF2wvjuuManA/view?usp=sharing"
        target="_blank"
        class="flex items-center gap-x-1 rounded-full p-4 font-semibold tracking-tight text-black transition hover:bg-gray-100 active:scale-95 dark:text-white dark:hover:bg-gray-900"
      >
        <Icon name="hugeicons:download-03" class="size-5 shrink-0" />
        <span>Download Rules</span>
      </nuxt-link>
    </div>
  </section>
</template>

<script setup></script>
