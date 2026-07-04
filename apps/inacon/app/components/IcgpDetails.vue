<template>
  <section id="icgp-about" class="container">
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div
        class="border-border flex flex-col items-start gap-2 rounded-2xl border px-4 py-6 sm:px-6 sm:py-8"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.whatIsIcgpTitle")
        }}</span>
        <p class="text-base tracking-tight sm:text-lg">
          {{ $t("icgp.whatIsIcgpText") }}
        </p>
      </div>

      <div
        class="border-border flex flex-col items-start gap-2 rounded-2xl border px-4 py-6 sm:px-6 sm:py-8"
      >
        <span class="font-semibold text-black uppercase dark:text-white">{{
          $t("icgp.whatIsWcsTitle")
        }}</span>
        <p class="text-base tracking-tight sm:text-lg">
          {{ $t("icgp.whatIsWcsText") }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup></script>
