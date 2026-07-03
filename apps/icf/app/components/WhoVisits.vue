<template>
  <section id="who-visits">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="section-subtitle mb-3 uppercase">{{
          $t("whoVisits.subtitle")
        }}</span>
        <h2 class="section-title">
          {{ $t("whoVisits.title") }}
        </h2>

        <p
          class="text-foreground/80 mx-auto mt-3 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
        >
          {{ $t("whoVisits.description") }}
        </p>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-4 text-left lg:mt-10 lg:grid-cols-2">
        <div
          v-for="group in groups"
          :key="group.itemsKey"
          class="border-border flex flex-col rounded-2xl border p-6 lg:p-8"
        >
          <span
            class="bg-muted flex size-12 items-center justify-center rounded-3xl"
          >
            <Icon :name="group.icon" class="text-accent size-6" />
          </span>

          <h3
            class="text-foreground mt-4 text-2xl font-semibold tracking-tighter"
          >
            {{ group.title }}
          </h3>

          <ul class="mt-5 space-y-2.5">
            <li
              v-for="(item, i) in tm(group.itemsKey)"
              :key="i"
              class="flex items-start gap-2.5 tracking-tight"
            >
              <Icon
                name="hugeicons:checkmark-circle-02"
                class="text-accent mt-0.5 size-5 shrink-0"
              />
              <span>{{ rt(item) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t, tm, rt } = useI18n();

const groups = computed(() => [
  {
    icon: "hugeicons:building-06",
    title: t("whoVisits.b2bTitle"),
    itemsKey: "whoVisits.b2bItems",
  },
  {
    icon: "hugeicons:user-group",
    title: t("whoVisits.b2cTitle"),
    itemsKey: "whoVisits.b2cItems",
  },
]);
</script>
