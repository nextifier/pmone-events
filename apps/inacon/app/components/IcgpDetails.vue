<template>
  <section id="icgp-about" class="container">
    <div class="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
      <div
        class="flex flex-col items-start gap-2 rounded-2xl bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.whatIsIcgpTitle")
        }}</span>
        <p class="text-base tracking-tight sm:text-lg">
          {{ $t("icgp.whatIsIcgpText") }}
        </p>
      </div>

      <div
        class="flex flex-col items-start gap-2 rounded-2xl bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.whatIsWcsTitle")
        }}</span>
        <p class="text-base tracking-tight sm:text-lg">
          {{ $t("icgp.whatIsWcsText") }}
        </p>
      </div>
    </div>

    <p
      class="text-muted-foreground mt-4 flex items-start gap-x-2 text-base tracking-tight sm:text-lg"
    >
      <Icon
        name="hugeicons:information-circle"
        class="mt-0.5 size-5 shrink-0"
      />
      <span>{{ $t("icgp.formatNote") }}</span>
    </p>
  </section>
</template>

<script setup></script>
