<template>
  <section id="icgp-rules" class="container">
    <div class="flex flex-col items-center text-center">
      <h2 class="section-title">{{ $t("icgp.rulesTitle") }}</h2>
      <p class="section-description mx-auto mt-3">
        {{ $t("icgp.rulesDescription") }}
      </p>
    </div>

    <div class="mx-auto mt-6 w-full max-w-screen-md lg:mt-10">
      <Accordion type="single" collapsible>
        <AccordionItem
          v-for="(item, i) in rules"
          :key="i"
          :value="`rule-${i}`"
        >
          <AccordionTrigger>
            <span
              class="text-lg font-medium tracking-tighter text-balance sm:text-xl"
              >{{ rt(item.title) }}</span
            >
          </AccordionTrigger>
          <AccordionContent>
            <ul class="flex list-disc flex-col gap-y-2 pl-5">
              <li
                v-for="(point, j) in item.points"
                :key="j"
                class="tracking-tight"
              >
                {{ rt(point) }}
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div class="mt-6 flex justify-center">
        <Button to="https://pmone.id/icgp-rules2027" variant="outline">
          <Icon name="hugeicons:download-01" class="size-4 shrink-0" />
          {{ $t("icgp.downloadRules") }}
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup>
// Isi aturan lengkap dari i18n (EN + ID). Sumber: pmone.id/icgp-rules2027 (PDF).
const { tm, rt, locale } = useI18n();
const rules = computed(() => {
  void locale.value; // re-evaluate saat bahasa berganti
  return tm("icgp.rulesSections");
});
</script>
