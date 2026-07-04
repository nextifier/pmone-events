<template>
  <section id="icgp-requirements" class="container">
    <div class="flex flex-col items-center text-center">
      <h2 class="section-title">{{ $t("icgp.reqTitle") }}</h2>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:mt-10">
      <div
        class="border-border flex flex-col gap-3 rounded-2xl border px-4 py-6 sm:px-6 sm:py-8"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.reqEligibilityTitle")
        }}</span>
        <ul class="flex flex-col gap-2.5">
          <li v-for="i in 4" :key="i" class="flex items-center gap-x-2">
            <Icon
              name="hugeicons:checkmark-circle-02"
              class="text-muted-foreground size-5 shrink-0"
            />
            <span class="text-base tracking-tight sm:text-lg">{{
              $t(`icgp.reqEligibility.${i - 1}`)
            }}</span>
          </li>
        </ul>
      </div>

      <div
        class="border-border flex flex-col gap-3 rounded-2xl border px-4 py-6 sm:px-6 sm:py-8"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.reqChecklistTitle")
        }}</span>
        <ul class="flex flex-col gap-2.5">
          <li v-for="i in 5" :key="i" class="flex items-center gap-x-2">
            <Icon
              name="hugeicons:checkmark-circle-02"
              class="text-muted-foreground size-5 shrink-0"
            />
            <span class="text-base tracking-tight sm:text-lg">{{
              $t(`icgp.reqChecklist.${i - 1}`)
            }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-6 flex justify-center">
      <Button to="https://pmone.id/icc-icgp2027" size="lg">
        {{ $t("icgp.reqCta") }}
        <Icon name="hugeicons:arrow-right-01" class="size-4 shrink-0" />
      </Button>
    </div>
  </section>
</template>

<script setup></script>
