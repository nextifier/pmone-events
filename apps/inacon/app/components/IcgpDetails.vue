<template>
  <section id="icgp-details" class="container">
    <div class="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
      <div
        class="flex flex-col items-start gap-2 rounded-2xl bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.introduction")
        }}</span>
        <p class="text-base tracking-tight sm:text-lg">
          {{ $t("icgp.introductionText") }}
        </p>
      </div>

      <div
        class="flex flex-col items-start gap-2 rounded-2xl bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.competitionDetails")
        }}</span>
        <p class="text-base tracking-tight sm:text-lg">
          {{ $t("icgp.competitionDetailsText") }}
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
            <span>{{ $t("icgp.basicRules") }}</span>
          </button>
        </template>

        <template #default="{ data }">
          <div class="px-4 pb-6 md:p-8">
            <div
              class="font-heading text-5xl leading-[0.9] tracking-tight text-balance text-black uppercase sm:text-6xl sm:leading-[0.9] dark:text-white"
            >
              {{ $t("icgp.basicRules") }}
            </div>

            <ol
              class="mt-6 flex list-outside list-decimal flex-col gap-y-2 pl-4"
            >
              <li v-for="i in 6" :key="i" class="space-y-1">
                <span
                  class="font-semibold tracking-tight text-black dark:text-white"
                  >{{ $t(`icgp.rules.${i - 1}.title`) }}</span
                >
                <p class="tracking-tight">
                  {{ $t(`icgp.rules.${i - 1}.description`) }}
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
        <span>{{ $t("icgp.downloadRules") }}</span>
      </nuxt-link>
    </div>
  </section>
</template>

<script setup></script>
